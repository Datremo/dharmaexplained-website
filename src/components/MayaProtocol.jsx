import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, Glitch, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import CinematicCursor from './CinematicCursor';
import { setGlobalMusic } from './GlobalAudio';

// --------------------------------------------------------
// 🖼️ HELPER: CINEMATIC IMAGE PLACEHOLDER
// --------------------------------------------------------
const ImagePlaceholder = ({ title, width, height, className = "" }) => (
  <div className={`relative overflow-hidden bg-[#1a0505]/80 border border-[#00ffff]/30 flex items-center justify-center text-[#00ffff]/60 font-mono text-[10px] uppercase tracking-[0.3em] backdrop-blur-md ${width} ${height} ${className} shadow-[0_0_30px_rgba(0,255,255,0.15)] group`}>
    <div className="absolute inset-0 bg-gradient-to-br from-[#00ffff]/20 via-transparent to-black opacity-60" />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
    <span className="relative z-10 drop-shadow-md mix-blend-screen">[ {title} ]</span>
  </div>
);

// --------------------------------------------------------
// 🔮 THE PURPLE VOID EFFECT (Crash-Proof)
// --------------------------------------------------------
const EndSceneEffect = ({ scrollProgress, isMobile }) => {
  const sparklesRef = useRef();
  
  useFrame(() => {
    if (sparklesRef.current) {
      const p = scrollProgress.get();
      // Instantly scale the particles up right as the flashbang hits (0.89)
      const targetScale = p > 0.89 ? 1 : 0.001;
      sparklesRef.current.scale.setScalar(targetScale);
    }
  });

  return (
    <group ref={sparklesRef} scale={0.001}>
      <Sparkles 
        count={isMobile ? 150 : 300} 
        scale={20} 
        size={isMobile ? 3 : 5} 
        speed={0.3} 
        color="#ff00ff" 
        opacity={0.5} 
      />
    </group>
  );
};

// --------------------------------------------------------
// 🔥 THE 3D ENGINE
// --------------------------------------------------------
const MayaMatrixScene = ({ scrollProgress, isMobile }) => {
  const screensRef = useRef();
  const monolithRef = useRef();
  const screenCount = isMobile ? 80 : 200;

  const screensData = useMemo(() => {
    return Array.from({ length: screenCount }).map(() => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI,
      speed: Math.random() * 0.05 + 0.01,
      radius: Math.random() * 5 + 3,
      angle: Math.random() * Math.PI * 2
    }));
  }, [screenCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    if (screensRef.current) {
      screensData.forEach((data, i) => {
        data.angle += data.speed;
        let targetX = Math.cos(data.angle) * data.radius;
        let targetZ = Math.sin(data.angle) * data.radius;
        let targetY = data.y + Math.sin(state.clock.elapsedTime + i) * 0.05;
        let rotX = data.rx += 0.01;
        let rotY = data.ry += 0.02;

        // 🔥 THE SHATTER: Synced to S45
        if (scroll > 0.88) {
          const explosionForce = (scroll - 0.88) * 300; 
          targetX += Math.sign(targetX) * explosionForce;
          targetY += Math.sign(targetY) * explosionForce;
          targetZ += explosionForce * 1.5; 
          rotX += explosionForce * 0.3;
          rotY += explosionForce * 0.3;
        }

        dummy.position.set(targetX, targetY, targetZ);
        dummy.rotation.set(rotX, rotY, 0);
        
        const scale = scroll > 0.90 ? Math.max(0, 1 - (scroll - 0.90) * 15) : 1;
        if (scroll > 0.88 && scale > 0) {
           dummy.scale.set(scale * (Math.random() * 3 + 0.1), scale * (Math.random() * 0.5 + 0.1), scale);
        } else {
           dummy.scale.set(scale, scale, scale);
        }
        
        dummy.updateMatrix();
        screensRef.current.setMatrixAt(i, dummy.matrix);
      });
      screensRef.current.instanceMatrix.needsUpdate = true;
    }

    if (monolithRef.current) {
      let targetScaleY = 0.01;
      let targetOpacity = 0;

      if (scroll > 0.91) {
        targetScaleY = 1;
        targetOpacity = 1;
      }

      monolithRef.current.scale.y = THREE.MathUtils.lerp(monolithRef.current.scale.y, targetScaleY, delta * 0.5);
      monolithRef.current.material.opacity = THREE.MathUtils.lerp(monolithRef.current.material.opacity, targetOpacity, delta);
      monolithRef.current.rotation.y += delta * 0.05; 
    }
  });

  return (
    <group position={[isMobile ? 1 : 0, 0, -5]}>
      <instancedMesh ref={screensRef} args={[null, null, screenCount]}>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshStandardMaterial color="#00ffff" emissive="#ff00ff" emissiveIntensity={0.8} wireframe />
      </instancedMesh>
      <Box ref={monolithRef} args={[isMobile ? 2 : 3, 12, isMobile ? 2 : 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.8} transparent opacity={0} />
      </Box>
    </group>
  );
};

// --------------------------------------------------------
// 💡 DYNAMIC LIGHTING (Razor-Sharp Flashbang -> Purple Void)
// --------------------------------------------------------
const SceneLights = ({ scrollProgress }) => {
  const ambientRef = useRef();
  const pointRef = useRef();

  useFrame(() => {
    const p = scrollProgress.get();
    let ambientColor = new THREE.Color("#110022"); 
    let pointColor = new THREE.Color("#00ffff");
    let intensity = 2.0;

    // 💥 BLINDING FLASH (Extremely tight window during the shatter!)
    if (p >= 0.885 && p <= 0.895) {
       ambientColor = new THREE.Color("#ffffff");
       pointColor = new THREE.Color("#ffffff");
       intensity = 40.0; 
    } 
    // 🗿 REALITY MONOLITH (Instantly cuts to the dark void before S46 starts)
    else if (p > 0.895) {
      ambientColor = new THREE.Color("#0a0011"); 
      pointColor = new THREE.Color("#ff00ff");   
      intensity = 5.0; 
    }

    // ✨ CUSTOM LERP: If we just finished the flash, snap to black MUCH faster (0.5) so it doesn't bleed!
    const lerpSpeed = (p > 0.895 && p < 0.905) ? 0.5 : 0.2;

    if (ambientRef.current) ambientRef.current.color.lerp(ambientColor, lerpSpeed);
    if (pointRef.current) {
      pointRef.current.color.lerp(pointColor, lerpSpeed);
      pointRef.current.intensity = THREE.MathUtils.lerp(pointRef.current.intensity, intensity, lerpSpeed);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} />
      <pointLight ref={pointRef} position={[5, 5, 5]} distance={50} />
      <pointLight color="#ff00ff" position={[-5, -5, 5]} distance={50} intensity={1.5} />
    </>
  );
};

// --------------------------------------------------------
// 🚨 POST-PROCESSING
// --------------------------------------------------------
const MayaEffects = ({ scrollProgress, isMobile }) => {
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(true);
  const glitchSafetyLock = useRef(true); 
  const aberrationOffset = useMemo(() => new THREE.Vector2(0.02, 0.02), []);

  useEffect(() => setMounted(true), []);

  useFrame(() => {
    const p = scrollProgress.get();
    const shouldGlitch = p < 0.91;
    if (glitchSafetyLock.current !== shouldGlitch) {
      glitchSafetyLock.current = shouldGlitch;
      setGlitchActive(shouldGlitch);
    }
    
    if (p > 0.88 && p < 0.91) {
      aberrationOffset.set(0.08, 0.08); 
    } else if (p >= 0.91) {
      aberrationOffset.set(0, 0); 
    } else {
      aberrationOffset.set(0.01, 0.01);
    }
  });

  if (!mounted || isMobile) return null;

  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.3} intensity={1.5} mipmapBlur={false} />
      <Noise opacity={0.4} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.4} darkness={0.8} />
      <ChromaticAberration offset={aberrationOffset} />
      {glitchActive && (
        <Glitch delay={[0.5, 1.5]} duration={[0.1, 0.3]} strength={[0.02, 0.06]} active={glitchActive} ratio={0.8} />
      )}
    </EffectComposer>
  );
};

// --------------------------------------------------------
// ⚔️ MAIN EDITORIAL COMPONENT (50-SCENE MAGNUM OPUS)
// --------------------------------------------------------
export default function MayaProtocol({ onBack, onAwaken,onSwitchProtocol }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
 useEffect(() => { 
    // 🛑 BRUTE-FORCE TELEPORT
    // Instantly force scroll to 0
    window.scrollTo(0, 0); 
    
    // Wait exactly 50ms for Lenis momentum to die, then force it AGAIN
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    }, 50);
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768); 
    checkMobile(); 
    window.addEventListener('resize', checkMobile); 
    return () => window.removeEventListener('resize', checkMobile); 
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

 // 🩸 COLOR SHIFTS (Razor-sharp flashbang that dies completely before the next scene)
  const bgColor = useTransform(sp, 
    [0.0, 0.2, 0.4, 0.6, 0.88, 0.885, 0.89, 0.895, 0.90, 1.0], 
    ["#0a0514", "#110011", "#1a0005", "#050f1a", "#000000", "#ffffff", "#ffffff", "#ffffff", "#000000", "#000000"]
  );
  // 🎬 ZERO OVERLAP MATH: Next scene won't appear until previous disappears
  const o = (start, peak1, peak2, end) => {
    const safeFadeIn = start + 0.005;
    const safeFadeOutStart = peak2 - 0.005;
    const safeFadeOutEnd = peak2 - 0.001; 
    return useTransform(sp, [start, safeFadeIn, safeFadeOutStart, safeFadeOutEnd], [0, 1, 1, 0]);
  };
  
  const s1  = o(0.00, 0.01, 0.02, 0.03); 
  const s2  = o(0.02, 0.03, 0.04, 0.05); 
  const s3  = o(0.04, 0.05, 0.06, 0.07); 
  const s4  = o(0.06, 0.07, 0.08, 0.09); 
  const s5  = o(0.08, 0.09, 0.10, 0.11); 
  const s6  = o(0.10, 0.11, 0.12, 0.13); 
  const s7  = o(0.12, 0.13, 0.14, 0.15); 
  const s8  = o(0.14, 0.15, 0.16, 0.17); 
  const s9  = o(0.16, 0.17, 0.18, 0.19); 
  const s10 = o(0.18, 0.19, 0.20, 0.21); 
  const s11 = o(0.20, 0.21, 0.22, 0.23); 
  const s12 = o(0.22, 0.23, 0.24, 0.25); 
  const s13 = o(0.24, 0.25, 0.26, 0.27); 
  const s14 = o(0.26, 0.27, 0.28, 0.29); 
  const s15 = o(0.28, 0.29, 0.30, 0.31); 
  const s16 = o(0.30, 0.31, 0.32, 0.33); 
  const s17 = o(0.32, 0.33, 0.34, 0.35); 
  const s18 = o(0.34, 0.35, 0.36, 0.37); 
  const s19 = o(0.36, 0.37, 0.38, 0.39); 
  const s20 = o(0.38, 0.39, 0.40, 0.41); 
  const s21 = o(0.40, 0.41, 0.42, 0.43); 
  const s22 = o(0.42, 0.43, 0.44, 0.45); 
  const s23 = o(0.44, 0.45, 0.46, 0.47); 
  const s24 = o(0.46, 0.47, 0.48, 0.49); 
  const s25 = o(0.48, 0.49, 0.50, 0.51); 
  const s26 = o(0.50, 0.51, 0.52, 0.53); 
  const s27 = o(0.52, 0.53, 0.54, 0.55); 
  const s28 = o(0.54, 0.55, 0.56, 0.57); 
  const s29 = o(0.56, 0.57, 0.58, 0.59); 
  const s30 = o(0.58, 0.59, 0.60, 0.61); 
  const s31 = o(0.60, 0.61, 0.62, 0.63); 
  const s32 = o(0.62, 0.63, 0.64, 0.65); 
  const s33 = o(0.64, 0.65, 0.66, 0.67); 
  const s34 = o(0.66, 0.67, 0.68, 0.69); 
  const s35 = o(0.68, 0.69, 0.70, 0.71); 
  const s36 = o(0.70, 0.71, 0.72, 0.73); 
  const s37 = o(0.72, 0.73, 0.74, 0.75); 
  const s38 = o(0.74, 0.75, 0.76, 0.77); 
  const s39 = o(0.76, 0.77, 0.78, 0.79); 
  const s40 = o(0.78, 0.79, 0.80, 0.81); 
  const s41 = o(0.80, 0.81, 0.82, 0.83); 
  const s42 = o(0.82, 0.83, 0.84, 0.85); 
  const s43 = o(0.84, 0.85, 0.86, 0.87); 
  const s44 = o(0.86, 0.87, 0.88, 0.89); 
  const s45 = o(0.88, 0.89, 0.90, 0.91); 
  const s46 = o(0.90, 0.91, 0.92, 0.93); 
  const s47 = o(0.92, 0.93, 0.94, 0.95); 
  const s48 = o(0.94, 0.95, 0.96, 0.97); 
  const s49 = o(0.96, 0.97, 0.98, 0.99); 
  const s50 = useTransform(sp, [0.98, 0.99, 1, 1], [0, 1, 1, 1]); 

  // ✨ Safe Physics Hooks
  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const s44Rise = useTransform(sp, [0.84, 0.89], ["40vh", "-10vh"]);
  
  const offsetLeft = isMobile ? "2vw" : "15vw";
  const offsetRight = isMobile ? "-2vw" : "-15vw";

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[6000vh] font-sans text-white selection:bg-[#00ffff]/30">
      <div className="hidden md:block"><CinematicCursor /></div>
{/* ⚡ PREMIUM GLASSMORPHIC PROTOCOL SWITCHER */}
      <div 
        className="fixed top-6 right-6 z-[100] flex flex-col items-end"
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        
        {/* THE ACTIVE PILL BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative px-5 md:px-6 py-2.5 bg-black/20 border border-white/10 rounded-full text-white/90 text-[10px] md:text-xs tracking-[0.2em] uppercase backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer flex items-center gap-3 md:gap-4 transition-colors hover:border-[#fbbf24]/50 hover:bg-black/40 overflow-hidden group"
        >
          {/* Subtle animated gradient inside the button */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fbbf24]/10 to-transparent -translate-x-full group-hover:animate-[glint_2s_ease-in-out_infinite]" />
          
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fbbf24] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,1)]"></span>
          </span>
          <span className="relative z-10 font-medium">Protocol OS</span> 
          <motion.span 
            animate={{ rotate: isMenuOpen ? 180 : 0 }} 
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-[8px] opacity-50 relative z-10"
          >
            ▼
          </motion.span>
        </motion.button>
        
        {/* THE GLASS DROPDOWN PANEL */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(10px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-14 right-0 w-64 md:w-72 origin-top-right"
            >
              {/* Ultra-Blur Container */}
              <div className="bg-[#050505]/40 border border-white/10 rounded-3xl backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden p-2 relative">
                
                {/* Internal Glow Effect */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#fbbf24] rounded-full blur-[80px] opacity-20 pointer-events-none" />

                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-[8px] font-mono tracking-[0.4em] text-white/40 uppercase">Select Override Phase</p>
                </div>

                <div className="flex flex-col gap-1">
                  {[
                    { id: 'lustbreaker', num: '01', name: 'Urge Killer', color: 'group-hover:text-[#ef4444]', border: 'group-hover:border-[#ef4444]/30' },
                    { id: 'mayaprotocol', num: '02', name: 'Shatter Maya', color: 'group-hover:text-[#b026ff]', border: 'group-hover:border-[#b026ff]/30' },
                    { id: 'neuralreality', num: '03', name: 'Brain Science', color: 'group-hover:text-[#00ccff]', border: 'group-hover:border-[#00ccff]/30' },
                    { id: 'lifesaverprotocol', num: '04', name: 'Tactical Guide', color: 'group-hover:text-white', border: 'group-hover:border-white/30' },
                    { id: 'karmaprotocol', num: '05', name: 'The Oath', color: 'group-hover:text-[#fbbf24]', border: 'group-hover:border-[#fbbf24]/30' }
                  ].map((protocol) => (
                    <button 
                      key={protocol.id}
                      onClick={() => onSwitchProtocol(protocol.id)}
                      className="group w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Left side: Num & Name */}
                      <div className="flex items-center gap-4 z-10">
                        <span className="font-mono text-[9px] tracking-widest text-white/30 transition-colors">
                          {protocol.num}
                        </span>
                        <span className={`font-sans text-xs tracking-widest uppercase text-white/70 transition-colors ${protocol.color}`}>
                          {protocol.name}
                        </span>
                      </div>
                      
                      {/* Right side: Animated Arrow */}
                      <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10 text-white/50 text-xs">
                        &rarr;
                      </span>

                      {/* Subtle hover background border pulse */}
                      <div className={`absolute inset-0 border border-transparent rounded-2xl transition-colors ${protocol.border}`} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button onClick={onBack} className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] px-4 md:px-6 py-2 border border-white/50 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/20 transition-all mix-blend-difference text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        &larr; Return to Hub
      </button>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, isMobile ? 12 : 8], fov: 60 }}>
          <SceneLights scrollProgress={sp} />
          <MayaMatrixScene scrollProgress={sp} isMobile={isMobile} />
          <MayaEffects scrollProgress={sp} isMobile={isMobile} />
          <EndSceneEffect scrollProgress={sp} isMobile={isMobile} />
        </Canvas>
      </div>

      <motion.div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.03) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-sm md:text-xl font-mono tracking-[0.4em] text-[#00ffff] mb-4">PROTOCOL: MAYA</h1>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-tight text-white drop-shadow-2xl">The Digital Cage.</h2>
        </motion.div>

        <motion.div style={{ opacity: s2, y: driftDown(0.02, 0.05) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white/80 max-w-3xl leading-relaxed">You don't even realize you are in it.</p>
        </motion.div>

        <motion.div style={{ opacity: s3, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-4xl md:text-7xl font-bold uppercase tracking-widest text-white leading-tight">7:00 AM.<br/>The alarm rings.</h3>
        </motion.div>

        <motion.div style={{ opacity: s4, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-[#ff00ff] max-w-2xl leading-relaxed">Before your feet even touch the physical floor...</p>
        </motion.div>

        <motion.div style={{ opacity: s5, y: driftUp(0.08, 0.11) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white bg-black/40 px-8 py-4 border border-[#00ffff]/30 backdrop-blur-md">The glowing rectangle is in your hand.</h1>
        </motion.div>

        <motion.div style={{ opacity: s6, y: driftDown(0.10, 0.13) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center text-center md:text-left px-6 md:px-24">
          <ImagePlaceholder title="MORNING_TRAP" width="w-[80vw] md:w-[350px]" height="h-[200px]" className="mb-8 md:mb-0 md:mr-12" />
          <p className="text-xl md:text-3xl font-light tracking-[0.2em] text-white/60 uppercase max-w-xl">Thirty minutes of cheap dopamine before the day even begins.</p>
        </motion.div>

        <motion.div style={{ opacity: s7, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-widest text-[#00ffff]">PLUGGED IN.</h2>
        </motion.div>

        <motion.div style={{ opacity: s8, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <div className="bg-[#110022]/80 border-r-4 border-[#ff00ff] p-8 max-w-2xl backdrop-blur-md">
            <p className="text-xl md:text-3xl font-serif italic text-white/90 leading-relaxed">You open the feed. It is a torrential downpour of carefully curated psychological triggers.</p>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s9, y: driftUp(0.16, 0.19) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-white/50">Men acting soft and weak.</h2>
        </motion.div>

        <motion.div style={{ opacity: s10, y: driftDown(0.18, 0.21) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-[#ff00ff] drop-shadow-[0_0_30px_rgba(255,0,255,0.6)]">Hyper-sexualized bait.</h2>
        </motion.div>

        <motion.div style={{ opacity: s11, y: driftUp(0.20, 0.23) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-white/50">Manufactured political rage.</h2>
        </motion.div>

        <motion.div style={{ opacity: s12, y: driftDown(0.22, 0.25) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-[#00ffff] bg-black/80 px-10 py-6 border border-[#00ffff]/20 shadow-2xl leading-tight max-w-[90vw] break-words">
            MEDIOCRITY NORMALIZED.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s13, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-5xl md:text-7xl font-serif italic text-white">Do you think this is random?</h2>
        </motion.div>

        <motion.div style={{ opacity: s14, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h1 className="text-[clamp(3rem,7vw,7rem)] font-black uppercase tracking-[0.2em] text-[#ff00ff] leading-none max-w-[80vw]">
            IT IS ENGINEERED.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s15, y: driftUp(0.28, 0.31) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
           <div className="bg-[#050f1a]/90 border border-[#00ffff]/30 p-10 max-w-4xl rounded-2xl shadow-xl">
            <p className="text-3xl md:text-5xl font-serif italic text-white leading-relaxed">
              They want you numb. They want you scrolling.
            </p>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s16, y: driftDown(0.30, 0.33) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-widest text-[#ff0044] mb-4">THE SEDUCTION.</h2>
        </motion.div>

        <motion.div style={{ opacity: s17, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-light tracking-widest text-white/80 uppercase max-w-2xl border-l-4 border-[#ff0044] pl-6">
            The 3-second hooks designed to hijack your primal instincts.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s18, x: offsetRight }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-end px-6 md:px-24 text-right">
          <ImagePlaceholder title="FAKE_PERFECTION" width="w-[80vw] md:w-[400px]" height="h-[250px]" className="mb-8 md:mb-0 md:mr-12" />
          <div className="bg-black/60 p-8 rounded-xl border border-[#ff00ff]/30 max-w-lg z-10">
            <p className="text-xl md:text-4xl font-serif italic text-white/90">
              Flooding your screen with surgically altered, fake perfection.
            </p>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s19, y: driftUp(0.36, 0.39) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase text-white/70">Keeping you paralyzed.</h2>
        </motion.div>

        <motion.div style={{ opacity: s20, y: driftDown(0.38, 0.41) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-4xl leading-relaxed">
            Drooling over pixels instead of pursuing real life, real women, and real connection.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s21, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-widest text-[#ff00ff]">NORMALIZING<br/>THE UNNATURAL.</h2>
        </motion.div>

        <motion.div style={{ opacity: s22, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-light tracking-[0.2em] text-white/60 uppercase max-w-2xl bg-black/50 p-6 rounded-xl">
            You are being actively rewired to crave absolute nothingness.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s23, y: driftUp(0.44, 0.47) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-5xl md:text-9xl font-black uppercase tracking-[0.3em] text-[#ff0044] mb-6">THE SYMPTOM.</h1>
        </motion.div>

        <motion.div style={{ opacity: s24, y: driftDown(0.46, 0.49) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-5xl font-serif italic text-white/80 bg-black/70 px-8 py-4 border border-[#ff0044]/30 backdrop-blur-sm">
            Constant digital arousal. Zero actual vitality.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s25, x: offsetLeft }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-start px-6 md:px-24 text-left">
          <div className="max-w-2xl z-10 md:mr-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#00ffff] mb-4">Your brain physically shrinks.</h2>
          </div>
          <ImagePlaceholder title="NEURAL_DECAY" width="w-[80vw] md:w-[350px]" height="h-[200px]" className="mix-blend-screen" />
        </motion.div>

        <motion.div style={{ opacity: s26, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-[#ff0044] drop-shadow-lg">Low Testosterone.</h2>
        </motion.div>

        <motion.div style={{ opacity: s27, y: driftUp(0.52, 0.55) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-[#00ffff]">Heavy Brain Fog.</h2>
        </motion.div>

        <motion.div style={{ opacity: s28, y: driftDown(0.54, 0.57) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-4xl md:text-7xl font-serif italic text-white/60">Feeling completely stuck.</h2>
        </motion.div>

        <motion.div style={{ opacity: s29, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-3xl md:text-6xl font-serif italic text-white max-w-4xl leading-relaxed">
            You feel stuck because your brain thinks you've already conquered the world...
          </p>
        </motion.div>

        <motion.div style={{ opacity: s30, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-3xl md:text-6xl font-light tracking-[0.1em] text-white/80 uppercase max-w-3xl">
            ...when all you did was stare at a <span className="text-[#00ffff] font-black">glowing rectangle.</span>
          </p>
        </motion.div>

        <motion.div style={{ opacity: s31, y: driftUp(0.60, 0.63) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-3xl md:text-5xl font-light tracking-widest text-white uppercase max-w-4xl bg-black/60 p-8 rounded-xl border border-white/10">
            A soft, distracted man does not build his own empire.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s32, y: driftDown(0.62, 0.65) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(3rem,9vw,9rem)] font-black uppercase tracking-[0.1em] text-[#00ffff] leading-tight max-w-[90vw] break-words">HE CONSUMES THEIRS.</h2>
        </motion.div>

        <motion.div style={{ opacity: s33, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-[clamp(3rem,7vw,7rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] leading-tight max-w-[90vw] break-words">
            A FOCUSED MAN IS <span className="text-[#ff00ff]">DANGEROUS.</span>
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s34, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h1 className="text-[clamp(4rem,9vw,9rem)] font-black uppercase tracking-[0.2em] text-[#00ffff] drop-shadow-[0_0_40px_rgba(0,255,255,0.4)] leading-tight max-w-[90vw] break-words">THE PRODUCT.</h1>
        </motion.div>

        <motion.div style={{ opacity: s35, y: driftUp(0.68, 0.71) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center px-6 md:px-24 text-center md:text-left">
          <ImagePlaceholder title="LIVESTOCK_FARM" width="w-[80vw] md:w-[400px]" height="h-[250px]" className="mb-8 md:mb-0 md:mr-12 mix-blend-screen" />
          <div className="flex flex-col gap-6 text-3xl md:text-5xl font-black uppercase text-white z-10 bg-black/60 p-8 border border-white/20">
            <span className="font-serif italic text-white/80">You are just a number.</span>
            <span className="text-[#ff00ff]">A disposable unit of attention.</span>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s36, y: driftDown(0.70, 0.73) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-widest text-white/80 max-w-5xl leading-tight">
            They are farming your generational fire.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s37, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#00ffff]">TO POWER THEIR ALGORITHMS.</h2>
        </motion.div>

        <motion.div style={{ opacity: s38, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h1 className="text-5xl md:text-9xl font-black uppercase tracking-[0.3em] text-[#ff0044] mb-4">THE CRASH.</h1>
        </motion.div>

        <motion.div style={{ opacity: s39, y: driftUp(0.76, 0.79) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-3xl md:text-6xl font-serif italic text-white max-w-5xl leading-relaxed bg-[#1a0005]/80 p-8 rounded-xl border border-[#ff0044]/30">
            If you cannot stand strong, anybody will mess with you.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s40, y: driftDown(0.78, 0.81) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-3xl md:text-6xl font-serif italic text-white/70 max-w-5xl leading-relaxed">
            Or harm your family while you stand by and do <span className="text-[#ff0044] font-black not-italic uppercase tracking-widest">absolutely nothing.</span>
          </p>
        </motion.div>

        <motion.div style={{ opacity: s41, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-white border-l-8 border-[#ff0044] pl-6 md:pl-8 leading-tight max-w-[90vw] break-words">
            WE REJECT THAT LIFE OF DISGRACE.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s42, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <h1 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-[0.15em] text-[#00ffff] drop-shadow-[0_0_50px_rgba(0,255,255,0.5)] leading-tight max-w-[90vw] break-words">TRUE REBELLION.</h1>
        </motion.div>

        <motion.div style={{ opacity: s43, y: driftUp(0.84, 0.87) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase text-white max-w-4xl bg-black/60 p-8 border border-[#00ffff]/30 shadow-2xl">
            Keep your data local. <span className="font-bold text-[#00ffff]">Take your mind back.</span>
          </p>
        </motion.div>

        {/* The Slow Rise WAKE UP */}
        <motion.div style={{ opacity: s44, y: s44Rise }} className="absolute inset-0 flex items-center justify-center w-full overflow-hidden">
          <h1 className="text-[clamp(4rem,12vw,14rem)] font-black tracking-[0.2em] uppercase text-white drop-shadow-[0_0_80px_rgba(255,255,255,1)] mix-blend-difference whitespace-nowrap text-center">
            WAKE UP.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s45, y: driftUp(0.88, 0.91) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <p className="text-[clamp(3rem,7vw,7rem)] font-black tracking-widest text-[#FBFF00] uppercase bg-black/40 px-12 py-6 border border-[#ff00ff]/30 backdrop-blur-sm">
            SHATTER THE GLASS.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s46, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <div className="bg-black/60 border-l-4 border-white p-8 md:p-12 backdrop-blur-md">
            <h3 className="text-2xl md:text-3xl font-mono tracking-[0.4em] text-white/50 mb-6">THE RECLAMATION</h3>
            <h2 className="text-5xl md:text-7xl font-light uppercase tracking-widest text-white">Turn off the noise.</h2>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s47, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white/80 max-w-3xl bg-black/50 p-8 border border-white/10 rounded-xl">
            Delete the parasite apps. Silence the notifications. Don't let vibrating plastic command your focus.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s48, y: driftUp(0.94, 0.97) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center px-6 md:px-24 text-center md:text-left">
          <ImagePlaceholder title="THE_CRUCIBLE" width="w-[80vw] md:w-[400px]" height="h-[250px]" className="mb-8 md:mb-0 md:mr-12 mix-blend-lighten" />
          <div className="max-w-3xl z-10 bg-black/60 p-10 rounded-3xl border border-white/20">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">RECLAIM YOUR BOREDOM.</h1>
            <p className="text-2xl md:text-4xl font-light tracking-widest text-white/80 leading-relaxed">
              Boredom is not the enemy. It is the crucible where empires are envisioned.
            </p>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s49, y: driftDown(0.96, 0.99) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-5xl md:text-8xl font-serif italic text-white mb-8">The silence will be deafening at first.</h2>
          <h2 className="text-4xl md:text-6xl font-black tracking-widest uppercase text-[#00ffff] drop-shadow-md">But you will finally hear your own voice.</h2>
        </motion.div>

        <motion.div style={{ opacity: s50 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-auto">
          <div className="flex flex-col items-center gap-10 bg-black/80 p-12 md:p-20 rounded-[3rem] border border-white/30 backdrop-blur-xl shadow-[0_20px_60px_rgba(255,255,255,0.2)]">
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-[0.4em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">UNPLUG.</h1>
            <div className="w-[2px] h-32 bg-gradient-to-b from-white to-transparent" />
            <button 
              className="px-14 py-6 bg-white/10 border-2 border-white rounded-full text-white font-black tracking-[0.5em] uppercase hover:bg-white hover:text-black transition-all shadow-[0_0_50px_rgba(255,255,255,0.4)] cursor-pointer text-base md:text-xl"
              onClick={() => {
                if (onAwaken) onAwaken(); 
              }}
            >
              Step into Reality
            </button>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}