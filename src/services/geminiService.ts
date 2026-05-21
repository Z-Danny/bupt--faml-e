import { apiUrl, getAuthToken } from '../lib/apiClient';

export interface StreamChunk {
  text: string;
  done: boolean;
  sessionId?: string;
}

const parseChunkLine = (
  line: string
): { text: string; done: boolean; sessionId?: string } => {
  try {
    const jsonStr = line.startsWith('data: ') ? line.slice(6) : line;
    if (!jsonStr.trim() || jsonStr.trim() === '[DONE]') return { text: '', done: true };

    const parsed = JSON.parse(jsonStr);
    return {
      text: parsed?.content ?? parsed?.text ?? '',
      done: Boolean(parsed?.done),
      sessionId: parsed?.sessionId,
    };
  } catch {
    return { text: '', done: false };
  }
};

export const streamChat = async (
  message: string,
  persona: string,
  sessionId?: string,
  isAudio?: boolean,
  audioData?: string,
  images?: string[],
  onChunk?: (chunk: StreamChunk) => void
): Promise<void> => {
  if (!message && (!images || images.length === 0)) throw new Error('message or images is required');
  if (!persona) throw new Error('persona is required');
  if (!onChunk) throw new Error('onChunk callback is required');

  const token = getAuthToken();
  const response = await fetch(apiUrl('/ai/chat'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message: message || (images && images.length > 0 ? '请描述这张图片' : ''),
      persona,
      sessionId,
      isAudio,
      audioData,
      images,
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => 'Unable to read body');
    throw new Error(`AI request failed: ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const headerSessionId = response.headers.get('X-Session-Id') || undefined;
  let resolvedSessionId = headerSessionId || sessionId;
  let buffer = '';
  let finished = false;

  const emit = (text: string, done: boolean, chunkSessionId?: string) => {
    if (chunkSessionId && !resolvedSessionId) {
      resolvedSessionId = chunkSessionId;
    }
    onChunk({
      text,
      done,
      sessionId: resolvedSessionId ?? chunkSessionId,
    });
    if (done) finished = true;
  };

  const flushLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const { text, done, sessionId: chunkSessionId } = parseChunkLine(trimmed);
    if (text || done) emit(text, done, chunkSessionId);
  };

  while (true) {
    const { value, done } = await reader.read();
    const decoded = value ? decoder.decode(value, { stream: !done }) : '';
    buffer += decoded;

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) > -1) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      flushLine(line);
    }

    if (done) {
      if (buffer.trim()) flushLine(buffer);
      if (!finished) emit('', true);
      break;
    }
  }
};

export const generateJournalSummary = async (entry: string): Promise<string> => {
  try {
    const token = getAuthToken();
    const response = await fetch(apiUrl('/ai/summary'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content: entry }),
    });

    if (!response.ok) {
      throw new Error(`AI summary failed: ${response.status}`);
    }

    const data = await response.json();
    return data.summary || '记录下这一刻的心情，是自我关怀的开始。';
  } catch (error) {
    console.error('Error generating summary:', error);
    return '暂时无法连接到 AI。';
  }
};

export const blobToB64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const base64Content = base64data.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
