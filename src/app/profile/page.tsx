"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// --- Heart Cursor ---
function HeartCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    document.body.style.cursor = "none";

    const handleMouse = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    let frame: number;
    const animate = () => {
      smoothRef.current.x += (posRef.current.x - smoothRef.current.x) * 0.2;
      smoothRef.current.y += (posRef.current.y - smoothRef.current.y) * 0.2;

      if (cursorRef.current) {
        const t = Date.now() * 0.002;
        const scale = 0.98 + 0.08 * Math.sin(t);
        cursorRef.current.style.transform = `translate(${smoothRef.current.x}px, ${smoothRef.current.y}px) scale(${scale}) translate(-50%, -50%)`;
      }

      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(frame);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
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


// --- Parallax Hearts ---
function ParallaxHearts({ amt = 16, scale = 1, z = 0 }) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setMouseOffset({
        x: (e.clientX / window.innerWidth - 0.5) * 60 * scale,
        y: (e.clientY / window.innerHeight - 0.5) * 38 * scale,
      });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [scale]);
  const hearts = ["💗", "💕", "🩷", "💖"];
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" style={{ zIndex: z }}>
      {[...Array(amt)].map((_, i) => (
        <motion.div
          key={"heart" + i}
          className="absolute"
          style={{
            left: `${(i * 13 + 8 + i * 3) % 100}%`,
            top: `${(i * 21 + 14 + i * 2) % 100}%`,
            zIndex: i % 8 === 0 ? 3 : i % 6 === 0 ? 1 : 2,
          }}
          animate={{
            y: [
              0,
              mouseOffset.y * (0.10 + (i % 5) * 0.021) + Math.sin(i) * 41,
              -17 - Math.cos(i * 1.05) * 11, 0
            ],
            x: [
              0,
              mouseOffset.x * (0.04 + (i % 5) * 0.026) + Math.cos(i * 0.87) * 11, 0
            ],
            opacity: [0.35, 0.74, 0.50, 1, 0.8],
            rotate: [0, 12 + Math.cos(i), -10 + Math.sin(i), 0],
          }}
          transition={{
            duration: 13 + i * 0.14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.13,
          }}
        >
          <span
            style={{
              fontSize: `${15 + (i % 4) * 7}px`,
              opacity: 0.22 + 0.09 * (i % 5),
              filter: "drop-shadow(0 1.5px 7px #ffbee3) drop-shadow(0 1px 15px #fff9f9af)"
            }}
          >
            {hearts[i % hearts.length]}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// --- Parallax Sparkles ---
function ParallaxSparkles({ amt = 7, z = 0 }) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      setMouseOffset({
        x: (e.clientX / window.innerWidth - 0.5) * 70,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);
  const sparkleVariants = ["✨", "🌸"];
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" style={{ zIndex: z }}>
      {[...Array(amt)].map((_, i) => (
        <motion.div
          key={"sparkle" + i}
          className="absolute"
          style={{
            left: `${(i * 19 + 33 + i * 2.7) % 100}%`,
            top: `${(i * 15 + 24 + i * 6.2) % 100}%`,
            zIndex: 7,
          }}
          animate={{
            y: [
              0,
              mouseOffset.y * (0.03 + (i % 3) * 0.032) + Math.sin(i * 2) * 8,
              8,
              0,
            ],
            x: [
              0,
              mouseOffset.x * (0.02 + (i % 7) * 0.013) +
                Math.cos(i * 2.2) * 7,
              0,
            ],
            opacity: [0.29, 0.6, 0.22, 0.44],
            scale: [0.7, 1.16, 0.87, 0.78],
            rotate: [0, 23, 6, 0],
          }}
          transition={{
            duration: 11 + i * 0.22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        >
          <span
            style={{
              fontSize: `${16 + (i % 3) * 5}px`,
              opacity: 0.2 + 0.13 * (i % 4),
              filter: "drop-shadow(0 2px 9px #fff5) drop-shadow(0 0 18px #f5bfff55)",
            }}
          >
            {sparkleVariants[i % sparkleVariants.length]}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    gender: "",
    bio: "",
  });
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (!/^\d{0,10}$/.test(value)) return;
    }
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dob) return alert("Please select your Date of Birth");
    if (!formData.name.trim()) return alert("Please enter your name");
    if (!/^\d{10}$/.test(formData.phone)) return alert("Phone number must be 10 digits");
    if (!formData.gender) return alert("Please select your gender");
    localStorage.setItem("profileData", JSON.stringify(formData));
    const dob = new Date(formData.dob);
    const day = dob.getDate();
    let route = "/details";
    if ([1, 10, 19, 28].includes(day)) route = "/sun";
    else if ([2, 11, 20, 29].includes(day)) route = "/moon";
    else if ([3, 12, 21, 30].includes(day)) route = "/jupiter";
    else if ([4, 13, 22, 31].includes(day)) route = "/neptune";
    else if ([5, 14, 23].includes(day)) route = "/mercury";
    else if ([6, 15, 24].includes(day)) route = "/venus";
    else if ([7, 16, 25].includes(day)) route = "/uranus";
    else if ([8, 17, 26].includes(day)) route = "/saturn";
    else if ([9, 18, 27].includes(day)) route = "/mars";
    router.push(route);
  };

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{
        cursor: "none",
        background: "linear-gradient(120deg,#f7c6ed 0%,#edcfff 90%)",
      }}
    >
      <HeartCursor />
      <ParallaxHearts amt={20} scale={1.0} z={0} />
      <ParallaxHearts amt={9} scale={0.7} z={1} />
      <ParallaxSparkles amt={6} z={2} />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-pink-200/60 via-purple-50/30 via-60% to-transparent z-0" />
      <div className="relative z-10 flex flex-col justify-center items-center h-full px-4">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.92, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/75 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-2xl flex flex-col gap-4 border border-pink-200/60"
        >
          <h1 className="text-3xl font-black text-pink-500 mb-2 text-center drop-shadow-lg tracking-tight">
            💕 Love Profile 💕
          </h1>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="py-2 px-3 rounded-xl border-none mt-1 bg-pink-50/80 focus:ring-2 focus:ring-pink-300 text-pink-900 text-base font-medium placeholder-pink-300 shadow-inner"
            maxLength={40}
            required
            autoComplete="off"
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="py-2 px-3 rounded-xl bg-pink-50/80 border-none focus:ring-2 focus:ring-pink-300 text-pink-800 font-medium"
            required
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="py-2 px-3 rounded-xl bg-pink-50/80 focus:ring-2 focus:ring-pink-300 text-pink-900 text-base font-medium placeholder-pink-300 shadow-inner"
            autoComplete="email"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (10 digits)"
            value={formData.phone}
            onChange={handleChange}
            className="py-2 px-3 rounded-xl bg-pink-50/80 focus:ring-2 focus:ring-pink-300 text-pink-900 text-base font-medium placeholder-pink-300 shadow-inner"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            required
          />
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="py-2 px-3 rounded-xl bg-pink-50/80 focus:ring-2 focus:ring-pink-300 text-pink-800 text-base font-medium"
            required
          />
          <textarea
            name="bio"
            placeholder="Write a short, sweet bio ..."
            value={formData.bio}
            onChange={handleChange}
            className="py-2 px-3 rounded-xl bg-pink-50/70 focus:ring-2 focus:ring-pink-200 text-pink-900 resize-none min-h-[60px] text-base font-medium placeholder-pink-300 shadow-inner transition-all duration-200 hover:min-h-[85px] focus:min-h-[100px]"
            maxLength={160}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.08, boxShadow: "0 0 30px #fd90c7" }}
            whileTap={{ scale: 0.93 }}
            className="mt-3 bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 text-white font-bold py-2 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 text-lg tracking-wide"
          >
            Save Profile 💖
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
