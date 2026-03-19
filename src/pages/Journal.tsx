import React, { useState } from 'react';
import { Mic, Save } from 'lucide-react';
import { MoodType, JournalEntry } from '../types';
import { generateJournalSummary } from '../services/geminiService';

interface JournalPageProps {
  setGlobalMood: (mood: MoodType) => void;
  onSaveEntry: (entry: JournalEntry) => void;
}

export const JournalPage: React.FC<JournalPageProps> = ({ setGlobalMood, onSaveEntry }) => {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>(MoodType.NEUTRAL);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsProcessing(true);

    const summary = await generateJournalSummary(content);
    
    const newEntry: JournalEntry = {
        id: Date.now().toString(),
        content,
        mood: selectedMood,
        summary,
        date: new Date().toISOString()
    };

    onSaveEntry(newEntry);
    setGlobalMood(selectedMood); // Update background
    setContent('');
    setIsProcessing(false);
    // Optionally trigger a toast or feedback here
  };

  return (
    <div className="h-full flex flex-col pt-20 px-6 pb-24 max-w-2xl mx-auto overflow-y-auto scrollbar-hide">
      <h2 className="text-2xl font-thin text-gray-800 mb-6 tracking-wider">情绪手账</h2>

      {/* Mood Selector */}
      <div className="flex justify-between mb-8 px-2">
        {Object.values(MoodType).map((mood) => (
            <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`
                    w-12 h-12 rounded-full border border-white/40 flex items-center justify-center transition-all duration-500
                    ${selectedMood === mood ? 'bg-white/50 scale-110 shadow-lg' : 'bg-white/10 hover:bg-white/20'}
                `}
            >
                <div className={`w-4 h-4 rounded-full ${
                    mood === MoodType.HAPPY ? 'bg-yellow-300' :
                    mood === MoodType.ANXIOUS ? 'bg-blue-800' :
                    mood === MoodType.SAD ? 'bg-purple-300' :
                    mood === MoodType.ANGRY ? 'bg-red-400' : 'bg-gray-300'
                }`}></div>
            </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="glass-panel rounded-3xl p-6 mb-8 relative group">
        <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天的内心世界是怎样的？"
            className="w-full h-40 bg-transparent resize-none focus:outline-none text-gray-700 font-light leading-relaxed placeholder-gray-500/70"
        />
        <div className="flex justify-between items-center mt-4 border-t border-white/20 pt-4">
             <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <Mic size={20} className="text-gray-600" strokeWidth={1.5} />
            </button>
            <button 
                onClick={handleSave}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/30 hover:bg-white/50 border border-white/40 transition-all text-sm font-medium text-gray-800"
            >
                {isProcessing ? '生成中...' : '保存记录'} <Save size={16} strokeWidth={1.5} />
            </button>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 font-light mt-4">
          记录将被保存至心情日历
      </div>
    </div>
  );
};