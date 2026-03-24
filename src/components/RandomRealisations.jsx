import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars, Sparkles, Environment } from '@react-three/drei';
import TheTrueFormula from './TheTrueFormula';
import TheSlowAntidote from './TheSlowAntidote';
import TheDominationProtocol from './TheDominationProtocol'; // 👈 IMPORTED CONSTRUCT 03
import { setGlobalMusic } from './GlobalAudio'; // 👈 ADD THIS IMPORT

// --------------------------------------------------------
// 🧠 MAIN VAULT (DOM + 3D Hybrid)
// --------------------------------------------------------
export default function RandomRealisations({ onBackToHub }) {
  const [activeTab, setActiveTab] = useState(null);

  // 1. Ref to track active tab inside the event listener
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // 2. The Hub-Level History Controller
  useEffect(() => {
    // Inject the Vault Hub into the phone's history so it doesn't close the app!
    window.history.pushState({ page: 'realisations-hub' }, '', '');

    const handlePopState = () => {
      if (activeTabRef.current) {
        setActiveTab(null); // Close the specific Construct, stay in the Grid
      } else {
        onBackToHub(); // You are in the Grid: Exit Vault safely!
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onBackToHub]);

  // 3. Safe Construct Opener
  // 1. THE SCROLL BANK & INJECTOR
  const savedScrollRef = useRef(0);

  const openConstruct = (id) => {
    savedScrollRef.current = window.scrollY; // Save the exact Grid position
    window.history.pushState({ view: id }, '', '');
    setActiveTab(id);
  };

  useEffect(() => {
    if (activeTab === null) {
      // Restore Grid scroll perfectly
      window.scrollTo({ top: savedScrollRef.current, behavior: 'instant' });
    } else {
      // Start Construct at the very top
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);
// 👈 ADD THIS EFFECT
  useEffect(() => {
    if (activeTab === null) {
      setGlobalMusic('vault_lobby');
    }
  }, [activeTab]);

  // 📦 THE 15 CARDS DATA
  const realisations = useMemo(() => [
    { id: 'formula', title: 'The True Formula', subtitle: 'Failure Dynamics', color: '#f59e0b', code: '7433 0297 3562 8869' },
    { id: 'antidote', title: 'The Slow Antidote', subtitle: 'Divine Apathy', color: '#8b5cf6', code: '8492 1048 2930 4011' },
    // 👇 CONSTRUCT 03 INTEGRATED HERE
    { id: 'domination', title: 'Domination Protocol', subtitle: 'System Override', color: '#e11d48', code: '0000 0110 0110 0110' }, 
    { id: 'loop', title: 'The Eternal Loop', subtitle: 'Plasma Convergence', color: '#06b6d4', code: '1093 4857 2930 4857' },
    { id: 'aeon', title: 'Whispering Aeon', subtitle: 'Rune Cluster', color: '#10b981', code: '5849 2039 4857 1029' },
    { id: 'symphony', title: 'Symphony of Failure', subtitle: 'Kinetic Breakdown', color: '#ec4899', code: '4857 2930 4857 2039' },
    { id: 'demon', title: 'Path of the Demon', subtitle: 'Indifferent Node', color: '#ef4444', code: '1029 3847 5647 3829' },
    { id: 'mirror', title: 'Mirror of Truth', subtitle: 'Distortional Layer', color: '#ffffff', code: '0000 1111 2222 3333' },
    { id: 'shadow', title: 'Shadow Logic', subtitle: 'Void Mechanics', color: '#334155', code: '9988 7766 5544 3322' },
    { id: 'binary', title: 'Binary Soul', subtitle: 'Digital Ghost', color: '#22c55e', code: '1010 0101 1010 0101' },
    { id: 'ghost', title: 'Neural Ghost', subtitle: 'Memory Echo', color: '#eab308', code: '4455 6677 8899 0011' },
    { id: 'rift', title: 'Quantum Rift', subtitle: 'Tear in Reality', color: '#3b82f6', code: '3344 5566 7788 9900' },
    { id: 'echo', title: 'Silent Echo', subtitle: 'Acoustic Void', color: '#a855f7', code: '1122 3344 5566 7788' },
    { id: 'fractal', title: 'Fractal Dream', subtitle: 'Infinite Loop', color: '#f43f5e', code: '9900 1122 3344 5566' },
    { id: 'pulse', title: 'Neon Pulse', subtitle: 'City Core', color: '#14b8a6', code: '7788 9900 1122 3344' },
  ], []);

 // 👇 CHANGED: onBack now tells the history stack to pop, which triggers the catcher above!
  if (activeTab === 'formula') return <TheTrueFormula onBack={() => window.history.back()} />;
  if (activeTab === 'antidote') return <TheSlowAntidote onBack={() => window.history.back()} />;
  if (activeTab === 'domination') return <TheDominationProtocol onBack={() => window.history.back()} />;

  return (
    <div className="relative w-full h-screen bg-[#030303] text-white font-sans overflow-hidden">
      
      {/* 🌌 LAYER 1: THE 3D BACKGROUND (Extremely Lightweight) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <Environment preset="city" environmentIntensity={0.1} />
          <Stars radius={100} depth={50} count={3000} factor={3} fade speed={1} />
          <Sparkles count={40} scale={20} size={1} speed={0.2} opacity={0.1} color="white" />
        </Canvas>
      </div>

      {/* 🖥️ LAYER 2: THE UI & SCROLLING GRID (Native DOM = Zero Lag) */}
      <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden">
        
        {/* HEADER */}
        <div className="sticky top-0 z-20 flex justify-between items-start p-8 md:p-12 bg-gradient-to-b from-[#030303] to-transparent pointer-events-none">
          <button 
            onClick={() => window.history.back()} // 👈 CHANGED
            className="pointer-events-auto group flex items-center gap-3 text-[10px] md:text-xs tracking-[0.4em] text-white/40 hover:text-white transition-all uppercase"
          >
            <span className="w-8 h-[1px] bg-white/40 group-hover:bg-white" />
            [ ESC ] EXIT VAULT
          </button>
          <div className="text-right">
            <h1 className="text-2xl md:text-4xl font-black tracking-widest text-white/90 uppercase">Cosmic Archive</h1>
            <p className="text-[9px] md:text-[10px] tracking-[0.6em] text-white/30 mt-2 uppercase">Volumetric Render: Offline / DOM: Online</p>
          </div>
        </div>

        {/* THE CARD GRID */}
        <div className="px-8 md:px-12 pb-24 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {realisations.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => openConstruct(item.id)}                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex flex-col justify-between w-full aspect-[1.6/1] p-6 rounded-2xl text-left overflow-hidden group transition-shadow hover:shadow-2xl"
                style={{
                  // The exact frosted glass + subtle color gradient from the bank cards
                  background: `linear-gradient(135deg, rgba(20,20,20,0.6) 0%, ${item.color}15 100%)`,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1px solid rgba(255,255,255,0.05)`,
                  borderBottom: `1px solid ${item.color}40`, // Subtle colored edge
                }}
              >
                {/* Background Glow Effect on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 80% 20%, ${item.color}, transparent 60%)` }}
                />

                {/* Top Row: Bank Name / Logo Area */}
                <div className="flex justify-between items-center w-full z-10">
                  <span className="text-[10px] tracking-[0.2em] font-medium opacity-50 uppercase">
                    Construct 0{index + 1}
                  </span>
                  <div className="w-6 h-6 rounded-full opacity-30 flex items-center justify-center border border-white/20">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                </div>

                {/* Middle Row: The "Credit Card" Number & Title */}
                <div className="z-10 mt-auto mb-6">
                  <p className="font-mono text-[14px] tracking-[0.2em] opacity-80 mb-4 text-white/60">
                    {item.code}
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 leading-none">
                    {item.title}
                  </h2>
                </div>

                {/* Bottom Row: Cardholder / Meta Data */}
                <div className="flex justify-between items-end w-full z-10">
                  <div>
                    <p className="text-[8px] tracking-widest opacity-30 uppercase mb-1">Subject Matter</p>
                    <p className="text-[10px] tracking-wider opacity-70 uppercase font-medium">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] tracking-widest opacity-30 uppercase mb-1">Status</p>
                    <p className="text-[10px] tracking-wider opacity-70 uppercase font-mono" style={{ color: item.color }}>OPTIMIZED</p>
                  </div>
                </div>
              </motion.button>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}