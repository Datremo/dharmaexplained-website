import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, Glitch, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import CinematicCursor from './CinematicCursor';

// --------------------------------------------------------
// 🔥 THE 3D ENGINE: THE DIGITAL TORNADO TO THE MONOLITH
// --------------------------------------------------------
const MayaMatrixScene = ({ scrollProgress, isMobile }) => {
  const screensRef = useRef();
  const monolithRef = useRef();
  const screenCount = isMobile ? 80 : 200;

  // Generate random positions for the swirling screens
  const screensData = useMemo(() => {
    return Array.from({ length: screenCount }).map(() => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI,
      speed: Math.random() * 0.05 + 0.01,
      radius: Math.random() * 5 + 3,
      angle: Math.random() * Math.PI * 2
    }));
  }, [screenCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    // 📱 Phase 1 & 2: The Swirling Screens of Maya (Illusion)
    if (screensRef.current) {
      screensData.forEach((data, i) => {
        // Swirl around the center
        data.angle += data.speed;
        let targetX = Math.cos(data.angle) * data.radius;
        let targetZ = Math.sin(data.angle) * data.radius;
        let targetY = data.y + Math.sin(state.clock.elapsedTime + i) * 0.05;

        // At scroll > 0.6, they EXPLODE outward and disappear
        if (scroll > 0.6) {
          const explosionForce = (scroll - 0.6) * 50;
          targetX *= explosionForce;
          targetY *= explosionForce;
          targetZ *= explosionForce;
        }

        dummy.position.set(targetX, targetY, targetZ);
        dummy.rotation.set(data.rx += 0.01, data.ry += 0.02, 0);
        
        // Scale them down to 0 as they explode
        const scale = scroll > 0.6 ? Math.max(0, 1 - (scroll - 0.6) * 5) : 1;
        dummy.scale.set(scale, scale, scale);
        
        dummy.updateMatrix();
        screensRef.current.setMatrixAt(i, dummy.matrix);
      });
      screensRef.current.instanceMatrix.needsUpdate = true;
    }

    // 🗿 Phase 3: The Monolith of Reality
    if (monolithRef.current) {
      let targetScaleY = 0.01;
      let targetOpacity = 0;

      if (scroll > 0.65) {
        targetScaleY = 1;
        targetOpacity = 1;
      }

      monolithRef.current.scale.y = THREE.MathUtils.lerp(monolithRef.current.scale.y, targetScaleY, delta * 3);
      monolithRef.current.material.opacity = THREE.MathUtils.lerp(monolithRef.current.material.opacity, targetOpacity, delta * 2);
      
      // Slow, ominous rotation
      monolithRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group position={[isMobile ? 1 : 0, 0, -5]}>
      {/* The Swarm of Screens */}
      <instancedMesh ref={screensRef} args={[null, null, screenCount]}>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshStandardMaterial color="#00ffff" emissive="#ff00ff" emissiveIntensity={0.8} wireframe />
      </instancedMesh>

      {/* The Unmoving Real World Monolith */}
      <Box ref={monolithRef} args={[isMobile ? 2 : 3, 12, isMobile ? 2 : 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.8} transparent opacity={0} />
      </Box>

      <Sparkles count={100} scale={15} size={2} speed={0.2} color="#ffffff" opacity={0.3} />
    </group>
  );
};

// --------------------------------------------------------
// 💡 DYNAMIC LIGHTING
// --------------------------------------------------------
const SceneLights = ({ scrollProgress }) => {
  const ambientRef = useRef();
  const pointRef = useRef();

  useFrame(() => {
    const p = scrollProgress.get();
    let ambientColor = new THREE.Color("#110022"); 
    let pointColor = new THREE.Color("#00ffff"); // TikTok Cyan
    let intensity = 2.0;

    // Shift to pure monochrome reality at the end
    if (p > 0.65) {
      ambientColor = new THREE.Color("#ffffff");
      pointColor = new THREE.Color("#ffffff");
      intensity = 5.0;
    }

    if (ambientRef.current) ambientRef.current.color.lerp(ambientColor, 0.1);
    if (pointRef.current) {
      pointRef.current.color.lerp(pointColor, 0.1);
      pointRef.current.intensity = THREE.MathUtils.lerp(pointRef.current.intensity, intensity, 0.1);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} />
      <pointLight ref={pointRef} position={[5, 5, 5]} distance={50} />
      <pointLight color="#ff00ff" position={[-5, -5, 5]} distance={50} intensity={1} />
    </>
  );
};

// --------------------------------------------------------
// 🚨 POST-PROCESSING (Overstimulation to Clarity)
// --------------------------------------------------------
const MayaEffects = ({ scrollProgress, isMobile }) => {
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(true);
  const aberrationOffset = useMemo(() => new THREE.Vector2(0.02, 0.02), []);

  useEffect(() => setMounted(true), []);

  useFrame(() => {
    const p = scrollProgress.get();
    // The matrix glitch stops completely when the monolith rises
    setGlitchActive(p < 0.65);
    if (p > 0.65) {
      aberrationOffset.set(0, 0); // Kill chromatic aberration for pure clarity
    } else {
      aberrationOffset.set(0.01, 0.01);
    }
  });

  if (!mounted || isMobile) return null;

  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.3} intensity={1.5} mipmapBlur={false} />
      <Noise opacity={0.4} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.4} darkness={0.8} />
      <ChromaticAberration offset={aberrationOffset} />
      {glitchActive && (
        <Glitch delay={[0.5, 1.5]} duration={[0.1, 0.3]} strength={[0.02, 0.06]} active={glitchActive} ratio={0.8} />
      )}
    </EffectComposer>
  );
};

// --------------------------------------------------------
// ⚔️ MAIN EDITORIAL COMPONENT
// --------------------------------------------------------
export default function MayaProtocol({ onBack, onAwaken }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { 
    window.scrollTo(0, 0); 
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

  // 🩸 COLOR SHIFTS (Neon Overload -> Pure Black/White Reality)
  const bgColor = useTransform(sp, 
    [0.0, 0.3, 0.6, 0.7, 1.0], 
    ["#0a0514", "#110011", "#050f1a", "#000000", "#000000"]
  );

  // 🎬 30-SCENE NARRATIVE ENGINE
  const o = (start, peak1, peak2, end) => useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  
  const s1  = o(0.00, 0.01, 0.02, 0.03); // Hook
  const s2  = o(0.03, 0.04, 0.05, 0.06); 
  const s3  = o(0.06, 0.07, 0.08, 0.09); // 7:00 AM
  const s4  = o(0.09, 0.10, 0.11, 0.12); 
  const s5  = o(0.12, 0.13, 0.14, 0.15); // The Rectangle
  const s6  = o(0.15, 0.16, 0.17, 0.18); 
  const s7  = o(0.18, 0.19, 0.20, 0.21); // The Feed
  const s8  = o(0.21, 0.22, 0.23, 0.24); 
  const s9  = o(0.24, 0.25, 0.26, 0.27); // Softness normalized
  const s10 = o(0.27, 0.28, 0.29, 0.30); 
  const s11 = o(0.30, 0.31, 0.32, 0.33); // Engineered
  const s12 = o(0.33, 0.34, 0.35, 0.36); 
  const s13 = o(0.36, 0.37, 0.38, 0.39); // Why?
  const s14 = o(0.39, 0.40, 0.41, 0.42); // A soft man consumes
  const s15 = o(0.42, 0.43, 0.44, 0.45); // Dangerous man
  const s16 = o(0.45, 0.46, 0.47, 0.48); 
  const s17 = o(0.48, 0.49, 0.50, 0.51); // Farming attention
  const s18 = o(0.51, 0.52, 0.53, 0.54); 
  const s19 = o(0.54, 0.55, 0.56, 0.57); // THE SHATTER
  const s20 = o(0.57, 0.58, 0.59, 0.60); 
  
  // -- THE MONOLITH RISES (Monochrome Reality) --
  const s21 = o(0.64, 0.65, 0.67, 0.68); // The Nudge Intro
  const s22 = o(0.68, 0.69, 0.71, 0.72); 
  const s23 = o(0.72, 0.73, 0.75, 0.76); // Boredom
  const s24 = o(0.76, 0.77, 0.79, 0.80); 
  const s25 = o(0.80, 0.81, 0.83, 0.84); // Silence
  const s26 = o(0.84, 0.85, 0.87, 0.88); 
  const s27 = o(0.88, 0.89, 0.91, 0.92); // Hear your voice
  const s28 = o(0.92, 0.93, 0.95, 0.96); 
  const s29 = useTransform(sp, [0.96, 0.98, 1, 1], [0, 1, 1, 1]); // Unplug

  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  
  const offsetLeft = isMobile ? "2vw" : "15vw";
  const offsetRight = isMobile ? "-2vw" : "-15vw";

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[3000vh] font-sans text-white selection:bg-white/30">
      <div className="hidden md:block"><CinematicCursor /></div>

      <button onClick={onBack} className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] px-4 md:px-6 py-2 border border-white/50 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/20 transition-all mix-blend-difference text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        &larr; Return to Hub
      </button>

      {/* 3D CANVAS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, isMobile ? 12 : 8], fov: 60 }}>
          <SceneLights scrollProgress={sp} />
          <MayaMatrixScene scrollProgress={sp} isMobile={isMobile} />
          <MayaEffects scrollProgress={sp} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* EDITORIAL HTML LAYER */}
      <motion.div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* SCENE 1 & 2: The Hook */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.03) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-sm md:text-xl font-mono tracking-[0.4em] text-[#00ffff] mb-4 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">PROTOCOL: MAYA</h1>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-tight text-white drop-shadow-2xl">
            The Digital Cage.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s2, y: driftDown(0.03, 0.06) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white/80 max-w-3xl leading-relaxed">
            You don't even realize you are in it.
          </p>
        </motion.div>

        {/* SCENE 3 & 4: The Morning Routine */}
        <motion.div style={{ opacity: s3, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-3xl md:text-6xl font-bold uppercase tracking-widest text-white leading-tight">
            7:00 AM.<br/>The alarm rings.
          </h3>
        </motion.div>

        <motion.div style={{ opacity: s4, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-4xl font-serif italic text-[#ff00ff] max-w-2xl leading-relaxed drop-shadow-[0_0_20px_rgba(255,0,255,0.4)]">
            Before your feet even touch the physical floor...
          </p>
        </motion.div>

        {/* SCENE 5 & 6: The Rectangle */}
        <motion.div style={{ opacity: s5, y: driftUp(0.12, 0.15) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white bg-black/40 px-8 py-4 border border-[#00ffff]/30 backdrop-blur-md shadow-[0_0_50px_rgba(0,255,255,0.2)]">
            The glowing rectangle is in your hand.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s6, y: driftDown(0.15, 0.18) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-lg md:text-3xl font-light tracking-[0.2em] text-white/60 uppercase">
            Thirty minutes of cheap dopamine before the day even begins.
          </p>
        </motion.div>

        {/* SCENE 7 & 8: The Overload */}
        <motion.div style={{ opacity: s7, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-widest text-[#00ffff] drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]">
            PLUGGED IN.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s8, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <div className="bg-[#110022]/80 border-r-4 border-[#ff00ff] p-8 max-w-2xl backdrop-blur-md">
            <p className="text-lg md:text-2xl font-serif italic text-white/90 leading-relaxed">
              You open the feed. It is a torrential downpour of carefully curated psychological triggers.
            </p>
          </div>
        </motion.div>

        {/* SCENE 9 & 10: The Poison */}
        <motion.div style={{ opacity: s9, y: driftUp(0.24, 0.27) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <div className="flex flex-col gap-6 text-3xl md:text-6xl font-black tracking-tighter uppercase text-white">
            <span className="opacity-50">Men acting soft and weak.</span>
            <span className="text-[#ff00ff] drop-shadow-[0_0_20px_rgba(255,0,255,0.6)]">Hyper-sexualized bait.</span>
            <span className="opacity-50">Manufactured political rage.</span>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s10, y: driftDown(0.27, 0.30) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-2xl md:text-5xl font-light uppercase tracking-widest text-[#00ffff] bg-black/60 px-6 py-2 border border-[#00ffff]/20">
            Mediocrity is Normalized.
          </h2>
        </motion.div>

        {/* SCENE 11 & 12: Engineered */}
        <motion.div style={{ opacity: s11, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-4xl md:text-7xl font-serif italic text-white">
            Do you think this is random?
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s12, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-[0.2em] text-[#ff00ff] drop-shadow-[0_0_40px_rgba(255,0,255,0.5)]">
            IT IS ENGINEERED.
          </h1>
        </motion.div>

        {/* SCENE 13 & 14: The Agenda */}
        <motion.div style={{ opacity: s13, y: driftUp(0.36, 0.39) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-3xl md:text-5xl font-light tracking-widest text-white/70 max-w-4xl">
            They want you numb. They want you scrolling.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s14, y: driftDown(0.39, 0.42) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
           <div className="bg-[#050f1a]/90 border border-[#00ffff]/30 p-8 md:p-12 max-w-3xl rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.1)]">
            <p className="text-2xl md:text-4xl font-serif italic text-white leading-relaxed">
              Because a soft, distracted man does not build his own empire.<br/><br/>
              <span className="text-[#00ffff] font-bold not-italic tracking-widest uppercase text-xl md:text-2xl">He consumes theirs.</span>
            </p>
          </div>
        </motion.div>

        {/* SCENE 15 & 16: The Danger */}
        <motion.div style={{ opacity: s15, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white">
            A FOCUSED MAN IS <span className="text-[#ff00ff]">DANGEROUS.</span>
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s16, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light tracking-widest text-white/60 uppercase max-w-xl">
            A distracted man is highly profitable.
          </p>
        </motion.div>

        {/* SCENE 17 & 18: The Battery */}
        <motion.div style={{ opacity: s17, y: driftUp(0.48, 0.51) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-3xl md:text-6xl font-serif italic text-white drop-shadow-lg">
            You are the battery.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s18, y: driftDown(0.51, 0.54) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-[0.2em] text-[#00ffff] drop-shadow-[0_0_40px_rgba(0,255,255,0.6)] max-w-5xl leading-tight">
            They are farming your life force to power their algorithms.
          </h1>
        </motion.div>

        {/* SCENE 19 & 20: THE SHATTER (Explosion happens here) */}
        <motion.div style={{ opacity: s19, y: driftUp(0.54, 0.57) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <h1 className="text-6xl md:text-[10vw] font-black tracking-[0.5em] uppercase text-white drop-shadow-[0_0_50px_rgba(255,255,255,1)] mix-blend-difference">
            WAKE UP.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s20, y: driftDown(0.57, 0.60) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <p className="text-2xl md:text-4xl font-light tracking-widest text-[#ff00ff] uppercase">
            Shatter the Glass.
          </p>
        </motion.div>

        {/* === PHASE 3: THE MONOLITH (Pure Black & White) === */}

        {/* SCENE 21 & 22: The Solution */}
        <motion.div style={{ opacity: s21, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <div className="bg-black/40 border-l-4 border-white p-6 md:p-10 backdrop-blur-md">
            <h3 className="text-xl md:text-2xl font-mono tracking-[0.4em] text-white/50 mb-4">THE RECLAMATION</h3>
            <h2 className="text-4xl md:text-6xl font-light uppercase tracking-widest text-white">
              Turn off the noise.
            </h2>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s22, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-4xl font-serif italic text-white/80 max-w-2xl">
            Delete the parasite apps. Silence the notifications. Do not let a vibrating piece of plastic command your attention.
          </p>
        </motion.div>

        {/* SCENE 23 & 24: Boredom */}
        <motion.div style={{ opacity: s23, y: driftUp(0.72, 0.75) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            RECLAIM YOUR BOREDOM.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s24, y: driftDown(0.76, 0.79) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
           <div className="bg-black/60 border border-white/20 p-8 rounded-2xl backdrop-blur-lg shadow-2xl">
            <p className="text-2xl md:text-4xl font-light tracking-widest text-white max-w-4xl leading-relaxed">
              Boredom is not the enemy.<br/><br/>
              <span className="font-serif italic text-white/70">Boredom is the crucible where empires are envisioned.</span>
            </p>
          </div>
        </motion.div>

        {/* SCENE 25 & 26: Silence */}
        <motion.div style={{ opacity: s25, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-4xl md:text-7xl font-serif italic text-white">
            The silence will be deafening at first.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s26, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light tracking-[0.2em] text-white/60 uppercase max-w-xl">
            Your brain will beg for the digital pacifier. Let it starve.
          </p>
        </motion.div>

        {/* SCENE 27 & 28: Your Voice */}
        <motion.div style={{ opacity: s27, y: driftUp(0.88, 0.91) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-3xl md:text-6xl font-black tracking-widest uppercase text-white leading-tight">
            Because in that absolute silence...
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s28, y: driftDown(0.92, 0.95) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <div className="bg-black/80 px-12 py-8 rounded-[3rem] border border-white/30 shadow-[0_20px_60px_rgba(255,255,255,0.1)]">
            <h2 className="text-4xl md:text-7xl font-serif italic text-white drop-shadow-md">
              You will finally hear your own voice.
            </h2>
          </div>
        </motion.div>

        {/* SCENE 29: Unplug (Finale) */}
        <motion.div style={{ opacity: s29 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-auto">
          <div className="flex flex-col items-center gap-8">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-[0.4em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              UNPLUG.
            </h1>
            <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent" />
            <button 
              className="..."
              onClick={() => {
                alert("You have exited the Matrix. Welcome to the real world.");
                if (onAwaken) onAwaken(); // 👈 This triggers the teleport to Karma!
              }}
            >
              Step into Reality
            </button>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}