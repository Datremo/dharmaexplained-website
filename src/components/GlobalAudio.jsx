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
  
  // ✨ RANDOM REALISATION TRACKS
  vault_lobby: "/vault_lobby.mp3",
  true_formula: "/true_formula.mp3",
  slow_antidote: "/slow_antidote.mp3",
  domination: "/domination.mp3",

  // ✨ ADD THIS: A special flag that tells the global audio to step aside!
  rama_cinematic: "DELEGATE", 
};

export const setGlobalMusic = (themeName) => {
  window.dispatchEvent(new CustomEvent('switchTrack', { detail: themeName }));
};

export default function GlobalAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false); 
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio(TRACKS.intro) : null);
  const playPromiseRef = useRef(null); 
  
  // ✨ ADD THIS: A ref to know if a local page is handling its own audio
  const isDelegatedRef = useRef(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    const handleSwitch = async (e) => {
      const newTheme = e.detail;
      
      // ✨ THE DELEGATION MAGIC
      if (TRACKS[newTheme] === "DELEGATE") {
        isDelegatedRef.current = true;
        audioRef.current.pause(); // Shut up the global track
        window.dispatchEvent(new CustomEvent('syncAudioState', { detail: isPlayingRef.current }));
        return;
      }
      
      // If it's a normal lore page or the hub, take control back!
      isDelegatedRef.current = false;
      const newSrc = TRACKS[newTheme] || TRACKS.kshirsagar; 

      if (newSrc) {
        const wasPlaying = isPlayingRef.current;
        
        // Only load a new track if the URL actually changed
        if (!audioRef.current.src.includes(newSrc)) {
          if (playPromiseRef.current) {
            try { await playPromiseRef.current; } catch (err) {} 
          }
          audioRef.current.pause();
          audioRef.current.src = newSrc;
          audioRef.current.load();
        }
        
        // 🔴 THE FIX: Always force it to resume playing if the global sound button is ON!
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
      if (!isDelegatedRef.current) audioRef.current.pause(); // Only pause if not delegated
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (!isDelegatedRef.current) { // Only play global track if not delegated
        playPromiseRef.current = audioRef.current.play();
        playPromiseRef.current.catch(err => console.error("Audio blocked:", err));
      }
    }
    
    // ✨ BROADCAST THE BUTTON CLICK SO RAMA LORE CAN HEAR IT!
    window.dispatchEvent(new CustomEvent('syncAudioState', { detail: isPlayingRef.current }));
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