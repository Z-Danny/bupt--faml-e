/**
 * Supabase 服务层 - 日记和聊天相关API
 * 提供日记的增删改查功能，以及图片和音频上传功能
 * 提供聊天会话和消息的管理功能
 */

import { supabase, getUserId } from '../lib/supabaseClient';
import type { JournalEntry, MoodType, ChatSession, ChatMessageDB } from '../types';

/**
 * 将 base64 字符串转换为 Blob 对象
 */
const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg'): Blob => {
  // 移除 data URL 前缀（如果存在）
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

  // 解码 base64
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * 上传图片到 Supabase Storage
 * @param imageBase64 - base64 编码的图片数据
 * @returns 图片的公开 URL
 */
export const uploadImage = async (imageBase64: string): Promise<string> => {
  try {
    // 将 base64 转换为 Blob
    const imageBlob = base64ToBlob(imageBase64, 'image/jpeg');

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileName = `image_${timestamp}_${random}.jpg`;

    // 上传到 journal-images bucket
    const { data, error } = await supabase.storage
      .from('journal-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('图片上传失败:', error);
      throw new Error(`图片上传失败: ${error.message}`);
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('journal-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('uploadImage 错误:', error);
    throw error;
  }
};

/**
 * 上传音频到 Supabase Storage
 * @param audioBlob - 音频 Blob 对象
 * @returns 音频的公开 URL
 */
export const uploadAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileName = `audio_${timestamp}_${random}.webm`;

    // 上传到 journal-audio bucket
    const { data, error } = await supabase.storage
      .from('journal-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/webm',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('音频上传失败:', error);
      throw new Error(`音频上传失败: ${error.message}`);
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('journal-audio')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('uploadAudio 错误:', error);
    throw error;
  }
};

/**
 * 保存日记到数据库
 * @param entry - 日记条目对象
 * @returns 保存后的日记对象（包含 id 和 created_at）
 */
export const saveJournal = async (entry: {
  content: string;
  summary?: string;
  mood: MoodType;
  images?: string[];  // base64 数组
  audioBlob?: Blob;
}): Promise<JournalEntry> => {
  try {
    // 获取用户 ID
    const userId = getUserId();

    // 上传图片（如果有）
    let imageUrls: string[] = [];
    if (entry.images && entry.images.length > 0) {
      const uploadPromises = entry.images.map(img => uploadImage(img));
      imageUrls = await Promise.all(uploadPromises);
    }

    // 上传音频（如果有）
    let audioUrl: string | undefined;
    if (entry.audioBlob) {
      audioUrl = await uploadAudio(entry.audioBlob);
    }

    // 插入到 journals 表
    const { data, error } = await supabase
      .from('journals')
      .insert({
        user_id: userId,
        content: entry.content,
        summary: entry.summary || null,
        mood: entry.mood,
        images: imageUrls.length > 0 ? imageUrls : null,
        audio_url: audioUrl || null
      })
      .select()
      .single();

    if (error) {
      console.error('日记保存失败:', error);
      throw new Error(`日记保存失败: ${error.message}`);
    }

    // 转换为前端格式
    return {
      id: data.id,
      content: data.content,
      summary: data.summary || undefined,
      mood: data.mood as MoodType,
      date: data.created_at,
      images: data.images || undefined,
      audio: data.audio_url || undefined
    };
  } catch (error) {
    console.error('saveJournal 错误:', error);
    throw error;
  }
};

/**
 * 获取用户的所有日记
 * @returns 日记数组，按创建时间倒序
 */
export const getJournals = async (): Promise<JournalEntry[]> => {
  try {
    // 获取用户 ID
    const userId = getUserId();

    // 查询 journals 表
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('日记加载失败:', error);
      throw new Error(`日记加载失败: ${error.message}`);
    }

    // 转换为前端格式
    return (data || []).map(item => ({
      id: item.id,
      content: item.content,
      summary: item.summary || undefined,
      mood: item.mood as MoodType,
      date: item.created_at,
      images: item.images || undefined,
      audio: item.audio_url || undefined
    }));
  } catch (error) {
    console.error('getJournals 错误:', error);
    throw error;
  }
};

/**
 * 根据 ID 获取日记详情
 * @param id - 日记 ID
 * @returns 日记对象，如果不存在或不属于当前用户则返回 null
 */
export const getJournalById = async (id: string): Promise<JournalEntry | null> => {
  try {
    // 获取用户 ID
    const userId = getUserId();

    // 查询 journals 表
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 记录不存在
        return null;
      }
      console.error('日记查询失败:', error);
      throw new Error(`日记查询失败: ${error.message}`);
    }

    // 转换为前端格式
    return {
      id: data.id,
      content: data.content,
      summary: data.summary || undefined,
      mood: data.mood as MoodType,
      date: data.created_at,
      images: data.images || undefined,
      audio: data.audio_url || undefined
    };
  } catch (error) {
    console.error('getJournalById 错误:', error);
    throw error;
  }
};

// ==================== 聊天相关 API ====================

/**
 * 创建新的聊天会话
 * @param persona - 人格类型（healing/rational/fun）
 * @returns 新创建的会话对象
 */
export const createChatSession = async (persona: string): Promise<ChatSession> => {
  try {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId, persona })
      .select('*')
      .single();

    if (error) {
      console.error('会话创建失败:', error);
      throw new Error(`会话创建失败: ${error.message}`);
    }

    return data as ChatSession;
  } catch (error) {
    console.error('createChatSession 错误:', error);
    throw error;
  }
};

/**
 * 获取用户的所有聊天会话（包含第一条用户消息预览）
 * @returns 会话数组，按创建时间倒序
 */
export const listChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('会话列表加载失败:', error);
      throw new Error(`会话列表加载失败: ${error.message}`);
    }

    const sessions = (data ?? []) as ChatSession[];

    // 并发获取每个会话的第一条用户消息
    const sessionsWithFirstMessage = await Promise.all(
      sessions.map(async (session) => {
        try {
          const { data: messages, error: msgError } = await supabase
            .from('chat_messages')
            .select('content')
            .eq('session_id', session.id)
            .eq('role', 'user')
            .order('created_at', { ascending: true })
            .limit(1);

          if (!msgError && messages && messages.length > 0) {
            return {
              ...session,
              firstUserMessage: messages[0].content
            };
          }
          return session;
        } catch (err) {
          console.error(`加载会话 ${session.id} 的第一条消息失败:`, err);
          return session;
        }
      })
    );

    return sessionsWithFirstMessage;
  } catch (error) {
    console.error('listChatSessions 错误:', error);
    throw error;
  }
};

/**
 * 获取指定会话的所有消息
 * @param sessionId - 会话 ID
 * @returns 消息数组，按创建时间升序
 */
export const fetchMessages = async (sessionId: string): Promise<ChatMessageDB[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('消息加载失败:', error);
      throw new Error(`消息加载失败: ${error.message}`);
    }

    return (data ?? []) as ChatMessageDB[];
  } catch (error) {
    console.error('fetchMessages 错误:', error);
    throw error;
  }
};

/**
 * 通过 Edge Function 发送消息（支持流式响应）
 * @param payload - 消息负载
 * @returns ReadableStream（流式）或 JSON 对象（非流式）
 */
export const sendMessageViaEdge = async (payload: {
  message: string;
  persona: string;
  sessionId?: string;
  isAudio?: boolean;
  audioData?: string;
}): Promise<ReadableStream<Uint8Array> | any> => {
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-chat`;
    const userId = getUserId();

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'x-user-id': userId,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`聊天请求失败 (${res.status}): ${errorText}`);
    }

    // 如果是流式响应，返回 ReadableStream
    if (res.body) {
      return res.body;
    }

    // 否则返回 JSON
    return res.json();
  } catch (error) {
    console.error('sendMessageViaEdge 错误:', error);
    throw error;
  }
};
