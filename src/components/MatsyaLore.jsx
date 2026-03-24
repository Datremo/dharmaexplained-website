import React, { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Box, Sphere, Cylinder, Torus } from '@react-three/drei';
import { setGlobalMusic } from './GlobalAudio';
import { PerformanceMonitor } from '@react-three/drei'; // 👈 Added Performance Monitor
// --------------------------------------------------------
// 🌐 THE MULTI-LANGUAGE DICTIONARY
// --------------------------------------------------------
const TEXT = {
  en: {
    exit: "← Exit Domain",
    s1_1: "Time is not a line.",
    s1_2: "It is a circle.",
    s2_tag: "/ THE PREVIOUS AGE /",
    s2_1: "The waters began to rise.",
    s2_2: "King Manu stood in the river, praying for humanity.",
    s3_1: "A tiny fish fell into his palms.",
    s3_2: '"Save me," it whispered.',
    s4_bg: "GROWTH",
    s4_1: "He placed it in a jar.", s4_1b: "It outgrew the jar.",
    s4_2: "He placed it in a well.", s4_2b: "It outgrew the well.",
    s5_1: "He released it into the ocean.",
    s5_2: "Within days, it eclipsed the sea.",
    s6_1: "Manu trembled.",
    s6_2: '"Who are you?"',
    s7_bg: "PRALAYA",
    s7_1: "The sky broke.",
    s7_2: "The Cosmic Deluge had come.",
    s8_1: '"Build an Ark,"', s8_1b: "the voice echoed.",
    s8_2: '"Gather the seeds of all life."',
    s8_3: '"Gather the Truth."',
    s9_tag: "/ Absolute Zero /",
    s9_1: "In the endless dark of the drowned world...",
    s9_2: "There was no north. No south.",
    s10_1: "Then, the abyss illuminated.",
    s11_bg: "MATSYA",
    s11_1: "The Preserver, Vishnu.",
    s11_2: "The Cosmic Leviathan.",
    s12_1: '"Tether your ark to my horn."',
    s12_tag: "HE COMMANDED",
    s13_1: "Through the chaotic abyss of the end of the world...",
    s13_2: "He guided the light.",
    s14_title: "The Rebirth.",
    s14_1: '"When the world drowns in ignorance, truth becomes the ark.',
    s14_2: 'And Dharma is the compass."'
  },
  hi: {
    exit: "← प्रस्थान",
    s1_1: "समय एक सीधी रेखा नहीं है।",
    s1_2: "यह एक चक्र है।",
    s2_tag: "/ पिछला युग /",
    s2_1: "जलस्तर बढ़ने लगा।",
    s2_2: "राजा मनु नदी में खड़े होकर मानवता के लिए प्रार्थना कर रहे थे।",
    s3_1: "एक छोटी मछली उनकी हथेलियों में आ गिरी।",
    s3_2: '"मुझे बचाओ," उसने फुसफुसाते हुए कहा।',
    s4_bg: "विस्तार",
    s4_1: "उन्होंने उसे एक जार में रखा।", s4_1b: "वह जार से बड़ी हो गई।",
    s4_2: "उन्होंने उसे एक कुएं में रखा।", s4_2b: "वह कुएं से भी बड़ी हो गई।",
    s5_1: "उन्होंने उसे सागर में छोड़ दिया।",
    s5_2: "कुछ ही दिनों में, उसने पूरे समुद्र को ढक लिया।",
    s6_1: "मनु कांप उठे।",
    s6_2: '"तुम कौन हो?"',
    s7_bg: "प्रलय",
    s7_1: "आसमान फट पड़ा।",
    s7_2: "महाप्रलय आ चुका था।",
    s8_1: '"एक नाव बनाओ,"', s8_1b: "आवाज़ गूंजी।",
    s8_2: '"सभी जीवों के बीज इकट्ठा करो।"',
    s8_3: '"सत्य को इकट्ठा करो।"',
    s9_tag: "/ पूर्ण शून्य /",
    s9_1: "डूबी हुई दुनिया के अनंत अंधेरे में...",
    s9_2: "ना कोई उत्तर था। ना कोई दक्षिण।",
    s10_1: "तभी, वह अथाह गहराई रोशन हो उठी।",
    s11_bg: "मत्स्य",
    s11_1: "पालनहार, श्री विष्णु।",
    s11_2: "ब्रह्मांडीय महामत्स्य।",
    s12_1: '"अपनी नाव को मेरे सींग से बांध दो।"',
    s12_tag: "उन्होंने आदेश दिया",
    s13_1: "दुनिया के अंत के उस अराजक अंधेरे में...",
    s13_2: "उन्होंने प्रकाश का मार्गदर्शन किया।",
    s14_title: "पुनर्जन्म।",
    s14_1: '"जब दुनिया अज्ञान में डूब जाती है, तो सत्य ही नाव बन जाता है।',
    s14_2: 'और धर्म ही दिशासूचक होता है।"'
  },
  mr: {
    exit: "← बाहेर पडा",
    s1_1: "काळ ही एक सरळ रेषा नाही.",
    s1_2: "ते एक चक्र आहे.",
    s2_tag: "/ मागील युग /",
    s2_1: "पाण्याची पातळी वाढू लागली.",
    s2_2: "राजा मनू नदीत उभे राहून मानवतेसाठी प्रार्थना करत होते.",
    s3_1: "एक लहान मासा त्यांच्या हातावर पडला.",
    s3_2: '"मला वाचवा," तो हळूच म्हणाला.',
    s4_bg: "विस्तार",
    s4_1: "त्यांनी त्याला एका भांड्यात ठेवले.", s4_1b: "तो भांड्यापेक्षा मोठा झाला.",
    s4_2: "त्यांनी त्याला विहिरीत सोडले.", s4_2b: "तो विहिरीपेक्षाही मोठा झाला.",
    s5_1: "त्यांनी त्याला समुद्रात सोडले.",
    s5_2: "काही दिवसांतच, त्याने संपूर्ण समुद्र व्यापला.",
    s6_1: "मनू थरथर कापले.",
    s6_2: '"तू कोण आहेस?"',
    s7_bg: "प्रलय",
    s7_1: "आकाश फाटले.",
    s7_2: "महाप्रलय आला होता.",
    s8_1: '"एक नाव बनवा,"', s8_1b: "आवाज घुमला.",
    s8_2: '"सर्व जीवांचे बीज गोळा करा."',
    s8_3: '"सत्य गोळा करा."',
    s9_tag: "/ शून्य अवस्था /",
    s9_1: "बुडालेल्या जगाच्या अनंत अंधारात...",
    s9_2: "ना उत्तर दिशा होती. ना दक्षिण.",
    s10_1: "तेव्हा, तो अथांग अंधार उजळून निघाला.",
    s11_bg: "मत्स्य",
    s11_1: "पालनकर्ता, श्री विष्णू.",
    s11_2: "वैश्विक महामत्स्य.",
    s12_1: '"तुमची नाव माझ्या शिंगाला बांधा."',
    s12_tag: "त्यांनी आज्ञा दिली",
    s13_1: "जगाच्या अंताच्या त्या भयानक अंधारात...",
    s13_2: "त्यांनी प्रकाशाला मार्ग दाखवला.",
    s14_title: "पुनर्जन्म.",
    s14_1: '"जेव्हा जग अज्ञानात बुडते, तेव्हा सत्य हीच नाव बनते.',
    s14_2: 'आणि धर्म हाच होकायंत्र असतो."'
  }
};

// --------------------------------------------------------
// 🌊 PART 1: THE 3D ABYSS ENGINE
// --------------------------------------------------------
// 👇 ADD 'tier' to the props
const Matsya3DScene = ({ scrollProgress, tier }) => {
  const rainRef = useRef();
  const tinyFishRef = useRef();
  const arkRef = useRef();
  const hornRef = useRef();
  const cameraGroupRef = useRef(); 

  // 🪓 SLASH THE PARTICLES: High gets 2000, Low gets 400
  const particleCount = tier === 'high' ? 2000 : (tier === 'medium' ? 1000 : 400);

  const { particles } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) { 
      pos[i] = (Math.random() - 0.5) * 30; 
    }
    return { particles: pos };
  }, [particleCount]);

  // 🪓 SLASH THE POLYGONS: Low tier gets half the segments
  const geoRes = tier === 'low' ? 16 : 32;

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
        <bufferAttribute attach="attributes-position" count={particleCount} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#00ccff" transparent opacity={0} blending={THREE.AdditiveBlending} />
      </points>
      <Sphere ref={tinyFishRef} args={[0.5, geoRes, geoRes]} position={[0, -1, -5]}>
          <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} wireframe transparent opacity={0} />
      </Sphere>
      <Box ref={arkRef} args={[2, 0.5, 1]} position={[0, -20, -4]}>
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} transparent opacity={0} />
      </Box>
      <Cylinder ref={hornRef} args={[0, 4, 15, geoRes]} position={[0, -35, -10]} rotation={[-0.2, 0, 0]}>
          <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.5} wireframe transparent opacity={0} />
      </Cylinder>
      <pointLight position={[0, -25, -8]} color="#00ccff" intensity={2} distance={20} />
    </group>
  );
};

// --------------------------------------------------------
// 🎬 THE MAIN EDITORIAL SCROLL COMPONENT
// --------------------------------------------------------
export default function MatsyaLore({ onBack })
 {
  const [dpr, setDpr] = useState(1); // Start safe on 1
  const [tier, setTier] = useState('high');

  const containerRef = useRef(null);
  const [lang, setLang] = useState('en');
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    setGlobalMusic('matsya');
  }, []);
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
// Specialized Abyss Borders
const ABYSS_BORDER = 'border border-[#00ccff]/30 shadow-[0_0_50px_rgba(0,204,255,0.2)]';
const ABYSS_BORDER_BRUTAL = 'border border-[#fbbf24]/50 shadow-[0_0_60px_rgba(251,191,36,0.15)]';
  return (
    <motion.div ref={containerRef} style={{ backgroundColor: bgColor }} className="relative w-full h-[1400vh] font-sans">
      
      <button onClick={onBack} className="fixed top-6 left-6 z-[100] px-6 py-2 border border-[#00ccff]/30 rounded-full text-xs tracking-widest uppercase hover:bg-[#00ccff]/10 transition-all mix-blend-difference text-white shadow-[0_0_20px_rgba(0,204,255,0.2)]">
      {TEXT[lang].exit} {/* 👈 Dynamic Exit Text! */}      
      </button>

      {/* 👇 LANGUAGE SWITCHER BUTTON */}
      <div className="fixed top-6 right-6 z-[100] flex bg-black/50 border border-[#00ccff]/30 rounded-full backdrop-blur-md overflow-hidden">
        {['en', 'hi', 'mr'].map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${lang === l ? 'bg-[#00ccff] text-black' : 'text-white/50 hover:text-white'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* 3D ABYSS BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 👇 Pass DPR state */}
        <Canvas dpr={dpr} camera={{ position: [0, 0, 8], fov: 60 }}>
          
          {/* 👇 THE BRAIN: Monitors FPS and downgrades on the fly */}
          <PerformanceMonitor 
            onDecline={() => { setDpr(1); setTier('low'); }}
            onIncline={() => { setDpr(1.5); setTier('high'); }}
          />
          
          <ambientLight intensity={0.2} />
          
          <EffectComposer disableNormalPass>
            {/* Bloom is slightly lighter on 'low' tier */}
            <Bloom luminanceThreshold={0.2} intensity={tier === 'low' ? 1.5 : 2.0} mipmapBlur={tier !== 'low'} />
            <Vignette eskil={false} offset={0.5} darkness={0.8} /> 
            {/* 🪓 Kill the Noise effect completely if tier is low! */}
            {tier !== 'low' && <Noise opacity={0.12} />}
          </EffectComposer>

          {/* 👇 Pass the tier down to the 3D scene */}
          <Matsya3DScene scrollProgress={sp} tier={tier} />
        </Canvas>
      </div>

      {/* EDITORIAL HTML LAYER */}
      <motion.div style={{ x: shake, color: textColor }} className="sticky top-0 w-full h-screen overflow-hidden z-10 pointer-events-none">
        
        {/* SCENE 1 */}
        <motion.div style={{ opacity: s1, y: driftUp(0, 0.07) }} className="absolute inset-0 flex items-center justify-center text-center">
          <h1 className="text-3xl md:text-5xl font-light tracking-[0.4em] uppercase text-[#00ccff]/80">
            {TEXT[lang].s1_1} <span className="font-serif italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"><br/><br/>{TEXT[lang].s1_2}</span>
          </h1>
        </motion.div>

        
        {/* SCENE 2 */}
        <motion.div style={{ opacity: s2, y: driftDown(0.07, 0.14) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-24 pt-20 md:pt-0">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10 mb-8 md:mb-0">
            <h1 className="text-xl md:text-2xl font-mono tracking-[0.4em] text-[#00ccff] mb-4">{TEXT[lang].s2_tag}</h1>
            <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest leading-tight">
              {TEXT[lang].s2_1}
            </h2>
            <p className="text-base md:text-xl font-serif italic tracking-widest mt-4 md:mt-8 md:border-l border-[#00ccff]/30 md:pl-6 opacity-80">
              {TEXT[lang].s2_2}
            </p>
          </div>
          <img src="/matsya-1.png" alt="Hands Offering Water" className="relative md:absolute md:right-24 w-[80vw] md:w-1/2 max-w-lg h-[30vh] md:h-[50vh] rounded-[2rem] md:rounded-[3rem] md:rounded-bl-none object-cover shadow-[0_0_40px_rgba(0,204,255,0.2)]" />
        </motion.div>
      {/* SCENE 3 */}
        <motion.div style={{ opacity: s3, x: driftLeft(0.14, 0.21) }} className="absolute inset-0 flex flex-col-reverse md:flex-row items-center justify-center md:justify-end px-6 md:px-24">
          <img src="/matsya-2.png" alt="Tiny Glowing Fish" className="relative md:absolute md:left-20 w-64 h-64 md:w-[20vw] md:h-[20vw] border border-[#00ccff]/30 shadow-[0_0_50px_rgba(0,204,255,0.2)] rounded-3xl object-cover mt-8 md:mt-0" />
          <div className="w-full md:max-w-xl text-center md:text-right z-10">
            <h1 className="text-3xl md:text-6xl font-light uppercase tracking-widest leading-tight mb-4 md:mb-6">
              <br className="hidden md:block"/>{TEXT[lang].s3_1}
            </h1>
            <p className="text-xl md:text-3xl font-serif text-[#00ccff] italic drop-shadow-md">&quot;{TEXT[lang].s3_2}&quot; </p>
          </div>
        </motion.div>
        {/* SCENE 4 */}
        <motion.div style={{ opacity: s4, y: driftUp(0.21, 0.28) }} className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-[12vw] font-black uppercase tracking-tighter leading-none text-white/5 absolute top-1/2 -translate-y-1/2 whitespace-nowrap select-none">
            {TEXT[lang].s4_bg}
          </h1>
          <div className="z-10 flex flex-col gap-8 text-center px-10">
            <h2 className="text-4xl md:text-6xl font-light tracking-widest uppercase">
              {TEXT[lang].s4_1} <span className="font-bold">{TEXT[lang].s4_1b}</span>
            </h2>
            <h2 className="text-4xl md:text-6xl font-light tracking-widest uppercase text-[#00ccff]">
              {TEXT[lang].s4_2} <span className="font-bold text-white">{TEXT[lang].s4_2b}</span>
            </h2>
          </div>
        </motion.div>

       {/* SCENE 5 */}
        <motion.div style={{ opacity: s5, y: driftDown(0.28, 0.35) }} className="absolute inset-0 flex items-center md:items-end justify-center md:pb-32 px-4 md:px-0">
          <div className="relative w-full max-w-6xl aspect-[4/3] md:aspect-[21/9] flex items-end p-6 md:p-10 rounded-3xl md:rounded-t-[4rem] overflow-hidden">
            <img src="/matsya-3.png" alt="Massive Shadow in Ocean" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative z-10 bg-black/60 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/10 w-full md:w-auto text-center md:text-left">
              <h1 className="text-xl md:text-5xl font-light uppercase tracking-widest text-white">{TEXT[lang].s5_1}</h1>
              <p className="text-base md:text-xl font-serif italic text-[#00ccff] mt-2 md:mt-4">{TEXT[lang].s5_2}</p>
            </div>
          </div>
        </motion.div>
        

       {/* SCENE 6 */}
        <motion.div style={{ opacity: s6, y: driftUp(0.35, 0.42) }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 md:px-10">
          <img src="/matsya-4.png" alt="Giant Glowing Eye" className="w-[90vw] md:w-[80vw] max-w-4xl h-[25vh] md:h-[40vh] mb-8 md:mb-12 border border-[#fbbf24]/30 rounded-2xl object-cover shadow-[0_0_40px_rgba(0,204,255,0.1)]" />
          <p className="text-sm md:text-2xl tracking-[0.4em] uppercase opacity-70 mb-2 md:mb-4">{TEXT[lang].s6_1}</p>
          <h1 className="text-3xl md:text-7xl font-serif italic text-[#fbbf24] drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            &quot;{TEXT[lang].s6_2}&quot;
          </h1>
        </motion.div>

        {/* SCENE 7 */}
        <motion.div style={{ opacity: s7, x: driftRight(0.42, 0.49) }} className="absolute inset-0 flex items-center justify-center px-10">
          <div className="text-center">
            <h1 className="text-[15vw] font-black uppercase tracking-tighter leading-[0.8] text-white mix-blend-overlay opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {TEXT[lang].s7_bg}
            </h1>
            <h2 className="relative z-10 text-6xl md:text-8xl font-serif uppercase text-[#ff3366] mb-6 drop-shadow-[0_0_40px_rgba(255,51,102,0.4)]">
              {TEXT[lang].s7_1}
            </h2>
            <p className="relative z-10 text-2xl md:text-4xl font-light tracking-[0.3em] uppercase">
              {TEXT[lang].s7_2}
            </p>
          </div>
        </motion.div>

        {/* SCENE 8 */}
        <motion.div style={{ opacity: s8, y: driftUp(0.49, 0.56) }} className="absolute inset-0 flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-24">
          <div className="w-full md:max-w-xl text-center md:text-left mb-8 md:mb-0">
            <h1 className="text-3xl md:text-7xl font-light uppercase tracking-widest text-[#fbbf24] mb-6 md:mb-8 leading-tight">
              &quot;{TEXT[lang].s8_1}&quot;<br className="hidden md:block"/><span className="text-white">{TEXT[lang].s8_1b}</span>
            </h1>
            <div className="md:pl-6 md:border-l-2 border-[#fbbf24]/50">
              <p className="text-base md:text-2xl tracking-[0.2em] uppercase font-serif italic mb-2">&quot;{TEXT[lang].s8_2}&quot;</p>
              <p className="text-base md:text-2xl tracking-[0.2em] uppercase font-serif italic text-[#00ccff]">&quot;{TEXT[lang].s8_3}&quot;</p>
            </div>
          </div>
          <img src="/matsya-5.png" alt="Tiny Golden Ark" className="w-[80vw] md:w-[35vw] h-[25vh] md:h-[25vw] border border-[#fbbf24]/50 shadow-[0_0_60px_rgba(251,191,36,0.15)] rounded-2xl object-cover" />
        </motion.div>

        {/* SCENE 9 */}
        <motion.div style={{ opacity: s9, y: driftDown(0.56, 0.63) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <p className="text-xl md:text-2xl font-mono tracking-[0.5em] text-white/40 mb-8 uppercase">{TEXT[lang].s9_tag}</p>
          <h1 className="text-4xl md:text-6xl font-light uppercase tracking-widest leading-relaxed max-w-4xl">
            {TEXT[lang].s9_1}<br/>
            <span className="font-serif italic opacity-60">{TEXT[lang].s9_2}</span>
          </h1>
        </motion.div>

        {/* SCENE 10 */}
        <motion.div style={{ opacity: s10, y: driftUp(0.63, 0.70) }} className="absolute inset-0 flex items-center justify-center text-center">
          <div className="w-[1px] h-32 bg-gradient-to-b from-transparent to-[#00ccff] mb-8" />
          <h1 className="text-5xl md:text-7xl font-serif text-[#00ccff] drop-shadow-[0_0_50px_rgba(0,204,255,0.6)]">
            {TEXT[lang].s10_1}
          </h1>
        </motion.div>

        {/* SCENE 11 */}
        <motion.div style={{ opacity: s11, y: driftLeft(0.70, 0.77) }} className="absolute inset-0 flex items-center px-10 md:px-24">
          <h1 className="text-[25vw] font-black text-[#00ccff]/5 absolute -left-10 top-1/2 -translate-y-1/2 leading-none select-none">MATSYA</h1>
          <div className="flex-1 z-10 pl-10 border-l border-[#00ccff]/30">
            <p className="text-2xl tracking-[0.4em] uppercase text-white/60 mb-4">The Preserver, Vishnu.</p>
            <h2 className="text-6xl md:text-8xl font-serif uppercase tracking-widest text-[#00ccff] drop-shadow-[0_0_30px_rgba(0,204,255,0.4)]">
              {TEXT[lang].s11_1}
            </h2>
          </div>
        </motion.div>

        {/* SCENE 12 */}
        <motion.div style={{ opacity: s12, y: driftRight(0.77, 0.84) }} className="absolute inset-0 flex flex-col-reverse md:flex-row-reverse items-center justify-center md:justify-between px-6 md:px-24">
          <img src="/matsya-6.png" alt="Vasuki Serpent Tether" className="w-[80vw] md:w-[40vw] h-[60vh] md:h-[50vh] border border-[#fbbf24]/30 rounded-[2rem] object-cover shadow-[0_0_40px_rgba(251,191,36,0.1)] mt-8 md:mt-0" />
          <div className="w-full md:flex-1 z-10 text-center md:text-right pr-0 md:pr-16">
            <h2 className="text-3xl md:text-6xl font-light uppercase tracking-widest leading-tight mb-4 md:mb-8">
              &quot;{TEXT[lang].s12_1}<br className="hidden md:block"/> &quot;
            </h2>
            <div className=" bg-gradient-to-b from-[#00ccff] to-transparent mb-5" />
          <div className="text-xl md:text-xl font-serif leading-tight p-3 border-white/10 bg-[#020617]/80 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,204,255,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ccff] to-transparent opacity-50" />
{TEXT[lang].s12_2}
          </div>
         </div>
        </motion.div>

        {/* SCENE 13 */}
        <motion.div style={{ opacity: s13, y: driftUp(0.84, 0.91) }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-10">
          <img src="/matsya-7.png" alt="Leviathan Pulling Ark" className="w-full max-w-5xl h-[25vh] md:h-[40vh] rounded-[2rem] md:rounded-[3rem] border-t border-[#00ccff]/50 mb-8 md:mb-12 shadow-[0_-20px_50px_rgba(0,204,255,0.1)] object-cover" />
          <h1 className="text-xl md:text-5xl font-light uppercase tracking-[0.2em] leading-relaxed max-w-4xl">
            {TEXT[lang].s13_1}<br/>
            <span className="font-serif italic text-[#fbbf24]">{TEXT[lang].s13_2}</span>
          </h1>
        </motion.div>

        {/* SCENE 14 */}
        <motion.div style={{ opacity: s14 }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
          <h1 className="text-2xl md:text-4xl font-light tracking-[0.3em] uppercase mb-12 text-[#00ccff]">
            {TEXT[lang].s14_title}
          </h1>
          <div className="w-[1px] h-32 bg-gradient-to-b from-[#00ccff] to-transparent mb-12" />
          <div className="max-w-4xl text-3xl md:text-5xl font-serif leading-tight p-12 border border-white/10 bg-[#020617]/80 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(0,204,255,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ccff] to-transparent opacity-50" />
            &quot;{TEXT[lang].s14_1} <span className="text-white italic"></span><br/><br/>
            <span className="text-[#fbbf24] uppercase tracking-widest text-2xl md:text-4xl not-italic">{TEXT[lang].s14_2}</span>&quot;
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}