"use client";

import { motion } from "framer-motion";

export default function AnimatedHeart() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#003549]">
      <div className="relative">
        {/* Heart */}
        <motion.div
          className="text-red-500 text-[120px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          ❤️
        </motion.div>

        {/* Arrow */}
        <motion.div
          className="absolute top-1/2 left-[-200px] text-white text-6xl"
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: 220, opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
        >
          ➡️
        </motion.div>
      </div>
    </div>
  );
}
