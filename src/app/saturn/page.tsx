"use client";
import React, { Suspense, useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import "../globals.css";

// --- Galaxy Background with Constellations ---
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
  const particleCount = 20000;
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
    setMouse(mouse => ({
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
      <group ref={starsRef1}><Stars radius={200} depth={80} count={30000} factor={4} fade /></group>
      <group ref={starsRef2}><Stars radius={250} depth={100} count={12000} factor={10} fade /></group>
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
      <fog attach="fog" args={["#000000", 10, 400]} />
    </>
  );
}

function Constellations({ positions }: { positions: Float32Array }) {
  const geometry = useMemo(() => {
    const lineGeo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const totalStars = positions.length / 3;
    for (let i = 0; i < totalStars; i++) {
      const x1 = positions[i * 3], y1 = positions[i * 3 + 1], z1 = positions[i * 3 + 2];
      for (let j = i + 1; j < i + 5 && j < totalStars; j++) {
        const x2 = positions[j * 3], y2 = positions[j * 3 + 1], z2 = positions[j * 3 + 2];
        const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 25) vertices.push(x1, y1, z1, x2, y2, z2);
      }
    }
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return lineGeo;
  }, [positions]);
  return <lineSegments geometry={geometry}><lineBasicMaterial color="white" transparent opacity={0.3} /></lineSegments>;
}

// --- Saturn 3D Model (clickable) ---
function SaturnModel({ onHoverChange, onClick }: { onHoverChange?: (b: boolean) => void; onClick?: () => void }) {
  const { scene } = useGLTF("/models/saturn/scene.gltf");
  const bodyTexture = useTexture("/models/saturn/textures/saturn1_A_diffuse.png");
  const bodySpecular = useTexture("/models/saturn/textures/saturn1_A_specularGlossiness.png");
  const ringTexture = useTexture("/models/saturn/textures/saturn2_A_diffuse.png");
  const ringAlpha = useTexture("/models/saturn/textures/saturn2_A_specularGlossiness.png");
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const center = new THREE.Vector3();
      box.getCenter(center);
      modelRef.current.position.sub(center);
      modelRef.current.scale.setScalar(0.002);
    }
    scene.traverse((child: any) => {
      if (child.isMesh) {
        if (child.name.toLowerCase().includes("ring")) {
          child.material = new THREE.MeshStandardMaterial({
            map: ringTexture,
            alphaMap: ringAlpha,
            transparent: true,
            side: THREE.DoubleSide,
            metalness: 0.3,
            roughness: 0.6,
            color: new THREE.Color(0xb08f36),
          });
        } else {
          child.material = new THREE.MeshStandardMaterial({
            map: bodyTexture,
            metalnessMap: bodySpecular,
            metalness: 0.5,
            roughness: 0.4,
            emissive: new THREE.Color(0x224477),
            emissiveIntensity: 0.25,
            color: new THREE.Color(0xc4a484),
          });
        }
        child.material.needsUpdate = true;
      }
    });
  }, [scene, bodyTexture, bodySpecular, ringTexture, ringAlpha]);
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01;
    }
  });
  return (
    <group
      ref={groupRef}
      onPointerOver={e => { e.stopPropagation(); onHoverChange && onHoverChange(true); }}
      onPointerOut={e => { e.stopPropagation(); onHoverChange && onHoverChange(false); }}
      onClick={onClick}
    >
      <group ref={modelRef}>
        <primitive object={scene} dispose={null} />
      </group>
    </group>
  );
}
useGLTF.preload("/models/saturn/scene.gltf");

// --- Typewriter ---
const TypewriterText = ({ text }: { text: string }) => {
  const [visible, setVisible] = useState("");
  useEffect(() => {
    let n = 0; let timer: NodeJS.Timeout;
    const step = () => {
      setVisible(text.slice(0, n + 1));
      if (n < text.length) {
        n++; timer = setTimeout(step, 28 + Math.random() * 28);
      }
    };
    step();
    return () => clearTimeout(timer);
  }, [text]);
  return (<span>{visible}<span className="text-purple-300 animate-pulse">|</span></span>);
};

// --- Navbar ---
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
// --- Sidebar ---
function Sidebar({ isOpen, closeSidebar }: { isOpen: boolean; closeSidebar: () => void }) {
  const router = useRouter();
  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 z-[500] transition-all duration-500 bg-black/90
      ${isOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-full opacity-0 pointer-events-none"}`}
    >
      <button onClick={closeSidebar} className="absolute top-4 right-4 text-white text-xl font-bold z-50">✕</button>
      <ul className="flex flex-col mt-32 ml-6 space-y-8 text-white text-2xl">
        <li className="cursor-pointer hover:text-pink-400" onClick={() => { closeSidebar(); router.push("/about"); }}>ABOUT</li>
        <li className="cursor-pointer hover:text-pink-400" onClick={() => { closeSidebar(); router.push("/contact"); }}>CONTACT</li>
        <li className="cursor-pointer hover:text-pink-400" onClick={() => { closeSidebar(); router.push("/details"); }}>PROFILE</li>
      </ul>
    </div>
  );
}

// --- HeartCursor ---
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
    return () => { window.removeEventListener("mousemove", handle); cancelAnimationFrame(frame); };
  }, [pos.x, pos.y]);
  return (
    <div ref={cursorRef} style={{ position: "fixed", left: smooth.x, top: smooth.y, width: 28, height: 28, pointerEvents: "none", zIndex: 130, filter: "drop-shadow(0 1px 6px #ffc0cbad)", userSelect: "none" }}>
      <svg width={28} height={28} viewBox="0 0 32 29.6">
        <path d="M23.6,0c-2.6,0-5,1.4-6.6,3.6C15.4,1.4,13,0,10.4,0C4.7,0,0,4.8,0,10.4
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

// --- Saturn Page ---
export default function SaturnPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.27, 0.32], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0.19, 0.32], [0, -200]);
  const cardOpacity = useTransform(scrollYProgress, [0.31, 0.36], [0, 1]);
  const cardY = useTransform(scrollYProgress, [0.31, 0.36], [80, 0]);
  const saturnX = useTransform(scrollYProgress, [0.26, 0.36], ["0vw", "18vw"]);
  const saturnScale = useTransform(scrollYProgress, [0.26, 0.36], [1, 1.18]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const router = useRouter();

  return (
    <div className="w-full min-h-[240vh] bg-black relative cursor-none overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <Canvas
          camera={{ position: [0, 0, 70], fov: 56, near: 0.1, far: 800 }}
          dpr={[1, 2]}
          style={{
            width: "100vw",
            height: "100vh",
            background: "transparent",
            pointerEvents: "none"
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
      <motion.div style={{ opacity: heroOpacity, y: heroY, pointerEvents: heroOpacity ? "auto" : "none" }} className="fixed inset-0 z-30">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ top: "8vh", position: "absolute", zIndex: 2 }}>
          <span
            className="font-extrabold uppercase leading-none"
            style={{
              fontSize: "clamp(8rem, 28vw, 18rem)",
              fontFamily: '"Baloo 2", "Arial Black", Arial, sans-serif',
              color: "#d1c6f8",
              textShadow: "0 12px 80px #000a, 0 3px 18px #363a, 0 1px 0 #fff7",
              letterSpacing: "-0.042em", lineHeight: 0.84,
              filter: "blur(0.2px)",
            }}
          >
            SATURN
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
              <div className="relative bg-purple-100/90 text-purple-900 px-7 py-3 rounded-2xl shadow-xl border border-purple-300 font-semibold text-lg md:text-xl text-center min-w-[300px] max-w-[480px]">
                <TypewriterText text="⏳ Click on Saturn to unlock karmic wisdom! ⏳" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* SATURN 3D MODEL */}
      <motion.div
        className="fixed z-[200] flex items-center justify-center"
        style={{
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          x: saturnX,
          scale: saturnScale,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "clamp(480px,66vw,1400px)",
            height: "clamp(480px,66vw,1400px)",
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 13], fov: 56 }}
            style={{ background: "none", width: "100%", height: "100%" }}
          >
            <ambientLight intensity={1.18} />
            <directionalLight position={[10, 10, 10]} intensity={2.5} castShadow />
            <Suspense
              fallback={
                <mesh>
                  <sphereGeometry args={[2, 32, 32]} />
                  <meshStandardMaterial color="#a592c4" />
                </mesh>
              }
            >
              {/* ⬅️ Interactivity only on Saturn */}
              <SaturnModel
                onHoverChange={setShowTypewriter}
                onClick={() => router.push("/game")}
              />
            </Suspense>
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        </div>
      </motion.div>
      <div style={{ height: "110vh" }} />

      {/* NUMEROLOGY CARD */}
      <motion.div
        style={{
          opacity: cardOpacity,
          y: cardY,
          marginLeft: "clamp(2vw,8vw,16vw)"
        }}
        className={`
          relative z-20 max-w-lg md:max-w-xl p-8 mt-32 rounded-2xl
          bg-gradient-to-br from-purple-400/40 via-black/85 to-purple-900/60
          border border-purple-300/40 shadow-[0_0_36px_rgba(160,130,255,0.22)]
          backdrop-blur-xl
        `}
        initial={{ opacity: 0 }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-4"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            background: "linear-gradient(90deg,#ede4fa 40%,#a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ⏳ Numerology No. 8 – Saturn
        </motion.h2>
        <p className="text-base md:text-lg text-purple-100/90 font-medium text-center">
          Planet of <span className="font-semibold text-purple-200">karma, discipline, and endurance</span>.<br />
          Guides one through patience, responsibility, and wisdom of destiny.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {["Karma", "Discipline", "Endurance", "Patience", "Wisdom"].map((trait, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-purple-900/40 border border-purple-400/30 
                shadow-[0_0_12px_rgba(160,130,255,0.32)] text-purple-100 text-sm md:text-base font-semibold"
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
