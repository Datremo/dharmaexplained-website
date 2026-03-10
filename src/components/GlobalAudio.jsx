import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// 🎵 THE MASTER TRACKLIST
// Make sure these exact .mp3 files are inside your 'public' folder!
const TRACKS = {
  intro: "/intro.mp3",             // The spinning sequence
  kshirsagar: "/vishnu_bg.mp3",   // The main Cosmic Ocean hub
  lustbreaker: "/lustbreaker.mp3", // Dark & Tense
  maya: "/maya.mp3",               // Glitchy & Chaotic
  karma: "/karma.mp3",             // Epic & Triumphant
  // The Avatars:
  matsya: "/matsya.mp3",
  kurma: "/kurma.mp3",
  varaha: "/varaha.mp3",
  narasimha: "/narasimha.mp3",
  vamana: "/vamana.mp3",
  parshurama: "/parshurama.mp3",
};


// ✨ THE MAGIC RADIO TRANSMITTER
export const setGlobalMusic = (themeName) => {
  window.dispatchEvent(new CustomEvent('switchTrack', { detail: themeName }));
};

export default function GlobalAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false); 
  
  // Starts with the Intro music by default!
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio(TRACKS.intro) : null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    const handleSwitch = (e) => {
      const newTheme = e.detail;
      const newSrc = TRACKS[newTheme]; 

      if (newSrc && audioRef.current.src !== window.location.origin + newSrc) {
        const wasPlaying = isPlayingRef.current;
        
        audioRef.current.pause();
        audioRef.current.src = newSrc;
        audioRef.current.load();
        
        // If the user turned sound ON, keep playing the new track!
        if (wasPlaying) {
          audioRef.current.play().catch(err => console.log("Autoplay blocked:", err));
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
      audioRef.current.play().then(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
      }).catch(err => console.error("Audio blocked:", err));
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