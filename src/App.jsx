import React, { useState, useEffect } from 'react';
import Lenis from 'lenis'; 

import IntroSequence from './components/IntroSequence';
import WeaponShowcase from './components/WeaponShowcase';
import CosmicHub from './components/CosmicHub'; 
import GlobalAudio from './components/GlobalAudio';
// ✨ IMPORT THE NEW LOBBY ✨
import RandomRealisations from './components/RandomRealisations'; 


export default function App() {
  const [view, setView] = useState('intro');
  const [guide, setGuide] = useState(null); 
  const [skipIntro, setSkipIntro] = useState(false); 

  // The Master Scroll Engine
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.05, smoothTouch: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); };
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

  return (
    <div className="w-full min-h-screen bg-[#010101] text-white selection:bg-[#fbbf24]/30">
      <GlobalAudio />
      
      {view === 'intro' && (
        <IntroSequence 
          onUnlock={handleUnlock} 
          startAtBottom={skipIntro} 
          onSkipToAvatars={handleSkipToAvatars} 
          onOpenVault={handleOpenVault} // 👈 Pass it down to the intro screen!
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

    </div>
  );
}