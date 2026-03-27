import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerformanceMonitor, Float, Sphere, Torus, Sparkles, 
  MeshTransmissionMaterial, Stars, Cone, Icosahedron
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { setGlobalMusic } from '../GlobalAudio';

// --------------------------------------------------------
// 💧 3D OBJECT: THE DROPLET OF STILLNESS (DHYAN)
// --------------------------------------------------------
const WaterDroplet = ({ isHovered, isMobile }) => {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // PERFECTLY CENTERED ABOVE LEFT CARD: X = -4.5
    const targetX = isMobile ? 0 : -4.5;
    // Hovering above the card: Y = 1.5
    const targetY = isHovered ? 2.0 : 1.5; 
    const targetScale = isHovered ? (isMobile ? 1.2 : 1.5) : (isMobile ? 0.6 : 0.9);
    
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    groupRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 0), delta * 4);
    groupRef.current.rotation.y += delta * (isHovered ? 0.8 : 0.2);
  });

  const cyanGlow = <meshStandardMaterial color="#00ccff" emissive="#0088ff" emissiveIntensity={isHovered ? 2.5 : 1} transparent opacity={0.9} />;

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={1}>
      <group ref={groupRef}>
        {/* The Droplet Base */}
        <Sphere args={[0.8, 32, 32]} position={[0, -0.2, 0]}>
          {cyanGlow}
        </Sphere>
        {/* The Droplet Tip (Cone pointing up) */}
        <Cone args={[0.8, 1.8, 32]} position={[0, 0.5, 0]}>
          {cyanGlow}
        </Cone>
        {isHovered && <Sparkles count={40} scale={3} size={3} speed={0.5} color="#00ffff" opacity={0.8} />}
      </group>
    </Float>
  );
};

// --------------------------------------------------------
// 🔥 3D OBJECT: THE COSMIC FIRE (TANDAVA)
// --------------------------------------------------------
const CosmicFire = ({ isHovered, isMobile }) => {
  const groupRef = useRef();
  const flameCenter = useRef();
  const flameLeft = useRef();
  const flameRight = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // PERFECTLY CENTERED ABOVE MIDDLE CARD: X = 0
    const targetX = 0;
    const targetY = isHovered ? 2.0 : 1.5;
    const targetScale = isHovered ? (isMobile ? 1.2 : 1.5) : (isMobile ? 0.6 : 0.9);

    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    groupRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 0), delta * 4);

    const time = state.clock.elapsedTime;
    const speed = isHovered ? 10 : 3;

    // Make the flames flicker and stretch like real fire
    if (flameCenter.current) flameCenter.current.scale.y = 1 + Math.sin(time * speed) * 0.15;
    if (flameLeft.current) flameLeft.current.scale.y = 1 + Math.cos(time * speed * 1.2) * 0.2;
    if (flameRight.current) flameRight.current.scale.y = 1 + Math.sin(time * speed * 0.8) * 0.2;
  });

  const fireCore = <meshStandardMaterial color="#ffaa00" emissive="#ff3300" emissiveIntensity={isHovered ? 3 : 1.5} />;
  const fireEdge = <meshStandardMaterial color="#ff3300" emissive="#ff0000" emissiveIntensity={isHovered ? 2 : 1} />;

  return (
    <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* 1. Main Center Flame */}
        <group ref={flameCenter} position={[0, 0, 0]}>
          <Sphere args={[0.7, 32, 32]} position={[0, -0.4, 0]}>{fireCore}</Sphere>
          <Cone args={[0.7, 2.2, 32]} position={[0, 0.4, 0]}>{fireCore}</Cone>
        </group>

        {/* 2. Smaller Left Flame */}
        <group ref={flameLeft} position={[-0.6, -0.3, 0.2]} rotation={[0, 0, 0.3]}>
          <Sphere args={[0.4, 16, 16]} position={[0, -0.2, 0]}>{fireEdge}</Sphere>
          <Cone args={[0.4, 1.2, 16]} position={[0, 0.2, 0]}>{fireEdge}</Cone>
        </group>

        {/* 3. Smaller Right Flame */}
        <group ref={flameRight} position={[0.6, -0.5, -0.2]} rotation={[0, 0, -0.4]}>
          <Sphere args={[0.35, 16, 16]} position={[0, -0.15, 0]}>{fireEdge}</Sphere>
          <Cone args={[0.35, 1.0, 16]} position={[0, 0.2, 0]}>{fireEdge}</Cone>
        </group>

        {isHovered && <Sparkles count={60} scale={2.5} size={4} speed={2} color="#ffaa00" opacity={0.9} position={[0, 0.5, 0]} />}
      </group>
    </Float>
  );
};

// --------------------------------------------------------
// 🧠 3D OBJECT: THE NEURAL BRAIN (KNOWLEDGE)
// --------------------------------------------------------
const NeuralBrain = ({ isHovered, isMobile }) => {
  const groupRef = useRef();
  const leftHemisphere = useRef();
  const rightHemisphere = useRef();
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // PERFECTLY CENTERED ABOVE RIGHT CARD: X = 4.5
    const targetX = isMobile ? 0 : 4.5;
    const targetY = isHovered ? 2.0 : 1.5;
    const targetScale = isHovered ? (isMobile ? 1.0 : 1.2) : (isMobile ? 0.6 : 0.8);

    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    groupRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 0), delta * 4);

    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y += delta * (isHovered ? 0.8 : 0.2);

    // Brain pulsing animation
    const pulse = 1 + Math.sin(time * 3) * (isHovered ? 0.08 : 0.02);
    if (leftHemisphere.current) leftHemisphere.current.scale.setScalar(pulse);
    if (rightHemisphere.current) rightHemisphere.current.scale.setScalar(pulse);
  });

  const brainMaterial = <meshStandardMaterial color="#b026ff" emissive="#6a0dad" emissiveIntensity={isHovered ? 2 : 0.8} wireframe />;
  const coreMaterial = <meshStandardMaterial color="#ffffff" emissive="#b026ff" emissiveIntensity={isHovered ? 3 : 1.5} />;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <group ref={groupRef}>
        {/* Left Hemisphere (Stretched Sphere) */}
        <Sphere ref={leftHemisphere} args={[0.8, 32, 32]} position={[-0.4, 0, 0]} scale={[1, 1.2, 1.4]}>
          {brainMaterial}
        </Sphere>
        {/* Right Hemisphere (Stretched Sphere) */}
        <Sphere ref={rightHemisphere} args={[0.8, 32, 32]} position={[0.4, 0, 0]} scale={[1, 1.2, 1.4]}>
          {brainMaterial}
        </Sphere>
        {/* Glowing Intellect Core in the center */}
        <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
          {coreMaterial}
        </Sphere>
        {isHovered && <Sparkles count={80} scale={3} size={2} speed={1} color="#e0b0ff" opacity={0.8} />}
      </group>
    </Float>
  );
};
// --------------------------------------------------------
// 🎛️ UI COMPONENT: ELEGANT HUD CARD
// --------------------------------------------------------
const HubCard = ({ title, subtitle, icon, themeColor, isHovered, onHover, onLeave, onClick }) => {
  return (
    <motion.div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      whileHover={{ y: -10 }}
      whileTap={{ scale: 0.95 }}
      className={`relative w-full md:w-1/3 flex flex-col justify-between p-6 md:p-8 rounded-3xl backdrop-blur-2xl cursor-pointer overflow-hidden transition-all duration-500 group border-2 ${isHovered ? `border-[${themeColor}] bg-[#0a0515]/90` : 'border-white/10 bg-[#05020a]/60'} shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}
    >
      {/* Background Glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none z-0`} style={{ backgroundColor: themeColor }} />
      
      <div className="relative z-10 flex flex-col items-center text-center h-full">
        <span className="text-4xl md:text-5xl mb-4 drop-shadow-md filter grayscale group-hover:grayscale-0 transition-all duration-500">
          {icon}
        </span>
        <h3 className="font-mono text-[9px] md:text-[10px] tracking-[0.5em] uppercase mb-2 text-white/50 group-hover:text-white transition-colors duration-300">
          {subtitle}
        </h3>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white drop-shadow-lg leading-none mb-6">
          {title}
        </h1>

        <div className="mt-auto flex items-center justify-center">
          <div className={`h-[2px] w-8 transition-all duration-500 group-hover:w-16`} style={{ backgroundColor: isHovered ? themeColor : 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>
    </motion.div>
  );
};

// --------------------------------------------------------
// 🎬 THE MAIN COMMAND CENTER: DHARMAVARSH HUB
// --------------------------------------------------------
export default function DharmavarshHub({ onBack, onSelectDhyan, onSelectTandav, onSelectEmbers }) {
  const [activeZone, setActiveZone] = useState(null); // 'dhyan', 'tandav', 'embers', or null
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    setGlobalMusic('cosmic_void'); 
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-[#020005] font-sans overflow-hidden flex flex-col transition-colors duration-1000">
      
      {/* 🧭 NAVIGATION */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[100] pointer-events-auto">
        <button 
          onClick={onBack} 
          className="px-6 py-3 border border-white/20 bg-black/40 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all backdrop-blur-xl text-white shadow-lg flex items-center gap-3 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Retreat
        </button>
        
        <div className="flex flex-col items-end text-right">
          <h2 className="text-white/50 font-mono text-[8px] md:text-[10px] tracking-[0.8em] uppercase mb-1">
            Current Domain
          </h2>
          <h1 className="text-white font-black text-sm md:text-xl tracking-[0.5em] uppercase drop-shadow-md">
            Dharmavarsh
          </h1>
        </div>
      </div>

      {/* 🌌 3D BACKGROUND & OBJECTS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas dpr={dpr} camera={{ position: [0, 0, 10], fov: 60 }}>
          <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 10, 5]} intensity={1} color="#ffffff" />
          
          <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
          
          {/* Absolutely NO Chromatic Aberration here per your request! */}
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.5} intensity={1.5} mipmapBlur />
            <Vignette eskil={false} offset={0.1} darkness={0.9} />
            <Noise opacity={0.03} />
          </EffectComposer>

          {/* The 3 Dynamic Objects rendered seamlessly in space */}
          <WaterDroplet isHovered={activeZone === 'dhyan'} isMobile={isMobile} />
          <CosmicFire isHovered={activeZone === 'tandav'} isMobile={isMobile} />
          <NeuralBrain isHovered={activeZone === 'embers'} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* 🎛️ UI OVERLAY (The Glassmorphic Cards) */}
      <div className="absolute bottom-0 left-0 w-full z-10 p-6 md:p-12 pointer-events-none">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-6xl mx-auto pointer-events-auto">
          
          <HubCard 
            title="Dhyan"
            subtitle="Absolute Stillness"
            icon="💧"
            themeColor="#00ccff"
            isHovered={activeZone === 'dhyan'}
            onHover={() => setActiveZone('dhyan')}
            onLeave={() => setActiveZone(null)}
            onClick={onSelectDhyan}
          />

          <HubCard 
            title="Tandava"
            subtitle="The Flow State"
            icon="🔥"
            themeColor="#ff1100"
            isHovered={activeZone === 'tandav'}
            onHover={() => setActiveZone('tandav')}
            onLeave={() => setActiveZone(null)}
            onClick={onSelectTandav}
          />

          <HubCard 
            title="Ashram"
            subtitle="Knowledge Core"
            icon="🧠"
            themeColor="#b026ff"
            isHovered={activeZone === 'embers'}
            onHover={() => setActiveZone('embers')}
            onLeave={() => setActiveZone(null)}
            onClick={onSelectEmbers}
          />

        </div>
      </div>

    </div>
  );
}