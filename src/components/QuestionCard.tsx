"use client";
import React from "react";

interface QuestionCardProps {
  question: string;
  options: string[];
  onSelect: (answer: string) => void;
}

export default function QuestionCard({ question, options, onSelect }: QuestionCardProps) {
  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 w-full max-w-md mx-auto my-4 shadow-lg">
      <h2 className="text-2xl font-semibold text-white mb-4">{question}</h2>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="bg-pink-500 bg-opacity-70 text-white font-semibold py-2 px-4 rounded hover:bg-pink-400 transition"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
