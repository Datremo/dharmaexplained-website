import React, { useRef, useMemo, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Box, Sphere, Cylinder, Torus } from '@react-three/drei';
import { setGlobalMusic } from './GlobalAudio';

// --------------------------------------------------------
// 🖼️ HELPER: CINEMATIC IMAGE PLACEHOLDER
// --------------------------------------------------------
const ImagePlaceholder = ({ title, width, height, className = "" }) => (
  <div className={`relative overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center text-white/30 font-mono text-[10px] uppercase tracking-[0.3em] backdrop-blur-md ${width} ${height} ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-[#00ccff]/10 to-transparent opacity-50" />
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
    <span className="relative z-10">[ {title} ]</span>
  </div>
);

// --------------------------------------------------------
// 🌌 THE 3D STORYTELLING ENGINE
// --------------------------------------------------------
const Vamana3DScene = ({ scrollProgress }) => {
  const kingRef = useRef(); const godHaloRef = useRef(); const fireRef = useRef();
  const boyRef = useRef(); const trivikramaRef = useRef(); const footRef = useRef();

  const { firePositions } = useMemo(() => {
    const pos = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000 * 3; i++) { pos[i] = (Math.random() - 0.5) * 20; }
    return { firePositions: pos };
  }, []);

  useFrame((state, delta) => {
    const scroll = scrollProgress.get();

    if (kingRef.current) {
      kingRef.current.material.opacity = THREE.MathUtils.lerp(kingRef.current.material.opacity, scroll < 0.14 ? 0.8 : 0, delta * 5);
      kingRef.current.rotation.y += delta * 0.1;
      kingRef.current.position.x = 2; 
    }

    if (godHaloRef.current) {
      godHaloRef.current.material.opacity = THREE.MathUtils.lerp(godHaloRef.current.material.opacity, scroll > 0.13 && scroll < 0.22 ? 1 : 0, delta * 4);
      godHaloRef.current.rotation.x += delta * 0.5;
      godHaloRef.current.rotation.y += delta * 0.3;
    }

    if (fireRef.current) {
      fireRef.current.material.opacity = THREE.MathUtils.lerp(fireRef.current.material.opacity, scroll > 0.20 && scroll < 0.29 ? 1 : 0, delta * 5);
      fireRef.current.rotation.x += delta * 0.5;
    }

    if (boyRef.current) {
      boyRef.current.material.opacity = THREE.MathUtils.lerp(boyRef.current.material.opacity, scroll > 0.27 && scroll < 0.49 ? 1 : 0, delta * 5);
      boyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2 - 1;
    }

    if (kingRef.current) {
        if (scroll > 0.42 && scroll < 0.49) {
            kingRef.current.material.opacity = THREE.MathUtils.lerp(kingRef.current.material.opacity, 1, delta * 8);
            kingRef.current.material.color.setHex(0xfbbf24); 
            kingRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.1); 
        } else if (scroll <= 0.42) {
            kingRef.current.material.color.setHex(0xff3366); 
            kingRef.current.scale.setScalar(1);
        }
    }

    if (trivikramaRef.current) {
      trivikramaRef.current.material.opacity = THREE.MathUtils.lerp(trivikramaRef.current.material.opacity, scroll > 0.48 && scroll < 0.78 ? 1 : 0, delta * 5);
      const stretch = Math.max(0.1, (scroll - 0.49) * 200); 
      trivikramaRef.current.scale.lerp(new THREE.Vector3(2, stretch, 2), delta * 4);
    }

    if (footRef.current) {
      footRef.current.material.opacity = THREE.MathUtils.lerp(footRef.current.material.opacity, scroll > 0.76 ? 1 : 0, delta * 5);
      footRef.current.position.y = THREE.MathUtils.lerp(footRef.current.position.y, scroll > 0.90 ? 1 : 8, delta * 2);
    }
  });

  return (
    <group>
      <Box ref={kingRef} args={[4, 4, 4]} position={[2, 0, -6]}><meshStandardMaterial color="#ff3366" wireframe transparent opacity={0} /></Box>
      <Torus ref={godHaloRef} args={[3, 0.02, 16, 100]} position={[0, 0, -4]}><meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} transparent opacity={0} /></Torus>
      <points ref={fireRef} position={[0, -2, -3]}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={1000} array={firePositions} itemSize={3} /></bufferGeometry>
        <pointsMaterial size={0.05} color="#fbbf24" transparent opacity={0} blending={THREE.AdditiveBlending} />
      </points>
      <Sphere ref={boyRef} args={[0.5, 32, 32]} position={[0, -1, 0]}><meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.5} transparent opacity={0} /></Sphere>
      <Cylinder ref={trivikramaRef} args={[1, 1, 1, 32]} position={[0, -10, -5]}><meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} transparent opacity={0} /></Cylinder>
      <Box ref={footRef} args={[4, 1, 6]} position={[0, 8, 0]}><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} wireframe transparent opacity={0} /></Box>
    </group>
  );
};

// --------------------------------------------------------
// 🎬 THE MAIN EDITORIAL SCROLL COMPONENT
// --------------------------------------------------------
export default function VamanaLore({ onBack }) {
  const containerRef = useRef(null);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    setGlobalMusic('vamana');
  }, []);
  
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 40, damping: 20, mass: 1 });

  // 🌩️ THE BLINDING TRIVIKRAMA FLASH
  const bgColor = useTransform(sp, [0.48, 0.50, 0.75, 0.77], ["#0a0514", "#ffffff", "#ffffff", "#0a0514"]);
  const textColor = useTransform(sp, [0.48, 0.50, 0.75, 0.77], ["#ffffff", "#050505", "#050505", "#ffffff"]);
  const shake = useTransform(sp, (p) => (p > 0.49 && p < 0.60) ? Math.sin(p * 500) * 15 : 0); 

  // 🧮 14 OPACITY WINDOWS
  const o = (start, peak1, peak2, end) => useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  const s1=o(0.00, 0.01, 0.05, 0.07); const s2=o(0.07, 0.09, 0.12, 0.14); const s3=o(0.14, 0.16, 0.19, 0.21);
  const s4=o(0.21, 0.23, 0.26, 0.28); const s5=o(0.28, 0.30, 0.33, 0.35); const s6=o(0.35, 0.37, 0.40, 0.42);
  const s7=o(0.42, 0.44, 0.47, 0.49); const s8=o(0.49, 0.51, 0.54, 0.56); const s9=o(0.56, 0.58, 0.61, 0.63);
  const s10=o(0.63, 0.65, 0.68, 0.70); const s11=o(0.70, 0.72, 0.75, 0.77); const s12=o(0.77, 0.79, 0.82, 0.84);
  const s13=o(0.84, 0.86, 0.89, 0.91); const s14=useTransform(sp, [0.91, 0.93, 1, 1], [0, 1, 1, 1]); 

  // 🦅 PARALLAX DRIFT MATH
  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const driftLeft = (start, end) => useTransform(sp, [start, end], ["5vw", "-5vw"]);
  const driftRight = (start, end) => useTransform(sp, [start, end], ["-5vw", "5vw"]);

  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[1400vh] font-sans">
      
      <button onClick={onBack} className="fixed top-6 left-6 z-[100] px-6 py-2 border border-current rounded-full text-xs tracking-widest uppercase hover:opacity-50 transition-all mix-blend-difference text-white shadow-lg">
        &larr; Exit Domain
      </button>

      {/* 3D BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} intensity={1.5} mipmapBlur />
            <Vignette eskil={false} offset={0.3} darkness={0.7} />
            <Noise opacity={0.15} />
          </EffectComposer>
          <Vamana3DScene scrollProgress={sp} />
        </Canvas>
      </div>

      {/* EDITORIAL HTML LAYER */}
      <motion.div style={{ x: shake, color: textColor }} className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* SCENE 1: The Tyrant */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.07) }} className="absolute inset-0 flex items-center px-10 md:px-24">
          <div className="w-1/2 flex flex-col items-start text-left z-10">
            <h1 className="text-xl md:text-2xl font-mono tracking-[0.4em] text-[#ff3366] mb-4">I. THE TYRANT</h1>
            <h2 className="text-6xl md:text-8xl lg:text-[9rem] font-serif uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
              Mahabali.
            </h2>
            <p className="text-lg md:text-xl font-light tracking-widest mt-8 max-w-md border-l border-white/30 pl-6">
              A demon of unmatched virtue. A king of infinite ambition.
            </p>
          </div>
          <ImagePlaceholder title="Demon King Silhouette" width="w-1/2 max-w-lg" height="h-[60vh]" className="absolute right-10 md:right-24 rounded-none" />
        </motion.div>

        {/* SCENE 2: The Conquest */}
        <motion.div style={{ opacity: s2, y: driftDown(0.07, 0.14) }} className="absolute inset-0 flex flex-col justify-center px-10">
          <h1 className="text-[10vw] font-serif uppercase tracking-tighter leading-none text-white/10 absolute top-1/2 -translate-y-1/2 whitespace-nowrap">
            CONQUEST CONQUEST
          </h1>
          <h2 className="text-4xl md:text-6xl font-light uppercase tracking-widest max-w-3xl ml-auto text-right">
            He took the Earth.<br /><span className="text-[#fbbf24] italic">He besieged the Heavens.</span>
          </h2>
          <p className="text-right tracking-[0.3em] uppercase opacity-60 mt-4">The Gods fled. His ego eclipsed the sun.</p>
        </motion.div>

        {/* SCENE 3: The Cosmic Loophole */}
        <motion.div style={{ opacity: s3, x: driftLeft(0.14, 0.21) }} className="absolute inset-0 flex items-center justify-end px-10 md:px-24">
          <ImagePlaceholder title="Gods Praying" width="w-[40vw]" height="h-[40vh]" className="absolute left-10 rounded-full blur-[2px]" />
          <div className="max-w-xl text-right z-10">
            <h1 className="text-5xl md:text-7xl font-serif uppercase text-[#00ccff] leading-none mb-6">
              But a righteous king<br/>cannot be killed.
            </h1>
            <p className="text-xl tracking-widest font-light">The exiled Gods prayed to Vishnu.</p>
            <p className="text-sm font-mono tracking-widest opacity-50 mt-4">IF NOT BY FORCE, THEN BY HIS OWN PRIDE.</p>
          </div>
        </motion.div>

        {/* SCENE 4: The Trap */}
        <motion.div style={{ opacity: s4, y: driftUp(0.21, 0.28) }} className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
            <ImagePlaceholder title="Yajna Fire Ritual" width="w-full" height="h-full" className="absolute inset-0 rounded-3xl" />
            <div className="z-10 bg-black/60 backdrop-blur-xl p-12 text-center border-t border-b border-[#fbbf24]/50 w-full">
              <h1 className="text-6xl md:text-8xl font-serif uppercase tracking-widest text-[#fbbf24]">The Grand Ritual</h1>
              <p className="tracking-[0.4em] uppercase mt-4 text-white">Bali vowed to grant any wish to prove his greatness.</p>
            </div>
          </div>
        </motion.div>

        {/* SCENE 5: The Anomaly */}
        <motion.div style={{ opacity: s5, y: driftUp(0.28, 0.35) }} className="absolute inset-0 flex items-end justify-center pb-32">
          <div className="flex items-end gap-12 max-w-5xl w-full px-10">
            <ImagePlaceholder title="Vamana Boy" width="w-48" height="h-72" className="rounded-t-full border-b-0" />
            <div className="pb-8">
              <h1 className="text-5xl md:text-7xl font-serif text-[#00ccff]">Then... an anomaly appeared.</h1>
              <p className="text-2xl font-light tracking-widest mt-2 uppercase">Not a warrior. But a tiny, humble dwarf boy.</p>
            </div>
          </div>
        </motion.div>

        {/* SCENE 6: The Ask */}
        <motion.div style={{ opacity: s6, y: driftDown(0.35, 0.42) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-10">
          <h1 className="text-4xl md:text-6xl font-light tracking-widest uppercase mb-4">
            &quot;O Great King,&quot; he smiled.<br />&quot;I ask only for <span className="font-serif font-bold text-[#fbbf24]">three paces</span> of land.&quot;
          </h1>
          <p className="text-xl tracking-[0.4em] uppercase opacity-70">&quot;Measured by my own small feet.&quot;</p>
        </motion.div>

        {/* SCENE 7: The Arrogance */}
        <motion.div style={{ opacity: s7, y: driftUp(0.42, 0.49) }} className="absolute inset-0 flex items-center justify-between px-10 md:px-24">
          <div className="max-w-lg">
            <p className="text-lg font-mono tracking-widest text-[#ff3366] mb-4 uppercase">/ Warning //</p>
            <p className="text-2xl font-light leading-relaxed">His Guru warned him: &quot;Do not agree. It is the Preserver in disguise!&quot;</p>
          </div>
          <div className="max-w-xl text-right">
            <h1 className="text-7xl font-serif uppercase text-[#fbbf24] mb-4">But the King laughed.</h1>
            <p className="text-2xl italic">&quot;You ask the master of the universe for mere dirt? Granted.&quot;</p>
          </div>
        </motion.div>

        {/* --- 💥 BRUTALIST EDITORIAL CLIMAX (WHITE BACKGROUND) --- */}
        
        {/* SCENE 8: The Flash */}
        <motion.div style={{ opacity: s8 }} className="absolute inset-0 flex items-center justify-center mix-blend-difference">
          <h1 className="text-[8vw] font-black uppercase tracking-tighter leading-none text-center">
            IN A FRACTION OF A HEARTBEAT<br/>THE ILLUSION DROPPED.
          </h1>
        </motion.div>

        {/* SCENE 9: The Reveal */}
        <motion.div style={{ opacity: s9, y: driftUp(0.56, 0.63) }} className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-[20vw] font-black tracking-tighter leading-none text-black/5 absolute z-0 select-none">VISHNU</h1>
          <div className="z-10 flex gap-8 w-full max-w-6xl px-10 items-center">
            <div className="flex-1">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                The dwarf expanded<br/>into the infinite.
              </h2>
            </div>
            <div className="flex-1 bg-black text-white p-10">
              <p className="text-2xl tracking-[0.3em] uppercase font-light">The Preserver, Vishnu, had returned.</p>
            </div>
          </div>
        </motion.div>

        {/* SCENE 10: Step I */}
        <motion.div style={{ opacity: s10, y: driftLeft(0.63, 0.70) }} className="absolute inset-0 flex items-center px-10 md:px-24">
          <h1 className="text-[30vw] font-black text-black/5 absolute -left-20 top-0 leading-none">I</h1>
          <div className="flex-1 z-10">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter max-w-2xl">
              With his first step, he swallowed the Earth.
            </h2>
          </div>
          <ImagePlaceholder title="Earth Step" width="w-[40vw]" height="h-[60vh]" className="border-black bg-black/10 text-black/50" />
        </motion.div>

        {/* SCENE 11: Step II */}
        <motion.div style={{ opacity: s11, y: driftRight(0.70, 0.77) }} className="absolute inset-0 flex items-center px-10 md:px-24 flex-row-reverse">
          <h1 className="text-[30vw] font-black text-black/5 absolute -right-20 top-0 leading-none">II</h1>
          <div className="flex-1 z-10 text-right">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter max-w-2xl ml-auto">
              With his second... he eclipsed the Heavens.
            </h2>
            <div className="inline-block bg-black text-white px-6 py-2 mt-6">
               <p className="text-xl tracking-widest uppercase">There was no space left in creation.</p>
            </div>
          </div>
          <ImagePlaceholder title="Heavens Step" width="w-[40vw]" height="h-[60vh]" className="border-black bg-black/10 text-black/50" />
        </motion.div>

        {/* --- 🌌 BACK TO THE VOID --- */}

        {/* SCENE 12: The Void Question */}
        <motion.div style={{ opacity: s12, y: driftDown(0.77, 0.84) }} className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <ImagePlaceholder title="Hovering Glowing Foot" width="w-64" height="h-64" className="rounded-full mb-10" />
          <h1 className="text-3xl tracking-[0.5em] uppercase opacity-50 mb-4">&quot;Bali,&quot; the cosmos whispered.</h1>
          <h2 className="text-6xl md:text-8xl font-serif text-[#ff3366] italic">&quot;Where do I place the third?&quot;</h2>
        </motion.div>

        {/* SCENE 13: Surrender */}
        <motion.div style={{ opacity: s13, y: driftUp(0.84, 0.91) }} className="absolute inset-0 flex items-center px-10 md:px-24">
           <ImagePlaceholder title="King Bowing Head" width="w-1/2" height="h-[50vh]" className="rounded-l-[4rem] rounded-r-none border-r-0 absolute left-0" />
           <div className="w-1/2 ml-auto z-10 pl-20">
              <h1 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-tight mb-8">
                The tyrant looked at the universe he thought he owned.
              </h1>
              <p className="text-3xl font-serif text-[#fbbf24] mb-4">And his ego finally broke.</p>
              <p className="text-xl font-mono tracking-widest opacity-60 uppercase">He bowed his head. &quot;Place it here, Lord.&quot;</p>
           </div>
        </motion.div>

        {/* SCENE 14: Final Lesson */}
        <motion.div style={{ opacity: s14 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <h1 className="text-2xl md:text-4xl font-light tracking-[0.3em] uppercase mb-12">
            The foot descended. <span className="text-[#fbbf24] italic font-serif">To bless, not to crush.</span>
          </h1>
          <p className="text-lg opacity-60 tracking-widest uppercase mb-12">Rewarded for his ultimate devotion, Bali was sent to rule Patala for eternity.</p>
          <div className="w-[1px] h-32 bg-gradient-to-b from-[#fbbf24] to-transparent mb-12" />
          <div className="max-w-3xl text-3xl md:text-5xl font-serif leading-tight">
            &quot;You cannot give what was never yours.<br/><br/>
            <span className="text-[#fbbf24]">True liberation begins the moment the ego surrenders.</span>&quot;
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}