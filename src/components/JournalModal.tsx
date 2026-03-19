import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Check, Sparkles, Mic, Square, Trash2, AlertCircle } from 'lucide-react';
import { MoodType, JournalEntry } from '../types';
import { generateJournalSummary } from '../services/geminiService';
import { saveJournal } from '../services/supabaseService';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  setGlobalMood: (mood: MoodType) => void;
  onSaveEntry: (entry: JournalEntry) => void;
  onStartChat: (message: string) => void;
}

const MOOD_LABELS: Record<MoodType, string> = {
  [MoodType.HAPPY]: '开心',
  [MoodType.ANXIOUS]: '焦虑',
  [MoodType.SAD]: '难过',
  [MoodType.ANGRY]: '生气',
  [MoodType.NEUTRAL]: '平静',
};

export const JournalModal: React.FC<JournalModalProps> = ({ 
  isOpen, 
  onClose, 
  setGlobalMood, 
  onSaveEntry,
  onStartChat 
}) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>(MoodType.NEUTRAL);
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [syncToChat, setSyncToChat] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // 保存 Blob 对象供上传使用
        audioBlobRef.current = blob;
        // 创建 URL 用于播放预览
        const audioUrl = URL.createObjectURL(blob);
        setAudioData(audioUrl);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError("麦克风权限被拒绝。请在浏览器设置中允许访问麦克风。");
      } else if (err.name === 'NotFoundError') {
         setPermissionError("未检测到麦克风设备。");
      } else {
        setPermissionError("无法访问麦克风，请检查设备设置。");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const deleteAudio = () => {
    if (audioData) {
      URL.revokeObjectURL(audioData);
    }
    setAudioData(null);
    audioBlobRef.current = null;
  };

  const handleSave = async () => {
    // Allow saving if there is text OR audio OR images
    if (!content.trim() && !audioData && images.length === 0) return;

    try {
      setIsProcessing(true);
      setSaveError(null);

      // 生成 AI 总结（如果有文本内容）
      let summary = '';
      if (content.trim()) {
        summary = await generateJournalSummary(content);
      }

      // 调用 Supabase API 保存日记
      const savedEntry = await saveJournal({
        content,
        summary,
        mood: selectedMood,
        images: images.length > 0 ? images : undefined,
        audioBlob: audioBlobRef.current || undefined
      });

      // 通知父组件（可选）
      onSaveEntry(savedEntry);

      // 更新全局心情
      setGlobalMood(selectedMood);

      // 如果选择了同步到对话，启动聊天
      if (syncToChat && content.trim()) {
        onStartChat(content);
        // Modal will be closed by parent or navigation logic in Home/App
      } else {
        // 重置状态并关闭
        setContent('');
        setImages([]);
        if (audioData) {
          URL.revokeObjectURL(audioData);
        }
        setAudioData(null);
        audioBlobRef.current = null;
        setSyncToChat(false);
        onClose();
      }
    } catch (error) {
      console.error('保存日记失败:', error);
      setSaveError('保存失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={onClose}
        ></div>

        {/* Card Window */}
        <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative animate-slide-up transform transition-all border border-white/50 max-h-[90vh] overflow-y-auto scrollbar-hide">
            
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100/50">
                <span className="text-sm font-medium text-gray-500 tracking-widest">MOOD RECORD</span>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} className="text-gray-400" />
                </button>
            </div>

            <div className="p-6">
                {/* Mood Selector */}
                <div className="flex justify-between mb-6 px-1">
                    {Object.values(MoodType).map((mood) => (
                        <div key={mood} className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => setSelectedMood(mood)}
                                className={`
                                    w-10 h-10 rounded-full border border-white/40 flex items-center justify-center transition-all duration-300
                                    ${selectedMood === mood ? 'bg-gray-100 scale-110 shadow-inner' : 'hover:bg-gray-50'}
                                `}
                            >
                                <div className={`w-3 h-3 rounded-full ${
                                    mood === MoodType.HAPPY ? 'bg-yellow-400' :
                                    mood === MoodType.ANXIOUS ? 'bg-blue-600' :
                                    mood === MoodType.SAD ? 'bg-purple-400' :
                                    mood === MoodType.ANGRY ? 'bg-red-400' : 'bg-gray-400'
                                }`}></div>
                            </button>
                            <span className={`text-[10px] font-light transition-colors ${selectedMood === mood ? 'text-gray-800 font-normal' : 'text-gray-400'}`}>
                                {MOOD_LABELS[mood]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Text Input */}
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="此刻，你的心情是怎样的？"
                    className="w-full h-28 bg-gray-50/50 rounded-2xl p-4 text-gray-700 font-light focus:outline-none focus:bg-white transition-colors resize-none mb-4 text-sm leading-relaxed"
                />

                {/* Audio Recording Section */}
                {audioData ? (
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3 mb-4">
                        <audio src={audioData} controls className="h-8 w-full mr-2" />
                        <button onClick={deleteAudio} className="p-1.5 bg-red-100 text-red-500 rounded-full hover:bg-red-200">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ) : null}

                {/* Permission Error Message */}
                {permissionError && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-600 rounded-xl text-xs">
                        <AlertCircle size={14} />
                        {permissionError}
                    </div>
                )}

                {/* Save Error Message */}
                {saveError && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-600 rounded-xl text-xs">
                        <AlertCircle size={14} />
                        {saveError}
                    </div>
                )}

                {/* Image Thumbnails */}
                {images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                <img src={img} alt="upload" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Tools Bar */}
                <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        {/* Image Upload Button */}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <ImageIcon size={18} strokeWidth={1.5} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        {/* Mic Button */}
                        <button 
                            onClick={toggleRecording}
                            className={`p-2.5 rounded-full transition-all duration-300 ${
                                isRecording 
                                ? 'bg-red-50 text-red-500 animate-pulse ring-2 ring-red-100' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                        >
                            {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} strokeWidth={1.5} />}
                        </button>
                        
                        {/* Chat Sync Toggle */}
                        <button 
                            onClick={() => setSyncToChat(!syncToChat)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-colors border ${
                                syncToChat 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                                : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            <Sparkles size={14} />
                            对话疗愈
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? '保存中...' : 'Mark'} <Check size={16} />
                    </button>
                </div>
            </div>
        </div>

        <style>{`
            @keyframes slide-up {
                0% { transform: translateY(100%) scale(0.9); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            .animate-slide-up {
                animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
        `}</style>
    </div>
  );
};