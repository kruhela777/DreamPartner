"use client";
import React, { useEffect, useState } from "react";

export default function PADResults() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("pad_analysis");
    if (raw) setResult(JSON.parse(raw));
  }, []);

  if (!result) {
    return (
      <div className="p-6 bg-white/10 rounded-xl text-center text-pink-200">
        No results found. Take the questionnaire first.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/10 rounded-3xl border border-pink-100/20 shadow-lg text-pink-900">
      <h1 className="text-xl font-bold mb-2 text-pink-600 text-center">Your PAD Analysis</h1>
      
      <div className="bg-white/10 p-3 rounded-xl mb-3">
        <h2 className="font-semibold text-pink-700 mb-1">Primary Emotion</h2>
        <p className="text-base">
          {result.primary_emotion} 
          <span className="text-xs text-pink-400"> ({result.top_emotions?.[0]?.score}%)</span>
        </p>
      </div>

      <div className="bg-white/10 p-3 rounded-xl mb-3">
        <h2 className="font-semibold text-pink-700 mb-1">Core PAD Triad</h2>
        <p>P: {Number(result.core_triad?.pleasure).toFixed(3)}</p>
        <p>A: {Number(result.core_triad?.arousal).toFixed(3)}</p>
        <p>D: {Number(result.core_triad?.dominance).toFixed(3)}</p>
      </div>

      <div className="bg-white/10 p-3 rounded-xl">
        <h2 className="font-semibold text-pink-700 mb-1">Top Emotions</h2>
        <ul>
          {result.top_emotions?.map((e: any, idx: number) => (
            <li key={idx}>{e.name} — {e.score}%</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
