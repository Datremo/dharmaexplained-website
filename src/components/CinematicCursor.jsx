import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CinematicCursor() {
  // Track the exact mouse coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Add a buttery smooth spring physics so the light drags slightly behind the cursor
  const springX = useSpring(mouseX, { stiffness: 100, damping: 25, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 25, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      className="fixed top-0 left-0 w-[40vw] h-[40vw] rounded-full pointer-events-none z-0 mix-blend-screen"
    >
      {/* The glowing radial spotlight */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,204,255,0.15)_0%,rgba(0,204,255,0)_60%)] blur-[50px]" />
    </motion.div>
  );
}