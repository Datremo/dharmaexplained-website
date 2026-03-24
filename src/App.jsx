import React, { useState, useEffect } from 'react';
import Lenis from 'lenis'; 
import AutoScroller from './components/AutoScroller';
import IntroSequence from './components/IntroSequence';
import WeaponShowcase from './components/WeaponShowcase';
import CosmicHub from './components/CosmicHub'; 
import GlobalAudio from './components/GlobalAudio';
// ✨ IMPORT THE NEW LOBBY ✨
import RandomRealisations from './components/RandomRealisations'; 
import EmergencyOverride from './components/EmergencyOverride';

export default function App() {
  const [view, setView] = useState('intro');
  const [guide, setGuide] = useState(null); 
  const [skipIntro, setSkipIntro] = useState(false); 

// 1. THE MASTER SCROLL ENGINE (Runs strictly ONCE)
  useEffect(() => {
    const lenis = new Lenis({ 
      lerp: 0.05, 
      smoothTouch: true 
    });
    
    window.lenis = lenis; // 👈 THE MAGIC KEY: Expose Lenis to the entire app!

    let rafId;
    function raf(time) { 
      lenis.raf(time); 
      rafId = requestAnimationFrame(raf); 
    }
    rafId = requestAnimationFrame(raf);
    
    return () => { 
      cancelAnimationFrame(rafId);
      lenis.destroy(); 
      delete window.lenis; // Clean up when unmounting
    };
  }, []);

  const handleUnlock = (chosenGuide) => {
    setGuide(chosenGuide);
    setView('showcase');
  };

  const handleBackToSelection = () => {
    setSkipIntro(true); 
    setView('intro');
  };

  const handleSkipToAvatars = () => {
    setGuide('vishnu'); 
    setView('hub');     
  };

  // 🧠 ✨ THE NEW VAULT TELEPORT FUNCTION
  const handleOpenVault = () => {
    setView('realisations');
  };

// 🚨 THE KILLSWITCH TELEPORT FUNCTION
  const handleEmergency = () => {
    setView('emergency');
  };
return (
    <div className="w-full min-h-screen bg-[#010101] text-white selection:bg-[#fbbf24]/30">
      <GlobalAudio />
      <AutoScroller />
      {view === 'intro' && (
        <IntroSequence 
          onUnlock={handleUnlock} 
          startAtBottom={skipIntro} 
          onSkipToAvatars={handleSkipToAvatars} 
          onOpenVault={handleOpenVault}
          onEmergency={handleEmergency} // 👈 Pass it down to the intro screen!
        />
      )}

      {view === 'showcase' && guide && (
        <WeaponShowcase 
          guide={guide} 
          onBack={handleBackToSelection} 
          onEnterHub={() => setView('hub')}
        />
      )}

      {view === 'hub' && guide === 'vishnu' && (
        <CosmicHub onBack={() => setView('showcase')} />
      )}

      {/* 🌌 RENDER THE VAULT WHEN ACTIVE */}
      {view === 'realisations' && (
        <RandomRealisations onBackToHub={handleBackToSelection} />
      )}

      {/* 🚨 RENDER THE KILLSWITCH WHEN ACTIVE 🚨 */}
      {view === 'emergency' && (
        <EmergencyOverride 
          onExit={() => setView('intro')} 
          onEnterOjas={() => {
            setGuide('vishnu'); // Make sure they are in Vishnu's Hub
            setView('hub'); // Teleport to Hub
            // ⚡ Fire a global event to tell the Hub to instantly open Ojas!
            setTimeout(() => window.dispatchEvent(new Event('openOjas')), 100);
          }}
        />
      )}

    </div>
  );
}