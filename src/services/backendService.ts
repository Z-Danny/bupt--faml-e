import { apiFetch, apiUrl, getAuthToken } from '../lib/apiClient';
import type { ChatMessageDB, ChatSession, JournalEntry, MoodType } from '../types';

interface UploadResponse {
  url: string;
}

export const uploadImage = async (imageBase64: string): Promise<string> => {
  const data = await apiFetch<UploadResponse>('/uploads/images', {
    method: 'POST',
    body: JSON.stringify({ dataUrl: imageBase64 }),
  });
  return data.url;
};

export const uploadAvatar = async (imageBase64: string): Promise<string> => {
  const data = await apiFetch<UploadResponse>('/uploads/avatar', {
    method: 'POST',
    body: JSON.stringify({ dataUrl: imageBase64 }),
  });
  return data.url;
};

export const uploadAudio = async (audioBlob: Blob): Promise<string> => {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });

  const data = await apiFetch<UploadResponse>('/uploads/audio', {
    method: 'POST',
    body: JSON.stringify({ dataUrl }),
  });
  return data.url;
};

export const saveJournal = async (entry: {
  content: string;
  summary?: string;
  mood: MoodType;
  images?: string[];
  audioBlob?: Blob;
}): Promise<JournalEntry> => {
  const images = entry.images?.length
    ? await Promise.all(entry.images.map((image) => uploadImage(image)))
    : undefined;
  const audio = entry.audioBlob ? await uploadAudio(entry.audioBlob) : undefined;

  const data = await apiFetch<{ journal: JournalEntry }>('/journals', {
    method: 'POST',
    body: JSON.stringify({
      content: entry.content,
      summary: entry.summary,
      mood: entry.mood,
      images,
      audio,
    }),
  });

  return data.journal;
};

export const getJournals = async (): Promise<JournalEntry[]> => {
  const data = await apiFetch<{ journals: JournalEntry[] }>('/journals');
  return data.journals;
};

export const getJournalById = async (id: string): Promise<JournalEntry | null> => {
  const data = await apiFetch<{ journal: JournalEntry | null }>(`/journals/${id}`);
  return data.journal;
};

export const createChatSession = async (persona: string): Promise<ChatSession> => {
  const data = await apiFetch<{ session: ChatSession }>('/chat/sessions', {
    method: 'POST',
    body: JSON.stringify({ persona }),
  });
  return data.session;
};

export const listChatSessions = async (): Promise<ChatSession[]> => {
  const data = await apiFetch<{ sessions: ChatSession[] }>('/chat/sessions');
  return data.sessions;
};

export const fetchMessages = async (sessionId: string): Promise<ChatMessageDB[]> => {
  const data = await apiFetch<{ messages: ChatMessageDB[] }>(`/chat/sessions/${sessionId}/messages`);
  return data.messages;
};

export const sendMessageViaEdge = async (payload: {
  message: string;
  persona: string;
  sessionId?: string;
  isAudio?: boolean;
  audioData?: string;
  images?: string[];
  skillId?: string;
  toolName?: string;
}): Promise<ReadableStream<Uint8Array> | any> => {
  const token = getAuthToken();
  const response = await fetch(apiUrl('/ai/chat'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.body ?? response.json();
};
