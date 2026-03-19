import React, { useRef, useState, useEffect, Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  MeshDistortMaterial, Stars, Sparkles, Float, Environment, 
  MeshTransmissionMaterial, Text3D, Center
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { setGlobalMusic } from './GlobalAudio'; // 👈 ADD THIS
const isMobile = window.innerWidth < 768;

// ============================================================================
// 🌌 COMPONENT 2: THE 3D PHYSICS ENGINE (Corruption to Purification)
// ============================================================================
const MythologicalCore = ({ scrollProgress }) => {
  const innerCore = useRef();
  const outerShell = useRef();
  const particles = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();

    if (innerCore.current && outerShell.current) {
      // --- PHASE 1: DORMANT (0.0 to 0.15) ---
      let innerColor = new THREE.Color("#020202");
      let outerColor = new THREE.Color("#111111");
      let outerOpacity = 0.2;
      let distort = 0.05;
      let speed = 0.2;
      let shellScale = 1.2;

      // --- PHASE 2: THE INVASION OF KALI (0.15 to 0.6) ---
      if (p > 0.15 && p <= 0.6) {
        const kaliProgress = (p - 0.15) / 0.45;
        innerColor.setHex(0x2a0845); // Deep dark purple
        outerColor.setHex(0x6b21a8); // Sickly neon violet
        outerOpacity = 0.2 + (kaliProgress * 0.6); // Shell gets thick and toxic
        distort = 0.05 + (kaliProgress * 0.8); // Violent warping
        speed = 0.2 + (kaliProgress * 2.5); // Fast, chaotic heartbeat
        shellScale = 1.2 + (kaliProgress * 0.5); // Expands like a virus
      }

      // --- PHASE 3: THE KALKI PURIFICATION (0.6 to 1.0) ---
      if (p > 0.6) {
        const kalkiProgress = (p - 0.6) / 0.4;
        innerColor.setHex(0xffffff); // Pure God Light
        outerColor.setHex(0xffffff); // Blinding aura
        outerOpacity = Math.max(0, 0.8 - (kalkiProgress * 0.8)); // Shell shatters/fades away
        distort = Math.max(0, 0.85 - (kalkiProgress * 0.85)); // Perfect geometric stasis
        speed = 1;
        shellScale = 1.7 + (kalkiProgress * 2); // Explodes outward
        
        // Particles rise up into the heavens
        if (particles.current) particles.current.position.y += delta * 15 * kalkiProgress;
      }

      // Apply physics smoothly
      innerCore.current.material.color.lerp(innerColor, delta * 2);
      innerCore.current.material.distort = THREE.MathUtils.lerp(innerCore.current.material.distort, distort, delta * 2);
      innerCore.current.material.speed = THREE.MathUtils.lerp(innerCore.current.material.speed, speed, delta * 2);

      outerShell.current.material.color.lerp(outerColor, delta * 2);
      outerShell.current.material.opacity = THREE.MathUtils.lerp(outerShell.current.material.opacity, outerOpacity, delta * 2);
      outerShell.current.scale.lerp(new THREE.Vector3(shellScale, shellScale, shellScale), delta * 2);

      // Slow majestic rotation
      innerCore.current.rotation.y += delta * 0.1;
      outerShell.current.rotation.y -= delta * 0.15;
      outerShell.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group>
        <Stars count={isMobile ? 1000 : 3000} />
      <Stars radius={100} depth={50} count={4000} factor={3} saturation={0} fade speed={0.5} />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <group>
          {/* THE INNER CORE (The Human Soul) */}
          <mesh ref={innerCore}>
            <octahedronGeometry args={[1, 0]} />
            <MeshDistortMaterial 
              color="#020202" metalness={1} roughness={0.1} 
              distort={0.05} speed={0.2} clearcoat={1}
            />
          </mesh>

          {/* THE OUTER SHELL (Kali's Manipulation -> Kalki's Light) */}
          <mesh ref={outerShell}>
            <icosahedronGeometry args={[1, 4]} />
            <MeshTransmissionMaterial 
              transmission={1} thickness={0.5} roughness={0.2} ior={1.5}
              color="#111111" transparent opacity={0.2}
            />
          </mesh>
        </group>
      </Float>

      <group ref={particles}>
        <Sparkles position={[0, -2, 0]} count={150} scale={15} size={3} speed={0.2} opacity={0.5} color="#c084fc" />
      </group>
      
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
    </group>
  );
};

// ============================================================================
// 🎬 COMPONENT 3: POST-PROCESSING ENGINE (Crash-Proof Edition)
// ============================================================================
const CinematicEffects = () => {
  return (
    <EffectComposer disableNormalPass>
      {/* Intense cinematic glow */}
      <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
      
      {/* Permanent subtle lens distortion (No dynamic refs that cause crashes) */}
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.002, 0.002]} />
      
      {/* Gritty film texture */}
      <Noise opacity={0.03} />
      <Vignette darkness={0.7} offset={0.3} />
    </EffectComposer>
  );
};

// ============================================================================
// 📖 COMPONENT 4: THE SCRIPT CONTROLLER (Perfectly Centered Text)
// ============================================================================
// Reusable component that fades in and scales a block of text based on scroll
const CinematicText = ({ progress, start, end, children, align = "center" }) => {
  const peak = start + (end - start) / 2;
  
  // Smooth fade in and out
  const opacity = useTransform(progress, [start, start + 0.05, peak, end - 0.05, end], [0, 1, 1, 1, 0]);
  
  // Cinematic slow zoom
  const scale = useTransform(progress, [start, end], [0.95, 1.1]);
  
  // Slight blur effect on entry and exit for that film feel
  const blurValue = useTransform(progress, [start, start + 0.05, end - 0.05, end], [10, 0, 0, 10]);
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);

  const alignments = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right"
  };

  return (
    <motion.div 
      style={{ opacity, scale, filter }} 
      className={`absolute inset-0 flex flex-col justify-center w-full px-8 md:px-24 pointer-events-none ${alignments[align]}`}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// 👑 MAIN VAULT: THE SLOW ANTIDOTE
// ============================================================================
export default function TheSlowAntidote({ onBack }) {
  const containerRef = useRef(null);

  // 👈 ADD THIS EFFECT
  useEffect(() => {
    window.scrollTo(0, 0);
    setGlobalMusic('slow_antidote');
  }, []);
  // Massive 1000vh scroll container for buttery smooth pacing
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // High damping spring removes all jitter from mouse wheels
  const smoothProgress = useSpring(scrollYProgress, { damping: 40, stiffness: 80, mass: 1 });

  return (
    <div ref={containerRef} className="relative w-full h-[1000vh] bg-[#010101] text-white selection:bg-[#8b5cf6]/40 font-sans">
      
      {/* 🔙 UI LAYER (Top) */}
      <button 
        onClick={onBack} 
        className="fixed top-8 left-8 z-[100] px-6 py-3 border border-white/20 rounded-full text-xs tracking-[0.3em] font-medium uppercase hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 backdrop-blur-xl cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      >
        ← Esc. Construct
      </button>


      {/* 🌌 LAYER 1: THE FIXED 3D ENGINE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <MythologicalCore scrollProgress={smoothProgress} />
            <CinematicEffects />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </div>

      {/* 📜 LAYER 2: THE STICKY TEXT LENS */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        
        {/* BEAT 1: Introduction */}
        <CinematicText progress={smoothProgress} start={0} end={0.12} align="center">
          <span className="mb-8 px-4 py-2 rounded-full border border-white/20 bg-black/50 text-[10px] tracking-[0.4em] font-mono text-white/70 backdrop-blur-md">
            [ SYSTEM FILE : 02 ]
          </span>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-none">
            God and Evil<br/>are real.
          </h2>
        </CinematicText>

        {/* BEAT 2: The Shift */}
        <CinematicText progress={smoothProgress} start={0.1} end={0.22} align="center">
          <div className="max-w-4xl bg-black/40 p-10 rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <p className="text-2xl md:text-4xl font-light text-white/90 leading-relaxed italic">
              God is no longer avataring on Earth. <br/>
              Because demons are no longer invading in physical form.
            </p>
          </div>
        </CinematicText>

        {/* BEAT 3: Kali's Stronghold */}
        <CinematicText progress={smoothProgress} start={0.2} end={0.35} align="left">
          <div className="max-w-4xl pl-4 md:pl-20">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#c084fc] drop-shadow-[0_0_40px_rgba(192,132,252,0.4)]">
              KALI HAS<br/>TAKEN HOLD.
            </h2>
            <p className="mt-8 text-xl md:text-2xl font-serif text-white/80 leading-relaxed max-w-2xl border-l-2 border-[#8b5cf6] pl-6">
              He sends fragments of himself into humanity. Manipulating them into abandoning the light.
            </p>
            <p className="mt-6 text-sm font-mono tracking-[0.4em] text-[#8b5cf6] uppercase">
              [Lust] [Envy] [Laziness] [Greed] [GLuttony]
            </p>
          </div>
        </CinematicText>

        {/* BEAT 4: God's Countermeasure */}
        <CinematicText progress={smoothProgress} start={0.33} end={0.48} align="left">
          <div className="max-w-4xl pr-4 md:pr-20">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[#EDB50C] drop-shadow-[0_0_40px_rgba(134, 30, 238, 0.4)]">
              That is why <br/>the Divine <br/> does not manifest <br/>entirely.
            </h2>

            <p className="mt-8 text-xl md:text-4xl font-serif text-white/80 leading-relaxed max-w-2xl border-l-2 border-[#64FD4C] pl-6">
              He sends fragments.
              Anchored in the minds of those who refuse to be manipulated.
            </p>
          </div>
        </CinematicText>

        {/* BEAT 5: The Waiting Game */}
        <CinematicText progress={smoothProgress} start={0.46} end={0.62} align="center">
          <span className="mb-6 px-4 py-2 rounded-full border border-red-500/30 bg-black/80 text-[10px] tracking-[0.5em] font-mono text-red-400 backdrop-blur-xl">
            [ ENTITY DETECTED: KALI ]
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white/90">
            Waiting for the shadow
          </h1>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#c084fc]/50">
            to fully emerge.
          </h1>
          <p className="mt-12 text-2xl font-light text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
            So Lord Kalki can erase it entirely.
          </p>
        </CinematicText>

        {/* BEAT 6: The Poison */}
        <CinematicText progress={smoothProgress} start={0.6} end={0.78} align="center">
          <div className="max-w-5xl bg-black/60 p-12 rounded-full backdrop-blur-2xl border border-t-[#8b5cf6]/50 border-b-white/10 shadow-[0_0_100px_rgba(139,92,246,0.2)]">
            <p className="text-4xl md:text-6xl font-serif italic text-white font-medium drop-shadow-xl">
              This time, the attack is a <span className="text-[#c084fc]">slow poison</span>.
            </p>
          </div>
        </CinematicText>

        {/* BEAT 7: The Antidote (The Climax) */}
        <CinematicText progress={smoothProgress} start={0.76} end={0.92} align="center">
          <div className="max-w-7xl">
            <p className="text-2xl md:text-3xl font-light text-white/80 uppercase tracking-[0.5em] mb-8">
              And a slow poison demands...
            </p>
            <h1 className="text-[clamp(3.5rem,8vw,10rem)] leading-[0.8] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_100px_rgba(255,255,255,1)] leading-[0.85]">
              A SLOW<br/>ANTIDOTE.
            </h1>
          </div>
        </CinematicText>

        {/* BEAT 8: Conclusion / Outro */}
        <CinematicText progress={smoothProgress} start={0.9} end={1.0} align="center">
          <div className="flex flex-col items-center opacity-80 mt-32">
            <div className="w-px h-24 bg-gradient-to-b from-transparent to-white mb-8"></div>
            <p className="text-sm md:text-base font-mono tracking-[0.8em] text-white uppercase font-bold">
              Construct 02 // Integrated
            </p>
            <div className="w-px h-24 bg-gradient-to-t from-transparent to-white mt-8"></div>
          </div>
        </CinematicText>
      </div>
    </div>
  );
}