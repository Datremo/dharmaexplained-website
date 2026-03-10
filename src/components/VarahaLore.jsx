import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Sparkles, Cylinder, Octahedron } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import CinematicCursor from './CinematicCursor';
import { setGlobalMusic } from './GlobalAudio';

const aberrationOffset = new THREE.Vector2(0.005, 0.005);

// --------------------------------------------------------
// 🖼️ HELPER: CINEMATIC IMAGE PLACEHOLDER 
// --------------------------------------------------------
const ImagePlaceholder = ({ title, width, height, className = "" }) => (
  <div className={`relative overflow-hidden bg-[#271c19]/80 border border-[#ff3300]/30 flex items-center justify-center text-[#ff3300]/60 font-mono text-[10px] uppercase tracking-[0.3em] backdrop-blur-md ${width} ${height} ${className} shadow-[0_0_40px_rgba(255,51,0,0.1)] group`}>
    <div className="absolute inset-0 bg-gradient-to-t from-[#ff3300]/20 via-transparent to-transparent opacity-50" />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
    <span className="relative z-10 drop-shadow-md text-center px-4 leading-relaxed">[ {title} ]</span>
  </div>
);

// --------------------------------------------------------
// 🩸 1. THE BRUTAL ABYSS 
// --------------------------------------------------------
const ChaosAbyss = ({ scrollProgress, isMobile }) => {
  const groupRef = useRef();
  const earthRef = useRef();
  const demonRef = useRef();
  const tuskLeftRef = useRef();
  const tuskRightRef = useRef();
  
  const debris = useMemo(() => {
    const items = [];
    for(let i = 0; i < (isMobile ? 60 : 120); i++) { // Less particles on mobile for performance!
      items.push({
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 20 - 10, 
        scale: Math.random() * 1.5 + 0.2,
      });
    }
    return items;
  }, [isMobile]);

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    // 🌍 THE EARTH (Bhumi)
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.2;
      let earthY = Math.sin(state.clock.elapsedTime * 2) * 0.2; 
      
      if (scroll > 0.15 && scroll < 0.5) earthY = THREE.MathUtils.lerp(0, -20, (scroll - 0.15) * 3);
      else if (scroll >= 0.5) earthY = -20;

      if (scroll > 0.6 && scroll < 0.75) {
        earthRef.current.position.x = Math.sin(state.clock.elapsedTime * 40) * 0.1;
      } else {
        earthRef.current.position.x = 0;
      }
      earthRef.current.position.y = THREE.MathUtils.lerp(earthRef.current.position.y, earthY, delta * 5);
    }

    // 🩸 THE DEMON (Hiranyaksha)
    if (demonRef.current) {
      const active = scroll > 0.1 && scroll < 0.75 ? 1 : 0;
      demonRef.current.material.opacity = THREE.MathUtils.lerp(demonRef.current.material.opacity, active, delta * 5);
      
      let demonY = 4;
      let demonScale = isMobile ? 0.8 : 1; // Slightly smaller on mobile

      if (scroll > 0.15 && scroll < 0.5) demonY = THREE.MathUtils.lerp(4, -18, (scroll - 0.15) * 3);
      else if (scroll >= 0.5 && scroll <= 0.6) demonY = -18;
      else if (scroll > 0.6 && scroll < 0.75) {
        demonY = -18 + Math.cos(state.clock.elapsedTime * 20) * 2;
        demonScale = isMobile ? 1.0 : 1.3; 
      } else if (scroll >= 0.75) {
        demonScale = 0; 
      }

      demonRef.current.position.y = THREE.MathUtils.lerp(demonRef.current.position.y, demonY, delta * 5);
      demonRef.current.scale.lerp(new THREE.Vector3(demonScale, demonScale, demonScale), delta * 5);
      demonRef.current.rotation.z -= delta * 2;
    }

    // 🐗 THE TUSKS (Varaha)
    if (tuskLeftRef.current && tuskRightRef.current) {
      const active = scroll > 0.5 ? 1 : 0; 
      tuskLeftRef.current.material.opacity = THREE.MathUtils.lerp(tuskLeftRef.current.material.opacity, active, delta * 5);
      tuskRightRef.current.material.opacity = tuskLeftRef.current.material.opacity;

      let tuskY = -40; 
      if (scroll > 0.6 && scroll < 0.75) tuskY = -20 + Math.sin(state.clock.elapsedTime * 30) * 2; 
      else if (scroll >= 0.75) tuskY = -22; 

      tuskLeftRef.current.position.y = THREE.MathUtils.lerp(tuskLeftRef.current.position.y, tuskY, delta * 8);
      tuskRightRef.current.position.y = tuskLeftRef.current.position.y;
    }

    // 🌪️ THE MUD VORTEX
    if (groupRef.current) {
      const speed = scroll > 0.6 && scroll < 0.75 ? 3.0 : 0.2;
      groupRef.current.rotation.y += delta * speed;
      
      let vortexY = 0;
      if (scroll > 0.15 && scroll < 0.5) vortexY = THREE.MathUtils.lerp(0, 30, (scroll - 0.15) * 3);
      else if (scroll > 0.75) vortexY = THREE.MathUtils.lerp(30, -10, (scroll - 0.75) * 4); 
      
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, vortexY, delta * 3);
    }

    // 🎥 CAMERA GRAVITY
    let targetCamY = 0;
    if (scroll > 0.15 && scroll < 0.5) targetCamY = THREE.MathUtils.lerp(0, -20, (scroll - 0.15) * 3);
    else if (scroll >= 0.5 && scroll < 0.75) targetCamY = -20;
    else if (scroll >= 0.75) targetCamY = THREE.MathUtils.lerp(-20, 0, (scroll - 0.75) * 4);

    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetCamY, delta * 4);

    if (scroll > 0.6 && scroll < 0.75) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.3; 
    } else {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 0, delta * 5);
    }
  });

  return (
    <group>
      <group ref={groupRef}>
        {debris.map((d, i) => (
          <Icosahedron key={i} args={[d.scale, 0]} position={[d.x, d.y, d.z]}>
            <meshStandardMaterial color="#451a03" emissive="#1a0000" roughness={0.9} wireframe={i % 5 === 0} transparent opacity={0.6} />
          </Icosahedron>
        ))}
      </group>
      {/* Slightly smaller earth on mobile */}
      <Icosahedron ref={earthRef} args={[isMobile ? 1.5 : 2, 4]} position={[0, 0, -5]}>
        <meshStandardMaterial color="#3b82f6" emissive="#1e3a8a" emissiveIntensity={1} wireframe transparent opacity={1} />
      </Icosahedron>
      <Octahedron ref={demonRef} args={[isMobile ? 2 : 3, 0]} position={[0, 5, -8]}>
        <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={2} wireframe transparent opacity={0} />
      </Octahedron>
      {/* Adjusted Tusks for Mobile */}
      <Cylinder ref={tuskLeftRef} args={[0.1, 1.2, 15, 32]} position={[isMobile ? -1.0 : -1.5, -40, -5]} rotation={[0, 0, -0.2]}>
        <meshStandardMaterial color="#fbbf24" emissive="#b45309" emissiveIntensity={1} wireframe transparent opacity={0} />
      </Cylinder>
      <Cylinder ref={tuskRightRef} args={[0.1, 1.2, 15, 32]} position={[isMobile ? 1.0 : 1.5, -40, -5]} rotation={[0, 0, 0.2]}>
        <meshStandardMaterial color="#fbbf24" emissive="#b45309" emissiveIntensity={1} wireframe transparent opacity={0} />
      </Cylinder>
    </group>
  );
};

// --------------------------------------------------------
// 💡 2. DYNAMIC LIGHTING
// --------------------------------------------------------
const DynamicRageLights = ({ scrollProgress }) => {
  const ambientRef = useRef();
  const pointRef = useRef();

  useFrame(() => {
    const p = scrollProgress.get();
    let color = new THREE.Color("#002244"); 
    let intensity = 0.5;

    if (p > 0.6 && p < 0.75) {
      color = new THREE.Color("#ff0000"); 
      intensity = 4.0;
    } else if (p >= 0.75) {
      color = new THREE.Color("#3b82f6"); 
      intensity = 1.5;
    }

    if (ambientRef.current) {
      ambientRef.current.color.lerp(color, 0.1);
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, intensity, 0.1);
    }
    if (pointRef.current) {
      pointRef.current.color.lerp(color, 0.1);
      pointRef.current.intensity = THREE.MathUtils.lerp(pointRef.current.intensity, intensity * 2, 0.1);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} />
      <pointLight ref={pointRef} position={[0, -20, 5]} distance={50} />
    </>
  );
};

// --------------------------------------------------------
// 🚨 3. POST-PROCESSING
// --------------------------------------------------------
const RageEffects = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.2} intensity={2.0} mipmapBlur={false} />
      <Noise opacity={0.3} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.4} darkness={0.8} />
      <ChromaticAberration offset={aberrationOffset} />
    </EffectComposer>
  );
};

// --------------------------------------------------------
// ⚔️ 4. MAIN EDITORIAL COMPONENT
// --------------------------------------------------------
export default function VarahaLore({ onBack }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    setGlobalMusic('varaha');
  }, []);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 40, damping: 20, mass: 1 });

  const bgColor = useTransform(sp, 
    [0.0, 0.2, 0.4, 0.6, 0.75, 0.85, 1.0], 
    ["#020617", "#1c1411", "#271c19", "#450a0a", "#000000", "#020617", "#0f172a"]
  );
  
  const o = (start, peak1, peak2, end) => useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  const s1  = o(0.00, 0.01, 0.05, 0.07); const s2  = o(0.07, 0.09, 0.12, 0.14);
  const s3  = o(0.14, 0.16, 0.19, 0.21); const s4  = o(0.21, 0.23, 0.26, 0.28);
  const s5  = o(0.28, 0.30, 0.33, 0.35); const s6  = o(0.35, 0.37, 0.40, 0.42);
  const s7  = o(0.42, 0.44, 0.47, 0.49); const s8  = o(0.49, 0.51, 0.54, 0.56);
  const s9  = o(0.56, 0.58, 0.61, 0.63); const s10 = o(0.63, 0.65, 0.68, 0.70);
  const s11 = o(0.70, 0.72, 0.75, 0.77); const s12 = o(0.77, 0.79, 0.82, 0.84);
  const s13 = o(0.84, 0.86, 0.89, 0.91); const s14 = useTransform(sp, [0.91, 0.93, 0.99, 1], [0, 1, 1, 1]); 

  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  
  // Reduced horizontal drift for mobile so text doesn't fly off screen
  const driftLeft = (start, end) => useTransform(sp, [start, end], [isMobile ? "2vw" : "5vw", isMobile ? "-2vw" : "-5vw"]);
  const driftRight = (start, end) => useTransform(sp, [start, end], [isMobile ? "-2vw" : "-5vw", isMobile ? "2vw" : "5vw"]);

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[1400vh] font-sans text-white">
      
      {/* Hide Custom Cursor on Mobile Devices! */}
      <div className="hidden md:block">
        <CinematicCursor />
      </div>

      <button onClick={onBack} className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] px-4 md:px-6 py-2 border border-[#ff3300]/50 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-[#ff3300]/20 transition-all mix-blend-difference text-white shadow-[0_0_20px_rgba(255,51,0,0.4)]">
        &larr; Exit
      </button>

      {/* 3D CANVAS BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* CAMERA PULLED BACK FOR MOBILE! */}
        <Canvas camera={{ position: [0, 0, isMobile ? 22 : 15], fov: 60 }}>
          <DynamicRageLights scrollProgress={sp} />
          <ChaosAbyss scrollProgress={sp} isMobile={isMobile} />
          <RageEffects />
          <Sparkles count={isMobile ? 100 : 200} scale={30} size={3} speed={0.5} color="#fbbf24" opacity={0.2} />
        </Canvas>
      </div>

      {/* EDITORIAL HTML LAYER - FULLY MOBILE RESPONSIVE */}
      <motion.div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* SCENE 1 */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.07) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-24 pt-20 md:pt-0">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10 mb-8 md:mb-0">
            <h1 className="text-sm md:text-xl font-mono tracking-[0.4em] text-[#ff3300] mb-4">III. THE RESCUE</h1>
            <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest leading-tight">
              A Demon of<br className="hidden md:block"/> Untouchable Ego.
            </h2>
            <p className="text-base md:text-2xl font-serif italic text-white/70 mt-4 md:mt-6 border-l-0 md:border-l border-[#ff3300]/50 pl-0 md:pl-6 max-w-sm md:max-w-md">
              He prayed for invincibility. He could not be killed by gods, men, or holy beasts.
            </p>
          </div>
          <ImagePlaceholder title="The Invincible Demon" width="w-[70vw] md:w-1/2 max-w-lg" height="h-[30vh] md:h-[60vh]" className="rounded-3xl md:rounded-full" />
        </motion.div>

        {/* SCENE 2 */}
        <motion.div style={{ opacity: s2, y: driftDown(0.07, 0.14) }} className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
          <h1 className="text-[18vw] md:text-[12vw] font-black uppercase tracking-tighter leading-none text-white/5 absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-center w-full">
            ARROGANCE
          </h1>
          <h2 className="text-2xl md:text-5xl font-light uppercase tracking-widest max-w-full md:max-w-4xl mx-auto md:ml-auto md:mr-0 text-center md:text-right relative z-10">
            But in his boundless arrogance, <span className="font-serif italic text-[#fbbf24] block md:inline mt-2 md:mt-0">he forgot to list the Boar.</span>
          </h2>
        </motion.div>

        {/* SCENE 3 */}
        <motion.div style={{ opacity: s3, x: driftLeft(0.14, 0.21) }} className="absolute inset-0 flex flex-col-reverse md:flex-row items-center justify-center md:justify-end px-6 md:px-24">
          <ImagePlaceholder title="Demon stealing the Earth" width="w-[80vw] md:w-[40vw]" height="h-[30vh] md:h-[40vh]" className="md:absolute md:left-10 rounded-2xl md:rounded-[2rem] md:rounded-tl-none mt-8 md:mt-0" />
          <div className="w-full md:max-w-xl text-center md:text-right z-10">
            <h1 className="text-4xl md:text-6xl font-serif uppercase text-[#ff3300] leading-none mb-4 md:mb-6">
              Pure Malice.
            </h1>
            <p className="text-lg md:text-xl tracking-widest font-light">Drunk on power, he tore Bhumi (The Earth) from her orbit.</p>
            <p className="text-xs md:text-sm font-mono tracking-widest opacity-50 mt-4 text-white">TO SUFFOCATE THE CRADLE OF LIFE.</p>
          </div>
        </motion.div>

        {/* SCENE 4 */}
        <motion.div style={{ opacity: s4, y: driftUp(0.21, 0.28) }} className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <div className="z-10 bg-[#1c1411]/80 backdrop-blur-xl p-8 md:p-12 text-center border border-[#ff3300]/20 rounded-2xl md:rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full md:w-auto">
            <h1 className="text-2xl md:text-6xl font-light uppercase tracking-widest text-white">
              He dragged her into the <span className="font-serif italic text-[#b45309] block md:inline mt-2 md:mt-0">Toxic Abyss.</span>
            </h1>
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase mt-4 md:mt-6 opacity-60 text-[#ff3300]">Plunging to the absolute, crushing bottom of reality.</p>
          </div>
        </motion.div>

        {/* SCENE 5 */}
        <motion.div style={{ opacity: s5, y: driftUp(0.28, 0.35) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 md:px-10">
          <h2 className="text-2xl md:text-6xl font-light tracking-widest uppercase text-white drop-shadow-2xl max-w-full md:max-w-4xl">
            The Creator panicked. <span className="font-serif italic font-bold text-[#fbbf24] block mt-4">Until a tiny boar fell from his nostril.</span>
          </h2>
          <p className="text-sm md:text-xl font-mono tracking-widest opacity-50 mt-6 md:mt-8 uppercase text-[#3b82f6]">The universe found its loophole.</p>
        </motion.div>

        {/* SCENE 6 */}
        <motion.div style={{ opacity: s6, y: driftDown(0.35, 0.42) }} className="absolute inset-0 flex flex-col justify-center text-center md:text-left px-6 md:px-24">
          <h1 className="text-3xl md:text-6xl font-light uppercase tracking-widest max-w-full md:max-w-2xl leading-tight text-white/80">
            Within seconds, it expanded.
          </h1>
          <p className="text-lg md:text-2xl font-serif italic text-[#fbbf24] mt-4 md:mt-6 tracking-[0.2em]">Growing into a colossal, mountain-sized beast of pure muscle.</p>
        </motion.div>

        {/* SCENE 7 */}
        <motion.div style={{ opacity: s7, x: driftRight(0.42, 0.49) }} className="absolute inset-0 flex items-center justify-center md:justify-start px-6 md:px-24 md:flex-row-reverse">
          <div className="w-full md:max-w-xl text-center md:text-right z-10 relative">
            <h1 className="text-[20vw] md:text-[12vw] font-black uppercase tracking-tighter leading-none text-[#fbbf24]/10 absolute left-1/2 md:left-auto md:-right-10 top-1/2 -translate-x-1/2 md:-translate-x-0 -translate-y-1/2 select-none w-full">VARAHA</h1>
            <h1 className="text-3xl md:text-6xl font-light uppercase tracking-widest leading-tight relative z-10">
              With a terrifying roar, <span className="text-[#fbbf24] block md:inline">Varaha dove.</span>
            </h1>
            <p className="text-sm md:text-xl font-mono tracking-widest opacity-70 mt-6 text-white uppercase relative z-10">Plunging into the suffocating mud to hunt the demon.</p>
          </div>
        </motion.div>

        {/* SCENE 8 */}
        <motion.div style={{ opacity: s8, y: driftUp(0.49, 0.56) }} className="absolute inset-0 flex items-center justify-center mix-blend-difference px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-[#ff3300] mb-4">
              THE COLLISION
            </h1>
            <p className="text-lg md:text-4xl font-light tracking-[0.2em] uppercase max-w-full md:max-w-3xl text-white">
              They clashed in the pitch black.
            </p>
          </div>
        </motion.div>

        {/* SCENE 9 */}
        <motion.div style={{ opacity: s9, y: driftDown(0.56, 0.63) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-10">
          <h1 className="text-[25vw] font-black uppercase tracking-tighter leading-none absolute select-none text-[#ff3300]/10">CARNAGE</h1>
          <div className="z-10 bg-[#450a0a]/80 backdrop-blur-xl border-t border-b border-[#ff3300]/50 p-8 md:p-12 w-full">
            <h2 className="text-2xl md:text-6xl font-light uppercase tracking-widest text-white mb-4">
              Flesh vs Iron. God vs Ego.
            </h2>
            <p className="text-base md:text-3xl font-serif italic text-[#fbbf24] max-w-full md:max-w-3xl mx-auto">
              No magic spells. Just raw, brutal, tectonic physical strength shaking the foundations of reality.
            </p>
          </div>
        </motion.div>

        {/* SCENE 10 */}
        <motion.div style={{ opacity: s10, x: driftLeft(0.63, 0.70) }} className="absolute inset-0 flex items-center justify-center md:justify-start px-6 md:px-24">
          <div className="w-full md:flex-1 z-10 pl-6 md:pl-10 border-l-[4px] md:border-l-[8px] border-[#ff3300] text-left">
            <h2 className="text-3xl md:text-7xl font-black uppercase tracking-tighter text-white mb-4 md:mb-6 drop-shadow-[0_0_20px_rgba(255,51,0,0.8)]">
              The Loophole Closed.
            </h2>
            <p className="text-sm md:text-2xl tracking-[0.2em] md:tracking-[0.3em] uppercase text-[#EBE4E2] font-serif italic">Varaha struck the fatal blow. The demon was obliterated.</p>
          </div>
        </motion.div>

        {/* SCENE 11 */}
        <motion.div style={{ opacity: s11, y: driftDown(0.70, 0.77) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-10">
          <p className="text-sm md:text-2xl font-mono tracking-[0.5em] text-[#3b82f6] mb-6 md:mb-8 uppercase">/ The Rescue /</p>
          <h1 className="text-2xl md:text-6xl font-light uppercase tracking-widest leading-relaxed max-w-full md:max-w-4xl">
            In the deafening silence of the dark...<br/>
            <span className="font-serif italic text-[#fbbf24] text-xl md:text-3xl block mt-4">The brutal beast showed infinite tenderness.</span>
          </h1>
        </motion.div>

        {/* SCENE 12 */}
        <motion.div style={{ opacity: s12, y: driftUp(0.77, 0.84) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div className="w-[1px] h-20 md:h-32 bg-gradient-to-b from-transparent to-[#3b82f6] mb-6 md:mb-8" />
          <h1 className="text-3xl md:text-7xl font-serif text-[#3b82f6] drop-shadow-[0_0_50px_rgba(59,130,246,0.6)]">
            He scooped the Earth upon his tusks and rose.
          </h1>
        </motion.div>

        {/* SCENE 13 */}
        <motion.div style={{ opacity: s13, y: driftRight(0.84, 0.91) }} className="absolute inset-0 flex items-center justify-center md:justify-start px-6 md:px-24 md:flex-row-reverse">
          <div className="w-full md:flex-1 z-10 text-center md:text-right pr-0 md:pr-16">
            <h2 className="text-[14vw] md:text-[10vw] font-black uppercase tracking-tighter leading-none text-[#3b82f6] mb-4 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              ASCENDANT
            </h2>
            <div className="inline-block bg-[#0f172a]/80 backdrop-blur-md border border-[#3b82f6]/40 px-6 md:px-8 py-3 md:py-4 rounded-xl">
               <p className="text-sm md:text-xl tracking-[0.2em] uppercase text-white italic font-serif">He broke the surface, placing Bhumi perfectly back into her orbit.</p>
            </div>
          </div>
        </motion.div>

        {/* SCENE 14 */}
        <motion.div style={{ opacity: s14 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-xl md:text-4xl font-light tracking-[0.3em] uppercase mb-6 md:mb-12 text-[#fbbf24]">
            Mission Complete.
          </h1>
          <p className="text-xs md:text-lg opacity-80 tracking-widest uppercase mb-8 md:mb-12 text-white">His purpose fulfilled, the Avatar dissolved back into the cosmos.</p>
          <div className="w-[1px] h-16 md:h-32 bg-gradient-to-b from-[#fbbf24] to-transparent mb-8 md:mb-12" />
          <div className="w-full max-w-4xl text-base md:text-5xl font-serif leading-relaxed md:leading-tight p-8 md:p-12 border border-[#3b82f6]/30 bg-[#020617]/90 backdrop-blur-2xl rounded-2xl md:rounded-[2rem] shadow-[0_0_60px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-50" />
            &quot;True power is not measured by the ability to destroy...<br/><br/>
            <span className="text-[#3b82f6] uppercase tracking-widest text-sm md:text-4xl not-italic block mt-4">But by the willingness to dive into the absolute darkest depths to protect what is fragile.</span>&quot;
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}