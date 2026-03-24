import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Icosahedron, Torus, TorusKnot, Sphere, Cone, Octahedron, Image } from '@react-three/drei';
import { motion, useScroll, useSpring, useTransform, useVelocity, AnimatePresence, useInView } from 'framer-motion';
import VamanaLore from './VamanaLore'; 
import MatsyaLore from './MatsyaLore'; 
import KurmaLore from './KurmaLore';
import VarahaLore from './VarahaLore';
import ParshuramaLore from './ParshuramaLore';
import NarasimhaLore from './NarasimhaLore';
import { EffectComposer, Bloom, Vignette, Glitch } from '@react-three/postprocessing';
import * as THREE from 'three';
import LustBreaker from './LustBreaker';
import MayaProtocol from './MayaProtocol';
import KarmaProtocol from './KarmaProtocol';
import { setGlobalMusic } from './GlobalAudio'; // Make sure this is at the top of the file!
import RamaLore from './RamaLore';
import NeuralReality from './NeuralReality';
import LifesaverProtocol from './LifesaverProtocol';

// --------------------------------------------------------
// 🌐 THE HUB MULTI-LANGUAGE DICTIONARY
// --------------------------------------------------------
const HUB_TEXT = {
  en: {
    exitHub: "← Exit Hub",
    skipAvatars: "Skip to Avatars ⚡",
    protocolOjas: "Protocol: Ojas",
    kshiraSagara: "Kshira Sagara",
    webDharma: "The Web of Dharma",
    unfolds: "Unfolds Before You",
    leaveKarmaTitle: "Leave your Karma",
    leaveKarmaDesc: "The universe listens. Dump your digital burnout, your realizations, or your deepest stress into the void.",
    karmaPlaceholder: "I realized today that...",
    surrenderBtn: "Surrender to Cosmos",
    shattering: "Shattering Maya...",
    transmuted: "Transmuted.",
    karmaJoins: "Your karma joins the infinite.",
    pressHold: "Press & Hold\nto Ascend",
    astrolabeTitle: "The Astrolabe of Time",
    scrollRotate: "Scroll to rotate the wheel ↓",
    returnAstrolabe: "← Return to Astrolabe",
    domainOf: "Domain of",
    forging: "This realm is currently being forged in the cosmos.",
    dharma: [
      { title: "The Engine", sub: "Action is your right.", desc: "Every thought sends a ripple through the cosmic ocean. Karma is the absolute physics of the soul." },
      { title: "Architecture", sub: "Your own path.", desc: "Dharma is the invisible framework holding reality together. It is your ultimate purpose." },
      { title: "The Core", sub: "Never born, never dies.", desc: "Beneath the ego lies the eternal observer. You are the entire ocean in a drop." },
      { title: "The Illusion", sub: "Woven by the mind.", desc: "A simulation so perfect that even the gods forget their true nature." }
    ],
    avatars: [
      { name: "MATSYA", desc: "The Fish. Guiding the ark of consciousness through the cosmic deluge." },
      { name: "KURMA", desc: "The Tortoise. The absolute foundation supporting the churning of the universe." },
      { name: "VARAHA", desc: "The Boar. Diving into the chaotic abyss to rescue the earth from darkness." },
      { name: "NARASIMHA", desc: "The Man-Lion. The fierce protector who destroys the ego of the tyrant." },
      { name: "VAMANA", desc: "The Dwarf. Claiming all three worlds in three cosmic strides." },
      { name: "PARASHURAMA", desc: "The Warrior. Cleansing the earth of corrupted kings and arrogance." },
      { name: "RAMA", desc: "The King. The absolute embodiment of Dharma and righteous duty." },
      { name: "KRISHNA", desc: "The Divine Statesman. The master of Maya, teaching the ultimate truth of the Gita." },
      { name: "BUDDHA", desc: "The Awakened. Teaching compassion and the cessation of worldly desire." },
      { name: "KALKI", desc: "The Destroyer. Riding the white horse to burn away the filth of Kalyug." }
    ]
  },
  hi: {
    exitHub: "← हब से बाहर निकलें",
    skipAvatars: "अवतारों पर जाएं ⚡",
    protocolOjas: "प्रोटोकॉल: ओजस",
    kshiraSagara: "क्षीर सागर",
    webDharma: "धर्म का जाल",
    unfolds: "आपके सामने खुल रहा है",
    leaveKarmaTitle: "अपना कर्म छोड़ें",
    leaveKarmaDesc: "ब्रह्मांड सुन रहा है। अपनी डिजिटल थकावट, अपने विचार, या अपने सबसे गहरे तनाव को इस शून्य में डाल दें।",
    karmaPlaceholder: "आज मुझे यह एहसास हुआ कि...",
    surrenderBtn: "ब्रह्मांड को समर्पित करें",
    shattering: "माया टूट रही है...",
    transmuted: "रूपांतरित।",
    karmaJoins: "आपका कर्म अनंत में मिल गया है।",
    pressHold: "आरोहण के लिए\nदबाकर रखें",
    astrolabeTitle: "समय का एस्ट्रोलेब",
    scrollRotate: "पहिया घुमाने के लिए स्क्रॉल करें ↓",
    returnAstrolabe: "← एस्ट्रोलेब पर लौटें",
    domainOf: "का क्षेत्र",
    forging: "यह क्षेत्र वर्तमान में ब्रह्मांड में बनाया जा रहा है।",
    dharma: [
      { title: "इंजन", sub: "कर्म आपका अधिकार है।", desc: "हर विचार ब्रह्मांडीय महासागर में एक लहर भेजता है। कर्म आत्मा की परम भौतिकी है।" },
      { title: "वास्तुकला", sub: "आपका अपना मार्ग।", desc: "धर्म वह अदृश्य ढांचा है जो वास्तविकता को एक साथ बांधे रखता है। यह आपका अंतिम उद्देश्य है।" },
      { title: "मूल", sub: "न कभी जन्म लेता है, न कभी मरता है।", desc: "अहंकार के नीचे शाश्वत द्रष्टा छिपा है। आप एक बूंद में पूरा महासागर हैं।" },
      { title: "भ्रम", sub: "मन द्वारा बुना गया।", desc: "एक सिमुलेशन इतना परिपूर्ण कि देवता भी अपना वास्तविक स्वरूप भूल जाते हैं।" }
    ],
    avatars: [
      { name: "मत्स्य", desc: "मछली। ब्रह्मांडीय प्रलय के माध्यम से चेतना की नाव का मार्गदर्शन।" },
      { name: "कूर्म", desc: "कछुआ। ब्रह्मांड के मंथन का समर्थन करने वाली पूर्ण नींव।" },
      { name: "वराह", desc: "जंगली सूअर। पृथ्वी को अंधकार से बचाने के लिए अराजक रसातल में गोता लगाना।" },
      { name: "नरसिंह", desc: "मानव-सिंह। भयंकर रक्षक जो अत्याचारी के अहंकार को नष्ट करता है।" },
      { name: "वामन", desc: "बौना। तीन ब्रह्मांडीय कदमों में तीनों लोकों पर दावा करना।" },
      { name: "परशुराम", desc: "योद्धा। भ्रष्ट राजाओं और अहंकार की पृथ्वी को शुद्ध करना।" },
      { name: "राम", desc: "राजा। धर्म और धार्मिक कर्तव्य का पूर्ण अवतार।" },
      { name: "कृष्ण", desc: "दिव्य राजनेता। माया के स्वामी, गीता के परम सत्य की शिक्षा देते हुए।" },
      { name: "बुद्ध", desc: "जाग्रत। करुणा और सांसारिक इच्छाओं की समाप्ति की शिक्षा।" },
      { name: "कल्कि", desc: "संहारकर्ता। कलियुग की गंदगी को जलाने के लिए सफेद घोड़े पर सवार।" }
    ]
  },
  mr: {
    exitHub: "← हब मधून बाहेर पडा",
    skipAvatars: "अवतार पहा ⚡",
    protocolOjas: "प्रोटोकॉल: ओजस",
    kshiraSagara: "क्षीर सागर",
    webDharma: "धर्माचे जाळे",
    unfolds: "तुमच्या समोर उलगडत आहे",
    leaveKarmaTitle: "तुमचे कर्म सोडा",
    leaveKarmaDesc: "ब्रह्मांड ऐकत आहे. तुमचा डिजिटल थकवा, तुमचे विचार किंवा तुमचा सर्वात खोल ताण या पोकळीत सोडून द्या.",
    karmaPlaceholder: "आज मला जाणवले की...",
    surrenderBtn: "ब्रह्मांडाला समर्पित करा",
    shattering: "माया भंग पावत आहे...",
    transmuted: "रूपांतरित.",
    karmaJoins: "तुमचे कर्म अनंतात विलीन झाले आहे.",
    pressHold: "वर जाण्यासाठी\nदाबून ठेवा",
    astrolabeTitle: "काळाचे एस्ट्रोलेब",
    scrollRotate: "चाक फिरवण्यासाठी स्क्रोल करा ↓",
    returnAstrolabe: "← एस्ट्रोलेब वर परत जा",
    domainOf: "चे क्षेत्र",
    forging: "हे क्षेत्र सध्या ब्रह्मांडात घडवले जात आहे.",
    dharma: [
      { title: "इंजिन", sub: "कर्म हा तुमचा अधिकार आहे.", desc: "प्रत्येक विचार वैश्विक महासागरात एक लहर निर्माण करतो. कर्म हे आत्म्याचे परिपूर्ण भौतिकशास्त्र आहे." },
      { title: "वास्तुकला", sub: "तुमचा स्वतःचा मार्ग.", desc: "धर्म हा तो अदृश्य सांगाडा आहे जो वास्तवाला एकत्र बांधून ठेवतो. हा तुमचा अंतिम हेतू आहे." },
      { title: "मूळ", sub: "कधीही जन्म घेत नाही, कधीही मरत नाही.", desc: "अहंकाराच्या खाली शाश्वत दृष्टा लपलेला असतो. तुम्ही एका थेंबातला संपूर्ण महासागर आहात." },
      { title: "भ्रम", sub: "मनाने विणलेले.", desc: "एक असे परिपूर्ण सिमुलेशन की देव सुद्धा त्यांचे खरे स्वरूप विसरतात." }
    ],
    avatars: [
      { name: "मत्स्य", desc: "मासा. वैश्विक प्रलयातून जाणिवेच्या नावेला मार्गदर्शन करणारा." },
      { name: "कूर्म", desc: "कासव. विश्वाच्या मंथनाला आधार देणारा परिपूर्ण पाया." },
      { name: "वराह", desc: "रानडुक्कर. पृथ्वीला अंधारातून वाचवण्यासाठी अराजकतेच्या गर्तेत डुबकी मारणारा." },
      { name: "नरसिंह", desc: "मानव-सिंह. अत्याचाऱ्याचा अहंकार नष्ट करणारा भयंकर रक्षक." },
      { name: "वामन", desc: "बुटका. तीन वैश्विक पावलांमध्ये तिन्ही जगांवर हक्क सांगणारा." },
      { name: "परशुराम", desc: "योद्धा. भ्रष्ट राजे आणि अहंकारापासून पृथ्वीला शुद्ध करणारा." },
      { name: "राम", desc: "राजा. धर्म आणि नीतिमत्तेचा परिपूर्ण अवतार." },
      { name: "कृष्ण", desc: "दैवी मुत्सद्दी. मायेचा स्वामी, गीतेचे परम सत्य शिकवणारा." },
      { name: "बुद्ध", desc: "जागृत. करुणा आणि ऐहिक इच्छांच्या अंताची शिकवण देणारा." },
      { name: "कल्कि", desc: "संहारकर्ता. कलियुगाची घाण जाळून टाकण्यासाठी पांढऱ्या घोड्यावर स्वार होणारा." }
    ]
  }
};

// --------------------------------------------------------
// 📜 THE LORE DATA
// --------------------------------------------------------
const DHARMA_LORE = [
  { id: "01", side: "left", phase: "KARMA", color: "#ff3366" },
  { id: "02", side: "right", phase: "DHARMA", color: "#00ccff" },
  { id: "03", side: "left", phase: "ATMAN", color: "#fbbf24" },
  { id: "04", side: "right", phase: "MAYA", color: "#b026ff" }
];

const DASHAVATARA = [
  { id: "I" }, { id: "II" }, { id: "III" }, { id: "IV" }, { id: "V" },
  { id: "VI" }, { id: "VII" }, { id: "VIII" }, { id: "IX" }, { id: "X" }
];

// --------------------------------------------------------
// 🐍 PHASE 1 COMPONENT: THE SERPENT
// --------------------------------------------------------
const SheshaSerpent = ({ journeyPhase }) => {
  const meshRef = useRef();
  const curve = useMemo(() => {
    const points = [];
    for (let i = 0; i < 200; i++) {
      const angle = 0.25 * i;
      const x = Math.sin(angle) * 14;
      const z = Math.cos(angle) * 14 - 5;
      const y = 15 - (i * 1.5); 
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.position.y = state.camera.position.y * 0.4;
      if (journeyPhase !== 'descent') {
        meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, 0, delta * 2);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 10, -5]}>
      <tubeGeometry args={[curve, 250, 0.8, 12, false]} />
      <meshStandardMaterial color="#00ccff" emissive="#004466" wireframe transparent opacity={0.15} />
    </mesh>
  );
};

// --------------------------------------------------------
// 🌊 PHASE 1 COMPONENT: THE OCEAN GLSL
// --------------------------------------------------------
const OceanOfMilk = ({ scrollVelocity, journeyPhase }) => {
  const pointsRef = useRef(); const geoRef = useRef();
  const { positions, randoms } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(150, 150, 64, 64);
    const pos = geo.attributes.position.array;
    const rand = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) {
      rand[i] = (Math.random() - 0.5) * 50;     
      rand[i+1] = (Math.random() - 0.5) * 50; 
      rand[i+2] = (Math.random() - 0.5) * 50; 
    }
    return { positions: pos, randoms: rand };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uSpeed: { value: 0 }, uDissolve: { value: 0 }, uColor: { value: new THREE.Color("#00ccff") }
  }), []);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta * 0.3;
    uniforms.uSpeed.value = Math.abs(scrollVelocity.get() || 0);
    if (journeyPhase !== 'descent') uniforms.uDissolve.value = THREE.MathUtils.lerp(uniforms.uDissolve.value, 1.0, delta * 0.8);
    if (pointsRef.current) pointsRef.current.position.y = state.camera.position.y - 8;
  });

  return (
    <points ref={pointsRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, -10]}>
     <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aRandom" count={randoms.length / 3} array={randoms} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} uniforms={uniforms}
        vertexShader={`
          attribute vec3 aRandom;
          uniform float uTime; uniform float uSpeed; uniform float uDissolve; varying float vDissolve;
          void main() {
            vDissolve = uDissolve; vec3 pos = position;
            float waveHeight = mix(0.6, 2.5, min(uSpeed * 1.5, 1.0));
            float waveSpeed = mix(0.2, 1.0, min(uSpeed * 1.5, 1.0));
            pos.z += sin(pos.x * waveSpeed + uTime) * waveHeight + cos(pos.y * waveSpeed + uTime) * waveHeight;
            pos += aRandom * pow(uDissolve, 1.5) * 1.5; pos.z -= uDissolve * 40.0; 
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = (15.0 / -mvPosition.z) * max(0.0, (1.0 - uDissolve * 0.9));
          }
        `}
        fragmentShader={`
          uniform vec3 uColor; varying float vDissolve;
          void main() {
            if(distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;
            gl_FragColor = vec4(uColor, 0.6 * max(0.0, (1.0 - vDissolve * 1.5)));
          }
        `}
      />
    </points>
  );
};

// --------------------------------------------------------
// 🌌 PHASE 1 COMPONENT: LORE ARTIFACTS
// --------------------------------------------------------
const CosmicArtifacts = ({ activePhase, journeyPhase }) => {
  const karmaRef = useRef(); const dharmaRef = useRef(); const atmanRef = useRef(); const mayaRef = useRef();
  const targetScale = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const isDescent = journeyPhase === 'descent';
    const lerpSpeed = 4;
    const kTarget = (activePhase === '01' && isDescent) ? 1.5 : 0.001;
    if (karmaRef.current) { karmaRef.current.scale.lerp(targetScale.setScalar(kTarget), delta * lerpSpeed); karmaRef.current.visible = karmaRef.current.scale.x > 0.05; karmaRef.current.rotation.x += delta * 0.5; }
    const dTarget = (activePhase === '02' && isDescent) ? 1.5 : 0.001;
    if (dharmaRef.current) { dharmaRef.current.scale.lerp(targetScale.setScalar(dTarget), delta * lerpSpeed); dharmaRef.current.visible = dharmaRef.current.scale.x > 0.05; dharmaRef.current.rotation.y += delta * 0.5; }
    const aTarget = (activePhase === '03' && isDescent) ? 1.5 : 0.001;
    if (atmanRef.current) { atmanRef.current.scale.lerp(targetScale.setScalar(aTarget), delta * lerpSpeed); atmanRef.current.visible = atmanRef.current.scale.x > 0.05; atmanRef.current.rotation.z += delta * 0.5; }
    const mTarget = (activePhase === '04' && isDescent) ? 1.8 : 0.001;
    if (mayaRef.current) { mayaRef.current.scale.lerp(targetScale.setScalar(mTarget), delta * lerpSpeed); mayaRef.current.visible = mayaRef.current.scale.x > 0.05; mayaRef.current.rotation.x += delta * 0.8; mayaRef.current.rotation.y += delta * 0.8; }
  });

  return (
    <group>
      <group ref={karmaRef} position={[5, 0, 0]}><Torus args={[1, 0.05, 16, 100]}><meshStandardMaterial color="#ff3366" emissive="#ff3366" emissiveIntensity={2} /></Torus></group>
      <group ref={dharmaRef} position={[-5, 0, 0]}><Icosahedron args={[1, 0]}><meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1} wireframe /></Icosahedron></group>
      <group ref={atmanRef} position={[5, 0, 0]}><Sphere args={[1, 32, 32]}><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} wireframe /></Sphere></group>
      <group ref={mayaRef} position={[-5, 0, 0]}><TorusKnot args={[0.8, 0.2, 100, 16]}><meshStandardMaterial color="#b026ff" emissive="#6600cc" emissiveIntensity={2} wireframe /></TorusKnot></group>
    </group>
  );
};

// --------------------------------------------------------
// ✨ PHASE 2 COMPONENT: AKASHIC GALAXY
// --------------------------------------------------------
const AkashicGalaxy = ({ journeyPhase }) => {
  const meshRef = useRef(); const count = 5000;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const r = 10 + Math.random() * 80; const theta = Math.random() * 2 * Math.PI; const phi = Math.acos((Math.random() * 2) - 1);
      temp.push({ x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.sin(phi) * Math.sin(theta), z: r * Math.cos(phi), scale: Math.random() * 0.5 + 0.1 });
    }
    return temp;
  }, [count]);

  useEffect(() => {
    if (meshRef.current) {
      particles.forEach((p, i) => { dummy.position.set(p.x, p.y, p.z); dummy.scale.setScalar(p.scale); dummy.updateMatrix(); meshRef.current.setMatrixAt(i, dummy.matrix); });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, particles]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
      const targetOpacity = (journeyPhase === 'akashic' || journeyPhase === 'astrolabe') ? 0.8 : 0.0;
      meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, targetOpacity, delta * 0.5);
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0} depthWrite={false} />
    </instancedMesh>
  );
};

// --------------------------------------------------------
// 🤍 PHASE 3 COMPONENT: THE MOKSHA HOLD
// --------------------------------------------------------
const MokshaCore = ({ isHolding, onAwaken, journeyPhase }) => {
  const burnoutRef = useRef();
  const progress = useRef(0);

  useFrame((state, delta) => {
    if (journeyPhase !== 'akashic') {
      if (burnoutRef.current) burnoutRef.current.opacity = THREE.MathUtils.lerp(burnoutRef.current.opacity, 0, delta * 2);
      return;
    }

    if (isHolding) {
      progress.current += delta * 0.3; 
      if (navigator.vibrate && Math.random() > 0.8) navigator.vibrate(50);
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 40) * progress.current * 0.1;
      state.camera.position.y = Math.cos(state.clock.elapsedTime * 45) * progress.current * 0.1;
      
      if (progress.current >= 1.0) onAwaken();
    } else {
      progress.current = Math.max(0, progress.current - delta * 1.5);
      state.camera.position.lerp(new THREE.Vector3(0, 0, 8), delta * 5);
    }

    if (burnoutRef.current) burnoutRef.current.opacity = progress.current;
  });

  return (
    <mesh position={[0, 0, 6]}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial ref={burnoutRef} color="#ffffff" transparent opacity={0} depthTest={false} />
    </mesh>
  );
};

// --------------------------------------------------------
// ☸️ PHASE 4 COMPONENT: THE DASHAVATARA ASTROLABE 
// --------------------------------------------------------
const DashavataraAstrolabe = ({ journeyPhase, activeAvatar, setActiveLore }) => {
  const groupRef = useRef();
  const ring1 = useRef(); const ring2 = useRef(); const ring3 = useRef();

  const avatars = useMemo(() => {
    const items = [];
    const radius = 4.5; 
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      items.push({ id: i, x: Math.sin(angle) * radius, z: Math.cos(angle) * radius, angle });
    }
    return items;
  }, []);

  useFrame((state, delta) => {
    if (journeyPhase !== 'astrolabe') return;

    const targetRotation = activeAvatar * (Math.PI * 2 / 10);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -targetRotation, delta * 4);

    ring1.current.rotation.x += delta * 0.2;
    ring2.current.rotation.y -= delta * 0.3;
    ring3.current.rotation.z += delta * 0.1;
  });

  if (journeyPhase !== 'astrolabe') return null;

  return (
    <group position={[0, 0, 0]}>
      <group>
        <Torus ref={ring1} args={[7, 0.02, 16, 100]} rotation={[Math.PI/2, 0, 0]}><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} /></Torus>
        <Torus ref={ring2} args={[7.5, 0.01, 16, 100]} rotation={[0, Math.PI/3, 0]}><meshStandardMaterial color="#00ccff" transparent opacity={0.3} /></Torus>
        <Torus ref={ring3} args={[8, 0.01, 16, 100]} rotation={[0, 0, Math.PI/4]}><meshStandardMaterial color="#ff3366" transparent opacity={0.3} /></Torus>
      </group>

      <group ref={groupRef}>
        {avatars.map((av, index) => {
          const isActive = activeAvatar === index;
          
          return (
            <group key={av.id} position={[av.x, 0, av.z]} rotation={[0, av.angle, 0]}>
              <mesh
                scale={isActive ? [1.2, 2.4, 1.2] : [0.5, 1, 0.5]} 
                onClick={(e) => {
                  e.stopPropagation(); 
                  if (isActive) {
                    setActiveLore(DASHAVATARA[index].id); 
                  }
                }}
                onPointerOver={() => { if(isActive) document.body.style.cursor = 'pointer' }}
                onPointerOut={() => document.body.style.cursor = 'auto'}
              >
             
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial 
                  color={isActive ? "#fbbf24" : "#00ccff"} 
                  emissive={isActive ? "#fbbf24" : "#00ccff"}
                  emissiveIntensity={isActive ? 2 : 0.2}
                  wireframe={!isActive} 
                  transparent
                  opacity={isActive ? 1 : 0.3}
                />
              </mesh>
              {isActive && <pointLight color="#fbbf24" distance={10} intensity={3} position={[0, 0, 2]} />}
            </group>
          );
        })}
      </group>
    </group>
  );
};
// --------------------------------------------------------
// 🎴 HTML LORE CARD (Phase 1)
// --------------------------------------------------------
const LoreCard = ({ section, index, lang, setActivePhase, isGlitching }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-30% 0px -30% 0px" });
  useEffect(() => { if (isInView) setActivePhase(section.id); }, [isInView, section.id, setActivePhase]);

  const content = HUB_TEXT[lang].dharma[index];

  return (
    <div ref={ref} className="relative w-full h-[130vh] flex items-center justify-center pointer-events-none">
      <div className={`w-full max-w-7xl px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10`}>
        <div className={`${section.side === 'left' ? 'order-2' : 'order-1'} hidden md:block`} />
        <motion.div 
          initial={{ opacity: 0, x: section.side === 'left' ? -30 : 30, filter: "blur(15px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }} viewport={{ once: false, margin: "-20% 0px -20% 0px" }} transition={{ duration: 1 }}
          className={`${section.side === 'left' ? 'order-1 items-start text-left' : 'order-2 items-start text-left'} flex flex-col justify-center pointer-events-auto`}
        >
          <div className={`max-w-md ${section.id === "04" && isGlitching ? 'animate-pulse skew-x-2 drop-shadow-[0_0_20px_rgba(176,38,255,0.8)]' : ''}`}>
            <h1 className="text-4xl md:text-6xl font-serif text-white uppercase mb-4 drop-shadow-2xl">{content.title}</h1>
            <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 opacity-20" style={{ backgroundColor: section.color }}></div>
              <h2 className="text-[#fbbf24] text-sm uppercase tracking-widest mb-2 font-bold">{content.sub}</h2>
              <p className="text-sm text-white/60 leading-relaxed font-light">{content.desc}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --------------------------------------------------------
// 🪐 DEFAULT LORE PAGE 
// --------------------------------------------------------
const DefaultLore = ({ avatar, index, lang, onBack }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const content = HUB_TEXT[lang].avatars[index];

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#0a0514] font-sans text-white overflow-hidden">
      <button onClick={onBack} className="absolute top-6 left-6 z-[100] px-6 py-2 border border-white/30 rounded-full text-white/70 text-xs tracking-widest uppercase hover:bg-white/10 transition-all backdrop-blur-md cursor-pointer">
        {HUB_TEXT[lang].returnAstrolabe}
      </button>
      
      <div className="flex flex-col items-center text-center max-w-2xl px-6 relative z-10">
        <h3 className="text-[#00ccff] tracking-[0.5em] uppercase text-xs md:text-sm font-mono mb-4">Avatar {avatar.id} // {content.name}</h3>
        <h1 className="text-5xl md:text-7xl font-serif uppercase tracking-widest mb-6 drop-shadow-[0_0_30px_rgba(0,204,255,0.4)]">
          {HUB_TEXT[lang].domainOf} {content.name}
        </h1>
        <div className="w-[1px] h-16 bg-gradient-to-b from-[#00ccff] to-transparent mb-8" />
        <p className="text-white/50 text-sm md:text-base font-light tracking-widest uppercase animate-pulse">
          {HUB_TEXT[lang].forging}
        </p>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-[40rem] h-[40rem] bg-[#00ccff] rounded-full blur-[150px]" />
      </div>
    </div>
  );
};

// ==========================================
// 🚀 THE MAIN HUB EXPORT
// ==========================================
export default function CosmicHub({ onBack }) {
  const [lang, setLang] = useState('en'); // 👈 ADD THIS!
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  // ⚡ LISTEN FOR THE EMERGENCY TELEPORT
  useEffect(() => {
    const handleOpenOjas = () => setActiveLore('lustbreaker');
    window.addEventListener('openOjas', handleOpenOjas);
    return () => window.removeEventListener('openOjas', handleOpenOjas);
  }, []);

  const [activeAvatar, setActiveAvatar] = useState(0);
  const [activeLore, setActiveLore] = useState(null);
  const [activePhase, setActivePhase] = useState(null);
  const [journalEntry, setJournalEntry] = useState("");
  
  const [journeyPhase, setJourneyPhase] = useState('descent'); 
  const [isHolding, setIsHolding] = useState(false);

  const { scrollYProgress } = useScroll(); 

 // 1. Store refs so they don't trigger re-renders and mess up the history stack
  const activeLoreRef = useRef(activeLore);
  const onBackRef = useRef(onBack);

  useEffect(() => { activeLoreRef.current = activeLore; }, [activeLore]);
  useEffect(() => { onBackRef.current = onBack; }, [onBack]);

  // 2. The Bulletproof Hub-Level History Controller
  useEffect(() => {
    // Only inject if it's a fresh load (prevents React Strict Mode from double-pushing)
    if (!window.history.state || window.history.state.page !== 'cosmic-hub') {
      window.history.pushState({ page: 'cosmic-hub' }, '', '');
    }

    const handlePopState = () => {
      if (activeLoreRef.current) {
        setActiveLore(null); // Close the Lore page, stay in the Hub
      } else {
        onBackRef.current(); // You are in Kshirsagar/Astrolabe: Exit Hub safely!
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // <--- EMPTY ARRAY IS CRITICAL

  // 3. The Scroll Memory Bank & Safe Lore Opener
  const savedScrollRef = useRef(0);

  const openLore = (id) => {
    savedScrollRef.current = window.scrollY; // Save your exact spot in the Hub!
    window.history.pushState({ page: 'lore', id }, '', '');
    setActiveLore(id);
  };

  // 4. The Teleporter
  useEffect(() => {
    if (activeLore === null) {
      // Instantly restore Hub scroll when you come back
      window.scrollTo({ top: savedScrollRef.current, behavior: 'instant' });
    } else {
      // Force new Lore pages to start perfectly at the top
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeLore]);
  
  // 🔥 THE FIX: Zero-bounce math applied to the main scroll!
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 90, mass: 0.1 });
  const scrollVelocity = useVelocity(smoothProgress);  
  // ✨ This constantly watches if you are in the main hub or a sub-page!
  useEffect(() => {
    if (activeLore === null) {
      setGlobalMusic('kshirsagar'); // Plays the Ocean of Milk theme when in the hub
    }
  }, [activeLore]);

  // --------------------------------------------------------
  // ✨ CINEMATIC INTRO MATH
  // --------------------------------------------------------
  const eyeScaleY = useTransform(smoothProgress, [0, 0.03], [1, 0]);
  const titleOpacity = useTransform(smoothProgress, [0.01, 0.04, 0.18, 0.22], [0, 1, 1, 0]);
  const titleScale = useTransform(smoothProgress, [0.01, 0.22], [0.95, 1.05]);
  const vishnuY = useTransform(smoothProgress, [0.07, 0.14, 0.18, 0.22], ["100%", "5%", "0%", "-50%"]);
  const vishnuOpacity = useTransform(smoothProgress, [0.07, 0.11, 0.18, 0.22], [0, 1, 1, 0]);
  const webOfDharmaOpacity = useTransform(smoothProgress, [0.24, 0.28, 0.40, 0.45], [0, 1, 1, 0]);
  const webOfDharmaY = useTransform(smoothProgress, [0.24, 0.45], [100, -100]);
  const webOfDharmaScale = useTransform(smoothProgress, [0.24, 0.45], [0.9, 1.2]);
  
  // ✨ SYSTEMATIC ASTROLABE SCROLLING
  const astrolabeContainerRef = useRef(null);
  const { scrollYProgress: astrolabeScroll } = useScroll({ target: astrolabeContainerRef });
  
  // 🔥 THE FIX: Zero-bounce math applied to the Astrolabe wheel!
  const smoothAstrolabe = useSpring(astrolabeScroll, { stiffness: 400, damping: 90, mass: 0.1 });
  
  const chimeRef = useRef(typeof Audio !== "undefined" ? new Audio("https://www.soundjay.com/misc/sounds/magic-chime-01.mp3") : null);

  useEffect(() => {
    return smoothAstrolabe.onChange((latest) => {
      if (journeyPhase === 'astrolabe') {
        const newIndex = Math.max(0, Math.min(9, Math.floor(latest * 10)));
        
        if (newIndex !== activeAvatar) {
          setActiveAvatar(newIndex);
          
          if (chimeRef.current) {
            chimeRef.current.volume = 0.3;
            chimeRef.current.currentTime = 0; 
            chimeRef.current.play().catch(e => console.log("Waiting for user interaction!"));
          }
        }
      }
    });
  }, [smoothAstrolabe, journeyPhase, activeAvatar]);

  const [isGlitching, setIsGlitching] = useState(false);
  useEffect(() => {
    return smoothProgress.onChange((latest) => {
      if (journeyPhase === 'descent') setIsGlitching(latest > 0.64 && latest < 0.73);
      else setIsGlitching(false); 
    });
  }, [smoothProgress, journeyPhase]);

  const handleSurrender = () => {
    setJourneyPhase('transmuting');
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    setTimeout(() => setJourneyPhase('akashic'), 4000);
  };

  const handleAwaken = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setJourneyPhase('astrolabe');
    setIsHolding(false);
  };

 if (activeLore) {
    if (activeLore === 'lustbreaker') {
      return <LustBreaker onBack={() => window.history.back()} onAscend={() => setActiveLore('mayaprotocol')} onSwitchProtocol={(protocolId) => setActiveLore(protocolId)} />;
    }
    if (activeLore === 'mayaprotocol') {
      // 🔗 MAYA NOW LEADS TO THE BRAIN
      return <MayaProtocol onBack={() => window.history.back()} onAwaken={() => setActiveLore('neuralreality')} onSwitchProtocol={(protocolId) => setActiveLore(protocolId)} />;
    }
    if (activeLore === 'neuralreality') {
      // 🔗 THE BRAIN NOW LEADS TO THE LIFESAVER
      return <NeuralReality onBack={() => window.history.back()} onNext={() => setActiveLore('lifesaverprotocol')} onSwitchProtocol={(protocolId) => setActiveLore(protocolId)} />;
    }
    if (activeLore === 'lifesaverprotocol') {
      // 🔗 THE LIFESAVER NOW LEADS TO THE GRAND FINALE: KARMA!
      return <LifesaverProtocol onBack={() => window.history.back()} onNext={() => setActiveLore('karmaprotocol')} onSwitchProtocol={(protocolId) => setActiveLore(protocolId)}/>;
    }
    if (activeLore === 'karmaprotocol') {
      return <KarmaProtocol onEnterHub={() => setActiveLore(null)} />;
    }
    
    if (activeLore === 'V') return <VamanaLore onBack={() => window.history.back()} />;
    if (activeLore === 'I') return <MatsyaLore onBack={() => window.history.back()} />;
    if (activeLore === 'II') return <KurmaLore onBack={() => window.history.back()} />;
    if (activeLore === 'III') return <VarahaLore onBack={() => window.history.back()} />;
    if (activeLore === 'IV') return <NarasimhaLore onBack={() => window.history.back()} />;
    if (activeLore === 'VI') return <ParshuramaLore onBack={() => window.history.back()} />;
    if (activeLore === 'VII') return <RamaLore onBack={() => window.history.back()} />;
    
    const activeAvatarData = DASHAVATARA.find(av => av.id === activeLore);
    if (!activeAvatarData) {
      setActiveLore(null);
      return null;
    }
    return <DefaultLore avatar={activeAvatarData} index={activeAvatarIndex} lang={lang} onBack={() => window.history.back()} />;
  }

  return (
    <div className={`relative w-full bg-[#0a0514] font-sans text-white selection:bg-[#00ccff]/30 ${journeyPhase === 'akashic' ? 'h-screen overflow-hidden' : ''}`}>
      
      <button onClick={() => window.history.back()} className="fixed top-6 left-6 z-[90] px-6 py-2 border border-[#fbbf24]/50 rounded-full text-[#fbbf24] text-xs tracking-widest uppercase hover:bg-[#fbbf24]/20 transition-all backdrop-blur-md cursor-pointer shadow-lg">
        {HUB_TEXT[lang].exitHub}
      </button>

      {/* 👇 NEW LANGUAGE SWITCHER BUTTON */}
      <div className="fixed top-6 right-6 z-[100] flex bg-black/50 border border-[#fbbf24]/30 rounded-full backdrop-blur-md overflow-hidden">
        {['en', 'hi', 'mr'].map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${lang === l ? 'bg-[#fbbf24] text-black' : 'text-white/50 hover:text-white'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {journeyPhase === 'descent' && (
        <button 
          onClick={handleAwaken} 
          className="fixed top-20 right-6 z-[90] px-6 py-2 bg-white/5 border border-white/20 rounded-full text-white/80 text-xs tracking-widest uppercase hover:bg-white/10 transition-all backdrop-blur-md cursor-pointer shadow-lg"
        >
          {HUB_TEXT[lang].skipAvatars}
        </button>
      )}

      {/* 🔥 TEMPORARY LUST BREAKER VIP BUTTON */}
      <button 
        onClick={() => openLore('lustbreaker')} 
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] px-4 md:px-6 py-2 md:py-3 bg-[#dc2626]/10 border border-[#dc2626] rounded-full text-[#dc2626] font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase hover:bg-[#dc2626] hover:text-white transition-all backdrop-blur-md cursor-pointer shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-3 group"
      >
        <span className="relative flex h-2 w-2 md:h-3 md:w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-[#dc2626] group-hover:bg-white transition-colors"></span>
        </span>
        {HUB_TEXT[lang].protocolOjas}
      </button>

      {journeyPhase === 'descent' && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex flex-col justify-between">
          <motion.div style={{ scaleY: eyeScaleY, originY: 0 }} className="w-full h-1/2 bg-black shadow-[0_10px_50px_rgba(0,204,255,0.2)]" />
          <motion.div style={{ scaleY: eyeScaleY, originY: 1 }} className="w-full h-1/2 bg-black shadow-[0_-10px_50px_rgba(0,204,255,0.2)]" />
        </div>
      )}

      {journeyPhase === 'descent' && (
        <>
          <motion.div style={{ y: vishnuY, opacity: vishnuOpacity }} className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
            <img src="/kshirsagar.png" alt="Vishnu" className="h-[80vh] md:h-[95vh] w-auto object-contain drop-shadow-[0_0_60px_rgba(0,204,255,0.5)]" />
          </motion.div>
          <motion.div style={{ opacity: titleOpacity, scale: titleScale }} className="fixed inset-0 z-[65] flex flex-col items-center justify-center pointer-events-none text-center px-6">
            <h1 className="text-[#00ccff] text-4xl md:text-7xl font-serif tracking-[0.5em] md:tracking-[0.8em] uppercase drop-shadow-[0_0_40px_rgba(0,204,255,0.6)] ml-4">
              {HUB_TEXT[lang].kshiraSagara}
            </h1>
          </motion.div>
          <motion.div style={{ opacity: webOfDharmaOpacity, y: webOfDharmaY, scale: webOfDharmaScale }} className="fixed inset-0 z-[50] flex flex-col items-center justify-center pointer-events-none text-center px-6">
            <h2 className="text-[#fbbf24] tracking-[0.5em] md:tracking-[0.8em] uppercase text-2xl md:text-5xl font-serif drop-shadow-[0_0_30px_rgba(251,191,36,0.8)]">
              {HUB_TEXT[lang].webDharma}
            </h2>
            <p className="text-white/60 tracking-[0.4em] uppercase text-xs md:text-sm mt-6">
              {HUB_TEXT[lang].unfolds}
            </p>
            <div className="w-[1px] h-32 bg-gradient-to-b from-[#fbbf24]/60 to-transparent mt-10 mx-auto" />
          </motion.div>
        </>
      )}

      <div className={`fixed inset-0 z-0 ${journeyPhase === 'astrolabe' ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1.0} mipmapBlur intensity={isHolding ? 8.0 : 1.5} />
            <Vignette eskil={false} offset={0.3} darkness={isHolding ? 0.0 : 0.5} />
            <Glitch delay={[0.5, 1.5]} duration={[0.1, 0.2]} strength={[0.05, 0.1]} active={isGlitching} />
          </EffectComposer>

          <SheshaSerpent journeyPhase={journeyPhase} />
          <OceanOfMilk scrollVelocity={scrollVelocity} journeyPhase={journeyPhase} />
          <CosmicArtifacts activePhase={activePhase} journeyPhase={journeyPhase} />
          <AkashicGalaxy journeyPhase={journeyPhase} />
          <MokshaCore isHolding={isHolding} onAwaken={handleAwaken} journeyPhase={journeyPhase} />
          <DashavataraAstrolabe journeyPhase={journeyPhase} activeAvatar={activeAvatar} setActiveLore={openLore}/>        
        </Canvas>
      </div>

      {journeyPhase === 'descent' && (
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="w-full h-[500vh] pointer-events-none" />
          
          {DHARMA_LORE.map((section, index) => (
            <LoreCard key={section.id} section={section} index={index} lang={lang} setActivePhase={setActivePhase} isGlitching={activePhase === '04'} />
          ))}

          <div className="w-full min-h-[120vh] flex flex-col items-center justify-center pointer-events-auto px-6 relative z-50 mt-20">
             <div className="w-full max-w-2xl flex flex-col items-center">
               <h2 className="text-[#fbbf24] text-xl md:text-3xl font-serif uppercase tracking-[0.4em] mb-4 text-center">{HUB_TEXT[lang].leaveKarmaTitle}</h2>
               <p className="text-white/50 text-xs md:text-sm tracking-widest text-center mb-10 leading-relaxed">
                 {HUB_TEXT[lang].leaveKarmaDesc}
               </p>
               <textarea 
                 value={journalEntry} onChange={(e) => setJournalEntry(e.target.value)} placeholder={HUB_TEXT[lang].karmaPlaceholder}
                 className="w-full h-40 bg-black/40 border border-[#fbbf24]/30 rounded-2xl p-6 text-white placeholder-white/20 backdrop-blur-xl focus:outline-none focus:border-[#fbbf24] transition-all resize-none shadow-[0_0_30px_rgba(0,0,0,0.8)]"
               />
               <button 
                 onClick={handleSurrender} disabled={!journalEntry.trim()}
                 className="mt-8 px-10 py-4 border border-[#fbbf24] text-[#fbbf24] font-bold uppercase tracking-[0.3em] text-xs rounded-full hover:bg-[#fbbf24]/10 hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
               >{HUB_TEXT[lang].surrenderBtn}</button>
             </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {journeyPhase === 'transmuting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <h1 className="text-4xl font-serif text-white tracking-widest animate-pulse">{HUB_TEXT[lang].shattering}</h1>
          </motion.div>
        )}
      </AnimatePresence>

      {journeyPhase === 'akashic' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer touch-none"
          onPointerDown={() => setIsHolding(true)} onPointerUp={() => setIsHolding(false)} onPointerLeave={() => setIsHolding(false)}
        >
          <div className="absolute top-[30%] text-center pointer-events-none">
             <h1 className="text-5xl font-serif text-[#fbbf24] mb-4 tracking-widest drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">{HUB_TEXT[lang].transmuted}</h1>
             <p className="text-white/60 tracking-[0.4em] uppercase text-xs">{HUB_TEXT[lang].karmaJoins}</p>
          </div>
          <div className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center animate-pulse pointer-events-none mt-20">
             <span className="text-white/80 text-[8px] uppercase tracking-[0.2em] text-center whitespace-pre-wrap">{HUB_TEXT[lang].pressHold}</span>
          </div>
        </div>
      )}

      {journeyPhase === 'astrolabe' && (
        <div ref={astrolabeContainerRef} className="relative z-10 w-full h-[500vh] pointer-events-none">
          <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-between py-20 pointer-events-none">
            <div className="text-center">
              <h2 className="text-[#fbbf24] text-[10px] tracking-[0.5em] uppercase font-bold mb-4">{HUB_TEXT[lang].astrolabeTitle}</h2>
              <p className="text-white/40 text-xs tracking-widest uppercase animate-pulse">{HUB_TEXT[lang].scrollRotate}</p>
            </div>
            
            <motion.div 
              key={activeAvatar} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="max-w-xl text-center bg-black/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/10"
            >
              <h3 className="text-[#00ccff] text-xs font-mono mb-2">{DASHAVATARA[activeAvatar].id} / X</h3>
              <h1 className="text-4xl md:text-5xl font-serif text-white uppercase tracking-widest mb-4">{HUB_TEXT[lang].avatars[activeAvatar].name}</h1>
              <p className="text-white/70 text-sm leading-relaxed font-light">{HUB_TEXT[lang].avatars[activeAvatar].desc}</p>
            </motion.div>
          </div>
        </div>
      )}

    </div>
  );
}