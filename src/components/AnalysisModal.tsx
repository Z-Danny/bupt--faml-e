import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaName: string;
}

interface RadarDataPoint {
  subject: string;
  value: number;
}

// 6个维度数据
const RADAR_DATA: RadarDataPoint[] = [
  { subject: '情绪健康', value: 85 },
  { subject: '社交倾向', value: 68 },
  { subject: '睡眠质量', value: 55 },
  { subject: '压力水平', value: 58 },
  { subject: '情绪稳定', value: 72 },
  { subject: '自我认知', value: 78 },
];

const RECENT_TOPICS = ['学业压力', '人际关系', '自我成长'];

// AI 分析总结组件
const AnalysisSummary: React.FC = () => (
  <>
    <p className="mb-3">从最近的对话中，我观察到你正处于一个积极向上的成长阶段。</p>

    <p className="mb-3">
      你的<strong className="font-semibold">情绪健康指数</strong>表现优异，说明你已经掌握了一些有效的情绪调节方法。在<strong className="font-semibold">社交倾向</strong>上，你展现出良好的平衡感——既能享受与他人的连接，也懂得保护自己的私人空间。
    </p>

    <p className="mb-3">
      值得关注的是你的<strong className="font-semibold">睡眠质量</strong>，这可能是影响你整体状态的关键因素。建议建立固定的睡眠仪式，比如睡前冥想或阅读。
    </p>

    <p>整体而言，你的心理韧性较强，能够在压力下保持相对稳定。继续保持这种自我觉察的习惯，你会越来越好。</p>
  </>
);

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, personaName }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen) {
      setShouldRender(true);
    } else {
      timeout = setTimeout(() => setShouldRender(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [isOpen]);

  if (!shouldRender) return null;

  const overlayClasses = `fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`;

  const modalClasses = `fixed bottom-0 left-0 right-0 w-full h-[70vh] sm:h-[75vh] bg-white/95 backdrop-blur-xl border-t border-white/50 rounded-t-[3rem] shadow-2xl transform transition-transform duration-300 overflow-hidden flex flex-col ${
    isOpen ? 'translate-y-0' : 'translate-y-full'
  }`;

  return (
    <>
      <div className={overlayClasses} onClick={onClose} />
      <section
        className={modalClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-2 shrink-0">
          <div>
            <h2 id="analysis-modal-title" className="text-2xl font-semibold text-gray-900">
              我对你的观察
            </h2>
            <p className="mt-1 text-sm text-gray-500">—— {personaName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭分析弹窗"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content: Radar Chart + Analysis */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-4">
          {/* Radar Chart */}
          <div className="w-full h-[280px] sm:h-[320px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#e5e7eb" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                />
                <Radar
                  name="心理画像"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#818cf8"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Analysis Summary */}
          <div className="rounded-2xl border border-white/50 bg-white/70 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-3">综合分析</h3>
            <div className="text-sm text-gray-700 leading-relaxed">
              <AnalysisSummary />
            </div>
          </div>

          {/* Recent Topics */}
          <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">最近主要话题</p>
            <div className="flex flex-wrap gap-2">
              {RECENT_TOPICS.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs text-indigo-700 shadow-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
