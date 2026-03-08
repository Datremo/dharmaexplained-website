import React, { useRef, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Box, Sphere, Cylinder, Torus } from '@react-three/drei';

// --------------------------------------------------------
// 🖼️ HELPER: CINEMATIC IMAGE PLACEHOLDER (Abyss Edition)
// --------------------------------------------------------
const ImagePlaceholder = ({ title, width, height, className = "" }) => (
  <div className={`relative overflow-hidden bg-[#020617]/60 border border-[#00ccff]/20 flex items-center justify-center text-[#00ccff]/40 font-mono text-[10px] uppercase tracking-[0.3em] backdrop-blur-md ${width} ${height} ${className} shadow-[0_0_40px_rgba(0,204,255,0.05)] group`}>
    <div className="absolute inset-0 bg-gradient-to-b from-[#00ccff]/5 to-transparent opacity-50" />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay" />
    <span className="relative z-10 drop-shadow-md">[ {title} ]</span>
  </div>
);

// --------------------------------------------------------
// 🌊 PART 1: THE 3D ABYSS ENGINE
// --------------------------------------------------------
const Matsya3DScene = ({ scrollProgress }) => {
  const rainRef = useRef();
  const tinyFishRef = useRef();
  const arkRef = useRef();
  const hornRef = useRef();
  const cameraGroupRef = useRef(); 

  const { particles } = useMemo(() => {
    const pos = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000 * 3; i++) { 
      pos[i] = (Math.random() - 0.5) * 30; 
    }
    return { particles: pos };
  }, []);

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    // 🎥 SINK THE CAMERA INTO THE ABYSS
    // Moving the group UP (positive Y) makes the fixed camera feel like it's sinking DOWN.
    if (cameraGroupRef.current) {
      let targetY = 0;
      if (scroll < 0.5) targetY = THREE.MathUtils.lerp(0, 20, scroll * 2);
      else if (scroll < 0.9) targetY = THREE.MathUtils.lerp(20, 35, (scroll - 0.5) * 2.5);
      else targetY = THREE.MathUtils.lerp(35, 10, (scroll - 0.9) * 10);
      
      cameraGroupRef.current.position.y = THREE.MathUtils.lerp(cameraGroupRef.current.position.y, targetY, delta * 2);
    }

    // SCENE 1 & 2: Rain at the surface
    if (rainRef.current) {
      rainRef.current.position.y -= delta * 5; 
      if (rainRef.current.position.y < -15) rainRef.current.position.y = 15; 
      rainRef.current.material.opacity = THREE.MathUtils.lerp(rainRef.current.material.opacity, scroll < 0.2 ? 0.6 : 0, delta * 2);
    }

    // SCENE 3, 4, 5, 6: The Tiny Fish growing
    if (tinyFishRef.current) {
      const active = scroll > 0.13 && scroll < 0.45 ? 1 : 0;
      tinyFishRef.current.material.opacity = THREE.MathUtils.lerp(tinyFishRef.current.material.opacity, active, delta * 5);
      
      tinyFishRef.current.position.x = Math.sin(state.clock.elapsedTime * 4) * 0.5;
      tinyFishRef.current.position.z = Math.cos(state.clock.elapsedTime * 4) * 0.5 - 4;
      
      const targetScale = scroll > 0.25 ? 1 + (scroll - 0.25) * 60 : 0.2;
      tinyFishRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);
    }

    // SCENE 7, 8, 9, 10: The Ark tossing in the abyss
    if (arkRef.current) {
      const active = scroll > 0.48 && scroll < 0.95 ? 1 : 0;
      arkRef.current.material.opacity = THREE.MathUtils.lerp(arkRef.current.material.opacity, active, delta * 3);
      
      const tossSpeed = scroll < 0.8 ? 5 : 1;
      const tossAmount = scroll < 0.8 ? 0.5 : 0.1;
      arkRef.current.rotation.z = Math.sin(state.clock.elapsedTime * tossSpeed) * tossAmount;
      arkRef.current.rotation.x = Math.cos(state.clock.elapsedTime * tossSpeed * 0.8) * tossAmount;
      arkRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2 - 20; 
    }

    // SCENE 11, 12, 13, 14: The Colossal Horn
    if (hornRef.current) {
      const active = scroll > 0.65 ? 1 : 0;
      hornRef.current.material.opacity = THREE.MathUtils.lerp(hornRef.current.material.opacity, active, delta * 2);
      
      hornRef.current.position.y = THREE.MathUtils.lerp(hornRef.current.position.y, scroll > 0.7 ? -22 : -35, delta);
      hornRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={cameraGroupRef}>
      <points ref={rainRef} position={[0, 10, -5]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={2000} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#00ccff" transparent opacity={0} blending={THREE.AdditiveBlending} />
      </points>
      <Sphere ref={tinyFishRef} args={[0.5, 32, 32]} position={[0, -1, -5]}>
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} wireframe transparent opacity={0} />
      </Sphere>
      <Box ref={arkRef} args={[2, 0.5, 1]} position={[0, -20, -4]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} transparent opacity={0} />
      </Box>
      <Cylinder ref={hornRef} args={[0, 4, 15, 32]} position={[0, -35, -10]} rotation={[-0.2, 0, 0]}>
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.5} wireframe transparent opacity={0} />
      </Cylinder>
      <pointLight position={[0, -25, -8]} color="#00ccff" intensity={2} distance={20} />
    </group>
  );
};

// --------------------------------------------------------
// 🎬 THE MAIN EDITORIAL SCROLL COMPONENT
// --------------------------------------------------------
export default function MatsyaLore({ onBack }) {
  const containerRef = useRef(null);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 40, damping: 20, mass: 1 });

  // 🌊 THE ABYSSAL COLOR SHIFT
  const bgColor = useTransform(sp, 
    [0.0, 0.4, 0.5, 0.8, 0.9, 1.0], 
    ["#020617", "#020617", "#000000", "#000000", "#001122", "#001122"]
  );
  const textColor = useTransform(sp, [0, 1], ["#ffffff", "#ffffff"]);
  const shake = useTransform(sp, (p) => (p > 0.48 && p < 0.55) ? Math.sin(p * 500) * 10 : 0); 

  // 🧮 14 STRICT NON-OVERLAPPING OPACITY WINDOWS
  const o = (start, peak1, peak2, end) => useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  const s1  = o(0.00, 0.01, 0.05, 0.07); 
  const s2  = o(0.07, 0.09, 0.12, 0.14); 
  const s3  = o(0.14, 0.16, 0.19, 0.21); 
  const s4  = o(0.21, 0.23, 0.26, 0.28); 
  const s5  = o(0.28, 0.30, 0.33, 0.35); 
  const s6  = o(0.35, 0.37, 0.40, 0.42); 
  const s7  = o(0.42, 0.44, 0.47, 0.49); 
  const s8  = o(0.49, 0.51, 0.54, 0.56); 
  const s9  = o(0.56, 0.58, 0.61, 0.63); 
  const s10 = o(0.63, 0.65, 0.68, 0.70); 
  const s11 = o(0.70, 0.72, 0.75, 0.77); 
  const s12 = o(0.77, 0.79, 0.82, 0.84); 
  const s13 = o(0.84, 0.86, 0.89, 0.91); 
  const s14 = useTransform(sp, [0.91, 0.93, 0.99, 1], [0, 1, 1, 1]); 

  // 🦅 PARALLAX DRIFT MATH
  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const driftLeft = (start, end) => useTransform(sp, [start, end], ["5vw", "-5vw"]);
  const driftRight = (start, end) => useTransform(sp, [start, end], ["-5vw", "5vw"]);

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[1400vh] font-sans">
      
      <button onClick={onBack} className="fixed top-6 left-6 z-[100] px-6 py-2 border border-[#00ccff]/30 rounded-full text-xs tracking-widest uppercase hover:bg-[#00ccff]/10 transition-all mix-blend-difference text-white shadow-[0_0_20px_rgba(0,204,255,0.2)]">
        &larr; Exit Domain
      </button>

      {/* 3D ABYSS BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.2} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} intensity={2.0} mipmapBlur />
            <Vignette eskil={false} offset={0.5} darkness={0.8} /> 
            <Noise opacity={0.12} />
          </EffectComposer>
          <Matsya3DScene scrollProgress={sp} />
        </Canvas>
      </div>

      {/* EDITORIAL HTML LAYER */}
      <motion.div style={{ x: shake, color: textColor }} className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* SCENE 1 */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.07) }} className="absolute inset-0 flex items-center justify-center text-center">
          <h1 className="text-3xl md:text-5xl font-light tracking-[0.4em] uppercase text-[#00ccff]/80">
            Time is not a line. <span className="font-serif italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"><br/><br/>It is a circle.</span>
          </h1>
        </motion.div>

        {/* SCENE 2 */}
        <motion.div style={{ opacity: s2, y: driftDown(0.07, 0.14) }} className="absolute inset-0 flex items-center px-10 md:px-24">
          <div className="w-1/2 flex flex-col items-start text-left z-10">
            <h1 className="text-xl md:text-2xl font-mono tracking-[0.4em] text-[#00ccff] mb-4">/ THE PREVIOUS AGE /</h1>
            <h2 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-tight">
              The waters began<br/>to rise.
            </h2>
            <p className="text-lg md:text-xl font-serif italic tracking-widest mt-8 max-w-md border-l border-[#00ccff]/30 pl-6 opacity-80">
              King Manu stood in the river, praying for humanity.
            </p>
          </div>
          <ImagePlaceholder title="Hands Offering Water" width="w-1/2 max-w-lg" height="h-[50vh]" className="absolute right-10 md:right-24 rounded-[3rem] rounded-bl-none" />
        </motion.div>

        {/* SCENE 3 */}
        <motion.div style={{ opacity: s3, x: driftLeft(0.14, 0.21) }} className="absolute inset-0 flex items-center justify-end px-10 md:px-24">
          <ImagePlaceholder title="Tiny Glowing Fish" width="w-64" height="h-64" className="absolute left-32 rounded-full border-[#00ccff] shadow-[0_0_50px_rgba(0,204,255,0.2)]" />
          <div className="max-w-xl text-right z-10">
            <h1 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-tight mb-6">
              A tiny fish fell<br/>into his palms.
            </h1>
            <p className="text-3xl font-serif text-[#00ccff] italic drop-shadow-md">&quot;Save me,&quot; it whispered.</p>
          </div>
        </motion.div>

        {/* SCENE 4 */}
        <motion.div style={{ opacity: s4, y: driftUp(0.21, 0.28) }} className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-[12vw] font-black uppercase tracking-tighter leading-none text-white/5 absolute top-1/2 -translate-y-1/2 whitespace-nowrap select-none">
            GROWTH GROWTH
          </h1>
          <div className="z-10 flex flex-col gap-8 text-center px-10">
            <h2 className="text-4xl md:text-6xl font-light tracking-widest uppercase">
              He placed it in a jar. <span className="font-bold">It outgrew the jar.</span>
            </h2>
            <h2 className="text-4xl md:text-6xl font-light tracking-widest uppercase text-[#00ccff]">
              He placed it in a well. <span className="font-bold text-white">It outgrew the well.</span>
            </h2>
          </div>
        </motion.div>

        {/* SCENE 5 */}
        <motion.div style={{ opacity: s5, y: driftDown(0.28, 0.35) }} className="absolute inset-0 flex items-end justify-center pb-32">
          <div className="relative w-full max-w-6xl aspect-[21/9] flex items-end p-10">
            <ImagePlaceholder title="Massive Shadow in Ocean" width="w-full" height="h-full" className="absolute inset-0 rounded-t-[4rem] border-b-0" />
            <div className="z-10 bg-black/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
              <h1 className="text-3xl md:text-5xl font-light uppercase tracking-widest text-white">He released it into the ocean.</h1>
              <p className="text-xl font-serif italic text-[#00ccff] mt-4">Within days, it eclipsed the sea.</p>
            </div>
          </div>
        </motion.div>

        {/* SCENE 6 */}
        <motion.div style={{ opacity: s6, y: driftUp(0.35, 0.42) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-10">
          <ImagePlaceholder title="Giant Glowing Eye" width="w-[80vw] max-w-4xl" height="h-[40vh]" className="mb-12 border-[#fbbf24]/30" />
          <p className="text-2xl tracking-[0.4em] uppercase opacity-70 mb-4">Manu trembled.</p>
          <h1 className="text-5xl md:text-7xl font-serif italic text-[#fbbf24] drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            &quot;Who are you?&quot;
          </h1>
        </motion.div>

        {/* SCENE 7 */}
        <motion.div style={{ opacity: s7, x: driftRight(0.42, 0.49) }} className="absolute inset-0 flex items-center justify-center px-10">
          <div className="text-center">
            <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-[0.8] text-white mix-blend-overlay opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              PRALAYA
            </h1>
            <h2 className="relative z-10 text-6xl md:text-8xl font-serif uppercase text-[#ff3366] mb-6 drop-shadow-[0_0_40px_rgba(255,51,102,0.4)]">
              The sky broke.
            </h2>
            <p className="relative z-10 text-2xl md:text-4xl font-light tracking-[0.3em] uppercase">
              The Cosmic Deluge had come.
            </p>
          </div>
        </motion.div>

        {/* SCENE 8 */}
        <motion.div style={{ opacity: s8, y: driftUp(0.49, 0.56) }} className="absolute inset-0 flex items-center justify-between px-10 md:px-24">
          <div className="max-w-xl text-left">
            <h1 className="text-5xl md:text-7xl font-light uppercase tracking-widest text-[#fbbf24] mb-8 leading-tight">
              &quot;Build an Ark,&quot;<br/><span className="text-white">the voice echoed.</span>
            </h1>
            <div className="pl-6 border-l-2 border-[#fbbf24]/50">
              <p className="text-2xl tracking-[0.2em] uppercase font-serif italic mb-2">&quot;Gather the seeds of all life.&quot;</p>
              <p className="text-2xl tracking-[0.2em] uppercase font-serif italic text-[#00ccff]">&quot;Gather the Truth.&quot;</p>
            </div>
          </div>
          <ImagePlaceholder title="Tiny Golden Ark" width="w-64" height="h-64" className="rounded-full border-[#fbbf24]/50 shadow-[0_0_60px_rgba(251,191,36,0.15)]" />
        </motion.div>

        {/* SCENE 9 */}
        <motion.div style={{ opacity: s9, y: driftDown(0.56, 0.63) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <p className="text-xl md:text-2xl font-mono tracking-[0.5em] text-white/40 mb-8 uppercase">/ Absolute Zero /</p>
          <h1 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-relaxed max-w-4xl">
            In the endless dark of the drowned world...<br/>
            <span className="font-serif italic opacity-60">There was no north. No south.</span>
          </h1>
        </motion.div>

        {/* SCENE 10 */}
        <motion.div style={{ opacity: s10, y: driftUp(0.63, 0.70) }} className="absolute inset-0 flex items-center justify-center text-center">
          <div className="w-[1px] h-32 bg-gradient-to-b from-transparent to-[#00ccff] mb-8" />
          <h1 className="text-5xl md:text-7xl font-serif text-[#00ccff] drop-shadow-[0_0_50px_rgba(0,204,255,0.6)]">
            Then, the abyss illuminated.
          </h1>
        </motion.div>

        {/* SCENE 11 */}
        <motion.div style={{ opacity: s11, y: driftLeft(0.70, 0.77) }} className="absolute inset-0 flex items-center px-10 md:px-24">
          <h1 className="text-[25vw] font-black text-[#00ccff]/5 absolute -left-10 top-1/2 -translate-y-1/2 leading-none select-none">MATSYA</h1>
          <div className="flex-1 z-10 pl-10 border-l border-[#00ccff]/30">
            <p className="text-2xl tracking-[0.4em] uppercase text-white/60 mb-4">The Preserver, Vishnu.</p>
            <h2 className="text-6xl md:text-8xl font-serif uppercase tracking-widest text-[#00ccff] drop-shadow-[0_0_30px_rgba(0,204,255,0.4)]">
              The Cosmic Leviathan.
            </h2>
          </div>
        </motion.div>

        {/* SCENE 12 */}
        <motion.div style={{ opacity: s12, y: driftRight(0.77, 0.84) }} className="absolute inset-0 flex items-center px-10 md:px-24 flex-row-reverse">
          <ImagePlaceholder title="Vasuki Serpent Tether" width="w-[40vw]" height="h-[50vh]" className="border-[#fbbf24]/30 bg-[#fbbf24]/5" />
          <div className="flex-1 z-10 text-right pr-16">
            <h2 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-tight mb-8">
              &quot;Tether your ark<br/>to my horn.&quot;
            </h2>
            <div className="inline-block bg-[#00ccff]/10 border border-[#00ccff]/30 backdrop-blur-md px-8 py-4">
               <p className="text-xl tracking-[0.3em] uppercase text-[#00ccff]">He commanded.</p>
            </div>
          </div>
        </motion.div>

        {/* SCENE 13 */}
        <motion.div style={{ opacity: s13, y: driftUp(0.84, 0.91) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <ImagePlaceholder title="Leviathan Pulling Ark" width="w-full max-w-5xl" height="h-[40vh]" className="rounded-[3rem] border-t-[#00ccff]/50 mb-12 shadow-[0_-20px_50px_rgba(0,204,255,0.1)]" />
          <h1 className="text-3xl md:text-5xl font-light uppercase tracking-[0.2em] leading-relaxed max-w-4xl">
            Through the chaotic abyss of the end of the world...<br/>
            <span className="font-serif italic text-[#fbbf24]">He guided the light.</span>
          </h1>
        </motion.div>

        {/* SCENE 14 */}
        <motion.div style={{ opacity: s14 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <h1 className="text-2xl md:text-4xl font-light tracking-[0.3em] uppercase mb-12 text-[#00ccff]">
            The Rebirth.
          </h1>
          <div className="w-[1px] h-32 bg-gradient-to-b from-[#00ccff] to-transparent mb-12" />
          <div className="max-w-4xl text-3xl md:text-5xl font-serif leading-tight p-12 border border-white/10 bg-[#020617]/80 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,204,255,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ccff] to-transparent opacity-50" />
            &quot;When the world drowns in ignorance, <span className="text-white italic">truth becomes the ark.</span><br/><br/>
            <span className="text-[#fbbf24] uppercase tracking-widest text-2xl md:text-4xl not-italic">And Dharma is the compass.</span>&quot;
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}