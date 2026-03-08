import React, { useState, useEffect } from 'react';
import Lenis from 'lenis'; 

import IntroSequence from './components/IntroSequence';
import WeaponShowcase from './components/WeaponShowcase';
import CosmicHub from './components/CosmicHub'; 

export default function App() {
  const [view, setView] = useState('intro');
  const [guide, setGuide] = useState(null); 
  const [skipIntro, setSkipIntro] = useState(false); // 🔥 NEW: Remembers if they already watched it!

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
    setSkipIntro(true); // 🔥 Automatically skip intro when returning!
    setView('intro');
  };

  return (
    <div className="w-full min-h-screen bg-[#010101] text-white selection:bg-[#fbbf24]/30">
      
      {/* Pass the startAtBottom prop! */}
      {view === 'intro' && (
        <IntroSequence onUnlock={handleUnlock} startAtBottom={skipIntro} />
      )}

      {view === 'showcase' && guide && (
        <WeaponShowcase 
          guide={guide} 
          onBack={handleBackToSelection} // Trigger the smart back button
          onEnterHub={() => setView('hub')}
        />
      )}

      {view === 'hub' && guide === 'vishnu' && (
        <CosmicHub onBack={() => setView('showcase')} />
      )}

    </div>
  );
}