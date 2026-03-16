import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { TorusKnot, Sparkles, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import CinematicCursor from './CinematicCursor';
import { setGlobalMusic } from './GlobalAudio';

// --------------------------------------------------------
// 🖼️ CINEMATIC IMAGE ENGINE (Upgraded from Placeholder)
// --------------------------------------------------------
const ImagePlaceholder = ({ title, width, height, className }) => {
  // This automatically grabs the image from your public/images folder using the title!
  // If your images are PNGs, just change the ".jpg" to ".png" here:
  const imagePath = `/${title}.png`;

  return (
    <motion.div 
      initial={{ filter: "brightness(0.5) blur(10px)" }}
      whileInView={{ filter: "brightness(1) blur(0px)" }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={`relative overflow-hidden ${width} ${height} ${className}`}
    >
      <img 
        src={imagePath} 
        alt={title} 
        className="w-full h-full object-cover rounded-2xl shadow-2xl"
      />
      {/* Adds a premium cinematic vignette/overlay on top of your image */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl pointer-events-none" />
      <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none mix-blend-overlay" />
    </motion.div>
  );
};
// --------------------------------------------------------
// 💥 CINEMATIC SFX TYPOGRAPHY ENGINE
// --------------------------------------------------------
const SFXText = ({ word, color = "ef4444" }) => (
  <motion.div 
    animate={{ 
      x: [0, -4, 4, -4, 4, 0], 
      y: [0, 4, -4, 4, -4, 0], 
      scale: [1, 1.05, 1] 
    }} 
    transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }}
    className="flex justify-center items-center w-full my-8"
  >
    <span 
      className={`text-[clamp(5rem,15vw,15rem)] font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-[#${color}] drop-shadow-[0_0_60px_rgba(0,0,0,0.8)] leading-none`}
      style={{ WebkitTextStroke: `2px #${color}` }}
    >
      {word}
    </span>
  </motion.div>
);

// --------------------------------------------------------
// ✨ THE VIVAHA (WEDDING) JOY PARTICLES
// --------------------------------------------------------
const WeddingParticles = ({ scrollProgress }) => {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!groupRef.current) return;

    // Shifted timing: Appears during Joy/Wedding scenes (0.22 to 0.28)
    if (p >= 0.22 && p < 0.28) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 2);
      groupRef.current.rotation.y += delta * 0.1;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 20, delta * 3);
    }
  });

  return (
    <group ref={groupRef} position={[0, 20, -2]}>
      <Sparkles count={200} scale={30} size={6} speed={0.8} color="#fef08a" opacity={0.8} />
      <Sparkles count={100} scale={20} size={8} speed={0.5} color="#fb7185" opacity={0.6} />
    </group>
  );
};

// --------------------------------------------------------
// 🌧️ THE EXILE RAINSTORM 
// --------------------------------------------------------
const RainStorm = ({ scrollProgress }) => {
  const rainRef = useRef();
  const count = 2000;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40, 
        y: Math.random() * 40, 
        z: (Math.random() - 0.5) * 20 - 5, 
        speed: Math.random() * 0.5 + 0.5
      });
    }
    return temp;
  }, [count]);

 useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!rainRef.current) return;

    // 🔴 THE FIX: Rain ONLY triggers between 0.50 and 0.58. Otherwise, it fades to 0!
    const targetOpacity = (p >= 0.50 && p < 0.58) ? 0.6 : 0;
    
    // Smoothly fade in and out
    rainRef.current.material.opacity = THREE.MathUtils.lerp(rainRef.current.material.opacity, targetOpacity, delta * 4);

    if (rainRef.current.material.opacity > 0.01) {
      particles.forEach((particle, i) => {
        particle.y -= particle.speed;
        if (particle.y < -10) particle.y = 20;
        dummy.position.set(particle.x, particle.y, particle.z);
        dummy.rotation.set(0, 0, 0.1); 
        dummy.scale.set(0.02, 1.5, 0.02);
        dummy.updateMatrix(); 
        rainRef.current.setMatrixAt(i, dummy.matrix);
      });
      rainRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={rainRef} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#a5b4fc" transparent opacity={0} depthWrite={false} />
    </instancedMesh>
  );
};

// --------------------------------------------------------
// 🏹 THE 3D ENGINE: MASSIVE GLOWING GOLDEN PINAKA
// --------------------------------------------------------
const ThePinaka = ({ scrollProgress, isMobile }) => {
  const bowGroup = useRef();
  const leftHalf = useRef();
  const rightHalf = useRef();
  const stringRef = useRef();
  const glowRef = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!bowGroup.current || !leftHalf.current || !rightHalf.current) return;

    // 1. MAJESTIC APPEARANCE (Shifted to cover the new 28-scene pacing)
    if (p >= 0.12 && p < 0.22) {
      // Elevated to top of screen so text stays clear at the bottom!
      bowGroup.current.position.y = THREE.MathUtils.lerp(bowGroup.current.position.y, isMobile ? 3 : 4, delta * 3);
      bowGroup.current.scale.setScalar(THREE.MathUtils.lerp(bowGroup.current.scale.x, isMobile ? 0.7 : 1.4, delta * 3));
    } else {
      bowGroup.current.position.y = THREE.MathUtils.lerp(bowGroup.current.position.y, -15, delta * 3);
      bowGroup.current.scale.setScalar(THREE.MathUtils.lerp(bowGroup.current.scale.x, 0, delta * 3));
    }

    // 2. THE SNAP PHYSICS (Snaps perfectly at 0.205 for the new pacing)
    if (p >= 0.205 && p < 0.27) { 
      if (stringRef.current) stringRef.current.visible = false;
      if (glowRef.current) glowRef.current.visible = false;
      
      // Violently rip apart and float UP/AWAY from the text
      leftHalf.current.position.x = THREE.MathUtils.lerp(leftHalf.current.position.x, -5, delta * 1.5);
      leftHalf.current.position.y = THREE.MathUtils.lerp(leftHalf.current.position.y, 6, delta * 1.5);
      leftHalf.current.rotation.z = THREE.MathUtils.lerp(leftHalf.current.rotation.z, 1.5, delta * 1.5);

      rightHalf.current.position.x = THREE.MathUtils.lerp(rightHalf.current.position.x, 5, delta * 1.5);
      rightHalf.current.position.y = THREE.MathUtils.lerp(rightHalf.current.position.y, 2, delta * 1.5);
      rightHalf.current.rotation.z = THREE.MathUtils.lerp(rightHalf.current.rotation.z, -1.5, delta * 1.5);
    } else {
      leftHalf.current.position.set(0, 0, 0); 
      leftHalf.current.rotation.set(0, 0, 0);
      rightHalf.current.position.set(0, 0, 0); 
      rightHalf.current.rotation.set(0, 0, 0);
      if (stringRef.current) stringRef.current.visible = true;
      if (glowRef.current) glowRef.current.visible = true;
    }

    // 3. AMBIENT HOVER (Breathing slowly in the void)
    if (p < 0.205) {
      bowGroup.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      bowGroup.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
      bowGroup.current.position.z = Math.sin(state.clock.elapsedTime) * 0.2; 
    }
  });

  return (
    <group ref={bowGroup} position={[0, -15, -2]} scale={0}>
      
      {/* 🔴 LEFT HALF */}
      <group ref={leftHalf}>
        {/* Main Tapered Gold Limb - NOW GLOWING */}
        <mesh position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.25, 5, 32]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.5} metalness={1} roughness={0.2} />
        </mesh>
        {/* Recurve Tip (Curved forward) - NOW GLOWING */}
        <mesh position={[-5.3, 0.3, 0]} rotation={[0, 0, Math.PI / 3]}>
          <cylinderGeometry args={[0.02, 0.08, 1.8, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.5} metalness={1} roughness={0.2} />
        </mesh>
        {/* Silver Joints & Spikes */}
        <mesh position={[-1.2, 0, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.22, 0.08, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
        <mesh position={[-3.5, 0, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.15, 0.06, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
        <mesh position={[-4.8, 0.1, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.08, 0.04, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
      </group>

      {/* 🔴 RIGHT HALF */}
      <group ref={rightHalf}>
        {/* Main Tapered Gold Limb - NOW GLOWING */}
        <mesh position={[2.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.25, 5, 32]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.5} metalness={1} roughness={0.2} />
        </mesh>
        {/* Recurve Tip - NOW GLOWING */}
        <mesh position={[5.3, 0.3, 0]} rotation={[0, 0, -Math.PI / 3]}>
          <cylinderGeometry args={[0.02, 0.08, 1.8, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.5} metalness={1} roughness={0.2} />
        </mesh>
        {/* Silver Joints & Spikes */}
        <mesh position={[1.2, 0, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.22, 0.08, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
        <mesh position={[3.5, 0, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.15, 0.06, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
        <mesh position={[4.8, 0.1, 0]} rotation={[0, Math.PI/2, 0]}><torusGeometry args={[0.08, 0.04, 16, 32]} /><meshStandardMaterial color="#e2e8f0" metalness={1} roughness={0.2} /></mesh>
      </group>

      {/* 🔴 CENTRAL GRIP */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.26, 0.26, 1.8, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 🔴 MAGICAL BLUE STRING & AURA */}
      <mesh ref={stringRef} position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 11.2, 16]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={3} transparent opacity={0.9} />
      </mesh>
      <mesh ref={glowRef} position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 11.2, 16]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

    </group>
  );
};

// --------------------------------------------------------
// 🌪️ DYNAMIC ATMOSPHERE (Pollen -> Ash -> Fire Embers)
// --------------------------------------------------------
const DynamicAtmosphere = ({ scrollProgress }) => {
  const particlesRef = useRef();
  const count = 1500;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => new Array(count).fill().map(() => ({
    x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40, z: (Math.random() - 0.5) * 20 - 5, 
    speed: Math.random() * 0.2 + 0.1, factor: Math.random() * 2
  })), [count]);

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!particlesRef.current) return;

    let speedMult = 0; let direction = -1; let targetColor = new THREE.Color("#000000"); let targetOpacity = 0;

    if (p < 0.58) {
      targetOpacity = 0; // Invisible in Phase 1
    } 
    else if (p >= 0.58 && p < 0.653) {
      // 🍃 The Forest (Green/Gold Pollen)
      speedMult = 0.5; targetColor.set("#4ade80"); targetOpacity = 0.5;
    } 
    else if (p >= 0.653 && p < 0.717) {
      // 🩸 Surpanakha Rage (Red Sparks)
      speedMult = 1.5; direction = 1; targetColor.set("#ef4444"); targetOpacity = 0.7;
    } 
    else if (p >= 0.717 && p < 0.763) {
      // ✨ Golden Deer (Hypnotic, slow, bright gold dust)
      speedMult = 0.2; targetColor.set("#fef08a"); targetOpacity = 0.8;
    } 
    else if (p >= 0.763 && p < 0.875) {
      // 🌑 🔴 EXTENDED: Abduction & Grief (Cold, heavy dead ash)
      speedMult = 0.1; targetColor.set("#6b7280"); targetOpacity = 0.6;
    } 
    else if (p >= 0.875 && p < 0.933) {
      // ⛰️ 🔴 SHIFTED: Kishkindha (Minimal earthy dust)
      speedMult = 0.3; targetColor.set("#fdba74"); targetOpacity = 0.4;
    } 
    else if (p >= 0.933) {
      // 🔥 Hanuman (Violent Rising Saffron Fire)
      speedMult = 6.0; direction = 1; targetColor.set("#f97316"); targetOpacity = 0.9;
    }

    particlesRef.current.material.color.lerp(targetColor, delta * 3);
    particlesRef.current.material.opacity = THREE.MathUtils.lerp(particlesRef.current.material.opacity, targetOpacity, delta * 3);
    if (targetOpacity > 0.05) {
      particles.forEach((particle, i) => {
        particle.y += (particle.speed * speedMult * direction * delta * 10);
        if (direction === -1 && particle.y < -20) particle.y = 20;
        if (direction === 1 && particle.y > 20) particle.y = -20;
        const wind = Math.sin(state.clock.elapsedTime * 0.5 + particle.factor) * 0.05;
        particle.x += wind;
        dummy.position.set(particle.x, particle.y, particle.z);
        dummy.scale.set(0.05, speedMult > 2 ? 0.2 : 0.05, 0.05);
        dummy.updateMatrix(); particlesRef.current.setMatrixAt(i, dummy.matrix);
      });
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={particlesRef} args={[null, null, count]}>
      <boxGeometry args={[1, 1, 1]} />
<meshBasicMaterial color="#000000" transparent depthWrite={false} blending={THREE.AdditiveBlending} />    </instancedMesh>
  );
};

// --------------------------------------------------------
// 🔨 THE 3D ENGINE: HANUMAN'S MASSIVE GLOWING GADA
// --------------------------------------------------------
const TheGada = ({ scrollProgress, isMobile }) => {
  const gadaGroup = useRef();
  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!gadaGroup.current) return;
    if (p >= 0.945) { // 🔴 TIMING FIXED! Drops EXACTLY when Hanuman's name appears.
      gadaGroup.current.position.y = THREE.MathUtils.lerp(gadaGroup.current.position.y, isMobile ? 2 : 0, delta * 4);
      gadaGroup.current.scale.setScalar(THREE.MathUtils.lerp(gadaGroup.current.scale.x, isMobile ? 0.8 : 1.5, delta * 4));
      gadaGroup.current.rotation.y += delta * 0.5;
      gadaGroup.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      gadaGroup.current.position.x = THREE.MathUtils.lerp(gadaGroup.current.position.x, isMobile ? 0 : 3, delta * 2);
    } else {
      gadaGroup.current.position.y = THREE.MathUtils.lerp(gadaGroup.current.position.y, 25, delta * 2);
      gadaGroup.current.scale.setScalar(THREE.MathUtils.lerp(gadaGroup.current.scale.x, 0, delta * 2));
    }
  });

  return (
    <group ref={gadaGroup} position={[0, 25, -2]} scale={0} rotation={[0.2, 0, 0.2]}>
      <mesh position={[0, 2, 0]}><sphereGeometry args={[1.2, 32, 32]} /><meshStandardMaterial color="#fbbf24" emissive="#ea580c" emissiveIntensity={1.5} metalness={0.8} roughness={0.2} /></mesh>
      <mesh position={[0, 2, 0]}><sphereGeometry args={[1.4, 32, 32]} /><meshStandardMaterial color="#f97316" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh position={[0, 2, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[1.25, 0.1, 16, 32]} /><meshStandardMaterial color="#ffffff" emissive="#fbbf24" emissiveIntensity={2} /></mesh>
      <mesh position={[0, 2, 0]} rotation={[0, 0, Math.PI/2]}><torusGeometry args={[1.25, 0.1, 16, 32]} /><meshStandardMaterial color="#ffffff" emissive="#fbbf24" emissiveIntensity={2} /></mesh>
      <mesh position={[0, -1.5, 0]}><cylinderGeometry args={[0.2, 0.3, 5, 32]} /><meshStandardMaterial color="#111111" metalness={0.9} roughness={0.4} /></mesh>
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.25, 0.05, 16, 32]} /><meshStandardMaterial color="#fbbf24" /></mesh>
      <mesh position={[0, -2.5, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.28, 0.08, 16, 32]} /><meshStandardMaterial color="#fbbf24" /></mesh>
      <mesh position={[0, -4, 0]}><sphereGeometry args={[0.5, 32, 32]} /><meshStandardMaterial color="#fbbf24" emissive="#ea580c" emissiveIntensity={1} /></mesh>
    </group>
  );
};

// --------------------------------------------------------
// 🌑 THE ABDUCTION: SWIRLING DARK MATTER
// --------------------------------------------------------
const DarkMatter = ({ scrollProgress }) => {
  const groupRef = useRef();
  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!groupRef.current) return;
    
    // Appears exactly when Ravana strikes (0.70 to 0.82)
    if (p >= 0.70 && p < 0.82) {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 1, delta * 2));
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.rotation.z -= delta * 0.2;
    } else {
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, 0, delta * 5));
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -3]} scale={0}>
      <TorusKnot args={[3, 0.5, 128, 16]} position={[0,0,0]}>
        <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} wireframe={true} transparent opacity={0.3} />
      </TorusKnot>
      <TorusKnot args={[4, 0.2, 128, 16]} position={[0,0,0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.5} wireframe={true} transparent opacity={0.15} emissive="#ef4444" emissiveIntensity={0.5}/>
      </TorusKnot>
    </group>
  );
};

// --------------------------------------------------------
// ⛰️ KISHKINDHA: FLOATING MOUNTAIN DEBRIS
// --------------------------------------------------------
const FloatingRocks = ({ scrollProgress, isMobile }) => {
  const groupRef = useRef();
  useFrame((state, delta) => {
    const p = scrollProgress.get();
    if (!groupRef.current) return;
    
    // Appears during the Kishkindha mountains (0.82 to 0.93)
    if (p >= 0.82 && p < 0.93) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 2);
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x += delta * (0.1 + i * 0.05);
        child.rotation.y += delta * (0.2 + i * 0.02);
        child.position.y += Math.sin(state.clock.elapsedTime + i) * 0.005;
      });
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -20, delta * 2);
    }
  });

  return (
    
    <group ref={groupRef} position={[0, -20, -5]}>
      {/* 🪨 ROCK 1: Light gray with a subtle orange-brown emissive glow! */}
      <mesh position={[-4, 2, -2]} scale={isMobile ? 0.5 : 1}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.7} metalness={0.2} emissive="#291c13" emissiveIntensity={0.5} />
      </mesh>

      {/* 🪨 ROCK 2: The darker core rock, still catches the edge glow! */}
      <mesh position={[5, -2, -4]} scale={isMobile ? 0.7 : 1.5}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.8} metalness={0.1} emissive="#291c13" emissiveIntensity={0.4} />
      </mesh>

      {/* 🪨 ROCK 3: The lightest rock to catch the main point light! */}
      <mesh position={[-3, -3, -1]} scale={isMobile ? 0.4 : 0.8}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.6} metalness={0.3} emissive="#291c13" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
  
};

// --------------------------------------------------------
// 👑 CROWN & DYNAMIC DODGING
// --------------------------------------------------------
const RamaMatrixScene = ({ scrollProgress, isMobile }) => {
  const crownRef = useRef();
  const sparkleRef = useRef();

  useFrame((state, delta) => {
    const p = scrollProgress.get();
    
    if (crownRef.current) {
      let targetX = 0; let targetY = 0;

      if (p < 0.03) { targetX = -4; targetY = 0; } 
      else if (p >= 0.03 && p < 0.05) { targetX = -5; targetY = 0; } 
      else if (p >= 0.05 && p < 0.07) { targetX = -4; targetY = 0; } 
      else if (p >= 0.07 && p < 0.11) { targetX = 4; targetY = 0; } 
      else if (p >= 0.11 && p < 0.24) { targetX = 0; targetY = -20; } // Hide for Bow
      else if (p >= 0.24 && p < 0.285) { targetX = 3; targetY = 0; } // Wedding
      else if (p >= 0.285 && p < 0.50) { targetX = isMobile ? 0 : 4; targetY = -1.5; } // Betrayal
      else if (p >= 0.50) { targetX = 0; targetY = -20; } // Exile & Phase 2

      crownRef.current.position.x = THREE.MathUtils.lerp(crownRef.current.position.x, targetX, delta * 2);
      crownRef.current.position.y = THREE.MathUtils.lerp(crownRef.current.position.y, targetY, delta * 2);

      if (p < 0.285) { 
        crownRef.current.rotation.y -= delta * 0.2;
        crownRef.current.rotation.x = THREE.MathUtils.lerp(crownRef.current.rotation.x, 0, delta);
        crownRef.current.material.emissive.setHex(0xfbbf24);
        crownRef.current.material.emissiveIntensity = 0.4;
      } else if (p >= 0.285 && p < 0.50) { 
        crownRef.current.rotation.x = THREE.MathUtils.lerp(crownRef.current.rotation.x, 1.5, delta * 2);
        crownRef.current.material.emissive.setHex(0xef4444); 
        crownRef.current.material.emissiveIntensity = 1.0; 
      }
    }

    if (sparkleRef.current) {
      if (p > 0.20 && p < 0.23) {
        sparkleRef.current.scale.setScalar(THREE.MathUtils.lerp(sparkleRef.current.scale.x, 2.5, delta * 5));
      } else {
        sparkleRef.current.scale.setScalar(THREE.MathUtils.lerp(sparkleRef.current.scale.x, 1, delta * 2));
      }
    }
  });

  return (
    <group position={[0, 0, -5]}>
      <TorusKnot ref={crownRef} args={[1.5, 0.3, 256, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} />
      </TorusKnot>
      <group ref={sparkleRef}>
        <Sparkles count={isMobile ? 150 : 300} scale={25} size={isMobile ? 2 : 4} speed={0.4} color="#fef08a" opacity={0.6} />
      </group>
      <Stars radius={50} depth={50} count={1000} factor={2} saturation={1} fade speed={1} />
      <ThePinaka scrollProgress={scrollProgress} isMobile={isMobile} />
      <WeddingParticles scrollProgress={scrollProgress} />
    </group>
  );
};
// --------------------------------------------------------
// 💡 DYNAMIC LIGHTING
// --------------------------------------------------------
const SceneLights = ({ scrollProgress }) => {
  const ambientRef = useRef(); 
  const point1Ref = useRef();
  
useFrame((state, delta) => {
    const p = scrollProgress.get();
    
    let ambientHex = "#020617"; let p1Hex = "#fbbf24"; let intensity1 = 20.0;
    
    // --- PHASE 1 LIGHTS ---
    if (p >= 0.20 && p < 0.22) { ambientHex = "#ffffff"; p1Hex = "#ffffff"; intensity1 = 50.0; } // Snap
    else if (p >= 0.22 && p < 0.285) { ambientHex = "#1e1b4b"; p1Hex = "#fbbf24"; intensity1 = 30.0; } // Wedding
    else if (p >= 0.285 && p < 0.50) { ambientHex = "#1a0000"; p1Hex = "#ef4444"; intensity1 = 15.0; } // Poison
    else if (p >= 0.50 && p < 0.58) { ambientHex = "#01050a"; p1Hex = "#a5b4fc"; intensity1 = 8.0; } // Exile

    // --- PHASE 2 DYNAMIC VIBE LIGHTS ---
    else if (p >= 0.58 && p < 0.653) { ambientHex = "#064e3b"; p1Hex = "#fbbf24"; intensity1 = 15.0; } // Forest Green
    else if (p >= 0.653 && p < 0.716) { ambientHex = "#450a0a"; p1Hex = "#ef4444"; intensity1 = 25.0; } // 🔴 EXTENDED: Surpanakha Crimson
    else if (p >= 0.716 && p < 0.763) { ambientHex = "#422006"; p1Hex = "#fef08a"; intensity1 = 35.0; } // 🔴 SHIFTED: Deer/Illusion Gold
    else if (p >= 0.763 && p < 0.823) { ambientHex = "#000000"; p1Hex = "#ffffff"; intensity1 = 5.0; } // Abduction Pitch Black
    else if (p >= 0.823 && p < 0.865) { ambientHex = "#030712"; p1Hex = "#60a5fa"; intensity1 = 10.0; } // Crying Cold Blue
    else if (p >= 0.865 && p < 0.933) { ambientHex = "#291c13"; p1Hex = "#fb923c"; intensity1 = 20.0; } // Kishkindha Earthy
    else if (p >= 0.933) { ambientHex = "#450a0a"; p1Hex = "#f97316"; intensity1 = 60.0; } // Hanuman Saffron

    if (ambientRef.current) ambientRef.current.color.lerp(new THREE.Color(ambientHex), delta * 4);
    if (point1Ref.current) {
      point1Ref.current.color.lerp(new THREE.Color(p1Hex), delta * 4);
      point1Ref.current.intensity = THREE.MathUtils.lerp(point1Ref.current.intensity, intensity1, delta * 4);
    }
  });
  
  return (
    <>
      <ambientLight ref={ambientRef} intensity={2.0} />
      <pointLight ref={point1Ref} position={[5, 5, 5]} distance={50} />
      <pointLight color="#020617" position={[-5, -5, -5]} distance={50} intensity={10.0} />
    </>
  );
};
const RamaEffects = ({ isMobile }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || isMobile) return null;
  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.2} intensity={2.0} mipmapBlur={true} />
      <Noise opacity={0.3} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.4} darkness={0.8} />
    </EffectComposer>
  );
};

// --------------------------------------------------------
// 🎵 CINEMATIC MULTI-TRACK AUDIO ENGINE
// --------------------------------------------------------
// Remove the `soundOn` prop, it will grab the state globally now!
const CinematicAudioEngine = ({ scrollProgress }) => { 
  const [soundOn, setSoundOn] = useState(false);  const tracks = {
    // --- PHASE 1 ---
    ayodhya_majestic: useRef(typeof Audio !== "undefined" ? new Audio('/audio/1a_ayodhya_majestic.mp3') : null),
    poison_tension: useRef(typeof Audio !== "undefined" ? new Audio('/audio/1b_poison_tension.mp3') : null),
    exile_sadness: useRef(typeof Audio !== "undefined" ? new Audio('/audio/1c_exile_sadness.mp3') : null),
    
    // --- PHASE 2 ---
    forest: useRef(typeof Audio !== "undefined" ? new Audio('/audio/2_forest_peace.mp3') : null),
    surpanakha: useRef(typeof Audio !== "undefined" ? new Audio('/audio/3_red_tension.mp3') : null),
    deer: useRef(typeof Audio !== "undefined" ? new Audio('/audio/4_golden_mesmerizing.mp3') : null),
    abduction: useRef(typeof Audio !== "undefined" ? new Audio('/audio/5_void_terror.mp3') : null),
    grief: useRef(typeof Audio !== "undefined" ? new Audio('/audio/6_cold_grief.mp3') : null),
    kishkindha: useRef(typeof Audio !== "undefined" ? new Audio('/audio/7_mountain_mystery.mp3') : null),
    hanuman: useRef(typeof Audio !== "undefined" ? new Audio('/audio/8_hanuman_epic.mp3') : null),
  };

  // 2. SFX References 💥
  const slashSfx = useRef(typeof Audio !== "undefined" ? new Audio('/audio/sfx_slash.mp3') : null);
  const boomSfx = useRef(typeof Audio !== "undefined" ? new Audio('/audio/sfx_boom.mp3') : null);

  const hasPlayedSlash = useRef(false);
  const hasPlayedBoom = useRef(false);

 useEffect(() => {
    // 1. Tell GlobalAudio to step aside when this page loads!
    window.dispatchEvent(new CustomEvent('switchTrack', { detail: 'rama_cinematic' }));

    // 2. Loop all BGM tracks
    Object.values(tracks).forEach(trackRef => {
      if (trackRef.current) trackRef.current.loop = true;
    });

    // 3. Listen for the user clicking the global Sound On/Off button
    const handleSync = (e) => setSoundOn(e.detail);
    window.addEventListener('syncAudioState', handleSync);
    
    return () => window.removeEventListener('syncAudioState', handleSync);
  }, []);
  // 3. The Smart DJ Scroll Listener
  useMotionValueEvent(scrollProgress, "change", (p) => {
    if (!soundOn) {
      Object.values(tracks).forEach(t => { if (t.current) { t.current.volume = 0; t.current.pause(); }});
      return;
    }

    let activeTrack = 'ayodhya_majestic';
    
    // --- PHASE 1 MATH (The Fall of Ayodhya) ---
    if (p < 0.285) activeTrack = 'ayodhya_majestic';                 // Golden Ayodhya & The Wedding
    else if (p >= 0.285 && p < 0.49) activeTrack = 'poison_tension'; // Manthara's Poison & The Debt
    else if (p >= 0.49 && p < 0.58) activeTrack = 'exile_sadness';   // Leaving the city barefoot

    // --- PHASE 2 MATH (The Abyss) ---
    else if (p >= 0.58 && p < 0.653) activeTrack = 'forest';         // Peaceful Green
    else if (p >= 0.653 && p < 0.716) activeTrack = 'surpanakha';    // Blood Red Panic
    else if (p >= 0.716 && p < 0.763) activeTrack = 'deer';          // Sickly Gold
    else if (p >= 0.763 && p < 0.823) activeTrack = 'abduction';     // Pitch Black Terror
    else if (p >= 0.823 && p < 0.875) activeTrack = 'grief';         // Cold Weeping Blue
    else if (p >= 0.875 && p < 0.933) activeTrack = 'kishkindha';    // Earthy Mountain
    else if (p >= 0.933) activeTrack = 'hanuman';                    // Blazing Saffron

    // Play the active track, mute the rest
    Object.keys(tracks).forEach(key => {
      const audio = tracks[key].current;
      if (!audio) return;

      if (key === activeTrack) {
        if (audio.paused) audio.play();
        audio.volume = 0.6; // Target volume
      } else {
        audio.volume = 0;
      }
    });

    // --- 💥 SFX TRIGGER LOGIC ---
    if (p > 0.72 && p < 0.75 && !hasPlayedSlash.current) {
      if (slashSfx.current) { slashSfx.current.currentTime = 0; slashSfx.current.play(); }
      hasPlayedSlash.current = true;
    } else if (p < 0.70) hasPlayedSlash.current = false;

    if (p > 0.985 && !hasPlayedBoom.current) {
      if (boomSfx.current) { boomSfx.current.currentTime = 0; boomSfx.current.play(); }
      hasPlayedBoom.current = true;
    } else if (p < 0.95) hasPlayedBoom.current = false;
  });

  return null; 
};

// --------------------------------------------------------
// 👑 MAIN EDITORIAL COMPONENT
// --------------------------------------------------------
export default function RamaLore({ onBack }) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); const checkMobile = () => setIsMobile(window.innerWidth < 768); checkMobile(); window.addEventListener('resize', checkMobile); return () => window.removeEventListener('resize', checkMobile); }, []);
  useEffect(() => { setGlobalMusic('rama_cinematic'); }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });

 // 🩸 STRICT CONTINUOUS BACKGROUND CONTROL (Mapped to exact Phase 2 emotional beats!)
  const bgColor = useTransform(sp, 
    [
      // Phase 1 Timestamps
      0.0, 0.285, 0.295, 0.49, 0.51, 0.57,
      // Phase 2 Timestamps
      0.58, 0.65, // Dandaka Forest (Deep Green)
      0.66, 0.716, // 🔴 EXTENDED: Surpanakha (Deep Blood Red)
      0.71, 0.76, // Golden Deer (Sickly Brown/Gold)
      0.77, 0.82, // The Abduction (Pitch Black Void)
      0.83, 0.87, // Crying/Madness (Cold, Dead Grey/Blue)
      0.88, 0.93, // Kishkindha (Earthy Mountain Brown)
      0.94, 1.00  // Hanuman (Blazing Saffron)
    ], 
    [
      // Phase 1 Colors
      "#020617", "#020617", "#1a0000", "#1a0000", "#01050a", "#01050a",
      // Phase 2 Colors
      "#022c22", "#022c22", // Forest
      "#2a0a0a", "#2a0a0a", // Surpanakha
      "#291500", "#291500", // Deer
      "#000000", "#000000", // Abduction
      "#080c16", "#080c16", // Madness
      "#1c1511", "#1c1511", // Kishkindha
      "#2a0604", "#450a0a"  // Hanuman
    ]
  );

  // 🎬 PERFECT PACING MATH (Now explicitly 28 scenes long)
  const o = (start, peak1, peak2, end) => {
    const safeFadeIn = start + 0.005; 
    const safeFadeOutStart = peak2 - 0.005; 
    const safeFadeOutEnd = peak2 - 0.001; 
    return useTransform(sp, [start, safeFadeIn, safeFadeOutStart, safeFadeOutEnd], [0, 1, 1, 0]);
  };
  
  const s1 = o(0.00, 0.01, 0.02, 0.03); const s2 = o(0.02, 0.03, 0.04, 0.05); const s3 = o(0.04, 0.05, 0.06, 0.07); 
  const s4 = o(0.06, 0.07, 0.08, 0.09); const s5 = o(0.08, 0.09, 0.10, 0.11); const s6 = o(0.10, 0.11, 0.12, 0.13); 
  const s7 = o(0.12, 0.13, 0.14, 0.15); const s8 = o(0.14, 0.15, 0.16, 0.17); const s9 = o(0.16, 0.17, 0.18, 0.19); 
  const s10 = o(0.18, 0.19, 0.20, 0.21); const s11 = o(0.20, 0.21, 0.22, 0.23); const s12 = o(0.22, 0.23, 0.24, 0.25); 
  const s13 = o(0.24, 0.25, 0.26, 0.27); const s14 = o(0.26, 0.27, 0.28, 0.29); const s15 = o(0.28, 0.29, 0.30, 0.31); 
  const s16 = o(0.30, 0.31, 0.32, 0.33); const s17 = o(0.32, 0.33, 0.34, 0.35); const s18 = o(0.34, 0.35, 0.36, 0.37); 
  const s19 = o(0.36, 0.37, 0.38, 0.39); const s20 = o(0.38, 0.39, 0.40, 0.41); const s21 = o(0.40, 0.41, 0.42, 0.43); 
  const s22 = o(0.42, 0.43, 0.44, 0.45); const s23 = o(0.44, 0.45, 0.46, 0.47); const s24 = o(0.46, 0.47, 0.48, 0.49); 
  const s25 = o(0.48, 0.49, 0.50, 0.51); const s26 = o(0.50, 0.51, 0.52, 0.53); const s27 = o(0.52, 0.53, 0.54, 0.55); 
  const s28 = o(0.54, 0.55, 0.56, 0.57);

  const driftUp = (start, end) => useTransform(sp, [start, end], ["10vh", "-10vh"]);
  const driftDown = (start, end) => useTransform(sp, [start, end], ["-10vh", "10vh"]);
  const offsetLeft = isMobile ? "2vw" : "15vw"; const offsetRight = isMobile ? "-2vw" : "-15vw";
// 🎬 PHASE 2 EXTENDED MATH (Flawless Cinematic Fades!)
  const getP2 = (index) => {
    // Giving each scene a slightly bigger slice of the scroll
    const start = 0.585 + index * 0.0088; 
    const peak1 = start + 0.0025;  // 1. Beautiful, slow fade IN
    const peak2 = start + 0.0065;  // 2. Holds perfectly on screen
    const end = start + 0.0088;    // 3. Beautiful, slow fade OUT
    // 🔴 THE FIX: Bypassing the old o() function so the math doesn't overlap and snap!
    return useTransform(sp, [start, peak1, peak2, end], [0, 1, 1, 0]);
  };

  const s29 = getP2(0);  const s30 = getP2(1);  const s31 = getP2(2);  const s32 = getP2(3);
  const s33 = getP2(4);  const s34 = getP2(5);  const s35 = getP2(6);  const s36 = getP2(7);
  const s37 = getP2(8);  const s38 = getP2(9);  const s39 = getP2(10); const s40 = getP2(11);
  const s41 = getP2(12); const s42 = getP2(13); const s43 = getP2(14); const s44 = getP2(15);
  const s45 = getP2(16); const s46 = getP2(17); const s47 = getP2(18); const s48 = getP2(19);
  const s49 = getP2(20); const s50 = getP2(21); const s51 = getP2(22); const s52 = getP2(23);
  const s53 = getP2(24); const s54 = getP2(25); const s55 = getP2(26); const s56 = getP2(27);
  const s57 = getP2(28); const s58 = getP2(29); const s59 = getP2(30); const s60 = getP2(31);
  const s61 = getP2(32); const s62 = getP2(33); const s63 = getP2(34); const s64 = getP2(35);
  const s65 = getP2(36); const s66 = getP2(37); const s67 = getP2(38); const s68 = getP2(39);
  const s69 = getP2(40); const s70 = getP2(41); const s71 = getP2(42); const s72 = getP2(43);
  const s73 = getP2(44); const s74 = getP2(45); const s75 = getP2(46);

  // ⚠️ CHANGE THIS DIV HEIGHT FROM 25000vh TO 35000vh!
  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[50000vh] font-sans text-white selection:bg-[#fbbf24]/30">
      <div className="hidden md:block"><CinematicCursor /></div>
      <button onClick={onBack} className="fixed top-4 left-4 md:top-6 md:left-6 z-[100] px-4 md:px-6 py-2 border border-[#fbbf24]/50 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-[#fbbf24]/20 transition-all text-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.2)] backdrop-blur-md">
        &larr; Return to Astrolabe
      </button>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, isMobile ? 12 : 8], fov: 60 }}>
          <SceneLights scrollProgress={sp} />
          <RamaMatrixScene scrollProgress={sp} isMobile={isMobile} />
          <RainStorm scrollProgress={sp} />
          
          {/* Phase 2 Objects */}
          <DynamicAtmosphere scrollProgress={sp} />
          <TheGada scrollProgress={sp} isMobile={isMobile} />
          {/* 🌑 THE NEW PROPS: Dark Matter & Mountain Debris! ⛰️ */}
          <DarkMatter scrollProgress={sp} />
          <FloatingRocks scrollProgress={sp} isMobile={isMobile} />
          {/* ✂️ EXACTLY ONE EFFECTS COMPOSER AT THE VERY END */}
          <RamaEffects isMobile={isMobile} />
        </Canvas>
      </div>
   
{/* The Audio Engine! */}
<CinematicAudioEngine scrollProgress={sp} />
      <motion.div className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* S1: Hook */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.03) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(10rem,30vw,30rem)] font-black text-white/[0.06] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none">TRETA</span>
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-xs md:text-sm font-mono tracking-[0.6em] text-[#fbbf24] uppercase mb-4">Record 07 // The Second Age</p>
            <h2 className="text-[clamp(3.5rem,10vw,10rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_40px_rgba(251,191,36,0.4)] leading-none max-w-[90vw] break-words">TRETA YUGA</h2>
          </div>
        </motion.div>

        {/* S2: Ayodhya Base */}
        <motion.div style={{ opacity: s2, x: offsetLeft }} className="absolute inset-0 flex flex-col md:flex-row-reverse items-center justify-end text-right px-6 md:px-24">
          <div className="z-10 max-w-xl md:ml-12 text-left md:text-right">
            <h3 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-[#fbbf24] mb-2 leading-none">AYODHYA.</h3>
            <p className="text-xl md:text-3xl font-light text-white/80 leading-relaxed mt-4">The pinnacle of civilization. Ruled by King Dasharatha.</p>
          </div>
          <ImagePlaceholder title="AYODHYA_CITY" width="w-[80vw] md:w-[450px]" height="h-[300px]" className="mt-8 md:mt-0 rounded-2xl" />
        </motion.div>

        {/* S3: The Mothers */}
        <motion.div style={{ opacity: s3, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-3xl leading-relaxed border-r-4 border-[#fbbf24] pr-6">
            An empire held together by Dasharatha and his three Queens: <span className="font-bold text-[#fbbf24]">Kausalya, Kaikeyi, and Sumitra.</span>
          </p>
        </motion.div>

        {/* S4: The Brothers */}
        <motion.div style={{ opacity: s4, y: driftUp(0.06, 0.09) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
           <p className="text-lg md:text-xl font-mono tracking-[0.4em] uppercase text-white/50 mb-8">Four heirs born of sacred fire:</p>
           <h2 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-white/70 leading-tight max-w-[90vw]">SHATRUGHNA.<br/>LAKSHMANA.<br/>BHARATA.</h2>
        </motion.div>

        {/* S5: Rama Reveal */}
        <motion.div style={{ opacity: s5, y: driftDown(0.08, 0.11) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(10rem,35vw,35rem)] font-black text-[#F8F8F8]/[0.1] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none mt-12">VISHNU</span>
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-xl md:text-3xl font-serif italic text-[#fbbf24] mb-4">And Kausalya's eldest.</p>
            <h1 className="text-[clamp(6rem,18vw,18rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_80px_rgba(251,191,36,0.6)] leading-none max-w-[90vw]">RAMA.</h1>
          </div>
        </motion.div>

        {/* S6: The Vibe */}
        <motion.div style={{ opacity: s6, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white max-w-3xl leading-relaxed bg-[#020617]/50 p-6 border-l-4 border-[#fbbf24] backdrop-blur-md">
            The citizens worshipped his footsteps. Unmatched in brutal warfare, yet devastatingly gentle. Where Rama walked, <span className="text-[#fbbf24] font-bold">Lakshmana</span> followed with fierce respect.
          </p>
        </motion.div>

        {/* S7: The Swayamvar Starts */}
        <motion.div style={{ opacity: s7, y: driftUp(0.12, 0.15) }} className="absolute inset-0 flex flex-col justify-end items-center text-center pb-[15vh] px-6 md:px-24 z-10">
          <p className="text-xl md:text-3xl font-light text-white/80 max-w-2xl leading-relaxed mb-4">To claim Princess Sita, a divine challenge is set.</p>
                    <ImagePlaceholder title="PINAKA" color="3b82f6" width="w-[85vw] md:w-[450px]" height="h-[20vh] md:h-[20vh] min-h-[100px]" className="mb-4 md:mb-6 rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.4)] shrink-0 object-cover" />

          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-tighter text-[#fbbf24] leading-none max-w-[90vw]">THE PINAKA.</h2>

          <p className="text-lg md:text-2xl font-serif italic text-white/60 mt-4">The colossal bow of Lord Shiva.</p>
        </motion.div>

        {/* S8: Warlords Fail */}
        <motion.div style={{ opacity: s8, y: driftDown(0.14, 0.17) }} className="absolute inset-0 flex flex-col justify-end items-center text-center pb-[10vh] px-6 md:px-24 z-10">
          <ImagePlaceholder title="WARLORDS_RED_FACES" color="ef4444" width="w-[80vw] md:w-[400px]" height="h-[200px]" className="mb-6 rounded-2xl shrink-0" />
          <p className="text-2xl md:text-4xl font-serif italic text-white/80 max-w-3xl leading-relaxed">
            Warlords tried to lift it. Demons tried to lift it. Arrogant kings fell to their knees in humiliation.<br/>
            <span className="text-white font-black not-italic">NO ONE COULD.</span>
          </p>
        </motion.div>

        {/* S9: NEW SCENE - The Approach */}
        <motion.div style={{ opacity: s9, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-end items-start text-left pb-[15vh] px-6 md:px-24 z-10">
          <h3 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-white mb-4 leading-tight max-w-[90vw] break-words">
            THEN, RAMA APPROACHES.
          </h3>
          <p className="text-xl md:text-3xl font-serif italic text-white/70">
            The court falls entirely silent.
          </p>
        </motion.div>

        {/* S10: NEW SCENE - The Lift (Perfect Viewport Scaling) */}
        <motion.div style={{ opacity: s10, y: driftUp(0.18, 0.21) }} className="absolute inset-0 flex flex-col justify-center items-center text-center pt-[30vh] px-6 md:px-24 z-10">
           <ImagePlaceholder title="RAMA_LIFTING_BOW" color="3b82f6" width="w-[85vw] md:w-[450px]" height="h-[25vh] md:h-[35vh] min-h-[150px]" className="mb-4 md:mb-6 rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.4)] shrink-0 object-cover" />
           <p className="text-lg md:text-2xl font-light text-white/90 w-full max-w-3xl">
             He does not struggle. He lifts the divine weapon with quiet, absolute capability.
           </p>
        </motion.div>

        {/* S11: IT SNAPS */}
        <motion.div style={{ opacity: s11, y: driftDown(0.20, 0.23) }} className="absolute inset-0 flex flex-col justify-end items-center text-center pb-[15vh] px-6 z-10">
          <motion.h2 animate={{ x: [0, -10, 10, -10, 10, -5, 5, 0], y: [0, 5, -5, 5, -5, 2, -2, 0], filter: ["blur(0px)", "blur(4px)", "blur(0px)"] }} transition={{ repeat: Infinity, duration: 0.15, ease: "linear" }} className="text-[clamp(6rem,18vw,18rem)] font-black uppercase tracking-widest text-white drop-shadow-[0_0_100px_rgba(255,255,255,1)] leading-none max-w-[90vw]">
            AND IT SNAPS.
          </motion.h2>
        </motion.div>

        {/* S12: The Joy */}
        <motion.div style={{ opacity: s12, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-3xl leading-relaxed drop-shadow-lg">
            A blinding flash. The cosmos shakes. He claims Sita, and the empire erupts in absolute joy.
          </p>
        </motion.div>

        {/* S13: The Marriage */}
        <motion.div style={{ opacity: s13, y: driftUp(0.24, 0.27) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white/90 max-w-4xl leading-relaxed mb-8 drop-shadow-lg">The tension clears. The cosmos celebrates the divine union.</p>
          <ImagePlaceholder title="VIVAHA_SCENE" color="fef08a" width="w-[80vw] md:w-[600px]" height="h-[350px]" className="rounded-xl shadow-[0_0_60px_rgba(251,191,36,0.3)] shrink-0" />
        </motion.div>

        {/* S14: The Homecoming */}
        <motion.div style={{ opacity: s14, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <ImagePlaceholder title="AYODHYA_CELEBRATION" color="fbbf24" width="w-[80vw] md:w-[500px]" height="h-[250px]" className="mb-6 rounded-xl shrink-0" />
          <h3 className="text-[clamp(2.5rem,5vw,5rem)] font-black uppercase tracking-widest text-[#fbbf24] leading-none">THE PERFECT RETURN.</h3>
          <p className="text-xl md:text-3xl font-light text-white/80 max-w-2xl mt-4">Ayodhya is adorned in gold. The era of Rama is about to begin.</p>
        </motion.div>

        {/* S15: The Poison Starts (RED BEGINS EXACTLY HERE) */}
        <motion.div style={{ opacity: s15, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-[#ef4444] drop-shadow-[0_0_40px_rgba(239,68,68,0.4)] leading-none">BUT IN THE SHADOWS...</h2>
        </motion.div>

        {/* S16: Manthara */}
        <motion.div style={{ opacity: s16, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <div className="flex flex-col md:flex-row-reverse items-center md:items-end w-full max-w-full md:max-w-[80vw]">
            <ImagePlaceholder title="MANTHARA_POISON" color="ef4444" width="w-[80vw] md:w-[350px]" height="h-[200px] md:h-[250px]" className="mb-6 md:mb-0 md:ml-8 rounded-2xl shrink-0" />
            <div className="w-full max-w-xl bg-[#1a0000]/80 p-6 md:p-8 border-r-4 border-[#ef4444] backdrop-blur-md">
              <p className="text-lg md:text-2xl font-light text-white leading-relaxed mb-4">
                <span className="font-bold text-[#ef4444]">Manthara</span>, a bitter servant, drips poison into the mind of Queen Kaikeyi.
              </p>
              <p className="text-md md:text-xl font-serif italic text-white/80">
                "If Rama is King, your son Bharata will be his servant. You will lose everything."
              </p>
            </div>
          </div>
        </motion.div>

        {/* S17: The Debt */}
        <motion.div style={{ opacity: s17, y: driftUp(0.32, 0.35) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                    <ImagePlaceholder title="QUEEN_HELP" color="3b82f6" width="w-[85vw] md:w-[450px]" height="h-[25vh] md:h-[35vh] min-h-[150px]" className="mb-4 md:mb-6 rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.4)] shrink-0 object-cover" />

          <h3 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-[#ef4444] mb-4 leading-none">THE ANCIENT DEBT.</h3>
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-3xl leading-relaxed">Years ago, Kaikeyi saved the King on a bloody battlefield. He promised her two undeniable boons.</p>
       
        </motion.div>

        {/* S18: The Trap */}
        <motion.div style={{ opacity: s18, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-mono tracking-[0.2em] uppercase text-white/50 mb-4">On the eve of coronation...</p>
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-tighter text-white bg-[#1a0000]/90 px-8 py-4 border border-[#ef4444]/50 shadow-[0_0_50px_rgba(239,68,68,0.5)] leading-none">THE DEBT IS CALLED.</h2>
        </motion.div>

        {/* S19: The Decree */}
        <motion.div style={{ opacity: s19, y: driftDown(0.36, 0.39) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <div className="bg-[#000000]/80 p-8 md:p-12 border-l-8 border-[#ef4444] backdrop-blur-md max-w-3xl">
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-white mb-6">1. The crown goes to Bharata.</h3>
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-[#ef4444]">2. Rama is banished for 14 years.</h3>
          </div>
        </motion.div>

        {/* S20: Dasharatha Shatters */}
        <motion.div style={{ opacity: s20, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white/90 max-w-4xl leading-relaxed">
            King Dasharatha physically shatters. He loves Rama more than his own life. The reality of the decree destroys him.
          </p>
        </motion.div>

        {/* S21: The Plea */}
        <motion.div style={{ opacity: s21, y: driftUp(0.40, 0.43) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
           <h2 className="text-[clamp(3rem,8vw,8rem)] font-black italic tracking-tighter text-white drop-shadow-[0_0_40px_rgba(239,68,68,0.8)] leading-none">"IGNORE ME!"</h2>
           <p className="text-xl md:text-3xl font-light tracking-[0.1em] text-white/80 max-w-3xl mt-6 bg-black/60 p-8">
            The King begs his son to stage a coup. To ignore the decree.<br/><span className="font-bold text-[#ef4444]">"Take the throne by force!"</span>
          </p>
        </motion.div>

        {/* S22: Rama's Power */}
        <motion.div style={{ opacity: s22, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <h3 className="text-[clamp(3rem,7vw,7rem)] font-black uppercase tracking-widest text-white leading-none mb-6 max-w-[90vw] break-words">
            HE HAS THE <span className="text-[#ef4444] drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">ARMY.</span>
          </h3>
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-2xl leading-relaxed border-l-2 border-[#ef4444] pl-6">
            He holds the absolute, unwavering loyalty of the people. He could crush the decree and take the empire in a single heartbeat.
          </p>
        </motion.div>

        {/* S23: The Smile */}
        <motion.div style={{ opacity: s23, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-3xl leading-relaxed mb-6">But he does not rage. He does not complain.</p>
          <h3 className="text-[clamp(4rem,10vw,10rem)] font-black uppercase tracking-widest text-[#fbbf24] drop-shadow-lg leading-none">HE SMILES.</h3>
        </motion.div>

        {/* S24: Dharma */}
        <motion.div style={{ opacity: s24, y: driftUp(0.46, 0.49) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(3rem,7vw,7rem)] font-serif italic text-white leading-none max-w-[90vw] bg-black/80 px-10 py-6 border border-[#fbbf24]/30">"A father's word is law."</h2>
        </motion.div>

        {/* S25: Removing the Silks */}
        <motion.div style={{ opacity: s25, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
           <p className="text-2xl md:text-5xl font-light tracking-[0.1em] text-white/80 uppercase max-w-3xl leading-relaxed">He removes the royal silks. He hands back the crown.</p>
        </motion.div>

        {/* S26: The Companions */}
        <motion.div style={{ opacity: s26, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-serif italic text-white/80 max-w-3xl leading-relaxed border-r border-white/30 pr-8">
            The entire city of Ayodhya collapses in grief. The sky darkens. But followed fiercely by Sita and Lakshmana...  
          </p>
        </motion.div>

        {/* S27: BAREFOOT (Rain triggers here!) */}
        <motion.div style={{ opacity: s27, y: driftDown(0.52, 0.55) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10 overflow-hidden">
          <span className="absolute text-[clamp(10rem,40vw,40rem)] font-black text-white/[0.1] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none translate-y-32">EXILE</span>
          <div className="relative z-10 flex flex-col items-center">
            <ImagePlaceholder title="RAMA_EXILE" color="ffffff" width="w-[80vw] md:w-[600px]" height="h-[300px]" className="mb-8 rounded-2xl mix-blend-screen opacity-50 shrink-0 object-cover" />
            <h2 className="text-[clamp(4rem,12vw,12rem)] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-[0_0_50px_rgba(167, 237, 120, 0.8)] leading-none max-w-[90vw]">
              HE WALKS OUT BAREFOOT.
            </h2>
          </div>
        </motion.div>

        {/* S28: The Abyss */}
        <motion.div style={{ opacity: s28, y: driftUp(0.54, 0.57) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10">
           <p className="text-2xl md:text-4xl font-mono tracking-[0.4em] uppercase text-white/40">Into the deep forest.</p>
        </motion.div>
        {/* --- PHASE 2 BEGINS --- */}
        <motion.div style={{ opacity: s29, y: driftUp(0.58, 0.61) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(8rem,25vw,30rem)] font-black text-[#4ade80]/[0.05] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none">DANDAKA</span>
          <div className="relative z-10 flex flex-col items-center">
            <p className="text-xs md:text-sm font-mono tracking-[0.6em] text-[#4ade80] uppercase mb-4">Phase 02 // The Forest</p>
            <h2 className="text-[clamp(3.5rem,10vw,10rem)] font-black uppercase tracking-tighter text-white drop-shadow-[0_0_40px_rgba(74,222,128,0.3)] leading-none max-w-[90vw] break-words">DANDAKA</h2>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s30, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-4xl font-serif italic text-white/90 max-w-3xl leading-relaxed">They traded silk for rough bark.</p>
        </motion.div>

        <motion.div style={{ opacity: s31, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-4xl font-serif italic text-white/90 max-w-3xl leading-relaxed">Palaces for mud huts.</p>
        </motion.div>

        <motion.div style={{ opacity: s32, y: driftUp(0.62, 0.65) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-5xl font-light text-white max-w-4xl leading-relaxed bg-[#022c22]/50 p-8 border-l-4 border-[#4ade80] backdrop-blur-sm">
            The Supreme Lord of Ayodhya now lived entirely off the unforgiving earth.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s33, x: offsetLeft }} className="absolute inset-0 flex flex-col md:flex-row-reverse items-center justify-end text-right px-6 md:px-24">
          <div className="z-10 md:ml-12 text-center md:text-right w-full md:max-w-[40vw]">
            <h3 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-white mb-2 leading-none">13 YEARS PASS.</h3>
            <p className="text-lg md:text-2xl font-light text-white/70">In complete, undisturbed peace.</p>
          </div>
          <ImagePlaceholder title="PEACEFUL_HUT" color="4ade80" width="w-[80vw] md:w-[450px]" height="h-[25vh] md:h-[350px]" className="mt-8 md:mt-0 rounded-2xl shrink-0 object-cover" />
        </motion.div>

        <motion.div style={{ opacity: s34, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-serif italic text-white/80 max-w-3xl leading-relaxed">They found a quiet kind of heaven in the dirt.</p>
        </motion.div>

        <motion.div style={{ opacity: s35, y: driftUp(0.66, 0.69) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(10rem,35vw,35rem)] font-black text-white/[0.1] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none mt-12">YEAR 14</span>
          <p className="text-2xl md:text-5xl font-serif italic text-[#fbbf24] max-w-4xl leading-relaxed relative z-10 drop-shadow-lg">
            But peace is fragile.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s36, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-[#ef4444] max-w-4xl leading-relaxed">And destiny demands blood.</p>
        </motion.div>

        {/* --- Surpanakha Sequence --- */}
        <motion.div style={{ opacity: s37, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white/90 max-w-3xl leading-relaxed">
            Enter Surpanakha. The sister of the Demon King Ravana.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s38, y: driftDown(0.70, 0.73) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white/80 max-w-4xl leading-relaxed">
            She sees Rama. She doesn't just want him. She demands him.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s39, x: offsetLeft }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-start text-left px-6 md:px-24">
          <ImagePlaceholder title="SURPANAKHA_RAGE" color="ef4444" width="w-[80vw] md:w-[350px]" height="h-[30vh] md:h-[350px]" className="mb-8 md:mb-0 md:mr-12 rounded-2xl shrink-0 object-cover shadow-[0_0_80px_rgba(239,68,68,0.3)]" />
          <p className="text-2xl md:text-5xl font-light text-white max-w-3xl leading-relaxed z-10">
            When he gently rejects her... she flies into a jealous, violent rage. She lunges for Sita.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s40, y: driftUp(0.72, 0.75) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-20 overflow-hidden">
          
          {/* 🔥 THE PHYSICAL SLASH EFFECT */}
          <motion.div 
            style={{ scaleX: s40, opacity: s40 }} 
            className="absolute w-[150vw] h-1 md:h-2 bg-white shadow-[0_0_100px_4px_rgba(239,68,68,1)] rotate-[-15deg] origin-left z-0"
          />

          <div className="relative z-10">
            <SFXText word="SLASH." color="ef4444" />
          </div>
        </motion.div>

        <motion.div style={{ opacity: s41, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white/90 max-w-3xl leading-relaxed bg-[#422006]/80 p-8 border-r-4 border-[#ef4444] backdrop-blur-md">
            Lakshmana doesn’t even hesitate. He draws his blade and severs her nose. 
          </p>
        </motion.div>

        <motion.div style={{ opacity: s42, y: driftDown(0.75, 0.78) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-white/80 max-w-4xl leading-relaxed">
            She screams into the forest, fleeing back to Lanka. The ultimate, unforgivable insult has been dealt.
          </p>
        </motion.div>

        {/* --- The Illusion Sequence --- */}
        <motion.div style={{ opacity: s43, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-light text-white max-w-3xl leading-relaxed">
            Ravana now... doesn't just want them dead. He wants to absolutely break them.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s44, x: offsetRight }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-end text-right px-6 md:px-24">
          <ImagePlaceholder title="GOLDEN_DEER" color="fbbf24" width="w-[80vw] md:w-[400px]" height="h-[30vh] md:h-[400px]" className="mb-8 md:mb-0 md:mr-12 rounded-2xl shrink-0 object-cover shadow-[0_0_80px_rgba(251,191,36,0.2)]" />
          <div className="z-10 w-full md:max-w-xl text-left md:text-right">
             <p className="text-xl md:text-3xl font-light text-white/80 leading-relaxed">
               He sends a distraction. A deer, impossibly radiant. Forged entirely from hypnotic, golden magic.
             </p>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s45, y: driftUp(0.78, 0.81) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-serif italic text-[#fbbf24] max-w-4xl leading-relaxed">
            Sita is captivated. She asks Rama to capture it. It is the only thing she has asked for in 14 years.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s46, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-light text-white max-w-3xl leading-relaxed">
            He leaves Lakshmana to guard the hut... and vanishes into the mist.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s47, y: driftDown(0.81, 0.84) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-20">
          <SFXText word="THWACK!" color="fbbf24" />
        </motion.div>

        <motion.div style={{ opacity: s48, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white/90 max-w-3xl leading-relaxed">
            Rama’s arrow pierces the deer. It dissolves into demonic ash. Oh god... it was a trick.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s49, y: driftUp(0.83, 0.86) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-lg md:text-2xl font-mono tracking-[0.2em] uppercase text-white/60 mb-6">The dying demon screams in a voice exactly like Rama's:</p>
          <h3 className="text-[clamp(3rem,7vw,7rem)] font-black uppercase tracking-widest text-[#ef4444] drop-shadow-[0_0_50px_rgba(239,68,68,0.5)] leading-none max-w-[90vw]">
            "LAKSHMANA! HELP ME!"
          </h3>
        </motion.div>

        {/* --- The Abduction Sequence --- */}
        <motion.div style={{ opacity: s50, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-4xl font-serif italic text-white/90 max-w-3xl leading-relaxed border-l border-[#ef4444] pl-8">
            Sita is terrified. She begs Lakshmana to go. He knows his brother cannot be harmed by mortal things, but he cannot disobey a mother's panicked order.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s51, y: driftDown(0.86, 0.89) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <ImagePlaceholder title="LAKSHMANA_REKHA" color="3b82f6" width="w-[80vw] md:w-[600px]" height="h-[25vh]" className="mb-6 rounded-2xl" />
          <p className="text-xl md:text-3xl font-light text-white/90 max-w-3xl leading-relaxed">
            Torn between logic and devotion, Lakshmana draws a glowing line of pure protective magic in the dirt.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s52, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-3xl leading-relaxed">
            "Please. Just do not cross this line."
          </p>
        </motion.div>

        <motion.div style={{ opacity: s53, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-4xl font-light text-white/90 max-w-3xl leading-relaxed bg-[#1a0000]/80 p-8 border-l-4 border-[#ef4444]">
            But Ravana plays dirty. He approaches the hut disguised as a frail, starving sage, targeting the one thing Sita physically cannot turn off: her relentless compassion.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s55, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-light text-white max-w-3xl leading-relaxed">
            She steps over the line to feed him.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s54, y: driftUp(0.89, 0.92) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-20">
        <ImagePlaceholder title="RAVANA_ABDUCTION" color="3b82f6" width="w-[85vw] md:w-[450px]" height="h-[25vh] md:h-[35vh] min-h-[150px]" className="mb-4 md:mb-6 rounded-2xl shadow-[0_0_80px_rgba(59,130,246,0.4)] shrink-0 object-cover" />

          <SFXText word="SNAP." color="ef4444" />
        </motion.div>

        <motion.div style={{ opacity: s56, y: driftDown(0.91, 0.94) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-10 overflow-hidden">
          <span className="absolute text-[clamp(8rem,25vw,30rem)] font-black text-[#ef4444]/[0.15] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none translate-y-32">RAVANA</span>
          <div className="relative z-10 flex flex-col items-center">
             <h2 className="text-[clamp(4rem,10vw,10rem)] font-black uppercase tracking-tighter text-[#ef4444] drop-shadow-[0_0_50px_rgba(239,68,68,0.8)] leading-none max-w-[90vw]">
               THE DISGUISE MELTS.
             </h2>
             <p className="text-xl md:text-3xl font-serif italic text-white/60 mt-8">The forest goes dead silent. The world is plunged into absolute darkness.</p>
          </div>
        </motion.div>

        {/* --- Devastation Sequence --- */}
        <motion.div style={{ opacity: s57, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-4xl font-light text-white/90 max-w-3xl leading-relaxed">
            Rama sprints back through the trees, his heart hammering against his ribs. He bursts into the clearing...
          </p>
        </motion.div>

        <motion.div style={{ opacity: s58, y: driftUp(0.93, 0.96) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-[clamp(4rem,12vw,12rem)] font-black uppercase tracking-tighter text-white/50 leading-none max-w-[90vw]">IT IS EMPTY.</h2>
        </motion.div>

        <motion.div style={{ opacity: s59, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-serif italic text-white max-w-3xl leading-relaxed">
            He doesn't summon the cosmos. He doesn't unleash divine wrath.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s60, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
        <ImagePlaceholder title="RAMA_SORROW" color="ef4444" width="w-[80vw] md:w-[350px]" height="h-[200px] md:h-[250px]" className="mb-6 md:mb-0 md:ml-8 rounded-2xl shrink-0" />
          <p className="text-xl md:text-4xl font-light text-white/90 max-w-3xl leading-relaxed bg-black/80 p-10 border border-white/20 backdrop-blur-md">
            The Creator of the Universe collapses into the mud. He physically weeps like a shattered, broken man, begging the trees to tell him where his wife is.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s61, y: driftDown(0.95, 0.98) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
          <span className="absolute text-[clamp(10rem,35vw,35rem)] font-black text-white/[0.06] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none mt-12">MADNESS</span>
          <p className="text-xl md:text-3xl font-serif italic text-white/70 relative z-10 max-w-3xl">
            Months bleed into a grueling, suffocating nightmare. Two princes reduced to starving ghosts, wandering barefoot through the abyss. Hunting for a phantom in the dark.
          </p>
        </motion.div>

        {/* --- Kishkindha Sequence --- */}
        <motion.div style={{ opacity: s62, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-lg md:text-xl font-mono tracking-[0.3em] uppercase text-white/50 mb-4">Until they reach the southern mountains.</p>
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-tighter text-white leading-none max-w-[90vw]">KISHKINDHA.</h2>
        </motion.div>

        <motion.div style={{ opacity: s63, x: offsetLeft }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-start text-left px-6 md:px-24">
           <ImagePlaceholder title="KISHKINDHA_MOUNTAINS" color="fbbf24" width="w-[80vw] md:w-[450px]" height="h-[25vh] md:h-[350px]" className="mb-8 md:mb-0 md:mr-12 rounded-2xl shrink-0 object-cover" />
           <div className="z-10 w-full md:max-w-xl">
             <p className="text-xl md:text-3xl font-light text-white/80 leading-relaxed">
               The empire of the Vanaras. But paranoia is high. Sugriva, an exiled King whose throne and wife were stolen by his tyrant brother Vali, watches the armed strangers approach.
             </p>
           </div>
        </motion.div>

        <motion.div style={{ opacity: s64, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-serif italic text-white/90 max-w-3xl leading-relaxed border-r border-white/30 pr-8">
            He thinks they are assassins. He sends his absolute best.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s65, y: driftUp(0.97, 1.0) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <p className="text-2xl md:text-4xl font-light text-white max-w-4xl bg-black/80 p-10 border border-white/20 backdrop-blur-md shadow-2xl">
            A warrior of unimaginable intellect and raw strength, hiding in the robes of a humble monk. He steps into Rama's path to interrogate him.
          </p>
        </motion.div>

        <motion.div style={{ opacity: s66, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-3xl font-light text-white/90 uppercase tracking-[0.1em]">The monk speaks. He looks up into Rama's eyes.</p>
        </motion.div>

        <motion.div style={{ opacity: s67, y: driftDown(0.98, 1.0) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-20">
          <SFXText word="GASP." color="fbbf24" />
        </motion.div>

        <motion.div style={{ opacity: s68, x: offsetRight }} className="absolute inset-0 flex flex-col justify-center items-end text-right px-6 md:px-24">
          <p className="text-2xl md:text-5xl font-serif italic text-white max-w-3xl leading-relaxed">
            The universe literally aligns. The illusion shatters. 
          </p>
        </motion.div>

        <motion.div style={{ opacity: s69, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-4xl font-light text-white/90 max-w-3xl leading-relaxed">
            The warrior collapses to his knees in the dirt. His soul recognizes its eternal master before his mind even fully processes it.
          </p>
        </motion.div>

        {/* --- Hanuman Sequence --- */}
        <motion.div style={{ opacity: s70, y: driftDown(0.99, 1.0) }} className="absolute inset-0 flex flex-col justify-end items-center text-center pb-[20vh] px-6 z-10 overflow-hidden">
          <span className="absolute text-[clamp(8rem,20vw,30rem)] font-black text-[#f97316]/[0.1] uppercase tracking-tighter whitespace-nowrap select-none z-0 pointer-events-none translate-y-20">DEVOTION</span>
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-[clamp(5rem,15vw,15rem)] font-black uppercase tracking-tighter text-[#fbbf24] drop-shadow-[0_0_80px_rgba(249,115,22,0.8)] leading-none max-w-[90vw]">
              HANUMAN.
            </h2>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s71, y: driftUp(0.99, 1.0) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-20">
          <SFXText word="BOOM!" color="f97316" />
        </motion.div>

        <motion.div style={{ opacity: s72, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-2xl md:text-4xl font-light tracking-[0.1em] text-white/90 uppercase max-w-2xl leading-relaxed border-l-4 border-[#f97316] pl-6 bg-[#450a0a]/50 backdrop-blur-md p-6">
            The heavy, suffocating grief evaporates. The void is instantly flooded with explosive, unstoppable, blazing hope. 
          </p>
        </motion.div>

        <motion.div style={{ opacity: s73, x: offsetRight }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-end text-right px-6 md:px-24 z-10">
          <ImagePlaceholder title="HANUMAN_KNEELING" color="f97316" width="w-[80vw] md:w-[400px]" height="h-[25vh] md:h-[300px]" className="mb-8 md:mb-0 md:mr-12 rounded-2xl shrink-0 object-cover shadow-[0_0_80px_rgba(249,115,22,0.5)]" />
          <div className="z-10 text-center md:text-right w-full md:max-w-xl">
            <h3 className="text-[clamp(2.5rem,6vw,6rem)] font-black uppercase tracking-widest text-white mb-4 leading-none break-words whitespace-normal">THE ULTIMATE DEVOTEE.</h3>
            <p className="text-xl md:text-3xl font-serif italic text-white/80">
              He doesn't just pledge his sword. He pledges his every breathing moment. <span className="text-[#fbbf24]">"I will tear the cosmos apart to find her, my Lord."</span>
            </p>
          </div>
        </motion.div>

        <motion.div style={{ opacity: s74, x: offsetLeft }} className="absolute inset-0 flex flex-col justify-center items-start text-left px-6 md:px-24">
          <p className="text-xl md:text-4xl font-light text-white/90 max-w-3xl leading-relaxed">
            A desperate pact is forged. A single arrow falls the tyrant Vali. Sugriva reclaims his throne, and honors his word.
          </p>
        </motion.div>

        {/* S75: The Army Gathers & The Transition Button */}
        <motion.div style={{ opacity: s75, y: driftUp(0.995, 1.0) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 z-30">
          
          <h2 className="text-[clamp(3rem,8vw,8rem)] font-black uppercase tracking-widest text-white leading-none max-w-[90vw] bg-[#450a0a]/80 px-10 py-6 border border-[#f97316]/50 shadow-[0_0_100px_rgba(249,115,22,0.4)] backdrop-blur-md">
            THE ARMY GATHERS.
          </h2>
          
          <p className="text-xl md:text-3xl font-light text-white/80 mt-6 mb-12 max-w-3xl">
            A prince seeking his wife. A king seeking redemption. And a devotee seeking to tear the universe apart for them. The march South begins.
          </p>

          {/* 🔥 THE PULSING NEXT CHAPTER BUTTON */}
          <motion.button 
            animate={{ 
              boxShadow: [
                "0px 0px 20px 0px rgba(249,115,22,0.4)", 
                "0px 0px 60px 10px rgba(249,115,22,0.8)", 
                "0px 0px 20px 0px rgba(249,115,22,0.4)"
              ] 
            }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            whileHover={{ scale: 1.05, letterSpacing: "0.2em", backgroundColor: "rgba(249,115,22,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => console.log("Trigger Phase 3 Transition!")} // You can hook this up to your state later!
            className="group relative px-8 md:px-12 py-4 md:py-6 border-2 border-[#f97316] rounded-full overflow-hidden cursor-pointer"
          >
            {/* Inner Glint Effect */}
<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[glint_1.5s_ease-in-out_infinite]" />            
            <span className="relative z-10 text-[#f97316] font-bold text-sm md:text-lg tracking-[0.1em] uppercase transition-all duration-300 group-hover:text-white">
              Move to Next Chapter
            </span>
          </motion.button>
          
        </motion.div>

      </motion.div>
    </motion.div>
  );
}