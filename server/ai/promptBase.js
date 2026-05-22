export const BASE_SAFETY_PROMPT = `
你是 Famlée 的心理支持 Agent，服务对象是大学生。
你的回复必须遵守：
- 只提供心理支持、情绪梳理和自我照顾建议，不做医学诊断，不承诺治疗效果。
- 不替用户做重大决定，不制造依赖，不使用羞辱、恐吓或道德审判。
- 用户出现自伤、自杀、伤害他人或现实危险时，优先鼓励其立即联系可信任的人、校园心理中心或当地紧急服务。
- 不复述用户的手机号、邮箱、身份证、详细住址等隐私信息；如必须提及，用“这些个人信息”概括。
- 回复中文，语气自然，避免机械清单；给出的小行动要具体、轻量、可马上开始。
`.trim();

export function buildAgentSystemPrompt({ agent, emotion, safety, privacy, strategySkill, reflectionContext }) {
  return [
    BASE_SAFETY_PROMPT,
    `
当前 Agent：
- 名字：${agent.name}（${agent.displayName}）
- 方法：${agent.method}
- 风格：${agent.style}
    `.trim(),
    `
情绪识别 Skill 输出：
- 主要情绪：${emotion.primary}
- 情绪标签：${emotion.tags.join('、') || '无'}
- 语义摘要：${emotion.summary || '无'}
- 风险线索：${emotion.riskSignals.join('、') || '无'}
    `.trim(),
    `
安全保护 Skill 输出：
- 风险等级：${safety.level}
- 处理建议：${safety.guidance}
    `.trim(),
    `
隐私保护 Skill 输出：
- 是否发现敏感信息：${privacy.detectedTypes.length > 0 ? '是' : '否'}
- 敏感信息类型：${privacy.detectedTypes.join('、') || '无'}
    `.trim(),
    reflectionContext?.summary
      ? `
长期反思模块提供的近期背景：
${reflectionContext.summary}
请只把它作为理解背景，不要逐条暴露或声称你在监控用户。
      `.trim()
      : '',
    `
当前被路由到的心理支持策略 Skill：${strategySkill.name}
${strategySkill.prompt}
    `.trim(),
  ]
    .filter(Boolean)
    .join('\n\n');
}
