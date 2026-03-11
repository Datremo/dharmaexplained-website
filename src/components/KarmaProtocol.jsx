import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Icosahedron, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import CinematicCursor from './CinematicCursor';
import { setGlobalMusic } from './GlobalAudio'; // At the top

// --------------------------------------------------------
// 🔨 THE 3D ENGINE: ASSEMBLING THE EMPIRE
// --------------------------------------------------------
const ForgeScene = ({ scrollProgress, isMobile }) => {
  const coreRef = useRef();
  const shardsRef = useRef();
  const shardCount = isMobile ? 30 : 60;

  // Generate scattered shards
  const shardsData = useMemo(() => {
    return Array.from({ length: shardCount }).map(() => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI,
      targetX: (Math.random() - 0.5) * 2,
      targetY: (Math.random() - 0.5) * 2,
      targetZ: (Math.random() - 0.5) * 2,
    }));
  }, [shardCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    // 🪨 Phase 1: Scattered Shards coming together
    if (shardsRef.current) {
      shardsData.forEach((data, i) => {
        // At scroll 0, they are far away. At scroll 0.5, they assemble tightly around the core.
        const assemblyProgress = Math.min(Math.max(scroll * 2, 0), 1); 
        
        const currentX = THREE.MathUtils.lerp(data.x, data.targetX, assemblyProgress);
        const currentY = THREE.MathUtils.lerp(data.y, data.targetY, assemblyProgress);
        const currentZ = THREE.MathUtils.lerp(data.z, data.targetZ, assemblyProgress);

        dummy.position.set(currentX, currentY, currentZ);
        dummy.rotation.set(data.rx += 0.01, data.ry += 0.01, 0);
        
        // They turn into pure gold as they assemble
        const scale = 1 - (assemblyProgress * 0.5);
        dummy.scale.set(scale, scale, scale);
        
        dummy.updateMatrix();
        shardsRef.current.setMatrixAt(i, dummy.matrix);
      });
      shardsRef.current.instanceMatrix.needsUpdate = true;
      shardsRef.current.rotation.y += delta * 0.1;
    }

    // 👑 Phase 2: The Golden Core (Empire) reveals itself
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.2;
      coreRef.current.rotation.y += delta * 0.3;

      let targetScale = 0.01;
      let targetOpacity = 0;

      if (scroll > 0.4) {
        targetScale = isMobile ? 1.5 : 2.5;
        targetOpacity = 1;
      }

      coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);
      coreRef.current.material.opacity = THREE.MathUtils.lerp(coreRef.current.material.opacity, targetOpacity, delta * 2);
    }
  });

  return (
    <group position={[isMobile ? 1 : 0, 0, -5]}>
      {/* The Shattered Pieces of your life assembling */}
      <instancedMesh ref={shardsRef} args={[null, null, shardCount]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </instancedMesh>

      {/* The Assembled Empire */}
      <Icosahedron ref={coreRef} args={[1, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#b45309" emissiveIntensity={0.5} wireframe={false} metalness={1} roughness={0.1} transparent opacity={0} />
      </Icosahedron>

      <Sparkles count={isMobile ? 40 : 100} scale={10} size={isMobile ? 2 : 4} speed={0.4} color="#fbbf24" opacity={0.6} />
    </group>
  );
};

// --------------------------------------------------------
// 💡 DYNAMIC LIGHTING
// --------------------------------------------------------
const SceneLights = ({ scrollProgress }) => {
  const ambientRef = useRef();
  const pointRef = useRef();

  useFrame(() => {
    const p = scrollProgress.get();
    // Starts in absolute darkness/grey, shifts to heavy Gold
    let color = new THREE.Color("#111111"); 
    let intensity = 1.0;

    if (p > 0.3) {
      color = new THREE.Color("#fbbf24"); 
      intensity = 3.0;
    }

    if (ambientRef.current) ambientRef.current.color.lerp(color, 0.1);
    if (pointRef.current) {
      pointRef.current.color.lerp(color, 0.1);
      pointRef.current.intensity = THREE.MathUtils.lerp(pointRef.current.intensity, intensity, 0.1);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} />
      <pointLight ref={pointRef} position={[2, 5, 5]} distance={50} />
      <pointLight color="#ffffff" position={[-5, -5, -5]} distance={30} intensity={0.5} />
    </>
  );
};

// --------------------------------------------------------
// ⚔️ MAIN EDITORIAL COMPONENT
// --------------------------------------------------------
export default function KarmaProtocol({ onEnterHub }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { 
    window.scrollTo(0, 0); 
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  

 useEffect(() => { 
    window.scrollTo(0, 0);
    setGlobalMusic('karma'); 
    // Notice how we DO NOT return a cleanup function for the music here!
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

  const bgColor = useTransform(sp, 
    [0.0, 0.3, 0.6, 0.9, 1.0], 
    ["#000000", "#0a0600", "#1a0f00", "#050200", "#000000"]
  );

  // 🎬 28-SCENE FORGE ENGINE
  const o = (start, peak1, peak2, end) => useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  
  const s1  = o(0.00, 0.01, 0.03, 0.04); 
  const s2  = o(0.04, 0.05, 0.07, 0.08); 
  const s3  = o(0.08, 0.09, 0.11, 0.12); 
  const s4  = o(0.12, 0.13, 0.15, 0.16); 
  const s5  = o(0.16, 0.17, 0.19, 0.20); 
  const s6  = o(0.20, 0.21, 0.23, 0.24); 
  const s7  = o(0.24, 0.25, 0.27, 0.28); 
  const s8  = o(0.28, 0.29, 0.31, 0.32); 
  const s9  = o(0.32, 0.33, 0.35, 0.36); 
  const s10 = o(0.36, 0.37, 0.39, 0.40); 
  const s11 = o(0.40, 0.41, 0.43, 0.44); 
  const s12 = o(0.44, 0.45, 0.47, 0.48); 
  const s13 = o(0.48, 0.49, 0.51, 0.52); 
  const s14 = o(0.52, 0.53, 0.55, 0.56); 
  const s15 = o(0.56, 0.57, 0.59, 0.60); 
  const s16 = o(0.60, 0.61, 0.63, 0.64); 
  const s17 = o(0.64, 0.65, 0.67, 0.68); 
  const s18 = o(0.68, 0.69, 0.71, 0.72); 
  const s19 = o(0.72, 0.73, 0.75, 0.76); 
  const s20 = o(0.76, 0.77, 0.79, 0.80); 
  const s21 = o(0.80, 0.81, 0.83, 0.84); 
  const s22 = o(0.84, 0.85, 0.87, 0.88); 
  const s23 = o(0.88, 0.89, 0.91, 0.92); 
  const s24 = useTransform(sp, [0.92, 0.94, 1, 1], [0, 1, 1, 1]); 

  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const offsetLeft = isMobile ? "2vw" : "15vw";
  const offsetRight = isMobile ? "-2vw" : "-15vw";

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[2400vh] font-sans text-white">
      <div className="hidden md:block"><CinematicCursor /></div>

      {/* 3D CANVAS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, isMobile ? 12 : 8], fov: 60 }}>
          <SceneLights scrollProgress={sp} />
          <ForgeScene scrollProgress={sp} isMobile={isMobile} />
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.5} intensity={1.5} mipmapBlur={false} />
            <Vignette offset={0.4} darkness={0.7} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* EDITORIAL HTML LAYER */}
      <motion.div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* SCENE 1: The Hook */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.04) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-sm md:text-xl font-mono tracking-[0.4em] text-white/50 mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">PROTOCOL: KARMA</h1>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-tight text-white drop-shadow-2xl">
            The Architect.
          </h2>
        </motion.div>

        {/* SCENE 2: The Silence */}
        <motion.div style={{ opacity: s2, y: driftDown(0.04, 0.08) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white/80 max-w-3xl leading-relaxed">
            The screen is black. The room is quiet.<br/><br/>
            <span className="text-white not-italic font-bold tracking-widest uppercase text-xl md:text-3xl">The cage is gone. Now what?</span>
          </p>
        </motion.div>

        {/* SCENE 3: Reclaimed Time */}
        <motion.div style={{ opacity: s3, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-3xl md:text-6xl font-light uppercase tracking-widest text-[#fbbf24] leading-tight">
            You just reclaimed 6 hours a day.
          </h3>
        </motion.div>

        {/* SCENE 4: The Math */}
        <motion.div style={{ opacity: s4, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-4xl font-serif italic text-white max-w-2xl leading-relaxed drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            That is 2,190 hours a year. Enough time to master any syntax, build any physique, and conquer any market.
          </p>
        </motion.div>

        {/* SCENE 5: The Crucible */}
        <motion.div style={{ opacity: s5, y: driftUp(0.16, 0.20) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-[12vw] font-black uppercase tracking-tighter leading-none text-white/5 absolute top-1/2 -translate-y-1/2 whitespace-nowrap">NO EXCUSES</h1>
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-widest text-[#fbbf24] bg-[#1a0f00]/60 px-8 py-4 border border-[#fbbf24]/30 backdrop-blur-md">
            The Grind Does Not Care.
          </h2>
        </motion.div>

        {/* SCENE 6: The Rotating Shift */}
        <motion.div style={{ opacity: s6, y: driftDown(0.20, 0.24) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-lg md:text-3xl font-light tracking-[0.1em] text-white/90 max-w-4xl leading-relaxed">
            Even when the rotating shift exhausts your body, the mind remains an unbreakable fortress. The erratic hours are not a punishment. <br/><br/>
            <span className="font-bold text-[#fbbf24] uppercase tracking-widest">They are the crucible designed to forge your resolve.</span>
          </p>
        </motion.div>

        {/* SCENE 7: Action */}
        <motion.div style={{ opacity: s7, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-4xl md:text-7xl font-bold uppercase tracking-widest text-white">
            KARMA YOGA.
          </h2>
        </motion.div>

        {/* SCENE 8: Without Attachment */}
        <motion.div style={{ opacity: s8, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <div className="bg-[#1a0f00]/80 border-r-4 border-[#fbbf24] p-8 max-w-2xl backdrop-blur-md">
            <p className="text-lg md:text-2xl font-serif italic text-white/90 leading-relaxed">
              Action without attachment to the fruit. You do not code for the applause. You do not lift for the validation. You do it because it is your absolute duty to become lethal.
            </p>
          </div>
        </motion.div>

        {/* SCENE 9: The Assembly */}
        <motion.div style={{ opacity: s9, y: driftUp(0.32, 0.36) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest text-[#fbbf24] drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">
            Assemble the Empire.
          </h2>
        </motion.div>

        {/* SCENE 10: The Python & React */}
        <motion.div style={{ opacity: s10, y: driftDown(0.36, 0.40) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
           <div className="bg-black/60 border border-white/20 p-8 md:p-12 max-w-3xl rounded-2xl shadow-2xl backdrop-blur-md">
            <p className="text-xl md:text-3xl font-serif italic text-white leading-relaxed">
              Every Python script you write, every React component you mount, every heavy set you survive...
              <br/><br/>
              <span className="text-[#fbbf24] font-bold not-italic tracking-widest uppercase text-lg md:text-2xl">Is a brick in your real-world base.</span>
            </p>
          </div>
        </motion.div>

        {/* SCENE 11 & 12: No more digital bases */}
        <motion.div style={{ opacity: s11, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white">
            STOP UPGRADING <br/><span className="text-white/40">DIGITAL WALLS.</span>
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s12, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light tracking-[0.1em] text-white/80 max-w-xl">
            Take that strategic obsession and apply it to the only base that matters: <span className="text-[#fbbf24] font-bold">Your life.</span>
          </p>
        </motion.div>

        {/* SCENE 13 & 14: The Focus */}
        <motion.div style={{ opacity: s13, y: driftUp(0.48, 0.52) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-9xl font-black uppercase tracking-tighter text-[#fbbf24] drop-shadow-[0_0_60px_rgba(251,191,36,0.8)]">
            EXECUTE.
          </h1>
        </motion.div>

        <motion.div style={{ opacity: s14, y: driftDown(0.52, 0.56) }} className="absolute inset-0 flex items-center justify-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white">
            Head down. Hoodie on. Protect the bloodline.
          </p>
        </motion.div>

        {/* SCENE 15 to 22: The Ascetic Build */}
        <motion.div style={{ opacity: s15, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-[0.2em] text-white/60">
            You are the Architect.
          </h2>
        </motion.div>
        
        <motion.div style={{ opacity: s16, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
           <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-[0.2em] text-[#fbbf24]">
            Build the product.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s17, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-[0.2em] text-white">
            Build the physique.
          </h2>
        </motion.div>

        <motion.div style={{ opacity: s18, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
           <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-[0.2em] text-[#fbbf24]">
            Build the legacy.
          </h2>
        </motion.div>

        {/* SCENE 21: The Coronation */}
        <motion.div style={{ opacity: s21, y: driftUp(0.80, 0.84) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
          <div className="bg-[#1a0f00]/60 backdrop-blur-xl px-12 py-8 rounded-[3rem] border border-[#fbbf24]/40 shadow-[0_20px_80px_rgba(251,191,36,0.2)]">
            <h2 className="text-4xl md:text-7xl font-serif italic text-white drop-shadow-md">
              The universe rewards action.
            </h2>
          </div>
        </motion.div>

        {/* SCENE 22: The Truth */}
        <motion.div style={{ opacity: s22, y: driftDown(0.84, 0.88) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-24">
           <p className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase text-[#fbbf24] leading-tight">
             It is time to meet your <br/><span className="font-black text-white">highest self.</span>
           </p>
        </motion.div>

        {/* SCENE 23: Return to Hub Prep */}
        <motion.div style={{ opacity: s23, y: driftUp(0.88, 0.92) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-2xl md:text-4xl font-black tracking-[0.5em] uppercase text-[#fbbf24] drop-shadow-[0_5px_10px_rgba(251,191,36,0.4)]">
            THE HUB AWAITS.
          </h1>
          <div className="w-[1px] h-24 bg-gradient-to-b from-[#fbbf24] to-transparent mt-8" />
        </motion.div>

        {/* SCENE 24: Enter the Cosmos (Finale) */}
        <motion.div style={{ opacity: s24 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-auto">
          <div className="flex flex-col items-center gap-8">
            <button 
              className="px-14 py-6 bg-[#fbbf24]/10 border-2 border-[#fbbf24] rounded-full text-[#fbbf24] font-black tracking-[0.4em] uppercase text-sm md:text-lg hover:bg-[#fbbf24] hover:text-black transition-all shadow-[0_0_50px_rgba(251,191,36,0.6)] cursor-pointer"
              onClick={() => {
                onEnterHub();
              }}
            >
              Enter the Cosmos
            </button>
            <p className="text-sm font-mono text-white/40 tracking-widest uppercase">The training wheels are off.</p>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}