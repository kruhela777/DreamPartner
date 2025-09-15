"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaUser, FaVenusMars, FaMapMarkerAlt, FaPhone,
  FaEnvelope, FaHeart,
} from "react-icons/fa";

// --- Helper: Assign an emotion emoji ---
function emotionEmoji(e: string): string {
  switch ((e || "").toLowerCase()) {
    case "joy": return "😊";
    case "trust": return "🤝";
    case "fear": return "😨";
    case "surprise": return "😮";
    case "sadness": return "😢";
    case "disgust": return "🤢";
    case "anger": return "😡";
    case "anticipation": return "🤔";
    case "love": return "💕";
    default: return "💫";
  }
}

// --- Type Definitions for Component Props ---
interface EmotionalRadarProps {
  emotionData?: Record<string, number>;
  width?: number;
  height?: number;
}

interface EmotionCardData {
  name?: string;
  emotion_name?: string;
  score?: number;
  prevalence?: number;
}

interface TopEmotionsCardsProps {
  emotions: EmotionCardData[];
}

// --- Type Definitions for State ---
interface Profile {
  name?: string;
  dob?: string;
  email?: string;
  phone?: string;
  gender?: string;
  location?: string;
  bio?: string;
}

interface PadAnalysisResult {
  emotion_scores: { emotion_name: string; prevalence_score: number }[];
  top_emotions: EmotionCardData[];
  core_triad: {
    pleasure: number;
    arousal: number;
    dominance: number;
  };
}


// --- Responsive Radar Chart ---
const EmotionalRadar = ({ emotionData, width = 490, height = 490 }: EmotionalRadarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const defaultData: Record<string, number> = {
    Joy: 85, Trust: 75, Fear: 20, Surprise: 48,
    Sadness: 35, Disgust: 21, Anger: 60, Anticipation: 68,
  };
  const data = emotionData || defaultData;
  const emotions = Object.keys(data);
  const values: number[] = Object.values(data);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const margin = 46;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - margin;
    const angle = (2 * Math.PI) / emotions.length;

    // Background gradient & shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 42, 0, 2 * Math.PI);
    const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius + 42);
    bgGrad.addColorStop(0, "rgba(255,205,250,.73)");
    bgGrad.addColorStop(0.5, "rgba(249,144,204,0.32)");
    bgGrad.addColorStop(1, "rgba(103,58,183,0.10)");
    ctx.fillStyle = bgGrad;
    ctx.globalAlpha = 0.82;
    ctx.shadowBlur = 60;
    ctx.shadowColor = "#FDB6E2";
    ctx.fill();
    ctx.restore();

    // Grid circles & axes
    ctx.globalAlpha = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.strokeStyle = "rgba(220,20,120,0.11)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * (i / 5), 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(220,20,120,0.18)";
    emotions.forEach((_, i) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(i * angle - Math.PI / 2),
        centerY + radius * Math.sin(i * angle - Math.PI / 2)
      );
      ctx.stroke();
    });

    // Labels
    ctx.font = '700 19px "Inter",sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    emotions.forEach((emotion, i) => {
      const labelRadius = radius + 39;
      const x = centerX + labelRadius * Math.cos(i * angle - Math.PI / 2);
      const y = centerY + labelRadius * Math.sin(i * angle - Math.PI / 2);
      ctx.fillStyle = "#d94682";
      ctx.fillText(`${emotion} ${emotionEmoji(emotion)}`, x, y);

      const valueR = radius * (values[i] / 100) * 0.8 + 45;
      const vx = centerX + valueR * Math.cos(i * angle - Math.PI / 2);
      const vy = centerY + valueR * Math.sin(i * angle - Math.PI / 2);
      ctx.fillStyle = "#673ab7";
      ctx.font = 'bold 16px "Inter",sans-serif';
      ctx.fillText(`${values[i]}%`, vx, vy);
    });

    // Radar polygon
    ctx.save();
    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    grad.addColorStop(0, "rgba(249,135,200,0.92)");
    grad.addColorStop(0.7, "rgba(120,60,208,0.52)");
    grad.addColorStop(1, "rgba(144,202,249,0.14)");
    ctx.beginPath();
    values.forEach((v, i) => {
      const vv = v / 100;
      const x = centerX + radius * vv * Math.cos(i * angle - Math.PI / 2);
      const y = centerY + radius * vv * Math.sin(i * angle - Math.PI / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.strokeStyle = "#db2777";
    ctx.lineWidth = 2.6;
    ctx.shadowColor = "#ddb6ee";
    ctx.shadowBlur = 19;
    ctx.globalAlpha = 0.82;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
    ctx.restore();

    // Dots
    values.forEach((v, i) => {
      const vv = v / 100;
      const x = centerX + radius * vv * Math.cos(i * angle - Math.PI / 2);
      const y = centerY + radius * vv * Math.sin(i * angle - Math.PI / 2);
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "#d94682";
      ctx.shadowBlur = 13;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#d94682";
      ctx.lineWidth = 2.8;
      ctx.stroke();
    });
  }, [data, width, height, emotions, values]);

  return (
    <div
      className="w-full flex justify-center items-center"
      style={{
        padding: "2.2rem 0",
        borderRadius: "2rem",
        background: "linear-gradient(114deg,#f9eef6 42%,#e7cef5 98%)",
        boxShadow: "0 8px 48px -12px #f250b6a1, 0 2px 4px #e1afe9a8",
        overflow: "visible"
      }}
    >
      <div style={{
        maxWidth: `${width + 62}px`,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h3 className="font-extrabold text-2xl md:text-3xl text-pink-800 mb-2 drop-shadow-sm">
          Emotional Spectrum
        </h3>
        <p className="text-pink-400 text-[1.16rem] mb-3">
          Your emotional profile across {Object.keys(data).length} key dimensions
        </p>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            border: "none",
            borderRadius: "2rem",
            boxShadow: "0 8px 48px -6px #e83979ab, 0 2px 4px #dbc1e9d5",
            margin: "0 auto",
            background: "rgba(250,245,255,0.13)",
            width: "100%",
            maxWidth: `${width}px`,
            display: "block"
          }}
        />
      </div>
    </div>
  );
};


// --- Heart Cursor ---
function HeartCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [smooth, setSmooth] = useState({ x: 0, y: 0 });

  useEffect(() => {
    document.body.style.cursor = "none";
    const handle = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    let frame: number;
    const animate = () => {
      setSmooth(prev => ({
        x: prev.x + (pos.x - prev.x) * 0.2,
        y: prev.y + (pos.y - prev.y) * 0.2,
      }));
      if (cursorRef.current) {
        const t = Date.now() * 0.0025;
        const scale = 0.99 + 0.07 * Math.sin(t);
        cursorRef.current.style.transform = `translate(-50%,-55%) scale(${scale})`;
      }
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("mousemove", handle);
      cancelAnimationFrame(frame);
      document.body.style.cursor = "auto";
    };
  }, [pos.x, pos.y]);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        left: smooth.x,
        top: smooth.y,
        width: 30,
        height: 30,
        pointerEvents: "none",
        zIndex: 1000,
        filter: "drop-shadow(0 1px 8px #ffc0cbad)",
        userSelect: "none",
      }}
    >
      <svg width={30} height={30} viewBox="0 0 32 29.6">
        <path
          d="M23.6,0c-2.6,0-5,1.4-6.6,3.6C15.4,1.4,13,0,10.4,0C4.7,0,0,4.8,0,10.4
                    c0,5.3,4.3,9.6,11,15.2l4.9,3.8l4.9-3.8c6.7-5.6,11-9.8,11-15.2
                    C32,4.8,27.3,0,23.6,0z"
          fill="#ff6dae"
          stroke="#e23e7c"
          strokeWidth="1.3"
        />
        <ellipse cx="10" cy="8" rx="4" ry="1.2" fill="#fff" opacity=".5" />
      </svg>
    </div>
  );
}

// --- Top Emotions Cards ---
function TopEmotionsCards({ emotions }: TopEmotionsCardsProps) {
  if (!emotions || emotions.length === 0) return null;
  const sorted = [...emotions].sort(
    (a, b) => (b.score ?? b.prevalence ?? 0) - (a.score ?? a.prevalence ?? 0)
  );
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-6 justify-items-center"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(238px,1fr))",
        gap: "22px",
        justifyItems: "center",
        alignItems: "stretch",
      }}
    >
      {sorted.map((e, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0.87, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.13 }}
          className="rounded-2xl p-5 bg-gradient-to-br from-pink-100 via-white to-fuchsia-100 shadow-lg border border-pink-200 flex flex-col items-center justify-between"
          style={{
            minHeight: 140,
            maxWidth: 265,
            width: "100%",
            textAlign: "center",
            justifyContent: "center",
            display: "flex"
          }}
        >
          <div className="text-4xl select-none mb-2">{emotionEmoji(e.name || e.emotion_name || "")}</div>
          <div>
            <div className="font-bold text-pink-700 text-lg">{e.name || e.emotion_name}</div>
            <div className="font-bold text-fuchsia-600 text-xl">{Number(e.score ?? e.prevalence).toFixed(1)}%</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// --- Main Profile Page ---
export default function ProfileDetailsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [result, setResult] = useState<PadAnalysisResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("profileData");
    if (saved) setProfile(JSON.parse(saved));
    const pad = localStorage.getItem("pad_analysis");
    if (pad) setResult(JSON.parse(pad));
  }, []);

  let emotionDataForRadar: Record<string, number> | undefined;
  if (result?.emotion_scores?.length) {
    emotionDataForRadar = Object.fromEntries(
      result.emotion_scores.slice(0, 8).map(e => [e.emotion_name, e.prevalence_score])
    );
  }

  if (!profile) return (
    <div className="p-8 text-center text-pink-200 bg-white/10 rounded-2xl max-w-lg mx-auto mt-16">
      No profile found. Please fill your profile first.
    </div>
  );

  return (
    <div
      className="w-full min-h-screen px-4 py-12 relative overflow-x-hidden overflow-y-auto"
      style={{
        background: "linear-gradient(120deg, #ffe3ec 10%, #fde2ff 68%, #e0c3fc 100%)"
      }}
    >
      <HeartCursor />
      <motion.div
        className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-stretch rounded-3xl py-8 px-6 md:px-10 bg-white/55 shadow-2xl backdrop-blur-xl border border-pink-100/60"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl border border-pink-100/60 p-8 rounded-3xl shadow-lg max-w-md w-full flex flex-col text-pink-800 items-center"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-pink-400 via-pink-200 to-fuchsia-400 flex items-center justify-center text-6xl font-black shadow-xl mb-2 ring-4 ring-white/80">
              {profile.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <h1 className="text-3xl font-extrabold mb-2 text-pink-600">{profile.name}</h1>
            <div className="space-y-2 w-full text-base">
              <p className="flex items-center gap-2"><FaUser className="text-pink-400" /> DOB: {profile.dob || "-"}</p>
              <p className="flex items-center gap-2"><FaEnvelope className="text-pink-400" /> Email: {profile.email || "-"}</p>
              <p className="flex items-center gap-2"><FaPhone className="text-pink-400" /> Phone: {profile.phone || "-"}</p>
              <p className="flex items-center gap-2"><FaVenusMars className="text-pink-400" /> Gender: {profile.gender || "-"}</p>
              <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-pink-400" /> Location: {profile.location || "-"}</p>
              <p className="flex items-center gap-2"><FaHeart className="text-pink-400" /> Bio: {profile.bio || <span className="italic">No bio provided</span>}</p>
            </div>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div className="flex-1 flex flex-col gap-6">
          {result ? (
            <>
              {/* Radar */}
              <EmotionalRadar emotionData={emotionDataForRadar} width={490} height={490} />
              {/* Top Emotions */}
              <div>
                <h2 className="font-semibold text-xl text-pink-700 mb-2 mt-5">Top Emotions</h2>
                <TopEmotionsCards emotions={result.top_emotions ?? []} />
              </div>
              {/* PAD Triad */}
              <div className="bg-gradient-to-tr from-fuchsia-100 via-pink-100 to-purple-200 rounded-2xl p-6 border border-pink-100 shadow-lg mb-3 mt-4 flex flex-col items-center text-center">
                <h2 className="font-semibold text-lg text-pink-700 mb-1">Core PAD Triad</h2>
                <p>Pleasure: <span className="font-bold text-pink-600">{Number(result.core_triad?.pleasure).toFixed(3)}</span></p>
                <p>Arousal: <span className="font-bold text-pink-600">{Number(result.core_triad?.arousal).toFixed(3)}</span></p>
                <p>Dominance: <span className="font-bold text-pink-600">{Number(result.core_triad?.dominance).toFixed(3)}</span></p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white/60 rounded-xl p-8 text-center text-pink-400 shadow-md">
              <div>
                No PAD results to display.<br />Please answer the questionnaire first.
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}