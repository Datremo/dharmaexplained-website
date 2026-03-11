import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const TRACKS = {
  intro: "/intro.mp3",             
  kshirsagar: "/vishnu_bg.mp3",   
  lustbreaker: "/lustbreaker.mp3", 
  maya: "/maya.mp3",               
  karma: "/karma.mp3",             
  matsya: "/matsya.mp3",
  kurma: "/kurma.mp3",
  varaha: "/varaha.mp3",
  narasimha: "/narasimha.mp3",
  vamana: "/vamana.mp3",
  parshurama: "/parshurama.mp3",
};

export const setGlobalMusic = (themeName) => {
  window.dispatchEvent(new CustomEvent('switchTrack', { detail: themeName }));
};

export default function GlobalAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false); 
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio(TRACKS.intro) : null);
  const playPromiseRef = useRef(null); // ✨ This protects the app from crashing!

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    const handleSwitch = async (e) => {
      const newTheme = e.detail;
      const newSrc = TRACKS[newTheme] || TRACKS.kshirsagar; 

      if (newSrc && audioRef.current.src !== window.location.origin + newSrc) {
        const wasPlaying = isPlayingRef.current;
        
        // ✨ MAGIC FIX: Wait for any currently loading audio to finish before switching
        if (playPromiseRef.current) {
          try { await playPromiseRef.current; } catch (err) {} 
        }

        audioRef.current.pause();
        audioRef.current.src = newSrc;
        audioRef.current.load();
        
        if (wasPlaying) {
          playPromiseRef.current = audioRef.current.play();
          playPromiseRef.current.catch(err => console.log("Audio transition smoothed."));
        }
      }
    };

    window.addEventListener('switchTrack', handleSwitch);
    return () => window.removeEventListener('switchTrack', handleSwitch);
  }, []);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (isPlayingRef.current) {
      audioRef.current.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      playPromiseRef.current = audioRef.current.play();
      playPromiseRef.current.then(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
      }).catch(err => console.error("Audio blocked by browser:", err));
    }
  };

  return (
    <button 
      onClick={toggleSound}
      className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-[999] px-4 py-2 border rounded-full text-[10px] md:text-xs tracking-[0.3em] uppercase transition-all backdrop-blur-md flex items-center gap-3 group"
      style={{
        borderColor: isPlaying ? 'rgba(56,189,248,0.5)' : 'rgba(255,255,255,0.2)',
        backgroundColor: isPlaying ? 'rgba(56,189,248,0.1)' : 'rgba(0,0,0,0.5)',
        color: isPlaying ? '#38bdf8' : 'rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex items-end gap-[2px] h-3">
        <motion.div animate={{ height: isPlaying ? [4, 12, 4] : 2 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-[2px] bg-current" />
        <motion.div animate={{ height: isPlaying ? [8, 4, 8] : 2 }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-[2px] bg-current" />
        <motion.div animate={{ height: isPlaying ? [4, 10, 4] : 2 }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-[2px] bg-current" />
      </div>
      {isPlaying ? "Sound On" : "Sound Off"}
    </button>
  );
}