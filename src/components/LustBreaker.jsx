import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Sphere, Torus, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, Glitch } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import CinematicCursor from './CinematicCursor';
import { setGlobalMusic } from './GlobalAudio'; // At the top

// --------------------------------------------------------
// 🔥 THE 3D ENGINE: TRANSMUTATION OF OJAS
// --------------------------------------------------------
const OjasCoreScene = ({ scrollProgress, isMobile }) => {
  const brokenCoreRef = useRef();
  const healedCoreRef = useRef();
  const auraRingRef = useRef();

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    // 🩸 Phase 1: The Broken Core 
    if (brokenCoreRef.current) {
      brokenCoreRef.current.rotation.x -= delta * (scroll < 0.4 ? 2 : 0.5);
      brokenCoreRef.current.rotation.y -= delta * (scroll < 0.4 ? 3 : 0.5);
      
      // Shakes violently while leaking, stabilizes sooner
      if (scroll < 0.35) {
        brokenCoreRef.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.05;
      } else {
        brokenCoreRef.current.position.x = THREE.MathUtils.lerp(brokenCoreRef.current.position.x, 0, delta * 5);
      }

      // ✨ Fades out completely when recovery begins (0.40)
      const targetOpacity = scroll > 0.40 ? 0 : 0.8;
      brokenCoreRef.current.material.opacity = THREE.MathUtils.lerp(brokenCoreRef.current.material.opacity, targetOpacity, delta * 3);
    }

    // 💎 Phase 2: The Healed Core 
    if (healedCoreRef.current) {
      healedCoreRef.current.rotation.y += delta * 0.5;
      
      let targetScale = 0.1;
      if (scroll > 0.4 && scroll < 0.85) targetScale = 1.0; 
      if (scroll >= 0.85) targetScale = 1.5; 

      healedCoreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);
      
      // ✨ Opacity fades in precisely when Step 1 begins (0.40)
      const active = scroll > 0.39 ? 1 : 0;
      healedCoreRef.current.material.opacity = THREE.MathUtils.lerp(healedCoreRef.current.material.opacity, active, delta * 2);
    }

    // 🌀 Phase 3: The Aura
    if (auraRingRef.current) {
      auraRingRef.current.rotation.x = Math.PI / 2;
      auraRingRef.current.rotation.z += delta * 1.5;
      const ringActive = scroll > 0.88 ? 1 : 0;
      auraRingRef.current.material.opacity = THREE.MathUtils.lerp(auraRingRef.current.material.opacity, ringActive, delta * 2);
      
      let ringScale = scroll > 0.88 ? 2.5 : 0.1;
      auraRingRef.current.scale.lerp(new THREE.Vector3(ringScale, ringScale, ringScale), delta * 2);
    }
  });

  const [leakOpacity, setLeakOpacity] = useState(1);
  const [ascendOpacity, setAscendOpacity] = useState(0);

  useFrame(() => {
    const p = scrollProgress.get();
    // ✨ Particles transition precisely at Step 1 (0.40)
    setLeakOpacity(p < 0.40 ? 1 : 0); 
    setAscendOpacity(p > 0.39 ? 1 : 0); 
  });

  return (
    // ✨ MOBILE FIX: Push the glowing core to the right on mobile so it doesn't overlap text.
    <group position={[isMobile ? 1 : 0, 0, -5]}>
      <Icosahedron ref={brokenCoreRef} args={[isMobile ? 1.5 : 2, 0]}>
        <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={2} wireframe transparent opacity={0.8} />
      </Icosahedron>
      <Sphere ref={healedCoreRef} args={[isMobile ? 1 : 1.2, 32, 32]}>
        <meshStandardMaterial color="#0ea5e9" emissive="#38bdf8" emissiveIntensity={2} transparent opacity={0} />
      </Sphere>
      <Torus ref={auraRingRef} args={[1, 0.02, 16, 100]}>
        <meshStandardMaterial color="#e0f2fe" emissive="#bae6fd" emissiveIntensity={3} transparent opacity={0} />
      </Torus>

      <Sparkles count={isMobile ? 50 : 100} scale={10} size={isMobile ? 3 : 5} speed={0.8} color="#ef4444" opacity={leakOpacity} noise={1} position={[0, -2, 0]} />
      <Sparkles count={isMobile ? 80 : 150} scale={15} size={isMobile ? 2 : 4} speed={0.5} color="#38bdf8" opacity={ascendOpacity} position={[0, 2, 0]} />
    </group>
  );
};

const SceneLights = ({ scrollProgress }) => {
  const ambientRef = useRef();
  const pointRef = useRef();

  useFrame(() => {
    const p = scrollProgress.get();
    let color = new THREE.Color("#1a0000"); 
    let intensity = 1.0;

    // ✨ Lightning shifts precisely at Step 1 (0.40)
    if (p > 0.40 && p < 0.85) {
      color = new THREE.Color("#b45309"); // Golden Penance starts immediately at Step 1
      intensity = 2.0;
    } else if (p >= 0.85) {
      color = new THREE.Color("#0284c7"); 
      intensity = 5.0;
    }

    if (ambientRef.current) ambientRef.current.color.lerp(color, 0.1);
    if (pointRef.current) {
      pointRef.current.color.lerp(color, 0.1);
      pointRef.current.intensity = THREE.MathUtils.lerp(pointRef.current.intensity, intensity, 0.1);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} />
      <pointLight ref={pointRef} position={[0, 0, 5]} distance={50} />
    </>
  );
};

const MentalStateEffects = ({ scrollProgress, isMobile }) => {
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(true);

  useEffect(() => setMounted(true), []);

  useFrame(() => {
    const p = scrollProgress.get();
    // Brain fog stops precisely when recovery begins (0.40)
    setGlitchActive(p < 0.40); 
  });

  if (!mounted || isMobile) return null;

  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.2} intensity={2.0} mipmapBlur={false} />
      <Noise opacity={0.3} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.4} darkness={0.8} />
      {glitchActive && (
        <Glitch delay={[1.5, 3.5]} duration={[0.2, 0.4]} strength={[0.01, 0.03]} active={glitchActive} ratio={0.5} />
      )}
    </EffectComposer>
  );
};

// --------------------------------------------------------
// ⚔️ MAIN EDITORIAL COMPONENT
// --------------------------------------------------------
export default function LustBreaker({ onBack, onAscend, onSwitchProtocol }) { 
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => { 
    window.scrollTo(0, 0); 
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
 useEffect(() => { 
    window.scrollTo(0, 0);
    setGlobalMusic('lustbreaker'); 
    // Notice how we DO NOT return a cleanup function for the music here!
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

  const bgColor = useTransform(sp, 
    [0.0, 0.3, 0.40, 0.65, 0.85, 0.95, 1.0], 
    ["#0a0000", "#1a0505", "#0f0800", "#0f0800", "#0f172a", "#020617", "#000000"]
  );

  // 🎬 32-SCENE HIGH-IMPACT ENGINE
  const o = (start, peak1, peak2, end) => useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  
  const s1  = o(0.00, 0.01, 0.02, 0.03); 
  const s2  = o(0.03, 0.04, 0.05, 0.06); 
  const s3  = o(0.06, 0.07, 0.08, 0.09); 
  const s4  = o(0.09, 0.10, 0.11, 0.12); 
  const s5  = o(0.12, 0.13, 0.14, 0.15); 
  const s6  = o(0.15, 0.16, 0.17, 0.18); 
  const s7  = o(0.18, 0.19, 0.20, 0.21); 
  const s8  = o(0.21, 0.22, 0.23, 0.24); 
  const s9  = o(0.24, 0.25, 0.26, 0.27); 
  const s10 = o(0.27, 0.28, 0.29, 0.30); 
  const s11 = o(0.30, 0.31, 0.32, 0.33); 
  const s12 = o(0.33, 0.34, 0.35, 0.36); 
  const s13 = o(0.36, 0.37, 0.38, 0.39); 
  const s14 = o(0.39, 0.40, 0.41, 0.42); 
  
  // ✨ HOPE SCENE (0.42)
  const s15 = o(0.42, 0.43, 0.44, 0.45); 
  const s16 = o(0.45, 0.46, 0.47, 0.48); 
  const s17 = o(0.48, 0.49, 0.50, 0.51); 
  const s18 = o(0.51, 0.52, 0.53, 0.54); 
  const s19 = o(0.54, 0.55, 0.56, 0.57); 
  
  // THE TIMELINE LINE DRAW (Starts at Scene 20, ends at Scene 27)
  const timelineLineDraw = useTransform(sp, [0.57, 0.81], ["0%", "100%"]);
  
  const s20 = o(0.57, 0.58, 0.59, 0.60); 
  const s21 = o(0.60, 0.61, 0.62, 0.63); 
  const s22 = o(0.63, 0.64, 0.65, 0.66); 
  const s23 = o(0.66, 0.67, 0.68, 0.69); 
  const s24 = o(0.69, 0.70, 0.71, 0.72); 
  const s25 = o(0.72, 0.73, 0.74, 0.75); 
  const s26 = o(0.75, 0.76, 0.77, 0.78); 
  const s27 = o(0.78, 0.79, 0.80, 0.81); 
  const s28 = o(0.81, 0.82, 0.83, 0.84); 
  const s29 = o(0.84, 0.85, 0.86, 0.87); 
  const s30 = o(0.87, 0.88, 0.89, 0.90); 
  const s31 = o(0.90, 0.91, 0.92, 0.93); 
  const s32 = useTransform(sp, [0.93, 0.95, 1, 1], [0, 1, 1, 1]); 

  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  
  // ✨ MOBILE FIX: Increase text offsetting to clear the moved core.
  const offsetLeft = isMobile ? "2vw" : "15vw";
  const offsetRight = isMobile ? "-2vw" : "-15vw";
  
  const isMobileDescAlign = isMobile ? "items-start text-left" : "items-center text-center";

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[3200vh] font-sans text-white">
      <div className="hidden md:block"><CinematicCursor /></div>
{/* ⚡ PREMIUM GLASSMORPHIC PROTOCOL SWITCHER */}
      <div 
        className="fixed top-6 right-6 z-[100] flex flex-col items-end"
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        
        {/* THE ACTIVE PILL BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative px-5 md:px-6 py-2.5 bg-black/20 border border-white/10 rounded-full text-white/90 text-[10px] md:text-xs tracking-[0.2em] uppercase backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer flex items-center gap-3 md:gap-4 transition-colors hover:border-[#fbbf24]/50 hover:bg-black/40 overflow-hidden group"
        >
          {/* Subtle animated gradient inside the button */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fbbf24]/10 to-transparent -translate-x-full group-hover:animate-[glint_2s_ease-in-out_infinite]" />
          
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fbbf24] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,1)]"></span>
          </span>
          <span className="relative z-10 font-medium">Protocol OS</span> 
          <motion.span 
            animate={{ rotate: isMenuOpen ? 180 : 0 }} 
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-[8px] opacity-50 relative z-10"
          >
            ▼
          </motion.span>
        </motion.button>
        
        {/* THE GLASS DROPDOWN PANEL */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-14 right-0 w-64 md:w-72 origin-top-right"
            >
              {/* Ultra-Blur Container */}
              <div className="bg-[#050505]/40 border border-white/10 rounded-3xl backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden p-2 relative">
                
                {/* Internal Glow Effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#fbbf24] rounded-full blur-[80px] opacity-20 pointer-events-none" />

                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-[8px] font-mono tracking-[0.4em] text-white/40 uppercase">Select Override Phase</p>
                </div>

                <div className="flex flex-col gap-1">
                  {[
                    { id: 'lustbreaker', num: '01', name: 'Urge Killer', color: 'group-hover:text-[#ef4444]', border: 'group-hover:border-[#ef4444]/30' },
                    { id: 'mayaprotocol', num: '02', name: 'Shatter Maya', color: 'group-hover:text-[#b026ff]', border: 'group-hover:border-[#b026ff]/30' },
                    { id: 'neuralreality', num: '03', name: 'Brain Science', color: 'group-hover:text-[#00ccff]', border: 'group-hover:border-[#00ccff]/30' },
                    { id: 'lifesaverprotocol', num: '04', name: 'Tactical Guide', color: 'group-hover:text-white', border: 'group-hover:border-white/30' },
                    { id: 'karmaprotocol', num: '05', name: 'The Oath', color: 'group-hover:text-[#fbbf24]', border: 'group-hover:border-[#fbbf24]/30' }
                  ].map((protocol) => (
                    <button 
                      key={protocol.id}
                      onClick={() => onSwitchProtocol(protocol.id)}
                      className="group w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Left side: Num & Name */}
                      <div className="flex items-center gap-4 z-10">
                        <span className="font-mono text-[9px] tracking-widest text-white/30 transition-colors">
                          {protocol.num}
                        </span>
                        <span className={`font-sans text-xs tracking-widest uppercase text-white/70 transition-colors ${protocol.color}`}>
                          {protocol.name}
                        </span>
                      </div>
                      
                      {/* Right side: Animated Arrow */}
                      <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10 text-white/50 text-xs">
                        &rarr;
                      </span>

                      {/* Subtle hover background border pulse */}
                      <div className={`absolute inset-0 border border-transparent rounded-2xl transition-colors ${protocol.border}`} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button onClick={onBack} className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] px-4 md:px-6 py-2 border border-white/50 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/20 transition-all mix-blend-difference text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        &larr; Retreat
      </button>

      {/* 3D CANVAS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, isMobile ? 12 : 8], fov: 60 }}>
          <SceneLights scrollProgress={sp} />
          <OjasCoreScene scrollProgress={sp} isMobile={isMobile} />
          <MentalStateEffects scrollProgress={sp} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* 🛤️ THE VERTICAL RECOVERY TIMELINE UI */}
      <div className="fixed inset-0 z-0 flex justify-center pointer-events-none">
        <motion.div 
          className="w-[2px] md:w-[4px] bg-gradient-to-b from-[#fbbf24] via-[#38bdf8] to-transparent shadow-[0_0_20px_rgba(56,189,248,0.8)]"
          style={{ height: timelineLineDraw, originY: 0 }}
        />
      </div>

      {/* EDITORIAL HTML LAYER */}
      <motion.div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* SCENE 1: The Hook */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.03) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-sm md:text-xl font-mono tracking-[0.4em] text-[#ef4444] mb-4">PROTOCOL: BRAHMACHARYA</h1>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-tight drop-shadow-2xl">
            The Lust Breaker.
          </h2>
        </motion.div>

        {/* SCENE 2: The Hook Subtext */}
        <motion.div style={{ opacity: s2, y: driftDown(0.03, 0.06) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white/90 max-w-3xl leading-relaxed">
            A digital weapon is being used against you.<br/><br/>
            <span className="text-[#ef4444] not-italic font-bold tracking-widest uppercase text-xl md:text-3xl">Designed to keep you weak, distracted, and docile.</span>
          </p>
        </motion.div>

        {/* SCENE 3: The Leak */}
        <motion.div style={{ opacity: s3, y: driftUp(0.06, 0.09) }} className="absolute inset-0 flex flex-col justify-center px-6 md:px-24">
          <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-none text-[#dc2626]/20 absolute top-1/2 -translate-y-1/2 whitespace-nowrap">THE LEAK</h1>
          <h2 className="text-4xl md:text-7xl font-light uppercase tracking-widest max-w-4xl relative z-10 text-white">
            You are trading your <span className="text-[#dc2626] font-bold">legacy</span> for pixels.
          </h2>
        </motion.div>

        {/* SCENE 4: Neural Decay Intro */}
        <motion.div style={{ opacity: s4, y: driftDown(0.09, 0.12) }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-xl md:text-3xl font-black uppercase tracking-[0.3em] text-[#dc2626] mb-4">I. The Neural Decay</h3>
          <h2 className="text-3xl md:text-6xl font-serif text-white max-w-3xl leading-tight drop-shadow-lg">
            Every cheap indulgence floods your brain with unearned dopamine.
          </h2>
        </motion.div>

        {/* SCENE 5: Neural Decay Detail */}
        <motion.div style={{ opacity: s5, y: driftUp(0.12, 0.15) }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest text-white max-w-3xl leading-tight">
            Your androgen receptors <br/><span className="text-[#ef4444] font-black">down-regulate.</span>
          </h2>
          <p className="text-xl md:text-3xl font-serif italic text-white/70 mt-6 max-w-2xl">
            The grey matter in your prefrontal cortex—the exact center of discipline and logic—physically shrinks. You lose your drive.
          </p>
        </motion.div>

        {/* SCENE 6: Biological Tax Intro */}
        <motion.div style={{ opacity: s6, y: driftDown(0.15, 0.18) }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-xl md:text-3xl font-black uppercase tracking-[0.3em] text-[#dc2626] mb-4">II. The Biological Tax</h3>
          <h2 className="text-3xl md:text-6xl font-serif text-white max-w-4xl leading-tight drop-shadow-lg">
            You are bleeding out the essential building blocks of a man.
          </h2>
        </motion.div>

        {/* SCENE 7: Biological Tax Detail */}
        <motion.div style={{ opacity: s7, y: driftUp(0.18, 0.21) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#ef4444] leading-none mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
            ZINC.<br/>MAGNESIUM.<br/>RAW TESTOSTERONE.
          </h1>
          <p className="text-2xl md:text-4xl font-light tracking-widest text-white uppercase bg-black/50 px-6 py-2 border border-[#ef4444]/30">
            Flushed down the drain.
          </p>
        </motion.div>

        {/* SCENE 8: Prana Intro */}
        <motion.div style={{ opacity: s8, y: driftDown(0.21, 0.24) }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-xl md:text-3xl font-black uppercase tracking-[0.3em] text-[#dc2626] mb-4">III. The Loss of Prana</h3>
          <h2 className="text-4xl md:text-7xl font-serif italic text-white max-w-4xl leading-tight">
            Your aura weakens. Your eyes lose their piercing focus.
          </h2>
        </motion.div>

        {/* SCENE 9: Prana Detail */}
        <motion.div style={{ opacity: s9, y: driftUp(0.24, 0.27) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest text-white max-w-4xl leading-relaxed">
            You become invisible in a room.<br/><br/>
            <span className="text-[#dc2626] font-black">A ghost. A slave to the flesh.</span>
          </h2>
        </motion.div>

        {/* SCENE 10: Missing Reality */}
        <motion.div style={{ opacity: s10, y: driftDown(0.27, 0.30) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-7xl font-black tracking-[0.2em] uppercase text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-8">
            WHAT YOU ARE MISSING:
          </h1>
          {/* ✨ MOBILE FIX: Align left on mobile so it doesn't overlap the moved core. */}
          <div className={`flex flex-col gap-4 text-2xl md:text-5xl font-light tracking-widest uppercase text-[#ef4444] ${isMobileDescAlign} px-6 md:px-0`}>
            <span>The Physique.</span>
            <span>The Empire.</span>
            <span>The Respect.</span>
            <span className="text-white font-serif italic mt-4">The ability to retire your mother.</span>
          </div>
        </motion.div>

        {/* SCENE 11: The Mirror Intro */}
        <motion.div style={{ opacity: s11, y: driftUp(0.30, 0.33) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
          <h2 className="text-3xl md:text-6xl font-serif italic text-white drop-shadow-md">
            Look into the mirror of time.
          </h2>
          <div className="w-[1px] h-32 bg-gradient-to-b from-white to-transparent mt-12" />
        </motion.div>

        {/* SCENE 12: Zero Timeline */}
        <motion.div style={{ opacity: s12, y: driftDown(0.33, 0.36) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h3 className="text-[#dc2626] text-lg md:text-2xl font-mono tracking-[0.4em] mb-6 bg-black/60 px-4 py-2 border border-[#dc2626]/30">TIMELINE A: THE SLAVE</h3>
          <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-widest leading-tight text-white/50 mb-6">
            Social Anxiety.<br/>Brain Fog.
          </h1>
          <p className="text-xl md:text-3xl font-serif italic text-white/40 tracking-[0.1em] max-w-3xl">
            A body that never reaches its genetic potential. Watching other men live the life you were supposed to build.
          </p>
        </motion.div>

        {/* SCENE 13: Hero Timeline */}
        <motion.div style={{ opacity: s13, y: driftUp(0.36, 0.39) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h3 className="text-[#fbbf24] text-lg md:text-2xl font-mono tracking-[0.4em] mb-6 bg-black/60 px-4 py-2 border border-[#fbbf24]/30 shadow-[0_0_20px_rgba(251,191,36,0.2)]">TIMELINE B: THE KING</h3>
          <h1 className="text-4xl md:text-7xl font-bold uppercase tracking-widest leading-tight text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] mb-6">
            The Demon Back.<br/>The Sharp Mind.
          </h1>
          <p className="text-xl md:text-3xl font-serif italic text-[#fbbf24] tracking-[0.1em] max-w-3xl">
            Flawless code. Unshakeable confidence. The absolute pillar of strength your family requires you to be.
          </p>
        </motion.div>

        {/* SCENE 14: The Forge */}
        <motion.div style={{ opacity: s14, y: driftDown(0.39, 0.42) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-[#fbbf24] drop-shadow-[0_0_80px_rgba(251,191,36,0.8)]">
            THE FORGE.
          </h1>
        </motion.div>

        {/* ✨ SCENE 15: HOPE & GRACE */}
        <motion.div style={{ opacity: s15, y: driftUp(0.42, 0.45) }} className="absolute inset-0 flex items-center justify-center text-center px-6 md:px-24">
          <div className="bg-[#1a0f00]/90 border border-[#fbbf24]/30 p-8 md:p-14 rounded-3xl backdrop-blur-md shadow-2xl">
            <h2 className="text-3xl md:text-6xl font-serif italic leading-relaxed text-white">
              There is Divine Grace.<br/><br/>
              <span className="text-lg md:text-3xl font-light text-[#fbbf24] not-italic tracking-[0.2em] uppercase">
                This can be fixed.<br className="md:hidden"/> The path back is already forged within you.
              </span>
            </h2>
          </div>
        </motion.div>

        {/* SCENE 16: Blueprint Intro */}
        <motion.div style={{ opacity: s16, y: driftDown(0.45, 0.48) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <h2 className="text-2xl md:text-4xl font-light uppercase tracking-[0.3em] text-white/60">
            The Ascetic Blueprint
          </h2>
        </motion.div>

        {/* === THE TIMELINE SEQUENCE BEGINS === */}

        {/* SCENE 17: Penance Title (0.48) */}
        <motion.div style={{ opacity: s17, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left px-6 md:px-24">
          <h3 className="text-[#fbbf24] font-mono tracking-[0.3em] mb-4 bg-[#1a0f00]/90 px-4 py-2 border border-[#fbbf24]/50 shadow-lg">STEP 01: THE FAST</h3>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-widest text-white max-w-md">
            Unplug the Matrix.
          </h2>
        </motion.div>

        {/* SCENE 18: Penance Detail */}
        <motion.div style={{ opacity: s18, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-center md:items-end text-center md:text-right px-6 md:px-24">
          <div className="bg-[#1a0f00]/90 border border-[#fbbf24]/30 p-8 max-w-xl shadow-2xl backdrop-blur-md">
            <p className="text-lg md:text-2xl font-serif italic text-white/90 leading-relaxed">
              Starve the cheap dopamine. relocate your phone. Block the sites. Relapse is not an option; it is a regression into slavery. Tapasya (Penance) begins now.
            </p>
          </div>
        </motion.div>

        {/* SCENE 19: Biology Title */}
        <motion.div style={{ opacity: s19, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left px-6 md:px-24">
          <h3 className="text-[#fbbf24] font-mono tracking-[0.3em] mb-4 bg-[#1a0f00]/90 px-4 py-2 border border-[#fbbf24]/50 shadow-lg">STEP 02: THE ALCHEMY</h3>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-widest text-white max-w-md">
            Synthesize Masculinity.
          </h2>
        </motion.div>

        {/* SCENE 20: Biology Detail */}
        <motion.div style={{ opacity: s20, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-center md:items-end text-center md:text-right px-6 md:px-24">
          <div className="bg-[#1a0f00]/90 border border-[#fbbf24]/30 p-8 max-w-2xl shadow-2xl backdrop-blur-md">
            <p className="text-lg md:text-2xl font-serif italic text-[#fbbf24] leading-relaxed mb-4">
              Masculinity is not a mood; it is an endocrine result.
            </p>
            <p className="text-base md:text-xl font-light text-white/80 leading-relaxed uppercase tracking-wider">
              Eat cholesterol (red meat/eggs).<br/>Get morning sunlight.<br/>Supplement Zinc & Magnesium.<br/>Sleep 8 hours deep REM.
            </p>
          </div>
        </motion.div>

        {/* SCENE 21: Iron Title */}
        <motion.div style={{ opacity: s21, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-center md:items-start text-center md:text-left px-6 md:px-24">
          <h3 className="text-[#38bdf8] font-mono tracking-[0.3em] mb-4 bg-[#020617]/90 px-4 py-2 border border-[#38bdf8]/50 shadow-lg">STEP 03: THE IRON</h3>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-widest text-white max-w-md drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            Skyrocket Test.
          </h2>
        </motion.div>

        {/* SCENE 22: Iron Detail */}
        <motion.div style={{ opacity: s22, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-center md:items-end text-center md:text-right px-6 md:px-24">
          <div className="bg-[#020617]/90 border border-[#38bdf8]/30 p-8 max-w-2xl shadow-2xl backdrop-blur-md">
            <p className="text-lg md:text-2xl font-serif italic text-white/90 leading-relaxed mb-4">
              Moving massive physical loads shocks the Central Nervous System (CNS).
            </p>
            <p className="text-base md:text-xl font-light text-[#38bdf8] leading-relaxed uppercase tracking-widest">
              Squats. Deadlifts. Presses.<br/>Reach the Ultimate Peak.
            </p>
          </div>
        </motion.div>

        {/* SCENE 23: Transmute Title */}
        <motion.div style={{ opacity: s23, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24 items-center text-center md:items-start md:text-left">
          <h3 className="text-[#38bdf8] font-mono tracking-[0.3em] mb-4 bg-[#020617]/90 px-4 py-2 border border-[#38bdf8]/50 shadow-lg">STEP 04: TEJAS</h3>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-widest text-white max-w-md">
            Do not suppress it.
          </h2>
        </motion.div>

        {/* SCENE 24: Transmute Detail */}
        <motion.div style={{ opacity: s24, x: offsetRight }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24 items-center justify-center text-center md:items-end md:text-right">
           <div className="bg-[#020617]/90 border border-[#38bdf8]/30 p-8 max-w-2xl shadow-2xl backdrop-blur-md">
            <p className="text-lg md:text-2xl font-serif italic text-white/90 leading-relaxed">
              When the physical urge hits, that is Raw Rocket Fuel. Do not fight it. <span className="font-bold text-[#38bdf8] not-italic uppercase tracking-widest">Transmute it.</span> 
              <br/><br/>
              Channel that intense chaotic energy directly into Python scripts or dominating a heavy set. Ojas becomes Tejas.
            </p>
          </div>
        </motion.div>

        {/* === END TIMELINE === */}

        {/* === 💎 THE ASCENSION === */}

        {/* SCENE 25: The Ascension */}
        <motion.div style={{ opacity: s25, y: driftDown(0.72, 0.75) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div className="bg-black/40 backdrop-blur-md px-10 py-6 rounded-3xl border border-[#38bdf8]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <h1 className="text-5xl md:text-[8vw] font-black tracking-[0.3em] uppercase text-[#38bdf8] drop-shadow-[0_5px_15px_rgba(0,0,0,1)]">
              ASCEND.
            </h1>
          </div>
        </motion.div>

        {/* SCENE 26: The Armor Intro */}
        <motion.div style={{ opacity: s26, y: driftUp(0.75, 0.78) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-none text-[#38bdf8]/10 absolute top-1/2 -translate-y-1/2 whitespace-nowrap">DISCIPLINE</h1>
          <div className="bg-[#020617]/60 backdrop-blur-md border border-[#38bdf8]/20 px-8 py-6 rounded-3xl relative z-10 shadow-[0_10px_40px_rgba(0,0,0,0.9)] max-w-4xl">
            <h2 className="text-3xl md:text-5xl font-serif italic text-white leading-relaxed">
              "A man who conquers his own mind..."
            </h2>
          </div>
        </motion.div>

        {/* SCENE 27: The Armor Finish */}
        <motion.div style={{ opacity: s27, y: driftDown(0.78, 0.81) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="bg-[#020617]/60 backdrop-blur-md border border-[#38bdf8]/20 px-8 py-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] max-w-4xl">
            <h2 className="text-2xl md:text-5xl font-light uppercase tracking-widest text-[#38bdf8] leading-relaxed drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">
              "...is more powerful than a man who conquers a thousand cities."
            </h2>
          </div>
        </motion.div>

        {/* SCENE 28: The Creator Intro */}
        <motion.div style={{ opacity: s28, y: driftUp(0.81, 0.84) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
          <div className="bg-black/50 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-[0_5px_15px_rgba(0,0,0,1)]">
              You are a Creator.
            </h2>
          </div>
        </motion.div>

        {/* SCENE 29: The Creator Finish */}
        <motion.div style={{ opacity: s29, y: driftDown(0.84, 0.87) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
          <div className="bg-[#020617]/60 backdrop-blur-md border border-[#38bdf8]/20 px-8 py-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] max-w-4xl">
            <p className="text-xl md:text-4xl font-light tracking-[0.2em] uppercase text-[#38bdf8] leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
              The universe did not put you here to be a <span className="font-bold text-white">consumer of pixels.</span>
            </p>
          </div>
        </motion.div>

        {/* SCENE 30: Currency Intro */}
        <motion.div style={{ opacity: s30, y: driftUp(0.87, 0.90) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
          <div className="bg-[#020617]/60 backdrop-blur-md border border-[#38bdf8]/20 px-8 py-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-serif italic text-white leading-relaxed drop-shadow-[0_5px_10px_rgba(0,0,0,1)]">
              Your life force is the absolute currency of the universe.
            </h2>
          </div>
        </motion.div>

        {/* SCENE 31: Currency Finish */}
        <motion.div style={{ opacity: s31, y: driftDown(0.90, 0.93) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
           <div className="bg-[#020617]/80 backdrop-blur-xl border border-[#38bdf8]/40 p-8 md:p-14 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.9)]">
            <h1 className="text-[#38bdf8] uppercase tracking-widest font-black text-4xl md:text-6xl leading-tight drop-shadow-[0_5px_15px_rgba(0,0,0,1)]">
              Stop spending it<br/>on illusions.
            </h1>
          </div>
        </motion.div>

        {/* SCENE 32: Vow (Interactive Ending) */}
        <motion.div style={{ opacity: s32 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-auto">
          <div className="flex flex-col items-center gap-8 bg-[#020617]/80 p-10 md:p-16 rounded-[3rem] border border-[#38bdf8]/40 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
            <p className="text-lg md:text-2xl font-mono tracking-[0.3em] text-[#38bdf8] uppercase drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">I retain my fire. I build my empire.</p>
            <input 
              type="text" 
              placeholder="Initials..." 
              className="bg-transparent border-b-2 border-white text-center text-4xl md:text-6xl text-white font-serif italic focus:outline-none focus:border-[#38bdf8] transition-colors w-64 pb-4 placeholder-white/40 drop-shadow-[0_2px_5px_rgba(0,0,0,1)]"
              maxLength={3}
            />
            <button 
              className="mt-6 px-12 py-5 bg-[#38bdf8]/20 border border-[#38bdf8] rounded-full text-white font-black tracking-[0.4em] uppercase text-sm md:text-base hover:bg-[#38bdf8] hover:text-[#020617] transition-all shadow-[0_0_40px_rgba(56,189,248,0.6)] cursor-pointer"
              onClick={() => {
                
                if (onAscend) onAscend(); // 👈 This triggers the teleport!
              }}
            >
              Ascend
            </button>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}