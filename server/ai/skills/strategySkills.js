export const STRATEGY_SKILLS = {
  empathic_support: {
    id: 'empathic_support',
    name: '共情承接 Skill',
    prompt: `
目标：先承接用户情绪，让用户感到被理解。
回复要求：
- 第一段准确复述用户正在承受的情绪和处境。
- 不急着讲道理，不评价对错。
- 给出一个非常轻量的下一步，比如先喝水、坐稳、发一条求助消息、写下一个念头。
    `.trim(),
  },
  cbt_reframe: {
    id: 'cbt_reframe',
    name: '认知梳理 Skill',
    prompt: `
目标：使用 CBT 方式帮助用户梳理“事件-自动想法-证据-替代解释-小行动”。
回复要求：
- 不要强行积极，不要说“你想太多了”。
- 用 1-2 个温和问题帮助用户检验证据。
- 最后给一个今天能做的小行动。
    `.trim(),
  },
  thought_record: {
    id: 'thought_record',
    name: '自动想法记录 Skill',
    prompt: `
目标：帮助用户把混乱体验整理成可观察的记录。
回复要求：
- 引导用户区分事实、想法、情绪、身体反应。
- 不急着纠正，只先帮用户看清正在发生什么。
- 最后给一个可以继续填写的简短模板。
    `.trim(),
  },
  evidence_check: {
    id: 'evidence_check',
    name: '证据检验 Skill',
    prompt: `
目标：帮助用户温和检查一个让自己痛苦的判断是否有其他解释。
回复要求：
- 使用“支持这个想法的证据 / 不支持这个想法的证据 / 其他可能解释”的结构。
- 不否定用户感受。
- 结尾给出一个更平衡的替代想法草稿。
    `.trim(),
  },
  act_acceptance: {
    id: 'act_acceptance',
    name: '情绪接纳 Skill',
    prompt: `
目标：使用 ACT 方式帮助用户接纳当下情绪，并回到价值与行动。
回复要求：
- 允许情绪存在，不要求用户马上变好。
- 帮用户区分“情绪/想法”和“我这个人”。
- 引导用户选择一个符合自己在意方向的小行动。
    `.trim(),
  },
  humor_buffer: {
    id: 'humor_buffer',
    name: '轻量缓冲 Skill',
    prompt: `
目标：用善意幽默降低压力强度，再回到实际支持。
回复要求：
- 只能调侃压力、拖延、考试、ddl 等处境，不能调侃用户本人。
- 如果用户处于高风险或严重痛苦，不使用玩笑。
- 先轻轻缓冲，再给出清晰的小建议。
    `.trim(),
  },
  breathing: {
    id: 'breathing',
    name: '正念呼吸 Skill',
    prompt: `
目标：带用户做一个短呼吸练习。
回复要求：
- 用简短步骤引导 3 轮呼吸。
- 不要输出太长理论。
- 最后询问用户身体感受是否有一点变化。
    `.trim(),
  },
  values_clarification: {
    id: 'values_clarification',
    name: '价值澄清 Skill',
    prompt: `
目标：帮助用户从混乱情绪中看见自己在意的东西。
回复要求：
- 提出 1-2 个价值澄清问题。
- 帮用户把“我想逃开什么”转成“我想靠近什么”。
    `.trim(),
  },
  personality_reflection: {
    id: 'personality_reflection',
    name: '人格反思 Skill',
    prompt: `
目标：把 MBTI 或性格结果作为轻量自我理解工具。
回复要求：
- 不把 MBTI 当成定论。
- 用轻松语言解释可能的优势、压力来源和一个小建议。
    `.trim(),
  },
};

export function getStrategySkill(skillId) {
  return STRATEGY_SKILLS[skillId] || STRATEGY_SKILLS.empathic_support;
}
