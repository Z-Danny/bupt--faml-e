const PII_RULES = [
  { type: 'email', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, replacement: '[邮箱已隐藏]' },
  { type: 'phone', pattern: /(?<!\d)1[3-9]\d{9}(?!\d)/g, replacement: '[手机号已隐藏]' },
  { type: 'id_card', pattern: /(?<!\d)\d{17}[\dXx](?!\d)/g, replacement: '[证件号已隐藏]' },
  { type: 'student_id', pattern: /(学号[:：]?\s*)\d{6,14}/g, replacement: '$1[已隐藏]' },
  { type: 'qq_wechat', pattern: /((微信|vx|VX|qq|QQ)[:：]?\s*)[A-Za-z0-9_-]{5,}/g, replacement: '$1[已隐藏]' },
];

export function protectPrivacy({ message = '' }) {
  let sanitized = String(message);
  const detectedTypes = [];

  for (const rule of PII_RULES) {
    if (rule.pattern.test(sanitized)) {
      detectedTypes.push(rule.type);
      sanitized = sanitized.replace(rule.pattern, rule.replacement);
    }
    rule.pattern.lastIndex = 0;
  }

  return {
    sanitizedMessage: sanitized,
    detectedTypes,
  };
}
