import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Box, Sphere, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, Glitch, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import CinematicCursor from './CinematicCursor';
import { setGlobalMusic } from './GlobalAudio';
const aberrationOffset = new THREE.Vector2(0.015, 0.015);

// --------------------------------------------------------
// 🖼️ HELPER: CINEMATIC IMAGE PLACEHOLDER 
// --------------------------------------------------------
const ImagePlaceholder = ({ title, width, height, className = "", color = "#dc2626" }) => (
  <div style={{ borderColor: `${color}40`, color: color }} className={`relative overflow-hidden bg-black/90 border flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] backdrop-blur-md ${width} ${height} ${className} shadow-[0_0_50px_rgba(0,0,0,0.8)] group`}>
    <div style={{ backgroundImage: `linear-gradient(to top, ${color}20, transparent)` }} className="absolute inset-0 opacity-50" />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
    <span className="relative z-10 drop-shadow-md text-center px-4 leading-relaxed opacity-80">[ {title} ]</span>
  </div>
);

// --------------------------------------------------------
// 🦁 THE 3D EMOTIONAL ENGINE 
// --------------------------------------------------------
const Narasimha3DScene = ({ scrollProgress, isMobile }) => {
  const demonAuraRef = useRef();
  const prahladaRef = useRef();
  const beastRef = useRef();
  
  const pillarGroupRef = useRef();
  const fragmentCount = isMobile ? 20 : 40; 
  const fragments = useMemo(() => {
    return Array.from({ length: fragmentCount }).map(() => ({
      x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 10, z: (Math.random() - 0.5) * 2,
      vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, vz: (Math.random() - 0.5) * 30,
      rx: Math.random() * Math.PI, ry: Math.random() * Math.PI,
    }));
  }, [fragmentCount]);

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    // 🔴 1. THE DEMON KING
    if (demonAuraRef.current) {
      demonAuraRef.current.rotation.y += delta * (scroll > 0.6 ? 8 : 0.5); 
      let demonScale = 1;
      let demonOpacity = 0.8;
      
      if (scroll < 0.2) demonScale = 1 + scroll * 3; 
      if (scroll > 0.64 && scroll < 0.85) demonScale = 2; 
      if (scroll >= 0.88) { demonScale = 0; demonOpacity = 0; } 

      demonAuraRef.current.scale.lerp(new THREE.Vector3(demonScale, demonScale, demonScale), delta * 4);
      demonAuraRef.current.material.opacity = THREE.MathUtils.lerp(demonAuraRef.current.material.opacity, demonOpacity, delta * 3);
      demonAuraRef.current.material.color.lerp(new THREE.Color(scroll > 0.64 ? "#dc2626" : "#4c1d95"), delta * 2);
    }

    // ✨ 2. PRAHLADA
    if (prahladaRef.current) {
      const active = scroll > 0.20 ? 1 : 0;
      prahladaRef.current.material.opacity = THREE.MathUtils.lerp(prahladaRef.current.material.opacity, active, delta * 2);
      prahladaRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5 - 3;
      
      let prahladaScale = scroll >= 0.90 ? 5 : 0.6; // Calms the beast!
      prahladaRef.current.scale.lerp(new THREE.Vector3(prahladaScale, prahladaScale, prahladaScale), delta * 2);
    }

    // 🏛️ 3. THE SHATTERING PILLAR
    if (pillarGroupRef.current) {
      // Appear at "WHERE IS HE" (0.56) and break at "HE STRUCK" (0.64)
      const isVisible = scroll >= 0.56 && scroll < 0.64;
      
      pillarGroupRef.current.children.forEach((child, i) => {
        child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, isVisible ? 1 : (scroll >= 0.64 ? 0.8 : 0), delta * 5);
        
        if (scroll >= 0.64) {
          child.position.x += fragments[i].vx * delta;
          child.position.y += fragments[i].vy * delta;
          child.position.z += fragments[i].vz * delta;
          child.rotation.x += delta * 5;
          child.rotation.y += delta * 5;
          child.material.opacity -= delta * 1.5; 
        } else {
          child.position.set(fragments[i].x, fragments[i].y, fragments[i].z);
          // Vibrate intensely before explosion
          if (scroll > 0.60) child.position.x += Math.sin(state.clock.elapsedTime * 100) * 0.1;
        }
      });
    }

    // 🦁 4. NARASIMHA
    if (beastRef.current) {
      const isActive = scroll >= 0.64 && scroll < 0.95 ? 1 : 0;
      beastRef.current.material.opacity = THREE.MathUtils.lerp(beastRef.current.material.opacity, isActive, delta * 5);
      
      if (scroll >= 0.64 && scroll < 0.90) {
        beastRef.current.rotation.x += delta * 15; 
        beastRef.current.rotation.y += delta * 20;
        beastRef.current.scale.lerp(new THREE.Vector3(2.5, 2.5, 2.5), delta * 5);
      } else if (scroll >= 0.90) {
        beastRef.current.rotation.x = THREE.MathUtils.lerp(beastRef.current.rotation.x, 0, delta * 3);
        beastRef.current.rotation.y = THREE.MathUtils.lerp(beastRef.current.rotation.y, 0, delta * 3);
        beastRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2);
        beastRef.current.material.color.lerp(new THREE.Color("#fbbf24"), delta * 2); 
      }
    }
  });

  return (
    <group position={[0, 0, -5]}>
      <Icosahedron ref={demonAuraRef} args={[isMobile ? 2 : 3, 0]} position={[0, 0, -2]}>
        <meshStandardMaterial color="#4c1d95" emissive="#3b0764" emissiveIntensity={1.5} wireframe transparent opacity={0} />
      </Icosahedron>

      <Sphere ref={prahladaRef} args={[isMobile ? 0.8 : 1, isMobile ? 16 : 32, isMobile ? 16 : 32]} position={[0, -3, 2]}>
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2} transparent opacity={0} />
      </Sphere>

      <group ref={pillarGroupRef}>
        {fragments.map((_, i) => (
          <Box key={i} args={[0.8, 1.5, 0.8]}>
            <meshStandardMaterial color="#1f2937" emissive="#111827" emissiveIntensity={0.2} transparent opacity={0} />
          </Box>
        ))}
      </group>

      <Icosahedron ref={beastRef} args={[isMobile ? 1.5 : 2, isMobile ? 0 : 1]} position={[0, 0, 1]}>
        <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={2} wireframe transparent opacity={0} />
      </Icosahedron>
    </group>
  );
};

// --------------------------------------------------------
// 💡 2. DYNAMIC LIGHTING
// --------------------------------------------------------
const SceneLights = ({ scrollProgress }) => {
  const ambientRef = useRef();
  const pointRef = useRef();

  useFrame(() => {
    const p = scrollProgress.get();
    let color = new THREE.Color("#1e1b4b"); 
    let intensity = 1.0;

    if (p > 0.63 && p < 0.66) {
      color = new THREE.Color("#ffffff"); // FLASHBANG
      intensity = 30.0;
    } else if (p >= 0.66 && p < 0.90) {
      color = new THREE.Color("#dc2626"); // RAGE
      intensity = 6.0;
    } else if (p >= 0.90) {
      color = new THREE.Color("#fbbf24"); // GRACE
      intensity = 3.0;
    }

    if (ambientRef.current) ambientRef.current.color.lerp(color, 0.1);
    if (pointRef.current) {
      pointRef.current.color.lerp(color, 0.1);
      pointRef.current.intensity = THREE.MathUtils.lerp(pointRef.current.intensity, intensity, 0.2);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} />
      <pointLight ref={pointRef} position={[0, 0, 5]} distance={50} />
    </>
  );
};

// --------------------------------------------------------
// 🚨 3. POST-PROCESSING 
// --------------------------------------------------------
const RageEffects = ({ scrollProgress, isMobile }) => {
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => setMounted(true), []);

  useFrame(() => {
    const p = scrollProgress.get();
    setGlitchActive(p > 0.63 && p < 0.88); 
  });

  if (!mounted || isMobile) return null;

  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.2} intensity={2.0} mipmapBlur={false} />
      <Noise opacity={0.4} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.4} darkness={0.8} />
      <ChromaticAberration offset={aberrationOffset} />
      {glitchActive && (
        <Glitch delay={[0, 0]} duration={[0.1, 0.3]} strength={[0.02, 0.05]} active={glitchActive} ratio={0.5} />
      )}
    </EffectComposer>
  );
};

// --------------------------------------------------------
// ⚔️ 4. MAIN EDITORIAL COMPONENT 
// --------------------------------------------------------
export default function NarasimhaLore({ onBack }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => { 
    window.scrollTo(0, 0); 
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  useEffect(() => {
    setGlobalMusic('narasimha');
  }, []);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

  const bgColor = useTransform(sp, 
    [0.0, 0.1, 0.3, 0.5, 0.64, 0.65, 0.8, 0.88, 1.0], 
    ["#020617", "#1e1b4b", "#0f172a", "#111827", "#000000", "#ffffff", "#450a0a", "#1a0f00", "#0a0600"]
  );

  const shake = useTransform(sp, (p) => {
    if (p > 0.56 && p < 0.64) return Math.sin(p * 3000) * 8; 
    if (p > 0.64 && p < 0.88) return Math.sin(p * 1000) * 15; 
    return 0;
  });

  // 🎬 THE FLAWLESS 24-SCENE PACING ENGINE
  const o = (start, peak1, peak2, end) => useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  
  const s1  = o(0.00, 0.001, 0.03, 0.04);
  const s2  = o(0.04, 0.05, 0.07, 0.08);
  const s3  = o(0.08, 0.09, 0.11, 0.12);
  const s4  = o(0.12, 0.13, 0.15, 0.16);
  const s5  = o(0.16, 0.17, 0.19, 0.20);
  const s6  = o(0.20, 0.21, 0.23, 0.24);
  const s7  = o(0.24, 0.25, 0.27, 0.28);
  const s8  = o(0.28, 0.29, 0.31, 0.32);
  const s9  = o(0.32, 0.33, 0.35, 0.36);
  const s10 = o(0.36, 0.37, 0.39, 0.40);
  const s11 = o(0.40, 0.41, 0.43, 0.44);
  const s12 = o(0.44, 0.45, 0.47, 0.48);
  const s13 = o(0.48, 0.49, 0.51, 0.52);
  const s14 = o(0.52, 0.53, 0.55, 0.56);
  const s15 = o(0.56, 0.57, 0.59, 0.60);
  const s16 = o(0.60, 0.61, 0.63, 0.64);
  const s17 = o(0.64, 0.65, 0.67, 0.68);
  const s18 = o(0.68, 0.69, 0.71, 0.72);
  const s19 = o(0.72, 0.73, 0.75, 0.76);
  const s20 = o(0.76, 0.77, 0.79, 0.80);
  const s21 = o(0.80, 0.81, 0.83, 0.84);
  const s22 = o(0.84, 0.85, 0.87, 0.88);
  const s23 = o(0.88, 0.89, 0.91, 0.92);
  const s24 = useTransform(sp, [0.92, 0.94, 0.99, 1], [0, 1, 1, 1]);

  // 🐾 SVG CLAWS MATH 
  const clawDraw = useTransform(sp, [0.84, 0.86], [0, 1]); 
  const clawOpacity = useTransform(sp, [0.84, 0.86, 0.88, 0.90], [0, 1, 1, 0]); 
  const flashbangOpacity = useTransform(sp, [0.64, 0.65, 0.67], [0, 1, 0]);

  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const driftLeft = (start, end) => useTransform(sp, [start, end], [isMobile ? "2vw" : "5vw", isMobile ? "-2vw" : "-5vw"]);
  const driftRight = (start, end) => useTransform(sp, [start, end], [isMobile ? "-2vw" : "-5vw", isMobile ? "2vw" : "5vw"]);

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[2400vh] font-sans text-white">
      
      <div className="hidden md:block"><CinematicCursor /></div>

      <button onClick={onBack} className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] px-4 md:px-6 py-2 border border-white/50 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/20 transition-all mix-blend-difference text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        &larr; Retreat
      </button>

      {/* 💥 THE WHITE-OUT FLASHBANG */}
      <motion.div style={{ opacity: flashbangOpacity }} className="fixed inset-0 bg-white z-[60] pointer-events-none mix-blend-screen" />

      {/* 🐾 BRUTAL CLAW MARKS OVERLAY */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[50] drop-shadow-[0_0_50px_rgba(220,38,38,1)]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path d="M 10 10 L 80 90" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pathLength: clawDraw, opacity: clawOpacity }} />
        <motion.path d="M 25 0 L 95 80" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" fill="none" style={{ pathLength: clawDraw, opacity: clawOpacity }} />
        <motion.path d="M 40 -10 L 110 70" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" fill="none" style={{ pathLength: clawDraw, opacity: clawOpacity }} />
      </svg>

      {/* 3D CANVAS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, isMobile ? 18 : 12], fov: 60 }}>
          <SceneLights scrollProgress={sp} />
          <Narasimha3DScene scrollProgress={sp} isMobile={isMobile} />
          <RageEffects scrollProgress={sp} isMobile={isMobile} />
          <Sparkles count={isMobile ? 50 : 150} scale={20} size={isMobile ? 2 : 4} speed={0.4} color="#fbbf24" opacity={0.3} />
        </Canvas>
      </div>

      {/* EDITORIAL HTML LAYER */}
      <motion.div style={{ x: shake }} className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* SCENE 1: The Blood Oath */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.04) }} className="absolute inset-0 flex flex-col justify-center px-6 md:px-24">
          <h1 className="text-sm md:text-xl font-mono tracking-[0.4em] text-[#a855f7] mb-4">IV. THE PARADOX</h1>
          <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest leading-tight">
            The Blood Oath.
          </h2>
          <p className="text-base md:text-2xl font-serif italic text-white/70 mt-6 max-w-2xl border-l-2 border-[#a855f7]/50 pl-6">
            His brother was slaughtered by Varaha. Hiranyakashyapu looked at the cosmos and swore to burn it to ashes.
          </p>
        </motion.div>

        {/* SCENE 2: The Penance */}
        <motion.div style={{ opacity: s2, y: driftDown(0.04, 0.08) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-none text-white/5 absolute top-1/2 -translate-y-1/2 whitespace-nowrap">IMMORTAL</h1>
          <h2 className="text-2xl md:text-5xl font-light uppercase tracking-widest max-w-4xl relative z-10">
            He stood in fire for millennia until anthills consumed him.
          </h2>
        </motion.div>

        {/* SCENE 3: The Cheat Code Intro */}
        <motion.div style={{ opacity: s3, y: driftUp(0.08, 0.12) }} className="absolute inset-0 flex items-center justify-center text-center px-6 md:px-24">
          <h2 className="text-2xl md:text-5xl font-light uppercase tracking-widest max-w-4xl relative z-10 text-[#EFC63F]">
            Forcing Brahma to grant the ultimate cheat code:
          </h2>
        </motion.div>

        {/* SCENE 4: Boon Split 1 */}
        <motion.div style={{ opacity: s4, x: driftLeft(0.12, 0.16) }} className="absolute inset-0 flex items-center justify-center text-center px-6 md:px-24">
          <div className="bg-[#1a0f00]/90 border border-[#fbbf24]/30 p-6 md:p-10 shadow-2xl backdrop-blur-md">
            <p className="text-xl md:text-4xl font-serif italic tracking-[0.2em] uppercase text-[#EFC63F] drop-shadow-md">
              Not killed by man or beast.<br/><br/>Not inside or outside.
            </p>
          </div>
        </motion.div>

        {/* SCENE 5: Boon Split 2 */}
        <motion.div style={{ opacity: s5, x: driftLeft(0.16, 0.20) }} className="absolute inset-0 flex items-center justify-center text-center px-6 md:px-24">
          <div className="bg-[#1a0f00]/90 border border-[#fbbf24]/30 p-6 md:p-10 shadow-2xl backdrop-blur-md">
            <p className="text-xl md:text-4xl font-serif italic tracking-[0.2em] uppercase text-[#EFC63F] drop-shadow-md">
              Not day or night.<br/><br/>Not earth or sky.<br/><br/>By no weapon forged.
            </p>
          </div>
        </motion.div>

        {/* SCENE 6: The Cowardly Heavens */}
        <motion.div style={{ opacity: s6, y: driftUp(0.20, 0.24) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center md:justify-end px-6 md:px-24">
          <div className="w-full md:max-w-xl text-center md:text-right z-10">
            <h1 className="text-4xl md:text-6xl font-serif uppercase text-[#dc2626] leading-none mb-6">The Heavens Panicked.</h1>
            <p className="text-lg md:text-xl tracking-widest font-light">As the king meditated, Indra tried to abduct his pregnant wife, fearing the child of such a fearsome demon could become an even greater threat.</p>
          </div>
        </motion.div>

        {/* SCENE 7: Cowardly Attempt */}
        <motion.div style={{ opacity: s7, y: driftDown(0.24, 0.28) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <h1 className="text-2xl md:text-5xl font-black tracking-[0.3em] uppercase text-[#F42A2A] drop-shadow-[0_0_20px_rgba(244,42,42,0.8)]">
            A COWARDLY ATTEMPT <br/> ON AN UNBORN CHILD.
          </h1>
        </motion.div>

        {/* SCENE 8: Narada */}
        <motion.div style={{ opacity: s8, y: driftUp(0.28, 0.32) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
          <h1 className="text-3xl md:text-6xl font-light uppercase tracking-widest text-white drop-shadow-md">
            THE SAGE NARADA INTERVENED.
          </h1>
        </motion.div>

        {/* SCENE 9: Ashram */}
        <motion.div style={{ opacity: s9, y: driftDown(0.32, 0.36) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
          <p className="text-lg md:text-3xl tracking-[0.2em] uppercase opacity-90 text-[#fbbf24] font-serif italic drop-shadow-md max-w-5xl leading-relaxed">
            IN THE SAFETY OF THE ASHRAM, THE UNBORN CHILD LISTENED. HE DIDN'T HEAR WAR. HE HEARD THE NAME OF GOD.
          </p>
        </motion.div>

        {/* SCENE 10: OM NAMO NARAYANAYA */}
        <motion.div style={{ opacity: s10 }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-8xl font-black tracking-[0.3em] uppercase text-[#fbbf24] drop-shadow-[0_0_80px_rgba(251,191,36,0.8)] mix-blend-screen">
            "OM NAMO NARAYANAYA."
          </h1>
        </motion.div>

        {/* SCENE 11: The Lotus */}
        <motion.div style={{ opacity: s11, y: driftUp(0.40, 0.44) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-3xl md:text-6xl font-light tracking-widest uppercase text-white drop-shadow-2xl max-w-4xl">
            Prahlada was born. <span className="font-serif italic font-bold text-[#fbbf24] block mt-4">A boy of pure gold in a lineage of ash.</span>
          </h2>
          <p className="text-sm md:text-xl font-mono tracking-widest opacity-100 mt-8 uppercase text-white">The Demon King's ultimate weapon was a saint.</p>
        </motion.div>

        {/* SCENE 12: Treason */}
        <motion.div style={{ opacity: s12, y: driftDown(0.44, 0.48) }} className="absolute inset-0 flex flex-col justify-center text-center md:text-left px-6 md:px-24">
          <h1 className="text-[18vw] font-black uppercase tracking-tighter leading-none text-white/5 absolute top-1/2 -translate-y-1/2 whitespace-nowrap">TREASON</h1>
          <h1 className="text-3xl md:text-6xl font-bold uppercase tracking-widest max-w-2xl leading-tight text-white relative z-10 mb-4">"Kill Him."</h1>
          <h2 className="text-xl md:text-4xl font-light tracking-widest text-white/70 drop-shadow-2xl max-w-4xl relative z-10">Hiranyakashyapu ordered!</h2>
        </motion.div>

        {/* SCENE 13: Torture */}
        <motion.div style={{ opacity: s13, x: driftLeft(0.48, 0.52) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
          <p className="text-xl md:text-4xl font-serif italic text-[#dc2626] tracking-[0.2em] leading-relaxed drop-shadow-md">
            Trampled by elephants. <br className="md:hidden" /> Thrown into pyres. <br/> Bitten by vipers. <br className="md:hidden" /> Poisoned chalices.
          </p>
        </motion.div>

        {/* SCENE 14: Unbreakable */}
        <motion.div style={{ opacity: s14, y: driftUp(0.52, 0.56) }} className="absolute inset-0 flex items-center justify-center md:justify-end px-6 md:px-24">
          <div className="w-full md:max-w-xl text-center md:text-right z-10">
            <h1 className="text-3xl md:text-5xl font-light uppercase tracking-widest leading-tight">But the boy survived every assassination.</h1>
            <p className="text-sm md:text-xl font-mono tracking-widest opacity-80 mt-6 text-[#fbbf24] uppercase">He just smiled, closed his eyes, and prayed to Lord Vishnu.</p>
          </div>
        </motion.div>

        {/* SCENE 15: The Breaking Point */}
        <motion.div style={{ opacity: s15, y: driftDown(0.56, 0.60) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-[#dc2626] mb-4">"WHERE IS HE?!"</h1>
          <p className="text-lg md:text-3xl font-serif italic tracking-[0.2em] text-white">"Is your God in this pillar?!"</p>
        </motion.div>

        {/* SCENE 16: The Father's Answer */}
        <motion.div style={{ opacity: s16, y: driftUp(0.60, 0.64) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-4xl md:text-7xl font-serif italic uppercase tracking-widest text-[#fbbf24] drop-shadow-lg">
            "He is everywhere, Father."
          </h2>
        </motion.div>

        {/* SCENE 17: THE ERUPTION */}
        <motion.div style={{ opacity: s17 }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-9xl font-black uppercase tracking-tighter text-black mix-blend-difference drop-shadow-2xl">
            HE STRUCK <br/> THE STONE.
          </h1>
        </motion.div>

        {/* SCENE 18: Emerged */}
        <motion.div style={{ opacity: s18, y: driftUp(0.68, 0.72) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-2xl md:text-5xl font-light uppercase tracking-widest leading-relaxed max-w-4xl text-white">From inside what emerged was.....</h1>
        </motion.div>

        {/* SCENE 19: NARASIMHA REVEAL */}
        <motion.div style={{ opacity: s19, y: driftDown(0.72, 0.76) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
          <h1 className="text-[15vw] md:text-[12vw] font-black uppercase tracking-tighter leading-none text-[#fbbf24] mb-2 drop-shadow-[0_0_80px_rgba(251,191,36,0.8)]">NARASIMHA</h1>
          <p className="text-2xl md:text-5xl font-light tracking-[0.3em] uppercase text-white mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">Neither Man nor Beast.</p>
        </motion.div>

        {/* SCENE 20: Doorway Split */}
        <motion.div style={{ opacity: s20, x: driftLeft(0.76, 0.80) }} className="absolute inset-0 flex items-center justify-center text-center px-6 md:px-24">
          <div className="bg-[#1a0f00]/90 border border-[#fbbf24]/30 p-8 shadow-2xl backdrop-blur-md">
            <p className="text-lg md:text-3xl tracking-[0.2em] uppercase text-[#EF2828] font-bold italic drop-shadow-md">
              He dragged him to the doorway (Not inside/outside).
            </p>
          </div>
        </motion.div>

        {/* SCENE 21: Twilight Lap Split */}
        <motion.div style={{ opacity: s21, x: driftRight(0.80, 0.84) }} className="absolute inset-0 flex items-center justify-center text-center px-6 md:px-24">
          <div className="bg-[#1a0f00]/90 border border-[#fbbf24]/30 p-8 shadow-2xl backdrop-blur-md">
            <p className="text-lg md:text-3xl tracking-[0.2em] uppercase text-[#EF2828] font-bold italic drop-shadow-md">
              At Twilight (Not day/night).<br/><br/>Placed him on his lap (Not earth/sky).
            </p>
          </div>
        </motion.div>

        {/* SCENE 22: THE BRUTAL EXECUTION (Claws Draw!) */}
        <motion.div style={{ opacity: s22 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24 bg-[#220505]/60 backdrop-blur-md border-y-8 border-[#dc2626]">
          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-[#dc2626] drop-shadow-[0_0_80px_rgba(220,38,38,1)] mb-6">
            DISEMBOWELED.
          </h1>
          <p className="text-xl md:text-4xl font-bold italic text-white tracking-widest max-w-4xl drop-shadow-2xl leading-relaxed">
            No weapons forged. With a cosmic roar, he plunged his bare, divine claws into the tyrant's stomach and tore him wide open.
          </p>
        </motion.div>

        {/* SCENE 23: The Aftermath */}
        <motion.div style={{ opacity: s23, y: driftDown(0.88, 0.92) }} className="absolute inset-0 flex items-center justify-center px-6 md:px-24 text-center">
          <div className="w-full z-10">
            <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest text-[#dc2626] mb-8 drop-shadow-md">
              The Gods backed away in terror.
            </h2>
            <div className="inline-block bg-black/50 p-6 md:p-10 border border-[#dc2626]/30 shadow-2xl backdrop-blur-sm">
              <p className="text-lg md:text-3xl tracking-[0.2em] uppercase text-white font-serif italic max-w-4xl mx-auto leading-relaxed">
                The invincible king was shredded. The beast drank the blood, his rage shaking the very stars...
                <br/><br/>
                <span className="text-[#fbbf24] font-bold">Only the child stepped forward. Unafraid.</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* SCENE 24: THE GRACE */}
        <motion.div style={{ opacity: s24 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-3xl md:text-6xl font-light tracking-[0.3em] uppercase mb-8 text-[#fbbf24]">The Beast Wept.</h1>
          <p className="text-sm md:text-xl opacity-90 tracking-widest uppercase mb-10 text-white">Little hands touched the blood-soaked mane. The rage melted into infinite fatherly love.</p>
          <div className="w-[1px] h-16 md:h-32 bg-gradient-to-b from-[#fbbf24] to-transparent mb-10" />
          <div className="w-full max-w-5xl text-base md:text-4xl font-serif leading-relaxed p-8 md:p-12 border border-[#fbbf24]/30 bg-[#1a0f00]/90 backdrop-blur-2xl rounded-2xl md:rounded-[3rem] shadow-[0_0_80px_rgba(251,191,36,0.2)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent opacity-50" />
            &quot;The universe will shatter its own physical laws, spawn terrifying monsters, and rip reality apart...<br/><br/>
            <span className="text-[#fbbf24] uppercase tracking-widest text-sm md:text-3xl not-italic block mt-4">Just to honor the unwavering faith of a single pure heart.</span>&quot;
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}