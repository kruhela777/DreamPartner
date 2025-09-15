"use client";
import React, { useState, useEffect, Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import "./heart.css";
import "./parallax.css";
// import { GroupProps } from "@react-three/fiber";
import { GLTF } from "three-stdlib";

// Typewriter Chatbox Component
function TypewriterChatbox() {
  const [text, setText] = useState("");
  const fullText = "🌟💌 Welcome to Dream Partner! 💖🌷 Find your perfect match 💕🌙✨";
  
  useEffect(() => {
    let i = 0;
    const type = () => {
      if (i < fullText.length) {
        setText((prev) => prev + fullText.charAt(i));
        i++;
        setTimeout(type, 70); // speed
      }
    };
    type();
    // cleanup if unmount
    return () => { i = fullText.length; };
  }, []);
  
  return (
    <div style={{
      position: "fixed",
      bottom: "36px",
      right: "36px",
      zIndex: 99,
      background: "rgba(255, 255, 255, 0.97)",
      borderRadius: "16px",
      padding: "20px 30px",
      boxShadow: "0 8px 32px 0 rgba(226,85,161,0.15)",
      minWidth: "260px",
      fontSize: "1.15rem",
      fontWeight: "bold",
      fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
      color: "#e255a1",
      display: "flex",
      alignItems: "center",
      border: "2px solid #e255a1"
    }}>
      <span>{text}</span>
      <span style={{
        marginLeft: "2px",
        color: "#e255a1",
        fontSize: "1.2em",
        animation: "blink 1s infinite"
      }}>|</span>
      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

// Cupid 3D Model
function CupidModel(props: React.ComponentProps<'group'>) {
  const { scene } = useGLTF("/models/heart/cupid.glb") as GLTF;
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef<number>(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    elapsed.current += delta;
    const t = elapsed.current;

    const flyInDuration = 4;
    const spinDuration = 4;
    const hoverDownDuration = 2;

    function easeInOut(x: number) {
      return x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x;
    }

    if (t < flyInDuration) {
      const progress = easeInOut(t / flyInDuration);
      group.current.position.x = -8 + 8 * progress;
      group.current.position.y = 0;
      group.current.rotation.y = 0;
    } else if (t < flyInDuration + spinDuration) {
      const phaseT = (t - flyInDuration) / spinDuration;
      group.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 6, easeInOut(phaseT));
      group.current.position.y = THREE.MathUtils.lerp(0, 2, phaseT);
    } else if (t < flyInDuration + spinDuration + hoverDownDuration) {
      const phaseT = (t - flyInDuration - spinDuration) / hoverDownDuration;
      const eased = easeInOut(phaseT);
      group.current.position.y = THREE.MathUtils.lerp(2, 0, eased);
    } else {
      group.current.rotation.y += delta * 0.3;
      group.current.position.y = Math.sin(t) * 0.3;
    }
  });

  return (
    <group ref={group} scale={0.9} {...props}>
      <primitive object={scene} />
    </group>
  );
}
export default function HeartIntro() {
  const [showParallax, setShowParallax] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const heartTimer = setTimeout(() => setShowHeartOverlay(false), 4000);
    const parallaxTimer = setTimeout(() => {
      setShowParallax(true);
      const redirectTimer = setTimeout(() => {
        router.push("/questions");
      }, 10000);
      return () => clearTimeout(redirectTimer);
    }, 5000);

    return () => {
      clearTimeout(heartTimer);
      clearTimeout(parallaxTimer);
    };
  }, [router]);

  return (
    <div className="page-wrapper" style={{ position: "relative", minHeight: "100vh" }}>
      {/* Heart Intro Overlay */}
      {showHeartOverlay && (
        <div className="overlay">
          <div className="heart"></div>
        </div>
      )}

      {/* Parallax + Cupid */}
      {showParallax && (
        <section className="content">
          <div className="paralax">
            <div className="layer hills"></div>
            <div className="layer rocks1"></div>
            <div className="layer rocks2"></div>
            <div className="layer foreground"></div>
          </div>

          <div
            className="cupid-container"
            style={{
              position: "absolute",
              left: "50%",
              top: "70%",
              transform: "translate(-50%,-50%)",
              width: "700px",
              height: "700px",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Canvas
              camera={{ position: [0, 0, 6], fov: 50 }}
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
                pointerEvents: "none",
              }}
            >
              <ambientLight intensity={1.2} />
              <directionalLight position={[3, 3, 3]} intensity={1.3} />
              <Suspense fallback={null}>
                <CupidModel />
              </Suspense>
              <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>
          </div>
        </section>
      )}

      {/* Floating typewriter chatbox */}
      <TypewriterChatbox />
    </div>
  );
}