import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, Sparkles, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { setGlobalMusic } from './GlobalAudio';

// --------------------------------------------------------
// 🧠 3D ENGINE: THE HOLOGRAPHIC TWO-HEMISPHERE BRAIN
// --------------------------------------------------------
const BrainNetwork = ({ scrollProgress, tier, isMobile }) => {
  const pointsRef = useRef();
  
  // Adaptive particle count
  const count = tier === 'low' ? 3000 : (isMobile ? 6000 : 12000);
  
  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rand = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      let x, y, z;
      // Rejection sampling for an organic, clustered volume
      do {
        x = (Math.random() - 0.5) * 2;
        y = (Math.random() - 0.5) * 2;
        z = (Math.random() - 0.5) * 2;
      } while (x*x + y*y + z*z > 1);

      // Shape it into a brain: longer front-to-back, slightly flattened bottom
      x *= 2.0; // Width
      y *= 1.8; // Height
      z *= 2.6; // Length
      if (y < -0.5) y *= 0.5; // Flatten the base slightly

      // Create the Longitudinal Fissure (The gap between left and right hemispheres)
      const gap = 0.3;
      if (x > 0) x += gap;
      else x -= gap;

      // Add organic "folds" using sine waves based on position
      const fold = Math.sin(x*6) * Math.cos(y*6) * Math.sin(z*6) * 0.15;
      
      pos[i * 3] = x + fold;
      pos[i * 3 + 1] = y + fold;
      pos[i * 3 + 2] = z + fold;
      
      rand[i] = Math.random();
    }
    return { positions: pos, randoms: rand };
  }, [count]);

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!pointsRef.current) return;

    // SCROLL-DRIVEN ROTATION & POSITION
    pointsRef.current.rotation.y += delta * 0.15;
    pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, p < 0.1 ? -1 : p < 0.8 ? 1.5 : 0, delta * 2);

    // EMOTIONAL COLOR GRADING
    let targetColor = new THREE.Color("#00ccff"); // Base: Healthy Cyan
    let pulseSpeed = 1.0;
    
    if (p >= 0.22 && p < 0.45) {
      targetColor.set("#ef4444"); // The Spike/Hack: Aggressive Crimson
      pulseSpeed = 8.0;
    } else if (p >= 0.45 && p < 0.75) {
      targetColor.set("#333333"); // Down-regulation: Dead/Burnt out Grey
      pulseSpeed = 0.1;
    } else if (p >= 0.75) {
      targetColor.set("#fbbf24"); // Neuroplasticity: Healing Gold/Aura
      pulseSpeed = 2.0;
    }

    pointsRef.current.material.color.lerp(targetColor, delta * 3);

    // PULSE LOGIC (Throbbing based on phase)
    const time = state.clock.elapsedTime;
    const scale = 1 + Math.sin(time * pulseSpeed) * 0.03;
    pointsRef.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      {/* Soft, glowing additive blending for that hologram look */}
      <pointsMaterial size={0.04} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

// --------------------------------------------------------
// ⚡ 3D ENGINE: THE DOPAMINE FLOOD (FIXED NO-CRASH VERSION)
// --------------------------------------------------------
const DopamineSparks = ({ scrollProgress }) => {
  const sparksRef = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!sparksRef.current) return;

    // Only activate during the "Infinite Novelty / Overload" phase
    if (p >= 0.25 && p < 0.45) {
      sparksRef.current.position.y = THREE.MathUtils.lerp(sparksRef.current.position.y, 0, delta * 5);
      sparksRef.current.scale.setScalar(THREE.MathUtils.lerp(sparksRef.current.scale.x, 1, delta * 5));
    } else {
      sparksRef.current.position.y = THREE.MathUtils.lerp(sparksRef.current.position.y, -15, delta * 2);
      sparksRef.current.scale.setScalar(THREE.MathUtils.lerp(sparksRef.current.scale.x, 0, delta * 5));
    }
  });

  return (
    <group ref={sparksRef} position={[0, -15, 0]} scale={0}>
      <Sparkles count={800} scale={12} size={8} speed={3} color="#ff3366" opacity={0.9} />
    </group>
  );
};

// --------------------------------------------------------
// 🎬 THE MAIN CINEMATIC SCROLL COMPONENT
// --------------------------------------------------------
export default function NeuralReality({ onBack, onNext,onSwitchProtocol }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1);
  const [tier, setTier] = useState('high');
  const [isGlitching, setIsGlitching] = useState(false);
  
  const containerRef = useRef(null);
  useEffect(() => { 
    window.scrollTo(0, 0); 
    const checkMobile = () => setIsMobile(window.innerWidth < 768); 
    checkMobile(); 
    window.addEventListener('resize', checkMobile); 
    return () => window.removeEventListener('resize', checkMobile); 
  }, []);
  
  // Set a dark, moody  electronic track
  useEffect(() => { setGlobalMusic('lustbreaker'); }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

  // 📺 TRIGGER GLITCH EFFECT ON THE "OVERLOAD" PHASE
  useMotionValueEvent(sp, "change", (latest) => {
    setIsGlitching(latest >= 0.38 && latest <= 0.44);
  });

  // 🩸 DYNAMIC BACKGROUND COLOR SHIFTING (Matches the emotional tone of the copy)
  const bgColor = useTransform(sp, 
    [0, 0.22, 0.38, 0.45, 0.55, 0.75, 0.85], 
    ["#020617", "#020617", "#2a0000", "#050505", "#0a0a0a", "#0a0a0a", "#0a0514"]
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
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[4000vh] font-sans text-white selection:bg-[#00ccff]/30">
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
        ← Abort Diagnostic
      </button>

      <div className="fixed top-6 right-6 z-[100] text-right pointer-events-none hidden md:block">
        <h3 className="text-[#00ccff] font-mono text-[10px] tracking-widest uppercase">Protocol // Ojas</h3>
        <p className="text-white/40 font-mono text-[8px] tracking-widest uppercase mt-1">Diagnostic Mode: Active</p>
      </div>

      {/* 🌌 3D BACKGROUND ENGINE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={dpr} camera={{ position: [0, 0, isMobile ? 10 : 7], fov: 60 }}>
          <PerformanceMonitor onDecline={() => { setDpr(1); setTier('low'); }} onIncline={() => { setDpr(1.5); setTier('high'); }} />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} color={isGlitching ? "#ef4444" : "#00ccff"} intensity={2} distance={20} />
          
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.2} intensity={isGlitching ? 4.0 : 1.5} mipmapBlur />
            <Vignette eskil={false} offset={0.3} darkness={0.9} />
            {tier !== 'low' && !isMobile && <Noise opacity={0.15} blendFunction={BlendFunction.OVERLAY} />}
            <ChromaticAberration offset={[isGlitching ? 0.02 : 0.002, isGlitching ? 0.02 : 0.002]} />
            <Glitch active={isGlitching} delay={[0, 0]} duration={[0.1, 0.3]} strength={[0.2, 0.4]} />
          </EffectComposer>

          <BrainNetwork scrollProgress={sp} tier={tier} isMobile={isMobile} />
          <DopamineSparks scrollProgress={sp} />
        </Canvas>
      </div>

      {/* 📜 THE EDITORIAL SCROLL CONTENT */}
      <div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* --- INTRODUCTION --- */}
        <motion.div style={{ opacity: s[0], y: driftUp(0, 0.02) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <div className="w-24 h-[1px] bg-[#00ccff] mb-8 animate-pulse" />
          <h1 className="text-2xl md:text-5xl font-mono tracking-[0.5em] uppercase text-[#00ccff] drop-shadow-[0_0_20px_rgba(0,204,255,0.8)] leading-tight">
            NEURAL DIAGNOSTIC<br/>INITIATED.
          </h1>
          <p className="text-white/50 text-[10px] md:text-sm tracking-widest uppercase mt-6 font-mono">Scanning Dopaminergic Pathways...</p>
        </motion.div>

        <motion.div style={{ opacity: s[1], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-light uppercase tracking-widest text-white leading-tight">
            You are not broken.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[2], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h2 className="text-[clamp(2rem,4vw,4rem)] font-light text-white/70 leading-tight">
            You are functioning <span className="text-[#00ccff] font-bold">exactly</span> as designed.
          </h2>
        </motion.div>

        {/* --- THE ORIGINAL DESIGN --- */}
        <motion.div style={{ opacity: s[3], y: driftUp(0.08, 0.10) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-3xl leading-relaxed bg-[#001122]/80 p-8 border-l-4 border-[#00ccff] backdrop-blur-md">
            For 200,000 years, the human brain operated on one absolute, unbreakable rule:
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[4], y: driftDown(0.11, 0.13) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-[clamp(4rem,10vw,10rem)] font-black uppercase tracking-widest text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.6)] leading-none">
            EFFORT = REWARD
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s[5], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
           <ul className="space-y-6 font-mono text-3xl md:text-6xl tracking-widest uppercase">
            <li className="text-white/60">HUNT.</li>
            <li className="text-white/60">BUILD.</li>
            <li className="text-white/60">SURVIVE.</li>
          </ul>
        </motion.div>

        <motion.div style={{ opacity: s[6], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white leading-relaxed max-w-2xl">
            To make sure you did these hard things, your brain rewarded you with a single, powerful molecule:
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-[#00ccff] tracking-[0.2em] mt-4">DOPAMINE.</h2>
        </motion.div>

        {/* --- THE TRAP (RED PHASE) --- */}
        <motion.div style={{ opacity: s[7], y: driftUp(0.19, 0.21) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-serif italic text-[#ef4444] drop-shadow-[0_0_40px_rgba(239,68,68,0.5)] leading-none">
            But then, they changed the rules.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[8], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
           <p className="text-xl md:text-3xl font-light text-white/90 max-w-2xl leading-relaxed border-l-4 border-[#ef4444] pl-6 bg-[#2a0000]/50 p-6 backdrop-blur-sm">
             Who? The architects of the digital age. Algorithms designed by billionaires specifically to harvest your attention.
           </p>
        </motion.div>

        <motion.div style={{ opacity: s[9], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h3 className="text-3xl md:text-6xl font-black uppercase text-white tracking-widest leading-tight">
            They figured out a hack.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[10], y: driftUp(0.27, 0.29) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-5xl font-light text-white leading-relaxed max-w-4xl">
            Infinite novelty. Thousands of pixels firing directly into your primitive brain.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[11], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-widest text-[#ef4444] leading-tight">
            High-definition spikes of dopamine.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[12], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
           <h2 className="text-[clamp(3.5rem,8vw,8rem)] font-black uppercase tracking-widest text-white leading-none bg-[#ef4444]/20 px-6 py-4 border border-[#ef4444] backdrop-blur-md">
            WITH ZERO<br/>PHYSICAL EFFORT.
          </h2>
        </motion.div>

        {/* --- THE OVERLOAD --- */}
        <motion.div style={{ opacity: s[13], y: driftDown(0.36, 0.38) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-[clamp(5rem,15vw,15rem)] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#ef4444] to-[#7f1d1d] drop-shadow-[0_0_80px_rgba(239,68,68,1)] leading-none">
            OVERLOAD.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s[14], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
           <p className="text-xl md:text-4xl font-serif italic text-white/80 max-w-3xl leading-relaxed">
             Your brain is terrified. It wasn't built to handle this much pleasure this fast. It thinks it's dying.
           </p>
        </motion.div>

        {/* --- THE DEFENSE (GREY PHASE) --- */}
        <motion.div style={{ opacity: s[15], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h3 className="text-2xl md:text-4xl font-mono text-white/40 tracking-[0.2em] mb-4">SYSTEM DEFENSE ACTIVATED</h3>
          <p className="text-xl md:text-3xl font-light text-white leading-relaxed max-w-2xl">
            To protect itself from seizing, the brain does the only thing it can.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[16], y: driftUp(0.44, 0.46) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(4rem,9vw,9rem)] font-black uppercase tracking-widest text-white/30 drop-shadow-2xl leading-none">
            IT SHUTS THE DOORS.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[17], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
           <h3 className="text-3xl md:text-6xl font-black uppercase tracking-widest text-white/50 bg-black/80 p-8 border-l-8 border-white/20 backdrop-blur-md">
            It physically burns out the receptors.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[18], y: driftDown(0.49, 0.51) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-sm md:text-xl font-mono text-white/30 tracking-[0.4em] uppercase border border-white/10 px-8 py-4 rounded-full bg-black/50 backdrop-blur-md">
            Scientific Term: Dopamine Down-regulation.
          </p>
        </motion.div>

        {/* --- THE SYMPTOMS (THE LOSS) --- */}
        <motion.div style={{ opacity: s[19], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-light text-white/70 leading-relaxed max-w-4xl">
            This is why the real world suddenly feels so incredibly heavy.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[20], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h2 className="text-[clamp(4rem,8vw,8rem)] font-black uppercase tracking-widest text-white/50 leading-none">BRAIN FOG.</h2>
        </motion.div>

        <motion.div style={{ opacity: s[21], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-[clamp(4rem,8vw,8rem)] font-black uppercase tracking-widest text-white/40 leading-none">SOCIAL ANXIETY.</h2>
        </motion.div>

        <motion.div style={{ opacity: s[22], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h2 className="text-[clamp(4rem,8vw,8rem)] font-black uppercase tracking-widest text-white/30 leading-none">ZERO MOTIVATION.</h2>
        </motion.div>

        <motion.div style={{ opacity: s[23], y: driftUp(0.63, 0.65) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white/60 max-w-3xl leading-relaxed">
            A feeling of deep, unexplainable emptiness.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[24], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white/80 max-w-4xl leading-relaxed bg-[#111111]/80 p-8 border-l-4 border-white/20 backdrop-blur-md">
            Normal, beautiful things—like talking to a girl, working out, or building your empire—no longer excite you.<br/><br/> Because your receptors are so numb, they only respond to <span className="font-bold text-white">extreme synthetic spikes.</span>
          </p>
        </motion.div>

        {/* --- THE MYTH --- */}
        <motion.div style={{ opacity: s[25], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-serif italic text-white/50 max-w-3xl leading-relaxed mb-4">
            Society calls you lazy.
          </p>
          <h3 className="text-3xl md:text-5xl font-black uppercase text-white tracking-widest leading-tight">
            You think <br/> you've lost your masculinity.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[26], y: driftUp(0.72, 0.74) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-[clamp(5rem,15vw,15rem)] font-black uppercase tracking-widest text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.8)] leading-none">
            YOU HAVEN'T.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s[27], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-light text-white/90 leading-relaxed max-w-4xl">
            Your drive, your fire, your testosterone... it isn't gone. 
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[28], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white/50 leading-relaxed max-w-3xl">
            It is just buried under the rubble of cheap pixels.
          </p>
        </motion.div>

        {/* --- THE TURN (GOLD PHASE / HOPE) --- */}
        <motion.div style={{ opacity: s[29], y: driftUp(0.80, 0.82) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-xl md:text-3xl font-light text-white/80 max-w-2xl leading-relaxed mb-8">
            Are you still in control? No. You are a puppet.
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#fbbf24] drop-shadow-[0_0_40px_rgba(251,191,36,0.3)] leading-tight">
            But there is a beautiful flaw in their trap.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[30], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-lg md:text-2xl font-mono text-[#fbbf24] tracking-[0.4em] uppercase mb-4">THE CHEAT CODE</p>
          <h1 className="text-[clamp(4rem,8vw,10rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_60px_rgba(251,191,36,0.6)] leading-none">
            NEUROPLASTICITY.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s[31], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
           <h3 className="text-3xl md:text-6xl font-black uppercase tracking-widest text-white/90 bg-[#fbbf24]/20 p-8 border-r-8 border-[#fbbf24] backdrop-blur-md">
            The brain heals.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s[32], x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-light text-white/90 leading-relaxed max-w-4xl">
            If you starve the fake dopamine... the receptors grow back.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s[33], x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-3xl md:text-6xl font-serif italic text-[#fbbf24] drop-shadow-lg leading-relaxed">
            The fog lifts.<br/>The beast wakes up.
          </p>
        </motion.div>

        {/* --- THE CALL TO ACTION --- */}
        <motion.div style={{ opacity: s[34], y: driftUp(0.94, 0.96) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(3rem,6vw,6rem)] font-light uppercase tracking-widest text-white leading-tight">
            It is time to cut the strings.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s[35], y: driftUp(0.97, 1.0) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 pointer-events-auto z-50">
          <h2 className="text-xl md:text-3xl font-serif italic text-white/70 mb-12 drop-shadow-lg">
            Are you ready to fix the engine?
          </h2>
          
          <motion.button 
            onClick={onNext}
            whileHover={{ scale: 1.05, letterSpacing: "0.2em" }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-10 py-6 bg-[#000000] border border-[#fbbf24] rounded-full overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_60px_rgba(251,191,36,0.6)] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fbbf24]/20 to-transparent -translate-x-full group-hover:animate-[glint_1.5s_ease-in-out_infinite]" />            
            <span className="relative z-10 text-[#fbbf24] font-bold text-sm md:text-lg tracking-[0.2em] uppercase">
              Equip Lifesaver Protocol
            </span>
          </motion.button>
          
          <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] mt-8 font-mono">
            Takes 2 minutes to read. Lasts a lifetime.
          </p>
        </motion.div>

      </div>
    </motion.div>
  );
}