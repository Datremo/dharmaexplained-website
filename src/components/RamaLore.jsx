import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { TorusKnot, Sparkles, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import CinematicCursor from './CinematicCursor';
import { setGlobalMusic } from './GlobalAudio';

// --------------------------------------------------------
// 🖼️ CINEMATIC IMAGE PLACEHOLDER
// --------------------------------------------------------
const ImagePlaceholder = ({ title, width, height, color = "fbbf24", className = "" }) => (
  <div 
    className={`relative overflow-hidden bg-black/40 border border-[#${color}]/30 flex items-center justify-center text-[#${color}]/60 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] backdrop-blur-md ${width} ${height} ${className} shadow-[0_0_30px_rgba(0,0,0,0.5)] group z-0`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br from-[#${color}]/10 via-transparent to-black opacity-60`} />
    <span className="relative z-10 drop-shadow-md mix-blend-screen text-center px-4">[ IMAGE: {title} ]</span>
  </div>
);

// --------------------------------------------------------
// ✨ THE VIVAHA (WEDDING) JOY PARTICLES
// --------------------------------------------------------
const WeddingParticles = ({ scrollProgress }) => {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!groupRef.current) return;

    // Shifted timing: Appears during Joy/Wedding scenes (0.22 to 0.28)
    if (p >= 0.22 && p < 0.28) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 2);
      groupRef.current.rotation.y += delta * 0.1;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 20, delta * 3);
    }
  });

  return (
    <group ref={groupRef} position={[0, 20, -2]}>
      <Sparkles count={200} scale={30} size={6} speed={0.8} color="#fef08a" opacity={0.8} />
      <Sparkles count={100} scale={20} size={8} speed={0.5} color="#fb7185" opacity={0.6} />
    </group>
  );
};

// --------------------------------------------------------
// 🌧️ THE EXILE RAINSTORM 
// --------------------------------------------------------
const RainStorm = ({ scrollProgress }) => {
  const rainRef = useRef();
  const count = 2000;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40, 
        y: Math.random() * 40, 
        z: (Math.random() - 0.5) * 20 - 5, 
        speed: Math.random() * 0.5 + 0.5
      });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!rainRef.current) return;

    // Shifted timing: Rain triggers strictly when Exile starts (0.50+)
    const targetOpacity = p > 0.50 ? THREE.MathUtils.lerp(rainRef.current.material.opacity, 0.6, delta * 2) : 0;
    rainRef.current.material.opacity = targetOpacity;

    if (targetOpacity > 0.01) {
      particles.forEach((particle, i) => {
        particle.y -= particle.speed;
        if (particle.y < -10) particle.y = 20;
        dummy.position.set(particle.x, particle.y, particle.z);
        dummy.rotation.set(0, 0, 0.1); 
        dummy.scale.set(0.02, 1.5, 0.02);
        dummy.updateMatrix(); 
        rainRef.current.setMatrixAt(i, dummy.matrix);
      });
      rainRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={rainRef} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#a5b4fc" transparent opacity={0} depthWrite={false} />
    </instancedMesh>
  );
};

// --------------------------------------------------------
// 🏹 THE 3D ENGINE: MASSIVE GLOWING GOLDEN PINAKA
// --------------------------------------------------------
const ThePinaka = ({ scrollProgress, isMobile }) => {
  const bowGroup = useRef();
  const leftHalf = useRef();
  const rightHalf = useRef();
  const stringRef = useRef();
  const glowRef = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!bowGroup.current || !leftHalf.current || !rightHalf.current) return;

    // 1. MAJESTIC APPEARANCE (Shifted to cover the new 28-scene pacing)
    if (p >= 0.12 && p < 0.22) {
      // Elevated to top of screen so text stays clear at the bottom!
      bowGroup.current.position.y = THREE.MathUtils.lerp(bowGroup.current.position.y, isMobile ? 3 : 4, delta * 3);
      bowGroup.current.scale.setScalar(THREE.MathUtils.lerp(bowGroup.current.scale.x, isMobile ? 0.7 : 1.4, delta * 3));
    } else {
      bowGroup.current.position.y = THREE.MathUtils.lerp(bowGroup.current.position.y, -15, delta * 3);
      bowGroup.current.scale.setScalar(THREE.MathUtils.lerp(bowGroup.current.scale.x, 0, delta * 3));
    }

    // 2. THE SNAP PHYSICS (Snaps perfectly at 0.205 for the new pacing)
    if (p >= 0.205 && p < 0.27) { 
      if (stringRef.current) stringRef.current.visible = false;
      if (glowRef.current) glowRef.current.visible = false;
      
      // Violently rip apart and float UP/AWAY from the text
      leftHalf.current.position.x = THREE.MathUtils.lerp(leftHalf.current.position.x, -5, delta * 1.5);
      leftHalf.current.position.y = THREE.MathUtils.lerp(leftHalf.current.position.y, 6, delta * 1.5);
      leftHalf.current.rotation.z = THREE.MathUtils.lerp(leftHalf.current.rotation.z, 1.5, delta * 1.5);

      rightHalf.current.position.x = THREE.MathUtils.lerp(rightHalf.current.position.x, 5, delta * 1.5);
      rightHalf.current.position.y = THREE.MathUtils.lerp(rightHalf.current.position.y, 2, delta * 1.5);
      rightHalf.current.rotation.z = THREE.MathUtils.lerp(rightHalf.current.rotation.z, -1.5, delta * 1.5);
    } else {
      leftHalf.current.position.set(0, 0, 0); 
      leftHalf.current.rotation.set(0, 0, 0);
      rightHalf.current.position.set(0, 0, 0); 
      rightHalf.current.rotation.set(0, 0, 0);
      if (stringRef.current) stringRef.current.visible = true;
      if (glowRef.current) glowRef.current.visible = true;
    }

    // 3. AMBIENT HOVER (Breathing slowly in the void)
    if (p < 0.205) {
      bowGroup.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      bowGroup.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
      bowGroup.current.position.z = Math.sin(state.clock.elapsedTime) * 0.2; 
    }
  });

  return (
    <group ref={bowGroup} position={[0, -15, -2]} scale={0}>
      
      {/* 🔴 LEFT HALF */}
      <group ref={leftHalf}>
        {/* Main Tapered Gold Limb - NOW GLOWING */}
        <mesh position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.25, 5, 32]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.5} metalness={1} roughness={0.2} />
        </mesh>
        {/* Recurve Tip (Curved forward) - NOW GLOWING */}
        <mesh position={[-5.3, 0.3, 0]} rotation={[0, 0, Math.PI / 3]}>
          <cylinderGeometry args={[0.02, 0.08, 1.8, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.5} metalness={1} roughness={0.2} />
        </mesh>
        {/* Silver Joints & Spikes */}
        <mesh position={[-1.2, 0, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.22, 0.08, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
        <mesh position={[-3.5, 0, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.15, 0.06, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
        <mesh position={[-4.8, 0.1, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.08, 0.04, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
      </group>

      {/* 🔴 RIGHT HALF */}
      <group ref={rightHalf}>
        {/* Main Tapered Gold Limb - NOW GLOWING */}
        <mesh position={[2.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.25, 5, 32]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.5} metalness={1} roughness={0.2} />
        </mesh>
        {/* Recurve Tip - NOW GLOWING */}
        <mesh position={[5.3, 0.3, 0]} rotation={[0, 0, -Math.PI / 3]}>
          <cylinderGeometry args={[0.02, 0.08, 1.8, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.5} metalness={1} roughness={0.2} />
        </mesh>
        {/* Silver Joints & Spikes */}
        <mesh position={[1.2, 0, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.22, 0.08, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
        <mesh position={[3.5, 0, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.15, 0.06, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
        <mesh position={[4.8, 0.1, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.08, 0.04, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
      </group>

      {/* 🔴 CENTRAL GRIP */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.26, 1.8, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 🔴 MAGICAL BLUE STRING & AURA */}
      <mesh ref={stringRef} position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 11.2, 16]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={3} transparent opacity={0.9} />
      </mesh>
      <mesh ref={glowRef} position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 11.2, 16]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

    </group>
  );
};

// --------------------------------------------------------
// 👑 CROWN & DYNAMIC DODGING
// --------------------------------------------------------
const RamaMatrixScene = ({ scrollProgress, isMobile }) => {
  const crownRef = useRef();
  const sparkleRef = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    
    if (crownRef.current) {
      let targetX = 0; let targetY = 0;

      if (p < 0.03) { targetX = -4; targetY = 0; } 
      else if (p >= 0.03 && p < 0.05) { targetX = -5; targetY = 0; } 
      else if (p >= 0.05 && p < 0.07) { targetX = -4; targetY = 0; } 
      else if (p >= 0.07 && p < 0.11) { targetX = 4; targetY = 0; } 
      // Hide the crown WAY below the screen while the Bow is active (S7-S11)
      else if (p >= 0.11 && p < 0.24) { targetX = 0; targetY = -20; } 
      // Return for Wedding & Homecoming
      else if (p >= 0.24 && p < 0.28) { targetX = 3; targetY = 0; } 
      // Betrayal Red Tilted Crown
      else if (p >= 0.28 && p < 0.50) { targetX = isMobile ? 0 : 4; targetY = -1.5; } 
      // Exile drop
      else if (p >= 0.50) { targetX = 0; targetY = -20; }

      crownRef.current.position.x = THREE.MathUtils.lerp(crownRef.current.position.x, targetX, delta * 2);
      crownRef.current.position.y = THREE.MathUtils.lerp(crownRef.current.position.y, targetY, delta * 2);

      if (p < 0.28) { 
        crownRef.current.rotation.y -= delta * 0.2;
        crownRef.current.rotation.x = THREE.MathUtils.lerp(crownRef.current.rotation.x, 0, delta);
        crownRef.current.material.emissive.setHex(0xfbbf24);
        crownRef.current.material.emissiveIntensity = 0.4;
      } else if (p >= 0.28 && p < 0.50) { 
        crownRef.current.rotation.x = THREE.MathUtils.lerp(crownRef.current.rotation.x, 1.5, delta * 2);
        crownRef.current.material.emissive.setHex(0xef4444); 
        crownRef.current.material.emissiveIntensity = 1.0; 
      }
    }

    if (sparkleRef.current) {
      if (p > 0.20 && p < 0.23) {
        sparkleRef.current.scale.setScalar(THREE.MathUtils.lerp(sparkleRef.current.scale.x, 2.5, delta * 5));
      } else {
        sparkleRef.current.scale.setScalar(THREE.MathUtils.lerp(sparkleRef.current.scale.x, 1, delta * 2));
      }
    }
  });

  return (
    <group position={[0, 0, -5]}>
      <TorusKnot ref={crownRef} args={[1.5, 0.3, 256, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} />
      </TorusKnot>
      <group ref={sparkleRef}>
        <Sparkles count={isMobile ? 150 : 300} scale={25} size={isMobile ? 2 : 4} speed={0.4} color="#fef08a" opacity={0.6} />
      </group>
      <Stars radius={50} depth={50} count={1000} factor={2} saturation={1} fade speed={1} />
      <ThePinaka scrollProgress={scrollProgress} isMobile={isMobile} />
      <WeddingParticles scrollProgress={scrollProgress} />
    </group>
  );
};

// --------------------------------------------------------
// 💡 DYNAMIC LIGHTING
// --------------------------------------------------------
const SceneLights = ({ scrollProgress }) => {
  const ambientRef = useRef(); 
  const point1Ref = useRef();
  
  useFrame((state, delta) => {
    const p = scrollProgress.get();
    
    let ambientHex = "#020617"; let p1Hex = "#fbbf24"; let intensity1 = 20.0;
    
    // Snap Flash
    if (p >= 0.20 && p < 0.22) { 
      ambientHex = "#ffffff"; p1Hex = "#ffffff"; intensity1 = 50.0; 
    } 
    // Wedding
    else if (p >= 0.22 && p < 0.285) { 
      ambientHex = "#1e1b4b"; p1Hex = "#fbbf24"; intensity1 = 30.0; 
    }
    // Poison starts precisely at S16 (Manthara)
    else if (p >= 0.285 && p < 0.50) { 
      ambientHex = "#1a0000"; p1Hex = "#ef4444"; intensity1 = 15.0; 
    } 
    // Exile
    else if (p >= 0.50) { 
      ambientHex = "#01050a"; p1Hex = "#a5b4fc"; intensity1 = 8.0; 
    }

    if (ambientRef.current) ambientRef.current.color.lerp(new THREE.Color(ambientHex), delta * 5);
    if (point1Ref.current) {
      point1Ref.current.color.lerp(new THREE.Color(p1Hex), delta * 5);
      point1Ref.current.intensity = THREE.MathUtils.lerp(point1Ref.current.intensity, intensity1, delta * 5);
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

const RamaEffects = ({ isMobile }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || isMobile) return null;
  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.2} intensity={2.0} mipmapBlur={true} />
      <Noise opacity={0.3} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.4} darkness={0.8} />
    </EffectComposer>
  );
};

// --------------------------------------------------------
// 👑 MAIN EDITORIAL COMPONENT
// --------------------------------------------------------
export default function RamaLore({ onBack }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); const checkMobile = () => setIsMobile(window.innerWidth < 768); checkMobile(); window.addEventListener('resize', checkMobile); return () => window.removeEventListener('resize', checkMobile); }, []);
  useEffect(() => { setGlobalMusic('rama'); }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

  // 🩸 STRICT BACKGROUND CONTROL
  const bgColor = useTransform(sp, 
    [0.0, 0.285, 0.295, 0.49, 0.51], 
    ["#020617", "#020617", "#1a0000", "#1a0000", "#01050a"]
  );

  // 🎬 PERFECT PACING MATH (Now explicitly 28 scenes long)
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
      <button onClick={onBack} className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] px-4 md:px-6 py-2 border border-[#fbbf24]/50 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-[#fbbf24]/20 transition-all text-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.2)] backdrop-blur-md">
        &larr; Return to Astrolabe
      </button>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, isMobile ? 12 : 8], fov: 60 }}>
          <SceneLights scrollProgress={sp} />
          <RamaMatrixScene scrollProgress={sp} isMobile={isMobile} />
          <RainStorm scrollProgress={sp} />
          <RamaEffects isMobile={isMobile} />
        </Canvas>
      </div>

      <motion.div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* S1: Hook */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.03) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(10rem,30vw,30rem)] font-black text-white/[0.06] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none">TRETA</span>
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-xs md:text-sm font-mono tracking-[0.6em] text-[#fbbf24] uppercase mb-4">Record 07 // The Second Age</p>
            <h2 className="text-[clamp(3.5rem,10vw,10rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_40px_rgba(251,191,36,0.4)] leading-none max-w-[90vw] break-words">TRETA YUGA</h2>
          </div>
        </motion.div>

        {/* S2: Ayodhya Base */}
        <motion.div style={{ opacity: s2, x: offsetLeft }} className="absolute inset-0 flex flex-col md:flex-row-reverse items-center justify-end text-right px-6 md:px-24">
          <div className="z-10 max-w-xl md:ml-12 text-left md:text-right">
            <h3 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-[#fbbf24] mb-2 leading-none">AYODHYA.</h3>
            <p className="text-xl md:text-3xl font-light text-white/80 leading-relaxed mt-4">The pinnacle of civilization. Ruled by King Dasharatha.</p>
          </div>
          <ImagePlaceholder title="AYODHYA_CITY" width="w-[80vw] md:w-[450px]" height="h-[300px]" className="mt-8 md:mt-0 rounded-2xl" />
        </motion.div>

        {/* S3: The Mothers */}
        <motion.div style={{ opacity: s3, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-3xl leading-relaxed border-r-4 border-[#fbbf24] pr-6">
            An empire held together by Dasharatha and his three Queens: <span className="font-bold text-[#fbbf24]">Kausalya, Kaikeyi, and Sumitra.</span>
          </p>
        </motion.div>

        {/* S4: The Brothers */}
        <motion.div style={{ opacity: s4, y: driftUp(0.06, 0.09) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
           <p className="text-lg md:text-xl font-mono tracking-[0.4em] uppercase text-white/50 mb-8">Four heirs born of sacred fire:</p>
           <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-white/70 leading-tight max-w-[90vw]">SHATRUGHNA.<br/>LAKSHMANA.<br/>BHARATA.</h2>
        </motion.div>

        {/* S5: Rama Reveal */}
        <motion.div style={{ opacity: s5, y: driftDown(0.08, 0.11) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(10rem,35vw,35rem)] font-black text-[#F8F8F8]/[0.1] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none mt-12">VISHNU</span>
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-xl md:text-3xl font-serif italic text-[#fbbf24] mb-4">And Kausalya's eldest.</p>
            <h1 className="text-[clamp(6rem,18vw,18rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_80px_rgba(251,191,36,0.6)] leading-none max-w-[90vw]">RAMA.</h1>
          </div>
        </motion.div>

        {/* S6: The Vibe */}
        <motion.div style={{ opacity: s6, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white max-w-3xl leading-relaxed bg-[#020617]/50 p-6 border-l-4 border-[#fbbf24] backdrop-blur-md">
            The citizens worshipped his footsteps. Unmatched in brutal warfare, yet devastatingly gentle. Where Rama walked, <span className="text-[#fbbf24] font-bold">Lakshmana</span> followed with fierce respect.
          </p>
        </motion.div>

        {/* S7: The Swayamvar Starts */}
        <motion.div style={{ opacity: s7, y: driftUp(0.12, 0.15) }} className="absolute inset-0 flex flex-col justify-end items-center text-center pb-[15vh] px-6 md:px-24 z-10">
          <p className="text-xl md:text-3xl font-light text-white/80 max-w-2xl leading-relaxed mb-4">To claim Princess Sita, a divine challenge is set.</p>
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-tighter text-[#fbbf24] leading-none max-w-[90vw]">THE PINAKA.</h2>
          <p className="text-lg md:text-2xl font-serif italic text-white/60 mt-4">The colossal bow of Lord Shiva.</p>
        </motion.div>

        {/* S8: Warlords Fail */}
        <motion.div style={{ opacity: s8, y: driftDown(0.14, 0.17) }} className="absolute inset-0 flex flex-col justify-end items-center text-center pb-[10vh] px-6 md:px-24 z-10">
          <ImagePlaceholder title="WARLORDS_RED_FACES" color="ef4444" width="w-[80vw] md:w-[400px]" height="h-[200px]" className="mb-6 rounded-2xl shrink-0" />
          <p className="text-2xl md:text-4xl font-serif italic text-white/80 max-w-3xl leading-relaxed">
            Warlords tried to lift it. Demons tried to lift it. Arrogant kings fell to their knees in humiliation.<br/>
            <span className="text-white font-black not-italic">NO ONE COULD.</span>
          </p>
        </motion.div>

        {/* S9: NEW SCENE - The Approach */}
        <motion.div style={{ opacity: s9, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-end items-start text-left pb-[15vh] px-6 md:px-24 z-10">
          <h3 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-white mb-4 leading-tight max-w-[90vw] break-words">
            THEN, RAMA APPROACHES.
          </h3>
          <p className="text-xl md:text-3xl font-serif italic text-white/70">
            The court falls entirely silent.
          </p>
        </motion.div>

        {/* S10: NEW SCENE - The Lift (Perfect Viewport Scaling) */}
        <motion.div style={{ opacity: s10, y: driftUp(0.18, 0.21) }} className="absolute inset-0 flex flex-col justify-center items-center text-center pt-[30vh] px-6 md:px-24 z-10">
           <ImagePlaceholder title="RAMA_LIFTING_BOW" color="3b82f6" width="w-[85vw] md:w-[450px]" height="h-[25vh] md:h-[35vh] min-h-[150px]" className="mb-4 md:mb-6 rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.4)] shrink-0 object-cover" />
           <p className="text-lg md:text-2xl font-light text-white/90 w-full max-w-3xl">
             He does not struggle. He lifts the divine weapon with quiet, absolute capability.
           </p>
        </motion.div>

        {/* S11: IT SNAPS */}
        <motion.div style={{ opacity: s11, y: driftDown(0.20, 0.23) }} className="absolute inset-0 flex flex-col justify-end items-center text-center pb-[15vh] px-6 z-10">
          <motion.h2 animate={{ x: [0, -10, 10, -10, 10, -5, 5, 0], y: [0, 5, -5, 5, -5, 2, -2, 0], filter: ["blur(0px)", "blur(4px)", "blur(0px)"] }} transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }} className="text-[clamp(6rem,18vw,18rem)] font-black uppercase tracking-widest text-white drop-shadow-[0_0_100px_rgba(255,255,255,1)] leading-none max-w-[90vw]">
            AND IT SNAPS.
          </motion.h2>
        </motion.div>

        {/* S12: The Joy */}
        <motion.div style={{ opacity: s12, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-3xl leading-relaxed drop-shadow-lg">
            A blinding flash. The cosmos shakes. He claims Sita, and the empire erupts in absolute joy.
          </p>
        </motion.div>

        {/* S13: The Marriage */}
        <motion.div style={{ opacity: s13, y: driftUp(0.24, 0.27) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white/90 max-w-4xl leading-relaxed mb-8 drop-shadow-lg">The tension clears. The cosmos celebrates the divine union.</p>
          <ImagePlaceholder title="VIVAHA_SCENE" color="fef08a" width="w-[80vw] md:w-[600px]" height="h-[350px]" className="rounded-xl shadow-[0_0_60px_rgba(251,191,36,0.3)] shrink-0" />
        </motion.div>

        {/* S14: The Homecoming */}
        <motion.div style={{ opacity: s14, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <ImagePlaceholder title="AYODHYA_CELEBRATION" color="fbbf24" width="w-[80vw] md:w-[500px]" height="h-[250px]" className="mb-6 rounded-xl shrink-0" />
          <h3 className="text-[clamp(2.5rem,5vw,5rem)] font-black uppercase tracking-widest text-[#fbbf24] leading-none">THE PERFECT RETURN.</h3>
          <p className="text-xl md:text-3xl font-light text-white/80 max-w-2xl mt-4">Ayodhya is adorned in gold. The era of Rama is about to begin.</p>
        </motion.div>

        {/* S15: The Poison Starts (RED BEGINS EXACTLY HERE) */}
        <motion.div style={{ opacity: s15, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-[#ef4444] drop-shadow-[0_0_40px_rgba(239,68,68,0.4)] leading-none">BUT IN THE SHADOWS...</h2>
        </motion.div>

        {/* S16: Manthara */}
        <motion.div style={{ opacity: s16, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <div className="flex flex-col md:flex-row-reverse items-center md:items-end w-full max-w-full md:max-w-[80vw]">
            <ImagePlaceholder title="MANTHARA_POISON" color="ef4444" width="w-[80vw] md:w-[350px]" height="h-[200px] md:h-[250px]" className="mb-6 md:mb-0 md:ml-8 rounded-2xl shrink-0" />
            <div className="w-full max-w-xl bg-[#1a0000]/80 p-6 md:p-8 border-r-4 border-[#ef4444] backdrop-blur-md">
              <p className="text-lg md:text-2xl font-light text-white leading-relaxed mb-4">
                <span className="font-bold text-[#ef4444]">Manthara</span>, a bitter servant, drips poison into the mind of Queen Kaikeyi.
              </p>
              <p className="text-md md:text-xl font-serif italic text-white/80">
                "If Rama is King, your son Bharata will be his servant. You will lose everything."
              </p>
            </div>
          </div>
        </motion.div>

        {/* S17: The Debt */}
        <motion.div style={{ opacity: s17, y: driftUp(0.32, 0.35) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h3 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-[#ef4444] mb-4 leading-none">THE ANCIENT DEBT.</h3>
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-3xl leading-relaxed">Years ago, Kaikeyi saved the King on a bloody battlefield. He promised her two undeniable boons.</p>
        </motion.div>

        {/* S18: The Trap */}
        <motion.div style={{ opacity: s18, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-mono tracking-[0.2em] uppercase text-white/50 mb-4">On the eve of coronation...</p>
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-tighter text-white bg-[#1a0000]/90 px-8 py-4 border border-[#ef4444]/50 shadow-[0_0_50px_rgba(239,68,68,0.5)] leading-none">THE DEBT IS CALLED.</h2>
        </motion.div>

        {/* S19: The Decree */}
        <motion.div style={{ opacity: s19, y: driftDown(0.36, 0.39) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <div className="bg-[#000000]/80 p-8 md:p-12 border-l-8 border-[#ef4444] backdrop-blur-md max-w-3xl">
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-white mb-6">1. The crown goes to Bharata.</h3>
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-[#ef4444]">2. Rama is banished for 14 years.</h3>
          </div>
        </motion.div>

        {/* S20: Dasharatha Shatters */}
        <motion.div style={{ opacity: s20, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white/90 max-w-4xl leading-relaxed">
            King Dasharatha physically shatters. He loves Rama more than his own life. The reality of the decree destroys him.
          </p>
        </motion.div>

        {/* S21: The Plea */}
        <motion.div style={{ opacity: s21, y: driftUp(0.40, 0.43) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
           <h2 className="text-[clamp(3rem,8vw,8rem)] font-black italic tracking-tighter text-white drop-shadow-[0_0_40px_rgba(239,68,68,0.8)] leading-none">"IGNORE ME!"</h2>
           <p className="text-xl md:text-3xl font-light tracking-[0.1em] text-white/80 max-w-3xl mt-6 bg-black/60 p-8">
            The King begs his son to stage a coup. To ignore the decree.<br/><span className="font-bold text-[#ef4444]">"Take the throne by force!"</span>
          </p>
        </motion.div>

        {/* S22: Rama's Power */}
        <motion.div style={{ opacity: s22, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-[clamp(3rem,7vw,7rem)] font-black uppercase tracking-widest text-white leading-none mb-6 max-w-[90vw] break-words">
            HE HAS THE <span className="text-[#ef4444] drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">ARMY.</span>
          </h3>
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-2xl leading-relaxed border-l-2 border-[#ef4444] pl-6">
            He holds the absolute, unwavering loyalty of the people. He could crush the decree and take the empire in a single heartbeat.
          </p>
        </motion.div>

        {/* S23: The Smile */}
        <motion.div style={{ opacity: s23, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-3xl leading-relaxed mb-6">But he does not rage. He does not complain.</p>
          <h3 className="text-[clamp(4rem,10vw,10rem)] font-black uppercase tracking-widest text-[#fbbf24] drop-shadow-lg leading-none">HE SMILES.</h3>
        </motion.div>

        {/* S24: Dharma */}
        <motion.div style={{ opacity: s24, y: driftUp(0.46, 0.49) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(3rem,7vw,7rem)] font-serif italic text-white leading-none max-w-[90vw] bg-black/80 px-10 py-6 border border-[#fbbf24]/30">"A father's word is law."</h2>
        </motion.div>

        {/* S25: Removing the Silks */}
        <motion.div style={{ opacity: s25, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
           <p className="text-2xl md:text-5xl font-light tracking-[0.1em] text-white/80 uppercase max-w-3xl leading-relaxed">He removes the royal silks. He hands back the crown.</p>
        </motion.div>

        {/* S26: The Companions */}
        <motion.div style={{ opacity: s26, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-3xl leading-relaxed border-r border-white/30 pr-8">
            The entire city of Ayodhya collapses in grief. The sky darkens. But followed fiercely by Sita and Lakshmana...  
          </p>
        </motion.div>

        {/* S27: BAREFOOT (Rain triggers here!) */}
        <motion.div style={{ opacity: s27, y: driftDown(0.52, 0.55) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10 overflow-hidden">
          <span className="absolute text-[clamp(10rem,40vw,40rem)] font-black text-white/[0.04] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none translate-y-32">EXILE</span>
          <div className="relative z-10 flex flex-col items-center">
            <ImagePlaceholder title="RAMA_EXILE" color="ffffff" width="w-[80vw] md:w-[600px]" height="h-[300px]" className="mb-8 rounded-2xl mix-blend-screen opacity-50 shrink-0 object-cover" />
            <h2 className="text-[clamp(4rem,12vw,12rem)] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-[0_0_50px_rgba(167, 237, 120, 0.8)] leading-none max-w-[90vw]">
              HE WALKS OUT BAREFOOT.
            </h2>
          </div>
        </motion.div>

        {/* S28: The Abyss */}
        <motion.div style={{ opacity: s28, y: driftUp(0.54, 0.57) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
           <p className="text-2xl md:text-4xl font-mono tracking-[0.4em] uppercase text-white/40">Into the deep forest.</p>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}