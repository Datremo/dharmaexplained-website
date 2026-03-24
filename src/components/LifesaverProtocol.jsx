import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion,AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshTransmissionMaterial, Float, Sparkles, Torus, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { setGlobalMusic } from './GlobalAudio';

// --------------------------------------------------------
// 🛡️ 3D ENGINE: THE ARMOR CORE (Constructs as you scroll)
// --------------------------------------------------------
const ArmorCore = ({ scrollProgress, tier, isMobile }) => {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const particlesRef = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
      coreRef.current.rotation.x += delta * 0.1;
      // Core pulses larger as you get closer to the Oath
      const coreScale = THREE.MathUtils.lerp(1, p > 0.8 ? 1.5 : 1, delta * 2);
      coreRef.current.scale.set(coreScale, coreScale, coreScale);
    }

    // Rings spin and lock into place to signify "Armor" building
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.5;
      ring1Ref.current.rotation.y += delta * 0.3;
      // Ring 1 appears during Phase 2 (Ojas)
      const r1Scale = p > 0.3 ? THREE.MathUtils.lerp(ring1Ref.current.scale.x, 2.5, delta * 2) : 0;
      ring1Ref.current.scale.set(r1Scale, r1Scale, r1Scale);
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x -= delta * 0.4;
      ring2Ref.current.rotation.z += delta * 0.6;
      // Ring 2 appears during Phase 3 (Environment)
      const r2Scale = p > 0.6 ? THREE.MathUtils.lerp(ring2Ref.current.scale.x, 3.5, delta * 2) : 0;
      ring2Ref.current.scale.set(r2Scale, r2Scale, r2Scale);
    }

    // Move the whole construct down into view as they scroll
    const targetY = p < 0.1 ? 2 : p > 0.8 ? -1 : 0;
    if (coreRef.current) coreRef.current.parent.position.y = THREE.MathUtils.lerp(coreRef.current.parent.position.y, targetY, delta);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group position={[0, 2, 0]}>
        
        {/* The Inner Mind (Gold/Ojas) */}
        <Icosahedron ref={coreRef} args={[1.5, 0]}>
          <MeshTransmissionMaterial 
            backside backsideThickness={5} thickness={2} 
            chromaticAberration={0.05} anisotropicBlur={0.1} 
            clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={2} 
            color="#fbbf24" 
          />
        </Icosahedron>
        
        {/* The Solid Inner Core */}
        <Icosahedron args={[0.8, 0]}>
          <meshBasicMaterial color="#ffffff" wireframe />
        </Icosahedron>

        {/* Phase 2 Armor Ring */}
        <Torus ref={ring1Ref} args={[1, 0.02, 16, 100]} scale={0}>
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </Torus>

        {/* Phase 3 Armor Ring */}
        <Torus ref={ring2Ref} args={[1, 0.01, 16, 100]} scale={0}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </Torus>

        <Sparkles ref={particlesRef} count={tier === 'low' ? 50 : 200} scale={6} size={4} speed={0.5} color="#fbbf24" opacity={0.6} />
      </group>
    </Float>
  );
};

// --------------------------------------------------------
// 🎬 THE MAIN CINEMATIC SCROLL COMPONENT
// --------------------------------------------------------
export default function LifesaverProtocol({ onBack, onNext,onSwitchProtocol }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1);
  const [tier, setTier] = useState('high');
  
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  const containerRef = useRef(null);
  
useEffect(() => { 
    // 🛑 BRUTE-FORCE TELEPORT
    // Instantly force scroll to 0
    window.scrollTo(0, 0); 
    
    // Wait exactly 50ms for Lenis momentum to die, then force it AGAIN
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    }, 50);
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768); 
    checkMobile(); 
    window.addEventListener('resize', checkMobile); 
    return () => window.removeEventListener('resize', checkMobile); 
  }, []);
  
  // Set a clean, focus-driven track
  useEffect(() => { setGlobalMusic('ojas_focus'); }, []);

  // ⏱️ THE OATH BUTTON LOGIC (Hold to fill)
  useEffect(() => {
    let interval;
    if (isHolding) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            onNext(); // Trigger Karma Protocol!
            return 100;
          }
          return prev + 1.5; // Fills up over ~2 seconds
        });
      }, 30);
    } else {
      setHoldProgress(0); // Reset if they let go!
    }
    return () => clearInterval(interval);
  }, [isHolding, onNext]);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

  // 🩸 DYNAMIC BACKGROUND COLOR SHIFTING
  const bgColor = useTransform(sp, 
    [0, 0.3, 0.6, 0.9, 1.0], 
    ["#020617", "#050505", "#0a0a0a", "#050505", "#000000"]
  );

  // 🧮 35 STRICT NON-OVERLAPPING OPACITY WINDOWS FOR PACING
  const getP = (index) => {
    const totalScenes = 36;
    const duration = 1 / totalScenes;
    const start = index * duration; 
    const peak1 = start + (duration * 0.2);
    const peak2 = start + (duration * 0.8);
    const end = start + duration;
    return useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  };

  const s = Array.from({ length: 36 }, (_, i) => getP(i));

  // 🦅 PARALLAX DRIFT MATH
  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const offsetLeft = isMobile ? "0vw" : "15vw"; 
  const offsetRight = isMobile ? "0vw" : "-15vw";

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[4000vh] font-sans text-white selection:bg-[#fbbf24]/30">
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
      {/* 🧭 NAVIGATION */}
      <button onClick={onBack} className="fixed top-6 left-6 z-[100] px-6 py-2 border border-white/20 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/10 transition-all backdrop-blur-md cursor-pointer text-white/70">
        ← Abort Protocol
      </button>

      {/* 🌌 3D BACKGROUND ENGINE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <Canvas dpr={dpr} camera={{ position: [0, 0, isMobile ? 10 : 7], fov: 60 }}>
          <PerformanceMonitor onDecline={() => { setDpr(1); setTier('low'); }} onIncline={() => { setDpr(1.5); setTier('high'); }} />
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} color="#ffffff" intensity={2} />
          <pointLight position={[-5, -5, -5]} color="#fbbf24" intensity={1} />
          
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.5} intensity={1.5} mipmapBlur />
            <Vignette eskil={false} offset={0.3} darkness={0.8} />
            {tier !== 'low' && !isMobile && <Noise opacity={0.1} blendFunction={BlendFunction.OVERLAY} />}
          </EffectComposer>

          <ArmorCore scrollProgress={sp} tier={tier} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* 📜 THE EDITORIAL SCROLL CONTENT */}
      <div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* --- INTRODUCTION --- */}
        <motion.div style={{ opacity: s[0], y: driftUp(0, 0.02) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-[#fbbf24] font-mono text-xs md:text-sm tracking-[0.5em] uppercase mb-6 animate-pulse">
            System Reboot Authorized
          </h1>
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_40px_rgba(251,191,36,0.2)] leading-none">
            THE LIFESAVER<br/>PROTOCOL.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[1], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-light text-white leading-relaxed max-w-4xl border-l-4 border-[#fbbf24] pl-6 bg-black/40 p-8 backdrop-blur-md">
            You know the enemy now. You know how they hacked your biology.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[2], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h2 className="text-[clamp(3rem,6vw,6rem)] font-light text-white/70 leading-tight">
            Now, we build your <span className="text-[#fbbf24] font-bold">Armor.</span>
          </h2>
        </motion.div>

        {/* --- PHASE 1: THE LOCKDOWN --- */}
        <motion.div style={{ opacity: s[3], y: driftUp(0.08, 0.10) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-[#fbbf24] font-mono text-sm tracking-[0.4em] uppercase mb-4">PHASE 01</p>
          <h1 className="text-[clamp(4rem,8vw,8rem)] font-black uppercase tracking-widest text-white leading-none">
            THE 72-HOUR LOCKDOWN.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s[4], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white/80 leading-relaxed max-w-3xl">
            When you cut the supply of synthetic pixels, your brain will panic.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[5], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
           <h3 className="text-3xl md:text-6xl font-black uppercase tracking-widest text-white/50 leading-tight">
            It will scream for cheap dopamine.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[6], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-serif italic text-white/90 leading-relaxed max-w-4xl">
            Expect agitation. Expect brain fog. Expect a voice telling you  <span className="font-bold text-white">"just one last time."</span>
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[7], y: driftUp(0.19, 0.21) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(4rem,9vw,9rem)] font-black uppercase tracking-widest text-[#fbbf24] drop-shadow-2xl leading-none">
            DO NOT FIGHT IT.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[8], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white/80 max-w-2xl leading-relaxed border-r-4 border-white/20 pr-6">
            Fighting the urge gives it power. You must simply <span className="font-bold text-white">observe it.</span> Watch the craving wash over you like a wave, and watch it break.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[9], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-3xl md:text-5xl font-light text-white leading-tight">
            Survive the 72-hour dip...
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[10], y: driftUp(0.27, 0.29) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-5xl font-serif italic text-[#fbbf24] max-w-4xl leading-relaxed">
            ...and the receptors will physically begin to bloom again. The world will start to regain its color.
          </p>
        </motion.div>

        {/* --- PHASE 2: OJAS (ENERGY TRANSMUTATION) --- */}
        <motion.div style={{ opacity: s[11], y: driftUp(0.30, 0.32) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-[#00ccff] font-mono text-sm tracking-[0.4em] uppercase mb-4">PHASE 02</p>
          <h1 className="text-[clamp(3.5rem,7vw,7rem)] font-black uppercase tracking-widest text-white leading-none">
            ENERGY TRANSMUTATION.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s[12], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-3xl md:text-6xl font-light text-white/60 leading-tight">
            The urge is not a demon.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[13], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h3 className="text-[clamp(3rem,6vw,6rem)] font-black uppercase tracking-widest text-white leading-none bg-white/10 px-8 py-4 backdrop-blur-md">
            IT IS FUEL.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[14], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-3xl leading-relaxed">
            In ancient texts, this raw, restless biological energy is called <span className="text-[#fbbf24] font-bold not-italic">Ojas</span>. It is the absolute core of your masculine drive.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[15], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-light text-white/90 leading-relaxed max-w-3xl">
            You have been taking rocket fuel, and dumping it into  <span className="font-bold text-white">a digital void.</span>
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[16], y: driftUp(0.44, 0.46) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(4rem,9vw,9rem)] font-black uppercase tracking-widest text-white drop-shadow-2xl leading-none">
            RECLAIM IT.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[17], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
           <p className="text-xl md:text-3xl font-light text-white max-w-3xl leading-relaxed border-l-4 border-[#00ccff] pl-6 bg-[#001122]/50 p-6 backdrop-blur-sm">
            When the urge hits, you have <span className="font-bold text-[#00ccff]">exactly 5 seconds</span> before your brain rationalizes failure. 
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[18], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <ul className="space-y-6 font-mono text-2xl md:text-5xl tracking-widest uppercase text-right">
            <li className="text-white/80">Drop for 20 pushups.</li>
            <li className="text-white/60">Open your code editor.</li>
            <li className="text-white/40">Sprint down the street.</li>
          </ul>
        </motion.div>

        <motion.div style={{ opacity: s[19], y: driftUp(0.52, 0.54) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-4xl leading-relaxed">
            Force the energy out of your mind and into <span className="text-[#fbbf24] font-bold not-italic">physical reality.</span> Transmute it into power.
          </p>
        </motion.div>

        {/* --- PHASE 3: ENVIRONMENT OVERRIDE --- */}
        <motion.div style={{ opacity: s[20], y: driftUp(0.55, 0.57) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-white/50 font-mono text-sm tracking-[0.4em] uppercase mb-4">PHASE 03</p>
          <h1 className="text-[clamp(3.5rem,7vw,7rem)] font-black uppercase tracking-widest text-white leading-none">
            ENVIRONMENT OVERRIDE.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s[21], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-[clamp(3rem,6vw,6rem)] font-light text-white/50 leading-tight">
            Willpower is a myth.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[22], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-2xl leading-relaxed">
            It is a finite resource. If your phone is next to your bed at 2 AM, your willpower will eventually break.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[23], y: driftUp(0.63, 0.65) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-[clamp(4rem,8vw,8rem)] font-black uppercase tracking-widest text-white drop-shadow-lg leading-none">
            YOUR ENVIRONMENT DICTATES YOUR DESTINY.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s[24], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-light text-white leading-relaxed max-w-3xl">
            You must architect your surroundings so that failure is incredibly difficult.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[25], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
           <ul className="space-y-4 font-mono text-xl md:text-3xl tracking-widest uppercase text-right">
            <li className="text-[#ef4444]">Delete the trigger apps.</li>
            <li className="text-white/70">Install absolute website blockers.</li>
            <li className="text-white/40">Leave the phone outside the bedroom.</li>
          </ul>
        </motion.div>

        <motion.div style={{ opacity: s[26], y: driftUp(0.72, 0.74) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-5xl font-serif italic text-white/90 max-w-4xl leading-relaxed">
            Do not trust yourself. Trust the system you build around you.
          </p>
        </motion.div>

        {/* --- THE CLIMAX --- */}
        <motion.div style={{ opacity: s[27], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-3xl md:text-5xl font-light text-white/50 leading-tight">
            The diagnosis is complete.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[28], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h3 className="text-3xl md:text-5xl font-light text-white/70 leading-tight">
            The blueprint is in your hands.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[29], y: driftUp(0.80, 0.82) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-[clamp(4rem,10vw,10rem)] font-black uppercase tracking-widest text-[#fbbf24] drop-shadow-[0_0_50px_rgba(251,191,36,0.6)] leading-none">
            THE ARMOR IS FORGED.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s[30], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-light text-white leading-relaxed max-w-4xl">
            You are no longer a victim of their algorithm.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[31], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white/80 leading-relaxed max-w-3xl">
            You are the master of your own engine.
          </p>
        </motion.div>

        {/* --- THE CALL TO ACTION (THE OATH) --- */}
        <motion.div style={{ opacity: s[32], y: driftUp(0.88, 0.90) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(3rem,6vw,6rem)] font-light uppercase tracking-widest text-white leading-tight">
            Are you ready to seal the contract?
          </h2>
        </motion.div>

        {/* ⚡ THE OATH BUTTON (HOLD TO COMMIT) */}
        <motion.div style={{ opacity: s[33], y: driftUp(0.95, 1.0) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 pointer-events-auto z-50">
          
          <p className="text-[#fbbf24] font-mono text-xs md:text-sm tracking-[0.4em] uppercase mb-12 text-center animate-pulse">
            Warning: This action requires physical commitment.
          </p>

          <div 
            className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 cursor-pointer touch-none group"
            onPointerDown={() => setIsHolding(true)}
            onPointerUp={() => setIsHolding(false)}
            onPointerLeave={() => setIsHolding(false)}
          >
            {/* The outer glowing ring that fills up */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle cx="50%" cy="50%" r="48%" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
              <circle 
                cx="50%" cy="50%" r="48%" fill="transparent" stroke="#fbbf24" strokeWidth="6" 
                strokeDasharray="300%" strokeDashoffset={`${300 - (holdProgress * 3)}%`} 
                className="transition-all duration-75 ease-linear shadow-[0_0_40px_rgba(251,191,36,0.8)]"
              />
            </svg>

            {/* The actual button circle */}
            <div className={`w-48 h-48 md:w-56 md:h-56 rounded-full border border-white/10 flex flex-col items-center justify-center backdrop-blur-xl transition-all duration-300 ${isHolding ? 'bg-[#fbbf24]/20 scale-95 border-[#fbbf24] shadow-[0_0_50px_rgba(251,191,36,0.4)]' : 'bg-black/60 group-hover:border-white/30 group-hover:bg-white/5'}`}>
              <h3 className={`font-black uppercase tracking-widest text-xl md:text-2xl transition-colors ${isHolding ? 'text-[#fbbf24]' : 'text-white'}`}>
                Take the Oath
              </h3>
              <p className="text-white/40 font-mono text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-4 text-center leading-relaxed">
                Press & Hold<br/>to Ignite Karma
              </p>
            </div>
          </div>

        </motion.div>

      </div>
    </motion.div>
  );
}