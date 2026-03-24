import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial, Sphere, Text } from '@react-three/drei';
import { EffectComposer, Glitch, Noise, Vignette, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// --------------------------------------------------------
// 🦠 3D ENGINE: THE PARASITE (Represents the Urge)
// --------------------------------------------------------
const TheParasite = ({ phase }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Phase 0-2: The urge is aggressive, twitchy, and red
    if (phase < 3) {
      meshRef.current.rotation.x += delta * 2;
      meshRef.current.rotation.y += delta * 3;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1.5, delta * 5));
    } 
    // Phase 3-5: The urge is exposed and starts slowing down
    else if (phase >= 3 && phase < 6) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1.0, delta * 2));
    }
    // Phase 6+: The urge is dead. Transmuted to Ojas (Gold)
    else {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 0, delta * 2));
    }
  });

  const isDead = phase >= 6;

  return (
    <Float speed={isDead ? 1 : 10} rotationIntensity={isDead ? 0.1 : 2} floatIntensity={isDead ? 0.1 : 2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, -2]}>
        <MeshDistortMaterial 
          color={isDead ? "#fbbf24" : "#ef4444"} 
          emissive={isDead ? "#fbbf24" : "#ef4444"}
          emissiveIntensity={isDead ? 0.5 : 2}
          distort={isDead ? 0.1 : 0.8} 
          speed={isDead ? 1 : 10} 
          roughness={0.2}
          wireframe={phase >= 4} // Wireframe shows it breaking down
        />
      </Sphere>
      {isDead && <Sparkles count={200} scale={10} size={4} speed={0.5} color="#fbbf24" opacity={0.8} />}
    </Float>
  );
};

// --------------------------------------------------------
// 🫁 TACTICAL BREATHING (The physical reset)
// --------------------------------------------------------
const BoxBreathing = ({ onComplete }) => {
  const [phase, setPhase] = useState('Breathe In');
  const [timer, setTimer] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (cycles >= 4) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          setPhase((p) => {
            if (p === 'Breathe In') return 'Hold';
            if (p === 'Hold') return 'Breathe Out';
            if (p === 'Breathe Out') return 'Hold Empty';
            setCycles((c) => c + 1);
            return 'Breathe In';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, cycles, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center relative z-20 mt-12">
      <motion.div
        animate={{
          scale: phase === 'Breathe In' ? 2.5 : phase === 'Breathe Out' ? 1 : phase === 'Hold' ? 2.5 : 1,
          opacity: phase === 'Hold Empty' ? 0.2 : 1,
          borderColor: phase.includes('Hold') ? '#fbbf24' : '#00ccff'
        }}
        transition={{ duration: 4, ease: "linear" }}
        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center shadow-[0_0_60px_rgba(0,204,255,0.2)] bg-black/50 backdrop-blur-md"
      >
        <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{timer}</span>
      </motion.div>
      <h2 className="text-2xl md:text-4xl font-mono tracking-[0.5em] text-white uppercase mt-24 animate-pulse text-center">
        {phase}
      </h2>
      <p className="text-white/40 text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase mt-8 border border-white/10 px-6 py-2 rounded-full">
        Cycle {cycles + 1} of 4 // Flushing Adrenaline
      </p>
    </div>
  );
};

// --------------------------------------------------------
// 🛑 THE MAIN KILLSWITCH GAUNTLET
// --------------------------------------------------------
export default function EmergencyOverride({ onExit, onEnterOjas }) {
const [step, setStep] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  // ⏱️ THE MASTER TIMING ENGINE
  // Each index corresponds to a step. The number is milliseconds it stays on screen.
  // We use rapid-fire timings for the shock, and stop auto-playing at interactive steps.
  const stepTimings = [
    800,   // 0: STOP (Flashbang)
    2000,  // 1: Look at your hands
    2500,  // 2: Heart racing
    2500,  // 3: The "Just Once" Lie
    2500,  // 4: The Parasite
    3000,  // 5: The Simulation
    3000,  // 6: The Cuckold Reality
    null,  // 7: INTERACTIVE: I refuse
    null,  // 8: INTERACTIVE: Box Breathing
    null,  // 9: The Rebirth (Exit)
  ];

  useEffect(() => {
    const currentDuration = stepTimings[step];
    if (currentDuration !== null) {
      const timer = setTimeout(() => setStep((s) => s + 1), currentDuration);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // ⚡ HOLD-TO-COMMIT LOGIC FOR STEP 7
  useEffect(() => {
    let interval;
    if (step === 7 && isHolding) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep(8); // Move to breathing
            return 100;
          }
          return prev + 2;
        });
      }, 20);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, step]);

  // Map steps to visual phases for the 3D background
  const getPhase = () => {
    if (step < 3) return 1; // Aggressive
    if (step < 5) return 3; // Exposed
    if (step === 7) return 4; // Wireframe
    if (step >= 8) return 6; // Golden Ojas
    return 1;
  };

  const currentPhase = getPhase();
  const isCured = step >= 8;

  return (
    <div className="fixed inset-0 z-[999] bg-[#020000] font-sans text-white overflow-hidden flex flex-col items-center justify-center select-none">
      
      {/* 🌌 GLITCHY BACKGROUND EFFECTS */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-70">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <EffectComposer disableNormalPass>
            <Glitch delay={[0.1, 0.5]} duration={[0.1, 0.3]} strength={[0.5, 1.0]} active={!isCured} ratio={0.8} />
            <ChromaticAberration offset={[!isCured ? 0.08 : 0.002, 0.002]} />
            <Scanline density={1.5} opacity={!isCured ? 0.5 : 0.1} blendFunction={BlendFunction.OVERLAY} />
            <Noise opacity={0.6} blendFunction={BlendFunction.MULTIPLY} />
            <Vignette eskil={false} offset={0.1} darkness={0.95} />
          </EffectComposer>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color={isCured ? "#fbbf24" : "#ef4444"} />
          <TheParasite phase={currentPhase} />
        </Canvas>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-6 text-center flex flex-col items-center justify-center h-full">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: THE FLASHBANG */}
          {step === 0 && (
            <motion.div key="s0" initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
              <h1 className="text-[clamp(6rem,25vw,25rem)] font-black uppercase text-[#ffffff] mix-blend-difference leading-none tracking-tighter">
                STOP.
              </h1>
            </motion.div>
          )}

          {/* RAPID FIRE SLAPS (Steps 1-6) */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: "blur(10px)" }}>
              <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest leading-none text-[#ef4444]">
                Look at your hands.
              </h2>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
              <h2 className="text-4xl md:text-7xl font-light uppercase tracking-widest leading-tight">
                Heart racing. For what?
              </h2>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <h1 className="text-5xl md:text-8xl font-serif italic text-white/50 leading-none">
                "Just once."<br/>"Just for today."
              </h1>
            </motion.div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>
              <h2 className="text-[clamp(3rem,6vw,6rem)] font-black uppercase tracking-widest leading-none text-[#ef4444] bg-black p-8 border-4 border-[#ef4444]">
                THAT IS THE PARASITE TALKING.
              </h2>
            </motion.div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, filter: "blur(20px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }}>
              <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest leading-tight mb-6">
                You are trading your empire.
              </h2>
              <h3 className="text-2xl md:text-4xl font-mono text-[#00ccff] uppercase">
                For 5 seconds of pixels.
              </h3>
            </motion.div>
          )}

          {/* STEP 6: THE EGO HIT */}
          {step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <p className="text-2xl md:text-4xl font-light text-white/80 mb-6 uppercase tracking-widest">
                You wanna sit alone in the dark...
              </p>
              <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-tighter leading-none text-white bg-[#ef4444]/20 p-6">
                AND WATCH OTHER MEN CONQUER ?
              </h2>
            </motion.div>
          )}

          {/* STEP 7: INTERACTIVE CHECKPOINT (They MUST hold to proceed) */}
          {step === 7 && (
            <motion.div key="s7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pointer-events-auto">
              <h2 className="text-2xl md:text-5xl font-light uppercase tracking-widest leading-tight mb-16 text-center max-w-4xl">
                The algorithm wants you <span className="font-bold text-[#ef4444]">weak, docile, and addicted.</span>
              </h2>
              
              <div 
                className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 cursor-pointer touch-none group"
                onPointerDown={() => setIsHolding(true)}
                onPointerUp={() => setIsHolding(false)}
                onPointerLeave={() => setIsHolding(false)}
              >
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle cx="50%" cy="50%" r="48%" fill="transparent" stroke="rgba(239,68,68,0.2)" strokeWidth="4" />
                  <circle 
                    cx="50%" cy="50%" r="48%" fill="transparent" stroke="#ef4444" strokeWidth="8" 
                    strokeDasharray="300%" strokeDashoffset={`${300 - (holdProgress * 3)}%`} 
                    className="transition-all duration-75 ease-linear shadow-[0_0_50px_rgba(239,68,68,1)]"
                  />
                </svg>

                <div className={`w-48 h-48 md:w-56 md:h-56 rounded-full border border-[#ef4444]/30 flex flex-col items-center justify-center backdrop-blur-xl transition-all duration-300 ${isHolding ? 'bg-[#ef4444]/20 scale-95 border-[#ef4444]' : 'bg-black/60 group-hover:bg-[#ef4444]/10'}`}>
                  <h3 className={`font-black uppercase tracking-widest text-lg md:text-2xl transition-colors ${isHolding ? 'text-[#ef4444]' : 'text-white'} text-center px-4`}>
                    I refuse to be a slave
                  </h3>
                  <p className="text-white/40 font-mono text-[9px] md:text-[10px] tracking-[0.3em] uppercase mt-4 text-center leading-relaxed">
                    Press & Hold<br/>To Shatter
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 8: TACTICAL BREATHING */}
          {step === 8 && (
            <motion.div key="s8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
              <h3 className="text-[#00ccff] font-mono text-sm md:text-lg tracking-[0.5em] uppercase mb-4 text-center">
                System Override
              </h3>
              <p className="text-white/60 font-serif italic text-lg md:text-2xl mb-8 md:mb-16">
                Your heart rate is spiked. Do not look away. Breathe with the circle.
              </p>
              <BoxBreathing onComplete={() => setStep(9)} />
            </motion.div>
          )}

          {/* STEP 9: THE REBIRTH & REDIRECT */}
          {step === 9 && (
            <motion.div key="s9" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pointer-events-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-[#fbbf24]/10 to-transparent pointer-events-none" />
              
              <h2 className="relative z-10 text-[clamp(3.5rem,8vw,8rem)] font-black text-[#fbbf24] uppercase tracking-widest mb-4 drop-shadow-[0_0_60px_rgba(251,191,36,0.8)] leading-none text-center">
                THE URGE IS DEAD.
              </h2>
              <p className="relative z-10 text-xl md:text-3xl font-serif italic text-white/90 mb-16 max-w-4xl leading-relaxed text-center px-4">
                You survived the spike. The raw energy is still running through your veins. Do not let it sit there. <span className="text-[#fbbf24] not-italic font-bold">Transmute it immediately.</span>
              </p>
              
              <div className="relative z-10 flex flex-col sm:flex-row gap-6 w-full max-w-3xl justify-center px-6">
                <button 
                  onClick={onEnterOjas} // Back to intro/hub
                  className="w-full sm:w-auto px-8 py-5 md:px-12 md:py-6 bg-[#fbbf24] text-black font-black uppercase tracking-[0.2em] text-xs md:text-lg rounded-full hover:scale-105 transition-transform shadow-[0_0_60px_rgba(251,191,36,0.6)]"
                >
                  Enter Protocol OJAS ⚡
                </button>
                <button 
                  onClick={() => window.close()} 
                  className="w-full sm:w-auto px-8 py-5 md:px-12 md:py-6 border border-white/20 text-white font-bold uppercase tracking-[0.2em] text-xs md:text-lg rounded-full hover:bg-white/10 transition-colors"
                >
                  Close Tab & Get to Work
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}