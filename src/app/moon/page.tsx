"use client";
import React, { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import "../globals.css";

// --- Galaxy Background ---
function GalaxyBackground() {
  const starsRef1 = useRef<THREE.Group>(null);
  const starsRef2 = useRef<THREE.Group>(null);
  const nebulaRef = useRef<THREE.Points>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const circleTexture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const particleCount = 40000;
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 150;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
      col[i * 3] = Math.random() * 0.8 + 0.2;
      col[i * 3 + 1] = Math.random() * 0.5 + 0.1;
      col[i * 3 + 2] = Math.random() * 1.0;
    }
    return { positions: pos, colors: col };
  }, []);

  const nebulaGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [positions, colors]);

  useFrame(() => {
    setMouse((mouse) => ({
      x: mouse.x + (mouseTarget.current.x - mouse.x) * 0.05,
      y: mouse.y + (mouseTarget.current.y - mouse.y) * 0.05,
    }));
    if (starsRef1.current) {
      starsRef1.current.rotation.y += 0.0005;
      starsRef1.current.rotation.x = mouse.y * 0.3;
      starsRef1.current.rotation.z = mouse.x * 0.3;
    }
    if (starsRef2.current) {
      starsRef2.current.rotation.y -= 0.00025;
      starsRef2.current.rotation.x = mouse.y * 0.2;
      starsRef2.current.rotation.z = mouse.x * 0.2;
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += 0.0003;
      nebulaRef.current.rotation.x = mouse.y * 0.25;
      nebulaRef.current.rotation.z = mouse.x * 0.25;
    }
  });

  return (
    <>
      <group ref={starsRef1}>
        <Stars radius={200} depth={80} count={60000} factor={4} fade saturation={0.5} />
      </group>
      <group ref={starsRef2}>
        <Stars radius={250} depth={100} count={12000} factor={10} fade saturation={0.7} />
      </group>
      <points ref={nebulaRef} geometry={nebulaGeometry}>
        <pointsMaterial
          vertexColors
          size={1.5}
          map={circleTexture}
          alphaTest={0.01}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <Constellations positions={positions} />
      <fog attach="fog" args={["#000000", 10, 300]} />
    </>
  );
}

function Constellations({ positions }: { positions: Float32Array }) {
  const geometry = useMemo(() => {
    const lineGeo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const totalStars = positions.length / 3;
    for (let i = 0; i < totalStars; i++) {
      const x1 = positions[i * 3];
      const y1 = positions[i * 3 + 1];
      const z1 = positions[i * 3 + 2];
      for (let j = i + 1; j < i + 5 && j < totalStars; j++) {
        const x2 = positions[j * 3];
        const y2 = positions[j * 3 + 1];
        const z2 = positions[j * 3 + 2];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance < 25) {
          vertices.push(x1, y1, z1, x2, y2, z2);
        }
      }
    }
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return lineGeo;
  }, [positions]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="white" transparent opacity={0.3} />
    </lineSegments>
  );
}

// --- Moon Model ---
function MoonModel({ onHoverChange, onClick }: { onHoverChange: (h: boolean) => void; onClick?: () => void }) {
  const { scene } = useGLTF("/models/moon/scene.gltf");
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = child.receiveShadow = true;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m: any) => {
          if (!m) return;
          m.side = THREE.DoubleSide;
          m.transparent = false;
        });
      }
    });
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = 600 / Math.max(size.x, size.y, size.z, 1); // even bigger moon
scene.scale.setScalar(scale);


  }, [scene]);

  useFrame(() => {
    if (groupRef.current) {
      scene.rotation.y += 0.065;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHoverChange(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHoverChange(false);
      }}
      onClick={onClick}
    >
      <primitive object={scene} dispose={null} />
    </group>
  );
}
useGLTF.preload("/models/moon/scene.gltf");

// --- Typewriter Text ---
const TypewriterText = ({ text, className }: { text: string; className?: string }) => {
  const [visible, setVisible] = useState("");
  useEffect(() => {
    let n = 0;
    let timer: NodeJS.Timeout;
    const step = () => {
      setVisible(text.slice(0, n + 1));
      if (n < text.length) {
        n++;
        timer = setTimeout(step, 25 + Math.random() * 18);
      }
    };
    step();
    return () => clearTimeout(timer);
  }, [text]);
  return (
    <span className={className || ""}>
      {visible}
      <span className="text-pink-300 animate-pulse">|</span>
    </span>
  );
};

function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <nav className="fixed top-0 left-0 w-full text-white px-6 py-4 flex justify-between items-center z-[110] bg-transparent">
      {/* Logo */}
      <div className="logo-container text-center leading-none select-none">
        <div
          className="top-text uppercase"
          style={{
            fontSize: "2rem",
            fontFamily: "'Spicy Rice', cursive",
            color: "#000",
            textShadow: `
              -1px -1px 0 #fff5c3,  
               1px -1px 0 #fff5c3,
              -1px  1px 0 #fff5c3,
               1px  1px 0 #fff5c3,
               3px  3px 5px rgba(0,0,0,0.5)
            `
          }}
        >
          Dream
        </div>
        <div
          className="bottom-text uppercase"
          style={{
            fontSize: "2.8rem",
            marginTop: "-0.2em",
            fontFamily: "'Spicy Rice', cursive",
            color: "red",
            textShadow: `
              -1px -1px 0 #000,  
               1px -1px 0 #000,
              -1px  1px 0 #000,
               1px  1px 0 #000,
               4px  4px 6px rgba(0,0,0,0.5)
            `
          }}
        >
          Partner
        </div>
      </div>

      {/* Menu button */}
      <button
        onClick={toggleSidebar}
        className="relative flex items-center justify-center w-20 h-20 rounded-full group"
      >
        <span className="absolute inset-0 rounded-full border-2 border-white border-r-transparent border-b-transparent transition-transform duration-700 group-hover:rotate-180"></span>
        <span className="text-white font-bold tracking-wider">MENU</span>
      </button>
    </nav>
  );
}

function Sidebar({ isOpen, closeSidebar }: { isOpen: boolean; closeSidebar: () => void }) {
  const router = useRouter();
  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 z-[120] transform transition-transform duration-500 bg-black/90 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        onClick={closeSidebar}
        className="absolute top-4 right-4 text-white text-xl font-bold z-50"
      >✕</button>
      <ul className="flex flex-col mt-32 ml-6 space-y-8 text-white text-2xl">
        <li className="cursor-pointer hover:text-pink-400"
          onClick={() => { closeSidebar(); router.push("/about"); }}>ABOUT</li>
        <li className="cursor-pointer hover:text-pink-400"
          onClick={() => { closeSidebar(); router.push("/contact"); }}>CONTACT</li>
        <li className="cursor-pointer hover:text-pink-400"
          onClick={() => { closeSidebar(); router.push("/details"); }}>PROFILE</li>
      </ul>
    </div>
  );
}

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
      setSmooth((prev) => ({
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
        zIndex: 130,
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

// --- Main Page ---
export default function MoonPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.27, 0.32], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0.19, 0.32], [0, -200]);
  const cardOpacity = useTransform(scrollYProgress, [0.31, 0.36], [0, 1]);
  const cardY = useTransform(scrollYProgress, [0.31, 0.36], [80, 0]);
  const moonX = useTransform(scrollYProgress, [0.26, 0.36], ["0vw", "18vw"]);
  const moonScale = useTransform(scrollYProgress, [0.26, 0.36], [1, 1.35]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const router = useRouter();

  return (
    <div className="w-full min-h-[240vh] bg-black relative cursor-none overflow-x-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <Canvas
          camera={{ position: [0, 0, 70], fov: 55, near: 0.1, far: 800 }}
          dpr={[1, 2]}
          style={{
            width: "100vw",
            height: "100vh",
            background: "transparent",
            pointerEvents: "none",
          }}
        >
          <color attach="background" args={["#000000"]} />
          <GalaxyBackground />
        </Canvas>
      </div>

      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      <HeartCursor />

      {/* HERO SECTION TEXT */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="fixed inset-0 z-30"
      >
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ top: "8vh", position: "absolute", zIndex: 2 }}
        >
          <span
  className="font-extrabold uppercase leading-none"
  style={{
    fontSize: "clamp(12rem, 30vw, 20rem)", // current size
    fontFamily: '"Baloo 2", "Arial Black", Arial, sans-serif',
    color: "#F7F7FF",
    textShadow: "0 12px 80px #000a, 0 3px 18px #003a, 0 1px 0 #fff7",
    letterSpacing: "-0.042em",
    lineHeight: 0.84,
    filter: "blur(0.2px)",
  }}
>
  MOON
</span>

        </div>
        <AnimatePresence>
          {showTypewriter && (
            <motion.div
              className="absolute left-1/2"
              style={{ top: "21vh", zIndex: 20, transform: "translateX(-50%)" }}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative bg-pink-50/90 text-pink-700 px-7 py-3 rounded-2xl shadow-xl border border-pink-200 font-semibold text-lg md:text-xl text-center min-w-[300px] max-w-[480px]">
                <TypewriterText text="🌕 Click on your moon to unlock your inner wisdom! 🌕" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MOON 3D MODEL */}
      <motion.div
        className="fixed z-40 flex items-center justify-center"
        style={{
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          x: moonX,
          scale: moonScale,
          pointerEvents: "auto",
        }}
      >
        <div
  style={{
    width: "clamp(1000px,54vw,800px)", // much bigger container
    height: "clamp(1000px,54vw,800px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "auto",
  }}
>

          <Canvas
            camera={{ position: [0, 0, 16], fov: 56, near: 0.1, far: 100 }}
            dpr={[1, 2]}
            style={{ width: "100%", height: "100%", background: "none" }}
            shadows
          >
            <ambientLight intensity={1.15} />
            <directionalLight position={[10, 10, 10]} intensity={2.7} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={1.1} />
            <Suspense
              fallback={
                <mesh>
                  <sphereGeometry args={[2, 32, 32]} />
                  <meshStandardMaterial color="#EEEEEE" />
                </mesh>
              }
            >
              <MoonModel
                onHoverChange={setShowTypewriter}
                onClick={() => router.push("/game")}
              />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </div>
      </motion.div>

      {/* Spacer */}
      <div style={{ height: "110vh" }} />

      {/* NUMEROLOGY CARD */}
      <motion.div
        style={{ opacity: cardOpacity, y: cardY, marginLeft: "clamp(2vw,8vw,16vw)" }}
        className="relative z-20 max-w-lg md:max-w-xl p-8 mt-32 rounded-2xl
        bg-gradient-to-br from-gray-300/70 via-black/85 to-pink-100/40
        border border-pink-200 shadow-[0_0_40px_rgba(205,180,255,0.20)]
        backdrop-blur-xl overflow-hidden"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-200/10 via-transparent to-gray-100/5 blur-2xl pointer-events-none" />
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-4"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            textShadow: "0 2px 14px #e8e2f8, 0 0 24px #c6baff",
            background: "linear-gradient(90deg,#ede4fa 40%,#d1cefa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🌙 Numerology No. 2 – Moon
        </motion.h2>
        <motion.p
          className="text-base md:text-lg text-pink-100/90 font-medium leading-relaxed text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          <span className="font-semibold text-pink-200">Symbol of intuition, sensitivity, and harmony.</span>
          <br />
          Nurturers who feel deeply and value emotional balance, seeking partners who build trust and shared dreams.
        </motion.p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {["Intuition", "Empathy", "Harmony", "Emotional Balance", "Dreams"].map((trait, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-pink-900/40 border border-pink-400/30 
              shadow-[0_0_12px_rgba(205,180,255,0.35)] text-pink-100 text-sm md:text-base font-semibold"
            >
              {trait}
            </span>
          ))}
        </div>
      </motion.div>
      <div style={{ height: "100vh" }} />
    </div>
  );
}
