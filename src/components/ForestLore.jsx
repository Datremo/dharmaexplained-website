import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Stars, Sphere, Cylinder, Torus } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import CinematicCursor from './CinematicCursor'; // Ensure you have this from Phase 1
import { setGlobalMusic } from './GlobalAudio';

// --------------------------------------------------------
// 🖼️ CINEMATIC IMAGE PLACEHOLDER
// --------------------------------------------------------
const ImagePlaceholder = ({ title, width, height, color = "fbbf24", className = "" }) => (
  <div className={`relative overflow-hidden bg-black/40 border border-[#${color}]/30 flex items-center justify-center text-[#${color}]/60 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] backdrop-blur-md ${width} ${height} ${className} shadow-[0_0_30px_rgba(0,0,0,0.5)] group z-0`}>
    <div className={`absolute inset-0 bg-gradient-to-br from-[#${color}]/10 via-transparent to-black opacity-60`} />
    <span className="relative z-10 drop-shadow-md mix-blend-screen text-center px-4">[ IMAGE: {title} ]</span>
  </div>
);

// --------------------------------------------------------
// 🌪️ DYNAMIC ATMOSPHERE (Pollen -> Ash -> Fire Embers)
// --------------------------------------------------------
const DynamicAtmosphere = ({ scrollProgress }) => {
  const particlesRef = useRef();
  const count = 1500;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40, 
        y: (Math.random() - 0.5) * 40, 
        z: (Math.random() - 0.5) * 20 - 5, 
        speed: Math.random() * 0.2 + 0.1,
        factor: Math.random() * 2
      });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!particlesRef.current) return;

    // Determine particle behavior based on story phase
    let speedMult = 1;
    let direction = -1; // -1 is falling, 1 is rising
    let targetColor = new THREE.Color("#4ade80"); // Forest Green default

    if (p < 0.35) {
      // 🍃 The Forest (Slow, drifting green/gold pollen)
      speedMult = 0.5; direction = -1; targetColor.set("#fbbf24");
    } else if (p >= 0.35 && p < 0.70) {
      // 🌑 The Grief/Abduction (Dead, cold, slow ash)
      speedMult = 0.1; direction = -1; targetColor.set("#9ca3af");
    } else if (p >= 0.70) {
      // 🔥 Hanuman's Devotion (Violent, rising fire embers)
      speedMult = 6.0; direction = 1; targetColor.set("#f97316"); // Saffron/Orange
    }

    particlesRef.current.material.color.lerp(targetColor, delta * 2);

    particles.forEach((particle, i) => {
      // Physics calculation
      particle.y += (particle.speed * speedMult * direction * delta * 10);
      
      // Wrapping logic (if they go too high or too low)
      if (direction === -1 && particle.y < -20) particle.y = 20;
      if (direction === 1 && particle.y > 20) particle.y = -20;

      // Swirling wind effect
      const wind = Math.sin(state.clock.elapsedTime * 0.5 + particle.factor) * 0.05;
      particle.x += wind;

      dummy.position.set(particle.x, particle.y, particle.z);
      // Stretch particles if they are moving fast (like sparks)
      const stretch = speedMult > 2 ? 0.2 : 0.05;
      dummy.scale.set(0.05, stretch, 0.05);
      dummy.updateMatrix(); 
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    });
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={particlesRef} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  );
};

// --------------------------------------------------------
// 🔨 THE 3D ENGINE: HANUMAN'S MASSIVE GLOWING GADA
// --------------------------------------------------------
const TheGada = ({ scrollProgress, isMobile }) => {
  const gadaGroup = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!gadaGroup.current) return;

    // 1. THE REVEAL (Drops in violently at Scene 23 / 0.75)
    if (p >= 0.72) {
      // Drops from the sky to the center
      gadaGroup.current.position.y = THREE.MathUtils.lerp(gadaGroup.current.position.y, isMobile ? 2 : 0, delta * 4);
      gadaGroup.current.scale.setScalar(THREE.MathUtils.lerp(gadaGroup.current.scale.x, isMobile ? 0.8 : 1.5, delta * 4));
      // Heavy majestic rotation
      gadaGroup.current.rotation.y += delta * 0.5;
      gadaGroup.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      gadaGroup.current.position.x = THREE.MathUtils.lerp(gadaGroup.current.position.x, isMobile ? 0 : 3, delta * 2); // Shift right for text
    } else {
      // Hiding high up in the heavens during the tragedy
      gadaGroup.current.position.y = THREE.MathUtils.lerp(gadaGroup.current.position.y, 25, delta * 2);
      gadaGroup.current.scale.setScalar(THREE.MathUtils.lerp(gadaGroup.current.scale.x, 0, delta * 2));
    }
  });

  return (
    <group ref={gadaGroup} position={[0, 25, -2]} scale={0} rotation={[0.2, 0, 0.2]}>
      
      {/* The Heavy Spherical Head */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" emissive="#ea580c" emissiveIntensity={1.5} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* The Glow Aura */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* The Spikes/Ridges on the Head */}
      <mesh position={[0, 2, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[1.25, 0.1, 16, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#fbbf24" emissiveIntensity={2} metalness={1} roughness={0.1} />
      </mesh>
      <mesh position={[0, 2, 0]} rotation={[0, 0, Math.PI/2]}>
        <torusGeometry args={[1.25, 0.1, 16, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#fbbf24" emissiveIntensity={2} metalness={1} roughness={0.1} />
      </mesh>

      {/* The Thick Handle */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 5, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Golden Handle Rings */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.25, 0.05, 16, 32]} /><meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} /></mesh>
      <mesh position={[0, -2.5, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.28, 0.08, 16, 32]} /><meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} /></mesh>
      
      {/* Pommel Base */}
      <mesh position={[0, -4, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" emissive="#ea580c" emissiveIntensity={1} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};

// --------------------------------------------------------
// 💡 DYNAMIC LIGHTING (The Emotional Spectrum)
// --------------------------------------------------------
const SceneLights = ({ scrollProgress }) => {
  const ambientRef = useRef(); 
  const point1Ref = useRef();
  
  useFrame((state, delta) => {
    const p = scrollProgress.get();
    
    let ambientHex = "#064e3b"; // Deep Forest Green
    let p1Hex = "#fbbf24"; // Sunlight Gold
    let intensity1 = 15.0;
    
    if (p >= 0.22 && p < 0.35) { 
      // The Golden Deer / Illusion (Sickly, hypnotic gold)
      ambientHex = "#422006"; p1Hex = "#fef08a"; intensity1 = 30.0; 
    } 
    else if (p >= 0.35 && p < 0.70) { 
      // The Abduction & Grief (Pitch Black, Cold White Spotlight)
      ambientHex = "#000000"; p1Hex = "#ffffff"; intensity1 = 8.0; 
    } 
    else if (p >= 0.70) { 
      // Hanuman / Devotion (Explosive Saffron & Orange)
      ambientHex = "#450a0a"; p1Hex = "#f97316"; intensity1 = 60.0; 
    }

    if (ambientRef.current) ambientRef.current.color.lerp(new THREE.Color(ambientHex), delta * 3);
    if (point1Ref.current) {
      point1Ref.current.color.lerp(new THREE.Color(p1Hex), delta * 4);
      point1Ref.current.intensity = THREE.MathUtils.lerp(point1Ref.current.intensity, intensity1, delta * 4);
    }
  });
  
  return (
    <>
      <ambientLight ref={ambientRef} intensity={2.0} />
      <pointLight ref={point1Ref} position={[5, 5, 5]} distance={50} />
      <pointLight color="#020617" position={[-5, -5, -5]} distance={50} intensity={10.0} />
    </>
  );
};

const ForestEffects = ({ isMobile }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || isMobile) return null;
  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.2} intensity={2.5} mipmapBlur={true} />
      <Noise opacity={0.3} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.4} darkness={0.8} />
      <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
    </EffectComposer>
  );
};

// --------------------------------------------------------
// 👑 MAIN EDITORIAL COMPONENT (PHASE 2)
// --------------------------------------------------------
export default function ForestLore({ onBack }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => { 
    window.scrollTo(0, 0); 
    const checkMobile = () => setIsMobile(window.innerWidth < 768); 
    checkMobile(); 
    window.addEventListener('resize', checkMobile); 
    return () => window.removeEventListener('resize', checkMobile); 
  }, []);

  useEffect(() => { setGlobalMusic('forest'); }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

  // 🩸 STRICT BACKGROUND HTML CONTROL (Matches Lighting)
  const bgColor = useTransform(sp, 
    [0.0, 0.33, 0.35, 0.68, 0.70], 
    ["#022c22", "#022c22", "#000000", "#000000", "#2a0604"] // Forest -> Void -> Saffron
  );

  // 🎬 PERFECT PACING MATH (28 SCENES)
  const o = (start, peak1, peak2, end) => {
    const safeFadeIn = start + 0.005; 
    const safeFadeOutStart = peak2 - 0.005; 
    const safeFadeOutEnd = peak2 - 0.001; 
    return useTransform(sp, [start, safeFadeIn, safeFadeOutStart, safeFadeOutEnd], [0, 1, 1, 0]);
  };
  
  const s1 = o(0.00, 0.01, 0.02, 0.03); const s2 = o(0.02, 0.03, 0.04, 0.05); const s3 = o(0.04, 0.05, 0.06, 0.07); 
  const s4 = o(0.06, 0.07, 0.08, 0.09); const s5 = o(0.08, 0.09, 0.10, 0.11); const s6 = o(0.10, 0.11, 0.12, 0.13); 
  const s7 = o(0.12, 0.13, 0.14, 0.15); const s8 = o(0.14, 0.15, 0.16, 0.17); const s9 = o(0.16, 0.17, 0.18, 0.19); 
  const s10 = o(0.18, 0.19, 0.20, 0.21); const s11 = o(0.20, 0.21, 0.22, 0.23); const s12 = o(0.22, 0.23, 0.24, 0.25); 
  const s13 = o(0.24, 0.25, 0.26, 0.27); const s14 = o(0.26, 0.27, 0.28, 0.29); const s15 = o(0.28, 0.29, 0.30, 0.31); 
  const s16 = o(0.30, 0.31, 0.32, 0.33); const s17 = o(0.32, 0.33, 0.34, 0.35); const s18 = o(0.34, 0.35, 0.36, 0.37); 
  const s19 = o(0.36, 0.37, 0.38, 0.39); const s20 = o(0.38, 0.39, 0.40, 0.41); const s21 = o(0.40, 0.41, 0.42, 0.43); 
  const s22 = o(0.42, 0.43, 0.44, 0.45); const s23 = o(0.44, 0.45, 0.46, 0.47); const s24 = o(0.46, 0.47, 0.48, 0.49); 
  const s25 = o(0.48, 0.49, 0.50, 0.51); const s26 = o(0.50, 0.51, 0.52, 0.53); const s27 = o(0.52, 0.53, 0.54, 0.55); 
  const s28 = o(0.54, 0.55, 0.56, 0.57);

  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const offsetLeft = isMobile ? "2vw" : "15vw"; const offsetRight = isMobile ? "-2vw" : "-15vw";

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[12500vh] font-sans text-white selection:bg-[#fbbf24]/30">
      <div className="hidden md:block"><CinematicCursor /></div>
      <button onClick={onBack} className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] px-4 md:px-6 py-2 border border-white/30 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/10 transition-all text-white backdrop-blur-md">
        &larr; Return to Astrolabe
      </button>

      {/* 🌌 3D CANVAS PORTAL */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, isMobile ? 12 : 8], fov: 60 }}>
          <SceneLights scrollProgress={sp} />
          <DynamicAtmosphere scrollProgress={sp} />
          <TheGada scrollProgress={sp} isMobile={isMobile} />
          <ForestEffects isMobile={isMobile} />
        </Canvas>
      </div>

      <motion.div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* S1: Hook */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.03) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(8rem,25vw,30rem)] font-black text-[#4ade80]/[0.05] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none">DANDAKA</span>
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-xs md:text-sm font-mono tracking-[0.6em] text-[#4ade80] uppercase mb-4">Phase 02 // The Abyss</p>
            <h2 className="text-[clamp(3.5rem,10vw,10rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_40px_rgba(74,222,128,0.3)] leading-none max-w-[90vw] break-words">THE FOREST</h2>
          </div>
        </motion.div>

        {/* S2: The Reality of Exile */}
        <motion.div style={{ opacity: s2, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-2xl leading-relaxed border-l-4 border-[#4ade80] pl-6 bg-[#022c22]/50 p-6 backdrop-blur-sm">
            They traded silk for rough bark. Palaces for mud huts. The Supreme Lord of Ayodhya now lived entirely off the unforgiving earth.
          </p>
        </motion.div>

        {/* S3: 13 Years */}
        <motion.div style={{ opacity: s3, x: offsetRight }} className="absolute inset-0 flex flex-col md:flex-row-reverse items-center justify-end text-right px-6 md:px-24">
          <div className="z-10 md:ml-12 text-center md:text-right w-full md:max-w-[40vw]">
            <h3 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-white mb-2 leading-none">13 YEARS PASS.</h3>
            <p className="text-lg md:text-2xl font-light text-white/70">In complete, undisturbed peace. They found heaven in the dirt.</p>
          </div>
          <ImagePlaceholder title="PEACEFUL_HUT" color="4ade80" width="w-[80vw] md:w-[450px]" height="h-[25vh] md:h-[350px]" className="mt-8 md:mt-0 rounded-2xl shrink-0 object-cover" />
        </motion.div>

        {/* S4: The Final Year */}
        <motion.div style={{ opacity: s4, y: driftUp(0.06, 0.09) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(10rem,35vw,35rem)] font-black text-white/[0.03] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none mt-12">YEAR 14</span>
          <p className="text-2xl md:text-4xl font-serif italic text-[#fbbf24] max-w-4xl leading-relaxed relative z-10 drop-shadow-lg">
            But peace is fragile. And destiny demands a catalyst.
          </p>
        </motion.div>

        {/* S5: The Golden Deer (Lighting shifts sickly gold here) */}
        <motion.div style={{ opacity: s5, x: offsetLeft }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-start text-left px-6 md:px-24">
          <ImagePlaceholder title="GOLDEN_DEER" color="fbbf24" width="w-[80vw] md:w-[400px]" height="h-[30vh] md:h-[400px]" className="mb-8 md:mb-0 md:mr-12 rounded-2xl shrink-0 object-cover shadow-[0_0_80px_rgba(251,191,36,0.2)]" />
          <div className="z-10 w-full md:max-w-xl">
             <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-[#fbbf24] leading-none mb-4">THE ILLUSION.</h2>
             <p className="text-xl md:text-3xl font-light text-white/80 leading-relaxed">
               A deer, impossibly radiant. Forged entirely from hypnotic, golden magic. It dances on the edge of the forest.
             </p>
          </div>
        </motion.div>

        {/* S6: The Request */}
        <motion.div style={{ opacity: s6, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-3xl leading-relaxed bg-[#422006]/80 p-8 border-r-4 border-[#fbbf24] backdrop-blur-md">
            Sita is captivated. She asks Rama to capture it for her. It is the only thing she has ever asked for in 13 years.
          </p>
        </motion.div>

        {/* S7: Rama Chases */}
        <motion.div style={{ opacity: s7, y: driftDown(0.12, 0.15) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-lg md:text-2xl font-mono tracking-[0.2em] uppercase text-white/60 mb-6">He leaves Lakshmana to guard the hut.</p>
          <h3 className="text-[clamp(3rem,7vw,7rem)] font-black uppercase tracking-widest text-white leading-none max-w-[90vw]">
            HE DRAWS HIS BOW<br/>AND VANISHES INTO THE MIST.
          </h3>
        </motion.div>

        {/* S8: The Cry for Help */}
        <motion.div style={{ opacity: s8, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-[clamp(4rem,10vw,10rem)] font-black italic tracking-tighter text-[#ef4444] drop-shadow-[0_0_50px_rgba(239,68,68,0.5)] leading-none mb-6">"LAKSHMANA! SITA! HELP ME!"</h2>
          <p className="text-xl md:text-3xl font-light text-white/80 max-w-2xl">
            A voice echoing through the trees. It sounds exactly like Rama in agonizing pain.
          </p>
        </motion.div>

        {/* S9: The Panic */}
        <motion.div style={{ opacity: s9, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-serif italic text-white/90 max-w-3xl leading-relaxed border-r border-white/30 pr-8">
            Sita panics. She orders Lakshmana to go. Lakshmana knows his brother cannot be harmed by mortal things, but he cannot disobey her.
          </p>
        </motion.div>

        {/* S10: The Line */}
        <motion.div style={{ opacity: s10, y: driftUp(0.18, 0.21) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <ImagePlaceholder title="LAKSHMANA_REKHA" color="3b82f6" width="w-[80vw] md:w-[600px]" height="h-[25vh]" className="mb-6 rounded-2xl" />
          <h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-white leading-none">THE LAKSHMANA REKHA.</h3>
          <p className="text-lg md:text-xl font-light text-white/60 mt-4 max-w-2xl">He draws a line of absolute protective magic in the dirt and begs her not to cross it.</p>
        </motion.div>

        {/* S11: The Trap is Sprung (Lighting Drops to Black Here) */}
        <motion.div style={{ opacity: s11, y: driftDown(0.20, 0.23) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10 overflow-hidden">
          <span className="absolute text-[clamp(8rem,25vw,30rem)] font-black text-[#ef4444]/[0.08] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none translate-y-32">RAVANA</span>
          <div className="relative z-10 flex flex-col items-center">
             <h2 className="text-[clamp(4rem,12vw,12rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.8)] leading-none max-w-[90vw]">
               THEY ARE GONE.
             </h2>
             <p className="text-xl md:text-3xl font-serif italic text-white/60 mt-8">Sita is left entirely alone.</p>
          </div>
        </motion.div>

        {/* S12: The Abduction */}
        <motion.div style={{ opacity: s12, x: offsetLeft }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-start text-left px-6 md:px-24">
          <ImagePlaceholder title="RAVANA_SHADOW" color="ef4444" width="w-[80vw] md:w-[400px]" height="h-[30vh] md:h-[400px]" className="mb-8 md:mb-0 md:mr-12 rounded-2xl shrink-0 object-cover shadow-[0_0_100px_rgba(239,68,68,0.3)]" />
          <div className="z-10 w-full md:max-w-xl">
             <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-[#ef4444] leading-none mb-4">THE ABDUCTION.</h2>
             <p className="text-xl md:text-3xl font-light text-white/80 leading-relaxed bg-[#1a0000]/80 p-6 border-l-4 border-[#ef4444]">
               The Demon King Ravana approaches in the guise of a beggar. He tricks her into stepping over the line. And the world breaks.
             </p>
          </div>
        </motion.div>

        {/* S13: Rama Returns */}
        <motion.div style={{ opacity: s13, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h3 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-white mb-4 leading-tight max-w-[90vw] break-words">RAMA RETURNS.</h3>
          <p className="text-xl md:text-3xl font-serif italic text-white/70 max-w-2xl">
            He finds the golden deer was a demon in disguise. He runs back to the hut.
          </p>
        </motion.div>

        {/* S14: The Empty Hut */}
        <motion.div style={{ opacity: s14, y: driftUp(0.26, 0.29) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(5rem,15vw,15rem)] font-black uppercase tracking-tighter text-white/50 leading-none max-w-[90vw]">IT IS EMPTY.</h2>
        </motion.div>

        {/* S15: The Supreme Lord Weeps */}
        <motion.div style={{ opacity: s15, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-light text-white max-w-3xl leading-relaxed bg-black/80 p-10 border border-white/20 backdrop-blur-md">
            He does not unleash divine fury. He does not summon the cosmos. <br/><br/>
            The Supreme Lord collapses to the dirt. He physically weeps. He begs the trees and the birds to tell him where his wife is.
          </p>
        </motion.div>

        {/* S16: The Descent */}
        <motion.div style={{ opacity: s16, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <ImagePlaceholder title="RAMA_WEEPING" color="ffffff" width="w-[80vw] md:w-[500px]" height="h-[25vh] md:h-[300px]" className="mb-6 rounded-2xl grayscale opacity-70" />
          <h3 className="text-[clamp(2rem,4vw,4rem)] font-black uppercase tracking-widest text-white leading-none">ABSOLUTE DEVASTATION.</h3>
        </motion.div>

        {/* S17: The Wandering */}
        <motion.div style={{ opacity: s17, y: driftDown(0.32, 0.35) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(10rem,35vw,35rem)] font-black text-white/[0.03] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none mt-12">MADNESS</span>
          <p className="text-xl md:text-3xl font-serif italic text-white/70 relative z-10 max-w-3xl">
            For months, they wander through the abyss like ghosts. Hunting for a phantom in the dark.
          </p>
        </motion.div>

        {/* S18: A New Hope */}
        <motion.div style={{ opacity: s18, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-lg md:text-xl font-mono tracking-[0.3em] uppercase text-white/50 mb-4">Until they reach the southern mountains.</p>
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-tighter text-white leading-none max-w-[90vw]">KISHKINDHA.</h2>
        </motion.div>

        {/* S19: The Monkey Kingdom */}
        <motion.div style={{ opacity: s19, x: offsetRight }} className="absolute inset-0 flex flex-col md:flex-row-reverse items-center justify-end text-right px-6 md:px-24">
           <div className="z-10 md:ml-12 text-center md:text-right w-full md:max-w-[40vw]">
             <p className="text-xl md:text-3xl font-light text-white/80 leading-relaxed">
               The empire of the Vanaras. The exiled King Sugriva watches the two armed strangers approach his mountain.
             </p>
           </div>
           <ImagePlaceholder title="KISHKINDHA_MOUNTAINS" color="fbbf24" width="w-[80vw] md:w-[450px]" height="h-[25vh] md:h-[350px]" className="mt-8 md:mt-0 rounded-2xl shrink-0 object-cover" />
        </motion.div>

        {/* S20: The Scout */}
        <motion.div style={{ opacity: s20, y: driftUp(0.38, 0.41) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white max-w-4xl bg-black/80 p-10 border border-white/20 backdrop-blur-md shadow-2xl">
            Sugriva is terrified. He sends his most powerful, intelligent, and fiercely loyal scout disguised as an ascetic to interrogate them.
          </p>
        </motion.div>

        {/* S21: The Approach of the Ascetic */}
        <motion.div style={{ opacity: s21, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white/60 uppercase tracking-[0.1em]">
            The scout bows. He looks into Rama's eyes.
          </p>
        </motion.div>

        {/* S22: The Realization */}
        <motion.div style={{ opacity: s22, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-3xl leading-relaxed">
            And the illusion breaks. The ascetic sheds his disguise. He falls to his knees, utterly overwhelmed by absolute recognition.
          </p>
        </motion.div>

        {/* S23: THE REVEAL (GADA DROPS, FIRE LIGHTS UP HERE!) */}
        <motion.div style={{ opacity: s23, y: driftDown(0.44, 0.47) }} className="absolute inset-0 flex flex-col justify-end items-center text-center pb-[20vh] px-6 z-10 overflow-hidden">
          <span className="absolute text-[clamp(8rem,20vw,30rem)] font-black text-[#f97316]/[0.05] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none translate-y-32">DEVOTION</span>
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-[clamp(5rem,15vw,15rem)] font-black uppercase tracking-tighter text-[#fbbf24] drop-shadow-[0_0_80px_rgba(249,115,22,0.8)] leading-none max-w-[90vw]">
              HANUMAN.
            </h2>
          </div>
        </motion.div>

        {/* S24: The Shift */}
        <motion.div style={{ opacity: s24, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-light tracking-[0.1em] text-white/90 uppercase max-w-2xl leading-relaxed border-l-4 border-[#f97316] pl-6 bg-[#450a0a]/50 backdrop-blur-md p-6">
            The grief vanishes. The void is instantly filled with explosive, unstoppable, blazing hope. 
          </p>
        </motion.div>

        {/* S25: Hanuman's Vow */}
        <motion.div style={{ opacity: s25, x: offsetRight }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-end text-right px-6 md:px-24 z-10">
          <ImagePlaceholder title="HANUMAN_KNEELING" color="f97316" width="w-[80vw] md:w-[400px]" height="h-[25vh] md:h-[300px]" className="mb-8 md:mb-0 md:mr-12 rounded-2xl shrink-0 object-cover shadow-[0_0_80px_rgba(249,115,22,0.5)]" />
          <div className="z-10 text-center md:text-right w-full md:max-w-xl">
            <h3 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-white mb-4 leading-none break-words whitespace-normal">
              THE ULTIMATE DEVOTEE.
            </h3>
            <p className="text-xl md:text-3xl font-serif italic text-white/80">
              He does not just pledge his life. He pledges the entire earth. He will tear the cosmos apart to find the Mother.
            </p>
          </div>
        </motion.div>

        {/* S26: The Alliance */}
        <motion.div style={{ opacity: s26, y: driftUp(0.50, 0.53) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-white leading-none max-w-[90vw] bg-[#450a0a]/80 px-10 py-6 border border-[#f97316]/50 shadow-[0_0_100px_rgba(249,115,22,0.4)]">
            THE ARMY GATHERS.
          </h2>
        </motion.div>

        {/* S27: The Epic Set-up */}
        <motion.div style={{ opacity: s27, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
           <p className="text-2xl md:text-5xl font-light tracking-[0.1em] text-white/80 uppercase max-w-3xl leading-relaxed">
             A prince without a crown. An army of monkeys. Marching toward the greatest war the universe has ever seen.
           </p>
        </motion.div>

        {/* S28: To Be Continued / Next Phase */}
        <motion.div style={{ opacity: s28, y: driftDown(0.54, 0.57) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
           <p className="text-2xl md:text-4xl font-mono tracking-[0.4em] text-[#fbbf24] uppercase mb-4 drop-shadow-lg">
            Southward bound.
           </p>
           <button className="px-8 py-4 border-2 border-[#f97316] text-[#f97316] font-bold tracking-widest uppercase hover:bg-[#f97316] hover:text-white transition-all rounded-full shadow-[0_0_40px_rgba(249,115,22,0.4)]">
             Begin Phase 03: The Bridge
           </button>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}