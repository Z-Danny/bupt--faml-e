import React, { useEffect, useRef } from 'react';
import { MoodType } from '../types';
import { MOOD_THEMES } from '../constants';

interface FluidBackgroundProps {
  mood: MoodType;
}

export const FluidBackground: React.FC<FluidBackgroundProps> = ({ mood }) => {
  const theme = MOOD_THEMES[mood];
  
  // We use CSS transitions for smooth color changes on the divs
  // The animation 'blob' moves them around

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-50 transition-colors duration-1000 ease-in-out">
      {/* Blob 1 */}
      <div 
        className="absolute top-0 left-[-20%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob transition-colors duration-1000"
        style={{ backgroundColor: theme.bgPrimary }}
      ></div>
      
      {/* Blob 2 */}
      <div 
        className="absolute top-[-10%] right-[-20%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 transition-colors duration-1000"
        style={{ backgroundColor: theme.bgSecondary }}
      ></div>
      
      {/* Blob 3 */}
      <div 
        className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 transition-colors duration-1000"
        style={{ backgroundColor: theme.bgAccent }}
      ></div>

      {/* Noise/Grain Overlay for texture (Acid Graphics touch) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};