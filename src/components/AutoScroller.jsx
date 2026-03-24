import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AutoScroller() {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  
  const requestRef = useRef();

  // 🚀 THE MASTER AUTO-SCROLL LOOP
  const scrollLoop = () => {
    if (isAutoScrolling) {
      // The base speed is 1 pixel per frame. Multiplier speeds it up!
      window.scrollBy({ top: 1.5 * speedMultiplier, left: 0, behavior: 'auto' });
    }
    requestRef.current = requestAnimationFrame(scrollLoop);
  };

  useEffect(() => {
    // Start or stop the loop whenever the state changes
    if (isAutoScrolling) {
      requestRef.current = requestAnimationFrame(scrollLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isAutoScrolling, speedMultiplier]);

  // Pause auto-scroll if the user manually uses their mouse wheel
  useEffect(() => {
    const handleUserScroll = (e) => {
      if (isAutoScrolling && e.deltaY !== 0) {
        setIsAutoScrolling(false); // Instantly hand control back to the user
      }
    };
    window.addEventListener('wheel', handleUserScroll);
    return () => window.removeEventListener('wheel', handleUserScroll);
  }, [isAutoScrolling]);

  return (
    <div 
      className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {/* 🎚️ THE SPEED CONTROLS (Fades in on hover) */}
        {(isHovered || isAutoScrolling) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex flex-col gap-2 bg-[#050505]/60 border border-white/10 p-2 rounded-2xl backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            {[1, 2, 3].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeedMultiplier(speed)}
                className={`w-8 h-8 rounded-full text-[10px] font-bold tracking-widest transition-all ${
                  speedMultiplier === speed 
                    ? 'bg-[#fbbf24] text-black shadow-[0_0_15px_rgba(251,191,36,0.6)]' 
                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⏯️ THE MAIN PLAY/PAUSE BUTTON */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
        className={`relative flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-2xl border transition-all duration-300 ${
          isAutoScrolling 
            ? 'bg-[#fbbf24]/10 border-[#fbbf24] shadow-[0_0_30px_rgba(251,191,36,0.3)]' 
            : 'bg-black/40 border-white/10 hover:border-white/30'
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isAutoScrolling && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fbbf24] opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoScrolling ? 'bg-[#fbbf24]' : 'bg-white/50'}`}></span>
        </span>
        <span className={`text-xs font-mono uppercase tracking-[0.2em] ${isAutoScrolling ? 'text-[#fbbf24]' : 'text-white/70'}`}>
          {isAutoScrolling ? 'Auto-Pilot' : 'Engage'}
        </span>
      </motion.button>
    </div>
  );
}