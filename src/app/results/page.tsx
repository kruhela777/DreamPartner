"use client";
import React, { useEffect, useState } from "react";

export default function ResultsPage() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // ✅ pull from localStorage now
    const raw = localStorage.getItem("pad_analysis");
    if (raw) setResult(JSON.parse(raw));
  }, []);

  if (!result)
    return (
      <div className="p-8 text-center text-pink-200 bg-white/10 rounded-2xl max-w-lg mx-auto mt-12">
        No results found.
        <br />
        Please answer the questionnaire first.
      </div>
    );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-pink-600 text-center">
        Your PAD Analysis
      </h1>

      {/* Primary Emotion */}
      <div className="bg-white/10 p-6 rounded-xl mb-4 border border-white/20 shadow-md">
        <h2 className="font-semibold text-lg mb-1 text-pink-700">
          Primary Emotion
        </h2>
        <p className="text-base">
          {result.primary_emotion}{" "}
          <span className="text-sm text-pink-400">
            ({result.top_emotions?.[0]?.score}%)
          </span>
        </p>
      </div>

      {/* Core PAD Triad */}
      <div className="bg-white/10 p-6 rounded-xl mb-4 border border-white/20 shadow-md">
        <h2 className="font-semibold text-lg mb-1 text-pink-700">
          Core PAD Triad
        </h2>
        <p>P: {Number(result.core_triad?.pleasure).toFixed(3)}</p>
        <p>A: {Number(result.core_triad?.arousal).toFixed(3)}</p>
        <p>D: {Number(result.core_triad?.dominance).toFixed(3)}</p>
      </div>

      {/* Top Emotions */}
      <div className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-md">
        <h2 className="font-semibold text-lg mb-2 text-pink-700">
          Top Emotions
        </h2>
        <ul className="space-y-1">
          {result.top_emotions?.map((e: any, idx: number) => (
            <li key={idx}>
              {e.name} — {e.score}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
