import React, { useRef, useState, Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Stars, Sparkles, Float, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { setGlobalMusic } from './GlobalAudio'; // 👈 ADD THIS
import { useEffect } from 'react'; // 👈 ADD THIS (if not already imported)

const isMobile = window.innerWidth < 768;
// ============================================================================
// 🎬 CINEMATIC LENS
// ============================================================================
const CinematicLens = ({ scrollProgress }) => {
  const dofRef = useRef();
  useFrame(() => {
    const p = scrollProgress.get();
    if (dofRef.current) {
      let blurAmount = 0;
      if (p > 0.4 && p < 0.8) blurAmount = Math.sin(((p - 0.4) / 0.4) * Math.PI) * 5; 
      dofRef.current.bokehScale = blurAmount;
    }
  });
  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} height={300} intensity={1.5} />
      <DepthOfField ref={dofRef} focusDistance={0.0} focalLength={0.02} bokehScale={2} height={480} />
      <Noise opacity={0.05} />
      <Vignette darkness={0.8} offset={0.2} />
    </EffectComposer>
  );
};

// ============================================================================
// ⚖️ 3D PHYSICS: THE ALCHEMICAL REACTOR
// ============================================================================
const ThermodynamicCore = ({ scrollProgress }) => {
  const innerCore = useRef();
  const wireframeShell = useRef();
  const sparks = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (innerCore.current && wireframeShell.current) {
      // 1. BLANK LIFE
      let innerScale = 0.5, shellScale = 1.5, yPos = 0, distort = 0.0, sparkOpacity = 0;
      let innerColor = new THREE.Color("#000000");
      let emissiveColor = new THREE.Color("#000000");
      let shellColor = new THREE.Color("#333333");

      // 2. NORMAL LIFE
      if (p > 0.15 && p <= 0.4) {
        const norm = (p - 0.15) / 0.25;
        innerScale = 0.5 + (norm * 0.2);
        innerColor.setHex(0x1e293b); 
        emissiveColor.setHex(0x0f172a); 
        shellColor.setHex(0x64748b);
        distort = norm * 0.05; 
      }

      // 3. FAILURE INSIDE
      if (p > 0.4 && p <= 0.75) {
        const fuel = (p - 0.4) / 0.35;
        innerScale = 0.7 + (fuel * 0.8);
        shellScale = 1.5 + (fuel * 1.5);
        yPos = -3 * fuel; 
        innerColor.setHex(0xb45309); 
        emissiveColor.setHex(0xf59e0b); 
        shellColor.setHex(0xffaa00); 
        distort = 0.05 + (fuel * 0.7); 
        sparkOpacity = fuel * 1;
      }

      // 4. LARGER THAN LIFE
      if (p > 0.75) {
        const launch = (p - 0.75) / 0.25;
        innerScale = 1.5 - (launch * 0.5); 
        shellScale = 3.0 + (launch * 5); 
        yPos = -3 + (launch * 15); 
        innerColor.setHex(0xffffff);
        emissiveColor.setHex(0xffffff); 
        shellColor.setHex(0x333333); 
        distort = Math.max(0, 0.75 - launch * 0.75); 
        sparkOpacity = 1 - launch;
      }

      innerCore.current.scale.lerp(new THREE.Vector3(innerScale, innerScale, innerScale), delta * 4);
      wireframeShell.current.scale.lerp(new THREE.Vector3(shellScale, shellScale, shellScale), delta * 3);
      innerCore.current.position.y = THREE.MathUtils.lerp(innerCore.current.position.y, yPos, delta * 4);
      wireframeShell.current.position.y = THREE.MathUtils.lerp(wireframeShell.current.position.y, yPos, delta * 4);
      
      innerCore.current.material.color.lerp(innerColor, delta * 4);
      innerCore.current.material.emissive.lerp(emissiveColor, delta * 4);
      innerCore.current.material.distort = THREE.MathUtils.lerp(innerCore.current.material.distort, distort, delta * 4);
      wireframeShell.current.material.color.lerp(shellColor, delta * 4);
      if (sparks.current) sparks.current.material.opacity = sparkOpacity;

      innerCore.current.rotation.y += delta * (0.2 + (p * 2));
      wireframeShell.current.rotation.x += delta * 0.1;
      wireframeShell.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <group>
      <Stars count={isMobile ? 1000 : 3000} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1} />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={innerCore}>
          <sphereGeometry args={[1, 128, 128]} />
          <MeshDistortMaterial color="#000000" emissive="#000000" emissiveIntensity={2} envMapIntensity={1} clearcoat={1} metalness={0.9} roughness={0.1} distort={0} speed={4} />
        </mesh>
        <mesh ref={wireframeShell}>
          <icosahedronGeometry args={[1, 2]} />
          <meshBasicMaterial color="#333333" wireframe transparent opacity={0.3} />
        </mesh>
      </Float>
      <Sparkles ref={sparks} position={[0, -4, 0]} count={300} scale={15} size={5} speed={2} color="#f59e0b" />
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 10, 10]} intensity={2} />
    </group>
  );
};

// ============================================================================
// 📖 THE SCRIPT: PERFECTLY PLACED TYPOGRAPHY
// ============================================================================
export default function TheTrueFormula({ onBack }) {
  const containerRef = useRef(null);
  
  // 👈 ADD THIS EFFECT TO TRIGGER MUSIC ON LOAD
  useEffect(() => {
    window.scrollTo(0, 0);
    setGlobalMusic('true_formula');
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { damping: 40, stiffness: 60, mass: 1 });

  // 1. BLANK LIFE (Centered, fading out)
  const b1_opacity = useTransform(p, [0, 0.05, 0.12, 0.15], [0, 1, 1, 0]);
  const b1_y = useTransform(p, [0, 0.15], ["5vh", "-5vh"]);

  // 2. NORMAL LIFE (Placed Top Left)
  const b2_opacity = useTransform(p, [0.15, 0.20, 0.28, 0.32], [0, 1, 1, 0]);
  const b2_x = useTransform(p, [0.15, 0.32], ["-5vw", "0vw"]);

  // 3. THE BALANCE (Placed Bottom Right)
  const b3_opacity = useTransform(p, [0.32, 0.36, 0.44, 0.48], [0, 1, 1, 0]);
  const b3_x = useTransform(p, [0.32, 0.48], ["5vw", "0vw"]);

  // 4. LARGER THAN LIFE (Centered, Heavy Impact)
  const b4_opacity = useTransform(p, [0.48, 0.52, 0.60, 0.64], [0, 1, 1, 0]);
  const b4_scale = useTransform(p, [0.48, 0.64], [0.9, 1.1]);

  // 5. FAILURE IS FUEL (Placed Center, Aggressive)
  const b5_opacity = useTransform(p, [0.64, 0.68, 0.76, 0.80], [0, 1, 1, 0]);
  const b5_y = useTransform(p, [0.64, 0.80], ["10vh", "-5vh"]);

  // 6. THE FALL (Placed Bottom Left, drops down)
  const b6_opacity = useTransform(p, [0.80, 0.84, 0.90, 0.92], [0, 1, 1, 0]);
  
  // 7. THE RISE (Centered, Blinding Ascension)
  const b7_opacity = useTransform(p, [0.92, 0.96, 1], [0, 1, 1]);
  const b7_y = useTransform(p, [0.92, 1], ["10vh", "0vh"]);

 return (
    <div ref={containerRef} className="relative w-full h-[1200vh] bg-[#010101] text-white overflow-clip font-sans selection:bg-[#f59e0b]/40">
      
      <button 
        onClick={onBack} 
        className="fixed top-8 left-8 z-[100] px-8 py-3 border border-white/20 rounded-full text-[10px] tracking-[0.4em] font-medium uppercase hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 backdrop-blur-xl cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      >
        ← Return
      </button>

      <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas dpr={[1, isMobile ? 1 : 1.5]} camera={{ position: [0, 0, 8], fov: 45 }}>
            <Suspense fallback={null}>
            <ThermodynamicCore scrollProgress={p} />
            <CinematicLens scrollProgress={p} />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </div>

      <div className="fixed inset-0 z-10 pointer-events-none">
        
        {/* BEAT 1: LIVING BLANK (Center) */}
        <motion.div style={{ opacity: b1_opacity, y: b1_y }} className="absolute inset-0 flex flex-col items-center justify-center px-10">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-2xl text-center mb-6">
            People who just <br/> live blank.
          </h2>
          <p className="text-lg md:text-2xl font-serif text-slate-400 italic text-center max-w-2xl">
            Only being the receiver. Seeking experience and pleasure without putting effort into any field.
          </p>
          <p className="mt-8 text-sm font-mono tracking-[0.3em] text-[#f59e0b] uppercase bg-black/40 px-6 py-2 rounded-full backdrop-blur-md">
            They cannot achieve success.
          </p>
        </motion.div>

        {/* BEAT 2: THE NORMAL TRAP (Top Left - Wraps around sphere) */}
        <motion.div style={{ opacity: b2_opacity, x: b2_x }} className="absolute top-[20vh] left-[5vw] md:left-[10vw] max-w-xl">
          <p className="text-2xl md:text-3xl font-light text-slate-300 leading-relaxed drop-shadow-xl">
            Those living a normal life, who feel normally, get the very little, normal success they dream of.
          </p>
          <div className="w-16 h-[1px] bg-[#f59e0b] my-6"></div>
          <p className="text-sm font-mono tracking-[0.2em] text-white/50 uppercase">
            Not the success they truly want.
          </p>
        </motion.div>

        {/* BEAT 3: THE BALANCE (Bottom Right - Counterweight to sphere) */}
        <motion.div style={{ opacity: b3_opacity, x: b3_x }} className="absolute bottom-[20vh] right-[5vw] md:right-[10vw] max-w-lg text-right">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            It's a Balance.
          </h2>
          <p className="mt-4 text-xl md:text-2xl font-serif text-slate-300 italic leading-snug">
            You cannot have too much success with very little failure.
          </p>
        </motion.div>

        {/* BEAT 4: LARGER THAN LIFE (Center - High Impact) */}
        <motion.div style={{ opacity: b4_opacity, scale: b4_scale }} className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl md:text-3xl font-light text-slate-300 mb-4 tracking-widest uppercase">
            If you want Success that is
          </p>
          <h1 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)] leading-[0.9]">
            LARGER<br/>THAN LIFE
          </h1>
        </motion.div>

        {/* BEAT 5: FAILURE IS FUEL (Center - Aggressive Amber) */}
        <motion.div style={{ opacity: b5_opacity, y: b5_y }} className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.6)_0%,transparent_60%)]">
          <p className="text-2xl md:text-4xl font-serif text-slate-300 italic mb-6">
            You have to put equal failure inside it.
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-black uppercase tracking-tighter text-[#f59e0b] drop-shadow-[0_0_50px_rgba(245,158,11,0.6)] leading-none text-center">
            FAILURE<br/>IS THE FUEL.
          </h1>
        </motion.div>

        {/* BEAT 6: THE FALL (Bottom Left - Gravity pulling down) */}
        <motion.div style={{ opacity: b6_opacity }} className="absolute bottom-[15vh] left-[5vw] md:left-[10vw] max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-2xl">
            The Larger... The Longer...
          </h2>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-400 drop-shadow-2xl">
            The harder you fall...
          </h2>
        </motion.div>

        {/* BEAT 7: THE RISE (Center - Ascension) */}
        <motion.div style={{ opacity: b7_opacity, y: b7_y }} className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="max-w-5xl text-center mt-[-10vh]">
            <p className="text-[clamp(3rem,vw,10rem)] font-light text-slate-300 mb-6 tracking-widest uppercase drop-shadow-xl">
              The greater and larger success
            </p>
            <h1 className="text-6xl md:text-[9rem] leading-[0.85] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_80px_rgba(255,255,255,1)]">
              YOU WILL<br/>ACHIEVE.
            </h1>
            <div className="mt-16 flex justify-center gap-6 items-center opacity-80">
              <div className="w-24 h-[1px] bg-white/50"></div>
              <p className="text-sm font-mono tracking-[0.8em] text-white font-bold uppercase">
                Law of Failure // Verified
              </p>
              <div className="w-24 h-[1px] bg-white/50"></div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}