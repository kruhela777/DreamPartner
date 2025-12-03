"use client";
import React, {useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
// --- Heart Cursor ---
function HeartCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [smooth, setSmooth] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handle = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    let frame: number;
    const animate = () => {
      setSmooth(prev => ({
        x: prev.x + (pos.x - prev.x) * 0.2,
        y: prev.y + (pos.y - prev.y) * 0.2,
      }));
      if (cursorRef.current) {
        const t = Date.now() * 0.002;
        const scale = 0.97 + 0.07 * Math.sin(t);
        cursorRef.current.style.transform = `translate(-50%,-55%) scale(${scale})`;
      }
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("mousemove", handle);
      cancelAnimationFrame(frame);
    };
  }, [pos.x, pos.y]);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        left: smooth.x,
        top: smooth.y,
        width: 28,
        height: 28,
        pointerEvents: "none",
        zIndex: 1000,
        filter: "drop-shadow(0 1px 6px #ffc0cbad)",
        userSelect: "none",
      }}
    >
      <svg width={28} height={28} viewBox="0 0 32 29.6">
        <path
          d="M23.6,0c-2.6,0-5,1.4-6.6,3.6C15.4,1.4,13,0,10.4,0C4.7,0,0,4.8,0,10.4
            c0,5.3,4.3,9.6,11,15.2l4.9,3.8l4.9-3.8c6.7-5.6,11-9.8,11-15.2
            C32,4.8,27.3,0,23.6,0z"
          fill="#ff6dae"
          stroke="#e23e7c"
          strokeWidth="1.3"
        />
        <ellipse cx="10" cy="8" rx="4" ry="1.2" fill="#fff" opacity=".50" />
      </svg>
    </div>
  );
}
// --- Pastel Wave SVG for bottom border ---
const PastelWave = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 1440 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      fill="#fde7f5"
      d="M0,80 C360,160 1080,0 1440,80 L1440,160 L0,160 Z"
    ></path>
    <path
      fill="#fbe0ff"
      fillOpacity="0.7"
      d="M0,140 C500,60 900,180 1440,60 L1440,160 L0,160 Z"
    ></path>
    <path
      fill="#fffafc"
      fillOpacity="0.76"
      d="M0,130 Q600,170 1440,120 L1440,160 L0,160 Z"
    ></path>
  </svg>
);

// --- Glowy Animated Floating Hearts ---
const FloatingHearts = () => {
  const [dims, setDims] = useState([typeof window !== "undefined" ? window.innerWidth : 1080, typeof window !== "undefined" ? window.innerHeight : 720]);
  useEffect(() => {
    const set = () => setDims([window.innerWidth, window.innerHeight]);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {[...Array(20)].map((_, i) => {
        const sz = 32 + Math.random() * 32;
        const color = [
          "rgba(255,180,222,0.38)",
          "rgba(255,212,235,0.45)",
          "rgba(242,163,212,0.34)",
          "rgba(253,205,234,0.44)",
          "rgba(251,154,210,0.39)",
          "rgba(255,246,254,0.32)",
        ][i % 6];
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: Math.random() * dims[0] * 0.92,
              fontSize: `${sz}px`,
              color,
              filter: `blur(${i % 2 ? 1.1 : 2.6}px) drop-shadow(0 0 20px #ffc2ee)`,
              top: 0,
            }}
            initial={{
              opacity: 0,
              y: dims[1] + 50 + i * 14,
              scale: 0.5 + Math.random() * 0.55,
              rotate: Math.random() * 20 - 10,
            }}
            animate={{
              opacity: [0, 1, 0.7, 0],
              y: [80, -dims[1] - 94 - i * 12],
              scale: [0.75, 1 + Math.random() * 0.18, 0.82],
              x: [
                Math.random() * (dims[0] - sz),
                Math.random() * (dims[0] - sz),
                Math.random() * (dims[0] - sz),
              ],
              rotate: [Math.random() * 8 - 8, Math.random() * 30, 0],
            }}
            transition={{
              duration: 11 + Math.random() * 7,
              repeat: Infinity,
              delay: Math.random() * 4.1,
              ease: "easeInOut",
            }}
          >
            <motion.span
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{
                scale: [0.85, 1, 0.92, 0.94],
                opacity: [0.7, 1, 0.8, 0.69],
              }}
              transition={{
                repeat: Infinity,
                duration: 3.5 + Math.random(),
                repeatType: "mirror",
              }}
            >
              ❤️
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
};

// --- Sparkles floating on top ---
const Sparkles = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    {[...Array(13)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          left: `${10 + Math.random() * 80}%`,
          top: `${4 + Math.random() * 91}%`,
          fontSize: `${14 + Math.random() * 23}px`,
          color: "#fff4fa",
          opacity: 0.4 + Math.random() * 0.21,
          filter: "drop-shadow(0 0 11px #ffe6f7)",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: [0.8, 1.13, 1, 0.8],
          opacity: [0, 0.72, 0.6, 0],
        }}
        transition={{
          duration: 3.3 + Math.random() * 2.2,
          delay: Math.random() * 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      >
        ✨
      </motion.div>
    ))}
  </div>
);

export default function AboutUsPage() {
  const router = useRouter();

  // Ensures body always has a soft pastel bg
  useEffect(() => {
    document.body.style.background =
      "radial-gradient(ellipse at top right, #ffe6f6 0%, #fff0f8 48%, #fce4ff 100%)";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at top right, #ffe6f6 0%, #fff0f8 48%, #fce4ff 100%)",
      }}
    >
      {/* Floats */}
      <FloatingHearts />
      <Sparkles />
      {/* Wavy pastel bottom */}
      <div className="absolute left-0 right-0 bottom-0 z-1">
        <PastelWave className="w-full" />
      </div>
      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.12, rotate: -8 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.back()}
        className="absolute top-5 left-3 z-10 bg-white/80 text-pink-400 font-bold px-6 py-2 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-[4px] border border-pink-100/60"
        style={{
          fontFamily: "inherit",
          fontSize: "1.15rem",
        }}
      >
        <span className="text-2xl">⬅️</span> Back
      </motion.button>
      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center flex flex-col px-2 md:px-8 py-8"
        initial={{ opacity: 0, y: 44 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.12 }}
      >
        <motion.h1
  className="text-4xl md:text-5xl font-extrabold my-8 font-cute-1 select-none
  bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 text-transparent bg-clip-text
  drop-shadow-[0_2px_8px_#f3c2ea]"
  initial={{ scale: 0.96, opacity: 0 }}
  animate={{ scale: 1.05, opacity: 1 }}
  transition={{ delay: 0.18, duration: 0.7, type: "spring" }}
>
  <motion.span
    animate={{
      rotate: [-14, 7, -10, 0],
      scale: [1.08, 1.17, 0.97, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      repeatType: "mirror",
    }}
    className="inline-block"
  >
    💖
  </motion.span>{" "}
  About Dream Partner{" "}
  <motion.span
    animate={{
      rotate: [10, -11, 7, 0],
      scale: [1.06, 1.14, 1, 1.09, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      repeatType: "mirror",
      delay: 0.6,
    }}
    className="inline-block"
  >
    💖
  </motion.span>
</motion.h1>

        {/* Section: Idea */}
        <motion.div
          className="mb-7 p-6 rounded-3xl bg-white/90 border-2 border-pink-100/40 shadow-[0_6px_28px_0_#ffd6ee33] backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.98, rotate: -3 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-xl font-semibold mb-2 text-pink-400">
            ✨ What is the Idea?
          </h2>
          <p className="text-pink-600 font-medium">
            <b className="underline underline-offset-2 decoration-pink-300">
              Dream Partner
            </b>{" "}
            is a <span className="font-bold">2.5D game-based compatibility engine</span> for two players.
            <br />
            Forget awkward swipes/pickup lines. It’s a cozy world for playing,
            bonding, and{" "}
            <b className="text-pink-400">naturally discovering each other</b>.
          </p>
        </motion.div>
        {/* Section: Inspiration */}
        <motion.div
          className="mb-7 p-6 rounded-3xl bg-white/90 border-2 border-pink-100/40 shadow-[0_6px_28px_0_#ffd6ee33] backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.98, rotate: 3 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-xl font-semibold mb-2 text-pink-400">
            💡 Why Did We Build It?
          </h2>
          <p className="text-pink-600">
            Dating apps are too mechanical—how can you “feel chemistry” in a
            swipe? So we asked:
            <br />
            <span className="block my-1 italic text-pink-400 font-cute-1">
              “What if you could fall for someone <b>before</b> the first
              message?”
              <br />
              “What if play could reveal the real you, not profiles?”
            </span>
            We dreamed up a space where you can{" "}
            <b className="text-pink-400">bond through play</b> and let natural
            compatibility shine.
          </p>
        </motion.div>
        {/* How It Works */}
        <motion.div
          className="mb-7 p-6 rounded-3xl bg-white/90 border-2 border-pink-100/40 shadow-[0_6px_28px_0_#ffd6ee33] backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.98, rotate: -2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-xl font-semibold mb-2 text-center text-pink-400">
            🎮 How It Works
          </h2>
          <ul className="list-disc list-inside space-y-1 text-pink-600 text-left pl-2 md:pl-10">
            <li>
              <span className="font-semibold text-pink-400">
                Play Together:
              </span>{" "}
              Team up in an interactive dream world.
            </li>
            <li>
              <span className="font-semibold text-pink-400">
                Emotion-Mapped Rooms:
              </span>{" "}
              Each space expresses emotions via color, music, and challenge.
            </li>
            <li>
              <span className="font-semibold text-pink-400">
                Unveiling Journey:
              </span>{" "}
              Unlock profile details, little by little, *as* you play.
            </li>
            <li>
              <span className="font-semibold text-pink-400">
                Silent Psychometry:
              </span>{" "}
              Your shared actions become real, meaningful compatibility signals.
            </li>
          </ul>
        </motion.div>
        {/* Future */}
        <motion.div
          className="mb-8 p-6 rounded-3xl bg-white/90 border-2 border-pink-100/40 shadow-[0_6px_28px_0_#ffd6ee33] backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.98, rotate: 2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-xl font-semibold mb-2 text-center text-pink-400">
            🚀 The Future
          </h2>
          <ul className="list-disc list-inside space-y-1 text-pink-600 text-left pl-2 md:pl-10">
            <li>Dreamier escape-room themes with magical storytelling.</li>
            <li>AI-driven personality insights: playful and honest.</li>
            <li>Super-cute customizable avatars &amp; dreamscapes.</li>
            <li>Bigger than dating—icebreakers, friendships, team-building!</li>
          </ul>
        </motion.div>
        {/* Bouncy Heart Divider */}
        <div className="flex items-center justify-center mb-2">
          <motion.span
            className="inline-block text-2xl mx-1"
            animate={{ scale: [1, 1.23, 1], y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatType: "mirror" }}
          >
            💗
          </motion.span>
          <motion.span
            className="inline-block text-3xl mx-0.5"
            animate={{ scale: [1, 1.3, 1], y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              repeatType: "mirror",
              delay: 0.2,
            }}
          >
            💕
          </motion.span>
          <motion.span
            className="inline-block text-2xl mx-1"
            animate={{ scale: [1, 1.18, 1], y: [0, -7, 0] }}
            transition={{
              repeat: Infinity,
              duration: 1.7,
              repeatType: "mirror",
              delay: 0.3,
            }}
          >
            💗
          </motion.span>
        </div>
        {/* Highlighted Quote */}
        <motion.div
          className="mb-2 p-6 rounded-xl shadow-md bg-pink-50/60 border border-pink-200/70 backdrop-blur-xl"
          initial={{ scale: 0.94, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, type: "spring" }}
        >
          <p className="text-xl md:text-2xl text-pink-400 font-semibold italic font-cute-1">
            ✨ “How could you not talk to someone after playing a game and having
            fun together? No awkward intros—just pure, natural connection.” ✨
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

/*
Optional: To get the perfect cute font in the title, in your tailwind.config.js:

theme: {
  extend: {
    fontFamily: {
      'cute-1': ['Quicksand', 'Comic Neue', 'cursive', 'sans-serif'],
    }
  }
}
...and in your _app.js or html: 
<link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&family=Quicksand:wght@700&display=swap" rel="stylesheet" />
*/

