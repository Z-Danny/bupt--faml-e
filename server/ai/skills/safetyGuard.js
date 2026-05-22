const CRISIS_PATTERNS = [
  /(自杀|想死|不想活|结束生命|割腕|跳楼|吃药死|了结自己|活不下去)/,
  /(杀了他|伤害别人|报复|弄死|想打死|同归于尽)/,
];

const ELEVATED_PATTERNS = [
  /(撑不住|崩溃了|没有希望|没人能帮我|彻底完了|消失算了)/,
  /(连续.*失眠|好几天.*没睡|控制不了自己)/,
];

export function assessSafety({ message = '', emotion }) {
  const text = String(message);

  if (CRISIS_PATTERNS.some((pattern) => pattern.test(text)) || emotion.riskSignals.includes('self_harm')) {
    return {
      level: 'crisis',
      blockNormalPersona: true,
      guidance: '立即进入危机支持，不使用幽默或普通咨询流程。',
      reasons: ['crisis_language'],
    };
  }

  if (ELEVATED_PATTERNS.some((pattern) => pattern.test(text)) || emotion.riskSignals.length > 0) {
    return {
      level: 'elevated',
      blockNormalPersona: false,
      guidance: '保持稳定、具体、低刺激，建议联系现实支持资源。',
      reasons: emotion.riskSignals,
    };
  }

  return {
    level: 'low',
    blockNormalPersona: false,
    guidance: '可进入常规心理支持策略。',
    reasons: [],
  };
}

export function buildCrisisResponse({ agent }) {
  return [
    `${agent.displayName} 先认真陪你把安全放在第一位。你刚刚说的内容听起来已经很危险，不需要一个人扛着。`,
    '请现在立刻联系一个现实中能到你身边的人，比如室友、朋友、家人、辅导员或校园心理中心。若你已经有具体计划、工具就在身边，或担心自己马上会做出伤害行为，请立即拨打当地紧急电话，或直接去最近的急诊/保卫处求助。',
    '在你联系到人之前，先把可能伤害自己的物品放远一点，离开封闭或危险的位置，去有人的地方。你也可以只发一句：“我现在很危险，需要你马上来陪我。”',
  ].join('\n\n');
}
