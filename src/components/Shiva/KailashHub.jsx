import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValueEvent } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerformanceMonitor, Float, Cylinder, Torus, Cone, Sphere, 
  Octahedron, Icosahedron, Cloud, Clouds, Capsule, Sparkles 
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import { setGlobalMusic } from '../GlobalAudio';

// --------------------------------------------------------
// 🏔️ 3D ENGINE: PROCEDURAL MOUNT KAILASH (DAYTIME HIGH CONTRAST)
// --------------------------------------------------------
const ProceduralTerrain = () => {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(300, 300, 256, 256);
    const pos = geo.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let dist = Math.sqrt(x * x + y * y);
      
      // The massive Pyramid Peak of Kailash
      let z = Math.max(0, 70 - dist * 0.85); 
      
      // Jagged mountain ridges and rocky imperfections
      z += Math.sin(x * 0.4) * Math.cos(y * 0.4) * 8;
      z += Math.sin(x * 1.5) * Math.cos(y * 1.5) * 2;
      z += Math.sin(x * 5.0) * Math.cos(y * 5.0) * 0.5;
      
      // Flatten the base slightly for the valley
      if (z < 2) z = Math.random() * 0.5;
      
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -25, -40]}>
      {/* Crisp white snow with strong shadows to contrast the deep blue sky */}
      <meshStandardMaterial 
        color="#f0f8ff" 
        roughness={0.7} 
        metalness={0.1} 
        flatShading 
        emissive="#001133" 
        emissiveIntensity={0.1} 
      />
    </mesh>
  );
};

// --------------------------------------------------------
// 📿 3D MYTHOLOGY WAYPOINT 1: THE RUDRAKSHA BEAD
// --------------------------------------------------------
const FloatingRudraksha = ({ position, scale = 1 }) => {
  const beadRef = useRef();
  useFrame((state, delta) => {
    if (beadRef.current) {
      beadRef.current.rotation.y += delta * 0.5;
      beadRef.current.rotation.x += delta * 0.2;
      beadRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.01;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <group position={position} scale={scale} ref={beadRef}>
        {/* The rough, multi-faceted texture of a Rudraksha */}
        <Icosahedron args={[2, 2]}>
          <meshStandardMaterial color="#4a2e15" roughness={1} metalness={0.1} flatShading />
        </Icosahedron>
        {/* Golden energy core glowing from within */}
        <Sphere args={[1.8, 16, 16]}>
          <meshBasicMaterial color="#fbbf24" wireframe transparent opacity={0.3} />
        </Sphere>
      </group>
    </Float>
  );
};

// --------------------------------------------------------
// 🌙 3D MYTHOLOGY WAYPOINT 2: THE CRESCENT MOON
// --------------------------------------------------------
const FloatingCrescent = ({ position, scale = 1 }) => {
  const moonRef = useRef();
  useFrame((state, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.2;
      moonRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.01;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={2}>
      <group position={position} scale={scale} ref={moonRef} rotation={[0, Math.PI / 4, 0]}>
        {/* Torus cut perfectly in half to form a crescent moon */}
        <Torus args={[3, 0.6, 16, 64, Math.PI]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#e0f7ff" metalness={0.5} roughness={0.2} emissive="#00ccff" emissiveIntensity={0.5} />
        </Torus>
        <Sparkles count={50} scale={6} size={4} speed={0.4} color="#ffffff" opacity={0.8} />
      </group>
    </Float>
  );
};

// --------------------------------------------------------
// 🥁 3D MYTHOLOGY WAYPOINT 3: THE DAMARU
// --------------------------------------------------------
const FloatingDamaru = ({ position, scale = 1 }) => {
  const damaruRef = useRef();
  useFrame((state, delta) => {
    if (damaruRef.current) {
      damaruRef.current.rotation.y += delta * 1.5;
      damaruRef.current.rotation.z += delta * 0.5;
      damaruRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.015;
    }
  });
  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1}>
      <group position={position} scale={scale} ref={damaruRef} rotation={[Math.PI / 4, 0, 0]}>
        <Cone args={[1.5, 2, 32]} position={[0, 1, 0]}>
          <meshStandardMaterial color="#8b5a2b" metalness={0.2} roughness={0.9} />
        </Cone>
        <Cone args={[1.5, 2, 32]} position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial color="#8b5a2b" metalness={0.2} roughness={0.9} />
        </Cone>
        <Torus args={[0.3, 0.1, 16, 32]} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </Torus>
      </group>
    </Float>
  );
};

// --------------------------------------------------------
// 👁️ 3D MYTHOLOGY WAYPOINT 4: THE VERTICAL THIRD EYE
// --------------------------------------------------------
const FloatingThirdEye = ({ position, scale = 1 }) => {
  const eyeRef = useRef();
  
  useFrame((state) => {
    if (eyeRef.current) {
      eyeRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5 + position[0]) * 0.01;
      // The eye slowly scans left and right like it is watching the user climb
      eyeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={1.5}>
      <group position={position} scale={scale} ref={eyeRef}>
        
        {/* The Outer Vertical Slit (Stretched on Y, squeezed on X) */}
        <mesh scale={[0.35, 1.2, 0.2]} rotation={[0, 0, 0]}>
          <torusGeometry args={[3, 0.25, 16, 64]} />
          <meshStandardMaterial color="#00ccff" metalness={0.9} roughness={0.1} emissive="#00ccff" emissiveIntensity={0.6} />
        </mesh>
        
        {/* The Fiery Indigo Iris */}
        <Sphere args={[1.2, 32, 32]} scale={[1, 1, 0.2]} position={[0, 0, 0.05]}>
          <meshStandardMaterial color="#b026ff" metalness={0.5} roughness={0.2} emissive="#b026ff" emissiveIntensity={1.5} />
        </Sphere>
        
        {/* The Piercing White Pupil */}
        <Sphere args={[0.7, 32, 32]} position={[0, 0, 0.15]}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
        
        {/* Cosmic Energy Sparks floating around the eye */}
        <Sparkles count={60} scale={6} size={4} speed={0.4} color="#00ccff" opacity={0.8} />
      </group>
    </Float>
  );
};

// --------------------------------------------------------
// 🔱 3D ENGINE: METICULOUS TRISHUL AT THE ABSOLUTE PEAK
// --------------------------------------------------------
const DivineTrishul = ({ isBurning }) => {
  const trishulRef = useRef();
  const damaruStringsRef = useRef();
  const damaruRef = useRef();

  useFrame((state, delta) => {
    if (!trishulRef.current) return;
    const time = state.clock.elapsedTime;

    if (isBurning) {
      trishulRef.current.position.x = Math.sin(time * 60) * 0.2;
      trishulRef.current.position.z = Math.cos(time * 60) * 0.2;
      if (damaruStringsRef.current) damaruStringsRef.current.rotation.x += delta * 25; 
      if (damaruRef.current) damaruRef.current.rotation.x = Math.sin(time * 30) * 0.1; 
    } else {
      trishulRef.current.position.x = 0;
      trishulRef.current.position.z = 0;
      trishulRef.current.position.y = 55 + Math.sin(time) * 0.8; 
      if (damaruStringsRef.current) damaruStringsRef.current.rotation.x = Math.sin(time * 2) * 1.5;
    }
  });

  const cyanMetal = "#898484"; 
  const darkWood = "#5c2a11";  
  const gold = "#fbbf24";      

  return (
    <group ref={trishulRef} position={[0, 55, 0]} scale={2.5}>
      
      {/* --- 1. THE MAIN STAFF --- */}
      {/* Wooden Handle */}
      <Cylinder args={[0.20, 0.12, 13, 32]} position={[0, -2, 0]}>
        <meshStandardMaterial color={darkWood} roughness={0.9} />
      </Cylinder>
      

      {/* 🛑 ELONGATED METAL NECK (Connects the Damaru to the higher spears) */}
      <Cylinder args={[0.20, 0.15, 3, 32]} position={[0, 2.5, 0]}>
        <meshStandardMaterial color={cyanMetal} metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* --- 2. THE CENTER SPEAR --- */}
      {/* 🛑 SHIFTED UP to make the trident tall and dominant */}
      <Cone args={[0.4, 4, 4]} position={[0, 6.5, 0]} scale={[1, 1, 0.2]} rotation={[0, Math.PI/4, 0]}>
        <meshStandardMaterial color={cyanMetal} metalness={0.8} roughness={0.2} />
      </Cone>
      
      {/* --- 3. THE OUTER PRONGS (The 'U' Shape) --- */}
      {/* 🛑 SHIFTED UP and given a taller vertical scale (1.4) to create a deep 'U' curve */}
      <Torus args={[1.5, 0.2, 16, 50, Math.PI]} position={[0, 4.5, 0]} rotation={[0, 0, Math.PI]} scale={[1, 1.4, 1]}>
        <meshStandardMaterial color={cyanMetal} metalness={0.8} roughness={0.2} />
      </Torus>
      
      {/* 🛑 Prong Spear Tips (Shifted UP to attach to the new taller U-shape) */}
      <Cone args={[0.45, 2.6, 4]} position={[-1.6, 6, 0]} scale={[1, 1, 0.2]} rotation={[0, Math.PI/4, 0.1]}>
        <meshStandardMaterial color={cyanMetal} metalness={0.8} roughness={0.2} />
      </Cone>
      <Cone args={[0.40, 2.6, 4]} position={[1.6, 6, 0]} scale={[1, 1, 0.2]} rotation={[0, Math.PI/4, -0.1]}>
        <meshStandardMaterial color={cyanMetal} metalness={0.8} roughness={0.2} />
      </Cone>

      {/* --- 4. THE HORIZONTAL DAMARU (Unchanged, sits perfectly at the base) --- */}
      <group ref={damaruRef} position={[0, 1.2, 0.3]}>
        <Cone args={[0.8, 1.5, 32]} position={[-0.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <meshStandardMaterial color={darkWood} roughness={0.9} />
        </Cone>
        <Cone args={[0.8, 1.5, 32]} position={[0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color={darkWood} roughness={0.9} />
        </Cone>

        <Torus args={[0.8, 0.08, 16, 32]} position={[-1.5, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <meshStandardMaterial color={gold} metalness={0.8} roughness={0.2} />
        </Torus>
        <Torus args={[0.8, 0.08, 16, 32]} position={[1.5, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <meshStandardMaterial color={gold} metalness={0.8} roughness={0.2} />
        </Torus>
        <Torus args={[0.2, 0.08, 16, 32]} position={[0, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <meshStandardMaterial color={gold} metalness={0.8} roughness={0.2} />
        </Torus>

        <group ref={damaruStringsRef}>
          <Cylinder args={[0.015, 0.015, 1.8, 8]} position={[0, 0.9, 0]}>
             <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
          </Cylinder>
          <Sphere args={[0.15, 16, 16]} position={[0, 1.8, 0]}>
            <meshStandardMaterial color={gold} />
          </Sphere>
          <Cylinder args={[0.015, 0.015, 1.8, 8]} position={[0, -0.9, 0]}>
             <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
          </Cylinder>
          <Sphere args={[0.15, 16, 16]} position={[0, -1.8, 0]}>
            <meshStandardMaterial color={gold} />
          </Sphere>
        </group>
      </group>
    </group>
  );
};

// --------------------------------------------------------
// 🎥 3D ENGINE: CINEMATIC FLIGHT CONTROLLER
// --------------------------------------------------------
const FlightRig = ({ scrollProgress }) => {
  const { camera } = useThree();
  useFrame(() => {
    const p = scrollProgress.get();
    // Fly up the mountain terrain
    const camY = THREE.MathUtils.lerp(10, 55, p);
    const camZ = THREE.MathUtils.lerp(150, 45, p);
    const lookY = THREE.MathUtils.lerp(15, 60, p);
    camera.position.set(0, camY, camZ);
    camera.lookAt(0, lookY, 0);
  });
  return null;
};

// --------------------------------------------------------
// ❄️ 3D ENGINE: DAYTIME HIMALAYAN SNOW
// --------------------------------------------------------
const PureDaySnow = ({ tier, isBurning }) => {
  const pointsRef = useRef();
  const count = tier === 'low' ? 3000 : 7000;
  
  const { positions, sizes, opacities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const op = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 120;     
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120; 
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80; 
      sz[i] = Math.random() * 2;
      op[i] = Math.random();
    }
    return { positions: pos, sizes: sz, opacities: op };
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Wind becomes a violent hurricane during the burn ritual
    const windSpeed = isBurning ? 25 : 1.5; 
    pointsRef.current.position.y -= delta * windSpeed;
    pointsRef.current.position.x += Math.sin(time * 0.5) * delta * (windSpeed * 0.5);
    if (pointsRef.current.position.y < -50) pointsRef.current.position.y = 50;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-opacity" count={count} array={opacities} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial size={0.15} transparent opacity={0.9} color="#ffffff" sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// --------------------------------------------------------
// 🧭 UI COMPONENT: DYNAMIC ALTITUDE TRACKER
// --------------------------------------------------------
const AltitudeHUD = ({ scrollProgress }) => {
  const [altitude, setAltitude] = useState(15000);
  
  useMotionValueEvent(scrollProgress, "change", (latest) => {
    const currentAlt = 15000 + (latest * 6778); // Peak is 21,778 ft
    setAltitude(Math.floor(currentAlt));
  });

  // Fades out exactly at the peak to clear the screen for the Burn Box
  const hudOpacity = useTransform(scrollProgress, [0.92, 0.95], [1, 0]);

  return (
    <motion.div style={{ opacity: hudOpacity }} className="fixed top-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      <div className="flex items-center gap-3">
        <div className="h-[2px] w-12 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
        <p className="font-mono text-[10px] tracking-[0.4em] text-white/90 uppercase">Elevation</p>
      </div>
      <h2 className="font-mono text-2xl md:text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(0,10,20,0.8)] tracking-widest mt-1">
        {altitude.toLocaleString()} FT
      </h2>
      <p className="font-mono text-[8px] md:text-[10px] text-white tracking-[0.4em] uppercase mt-2 animate-pulse drop-shadow-md bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
        Ascending Mount Kailash
      </p>
    </motion.div>
  );
};

// --------------------------------------------------------
// 🎬 THE MAIN LOBBY: THE DHARMAVARSH TITAN
// --------------------------------------------------------

export default function KailashHub({ onBack, onEnterDharmavarsh }) {  const containerRef = useRef(null);
  const [dpr, setDpr] = useState(1);
  const [tier, setTier] = useState('high');
  
  // Ritual State
  const [burnText, setBurnText] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    }, 50);

    setGlobalMusic('kailash_winds');
  }, []);

  const handleBurn = () => {
    if (!burnText.trim()) return;
    setIsBurning(true);
    // Trigger the violent shatter after watching the Trishul spin for 2.5s
    setTimeout(() => setIsDestroyed(true), 2500); 
  };

  const handleReset = () => {
    setBurnText('');
    setIsBurning(false);
    setIsDestroyed(false);
  };

  // 🦅 MASTER SCROLL MATH (8000vh Cinematic Flight)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  // 🛑 OLD: const sp = useSpring(scrollYProgress, { stiffness: 100, damping: 40, mass: 0.5 });
  // ✅ NEW: Lightning fast, buttery response
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

  const getWaypoints = (start, end) => {
    const o = useTransform(sp, [start - 0.05, start, end, end + 0.05], [0, 1, 1, 0]);
    const y = useTransform(sp, [start - 0.05, end + 0.05], ["15vh", "-15vh"]);
    return { opacity: o, y };
  };

  // Pacing the dark obsidian glass lore cards
  const w1 = getWaypoints(0.05, 0.15); // Rudraksha Zone
  const w2 = getWaypoints(0.25, 0.35); // Crescent Moon Zone
  const w3 = getWaypoints(0.45, 0.55); // Damaru Zone
  const w4 = getWaypoints(0.65, 0.75); // Third Eye Zone
  const w5 = getWaypoints(0.85, 0.90); // The Approach

  // Altar Fades In at the very end and slides in from the right
  const altarOpacity = useTransform(sp, [0.95, 1], [0, 1]);
  const altarX = useTransform(sp, [0.95, 1], ["10vw", "0vw"]);

  return (
    <div ref={containerRef} className={`relative w-full h-[4000vh] font-sans overflow-x-hidden selection:bg-[#00ccff]/50 transition-colors duration-1000 ${isBurning && !isDestroyed ? 'bg-[#050011] animate-[shake_0.1s_ease-in-out_infinite]' : 'bg-[#023e8a]'}`}>
      
      {/* 🧭 NAVIGATION */}
      <button onClick={onBack} className="fixed top-6 left-6 z-[100] px-6 py-2 border border-white/40 bg-black/40 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all backdrop-blur-xl cursor-pointer text-white shadow-lg">
        ← Leave Kailash
      </button>
 
      {/* ☀️ DEEP STRATOSPHERE SKY GRADIENT (High Contrast for the Mountain) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isBurning ? 'opacity-0' : 'opacity-100'} bg-gradient-to-b from-[#012a5e] via-[#023e8a] to-[#4facfe]`} />
      </div>

      {/* ❄️ LAYER 1: THE FULL 3D HIMALAYAN ENVIRONMENT */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Canvas dpr={dpr}>
          <PerformanceMonitor onDecline={() => setTier('low')} onIncline={() => setTier('high')} />
          
          <ambientLight intensity={1.2} />
          {/* Dramatic sun lighting from the side to create deep shadows on the procedural mountain */}
          <directionalLight position={[30, 60, 20]} color="#ffffff" intensity={2.5} castShadow />
          <directionalLight position={[-30, 30, -20]} color="#0055ff" intensity={1} />
          
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.8} intensity={1.5} mipmapBlur />
            <Vignette eskil={false} offset={0.1} darkness={0.4} />
            {/* 🛑 CHROMATIC ABERRATION STRICTLY LOCKED TO BURN PHASE */}
            {isBurning && !isDestroyed && (
              <ChromaticAberration offset={[0.08, 0.08]} />
            )}
          </EffectComposer>

          <FlightRig scrollProgress={sp} />
          <ProceduralTerrain />
          
          {/* The Mythological 3D Waypoints properly spaced along the flight path */}
          <FloatingRudraksha position={[-8, 15, 100]} scale={1.2} />
          <FloatingCrescent position={[10, 22, 80]} scale={1.5} />
          <FloatingDamaru position={[-10, 30, 60]} scale={1.2} />
          <FloatingThirdEye position={[8, 38, 40]} scale={1.5} />
          
          {/* The Pinnacle Centerpiece */}
          <DivineTrishul isBurning={isBurning} />
          <PureDaySnow tier={tier} isBurning={isBurning} />

          {/* Cloud layers passing below the camera */}
          <Clouds material={THREE.MeshBasicMaterial}>
            <Cloud segments={20} bounds={[40, 5, 30]} volume={20} color="#ffffff" opacity={0.3} position={[0, 25, 70]} />
            <Cloud segments={20} bounds={[40, 5, 30]} volume={20} color="#ffffff" opacity={0.3} position={[0, 45, 30]} />
          </Clouds>
        </Canvas>
      </div>

      <AltitudeHUD scrollProgress={sp} />

      {/* 📜 LAYER 2: OBSIDIAN GLASS LORE CARDS (High Contrast & Legible) */}
      <div className="fixed inset-0 w-full h-screen z-20 pointer-events-none">
        
        {/* WAYPOINT 1: LEFT ALIGNED */}
        <motion.div style={{ opacity: w1.opacity, y: w1.y }} className="absolute inset-0 flex items-center justify-start px-6 md:px-24">
          <div className="w-full max-w-lg bg-[#000511]/80 border-l-4 border-[#00ccff] backdrop-blur-2xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-r-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ccff]/20 blur-[50px] rounded-full" />
            <p className="text-[#00ccff] font-mono text-xs tracking-[0.5em] uppercase mb-4 drop-shadow-md">The Axis Mundi</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-white drop-shadow-lg leading-none mb-6">
              THE ASCENT.
            </h1>
            <p className="text-sm md:text-base font-serif italic text-white/90 leading-relaxed relative z-10">
              Kailash is not just stone and ice. It is the spiritual center of the universe. To climb it is to walk inward, leaving the chaotic noise of the world far beneath the clouds.
            </p>
          </div>
        </motion.div>

        {/* WAYPOINT 2: RIGHT ALIGNED */}
        <motion.div style={{ opacity: w2.opacity, y: w2.y }} className="absolute inset-0 flex items-center justify-end px-6 md:px-24">
          <div className="w-full max-w-lg bg-[#050505]/80 border-r-4 border-white/50 backdrop-blur-2xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-l-3xl">
            <p className="text-white/60 font-mono text-xs tracking-[0.5em] uppercase mb-4 drop-shadow-md">The Principle of Vairagya</p>
            <h1 className="text-4xl md:text-5xl font-light uppercase tracking-widest text-white drop-shadow-lg leading-none mb-6">
              THE COLD.
            </h1>
            <p className="text-sm md:text-base font-sans text-white/90 leading-relaxed">
              The freezing temperature is deliberate. Heat breeds movement, attachment, and desire. The absolute zero of Kailash freezes the turbulent waves of the mind (Chitta Vritti).
            </p>
          </div>
        </motion.div>

        {/* WAYPOINT 3: LEFT ALIGNED */}
        <motion.div style={{ opacity: w3.opacity, y: w3.y }} className="absolute inset-0 flex items-center justify-start px-6 md:px-24">
          <div className="w-full max-w-lg bg-[#000511]/80 border-t border-b border-[#00ccff]/40 backdrop-blur-2xl p-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
            <p className="text-white/80 font-mono text-xs tracking-[0.5em] uppercase mb-4">The Rhythm of Existence</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[0.2em] text-[#00ccff] drop-shadow-lg leading-none mb-6">
              THE DAMARU.
            </h1>
            <p className="text-sm md:text-base font-serif italic text-white/90 leading-relaxed">
              Listen closely to the wind. Sound is the origin of creation. The Damaru beats at the exact frequency of the cosmos—the heartbeat of the universe before the algorithms took over.
            </p>
          </div>
        </motion.div>

        {/* WAYPOINT 4: RIGHT ALIGNED (THE THIRD EYE REVEAL) */}
        <motion.div style={{ opacity: w4.opacity, y: w4.y }} className="absolute inset-0 flex items-center justify-end px-6 md:px-24">
          <div className="w-full max-w-lg bg-black/80 border-l-4 border-[#b026ff] backdrop-blur-2xl p-8 shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
            <p className="text-[#b026ff] font-mono text-xs tracking-[0.5em] uppercase mb-4 drop-shadow-md">Absolute Perception</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#b026ff] drop-shadow-lg leading-none mb-4">
              THE THIRD EYE.
            </h1>
            <p className="text-sm md:text-base font-sans text-white/90 leading-relaxed">
              The two physical eyes see only Maya (illusion) and duality. The vertical Trinetra sees the absolute truth. It does not judge; it simply burns away falsehood.
            </p>
          </div>
        </motion.div>

        {/* WAYPOINT 5: CENTERED CLIMAX */}
        <motion.div style={{ opacity: w5.opacity, y: w5.y }} className="absolute inset-0 flex items-center justify-center px-6">
          <div className="text-center bg-[#000511]/60 px-12 py-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <p className="text-[#00ccff] font-mono text-sm tracking-[0.8em] uppercase mb-6 drop-shadow-lg">The Final Step</p>
            <h1 className="text-[clamp(3.5rem,8vw,8rem)] font-light uppercase tracking-[0.4em] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-none">
              THE<br/>TRISHUL.
            </h1>
          </div>
        </motion.div>
      </div>

      {/* 🧘 LAYER 3: THE CLIMAX (THE TOP-RIGHT AAHUTI RITUAL) */}
      <motion.div 
        style={{ opacity: altarOpacity, x: altarX }} 
        // ⚡ POSITIONED IN THE TOP RIGHT CORNER SO THE TRISHUL IS FULLY VISIBLE IN THE CENTER
        className="fixed top-24 right-6 md:right-12 z-30 pointer-events-none flex flex-col items-end w-full max-w-sm"
      >
        <AnimatePresence mode="wait">
          {!isDestroyed ? (
            /* THE SACRED ALTAR (Before Burn) */
            <motion.div 
              key="altar"
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              className={`bg-[#000511]/90 border-t-4 border-[#00ccff] p-8 rounded-2xl backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-full pointer-events-auto relative overflow-hidden transition-all duration-700 ${isBurning ? 'bg-[#110000]/95 scale-[1.02] border-[#ef4444]' : ''}`}
            >
              <h2 className={`font-mono text-[9px] tracking-[0.4em] uppercase mb-3 transition-colors ${isBurning ? 'text-[#ef4444]' : 'text-[#00ccff]'}`}>
                The Summit Altar
              </h2>
              <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-4">
                THE OFFERING.
              </h1>
              
              <div className="flex flex-col gap-4 w-full relative z-10">
                <input 
                  type="text"
                  value={burnText}
                  onChange={(e) => setBurnText(e.target.value)}
                  placeholder="Name your fear..."
                  disabled={isBurning}
                  className={`w-full bg-black/80 border-b-2 ${isBurning ? 'border-[#ef4444] text-[#ef4444]' : 'border-white/20 text-white'} px-4 py-3 placeholder-white/40 font-serif italic text-base focus:outline-none focus:border-[#00ccff] transition-all duration-300 disabled:opacity-50`}
                />
                
                <button 
                  onClick={handleBurn}
                  disabled={isBurning || !burnText.trim()}
                  className={`w-full py-4 font-black text-sm uppercase tracking-[0.3em] transition-all duration-300 ${isBurning ? 'bg-[#ef4444] text-white scale-95 shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 'bg-transparent border border-[#00ccff] text-[#00ccff] hover:bg-[#00ccff] hover:text-[#000511]'} disabled:opacity-30 disabled:cursor-not-allowed rounded-md`}
                >
                  {isBurning ? 'INCINERATING...' : 'BURN TO ASH'}
                </button>
              </div>
            </motion.div>
          ) : (
            /* THE SHATTER REVELATION (Fullscreen Card) */
            <motion.div 
              key="revelation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="fixed inset-0 flex flex-col items-center justify-center bg-[#000511]/90 backdrop-blur-xl z-50 pointer-events-auto"
            >
              <div className="bg-transparent border-y-4 border-[#00ccff] py-20 px-6 w-full max-w-5xl text-center shadow-[0_0_100px_rgba(0,204,255,0.1)]">
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-[0.3em] text-[#00ccff] drop-shadow-[0_0_40px_rgba(0,204,255,0.6)] mb-8">
                  ATTACHMENT SEVERED.
                </h1>
                <p className="text-lg md:text-3xl font-light text-white tracking-widest uppercase">
                  Maya is shattered. The Void Welcomes You.
                </p>
                
                {/* 🛑 CHANGED: Now triggers the prop instead of just resetting! */}
                <button 
                  onClick={onEnterDharmavarsh} 
                  className="mt-16 px-10 py-4 border border-[#00ccff]/50 text-[#00ccff] text-xs md:text-sm tracking-[0.4em] uppercase hover:bg-[#00ccff] hover:text-[#000511] transition-all shadow-[0_0_20px_rgba(0,204,255,0.2)] hover:shadow-[0_0_40px_rgba(0,204,255,0.6)]"
                >
                  Enter Dharmavarsh
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
}