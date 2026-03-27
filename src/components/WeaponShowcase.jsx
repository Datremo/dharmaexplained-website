import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Torus, TorusKnot,Cylinder, Cone, Sphere,Sparkles } from '@react-three/drei';
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useVelocity, useMotionValue } from 'framer-motion';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// 📜 LORE MODULES
const DEITY_MODULES = {
  shiva: [
    { id: "01", title: "Ananda Tandava", desc: "The cosmic dance of bliss. Nataraja creates, preserves, and destroys the universe in endless cycles of fiery rhythm." },
    { id: "02", title: "The Third Eye", desc: "The destroyer of illusion. When opened, it reduces ignorance and worldly desire to ashes, revealing raw truth." },
    { id: "03", title: "Conqueror of Time", desc: "Mahakala, the master of eternity. He who drank the Halahala poison to save the cosmos from absolute destruction." }
  ],
  vishnu: [
    { id: "01", title: "Kshira Sagara", desc: "The cosmic ocean of milk. Vishnu dreams the universe into existence while resting on the endless serpent, Shesha." },
    { id: "02", title: "The Dashavatara", desc: "The ten descents. Whenever dharma fades and chaos rises, he incarnates to restore the delicate balance of reality." },
    { id: "03", title: "The Ultimate Maya", desc: "The grand illusion. He weaves the fabric of reality so perfectly that even the gods forget their true, infinite nature." }
  ],
  brahma: [
    { id: "01", title: "Hiranyagarbha", desc: "The golden womb of creation. From a single, unimaginable point of density, he breathed the universe into expansion." },
    { id: "02", title: "The Four Faces", desc: "Looking into every dimension simultaneously. His mind holds the four Vedas, the fundamental source code of the cosmos." },
    { id: "03", title: "The Lotus Seat", desc: "Born from the navel of the infinite. He represents the purest state of intelligence required to architect existence." }
  ]
};

function generateNebulaClouds(numPoints, width, height, depth) {
  const positions = new Float32Array(numPoints * 3);
  for (let i = 0; i < numPoints; i++) {
    positions[i * 3] = (Math.random() - 0.5) * width;
    positions[i * 3 + 1] = (Math.random() - 0.5) * height; 
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth;
  }
  return { positions };
}

// ==========================================
// 🔱 UPGRADED: SHIVA'S TRISHUL (Pure Red Energy)
// ==========================================
const AbstractTrishul = ({ smoothScroll, isWarping }) => {
  const groupRef = useRef();
  const t = useRef(0);
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const targetScale = isMobile ? 0.35 : 0.7; // Slightly scaled down to fit the new taller geometry

  useFrame((state, delta) => {
    t.current += delta;
    if (!groupRef.current) return;
    const scroll = smoothScroll.get();
    
    if (isWarping) {
      groupRef.current.rotation.y += delta * 20; 
      state.camera.position.lerp(new THREE.Vector3(groupRef.current.position.x, groupRef.current.position.y, 0), delta * 2); 
      return; 
    }
    
    let targetX = 0; 
    let targetY = isMobile ? 0.2 : 1.2; 
    if (scroll > 0.75) {
      const p = (scroll - 0.75) * 4; 
      targetX = THREE.MathUtils.lerp(0, isMobile ? 0 : -3.5, p); 
      targetY = THREE.MathUtils.lerp(isMobile ? 0.2 : 1.2, isMobile ? 0.2 : 0, p);  
    }
    
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 5);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 5);
    groupRef.current.position.z = THREE.MathUtils.lerp(5, 0, Math.min(scroll * 5, 1)); 
    groupRef.current.rotation.y += delta * (0.5 + scroll * 2);
    groupRef.current.rotation.z = Math.sin(t.current) * 0.1;
  });

  const fireMaterial = <meshStandardMaterial color="#ff1100" emissive="#ff3300" emissiveIntensity={3} roughness={0.2} metalness={0.8} />;

  return (
    <group ref={groupRef} scale={[targetScale, targetScale, targetScale]}>
      {/* Central Staff */}
      <Cylinder args={[0.1, 0.05, 8, 32]} position={[0, -2, 0]}>{fireMaterial}</Cylinder>
      {/* The Center Spear (Flattened Diamond) */}
      <Cone args={[0.5, 4, 4]} position={[0, 3.5, 0]} scale={[1, 1, 0.2]} rotation={[0, Math.PI/4, 0]}>{fireMaterial}</Cone>
      {/* The U-Shape Prongs */}
      <Torus args={[1.8, 0.15, 16, 50, Math.PI]} position={[0, 1.5, 0]} rotation={[0, 0, Math.PI]} scale={[1, 1.5, 1]}>{fireMaterial}</Torus>
      {/* Side Spear Tips */}
      <Cone args={[0.2, 2, 4]} position={[-1.8, 3.5, 0]} scale={[1, 1, 0.2]} rotation={[0, Math.PI/4, 0.1]}>{fireMaterial}</Cone>
      <Cone args={[0.2, 2, 4]} position={[1.8, 3.5, 0]} scale={[1, 1, 0.2]} rotation={[0, Math.PI/4, -0.1]}>{fireMaterial}</Cone>
      
      {/* Energy Rings around the staff */}
      <Torus args={[0.4, 0.05, 16, 32]} position={[0, 0.5, 0]} rotation={[Math.PI/2, 0, 0]}>{fireMaterial}</Torus>
      <Torus args={[0.4, 0.05, 16, 32]} position={[0, -0.5, 0]} rotation={[Math.PI/2, 0, 0]}>{fireMaterial}</Torus>

      <pointLight color="#ff1100" distance={20} intensity={isWarping ? 80 : 10} />
    </group>
  );
};

// ========================================================
// 🥏 HYPER-DETAILED SUDARSHANA CHAKRA (Pure Gold & Neon Core)
// ==========================================
const AbstractChakra = ({ smoothScroll, isWarping }) => {
  const groupRef = useRef();
  const innerMandalaRef = useRef();
  const bladeRingRef = useRef();
  const t = useRef(0);
  
  // ✨ FIX: Reduced mobile scale significantly to prevent the bloom blowout!
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const targetScale = isMobile ? 0.22 : 0.65; 

  useFrame((state, delta) => {
    t.current += delta;
    if (!groupRef.current) return;
    const scroll = smoothScroll.get();
    
    if (isWarping) {
      // Violent, hyper-fast spin for warp
      groupRef.current.rotation.z -= delta * 35; 
      if (bladeRingRef.current) bladeRingRef.current.rotation.z += delta * 50; 
      if (innerMandalaRef.current) innerMandalaRef.current.rotation.z -= delta * 20;
      state.camera.position.lerp(new THREE.Vector3(groupRef.current.position.x, groupRef.current.position.y, 0), delta * 2);
      return;
    }
    
    let targetX = 0; 
    let targetY = isMobile ? 0.4 : 1.2; // Adjusted mobile Y so it sits prettier on screen
    if (scroll > 0.75) {
      const p = (scroll - 0.75) * 4; 
      targetX = THREE.MathUtils.lerp(0, isMobile ? 0 : -3.5, p); 
      targetY = THREE.MathUtils.lerp(isMobile ? 0.4 : 1.2, isMobile ? 0.2 : 0, p);  
    }
    
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 5);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 5);
    groupRef.current.position.z = THREE.MathUtils.lerp(5, 0, Math.min(scroll * 5, 1)); 
    
    // Deep, majestic tilt and spin
    groupRef.current.rotation.z -= delta * (2 + scroll * 10); 
    groupRef.current.rotation.x = Math.PI / 2.2 + (scroll * Math.PI / 4); 

    // Complex clockwork contra-rotation for the inner details
    if (innerMandalaRef.current) innerMandalaRef.current.rotation.z += delta * (1.5 + scroll * 8);
  });

  // ✨ ALCHEMY: Swapped to Standard Emissive Materials so it NEVER looks black! ✨
  const pureGold = (
    <meshStandardMaterial 
      color="#FFDF00" 
      metalness={0.6} 
      roughness={0.2} 
      emissive="#FFB800" 
      emissiveIntensity={0.5} // Gives it an inner radiance without needing external lights
    />
  );
  
  const antiqueGold = (
    <meshStandardMaterial 
      color="#D4AF37" 
      metalness={0.8} 
      roughness={0.4} 
      emissive="#996515" 
      emissiveIntensity={0.3} 
    />
  );

  // ✨ FIX: Drastically lowered mobile emissive intensity to save our eyes! ✨
  const glowingCore = (
    <meshStandardMaterial 
      color="#FFFFCC" 
      emissive="#FFEA00" 
      emissiveIntensity={isMobile ? 2.5 : 6} // Adapts dynamically!
      toneMapped={false} 
    />
  );

  return (
    <group ref={groupRef} scale={[targetScale, targetScale, targetScale]}>
      
      {/* --- 1. THE DIVINE CORE --- */}
      <Sphere args={[0.6, 32, 32]} position={[0, 0, 0.15]} scale={[1, 1, 0.5]}>
        {glowingCore}
      </Sphere>
      {/* Center cap rings */}
      <Torus args={[0.8, 0.08, 32, 64]} position={[0, 0, 0.1]}>{pureGold}</Torus>
      <Torus args={[0.55, 0.04, 16, 64]} position={[0, 0, 0.05]}>{antiqueGold}</Torus>

      {/* --- 2. THE INTRICATE MANDALA --- */}
      <group ref={innerMandalaRef} position={[0, 0, 0]}>
        <TorusKnot args={[0.9, 0.1, 128, 16, 3, 8]} scale={[1, 1, 0.1]}>
          {pureGold}
        </TorusKnot>
        <TorusKnot args={[1.3, 0.08, 128, 16, 5, 12]} scale={[1, 1, 0.08]} rotation={[0, 0, Math.PI / 4]}>
          {antiqueGold}
        </TorusKnot>
      </group>

      {/* --- 3. THE HEAVY BRONZE/GOLD RIMS --- */}
      {/* Added emissive to the backing plate so the center is never dark! */}
      <Cylinder args={[1.8, 1.8, 0.1, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#FFB300" metalness={0.5} roughness={0.6} emissive="#8B6508" emissiveIntensity={0.2} />
      </Cylinder>
      {/* Stepped outer rings */}
      <Torus args={[1.7, 0.15, 32, 100]} position={[0, 0, 0.08]}>{pureGold}</Torus>
      <Torus args={[1.9, 0.05, 16, 100]} position={[0, 0, 0.05]}>{antiqueGold}</Torus>

      {/* --- 4. THE ASTOUNDING SAWTOOTH BLADES (72 precise edges) --- */}
      <group ref={bladeRingRef}>
        {Array.from({ length: 72 }).map((_, i) => (
          <group key={`blade-${i}`} rotation={[0, 0, (Math.PI / 36) * i]}>
            <Cone 
              args={[0.08, 0.6, 3]} 
              position={[0, 2.05, 0]} 
              scale={[1, 1, 0.1]} 
              rotation={[0, 0, -0.3]} 
            >
              {pureGold}
            </Cone>
            <Sphere args={[0.06, 8, 8]} position={[0, 1.85, 0]} scale={[1, 1, 0.2]}>
              {antiqueGold}
            </Sphere>
          </group>
        ))}
      </group>

      {/* --- 5. DYNAMIC LIGHTING --- */}
      {/* ✨ Front-facing lights to wash the entire weapon in a gorgeous golden glow! ✨ */}
      <pointLight color="#FFEA00" distance={8} intensity={isMobile ? 2 : 4} position={[0, 0, 1.5]} /> 
      <pointLight color="#FFDF00" distance={20} intensity={isWarping ? 30 : 6} position={[0, 0, 3]} /> 
      
    </group>
  );
};

// ==========================================
// 🌸 UPGRADED: BRAHMA'S LOTUS (Layered Golden Petals)
// ==========================================
const AbstractLotus = ({ smoothScroll, isWarping }) => {
  const groupRef = useRef();
  const t = useRef(0);
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const targetScale = isMobile ? 0.35 : 0.7; 
  
  useFrame((state, delta) => {
    t.current += delta;
    if (!groupRef.current) return;
    const scroll = smoothScroll.get();
    
    if (isWarping) {
      groupRef.current.rotation.y += delta * 15;
      // Petals close up tight during warp!
      groupRef.current.children.forEach((layer, index) => {
        if (layer.name === "petalLayer") layer.children.forEach(petal => petal.rotation.x += delta * 3); 
      }); 
      state.camera.position.lerp(new THREE.Vector3(groupRef.current.position.x, groupRef.current.position.y, 0), delta * 2);
      return;
    }
    
    let targetX = 0; 
    let targetY = isMobile ? 0.2 : 1.2; 
    if (scroll > 0.75) {
      const p = (scroll - 0.75) * 4; 
      targetX = THREE.MathUtils.lerp(0, isMobile ? 0 : -3.5, p); 
      targetY = THREE.MathUtils.lerp(isMobile ? 0.2 : 1.2, isMobile ? 0.2 : 0, p);  
    }
    
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 5);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 5);
    groupRef.current.position.z = THREE.MathUtils.lerp(5, 0, Math.min(scroll * 5, 1)); 
    groupRef.current.rotation.y += delta * (0.5 + scroll); 
    
    // Smoothly "Bloom" the lotus based on scroll depth
    const bloomAmount = THREE.MathUtils.lerp(0.2, 1.2, scroll);
    groupRef.current.children.forEach((layer) => {
      if (layer.name === "petalLayerOuter") layer.children.forEach(petal => petal.rotation.x = bloomAmount * 1.2);
      if (layer.name === "petalLayerInner") layer.children.forEach(petal => petal.rotation.x = bloomAmount * 0.7);
    });
  });

  const goldMaterial = <meshStandardMaterial color="#E65DCF" emissive="#F030C9" emissiveIntensity={2} roughness={0.3} metalness={0.8} />;
  const coreMaterial = <meshStandardMaterial color="#ffffff" emissive="#FFFFFF" emissiveIntensity={8} />;

  return (
    <group ref={groupRef} scale={[targetScale, targetScale, targetScale]}>
      {/* Glowing Receptacle (Core) */}
      <Sphere args={[0.6, 32, 32]}>{coreMaterial}</Sphere>
      <Torus args={[0.8, 0.05, 16, 50]} rotation={[Math.PI/2, 0, 0]}>{goldMaterial}</Torus>
      
      {/* Outer Layer of Petals */}
      <group name="petalLayerOuter">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <group key={`outer-${i}`} rotation={[0, (Math.PI / 4) * i, 0]}>
            {/* Flattened Cone to look like a beautiful teardrop petal */}
            <Cone args={[0.8, 3.5, 32]} position={[0, 0.5, 1.5]} scale={[1, 1, 0.1]} rotation={[1.2, 0, 0]}>
              {goldMaterial}
            </Cone>
          </group>
        ))}
      </group>

      {/* Inner Layer of Petals (Offset rotation so they interleave) */}
      <group name="petalLayerInner">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <group key={`inner-${i}`} rotation={[0, (Math.PI / 4) * i + (Math.PI / 8), 0]}>
            <Cone args={[0.6, 2.5, 32]} position={[0, 0.5, 1]} scale={[1, 1, 0.15]} rotation={[0.6, 0, 0]}>
              <meshStandardMaterial color="#E56CC3" emissive="#ED5CBF" emissiveIntensity={1} roughness={0.2} metalness={0.5} />
            </Cone>
          </group>
        ))}
      </group>

      <pointLight color="#FFFFFF" distance={20} intensity={isWarping ? 80 : 10} />
    </group>
  );
};
// 👆 END EXACT COPY-PASTE 👆

// 👇 EXACT COPY-PASTE FROM YOUR UPLOAD 👇
// ==========================================
// 🃏 THE INTERACTIVE LORE CARD (Gallery Ratio)
// ==========================================
const LoreCard = ({ mod, themeColor, glowBorder, isShiva, isVishnu, scrollVelocity }) => {
  const skewX = useTransform(scrollVelocity, [-2, 2], [10, -10]);
  const smoothSkew = useSpring(skewX, { stiffness: 200, damping: 30 });

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const rotateY = useTransform(mouseX, [0, 1], [-6, 6]);
  const rotateX = useTransform(mouseY, [0, 1], [6, -6]);
  const springRotX = useSpring(rotateX, { stiffness: 400, damping: 30 });
  const springRotY = useSpring(rotateY, { stiffness: 400, damping: 30 });

  const glowX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  return (
    <motion.div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }} // 🔥 Made them clickable/interactive!
      style={{ skewX: smoothSkew, rotateX: springRotX, rotateY: springRotY }}
      className={`w-[85vw] md:w-[35vw] h-[40vh] md:h-[35vh] flex-shrink-0 backdrop-blur-3xl bg-black/40 border ${glowBorder} p-8 md:p-10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden pointer-events-auto cursor-pointer group flex flex-col justify-center`}
    >
       <motion.div 
          style={{ left: glowX, top: glowY, x: "-50%", y: "-50%" }}
          className={`absolute w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none z-0 ${isShiva ? 'bg-[#ff1100]' : isVishnu ? 'bg-[#00ccff]' : 'bg-[#ffaa00]'}`} 
       />
       
       <h4 className={`${themeColor} text-5xl md:text-7xl font-serif opacity-10 absolute -top-2 -right-2 pointer-events-none z-0 select-none`}>
         {mod.id}
       </h4>
       
       <div className="relative z-10">
         <h2 className="text-white text-2xl md:text-3xl font-serif uppercase tracking-widest mb-4 drop-shadow-lg">
           {mod.title}
         </h2>
         <div className={`w-8 h-1 mb-4 ${isShiva ? 'bg-[#ff1100]' : isVishnu ? 'bg-[#ffaa00]' : 'bg-[#FFFFFF]'}`} />
         <p className="text-white/80 text-sm md:text-base leading-relaxed font-light drop-shadow-md">
           {mod.desc}
         </p>
       </div>
    </motion.div>
  );
};
// 👆 END EXACT COPY-PASTE 👆


export default function WeaponShowcase({ guide, onBack, onEnterHub }) {
  // 🔥 FIX: Adding [guide] to the array ensures it forces a reset when switching Gods!
  useEffect(() => { 
    setTimeout(() => { window.scrollTo(0, 0); }, 50); 
  }, [guide]);

// 👇 ADD THIS BULLETPROOF HISTORY BLOCK 👇
  const onBackRef = useRef(onBack);
  useEffect(() => { onBackRef.current = onBack; }, [onBack]);

  useEffect(() => {
    // Inject the Weapons Screen into the phone's history
    if (!window.history.state || window.history.state.page !== 'weapon-showcase') {
      window.history.pushState({ page: 'weapon-showcase', guide }, '', '');
    }

    const handlePopState = () => {
      // If they swipe back on the phone, gracefully return to Deity Selection!
      onBackRef.current(); 
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [guide]); // Re-run if the guide changes
  // 👆 END HISTORY BLOCK 👆

  const [isWarping, setIsWarping] = useState(false);
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 80, damping: 20, restDelta: 0.001 });
  const scrollVelocity = useVelocity(smoothScroll);
  
  const isMobile = window.innerWidth < 768;
  const isShiva = guide === 'shiva';
  const isVishnu = guide === 'vishnu';
  
  const themeColor = isShiva ? 'text-[#ff1100]' : isVishnu ? 'text-[#ffaa00]' : 'text-[#FFFFFF]';
  const glowBorder = isShiva ? 'border-[#ff1100]/30' : isVishnu ? 'border-[#ffaa00]/30' : 'border-[#FFFFFF]/30';
  const deityName = isShiva ? 'Shiva' : isVishnu ? 'Vishnu' : 'Brahma';
  const guideTitle = isShiva ? 'The Destroyer' : isVishnu ? 'The Preserver' : 'The Creator';
  const modules = DEITY_MODULES[guide];

  const handleBeginJourney = () => {
    setIsWarping(true); 
    setTimeout(() => { onEnterHub(); }, 2500); 
  };

  const introOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.15], [0, -100]); 
  const introScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);
  const cardsX = useTransform(scrollYProgress, [0.15, 0.75], isMobile ? ["100vw", "-280vw"] : ["100vw", "-120vw"]);
  const climaxOpacity = useTransform(scrollYProgress, [0.80, 0.90, 1], [0, 1, 1]);
  const climaxScale = useTransform(scrollYProgress, [0.80, 0.90, 1], [0.8, 1, 1]);
  const climaxY = useTransform(scrollYProgress, [0.80, 0.90, 1], [50, 0, 0]);

  return (
    <div className="relative w-full h-[500vh] bg-[#010101]">
      
      {!isWarping && (
        <button 
          onClick={() => window.history.back()} // 👈 CHANGED THIS
          className="fixed top-6 left-6 md:top-8 md:left-8 z-50 px-4 md:px-6 py-2 border border-white/20 rounded-full text-white/70 text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/10 hover:text-white transition-all backdrop-blur-md cursor-pointer flex items-center shadow-2xl"
          style={{ top: 'calc(1.5rem + env(safe-area-inset-top))' }} /* 👈 ADDED SAFE AREA FIX FOR CAMERA HOLE TOO! */
        >
          ← Back to Selection
        </button>
      )}

      {/* Side Scroll Indicator */}
      <div className="fixed top-1/2 right-2 md:right-6 -translate-y-1/2 w-[2px] h-32 md:h-64 bg-white/10 z-50 rounded-full overflow-hidden opacity-30">
        <motion.div style={{ scaleY: smoothScroll, originY: 0 }} className={`w-full h-full ${isShiva ? 'bg-[#ff1100]' : isVishnu ? 'bg-[#00ccff]' : 'bg-[#ffaa00]'}`} />
      </div>

      <AnimatePresence>
        {isWarping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="fixed inset-0 z-[100] bg-white" />
        )}
      </AnimatePresence>

      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center perspective-1000">
        
        {/* ... Keep the 3D Canvas and the text/cards rendering EXACTLY the same here ... */}
        {/* I am omitting the repetitive Canvas and cards here to keep it clean, just paste the top logic! */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <EffectComposer disableNormalPass>
              <Bloom luminanceThreshold={1.0} mipmapBlur intensity={1.5} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>

            {isShiva && <AbstractTrishul smoothScroll={smoothScroll} isWarping={isWarping} />}
            {isVishnu && <AbstractChakra smoothScroll={smoothScroll} isWarping={isWarping} />}
            {!isShiva && !isVishnu && <AbstractLotus smoothScroll={smoothScroll} isWarping={isWarping} />}
            
            <Points positions={generateNebulaClouds(5000, 20, 20, 20).positions} stride={3}>
              <PointMaterial transparent size={0.02} color={isShiva ? "#ff1100" : isVishnu ? "#ffaa00" : "#FFFFFF"} opacity={0.3} />
            </Points>
          </Canvas>
        </div>

        <motion.div 
          style={{ opacity: introOpacity, y: introY, scale: introScale }} 
          className="absolute top-[25%] md:top-1/4 left-0 right-0 md:left-auto md:right-32 px-6 md:px-0 w-full max-w-lg z-10 flex flex-col gap-2 md:gap-4 text-center md:text-right pointer-events-none"
        >
          <h3 className="text-white/50 tracking-[0.4em] uppercase text-xs md:text-sm">Your Guide</h3>
          <h1 className={`${themeColor} text-6xl md:text-8xl font-serif uppercase tracking-[0.2em] drop-shadow-[0_0_30px_currentColor] leading-none`}>{deityName}</h1>
          <h2 className="text-white/80 text-sm md:text-2xl font-light tracking-widest uppercase">{guideTitle}</h2>
        </motion.div>

        <div className="absolute bottom-12 w-full flex items-center z-20 pointer-events-none">
          <motion.div style={{ x: cardsX }} className="flex gap-6 md:gap-16 items-center h-full px-[10vw]">
            {modules.map((mod) => (
              <LoreCard key={mod.id} mod={mod} themeColor={themeColor} glowBorder={glowBorder} isShiva={isShiva} isVishnu={isVishnu} scrollVelocity={scrollVelocity} />
            ))}
          </motion.div>
        </div>

        <motion.div 
          style={{ opacity: climaxOpacity, scale: climaxScale, y: climaxY }} 
          className={`absolute left-0 right-0 md:left-auto md:right-32 top-[60%] md:top-1/2 -translate-y-1/2 z-30 flex flex-col items-center md:items-end gap-6 md:gap-10 pointer-events-auto text-center md:text-right px-6`}
        >
          <h1 className="text-white text-3xl md:text-6xl font-serif uppercase tracking-[0.2em] md:tracking-[0.3em] drop-shadow-2xl leading-tight">
            Are you ready to <br/>
            <span className={`${themeColor} drop-shadow-[0_0_40px_currentColor] text-5xl md:text-8xl block mt-2 md:mt-4`}>awaken?</span>
          </h1>
          <button 
            onClick={handleBeginJourney}
            className={`px-10 md:px-14 py-4 md:py-6 border border-current ${themeColor} hover:bg-white/10 transition-all uppercase tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-base font-bold rounded-full backdrop-blur-md shadow-[0_0_30px_currentColor] hover:shadow-[0_0_60px_currentColor] hover:scale-105 cursor-pointer`}
          >
            Begin The Journey
          </button>
        </motion.div>

      </div>
    </div>
  );
}