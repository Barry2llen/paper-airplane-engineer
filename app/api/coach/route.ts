import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { feedback: "已记录飞行。配置 GEMINI_API_KEY 后可启用 AI 教练反馈。" }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const { parameters, distance, time, hasCrashed } = await req.json();
    
    const prompt = `你是一位友好、热情的空气动力学教授，正在指导学生调试纸飞机。
学生刚刚用以下参数投掷了一架纸飞机：
- 翼面积：${parameters.wingArea} cm^2
- 重心位置：${parameters.cogPosition}（-1 表示机头最前端，+1 表示机尾，0 表示升力中心）
- 上反角：${parameters.dihedralAngle} 度
- 翼梢小翼：${parameters.hasWinglets ? "有" : "无"}
- 投掷力度：${parameters.thrust} / 10

飞行结果：
- 距离：${distance.toFixed(2)} 米
- 滞空时间：${time.toFixed(2)} 秒
- 状态：${hasCrashed ? "撞到地面" : "完成飞行"}

请基于真实空气动力学原则（升力、阻力、重心、稳定性）分析这次飞行。
请只用中文输出 2 到 3 句话：先用轻松的语气回应结果，再给出一个能改善距离或滞空时间的具体调整建议。

示例：
"你的纸飞机有点尾重，导致机头上扬后失速坠落！试着把重心往机头方向调一点。"
"滑翔表现不错！翼梢小翼降低了阻力，但稍微增加翼面积能让它获得更多升力。"
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return NextResponse.json({ feedback: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "获取教练反馈失败" },
      { status: 500 }
    );
  }
}
