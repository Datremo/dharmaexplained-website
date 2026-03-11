import React, { useRef, useMemo,useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Box, Sphere, Cylinder, Torus, Icosahedron } from '@react-three/drei';
import CinematicCursor from './CinematicCursor'; 
import { setGlobalMusic } from './GlobalAudio';

// --------------------------------------------------------
// 🐢 THE 3D TECTONIC ENGINE (Vortex & Gravity)
// --------------------------------------------------------
const Kurma3DScene = ({ scrollProgress }) => {
  const nebulaRef = useRef();
  const mountainRef = useRef();
  const serpentRef = useRef();
  const shellRef = useRef();
  const cameraGroupRef = useRef();

  // 1. Generate the Milky Ocean Particles (Swirling Vortex)
  const { particles } = useMemo(() => {
    const pos = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000 * 3; i++) {
      const radius = Math.random() * 25 + 2; 
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 30;
      pos[i * 3] = radius * Math.cos(theta);     
      pos[i * 3 + 1] = y;                        
      pos[i * 3 + 2] = radius * Math.sin(theta); 
    }
    return { particles: pos };
  }, []);

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    // 🎥 CAMERA GRAVITY DROP (The Sinking Feeling)
    if (cameraGroupRef.current) {
      let targetY = 0;
      if (scroll > 0.63 && scroll < 0.77) targetY = THREE.MathUtils.lerp(0, 20, (scroll - 0.63) * 7);
      else if (scroll >= 0.77) targetY = 15; 
      
      cameraGroupRef.current.position.y = THREE.MathUtils.lerp(cameraGroupRef.current.position.y, targetY, delta * 3);
    }

    // 🌌 THE COSMIC OCEAN (Vortex Logic)
    if (nebulaRef.current) {
      let spinSpeed = 0.05;
      if (scroll > 0.49 && scroll < 0.70) spinSpeed = 1.5; 
      else if (scroll >= 0.70) spinSpeed = 0.2; 

      nebulaRef.current.rotation.y += delta * spinSpeed;
      
      const isToxic = scroll > 0.56 && scroll < 0.65;
      nebulaRef.current.material.color.lerp(new THREE.Color(isToxic ? "#10b981" : "#e2e8f0"), delta * 3);
      nebulaRef.current.material.size = isToxic ? 0.15 : 0.05; 
    }

    // 🏔️ THE MOUNTAIN & SERPENT (Mandara & Vasuki)
    if (mountainRef.current && serpentRef.current) {
      const active = scroll > 0.34 ? 1 : 0;
      mountainRef.current.material.opacity = THREE.MathUtils.lerp(mountainRef.current.material.opacity, active, delta * 5);
      serpentRef.current.material.opacity = THREE.MathUtils.lerp(serpentRef.current.material.opacity, active, delta * 5);

      let mountY = 0;
      if (scroll > 0.63 && scroll < 0.84) mountY = THREE.MathUtils.lerp(0, -15, (scroll - 0.63) * 5);
      else if (scroll >= 0.84) mountY = -12; 

      mountainRef.current.position.y = THREE.MathUtils.lerp(mountainRef.current.position.y, mountY, delta * 5);
      serpentRef.current.position.y = mountainRef.current.position.y;

      let mountSpin = 0.1;
      if (scroll > 0.49) mountSpin = Math.sin(state.clock.elapsedTime * 5) * 2; 
      if (scroll > 0.84) mountSpin = 0.5; 

      mountainRef.current.rotation.y = mountSpin;
      serpentRef.current.rotation.y = mountSpin;
      serpentRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.05); 
    }

    // 🐢 THE COLOSSAL SHELL (Kurma)
    if (shellRef.current) {
      const active = scroll > 0.76 ? 1 : 0;
      shellRef.current.material.opacity = THREE.MathUtils.lerp(shellRef.current.material.opacity, active, delta * 3);
      
      const shellY = scroll > 0.77 ? -15 : -30;
      const shellZ = scroll > 0.83 ? -1 : -5;
      const shellRotX = scroll > 0.83 ? 0.35 : 0; 

      shellRef.current.position.y = THREE.MathUtils.lerp(shellRef.current.position.y, shellY, delta * 2);
      shellRef.current.position.z = THREE.MathUtils.lerp(shellRef.current.position.z, shellZ, delta * 2);
      shellRef.current.rotation.x = THREE.MathUtils.lerp(shellRef.current.rotation.x, shellRotX, delta * 2);
      
      shellRef.current.rotation.y += delta * 0.05; 
    }
  });

  return (
    <group ref={cameraGroupRef}>
      {/* 🌌 The Ocean of Milk */}
      <points ref={nebulaRef} position={[0, -5, -10]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={3000} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#e2e8f0" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </points>

      {/* 🏔️ Mount Mandara */}
      <Icosahedron ref={mountainRef} args={[3, 1]} position={[0, 0, -5]}>
        <meshStandardMaterial color="#b45309" wireframe transparent opacity={0} emissive="#b45309" emissiveIntensity={0.2} />
      </Icosahedron>

      {/* 🐍 Vasuki the Serpent */}
      <Torus ref={serpentRef} args={[3.2, 0.2, 16, 100]} position={[0, 0, -5]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} transparent opacity={0} />
      </Torus>

      {/* 🐢 Kurma the Tortoise Shell */}
      <Icosahedron ref={shellRef} args={[8, 2]} position={[0, -30, -5]} scale={[1, 0.3, 1]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.5} wireframe transparent opacity={0} />
      </Icosahedron>

      <ambientLight intensity={0.5} />
      <pointLight position={[0, -15, -2]} color="#fbbf24" intensity={2} distance={30} />
    </group>
  );
};

// --------------------------------------------------------
// 🎬 THE MAIN EDITORIAL SCROLL COMPONENT (14 SCENES)
// --------------------------------------------------------
export default function KurmaLore({ onBack }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    setGlobalMusic('kurma');
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 40, damping: 20, mass: 1 });

  // 🧪 THE TOXIC COLOR SHIFT & SINKING VOID
  const bgColor = useTransform(sp, 
    [0.0, 0.49, 0.58, 0.65, 0.70, 0.84, 1.0], 
    ["#0f0500", "#0f0500", "#022c22", "#000000", "#000000", "#0a0600", "#0a0600"]
  );
  const textColor = useTransform(sp, [0, 1], ["#ffffff", "#ffffff"]);
  
  // 💥 HEAVY SCREEN SHAKE
  const shake = useTransform(sp, (p) => {
    if (p > 0.49 && p < 0.70) return Math.sin(p * 800) * 15; 
    if (p > 0.83 && p < 0.86) return Math.sin(p * 400) * 20; 
    return 0;
  });

  // 🧮 14 STRICT NON-OVERLAPPING OPACITY WINDOWS
  const o = (start, peak1, peak2, end) => useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  const s1  = o(0.00, 0.01, 0.05, 0.07); 
  const s2  = o(0.07, 0.09, 0.12, 0.14); 
  const s3  = o(0.14, 0.16, 0.19, 0.21); 
  const s4  = o(0.21, 0.23, 0.26, 0.28); 
  const s5  = o(0.28, 0.30, 0.33, 0.35); 
  const s6  = o(0.35, 0.37, 0.40, 0.42); 
  const s7  = o(0.42, 0.44, 0.47, 0.49); 
  const s8  = o(0.49, 0.51, 0.54, 0.56); 
  const s9  = o(0.56, 0.58, 0.61, 0.63); 
  const s10 = o(0.63, 0.65, 0.68, 0.70); 
  const s11 = o(0.70, 0.72, 0.75, 0.77); 
  const s12 = o(0.77, 0.79, 0.82, 0.84); 
  const s13 = o(0.84, 0.86, 0.89, 0.91); 
  const s14 = useTransform(sp, [0.91, 0.93, 0.99, 1], [0, 1, 1, 1]); 

  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const driftLeft = (start, end) => useTransform(sp, [start, end], [isMobile ? "0vw" : "5vw", isMobile ? "0vw" : "-5vw"]);
  const driftRight = (start, end) => useTransform(sp, [start, end], [isMobile ? "0vw" : "-5vw", isMobile ? "0vw" : "5vw"]);

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[1400vh] font-sans">
      <div className="hidden md:block"><CinematicCursor /></div>
      
      <button onClick={onBack} className="fixed top-6 left-6 md:top-10 md:left-10 z-[100] px-4 md:px-6 py-2 border border-[#fbbf24]/30 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-[#fbbf24]/10 transition-all mix-blend-difference text-white shadow-[0_0_20px_rgba(251,191,36,0.2)]">
        &larr; Exit Domain
      </button>

      {/* 3D TECTONIC BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.2} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} intensity={2.0} mipmapBlur />
            <Vignette eskil={false} offset={0.4} darkness={0.8} /> 
            <Noise opacity={0.15} />
          </EffectComposer>
          <Kurma3DScene scrollProgress={sp} />
        </Canvas>
      </div>

      {/* EDITORIAL HTML LAYER */}
      <motion.div style={{ x: shake, color: textColor }} className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* S1: Asteroid Mouth placed perfectly at the start */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.07) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-24 gap-8 md:gap-16 pt-20 md:pt-0">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10">
            <h1 className="text-xl md:text-2xl font-mono tracking-[0.4em] text-[#fbbf24] mb-4">II. THE ANCHOR</h1>
            <h2 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-tight">
              Immortality is not<br className="hidden md:block"/>a permanent state.
            </h2>
            <p className="text-lg md:text-2xl font-serif italic text-white/50 mt-4 md:mt-6 md:border-l border-[#fbbf24]/30 md:pl-6">
              Even the Gods can bleed.
            </p>
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <img src="/kurma-1.png" alt="Asteroid Mouth" className="w-[80vw] md:w-full max-w-lg h-[30vh] md:h-[60vh] rounded-[2rem] md:rounded-full opacity-90 object-cover shadow-[0_0_60px_rgba(251,191,36,0.15)] mix-blend-screen border border-[#fbbf24]/20" />
          </div>
        </motion.div>

        {/* SCENE 2 */}
        <motion.div style={{ opacity: s2, y: driftDown(0.07, 0.14) }} className="absolute inset-0 flex flex-col justify-center px-10">
          <h1 className="text-[12vw] font-black uppercase tracking-tighter leading-none text-white/5 absolute top-1/2 -translate-y-1/2 whitespace-nowrap">
            DECAY DECAY
          </h1>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-widest max-w-4xl ml-auto text-right">
            Cursed by a furious sage, <span className="font-serif italic text-[#fbbf24]">the cosmos began to rot.</span>
          </h2>
          <p className="text-right tracking-[0.3em] uppercase opacity-60 mt-6 max-w-xl ml-auto">
            The heavens withered. The Gods grew weak. The Demons broke the gates.
          </p>
        </motion.div>

        {/* SCENE 3: The Unholy Pact */}
        <motion.div style={{ opacity: s3, x: driftLeft(0.14, 0.21) }} className="absolute inset-0 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between px-6 md:px-24 gap-8 md:gap-16 pt-20 md:pt-0">
          <div className="w-full md:w-1/2 flex justify-center md:justify-start">
             <img src="/kurma-pact.png" alt="Deva and Asura Pact" className="w-[80vw] md:w-[40vw] h-[25vh] md:h-[35vh] rounded-[2rem] border border-[#fbbf24]/30 object-cover shadow-[0_0_50px_rgba(251,191,36,0.15)]" />
          </div>
          <div className="w-full md:max-w-xl text-center md:text-right z-10">
            <h1 className="text-4xl md:text-6xl font-serif uppercase text-[#ff3366] leading-none mb-4 md:mb-6 drop-shadow-[0_0_20px_rgba(255,51,102,0.3)]">
              The Unholy Pact.
            </h1>
            <p className="text-lg md:text-xl tracking-widest font-light">Facing extinction, sworn enemies made the ultimate compromise.</p>
            <p className="text-xs md:text-sm font-mono tracking-widest opacity-50 mt-4 text-[#fbbf24]">A TRUCE BORN OF PURE DESPERATION.</p>
          </div>
        </motion.div>

        {/* SCENE 4: Ocean of Milk */}
        <motion.div style={{ opacity: s4, y: driftUp(0.21, 0.28) }} className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-6 md:gap-12">
          <img src="/kurma-3.png" alt="Cosmic Ocean of Milk" className="w-full md:max-w-5xl h-[30vh] md:h-[45vh] rounded-[2rem] md:rounded-[4rem] border border-white/20 object-cover shadow-[0_0_60px_rgba(255,255,255,0.05)]" />
          <div className="z-10 bg-black/60 backdrop-blur-xl p-6 md:p-12 text-center border-t border-b border-white/30 w-full md:max-w-4xl shadow-[0_0_50px_rgba(255,255,255,0.05)] rounded-2xl md:rounded-none">
            <p className="tracking-[0.4em] uppercase mb-4 text-[#fbbf24]">Their Objective</p>
            <h1 className="text-2xl md:text-5xl font-light uppercase tracking-widest text-white">
              Extract <span className="font-serif italic font-bold">Amrita</span>, the nectar of eternal life.
            </h1>
            <p className="tracking-[0.2em] uppercase mt-4 md:mt-6 opacity-60">Hidden at the absolute bottom of the Cosmic Ocean.</p>
          </div>
        </motion.div>

        {/* SCENE 5 */}
        <motion.div style={{ opacity: s5, y: driftUp(0.28, 0.35) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-10">
          <h1 className="text-[6vw] md:text-[8vw] font-black tracking-tighter uppercase leading-[0.8] mix-blend-overlay opacity-30">
            SAMUDRA MANTHAN
          </h1>
          <h2 className="absolute text-4xl md:text-6xl font-light tracking-widest uppercase text-white drop-shadow-2xl">
            But how do you churn an <span className="font-serif italic text-[#00ccff]">ocean of stars?</span>
          </h2>
        </motion.div>

        {/* SCENE 6: The Torn Asteroid Mountain */}
        <motion.div style={{ opacity: s6, y: driftDown(0.35, 0.42) }} className="absolute inset-0 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between px-6 md:px-24 gap-8 md:gap-16 pt-20 md:pt-0">
          <div className="w-full md:flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10">
            <h1 className="text-3xl md:text-6xl font-light uppercase tracking-widest max-w-2xl leading-tight">
              You tear a mountain from the earth.
            </h1>
            <p className="text-xl md:text-2xl font-serif italic text-[#fbbf24] mt-4 md:mt-6 tracking-[0.2em]">To use as a churning rod.</p>
          </div>
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <img src="/kurma-tornmountain.png" alt="Asteroid Mountain" className="w-[70vw] md:w-[30vw] h-[40vh] md:h-[40vh] rounded-[2rem] md:rounded-[3rem] object-cover shadow-[0_0_50px_rgba(251,191,36,0.15)] border border-[#fbbf24]/30" />
          </div>
        </motion.div>

        {/* SCENE 7: Vasuki the Serpent King */}
        <motion.div style={{ opacity: s7, x: driftRight(0.42, 0.49) }} className="absolute inset-0 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between px-6 md:px-24 gap-8 md:gap-16 pt-20 md:pt-0">
          <div className="w-full md:w-1/2 flex justify-center md:justify-start">
             <img src="/kurma-vasuki.png" alt="Vasuki the Serpent King" className="w-[80vw] md:w-[35vw] h-[35vh] md:h-[55vh] rounded-[2rem] md:rounded-[3rem] border border-[#00ccff]/30 object-cover shadow-[0_0_50px_rgba(0,204,255,0.15)]" />
          </div>
          <div className="w-full md:max-w-xl text-center md:text-right z-10">
            <h1 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-tight">
              You bind it with the King of Serpents.
            </h1>
            <div className="inline-block md:block mt-4 md:mt-6 border-b md:border-b-0 md:border-r-2 border-[#00ccff]/50 pb-2 md:pb-0 md:pr-6">
              <p className="text-2xl md:text-4xl font-serif italic text-[#00ccff] tracking-[0.2em] drop-shadow-md">To use as your rope.</p>
            </div>
          </div>
        </motion.div>

        {/* SCENE 8: The Ignition (Added the Cosmic Machine here!) */}
        <motion.div style={{ opacity: s8, y: driftUp(0.49, 0.56) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center px-6 md:px-24 gap-8 md:gap-16 pt-20 md:pt-0">
          <div className="w-full md:w-1/2 flex justify-center md:justify-start">
            <img src="/kurma-churn.png" alt="Cosmic Machine" className="w-full md:w-[45vw] h-[30vh] md:h-[60vh] rounded-[2rem] md:rounded-[3rem] object-cover shadow-[0_0_40px_rgba(251,191,36,0.15)] mix-blend-screen" />
          </div>
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 md:mb-6">
              THE IGNITION
            </h1>
            <p className="text-lg md:text-2xl font-light tracking-[0.3em] uppercase">
              Gods pulling the tail. Demons pulling the head.
            </p>
            <p className="text-base md:text-xl font-serif italic mt-4 md:mt-6 opacity-80 md:border-l border-white/30 md:pl-4">The greatest cosmic machine roared to life.</p>
          </div>
        </motion.div>

        {/* SCENE 9: The Poison */}
        <motion.div style={{ opacity: s9, y: driftDown(0.56, 0.63) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-none absolute select-none text-[#10b981]/20">POISON</h1>
          <div className="z-10 bg-[#022c22]/80 backdrop-blur-xl border border-[#10b981]/30 p-12 shadow-[0_0_100px_rgba(16,185,129,0.2)]">
            <h2 className="text-4xl md:text-6xl font-light uppercase tracking-widest text-[#10b981] mb-6 drop-shadow-md">
              The friction was catastrophic.
            </h2>
            <p className="text-2xl md:text-3xl font-serif italic text-white/80 max-w-3xl">
              Before the nectar, came the Halahala—a venom so lethal it threatened to melt reality.
            </p>
          </div>
        </motion.div>

        {/* SCENE 10 */}
        <motion.div style={{ opacity: s10, x: driftLeft(0.63, 0.70) }} className="absolute inset-0 flex items-center px-10 md:px-24">
          <h1 className="text-[20vw] font-black text-white/5 absolute -left-10 top-1/2 -translate-y-1/2 leading-none select-none">SINK</h1>
          <div className="flex-1 z-10 pl-10 border-l-[4px] border-[#ff3366]">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4">
              The machine was too heavy.
            </h2>
            <p className="text-2xl tracking-[0.3em] uppercase text-[#ff3366]">It pierced the crust of the universe.</p>
          </div>
        </motion.div>

        {/* SCENE 11 */}
        <motion.div style={{ opacity: s11, y: driftDown(0.70, 0.77) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <p className="text-xl md:text-2xl font-mono tracking-[0.5em] text-white/40 mb-8 uppercase">/ Critical Failure /</p>
          <h1 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-relaxed max-w-4xl">
            Mount Mandara began to sink into the abyss.<br/>
            <span className="font-serif italic text-[#ff3366]/80 text-3xl">The nectar, the Gods, the universe... all dragging into the void.</span>
          </h1>
        </motion.div>

        {/* SCENE 12: Displacement (Added the compression image here) */}
        <motion.div style={{ opacity: s12, y: driftUp(0.77, 0.84) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center px-6 md:px-24 gap-8 md:gap-16 pt-20 md:pt-0">
          <div className="w-full md:w-auto flex justify-center md:justify-start">
             <img src="/kurma-push.png" alt="Compression Base" className="w-[70vw] md:w-[35vw] h-[30vh] md:h-[50vh] rounded-[2rem] md:rounded-[3rem] object-cover shadow-[0_0_50px_rgba(251,191,36,0.2)] border border-[#fbbf24]/20" />
          </div>
          <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right z-10 w-full flex-grow">
            <div className="w-[1px] h-12 md:h-20 bg-gradient-to-b from-transparent to-[#fbbf24] mb-4 md:mb-8" />
            <h1 className="text-4xl md:text-6xl font-serif text-[#EDECEA] drop-shadow-[0_0_50px_rgb(255, 255, 255)]">
              Then... the abyss pushed back.
            </h1>
          </div>
        </motion.div>

        {/* SCENE 13: Kurma Revealed */}
        <motion.div style={{ opacity: s13, y: driftUp(0.84, 0.91) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center px-6 md:px-24 gap-8 md:gap-16 pt-20 md:pt-0">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 w-full">
            <h2 className="text-[16vw] md:text-[10vw] font-black uppercase tracking-tighter leading-none text-[#fbbf24] mb-2 drop-shadow-[0_0_80px_rgba(251,191,36,0.8)] mix-blend-screen">
              KURMA
            </h2>
            <p className="text-2xl md:text-5xl font-light tracking-[0.3em] uppercase text-white mb-6 md:mb-8 drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)]">
              The Cosmic Tortoise.
            </p>
            <div className="inline-block bg-[#0a0600]/60 backdrop-blur-lg border border-[#fbbf24]/40 px-6 py-3 md:px-10 md:py-5 rounded-[2rem] shadow-[0_0_50px_rgba(251,191,36,0.15)]">
               <p className="text-sm md:text-xl tracking-[0.2em] uppercase text-[#fbbf24] italic font-serif drop-shadow-md">
                 The unyielding anchor of reality.
               </p>
            </div>
          </div>
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <img src="/kurma-7.png" alt="The Cosmic Tortoise" className="w-[80vw] md:w-[40vw] h-[35vh] md:h-[65vh] rounded-[2rem] md:rounded-[3rem] object-cover shadow-[0_0_60px_rgba(251,191,36,0.2)] border border-[#fbbf24]/30" />
          </div>
        </motion.div>

        {/* SCENE 14 */}
        <motion.div style={{ opacity: s14 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <h1 className="text-2xl md:text-4xl font-light tracking-[0.3em] uppercase mb-12 text-[#fbbf24]">
            The Foundation.
          </h1>
          <p className="text-lg opacity-60 tracking-widest uppercase mb-12">He caught the sinking mountain upon his back.</p>
          <div className="w-[1px] h-32 bg-gradient-to-b from-[#fbbf24] to-transparent mb-12" />
          <div className="max-w-4xl text-3xl md:text-5xl font-serif leading-tight p-12 border border-[#fbbf24]/20 bg-black/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_0_50px_rgba(251,191,36,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent opacity-50" />
            &quot;To extract the truth, the world must be violently churned.<br/><br/>
            <span className="text-[#fbbf24] uppercase tracking-widest text-2xl md:text-4xl not-italic">But without an unshakeable foundation, even the greatest ambitions will sink.</span>&quot;
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}