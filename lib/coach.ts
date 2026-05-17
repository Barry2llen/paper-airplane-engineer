import type { FlightParameters } from './physics';
import type { FlightResult, MissionId } from './scoring';
import { MISSIONS } from './scoring';

export interface CoachInput {
  mission: MissionId;
  parameters: FlightParameters;
  result?: FlightResult;
  distance?: number;
  time?: number;
  stability?: number;
  landingImpact?: number;
  targetError?: number;
  hasCrashed?: boolean;
}

export function buildCoachPrompt(input: CoachInput) {
  const distance = input.result?.distance ?? input.distance ?? 0;
  const time = input.result?.time ?? input.time ?? 0;
  const stability = input.result?.stability ?? input.stability ?? 0;
  const landingImpact = input.result?.landingImpact ?? input.landingImpact ?? 0;
  const targetError = input.result?.targetError ?? input.targetError;
  const score = input.result?.score ?? 0;
  const grade = input.result?.grade ?? 'C';
  const mission = MISSIONS[input.mission];

  return `你是一位积极、专业、适合路演的纸飞机航空工程教练。
当前任务：${mission.name}（${mission.target}）
任务说明：${mission.description}

设计参数：
- 翼面积：${input.parameters.wingArea} cm^2
- 重心位置：${input.parameters.cogPosition}（-1 表示机头，+1 表示机尾）
- 翼梢小翼：${input.parameters.hasWinglets ? '有' : '无'}
- 上反角：${input.parameters.dihedralAngle} 度
- 投掷力度：${input.parameters.thrust} / 10
- 投掷角度：${input.parameters.throwAngle} 度

飞行结果：
- 距离：${distance.toFixed(2)} 米
- 滞空时间：${time.toFixed(2)} 秒
- 稳定性：${stability.toFixed(0)} / 100
- 着陆冲击：${landingImpact.toFixed(1)} / 10
${targetError === undefined ? '' : `- 靶心误差：${targetError.toFixed(1)} 米\n`}- 得分：${score} 分
- 评级：${grade}
- 状态：${input.hasCrashed ? '已经着陆' : '完成试飞'}

请只用中文输出 2 到 4 句话。先复盘结果，再给出 1 到 2 个具体可执行的参数调整建议。语气要像工程师教练，积极、有画面感，不要输出项目符号。`;
}

export function generateLocalCoachFeedback(input: CoachInput) {
  const result = input.result;
  const messages: string[] = [];

  if (result) {
    messages.push(
      `${MISSIONS[input.mission].name}本轮拿到 ${result.score} 分、${result.grade} 级，${result.missionSuccess ? '任务目标已经达成' : '还差一点就能达标'}。`
    );
  } else {
    messages.push(`${MISSIONS[input.mission].name}的遥测已经记录，可以从升力、阻力和稳定性三条线继续调参。`);
  }

  const p = input.parameters;
  const rules: string[] = [];

  if (p.cogPosition > 0.4) rules.push('重心偏后会让机头上扬并诱发失速，建议把重心向机头前移。');
  if (p.cogPosition < -0.7) rules.push('机头过重会让纸飞机快速下坠，可以把重心稍微后移。');
  if (p.wingArea < 100) rules.push('机翼面积偏小，升力储备不足，建议增加翼面积再试飞。');
  if (p.wingArea > 260) rules.push('翼面积过大正在换来额外阻力，可以收小一点来提升升阻比。');
  if (!p.hasWinglets) rules.push('可以尝试翼梢小翼来削弱翼尖涡流，并提高横向稳定性。');
  if (p.dihedralAngle < 5) rules.push('上反角不足会削弱横向自稳定，建议提高到 10° 左右。');
  if (p.dihedralAngle > 35) rules.push('上反角过大可能带来额外阻力，建议降低到 15° 到 25° 区间。');
  if (p.thrust > 8 && (result?.landingImpact ?? input.landingImpact ?? 0) > 4.5) {
    rules.push('投掷力度过大正在放大着陆冲击，尤其不利于鸡蛋空投。');
  }

  if (rules.length > 0) {
    messages.push(rules[0]);
  }

  if (input.mission === 'distance') {
    messages.push('远航挑战建议用中等翼面积、略靠前重心和 15° 到 25° 投掷角，先把阻力降下来。');
  } else if (input.mission === 'airtime') {
    messages.push('滞空挑战要追求缓慢下沉，优先增加有效升力并保持稳定上反角。');
  } else {
    messages.push('鸡蛋空投要同时照顾靶心误差和冲击，建议用较柔和的投掷力度把落点调向 25 米。');
  }

  if (rules.length > 1 && messages.length < 4) {
    messages.push(rules[1]);
  }

  return messages.slice(0, 4).join('');
}
