import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 🌌 STAR GENERATOR
function generateStars(numPoints) {
  const positions = new Float32Array(numPoints * 3);
  for (let i = 0; i < numPoints; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40; 
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  return { positions };
}

// 🌠 SCROLL-REACTIVE STARFIELD
const FlyingStars = ({ smoothProgress }) => {
  const ref = useRef();
  const [stars] = useState(() => generateStars(5000));
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.02;
      ref.current.rotation.x -= delta * 0.01;
      const scrollZ = smoothProgress.get() * 30; // Fly through stars as you scroll!
      ref.current.position.z = scrollZ;
    }
  });

  return (
    <Points ref={ref} positions={stars.positions} stride={3}>
      <PointMaterial transparent size={0.03} color="#ffffff" opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
    </Points>
  );
};

export default function IntroSequence({ onUnlock, startAtBottom }) {
  const containerRef = useRef(null);
  
  // 🔥 FIX: A tiny 50ms timeout ensures Lenis renders the page height before resetting!
  useEffect(() => {
    setTimeout(() => {
      if (startAtBottom) {
        window.scrollTo(0, document.body.scrollHeight);
      } else {
        window.scrollTo(0, 0);
      }
    }, 50);
  }, [startAtBottom]);

  // 🔥 NEW: Smooth scroll directly to the choices!
  const handleSkip = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 20, damping: 40, mass: 3 });

  const clipPath = useTransform(smoothProgress, [0, 0.03, 0.08], ["inset(50% 50% 50% 50%)", "inset(49.8% 0% 49.8% 0%)", "inset(0% 0% 0% 0%)"]);
  const promptOpacity = useTransform(smoothProgress, [0, 0.03], [1, 0]);

  // The Expanded Story Beats 
  const text1Opacity = useTransform(smoothProgress, [0.08, 0.12, 0.15, 0.18], [0, 1, 1, 0]);
  const text2Opacity = useTransform(smoothProgress, [0.20, 0.24, 0.27, 0.30], [0, 1, 1, 0]);
  const brahmaOpacity = useTransform(smoothProgress, [0.32, 0.36, 0.39, 0.42], [0, 1, 1, 0]);
  const vishnuOpacity = useTransform(smoothProgress, [0.44, 0.48, 0.51, 0.54], [0, 1, 1, 0]);
  const shivaOpacity = useTransform(smoothProgress, [0.56, 0.60, 0.63, 0.66], [0, 1, 1, 0]);
  const kalyug1Opacity = useTransform(smoothProgress, [0.68, 0.72, 0.75, 0.78], [0, 1, 1, 0]);
  const kalyug2Opacity = useTransform(smoothProgress, [0.80, 0.84, 0.87, 0.90], [0, 1, 1, 0]);
  const choiceOpacity = useTransform(smoothProgress, [0.92, 0.96, 1], [0, 1, 1]);

  return (
    <div ref={containerRef} className="relative w-full h-[1500vh] bg-[#010101]">
      
      {/* 🔥 NEW: Skip Intro Button */}
      {!startAtBottom && (
        <button onClick={handleSkip} className="fixed top-6 right-6 z-50 px-4 md:px-6 py-2 border border-white/20 rounded-full text-white/70 text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/10 hover:text-white transition-all backdrop-blur-md cursor-pointer shadow-lg">
          ⏭ Skip Intro
        </button>
      )}

      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        <motion.div style={{ opacity: promptOpacity }} className="absolute z-30 flex flex-col items-center pointer-events-none">
          <h1 className="text-[#fbbf24] text-xs md:text-sm tracking-[0.8em] uppercase font-light drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] mb-8">The Cosmic Origin</h1>
          <p className="text-white/40 text-[10px] tracking-[0.5em] animate-pulse uppercase">Scroll slowly to awaken ↓</p>
        </motion.div>

        <motion.div style={{ clipPath }} className="absolute inset-0 z-10 w-full h-full bg-[#020202] flex items-center justify-center shadow-[0_0_100px_rgba(251,191,36,0.1)]">
          <div className="absolute inset-0 z-0"><Canvas camera={{ position: [0, 0, 5], fov: 60 }}><FlyingStars smoothProgress={smoothProgress} /></Canvas></div>
          
          {/* ... ALL OF YOUR EXACT SAME TEXT BLOCKS GO HERE! ... */}
          
          {/* Just to keep the code block clean, keep your existing text beats and buttons exactly as they were here! */}
          <motion.div style={{ opacity: text1Opacity }} className="absolute z-10 flex flex-col items-center text-center px-6 pointer-events-none">
             <h2 className="text-white/50 text-xl md:text-3xl font-serif uppercase tracking-[0.4em] mb-4">Before time existed, there was only</h2>
             <h1 className="text-white text-5xl md:text-8xl font-serif uppercase tracking-[0.5em] drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">Brahman</h1>
             <p className="text-[#fbbf24]/70 mt-6 text-xs md:text-sm tracking-[0.5em] uppercase font-light">The formless, infinite void.</p>
          </motion.div>

          <motion.div style={{ opacity: text2Opacity }} className="absolute z-10 flex flex-col items-center text-center px-6 pointer-events-none">
             <h1 className="text-[8rem] md:text-[12rem] text-[#fbbf24] drop-shadow-[0_0_60px_rgba(251,191,36,0.8)] font-serif leading-none m-0">🕉</h1>
             <h2 className="text-white text-2xl md:text-4xl font-serif uppercase tracking-[0.4em] mt-8 leading-relaxed">From the primordial vibration,<br/> consciousness splintered into <span className="text-[#00ccff] font-bold">three</span>.</h2>
          </motion.div>

          <motion.div style={{ opacity: brahmaOpacity }} className="absolute z-10 flex flex-col items-center text-center px-6 pointer-events-none">
             <p className="text-[#ff3366] text-xs tracking-[0.6em] uppercase font-bold mb-4">The Architect</p>
             <h1 className="text-white text-6xl md:text-8xl font-serif uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,51,102,0.4)]">Brahma</h1>
             <p className="text-white/60 mt-6 max-w-lg text-sm md:text-base tracking-widest leading-loose font-light">Born from a golden lotus, he writes the code of physical reality.</p>
          </motion.div>

          <motion.div style={{ opacity: vishnuOpacity }} className="absolute z-10 flex flex-col items-center text-center px-6 pointer-events-none">
             <p className="text-[#00ccff] text-xs tracking-[0.6em] uppercase font-bold mb-4">The Preserver</p>
             <h1 className="text-white text-6xl md:text-8xl font-serif uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(0,204,255,0.4)]">Vishnu</h1>
             <p className="text-white/60 mt-6 max-w-lg text-sm md:text-base tracking-widest leading-loose font-light">Resting on the cosmic ocean, he maintains the delicate balance of Dharma.</p>
          </motion.div>

          <motion.div style={{ opacity: shivaOpacity }} className="absolute z-10 flex flex-col items-center text-center px-6 pointer-events-none">
             <p className="text-[#b026ff] text-xs tracking-[0.6em] uppercase font-bold mb-4">The Transformer</p>
             <h1 className="text-white text-6xl md:text-8xl font-serif uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(176,38,255,0.4)]">Shiva</h1>
             <p className="text-white/60 mt-6 max-w-lg text-sm md:text-base tracking-widest leading-loose font-light">The ultimate meditator. He dissolves the illusion of Maya.</p>
          </motion.div>

          <motion.div style={{ opacity: kalyug1Opacity }} className="absolute z-10 flex flex-col items-center text-center px-6 pointer-events-none">
             <h1 className="text-white/90 text-3xl md:text-5xl uppercase tracking-[0.4em] font-serif text-center max-w-4xl leading-relaxed drop-shadow-2xl">
               But when everything goes berserk <br/><span className="text-[#ff2a00] font-bold">in this Kalyug...</span>
             </h1>
          </motion.div>

          <motion.div style={{ opacity: kalyug2Opacity }} className="absolute z-10 flex flex-col items-center text-center px-6 pointer-events-none">
             <h1 className="text-white/90 text-2xl md:text-4xl uppercase tracking-[0.4em] font-serif text-center max-w-4xl leading-relaxed drop-shadow-2xl">
               Our history became a myth <br/><span className="text-white/50">and belief in God started to fade...</span>
             </h1>
          </motion.div>

          <motion.div style={{ opacity: choiceOpacity }} className="absolute z-10 flex flex-col items-center text-center px-6 pointer-events-auto w-full max-w-5xl">
             <h2 className="text-[#fbbf24] text-xl md:text-3xl font-serif uppercase tracking-[0.4em] drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
               Who do you take as your Soul Guide?
             </h2>
             <p className="text-white/60 text-[10px] md:text-sm tracking-[0.3em] uppercase max-w-lg leading-relaxed mt-4 mb-16">
               To dive deep into yourself and discover a power you never imagined you had.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
               
               <button onClick={() => onUnlock('brahma')} className="group relative w-full h-32 md:h-56 border border-[#ff3366]/50 bg-black/50 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-[#ff3366] hover:shadow-[0_0_40px_rgba(255,51,102,0.3)] transition-all duration-500 cursor-pointer">
                 <div className="absolute inset-0 bg-gradient-to-t from-[#ff3366]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <h3 className="text-white text-xl md:text-2xl font-serif uppercase tracking-widest z-10 drop-shadow-[0_0_10px_rgba(255,51,102,0.8)]">Brahma</h3>
                 <p className="text-[#ff3366] text-[10px] tracking-[0.3em] mt-2 z-10 uppercase font-bold">The Path of Creation</p>
               </button>

               <button onClick={() => onUnlock('vishnu')} className="group relative w-full h-32 md:h-56 border border-[#00ccff]/50 bg-black/50 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-[#00ccff] hover:shadow-[0_0_40px_rgba(0,204,255,0.3)] transition-all duration-500 cursor-pointer">
                 <div className="absolute inset-0 bg-gradient-to-t from-[#00ccff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <h3 className="text-white text-xl md:text-2xl font-serif uppercase tracking-widest z-10 drop-shadow-[0_0_10px_rgba(0,204,255,0.8)]">Vishnu</h3>
                 <p className="text-[#00ccff] text-[10px] tracking-[0.3em] mt-2 z-10 uppercase font-bold">The Path of Preservation</p>
               </button>

               <button onClick={() => onUnlock('shiva')} className="group relative w-full h-32 md:h-56 border border-[#b026ff]/50 bg-black/50 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center overflow-hidden hover:border-[#b026ff] hover:shadow-[0_0_40px_rgba(176,38,255,0.3)] transition-all duration-500 cursor-pointer">
                 <div className="absolute inset-0 bg-gradient-to-t from-[#b026ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <h3 className="text-white text-xl md:text-2xl font-serif uppercase tracking-widest z-10 drop-shadow-[0_0_10px_rgba(176,38,255,0.8)]">Shiva</h3>
                 <p className="text-[#b026ff] text-[10px] tracking-[0.3em] mt-2 z-10 uppercase font-bold">The Path of Liberation</p>
               </button>

             </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}