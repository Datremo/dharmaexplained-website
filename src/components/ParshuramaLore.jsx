import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise, Glitch, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Cylinder, Sparkles, Octahedron, Icosahedron, Tetrahedron, Plane, Box } from '@react-three/drei';
import CinematicCursor from './CinematicCursor';
import { setGlobalMusic } from './GlobalAudio';

// --------------------------------------------------------
// 🖼️ HELPER: CINEMATIC IMAGE PLACEHOLDER
// --------------------------------------------------------
const ImagePlaceholder = ({ title, width, height, className = "" }) => (
  <div className={`relative overflow-hidden bg-[#1a0505]/80 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444]/50 font-mono text-[10px] uppercase tracking-[0.3em] backdrop-blur-md ${width} ${height} ${className} shadow-[0_0_30px_rgba(239,68,68,0.05)] group`}>
    <div className="absolute inset-0 bg-gradient-to-br from-[#ef4444]/20 via-transparent to-black opacity-60" />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
    <span className="relative z-10 drop-shadow-md mix-blend-screen">[ {title} ]</span>
  </div>
);

// --------------------------------------------------------
// 💡 DYNAMIC RAGE LIGHTING
// --------------------------------------------------------
const DynamicRageLights = ({ scrollProgress }) => {
  const ambientRef = useRef();
  const pointRef = useRef();
  const rimLightRef = useRef();

  useFrame(() => {
    const p = scrollProgress.get();
    let ambientColor = new THREE.Color("#0a0a0a"); 
    let pointColor = new THREE.Color("#ffffff");
    let intensity = 1.5;

    // The Forge & The Massacre (Deep Red phase)
    if (p > 0.35 && p < 0.85) {
      ambientColor = new THREE.Color("#3a0000"); 
      pointColor = new THREE.Color("#ff1111");
      intensity = 4.0;
    }

    if (ambientRef.current) ambientRef.current.color.lerp(ambientColor, 0.05);
    if (pointRef.current) {
      pointRef.current.color.lerp(pointColor, 0.05);
      pointRef.current.intensity = THREE.MathUtils.lerp(pointRef.current.intensity, intensity, 0.05);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={1} />
      <pointLight ref={pointRef} position={[0, 5, 5]} distance={40} />
      <pointLight ref={rimLightRef} position={[0, 10, -10]} color="#ffffff" intensity={4} distance={60} />
    </>
  );
};

// --------------------------------------------------------
// 🪓 THE 3D ENGINE: SACRED GEOMETRY & BRUTALISM
// --------------------------------------------------------
const ParashuMasterpiece = ({ scrollProgress, isMobile }) => {
  const cameraGroupRef = useRef();
  
  // Mathematical Props
  const soulOrbRef = useRef();       // Octahedron (Kamadhenu/Peace)
  const forgeRef = useRef();         // Massive Tetrahedron (Shiva's Forge)
  const mountainRef = useRef();      // Colossal Icosahedron (Mahendragiri)
  
  // Brutalist Props
  const armsRef = useRef();          // 100 Corrupt Arms
  const axeGroupRef = useRef();      // The Parashu
  const crownsRef = useRef();        // 21 Generations
  const floorRef = useRef();         // The Reality/Blood Plane

  // Generate 100 Metallic Arms
  const { armsData } = useMemo(() => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        x: (Math.random() - 0.5) * 25,
        y: (Math.random() - 0.5) * 25 + 5,
        z: (Math.random() - 0.5) * 15 - 5,
        targetX: (Math.random() - 0.5) * 2,
        targetY: (Math.random() - 0.5) * 2,
        speed: Math.random() * 2 + 1,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI
      });
    }
    return { armsData: data };
  }, []);

  // Generate 21 Egos (Crowns)
  const { crownData } = useMemo(() => {
    return { crownData: Array.from({ length: 21 }).map(() => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 5 + 3,
      y: (Math.random() - 0.5) * 6,
      speed: Math.random() * 0.02 + 0.01
    }))};
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    // 🎥 1. CAMERA RIG: Cinematic Dolly & Shake
    if (cameraGroupRef.current) {
      let targetZ = THREE.MathUtils.lerp(0, 8, scroll);
      let targetY = 0;
      
      // Sink slightly during the blood lake phase, rise for the mountain
      if (scroll > 0.65 && scroll < 0.85) targetY = -4;
      else if (scroll >= 0.85) { targetY = 5; targetZ = -5; } // Push into the mountain

      cameraGroupRef.current.position.z = THREE.MathUtils.lerp(cameraGroupRef.current.position.z, targetZ, delta * 2);
      cameraGroupRef.current.position.y = THREE.MathUtils.lerp(cameraGroupRef.current.position.y, targetY, delta * 2);
    }

    // 🧊 2. THE SOUL (Octahedron Kamadhenu)
    if (soulOrbRef.current) {
      const isSnatching = scroll > 0.15 && scroll < 0.25;
      const isGone = scroll >= 0.25;

      let targetX = isSnatching || isGone ? 30 : 0;
      let targetY = isSnatching || isGone ? 15 : Math.sin(state.clock.elapsedTime * 2) * 0.5;
      let opacity = isGone ? 0 : 0.9;

      soulOrbRef.current.position.x = THREE.MathUtils.lerp(soulOrbRef.current.position.x, targetX, delta * 5);
      soulOrbRef.current.position.y = THREE.MathUtils.lerp(soulOrbRef.current.position.y, targetY, delta * 5);
      soulOrbRef.current.material.opacity = THREE.MathUtils.lerp(soulOrbRef.current.material.opacity, opacity, delta * 5);
      
      soulOrbRef.current.rotation.y += delta;
      if (isSnatching) soulOrbRef.current.rotation.x += delta * 15; // Panics
    }

    // 🫴 3. THE CORRUPTION (100 Arms swarming the soul)
    if (armsRef.current) {
      const isSnatching = scroll > 0.15 && scroll < 0.25;
      const isThreatening = scroll >= 0.25 && scroll < 0.45;
      const isSevered = scroll >= 0.45;

      armsData.forEach((data, i) => {
        let currentX = data.x;
        let currentY = data.y;
        let currentZ = data.z;

        if (isSnatching) {
          // Collapse on the Soul
          currentX = THREE.MathUtils.lerp(currentX, soulOrbRef.current.position.x + data.targetX, delta * data.speed * 5);
          currentY = THREE.MathUtils.lerp(currentY, soulOrbRef.current.position.y + data.targetY, delta * data.speed * 5);
        } else if (isThreatening) {
          // Hover ominously, aiming at camera
          currentX = THREE.MathUtils.lerp(currentX, data.x, delta);
          currentY = THREE.MathUtils.lerp(currentY, data.y + Math.sin(state.clock.elapsedTime * data.speed) * 0.5, delta);
        } else if (isSevered) {
          // The Swing hits! They fall and tumble
          currentY -= delta * 20 * data.speed; 
          currentX += Math.sign(currentX) * delta * 5; 
          data.rx += 0.3; 
          data.ry += 0.3;
        }

        dummy.position.set(currentX, currentY, currentZ);
        if (!isSevered) dummy.lookAt(0, 0, 5); 
        dummy.rotation.x += data.rx;
        dummy.rotation.y += data.ry;
        
        let scale = isMobile ? 0.6 : 1.2;
        dummy.scale.set(0.1, 0.1, scale * 3);
        dummy.updateMatrix();
        armsRef.current.setMatrixAt(i, dummy.matrix);
      });
      armsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 🔺 4. SHIVA'S FORGE (Massive Tetrahedron)
    if (forgeRef.current) {
      const active = scroll > 0.30 && scroll < 0.55 ? 1 : 0;
      forgeRef.current.material.opacity = THREE.MathUtils.lerp(forgeRef.current.material.opacity, active * 0.4, delta * 3);
      
      let scale = scroll > 0.35 ? 6 : 0.1;
      forgeRef.current.scale.setScalar(THREE.MathUtils.lerp(forgeRef.current.scale.x, scale, delta * 4));
      
      forgeRef.current.rotation.x -= delta * 0.5;
      forgeRef.current.rotation.y += delta * 0.8;
    }

    // 🪓 5. THE PARASHU (The Brutalist Monolith Axe)
    if (axeGroupRef.current) {
      let targetY = scroll > 0.35 ? 0 : 20; 
      let targetRotZ = 0;
      let targetRotX = 0;

      // The Setup
      if (scroll > 0.35 && scroll < 0.45) {
        targetY = Math.sin(state.clock.elapsedTime * 4) * 0.5; // Hovering with power
      }
      // The Swing (Severing)
      else if (scroll >= 0.45 && scroll < 0.65) {
        targetRotZ = Math.sin(state.clock.elapsedTime * 8) * 1.5; // Aggressive swing
        targetRotX = Math.PI / 6;
      }
      // The Rest (Embeds into the mountain)
      else if (scroll >= 0.85) {
        targetY = 2;
        targetRotZ = -Math.PI / 8;
      }

      axeGroupRef.current.position.y = THREE.MathUtils.lerp(axeGroupRef.current.position.y, targetY, delta * 5);
      axeGroupRef.current.rotation.z = THREE.MathUtils.lerp(axeGroupRef.current.rotation.z, targetRotZ, delta * 5);
      axeGroupRef.current.rotation.x = THREE.MathUtils.lerp(axeGroupRef.current.rotation.x, targetRotX, delta * 5);
    }

    // 👑 6. THE 21 EGOS (The Massacre)
    if (crownsRef.current) {
      crownData.forEach((data, i) => {
        data.angle += data.speed;
        let currentX = Math.cos(data.angle) * data.radius;
        let currentY = data.y;
        let currentZ = Math.sin(data.angle) * data.radius - 5;

        // SCENE 13: TWENTY-ONE TIMES (Violent Explosion)
        if (scroll > 0.62) {
          const force = (scroll - 0.62) * 60;
          currentX += Math.cos(data.angle) * force;
          currentY -= force * 0.5; // Sink
          currentZ += Math.sin(data.angle) * force;
        }

        dummy.position.set(currentX, currentY, currentZ);
        dummy.rotation.set(data.angle, data.angle, 0);
        
        let scale = scroll > 0.5 ? 1 : 0;
        if (scroll > 0.75) scale = 0;
        dummy.scale.set(scale, scale, scale);
        
        dummy.updateMatrix();
        crownsRef.current.setMatrixAt(i, dummy.matrix);
      });
      crownsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 🩸 7. THE REALITY FLOOR (Turns to Samantapanchaka Blood Lake)
    if (floorRef.current) {
      let targetColor = new THREE.Color("#050505");
      let emissiveColor = new THREE.Color("#000000");

      if (scroll > 0.62 && scroll < 0.85) {
        targetColor = new THREE.Color("#3a0000"); // Deep crimson
        emissiveColor = new THREE.Color("#1a0000");
      }

      floorRef.current.material.color.lerp(targetColor, delta * 3);
      floorRef.current.material.emissive.lerp(emissiveColor, delta * 3);
    }

    // 🏔️ 8. MOUNT MAHENDRAGIRI (Colossal Icosahedron)
    if (mountainRef.current) {
      let mountY = scroll > 0.85 ? -8 : -40; // Rises at the end
      mountainRef.current.position.y = THREE.MathUtils.lerp(mountainRef.current.position.y, mountY, delta * 2);
      mountainRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={cameraGroupRef}>
      {/* 🧊 The Soul */}
      <Octahedron ref={soulOrbRef} args={[1, 0]} position={[0, 0, -5]}>
        <meshStandardMaterial color="#ffffff" emissive="#fbbf24" emissiveIntensity={1.5} />
      </Octahedron>

      {/* 🫴 The 100 Arms */}
      <instancedMesh ref={armsRef} args={[null, null, 100]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#334155" emissive="#110000" emissiveIntensity={0.5} metalness={0.9} roughness={0.2} />
      </instancedMesh>

      {/* 🔺 The Forge */}
      <Tetrahedron ref={forgeRef} args={[1, 0]} position={[0, 0, -5]}>
        <meshStandardMaterial color="#ef4444" wireframe transparent emissive="#ff0000" emissiveIntensity={2} />
      </Tetrahedron>

      {/* 🪓 The Monolithic Parashu */}
      <group ref={axeGroupRef} position={[0, 20, -5]}>
        <Cylinder args={[0.08, 0.1, 7, 32]} position={[0, -1, 0]}>
          <meshStandardMaterial color="#0f0f0f" metalness={0.8} roughness={0.5} />
        </Cylinder>
        <Cylinder args={[0.02, 2.2, 1.8, 3]} position={[-1.1, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#e2e8f0" emissive="#ef4444" emissiveIntensity={0.3} metalness={1} roughness={0.1} />
        </Cylinder>
      </group>

      {/* 👑 The 21 Egos */}
      <instancedMesh ref={crownsRef} args={[null, null, 21]}>
        <torusGeometry args={[0.4, 0.1, 16, 32]} />
        <meshStandardMaterial color="#fbbf24" emissive="#b45309" metalness={1} roughness={0.1} />
      </instancedMesh>

      {/* 🩸 The Floor */}
      <Plane ref={floorRef} args={[150, 150]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -5]}>
        <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.05} />
      </Plane>

      {/* 🏔️ Mount Mahendragiri */}
      <Icosahedron ref={mountainRef} args={[8, 1]} position={[0, -40, -10]} scale={[1, 2, 1]}>
        <meshStandardMaterial color="#07CEF6" emissive="#0BF20E" wireframe roughness={0.9} />
      </Icosahedron>

      <Sparkles count={isMobile ? 100 : 200} scale={25} size={2} speed={1} color="#ef4444" opacity={0.6} position={[0, 0, -5]} />
    </group>
  );
};

// --------------------------------------------------------
// 🚨 POST-PROCESSING (PERFORMANCE OPTIMIZED)
// --------------------------------------------------------
const CinematicEffects = ({ scrollProgress, isMobile }) => {
  const [glitch, setGlitch] = useState(false);
  const glitchState = useRef(false); // ✨ Prevents the memory leak / infinite re-render loop!

  useFrame(() => {
    const p = scrollProgress.get();
    const shouldGlitch = p > 0.62 && p < 0.70;
    
    // Only update React state if it actually changed to stop lagging!
    if (glitchState.current !== shouldGlitch) {
      glitchState.current = shouldGlitch;
      setGlitch(shouldGlitch);
    }
  });

  // ✨ On mobile, disable the heavy mipmap blur and chromatic aberration to guarantee 60fps
  if (isMobile) {
    return (
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} intensity={1.5} mipmapBlur={false} />
        <Vignette offset={0.5} darkness={0.8} />
        {glitch && <Glitch delay={[0, 0.2]} duration={[0.1, 0.3]} strength={[0.05, 0.1]} active={glitch} />}
      </EffectComposer>
    );
  }

  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.2} intensity={1.5} mipmapBlur={true} />
      <Vignette offset={0.5} darkness={0.8} />
      <ChromaticAberration offset={[0.003, 0.003]} />
      <Noise opacity={0.2} />
      {glitch && <Glitch delay={[0, 0.2]} duration={[0.1, 0.3]} strength={[0.05, 0.1]} active={glitch} />}
    </EffectComposer>
  );
};

// --------------------------------------------------------
// 🎬 THE MAIN EDITORIAL SCROLL COMPONENT
// --------------------------------------------------------
export default function ParshuramaLore({ onBack }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
 
    
   useEffect(() => { 
    window.scrollTo(0, 0);
    setGlobalMusic('parshurama');
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile); 
    // Notice how we DO NOT return a cleanup function for the music here!
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 40, damping: 20, mass: 1 });

  const bgColor = useTransform(sp, 
    [0.0, 0.3, 0.6, 0.7, 0.85, 1.0], 
    ["#030303", "#050202", "#1a0000", "#2a0000", "#030303", "#000000"]
  );
  
  const shake = useTransform(sp, (p) => (p > 0.62 && p < 0.70) ? Math.sin(p * 1000) * 15 : 0);

  // 🧮 20 PERFECTLY SPACED CINEMATIC BEATS
  const o = (start, peak1, peak2, end) => useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);   
  const s1  = o(0.00, 0.01, 0.03, 0.04); 
  const s2  = o(0.04, 0.05, 0.08, 0.09); 
  const s3  = o(0.09, 0.10, 0.13, 0.14); 
  const s4  = o(0.14, 0.15, 0.18, 0.19); 
  const s5  = o(0.19, 0.20, 0.23, 0.24); 
  const s6  = o(0.24, 0.25, 0.28, 0.29); 
  const s7  = o(0.29, 0.30, 0.33, 0.34); 
  const s8  = o(0.34, 0.35, 0.38, 0.39); 
  const s9  = o(0.39, 0.40, 0.43, 0.44); 
  const s10 = o(0.44, 0.45, 0.48, 0.49); 
  const s11 = o(0.49, 0.50, 0.53, 0.54); 
  const s12 = o(0.54, 0.55, 0.58, 0.59); 
  const s13 = o(0.59, 0.60, 0.63, 0.64); 
  const s14 = o(0.64, 0.65, 0.68, 0.69); 
  const s15 = o(0.69, 0.70, 0.73, 0.74); 
  const s16 = o(0.74, 0.75, 0.78, 0.79); 
  const s17 = o(0.79, 0.80, 0.83, 0.84); 
  const s18 = o(0.84, 0.85, 0.88, 0.89); 
  const s19 = o(0.89, 0.90, 0.93, 0.94); 
  const s20 = useTransform(sp, [0.94, 0.96, 1, 1], [0, 1, 1, 1]); 

  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const offsetLeft = isMobile ? "0vw" : "10vw";
  const offsetRight = isMobile ? "0vw" : "-10vw";

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[2800vh] font-sans text-white">
      <div className="hidden md:block"><CinematicCursor /></div>
      
      <button onClick={onBack} className="fixed top-6 left-6 z-[100] px-6 py-2 border border-[#ef4444]/50 rounded-full text-xs tracking-widest uppercase hover:bg-[#ef4444]/20 transition-all mix-blend-difference text-white">
        &larr; Exit Domain
      </button>

      {/* ✨ PERFORMANCE FIX: Adding dpr={[1, 1.5]} stops high-res mobile screens from lagging! */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 1.5]}>
          <DynamicRageLights scrollProgress={sp} />
          <ParashuMasterpiece scrollProgress={sp} isMobile={isMobile} />
          <CinematicEffects scrollProgress={sp} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* EDITORIAL HTML LAYER - AURA FARMING EDITION */}
      <motion.div style={{ x: shake }} className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">  
        
        {/* S1 */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.04) }} className="absolute inset-0 flex items-center px-6 md:px-24">
          <div className="flex flex-col items-start text-left z-10">
            <h1 className="text-xl font-mono tracking-[0.4em] text-[#ef4444] mb-4">VI. THE EXECUTIONER</h1>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-tight">Parshurama.</h2>
          </div>
        </motion.div>

        {/* S2 */}
        <motion.div style={{ opacity: s2, y: driftDown(0.04, 0.09) }} className="absolute inset-0 flex flex-col justify-center px-6 md:px-24 text-right">
          <p className="text-2xl md:text-4xl font-serif italic text-white/60 border-r-4 border-[#ef4444] pr-6 max-w-2xl ml-auto">
            A scholar by birth. <br/>A weapon of mass destruction by choice.
          </p>
        </motion.div>

        {/* S3 */}
        <motion.div style={{ opacity: s3, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center px-6 md:px-24 text-left">
          <h2 className="text-4xl md:text-6xl font-light uppercase tracking-widest">The world was bleeding.</h2>
          <p className="text-xl tracking-[0.3em] uppercase opacity-50 mt-4 max-w-2xl">The ruling class, Kshatriyas, drunk on unchecked power, believed they were untouchable.</p>
        </motion.div>

        {/* S4 */}
        <motion.div style={{ opacity: s4, x: offsetRight }} className="absolute inset-0 flex items-center justify-end px-6 md:px-24 text-right">
          <div className="max-w-xl z-10">
            <h1 className="text-5xl md:text-7xl font-serif uppercase text-[#fbbf24] leading-none mb-6">The Theft.</h1>
            <p className="text-2xl tracking-widest font-light">King Kartavirya Arjuna stole from the peaceful hermitage, assuming there would be zero consequences.</p>
          </div>
        </motion.div>

        {/* S5 */}
        <motion.div style={{ opacity: s5, y: driftUp(0.19, 0.24) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
           <h1 className="text-3xl md:text-5xl font-mono tracking-[0.2em] text-[#ef4444] drop-shadow-md">THEY MISTOOK HIS SILENCE FOR WEAKNESS.</h1>
        </motion.div>

        {/* S6 */}
        <motion.div style={{ opacity: s6, y: driftDown(0.24, 0.29) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
           <h1 className="text-3xl md:text-5xl font-light uppercase tracking-widest mb-8 max-w-4xl">
             The arrogant King expected the Brahmin boy to just sit down, fold his hands, and pray for karma.
           </h1>
        </motion.div>

        {/* S7 - THE AURA SHIFT */}
        <motion.div style={{ opacity: s7, x: offsetLeft }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
           <div className="bg-[#1a0505]/90 border border-[#ef4444]/50 px-12 py-6 rounded-2xl backdrop-blur-xl shadow-[0_0_80px_rgba(239,68,68,0.4)]">
             <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#ef4444]">HE DIDN'T PRAY.</h1>
           </div>
        </motion.div>

        {/* S8 */}
        <motion.div style={{ opacity: s8, x: offsetRight }} className="absolute inset-0 flex flex-col items-end justify-center px-6 md:px-24 text-right">
          <h1 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-tight">He walked straight to the God of Destruction...</h1>
          <h2 className="text-3xl md:text-5xl font-serif italic text-[#ef4444] mt-4">And asked for an Axe.</h2>
        </motion.div>

        {/* S9 */}
        <motion.div style={{ opacity: s9, y: driftUp(0.39, 0.44) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter text-white mb-6">THE PARASHU.</h1>
          <p className="text-xl tracking-[0.3em] uppercase opacity-50">Forged not for peace, but for cosmic correction.</p>
        </motion.div>

        {/* S10 */}
        <motion.div style={{ opacity: s10, y: driftDown(0.44, 0.49) }} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest text-white/80">The King deployed a thousand arms to crush him.</h2>
        </motion.div>

        {/* S11 */}
        <motion.div style={{ opacity: s11, y: driftUp(0.49, 0.54) }} className="absolute inset-0 flex items-center justify-center mix-blend-difference px-6 text-center">
          <h1 className="text-7xl md:text-[12vw] font-black uppercase tracking-tighter text-[#ef4444]">SEVERED.</h1>
        </motion.div>

        {/* S12 */}
        <motion.div style={{ opacity: s12, x: offsetRight }} className="absolute inset-0 flex flex-col items-end justify-center px-6 md:px-24 text-right">
          <h2 className="text-4xl md:text-6xl font-serif italic text-[#fbbf24] mb-4">But the rot was too deep.</h2>
          <p className="text-xl md:text-3xl font-light tracking-[0.2em] text-white/70 uppercase max-w-2xl">The cowards murdered his unarmed father in revenge.</p>
        </motion.div>

        {/* S13 */}
        <motion.div style={{ opacity: s13, x: offsetLeft }} className="absolute inset-0 flex flex-col items-start justify-center px-6 md:px-24 text-left">
           <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white">SO HE MADE A VOW.</h1>
           <p className="text-2xl tracking-[0.3em] uppercase text-[#ef4444] mt-4">To wipe their entire bloodline from the face of the earth.</p>
        </motion.div>

        {/* S14 (Climax - Glitch activates here) */}
        <motion.div style={{ opacity: s14 }} className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[14vw] font-black uppercase tracking-tighter leading-none text-white mix-blend-overlay text-center">TWENTY-ONE<br/>TIMES.</h1>
        </motion.div>

        {/* S15 */}
        <motion.div style={{ opacity: s15, y: driftUp(0.69, 0.74) }} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
           <p className="text-xl md:text-3xl font-light tracking-[0.2em] text-white/70 uppercase max-w-3xl mb-4">He didn't just defeat the King.</p>
           <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-[#ef4444]">He hunted entire 21 GENERATIONS OF corrupt ruler on the planet.</h2>
        </motion.div>

        {/* S16 */}
        <motion.div style={{ opacity: s16, y: driftDown(0.74, 0.79) }} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-3xl md:text-6xl font-serif italic text-white mb-6">Five lakes were filled to the brim with their blood.</h1>
            <p className="text-2xl font-mono text-[#ef4444] uppercase tracking-widest">// SAMANTAPANCHAKA //</p>
        </motion.div>

        {/* S17 */}
        <motion.div style={{ opacity: s17, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center px-6 md:px-24">
          <h1 className="text-[18vw] font-black text-white/5 absolute -left-10 top-1/2 -translate-y-1/2 select-none">DHARMA</h1>
          <div className="z-10 pl-8 border-l-[4px] border-[#ef4444]">
            <h2 className="text-5xl md:text-7xl font-black uppercase text-white mb-4">Absolute Discipline.</h2>
            <p className="text-2xl tracking-[0.3em] uppercase text-white/60">Absolute violence when required.</p>
          </div>
        </motion.div>

        {/* S18 */}
        <motion.div style={{ opacity: s18, x: offsetRight }} className="absolute inset-0 flex flex-col items-end justify-center px-6 md:px-24 text-right">
          <h1 className="text-4xl md:text-7xl font-serif uppercase text-[#fbbf24] mb-6">The Retreat.</h1>
          <p className="text-xl md:text-3xl font-light tracking-[0.2em] text-white/80 max-w-2xl">Having cleansed the earth, he threw his axe into the ocean.</p>
        </motion.div>

        {/* S19 */}
        <motion.div style={{ opacity: s19, y: driftUp(0.89, 0.94) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-[0.4em] text-[#FFFF00] mb-6">Mount Mahendragiri.</h2>
          <p className="text-2xl md:text-4xl font-serif italic text-white/100 max-w-4xl">
            He waits. Immortal. Ready to train the final Avatar when KALYUG reaches its absolute peak.
          </p>
        </motion.div>

        {/* S20 */}
        <motion.div style={{ opacity: s20 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 pointer-events-auto">
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.4em] uppercase mb-12 text-[#FFFFFF]">The Foundation of Peace.</h1>
          <div className="max-w-6xl text-2xl md:text-4xl font-serif leading-relaxed p-10 md:p-16 border border-[#ef4444]/30 bg-[#050000]/95 backdrop-blur-3xl rounded-3xl shadow-[0_0_100px_rgba(239,68,68,0.2)]">
            "A harmless man is not a peaceful man. He is simply incapable.<br/><br/>
            <span className="text-[#ef4444] uppercase tracking-widest font-black text-xl md:text-3xl">True peace requires the capacity for absolute destruction — and the unbreakable discipline to keep the axe sheathed until it is truly needed.</span>"
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}