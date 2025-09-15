"use client";
import React, { useState } from "react";

export default function DreamGamePage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black">
      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          {/* Cute Spinner */}
          <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-pink-300 text-lg font-semibold animate-pulse">
            Loading your dream game...
          </p>
        </div>
      )}

      {/* Game Iframe */}
      <iframe
        src="/game/New Game Project.html"
        title="Dream Game"
        className="w-full h-full border-none"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
