import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsComplete(true);
          setTimeout(() => {
            onComplete();
          }, 800);
          return 100;
        }
        return prev + 3;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 transition-all duration-1000 ${isComplete ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
      <div className="text-center relative">
        
        {/* Subtle Background Elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-green-50 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-green-100 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Elegant Logo Area */}
        <div className="relative mb-12">
          <div className="relative">
            {/* Outer Ring */}
            <div className="w-32 h-32 mx-auto border-2 border-green-200 rounded-full flex items-center justify-center relative overflow-hidden">
              {/* Rotating Border */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-30 animate-spin" style={{ animationDuration: '3s' }}></div>
              
              {/* Inner Circle */}
              <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-white rounded-full shadow-lg flex items-center justify-center relative z-10">
                {/* Central Dot with Pulse */}
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute w-8 h-8 bg-green-400 rounded-full opacity-20 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-16">
          <h1 className="text-7xl font-light text-slate-800 mb-3 tracking-[0.2em] relative">
            Intern
            <span className="font-normal text-green-600 relative">
              X
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
            </span>
          </h1>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto mb-4"></div>
          <p className="text-slate-500 text-lg font-light tracking-wide">From WiZdomEd</p>
        </div>

        {/* Sophisticated Progress Bar */}
        <div className="w-96 mx-auto mb-8">
          <div className="relative">
            {/* Background Track */}
            <div className="bg-slate-200 rounded-full h-1 mb-6 overflow-hidden relative">
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
              
              {/* Progress Fill */}
              <div 
                className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Gloss Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-pulse"></div>
              </div>
            </div>
            
            {/* Progress Text */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-light">Loading</span>
              <span className="text-slate-600 font-medium tabular-nums">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Minimalist Loading Dots */}
        <div className="flex justify-center space-x-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i * 25 <= progress ? '#10b981' : '#e2e8f0',
                animationDelay: `${i * 0.15}s`,
                transform: i * 25 <= progress ? 'scale(1.2)' : 'scale(1)'
              }}
            ></div>
          ))}
        </div>

        {/* Subtle Status Text */}
        <div className="mt-12">
          <p className="text-slate-400 text-sm font-light tracking-wide">
            {progress < 30 && "Initializing..."}
            {progress >= 30 && progress < 60 && "Loading Resources..."}
            {progress >= 60 && progress < 90 && "Finalizing..."}
            {progress >= 90 && "Almost Ready..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Preloader;