import { getAgent } from './agents.js';
import { buildAgentSystemPrompt } from './promptBase.js';
import { buildReflectionContext } from './longReflection.js';
import { recognizeEmotion } from './skills/emotionRecognition.js';
import { protectPrivacy } from './skills/privacyGuard.js';
import { assessSafety, buildCrisisResponse } from './skills/safetyGuard.js';
import { routeStrategy } from './skills/strategyRouter.js';
import { getStrategySkill } from './skills/strategySkills.js';

export async function runSupportPipeline({
  persona,
  message,
  images = [],
  history = [],
  explicitSkillId,
  explicitToolName,
  recentJournals = [],
  recentEmotionEvents = [],
  buildImageInputUrl,
}) {
  const agent = getAgent(persona);
  const emotion = recognizeEmotion({ message, images });
  const safety = assessSafety({ message, emotion });
  const privacy = protectPrivacy({ message });
  const reflectionContext = buildReflectionContext({ recentJournals, recentEmotionEvents });

  if (safety.level === 'crisis') {
    return {
      directResponse: buildCrisisResponse({ agent }),
      metadata: buildMetadata({ agent, emotion, safety, privacy, route: { skillId: 'crisis_triage', reason: 'crisis' } }),
    };
  }

  const route = routeStrategy({
    explicitSkillId,
    explicitToolName,
    agent,
    emotion,
    safety,
  });
  const strategySkill = getStrategySkill(route.skillId);

  const systemPrompt = buildAgentSystemPrompt({
    agent,
    emotion,
    safety,
    privacy,
    strategySkill,
    reflectionContext,
  });

  const messages = [{ role: 'system', content: systemPrompt }];
  for (const item of history) {
    messages.push({
      role: item.role === 'model' ? 'assistant' : 'user',
      content: item.content,
    });
  }

  if (images.length > 0) {
    const imageItems = await Promise.all(
      images.map(async (url) => ({ type: 'image_url', image_url: { url: await buildImageInputUrl(url) } }))
    );
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: privacy.sanitizedMessage || '请结合图片和用户近期状态，提供心理支持。' },
        ...imageItems,
      ],
    });
  } else {
    messages.push({ role: 'user', content: privacy.sanitizedMessage });
  }

  return {
    messages,
    metadata: buildMetadata({ agent, emotion, safety, privacy, route }),
  };
}

function buildMetadata({ agent, emotion, safety, privacy, route }) {
  return {
    agent: {
      id: agent.id,
      name: agent.name,
      method: agent.method,
    },
    emotion,
    safety,
    privacy: {
      detectedTypes: privacy.detectedTypes,
      redactedForModel: privacy.detectedTypes.length > 0,
    },
    route,
  };
}
