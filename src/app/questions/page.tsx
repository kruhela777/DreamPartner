"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useAnimation,
  PanInfo,
} from "framer-motion";

type Option = { id: string | number; text: string };
type Question = {
  id: number;
  type: "likert" | "scene";
  text: string;
  options: Option[];
};

type AnswerValue = string | number;
type AnswerEntry = { question_id: number; answer: AnswerValue | undefined };

function FloatingHearts() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 select-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 6 + i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span
            style={{
              fontSize: `${16 + (i % 4) * 8}px`,
              textShadow: "0 0 12px #ffb6c1aa",
            }}
          >
            {i % 2 === 0 ? "💖" : "💕"}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ProgressHearts({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 mb-5">
      {[...Array(total)].map((_, i) => (
        <motion.span
          key={i}
          animate={i < current ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.6, repeat: i < current ? Infinity : 0 }}
          style={{ fontSize: "1.5rem" }}
        >
          {i < current ? "💖" : "🤍"}
        </motion.span>
      ))}
    </div>
  );
}

function HeartSlider({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: number;
  onChange: (idx: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [width, setWidth] = useState(0);
  const max = options.length - 1;

  useEffect(() => {
    if (trackRef.current) setWidth(trackRef.current.offsetWidth);
    const resize = () => {
      if (trackRef.current) {
        setWidth(trackRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (width && max > 0) {
      const newX = (value / max) * width;
      controls.start({
        x: newX,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      });
    }
  }, [value, width, max, controls]);

  const handleDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (!trackRef.current || !width) return;
    let pos = info.point.x - trackRef.current.getBoundingClientRect().left;
    pos = Math.max(0, Math.min(width, pos));
    const idx = Math.round((pos / width) * max);
    if (idx !== value) onChange(idx);
  };

  const handleDragEnd = () => {
    if (!trackRef.current || !width) return;
    const snappedX = (value / max) * width;
    controls.start({
      x: snappedX,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    });
  };

  return (
    <div className="w-full flex flex-col items-center pt-2">
      <div
        ref={trackRef}
        className="relative w-full max-w-xl mx-auto"
        style={{ height: 80 }}
      >
        <div className="absolute left-0 right-0 top-[25px] h-2 bg-pink-200 rounded-full" />
        <motion.div
          drag="x"
          dragConstraints={trackRef}
          dragElastic={0}
          dragMomentum={false}
          style={{ x, position: "absolute", top: 0 }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          whileTap={{ scale: 1.2 }}
        >
          <span style={{ fontSize: "2rem" }}>💖</span>
        </motion.div>
        <div className="absolute left-0 right-0 top-[55px] flex justify-between">
          {options.map((opt, i) => (
            <span
              key={i}
              className={`text-xs sm:text-sm ${
                i === value ? "text-pink-700 font-bold" : "text-pink-500"
              }`}
              style={{ flex: 1, textAlign: "center" }}
            >
              {opt.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [sliderVal, setSliderVal] = useState(0);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((data: Question[]) => {
        const list = data || [];
        setQuestions(list);
        setAnswers(
          list.map((q) => ({
            question_id: q.id,
            answer: undefined,
          }))
        );
      })
      .catch((err) => {
        console.error("Frontend fetch error:", err);
        setQuestions([]);
        setAnswers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!questions[current]) return;
    const q = questions[current];
    if (q.options.length >= 5) {
      const idx = Math.floor(q.options.length / 2);
      setSliderVal(idx);
      setAnswers((prev) => {
        const next = [...prev];
        next[current] = {
          question_id: q.id,
          answer: q.options[idx].id,
        };
        return next;
      });
    }
  }, [current, questions]);

  const gotoNext = () =>
    current < questions.length - 1 && setCurrent(current + 1);
  const gotoPrev = () => current > 0 && setCurrent(current - 1);

  const handleSelect = (optId: AnswerValue) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = {
        question_id: questions[current].id,
        answer: optId,
      };
      return next;
    });
    gotoNext();
  };

  const handleSliderChange = (idx: number) => {
    setSliderVal(idx);
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = {
        question_id: questions[current].id,
        answer: questions[current].options[idx].id,
      };
      return next;
    });
  };

  const handleFinalSubmit = async () => {
    const q = questions[current];
    let answersFinal: AnswerEntry[] = answers;
    if (q.options.length >= 5) {
      answersFinal = [...answers];
      answersFinal[current] = {
        question_id: q.id,
        answer: q.options[sliderVal].id,
      };
    }
    const payload = { answers: answersFinal };
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      localStorage.setItem("pad_analysis", JSON.stringify(data));
      router.push("/profile");
    } catch (_err) {
      alert("Error submitting");
    }
  };

  if (loading) return <div className="p-10">Loading…</div>;

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-pink-200 via-pink-100 to-purple-200 flex items-center justify-center overflow-hidden">
      <FloatingHearts />

      {!started && (
        <motion.div
          className="z-20 flex flex-col items-center text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.h1
            className="text-4xl sm:text-6xl font-extrabold text-pink-700 mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            💘 Love Quiz 💘
          </motion.h1>
          <p className="text-pink-600 text-lg mb-8">
            Discover your heart’s match by answering fun questions!
          </p>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 bg-pink-500 text-white font-bold rounded-2xl shadow-lg hover:bg-pink-600 transition"
          >
            Start
          </button>
        </motion.div>
      )}

      {started && questions.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="relative z-20 w-[90vw] max-w-xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
          >
            <ProgressHearts current={current + 1} total={questions.length} />
            <h2 className="text-xl font-bold text-pink-700 mb-4 text-center">
              Question {current + 1} / {questions.length}
            </h2>
            <p className="text-pink-800 text-center mb-6">
              {questions[current].text}
            </p>
            <div className="flex flex-col gap-3">
              {questions[current].options.length >= 5 ? (
                <HeartSlider
                  options={questions[current].options}
                  value={sliderVal}
                  onChange={handleSliderChange}
                />
              ) : (
                questions[current].options.map((opt) => (
                  <button
                    key={String(opt.id)}
                    onClick={() => handleSelect(opt.id)}
                    className="py-3 px-4 rounded-2xl bg-pink-400 text-white font-semibold hover:bg-pink-500"
                  >
                    {opt.text}
                  </button>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={gotoPrev}
                disabled={current === 0}
                className="px-4 py-2 rounded-2xl bg-pink-100 text-pink-600 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (current === questions.length - 1) {
                    handleFinalSubmit();
                  } else {
                    gotoNext();
                  }
                }}
                className="px-6 py-2 rounded-2xl bg-pink-500 text-white font-bold"
              >
                {current === questions.length - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {started && !loading && questions.length === 0 && (
        <div className="p-10 text-pink-700 text-center">
          No quiz questions available. Please check backend.
        </div>
      )}
    </div>
  );
}
