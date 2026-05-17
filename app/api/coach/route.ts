import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import type { FlightParameters } from '@/lib/physics';
import type { FlightResult, MissionId } from '@/lib/scoring';
import type { CoachInput } from '@/lib/coach';
import { buildCoachPrompt, generateLocalCoachFeedback } from '@/lib/coach';

type CoachRequestBody = Partial<Omit<CoachInput, 'parameters' | 'mission' | 'result'>> & {
  mission?: MissionId;
  parameters?: Partial<FlightParameters>;
  result?: FlightResult;
};

const DEFAULT_PARAMETERS: FlightParameters = {
  wingArea: 150,
  cogPosition: -0.2,
  hasWinglets: false,
  dihedralAngle: 10,
  thrust: 5,
  throwAngle: 15,
};

function normalizeCoachInput(body: CoachRequestBody): CoachInput {
  const parameters = body.parameters ?? {};

  return {
    mission: body.mission ?? body.result?.mission ?? 'distance',
    parameters: {
      wingArea: parameters.wingArea ?? DEFAULT_PARAMETERS.wingArea,
      cogPosition: parameters.cogPosition ?? DEFAULT_PARAMETERS.cogPosition,
      hasWinglets: parameters.hasWinglets ?? DEFAULT_PARAMETERS.hasWinglets,
      dihedralAngle: parameters.dihedralAngle ?? DEFAULT_PARAMETERS.dihedralAngle,
      thrust: parameters.thrust ?? DEFAULT_PARAMETERS.thrust,
      throwAngle: parameters.throwAngle ?? DEFAULT_PARAMETERS.throwAngle,
    },
    result: body.result,
    distance: body.distance,
    time: body.time,
    stability: body.stability,
    landingImpact: body.landingImpact,
    targetError: body.targetError,
    hasCrashed: body.hasCrashed,
  };
}

export async function POST(req: NextRequest) {
  let input: CoachInput | null = null;

  try {
    const body = (await req.json()) as CoachRequestBody;
    input = normalizeCoachInput(body);
    const fallback = generateLocalCoachFeedback(input);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ feedback: fallback });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: buildCoachPrompt(input),
    });
    const feedback = response.text?.trim();

    return NextResponse.json({ feedback: feedback || fallback });
  } catch (error) {
    console.error('Gemini coach fallback used:', error);
    return NextResponse.json({
      feedback: generateLocalCoachFeedback(input ?? {
        mission: 'distance',
        parameters: DEFAULT_PARAMETERS,
      }),
    });
  }
}
