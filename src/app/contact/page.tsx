"use client";
import React, {useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin } from "react-icons/fa";
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
// Floating Heart with Glow and Upwards Motion
const FloatingHeart = ({ delay, left, size, color }) => (
  <motion.div
    initial={{ y: "110vh", opacity: 0, scale: 0.7 }}
    animate={{
      y: "-15vh",
      opacity: [0, 0.8, 0.7, 0],
      scale: [0.7, 1, 1, 0.65],
    }}
    transition={{
      duration: 11,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
      type: "tween",
    }}
    className="fixed pointer-events-none"
    style={{
      left,
      fontSize: size,
      color,
      filter: "blur(2px) drop-shadow(0 0 18px pink)",
      zIndex: 0,
      top: 0,
    }}
  >
    <motion.span
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1.05, 1] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        repeatType: "mirror",
        type: "tween",
      }}
      style={{ display: "inline-block" }}
    >
      ❤️
    </motion.span>
  </motion.div>
);

// Gentle Twinkling Sparkle Accent
const Sparkle = ({ left, top, size, delay = 0 }) => (
  <motion.div
    className="fixed pointer-events-none"
    style={{
      left,
      top,
      fontSize: size,
      filter: "drop-shadow(0 0 10px #ffe5fa) blur(0.5px)",
      color: "#ffe5fa",
      opacity: 0.52,
      zIndex: 10,
    }}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{
      scale: [0.8, 1.3, 1, 0.9, 0.8],
      opacity: [0, 0.7, 0.7, 0.5, 0],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      repeatType: "loop",
      ease: "linear",
      type: "tween",
    }}
  >
    ✨
  </motion.div>
);

// --- Team Card: Cute, Interactive, Gentle ---
const CARD_HEIGHT = 485;
const CARD_WIDTH = 312;

function TeamCard({ member }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      className="relative cursor-pointer select-none group"
      style={{
        perspective: 1200,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        minWidth: CARD_WIDTH,
        minHeight: CARD_HEIGHT,
      }}
      onClick={() => setFlipped((f) => !f)}
      whileTap={{ scale: 0.96 }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (["Enter", " "].includes(e.key)) setFlipped((f) => !f);
      }}
    >
      <AnimatePresence initial={false} mode="wait">
        {!flipped ? (
          // Card Front
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -60, opacity: 0 }}
            transition={{ duration: 0.48, ease: "easeInOut", type: "tween" }}
            className="absolute w-full h-full rounded-3xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-100/30 flex flex-col items-center justify-center shadow-2xl"
            style={{
              overflow: "hidden",
              backfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
              boxShadow: "0 6px 30px 6px #ffc1e3bb",
            }}
          >
            <motion.div
              initial={{ y: -18, scale: 1.2 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 13 }}
              className="rounded-full border-4 border-pink-100/50 bg-white mb-3 shadow-xl"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-32 h-32 aspect-square rounded-full object-cover"
                draggable={false}
              />
            </motion.div>
            <motion.div
              initial={{ y: 18, opacity: 0, scale: 0.7 }}
              animate={{ y: 0, opacity: 1, scale: [0.95, 1.15, 1] }}
              transition={{
                delay: 0.22,
                duration: 0.6,
                type: "tween",
              }}
              className="text-pink-400 text-3xl"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1, 0.97, 1] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  type: "tween",
                }}
              >
                ❤️
              </motion.span>
            </motion.div>
            <span className="mt-2 text-lg md:text-xl font-bold text-pink-500 font-poppins">
              {member.name}
            </span>
            <span className="mt-2 text-sm text-pink-400/90">Tap to reveal</span>
          </motion.div>
        ) : (
          // Card Back
          // Card Back
<motion.div
  key="back"
  initial={{ rotateY: -90, opacity: 0 }}
  animate={{ rotateY: 0, opacity: 1 }}
  exit={{ rotateY: 60, opacity: 0 }}
  transition={{ duration: 0.52, ease: "backOut", type: "tween" }}
  className="absolute w-full h-full bg-gradient-to-br from-pink-100/80 to-purple-50/80 
             border border-pink-100/25 rounded-3xl font-sans flex flex-col 
             pt-7 shadow-[0_8px_32px_0_#ffd6ee33] overflow-hidden"
  style={{
    backfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  }}
>
  {/* Heart doodle */}
  <motion.div
    className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden pointer-events-none"
    initial={{ scale: 1, opacity: 0.15 }}
    animate={{ scale: [1, 1.1, 1.05, 1], opacity: 0.16 }}
    transition={{
      duration: 4,
      repeat: Infinity,
      repeatType: "mirror",
      type: "tween",
    }}
  >
    <span className="text-[12rem] md:text-[14rem] text-pink-100 select-none pointer-events-none">
      ❤️
    </span>
  </motion.div>

  {/* Profile + Details */}
  <div className="z-10 px-2 flex flex-col items-center flex-grow">
    <img
      src={member.img}
      alt={member.name}
      className="w-24 h-24 rounded-full border-4 border-pink-200 object-cover shadow-md mb-2"
      draggable={false}
      loading="lazy"
    />
    <h2 className="text-pink-500 font-bold text-xl mb-1">{member.name}</h2>
    <span className="text-pink-300 font-medium text-base">{member.role}</span>
    <motion.div
      className="w-5 h-5 mt-1 text-pink-300"
      animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
      transition={{
        repeat: Infinity,
        duration: 1.8,
        repeatType: "reverse",
        type: "tween",
      }}
    >
      💖
    </motion.div>
    <hr className="h-[2px] w-16 bg-pink-200 rounded-full border-0 my-1 opacity-70" />
    <p
      className="mt-1 text-sm px-2 text-pink-700/90 text-center font-normal"
      style={{ whiteSpace: "pre-line" }}
    >
      {member.desc}
    </p>
    <p className="mt-2 px-4 italic text-sm text-pink-400 text-center font-normal">
      {member.fun}
    </p>
  </div>

  {/* LinkedIn button pinned bottom */}
  <div className="z-10 mt-auto mb-4 flex justify-center">
    <a
      href={member.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 text-pink-400 hover:text-pink-500 transition text-base font-semibold"
      onClick={(e) => e.stopPropagation()}
      tabIndex={-1}
    >
      <FaLinkedin size={20} /> Connect
    </a>
  </div>
</motion.div>

        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AboutUsPage() {
  const [hearts, setHearts] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Hearts
    setHearts(
      [...Array(28)].map(() => ({
        left: `${Math.random() * 97}%`,
        size: `${Math.random() * 32 + 28}px`,
        color: [
          "rgba(255,153,211,0.55)",
          "rgba(246,222,255,0.32)",
          "rgba(255,188,235,0.37)",
          "rgba(255,153,211,0.27)",
          "rgba(255,220,242,0.41)",
        ][Math.floor(Math.random() * 5)],
      }))
    );

    // Sparkles
    setSparkles(
      [...Array(18)].map(() => ({
        left: `${10 + Math.random() * 80}%`,
        top: `${4 + Math.random() * 92}%`,
        size: `${12 + Math.random() * 18}px`,
        delay: Math.random() * 6,
      }))
    );
  }, []);

  const team = [
    {
      name: "Ishant Singh",
      role: "🐣 The Cutie Pie with a Wild Mind",
      desc:
        "With his ADHD-fueled brain, Ishant turns wild, chaotic ideas into actual working systems.\nHe’s obsessed with blending psychology + games, and is the mastermind behind the psychometry, the AI and backend of Dream Partner.",
      fun:
        "Fun Fact: He’s never dated anyone… yet he’s making a dating game in the hopes of finally finding “the one” (cry, sobs 😭).",
      img: "/team/ishant.jpeg",
      linkedin: "https://www.linkedin.com/in/singhishant",
    },
    {
      name: "Kritika Ruhela",
      role: "👑 The Lady Don",
      desc:
        "The glue of the team—strict enough to keep everyone on track, but caring enough to make it feel like family.\nShe believes bonding is all about emotions, which shines through in her frontend, UI, and design magic.",
      fun:
        "Fun Fact: She gets annoyed very easily and has made bullying her teammates an official hobby 🙃.",
      img: "/team/kritika1.png",
      linkedin: "https://www.linkedin.com/in/ruhela-kritika",
    },
    {
      name: "Yash Gawali",
      role: "🧠 The Genius",
      desc:
        "The all-bow-before-him guy who makes sure every puzzle and mechanic actually works (or else he rages 💥).\nLoves creating clever challenges that reveal hidden sides of people, and is the go-to problem-fixer. In the project, he’s the master of 3D modeling and game-building.",
      fun:
        "Fun Fact: He can debate on literally any topic and has knowledge that makes the rest of us question if he’s even human.",
      img: "/team/yash.jpeg",
      linkedin: "https://www.linkedin.com/in/yash-gawali-298821288",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col text-pink-600 py-16 px-2 overflow-hidden bg-gradient-to-br from-pink-100 via-violet-100 to-pink-200">
      {/* Hearts and Sparkles */}
      {hearts.map((heart, i) => (
        <FloatingHeart
          key={i}
          delay={i * 0.7}
          left={heart.left}
          size={heart.size}
          color={heart.color}
        />
      ))}
      {sparkles.map((sp, i) => (
        <Sparkle key={i} {...sp} />
      ))}

      {/* Title */}
      <div className="text-center mb-14 relative z-20">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-lg font-cute-1 select-none text-pink-500">
          <span className="mr-2">💕</span>Meet the Singles Behind
          <span className="bg-gradient-to-r from-pink-400 via-pink-300 to-purple-400 text-transparent bg-clip-text mx-2">
            Dream Partner
          </span>
          💕
        </h1>
        <p className="text-lg md:text-xl opacity-80 font-light text-pink-400 drop-shadow-sm">
          Yup—we’re all single, coding away, and somehow building{" "}
          <span className="font-semibold">a love game 💖</span>
        </p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 px-1 md:px-6 z-20 relative">
        {team.map((member, i) => (
          <TeamCard key={i} member={member} />
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-16 relative z-20 text-pink-400 font-bold font-cute-1">
        <p className="text-3xl md:text-4xl mb-2 drop-shadow-[0_2px_8px_#ffc1e1]">
          💫 Together, We Are{" "}
          <span className="text-pink-500">Team Meta MahaRathi</span> 💫
        </p>
        <p className="text-lg md:text-xl opacity-80 font-light mb-2">
          Wild, single, and coding love—{" "}
          <span className="font-semibold">Dream Partner</span> is more than a
          game, it’s a vibe 💕
        </p>
      </div>
    </div>
  );
}
