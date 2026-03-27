import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerformanceMonitor, Float, Torus, Sparkles, 
  Icosahedron, Sphere, Cylinder, Text
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { setGlobalMusic } from '../GlobalAudio';

// ========================================================
// 🔥 3D ENGINE: THE PRABHAMANDALA (RING OF FIRE)
// ========================================================
const CosmicFurnace = ({ isFlowing, flowIntensity }) => {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const particlesRef = useRef();

  useFrame((state, delta) => {
    if (!coreRef.current) return;
    const time = state.clock.elapsedTime;

    // The physics dynamically react to whether the timer is running
    const speed = isFlowing ? 3.0 + (flowIntensity * 2) : 0.5;
    const scale = isFlowing ? 1.2 + (flowIntensity * 0.3) : 0.9;
    
    // Smooth Scale Interpolation
    coreRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 2);

    // Violent Core Rotation during flow, gentle breathing when paused
    coreRef.current.rotation.y += delta * speed;
    coreRef.current.rotation.x = Math.sin(time * speed) * 0.2;

    // Contra-rotating Rings of Fire
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * (speed * 1.5);
      ring1Ref.current.rotation.x = Math.PI / 2 + Math.sin(time) * 0.1;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x -= delta * speed;
      ring2Ref.current.rotation.y += delta * (speed * 0.8);
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y -= delta * (speed * 1.2);
      ring3Ref.current.rotation.z -= delta * (speed * 0.5);
    }

    // Embers fly upwards faster when working
    if (particlesRef.current) {
      particlesRef.current.position.y += delta * (isFlowing ? 2.0 : 0.5);
      if (particlesRef.current.position.y > 5) particlesRef.current.position.y = -5;
      particlesRef.current.rotation.y += delta * (isFlowing ? 1.0 : 0.1);
    }
  });

  const fireRed = new THREE.Color("#ff1100");
  const fireOrange = new THREE.Color("#ffaa00");
  const dormantColor = new THREE.Color("#330500");

  return (
    <Float speed={isFlowing ? 5 : 2} rotationIntensity={isFlowing ? 1 : 0.2} floatIntensity={isFlowing ? 2 : 0.5}>
      <group position={[0, 0, -5]}>
        
        {/* The Nataraja Core */}
        <Icosahedron ref={coreRef} args={[1.5, 1]}>
          <meshStandardMaterial 
            color={isFlowing ? fireRed : dormantColor} 
            emissive={isFlowing ? fireRed : dormantColor} 
            emissiveIntensity={isFlowing ? 2 : 0.5} 
            wireframe 
          />
        </Icosahedron>

        <Sphere args={[1.2, 32, 32]}>
          <meshStandardMaterial 
            color="#000000" 
            emissive={isFlowing ? fireOrange : "#000000"} 
            emissiveIntensity={isFlowing ? 1 : 0} 
            transparent opacity={0.8}
          />
        </Sphere>

        {/* Inner Aggressive Ring */}
        <Torus ref={ring1Ref} args={[2.5, 0.05, 16, 100]}>
          <meshStandardMaterial color={isFlowing ? fireOrange : dormantColor} emissive={isFlowing ? fireOrange : dormantColor} emissiveIntensity={isFlowing ? 3 : 0.5} />
        </Torus>

        {/* Middle Chaotic Ring */}
        <Torus ref={ring2Ref} args={[3.2, 0.02, 16, 100]}>
          <meshStandardMaterial color={isFlowing ? fireRed : dormantColor} emissive={isFlowing ? fireRed : dormantColor} emissiveIntensity={isFlowing ? 2 : 0.2} />
        </Torus>

        {/* Outer Boundary Ring */}
        <Torus ref={ring3Ref} args={[4.0, 0.01, 16, 100]}>
          <meshStandardMaterial color="#ffffff" transparent opacity={isFlowing ? 0.3 : 0.1} />
        </Torus>

        {/* The Flames (Sparkles) */}
        <group ref={particlesRef}>
          <Sparkles 
            count={isFlowing ? 2000 : 500} 
            scale={15} 
            size={isFlowing ? 6 : 2} 
            speed={isFlowing ? 2 : 0.5} 
            opacity={0.8} 
            color={isFlowing ? '#ff5500' : '#ff1100'} 
          />
        </group>
      </group>
    </Float>
  );
};

// ========================================================
// 🎥 3D ENGINE: CINEMATIC CAMERA SHAKE (FLOW STATE)
// ========================================================
const ActionCamera = ({ isFlowing }) => {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();

  useFrame((state, delta) => {
    // Intense parallax when working, relaxed when paused
    const targetX = mouse.x * (isFlowing ? 3 : 1);
    const targetY = mouse.y * (isFlowing ? 3 : 1);
    
    // Add subtle, violent shake if fully flowing
    const shakeX = isFlowing ? Math.sin(state.clock.elapsedTime * 20) * 0.05 : 0;
    const shakeY = isFlowing ? Math.cos(state.clock.elapsedTime * 25) * 0.05 : 0;

    camera.position.lerp(vec.set(targetX + shakeX, targetY + shakeY, 10), 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
};

// ========================================================
// 🎛️ UI COMPONENT: TASK DESTRUCTOR
// ========================================================
const TaskItem = ({ task, onComplete, onDelete }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
    className="flex items-center justify-between p-4 mb-3 border border-[#ff1100]/30 bg-[#1a0000]/60 backdrop-blur-md rounded-xl group hover:border-[#ff1100] transition-colors"
  >
    <div className="flex items-center gap-4">
      <button 
        onClick={() => onComplete(task.id)}
        className="w-5 h-5 rounded-full border-2 border-[#ff1100]/50 flex items-center justify-center hover:bg-[#ff1100] transition-colors"
      />
      <span className="font-sans text-white/90 text-sm md:text-base">{task.text}</span>
    </div>
    <button 
      onClick={() => onDelete(task.id)}
      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-[#ff1100] transition-all font-mono text-xs uppercase tracking-widest"
    >
      Drop
    </button>
  </motion.div>
);

// ========================================================
// 🎬 THE MAIN TANDAVA FLOW ENGINE
// ========================================================
export default function TandavaFlow({ onBack }) {
  // --- TIMER STATE ---
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes
  const [isFlowing, setIsFlowing] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // 'focus' or 'rest'
  
  // --- TASK STATE ---
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [destroyedCount, setDestroyedCount] = useState(0);

  // --- ENGINE STATE ---
  const [dpr, setDpr] = useState(1);
  const [flowIntensity, setFlowIntensity] = useState(0); // 0.0 to 1.0 based on time elapsed

  // Mount/Unmount logic
  useEffect(() => {
    setGlobalMusic('tandava_drums'); 
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Timer Tick Logic
  useEffect(() => {
    let interval = null;
    if (isFlowing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        
        // Calculate intensity based on how deep into the session we are
        if (sessionType === 'focus') {
          const totalSeconds = 25 * 60;
          const elapsed = totalSeconds - timeLeft;
          setFlowIntensity(elapsed / totalSeconds);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished!
      setIsFlowing(false);
      setGlobalMusic('gong_strike');
      if (sessionType === 'focus') {
        setSessionType('rest');
        setTimeLeft(5 * 60); // 5 min break
      } else {
        setSessionType('focus');
        setTimeLeft(25 * 60); // Back to work
      }
    }
    return () => clearInterval(interval);
  }, [isFlowing, timeLeft, sessionType]);

  // Math formatting
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleFlow = () => {
    setIsFlowing(!isFlowing);
    if (!isFlowing) setGlobalMusic('tandava_drums_intense');
    else setGlobalMusic('tandava_drums');
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask }]);
    setNewTask('');
  };

  const handleCompleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    setDestroyedCount(prev => prev + 1);
    // Add a satisfying mini-burst to the intensity!
    setFlowIntensity(prev => Math.min(prev + 0.2, 1.0));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#050000] font-sans overflow-hidden selection:bg-[#ff1100]/30 flex flex-col transition-colors duration-1000">
      
      {/* 🧭 TOP NAVIGATION */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[100] pointer-events-auto">
        <button 
          onClick={onBack} 
          className="px-6 py-3 border border-white/20 bg-[#110000]/80 rounded-full text-[10px] md:text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all backdrop-blur-xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform text-[#ff1100] group-hover:text-black">&larr;</span> Retreat to Hub
        </button>
        
        <div className="flex flex-col items-end text-right">
          <h2 className="text-[#ff1100] font-mono text-[8px] md:text-[10px] tracking-[0.8em] uppercase mb-1 drop-shadow-md">
            Current Domain
          </h2>
          <h1 className="text-white font-black text-sm md:text-xl tracking-[0.5em] uppercase drop-shadow-[0_0_20px_rgba(255,17,0,0.5)]">
            Tandava
          </h1>
        </div>
      </div>

      {/* 🌌 3D BACKGROUND ENGINE (THE FURNACE) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas dpr={dpr} camera={{ position: [0, 0, 10], fov: 60 }}>
          <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />
          <ambientLight intensity={0.2} />
          
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.3} intensity={isFlowing ? 3.0 : 1.0} mipmapBlur />
            <Vignette eskil={false} offset={0.1} darkness={0.9} />
            {/* Violent Chromatic Aberration when in the zone */}
            <ChromaticAberration offset={[isFlowing ? 0.05 * flowIntensity : 0.002, isFlowing ? 0.05 * flowIntensity : 0.002]} />
            <Noise opacity={isFlowing ? 0.1 : 0.03} />
          </EffectComposer>

          <ActionCamera isFlowing={isFlowing} />
          <CosmicFurnace isFlowing={isFlowing} flowIntensity={flowIntensity} />
        </Canvas>
      </div>

      {/* 🎛️ THE HUD OVERLAY */}
      <div className="relative z-10 flex flex-col md:flex-row h-full w-full max-w-[1600px] mx-auto pt-24 pb-6 px-6 md:px-12 gap-8 pointer-events-none">
        
        {/* LEFT COLUMN: THE DESTRUCTOR (Task List) */}
        <div className="w-full md:w-1/3 flex flex-col h-full pointer-events-auto">
          <div className="bg-[#050000]/60 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl h-full flex flex-col">
            
            <h2 className="text-white/50 font-mono text-[10px] tracking-[0.4em] uppercase mb-2">Targets Acquired</h2>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-6">
              The Illusions
            </h1>

            {/* Task Input */}
            <form onSubmit={handleAddTask} className="mb-6 relative">
              <input 
                type="text" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="e.g., Refactoring the React components..." 
                className="w-full bg-black/50 border-b-2 border-white/20 px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#ff1100] transition-colors font-serif italic text-sm md:text-base"
              />
              <button 
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2 text-[#ff1100] font-mono text-[10px] uppercase tracking-widest hover:text-white transition-colors"
              >
                Lock
              </button>
            </form>

            {/* Task Scroll View */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {tasks.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <span className="text-4xl mb-4">🌪️</span>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">No illusions remain.<br/>Add a target to destroy.</p>
                  </motion.div>
                ) : (
                  tasks.map(task => (
                    <TaskItem key={task.id} task={task} onComplete={handleCompleteTask} onDelete={handleDeleteTask} />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Stats Footer */}
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase">Illusions Destroyed</span>
              <span className="font-black text-2xl text-[#ff1100]">{destroyedCount}</span>
            </div>
          </div>
        </div>

        {/* CENTER/RIGHT COLUMN: THE FURNACE CONTROLS (Timer) */}
        <div className="w-full md:w-2/3 flex flex-col items-center justify-center pointer-events-auto mt-8 md:mt-0">
          
          <div className="text-center relative">
            {/* Dynamic Status Text */}
            <motion.h2 
              animate={{ color: isFlowing ? '#ff1100' : '#ffffff', opacity: isFlowing ? 1 : 0.5 }}
              className="font-mono text-xs md:text-sm tracking-[0.8em] uppercase mb-4 drop-shadow-md transition-colors"
            >
              {sessionType === 'focus' ? (isFlowing ? 'Tandava Initiated' : 'Awaiting Ignition') : 'The Void (Rest)'}
            </motion.h2>

            {/* The Massive Digital Clock */}
            <h1 className={`text-[6rem] md:text-[12rem] font-black uppercase tracking-tighter leading-none drop-shadow-[0_0_50px_rgba(255,17,0,0.5)] transition-colors duration-500 ${isFlowing ? 'text-white' : 'text-white/60'}`}>
              {formatTime(timeLeft)}
            </h1>

            {/* Ignition Button */}
            <div className="mt-12 flex justify-center">
              <button 
                onClick={handleToggleFlow}
                className={`relative px-12 md:px-20 py-5 md:py-6 rounded-full overflow-hidden transition-all duration-500 shadow-[0_0_40px_rgba(255,17,0,0.3)] hover:shadow-[0_0_80px_rgba(255,17,0,0.6)] group border-2 ${isFlowing ? 'border-[#ff1100] bg-[#110000]' : 'border-white/30 bg-black/50'}`}
              >
                {/* Button Glow Background */}
                <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none z-0 ${isFlowing ? 'opacity-20 bg-[#ff1100]' : 'opacity-0'}`} />
                
                <span className={`relative z-10 font-black text-sm md:text-lg tracking-[0.4em] uppercase transition-colors duration-300 ${isFlowing ? 'text-[#ff1100] group-hover:text-white' : 'text-white group-hover:text-[#ff1100]'}`}>
                  {isFlowing ? 'Halt The Fire' : 'Ignite Flow'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Time Adjusters (Below the button) */}
          {!isFlowing && sessionType === 'focus' && (
            <div className="mt-10 flex gap-4 md:gap-8">
              {[15, 25, 45, 60].map(mins => (
                <button 
                  key={mins}
                  onClick={() => setTimeLeft(mins * 60)}
                  className={`font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase px-4 py-2 rounded-full border transition-all ${timeLeft === mins * 60 ? 'border-[#ff1100] text-[#ff1100] bg-[#ff1100]/10' : 'border-white/20 text-white/50 hover:text-white hover:border-white'}`}
                >
                  {mins} Min
                </button>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}