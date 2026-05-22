const TOOL_SKILL_MAP = {
  '正念呼吸': 'breathing',
  '情绪接纳': 'act_acceptance',
  '价值确认': 'values_clarification',
  '捕捉负面想法': 'cbt_reframe',
  'CBT 引导': 'cbt_reframe',
  '逆向思考': 'evidence_check',
  '毒舌锐评': 'humor_buffer',
  'MBTI 速测': 'personality_reflection',
  '一键发疯': 'humor_buffer',
};

const ALIASES = {
  cbt: 'cbt_reframe',
  cbt_reframe: 'cbt_reframe',
  act: 'act_acceptance',
  act_acceptance: 'act_acceptance',
  breathing: 'breathing',
  mbti: 'personality_reflection',
  personality_reflection: 'personality_reflection',
  humor: 'humor_buffer',
  humor_buffer: 'humor_buffer',
  empathic: 'empathic_support',
  empathic_support: 'empathic_support',
};

export function routeStrategy({ explicitSkillId, explicitToolName, agent, emotion, safety }) {
  if (safety.level === 'elevated') {
    return {
      skillId: 'empathic_support',
      reason: 'elevated_safety_requires_grounding',
    };
  }

  const normalizedExplicit = normalizeSkillId(explicitSkillId);
  if (normalizedExplicit && agent.allowedSkillIds.includes(normalizedExplicit)) {
    return {
      skillId: normalizedExplicit,
      reason: 'explicit_skill',
    };
  }

  const toolSkill = Object.entries(TOOL_SKILL_MAP).find(([label]) => explicitToolName?.includes(label))?.[1];
  if (toolSkill && agent.allowedSkillIds.includes(toolSkill)) {
    return {
      skillId: toolSkill,
      reason: 'explicit_tool',
    };
  }

  if (emotion.primary === 'ANXIOUS' && agent.allowedSkillIds.includes('cbt_reframe')) {
    return {
      skillId: 'cbt_reframe',
      reason: 'anxiety_to_cbt',
    };
  }

  if ((emotion.primary === 'SAD' || emotion.primary === 'ANGRY') && agent.allowedSkillIds.includes('act_acceptance')) {
    return {
      skillId: 'act_acceptance',
      reason: 'distress_to_act',
    };
  }

  return {
    skillId: agent.defaultSkillId,
    reason: 'agent_default',
  };
}

function normalizeSkillId(skillId) {
  if (!skillId) return null;
  return ALIASES[String(skillId).trim()] || String(skillId).trim();
}
