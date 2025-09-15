"use client";

import { motion } from "framer-motion";

export default function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient layer */}
      <motion.div
        className="w-[200%] h-[200%] bg-gradient-to-r from-[#0A9396] via-[#94D2BD] to-[#E9D8A6] opacity-80 blur-3xl"
        animate={{
          x: ["0%", "-25%", "0%"],
          y: ["0%", "-25%", "0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
