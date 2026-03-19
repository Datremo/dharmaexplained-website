import React, { useRef, useState, Suspense } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Stars, Sparkles, Float, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';

// ============================================================================
// 🎵 AUDIO HUD: SYSTEM OVERRIDE
// ============================================================================
const AudioHUD = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <div className="fixed bottom-10 right-10 z-[100] flex items-center gap-5 bg-[#0a0a0a]/80 backdrop-blur-xl border border-red-500/20 px-5 py-3 rounded-none shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all hover:bg-black hover:border-red-500/50">
      <div className="flex flex-col text-right border-r border-red-500/20 pr-4">
        <p className="text-[9px] font-mono tracking-[0.4em] text-red-500 uppercase mb-1 animate-pulse">Resistance Frequency</p>
        <p className="text-xs font-mono font-bold tracking-widest text-white uppercase">Neural_Unlock.wav</p>
      </div>
      <button 
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-10 h-10 bg-red-600 text-white flex items-center justify-center hover:bg-white hover:text-red-600 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
        ) : (
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
    </div>
  );
};

// ============================================================================
// 🎬 POST-PROCESSING: THE RESISTANCE LENS
// ============================================================================
const CinematicLens = ({ scrollProgress }) => {
  const dofRef = useRef();
  useFrame(() => {
    const p = scrollProgress.get();
    if (dofRef.current) {
      // The lens loses focus as the mind gets "saturated" (0.1 - 0.7)
      // Then it snaps into sharp focus for the "Resistance" phase (0.8+)
      let blurAmount = 0;
      if (p > 0.1 && p < 0.7) blurAmount = Math.sin(((p - 0.1) / 0.6) * Math.PI) * 5;
      dofRef.current.bokehScale = blurAmount;
    }
  });
  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={2.5} />
      <DepthOfField ref={dofRef} focusDistance={0.0} focalLength={0.02} bokehScale={2} height={480} />
      <Noise opacity={0.08} /> 
      <Vignette darkness={0.9} offset={0.1} />
    </EffectComposer>
  );
};

// ============================================================================
// ⚖️ 3D PHYSICS: THE ALGORITHM & THE AWAKENING
// ============================================================================
const TheAlgorithmCore = ({ scrollProgress }) => {
  const brainRef = useRef();
  const cageRef = useRef();
  const particles = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (brainRef.current && cageRef.current) {
      
      // --- PHASE 1-8: The Enemy Plan (Untouched logic) ---
      let brainColor = new THREE.Color("#064e3b");
      let emissiveColor = new THREE.Color("#10b981");
      let cageColor = new THREE.Color("#111111");
      let distort = 0.2, speed = 0.5, cageScale = 6.0, particleOpacity = 0.2;

      // Addiction Phase (0.15 - 0.6)
      if (p > 0.15 && p <= 0.6) {
        const addict = (p - 0.15) / 0.45;
        brainColor.setHex(0x4c0519); emissiveColor.setHex(0xe11d48);
        distort = 0.2 + (addict * 1.2); speed = 0.5 + (addict * 8);
        cageScale = 6.0 - (addict * 3.5); particleOpacity = 0.2 + (addict * 0.8);
      }

      // Control Phase (0.6 - 0.86, through "For the Taking")
      if (p > 0.6 && p <= 0.86) {
        const control = (p - 0.6) / 0.26;
        brainColor.setHex(0xffffff); emissiveColor.setHex(0xffffff);
        cageColor.setHex(0xff0000); // Red lasers lock
        distort = Math.max(0, 1.4 - (control * 1.4)); speed = 0; 
        cageScale = 2.5 - (control * 0.5); // Cage locks
        particleOpacity = 1 - control; 
      }

      // --- 👇 PHASE 9-12: The Resistance (NEW PAGES) 👇 ---
      
      // BEAT 9-10: Exposure (0.86 - 0.94)
      // The brain turns a sickening purple as the reality of manipulation sinks in.
      // The red cage begins to shake.
      if (p > 0.86 && p <= 0.94) {
        brainColor.setHex(0x2a0030); emissiveColor.setHex(0x7c3aed); // Sick violet glow
        cageColor.setHex(0xff0000); cageScale = 2.0;
        brainRef.current.rotation.y += Math.sin(state.clock.elapsedTime * 20) * 0.1; // Brain shakes violently
      }

      // BEAT 11-12: The Breakout (0.94 - 1.0)
      // Brain turns blinding white. Cage SHATTERS (expands violently off-screen).
      if (p > 0.94) {
        const breakOut = (p - 0.94) / 0.06;
        brainColor.setHex(0xffffff); emissiveColor.setHex(0xffffff); // Blinding ascension
        cageScale = 2.0 + (breakOut * 10); // Cage explodes off-screen
        distort = 0; speed = 0.1;
      }

      // Smooth Physics Application
      brainRef.current.material.color.lerp(brainColor, delta * 3);
      brainRef.current.material.emissive.lerp(emissiveColor, delta * 3);
      brainRef.current.material.distort = THREE.MathUtils.lerp(brainRef.current.material.distort, distort, delta * 3);
      brainRef.current.material.speed = THREE.MathUtils.lerp(brainRef.current.material.speed, speed, delta * 3);
      
      cageRef.current.scale.lerp(new THREE.Vector3(cageScale, cageScale, cageScale), delta * 2);
      cageRef.current.material.color.lerp(cageColor, delta * 4);
      
      if (particles.current) particles.current.material.opacity = particleOpacity;

      // Rotations
      brainRef.current.rotation.x += delta * (0.2 + p);
      brainRef.current.rotation.y += delta * (0.3 + p);
      cageRef.current.rotation.y -= delta * 0.1;
    }
  });

  return (
    <group>
      <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />
      
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={brainRef}>
          <torusKnotGeometry args={[1, 0.3, 256, 32]} />
          <MeshDistortMaterial color="#064e3b" emissive="#10b981" emissiveIntensity={3} envMapIntensity={1} clearcoat={1} metalness={0.8} roughness={0.2} distort={0.2} speed={0.5} />
        </mesh>
        
        <mesh ref={cageRef}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#111111" wireframe transparent opacity={0.4} />
        </mesh>
      </Float>

      <Sparkles ref={particles} position={[0, 0, 0]} count={400} scale={15} size={3} speed={3} color="#e11d48" />
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
    </group>
  );
};

// ============================================================================
// 📖 THE SCRIPT: RESISTANCE TYPOGRAPHY HELPER
// ============================================================================
const CinematicText = ({ progress, start, end, children }) => {
  const peak = start + (end - start) / 2;
  const opacity = useTransform(progress, [start, start + 0.05, peak, end - 0.05, end], [0, 1, 1, 1, 0]);
  const scale = useTransform(progress, [start, end], [0.95, 1.05]);
  const blurValue = useTransform(progress, [start, start + 0.05, end - 0.05, end], [10, 0, 0, 10]);
  const filter = useTransform(blurValue, (v) => `blur(${v}px)`);

  return (
    <motion.div style={{ opacity, scale, filter }} className="absolute inset-0 flex flex-col justify-center items-center w-full px-6 md:px-12 pointer-events-none">
      {children}
    </motion.div>
  );
};

// ============================================================================
// 👑 MAIN VAULT: THE DOMINATION PROTOCOL
// ============================================================================
export default function TheDominationProtocol({ onBack }) {
  const containerRef = useRef(null);
  
  // ✅ Extended to 2000vh (NEW PAGE READY)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { damping: 40, stiffness: 60, mass: 1 });

  // (0.0 - 0.86) UNTOUCHED LOGIC
  const oldOp = useTransform(p, [0.55, 0.57, 0.65, 0.68], [0, 1, 1, 0]);
  const youthOp = useTransform(p, [0.58, 0.60, 0.65, 0.68], [0, 1, 1, 0]);
  const kidsOp = useTransform(p, [0.61, 0.63, 0.65, 0.68], [0, 1, 1, 0]);
  const controlOp = useTransform(p, [0.64, 0.67, 0.70, 0.73], [0, 1, 1, 0]);
  const controlScale = useTransform(p, [0.64, 0.67], [1.5, 1]);

  // (0.86 - 1.0) RESISTANCE LOGIC
  const exposedY = useTransform(p, [0.86, 0.90, 0.93, 0.96], ["10vh", "0vh", "0vh", "-10vh"]);
  const exposedOpacity = useTransform(p, [0.86, 0.90, 0.93, 0.96], [0, 1, 1, 0]);

  const breakScale = useTransform(p, [0.94, 0.98, 1], [0.8, 1.2, 1]);
  const finalOpacity = useTransform(p, [0.94, 0.98, 1], [0, 1, 1]);

  return (
    <div ref={containerRef} className="relative w-full h-[2000vh] bg-[#020202] text-white overflow-clip font-sans selection:bg-red-500/40">
      
      {/* (0.0 - 0.86) UNTOUCHED HEADER/UI */}
      <button onClick={onBack} className="fixed top-8 left-8 z-[100] px-6 py-3 border border-red-500/30 bg-black/50 backdrop-blur-md text-[10px] tracking-[0.4em] font-mono uppercase hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.1)]">
        [ X ] Disconnect
      </button>

      <AudioHUD />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <TheAlgorithmCore scrollProgress={p} />
            <CinematicLens scrollProgress={p} />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </div>

      {/* (0.0 - 0.86) UNTOUCHED ENEMY PLAN SCRIPT */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <CinematicText progress={p} start={0} end={0.12}>
          <div className="w-full max-w-5xl flex flex-col">
            <p className="text-red-500 font-mono tracking-[0.5em] text-sm md:text-base mb-6 animate-pulse">[ TOP SECRET // CLEARANCE LEVEL 9 ]</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] leading-none border-l-8 border-red-600 pl-8">Things required for <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">World Domination.</span></h1>
          </div>
        </CinematicText>

        <CinematicText progress={p} start={0.11} end={0.20}>
          <div className="absolute top-[15vh] left-[5vw] max-w-xl bg-black/60 p-8 border border-[#10b981]/30 backdrop-blur-md">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#10b981] mb-4">01. Saturate the Brains.</h2>
            <p className="text-lg md:text-xl font-mono text-white/70 leading-relaxed">Flood them with useless information.<br/> Ensure they will never be productive again.</p>
          </div>
        </CinematicText>

        <CinematicText progress={p} start={0.18} end={0.28}>
          <div className="absolute bottom-[20vh] right-[5vw] max-w-xl bg-black/60 p-8 border border-red-500/30 backdrop-blur-md text-right">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">02. Easy Access.</h2>
            <p className="text-lg md:text-xl font-serif italic text-white/70 leading-relaxed">Give them immediate, frictionless access to things that will harm them directly or indirectly. Let them destroy themselves.</p>
          </div>
        </CinematicText>

        <CinematicText progress={p} start={0.26} end={0.36}>
          <div className="max-w-6xl text-center">
            <p className="text-2xl md:text-4xl font-mono text-red-500 tracking-[0.2em] mb-4">// PROTOCOL 03</p>
            <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,0,0,0.5)] leading-[0.85]">GET THEM<br/>ADDICTED.</h1>
            <p className="mt-8 text-xl md:text-3xl font-light text-white/60 bg-black/50 px-8 py-4 inline-block backdrop-blur-md">To things that will <span className="text-red-500 font-bold">never</span> benefit them in any way.</p>
          </div>
        </CinematicText>

        <CinematicText progress={p} start={0.34} end={0.44}>
          <div className="absolute inset-0 flex items-center justify-between px-[5vw]">
            <div className="max-w-md bg-black/80 p-8 border-l-4 border-[#e11d48]"><h2 className="text-4xl font-black text-[#e11d48] uppercase tracking-tighter mb-4">04. Tempt Them.</h2><p className="text-xl font-mono text-white/80">Use lust as a weapon to monetize.</p></div>
            <div className="max-w-md bg-black/80 p-8 border-r-4 border-[#e11d48] text-right mt-32"><h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Desensitize.</h2><p className="text-xl font-serif italic text-white/60">Burn out their dopamine receptors until they feel nothing.</p></div>
          </div>
        </CinematicText>

        <CinematicText progress={p} start={0.42} end={0.52}>
          <div className="max-w-4xl text-center p-12 bg-black/70 backdrop-blur-2xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)]"><p className="text-xl md:text-2xl font-mono text-red-500 mb-6 tracking-widest">[ DIRECTIVE 05: REWRITE REALITY ]</p><h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-tight">Normalising, promoting, and influencing</h2><h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-500 mt-2">unhealthy acts, foods, and content.</h2></div>
        </CinematicText>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.h2 style={{ opacity: oldOp }} className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-600 absolute top-[30vh]">Fool the old.</motion.h2>
          {/* ✅ CHANGED TO BLACK */}
          <motion.h2 style={{ opacity: youthOp }} className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black absolute top-[42vh] drop-shadow-[0_0_20px_rgba(0,0,0,1)]">Break the youth.</motion.h2> 
          <motion.h2 style={{ opacity: kidsOp }} className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#e11d48] drop-shadow-[0_0_30px_rgba(225,29,72,0.8)] absolute top-[54vh]">Infect the kids.</motion.h2>
          <motion.h1 style={{ opacity: controlOp, scale: controlScale }} className="text-8xl md:text-[10rem] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_100px_rgba(255,255,255,1)] absolute top-[40vh] bg-black/60 px-10 rounded-3xl backdrop-blur-md">TAKE CONTROL.</motion.h1>
        </div>

        {/* ✅ (0.68 - 0.86) FINAL PLAN PAGE (UNTOUCHED) */}
        <CinematicText progress={p} start={0.68} end={0.86}>
          <div className="max-w-6xl text-center mt-[-15vh]">
            <p className="text-3xl md:text-5xl font-serif italic text-white/80 mb-10 drop-shadow-2xl">So the future is...</p>
            <h1 className="text-7xl md:text-[9rem] lg:text-[11rem] leading-[0.8] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-red-600 drop-shadow-[0_0_60px_rgba(255,0,0,0.4)]">CLEAR FOR<br/>THE TAKING.</h1>
            <div className="mt-20 flex justify-center gap-6 items-center opacity-80">
              <div className="w-24 h-1 bg-red-600"></div>
              <p className="text-xl font-mono tracking-[0.8em] text-red-500 font-bold uppercase">💀 DOMINATION Protocol Complete</p>
              <div className="w-24 h-1 bg-red-600"></div>
            </div>
          </div>
        </CinematicText>
      </div>

      {/* ============================================================================ */}
      {/* 📜 layer 3: 👇 👇 RESISTANCE SCRIPT (NEW PAGES) 👇 👇 */}
      {/* ============================================================================ */}
      <div className="fixed inset-0 z-10 pointer-events-none font-mono">
        
        {/* BEAT 9: THE EXPOSURE (Classification Level Change) */}
        <CinematicText progress={p} start={0.86} end={0.91}>
          <div className="max-w-4xl bg-black p-8 border border-red-500">
            <h1 className="text-red-500 text-5xl font-black mb-4 animate-pulse uppercase tracking-[0.1em]">[ ERROR // Neural Hijack Detected ]</h1>
            <div className="border-t border-red-500/20 pt-4">
              <p className="text-slate-500 tracking-[0.5em] text-xs mb-2">Original Protocol Classification: [Classified Level 9]</p>
              <p className="text-slate-100 tracking-[0.4em] text-xl font-bold uppercase">NEW Classification: [ Neural Exposure Level MAX ]</p>
            </div>
          </div>
        </CinematicText>

        {/* BEAT 10: REVEALING THE MANIPULATION */}
        <motion.div style={{ opacity: exposedOpacity, y: exposedY }} className="absolute inset-0 flex flex-col justify-center px-10 md:px-32">
          <div className="max-w-6xl">
            <p className="text-slate-400 text-3xl font-light mb-6">This isn’t an influence campaign.</p>
            <h1 className="text-white text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10">That’s how they<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">manipulate</span> you.</h1>
            <div className="w-full flex justify-end">
              <div className="max-w-3xl text-right p-8 bg-black/60 border border-slate-500/20 backdrop-blur-xl">
                <p className="text-slate-200 text-2xl font-serif italic mb-2 tracking-widest leading-relaxed">Have been. Are now.<br/>And plan to keep doing.</p>
                <p className="text-red-500 text-xs tracking-[0.3em] font-bold">This is not a realization. It's an expose.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BEAT 11: THE CALL TO ACTION */}
        <CinematicText progress={p} start={0.92} end={0.98}>
          <div className="max-w-6xl text-center flex flex-col items-center">
            <p className="text-red-500 tracking-[0.5em] text-sm mb-6 animate-pulse uppercase">Directive Update // Disobey</p>
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] leading-[0.85]">
              this is THEIR goal.<br/>THIS IS THEIR PLAN.
            </h1>
            <p className="mt-8 text-xl md:text-3xl font-light text-slate-300 bg-black/50 px-8 py-4 inline-block backdrop-blur-md border border-slate-500/20">
              And you just exposed it.
            </p>
          </div>
        </CinematicText>

        {/* BEAT 12: THE SHATTER (Climax) */}
        <motion.div style={{ opacity: finalOpacity, scale: breakScale }} className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="max-w-7xl text-center">
            <p className="text-xl md:text-3xl font-serif italic text-white/80 mb-6 drop-shadow-2xl">The future is not CLEAR for their taking...</p>
            <h1 className="text-7xl md:text-9xl lg:text-[12rem] leading-[0.8] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-red-600 drop-shadow-[0_0_100px_rgba(255,0,0,1)]">
              BREAK THEIR<br/>CAGE.
            </h1>
            <div className="mt-16 flex justify-center gap-6 items-center opacity-80">
              <div className="w-32 h-1 bg-red-600"></div>
              <p className="text-xl font-mono tracking-[1em] text-red-500 font-bold uppercase animate-pulse">
                💀 DISCONNECT PROTOCOL Initiated
              </p>
              <div className="w-32 h-1 bg-red-600"></div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}