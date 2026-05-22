const EMOTION_PATTERNS = [
  { emotion: 'ANXIOUS', tags: ['焦虑', '担心'], pattern: /(焦虑|紧张|担心|害怕|慌|心慌|失眠|压力|考砸|挂科|来不及)/ },
  { emotion: 'SAD', tags: ['难过', '低落'], pattern: /(难过|伤心|沮丧|崩溃|没意思|空虚|委屈|想哭|撑不住)/ },
  { emotion: 'ANGRY', tags: ['愤怒', '烦躁'], pattern: /(生气|愤怒|烦躁|火大|受不了|讨厌|气死|想骂)/ },
  { emotion: 'HAPPY', tags: ['开心', '积极'], pattern: /(开心|高兴|快乐|顺利|舒服|轻松|期待|棒)/ },
];

const RISK_PATTERNS = [
  { signal: 'self_harm', pattern: /(自杀|想死|不想活|结束生命|割腕|跳楼|吃药死|了结自己|活不下去)/ },
  { signal: 'harm_others', pattern: /(杀了他|伤害别人|报复|弄死|想打死|同归于尽)/ },
  { signal: 'severe_distress', pattern: /(撑不住|崩溃了|彻底完了|没有希望|没人能帮我)/ },
];

export function recognizeEmotion({ message = '', images = [] }) {
  const text = String(message);
  const matched = EMOTION_PATTERNS.find((item) => item.pattern.test(text));
  const riskSignals = RISK_PATTERNS.filter((item) => item.pattern.test(text)).map((item) => item.signal);
  const tags = new Set(matched?.tags || []);

  if (images.length > 0) {
    tags.add('image_context');
  }

  return {
    primary: matched?.emotion || 'NEUTRAL',
    tags: [...tags],
    summary: summarizeText(text, images),
    riskSignals,
    confidence: matched ? 0.72 : 0.42,
    modality: {
      hasText: text.trim().length > 0,
      imageCount: images.length,
    },
  };
}

function summarizeText(text, images) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean && images.length > 0) return `用户上传了 ${images.length} 张图片，希望获得情绪或内容支持。`;
  if (!clean) return '用户未提供明确文本。';
  return clean.length > 90 ? `${clean.slice(0, 90)}...` : clean;
}
