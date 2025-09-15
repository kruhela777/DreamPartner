# backend/app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path
import random, json, logging
from typing import List, Any, Dict, Optional

# import your core implementation
from core import PADCoreEngine, PADDelta

logger = logging.getLogger("core")
app = FastAPI()
engine = PADCoreEngine()

BASE_DIR = Path(__file__).resolve().parent


def load_json_file(fname: str) -> dict:
    p = BASE_DIR / fname
    try:
        with open(p, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.exception(f"Failed to load {p}: {e}")
        return {}


# Load questionnaires (on startup)
LIKERT = load_json_file("question_likert.json").get("questionnaire", [])
SCENE = load_json_file("question_scene.json").get("questionnaire", [])


def standardize_questions() -> List[Dict[str, Any]]:
    """
    Returns a combined, standardized question list where each question is:
    {
      "id": <int>,
      "type": "likert" | "scene",
      "text": "...",
      "options": [{ "id": <string|number>, "text": "..." }]
    }
    """
    qlist = []
    for q in LIKERT:
        qid = q.get("id")
        mapping = q.get("mapping", [])
        # options from mapping: use score + emotion as label
        options = [
            {
                "id": item.get("score"),
                "text": f"{item.get('score')} — {item.get('emotion', '')}",
            }
            for item in mapping
        ]
        qlist.append(
            {"id": qid, "type": "likert", "text": q.get("text"), "options": options}
        )

    for q in SCENE:
        qid = q.get("id")
        opts = []
        for opt in q.get("options", []):
            # scene options have id and text
            opts.append({"id": opt.get("id"), "text": opt.get("text")})
        qlist.append({"id": qid, "type": "scene", "text": q.get("text"), "options": opts})
    return qlist


@app.get("/questions")
def get_questions():
    """
    Return a random sample of up to 10 questions from both files (standardized).
    """
    all_q = standardize_questions()
    if not all_q:
        raise HTTPException(status_code=500, detail="No questions available")
    count = min(10, len(all_q))
    sampled = random.sample(all_q, count)
    return sampled


# Request body models
class AnswerItem(BaseModel):
    question_id: int
    # For likert: answer is numeric score (int)
    # For scene: answer is option id (string)
    answer: Optional[Any] = None   # ✅ allow None


class AnalyzeRequest(BaseModel):
    answers: List[AnswerItem]


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    """
    Map answers -> PAD deltas using your JSON files, then run PADCoreEngine.
    Expected body:
    { "answers": [ { "question_id": 21, "answer": 4 }, { "question_id": 3, "answer": "3b" } ] }
    """
    # Debug log to check input
    logger.info("📥 Received answers: %s", req.dict())

    # helper lookups
    likert_map = {q["id"]: q for q in LIKERT}
    scene_map = {q["id"]: q for q in SCENE}

    pad_deltas = []
    for ans in req.answers:
        qid = ans.question_id
        a = ans.answer

        if a is None:  # ✅ skip unanswered
            logger.warning(f"Skipping unanswered question {qid}")
            pad_deltas.append(PADDelta(0.0, 0.0, 0.0, question_id=str(qid)))
            continue

        # Likert question mapping
        if qid in likert_map:
            found = None
            for m in likert_map[qid].get("mapping", []):
                try:
                    if m.get("score") == int(a):
                        found = m
                        break
                except Exception:
                    pass
            if found:
                pad_deltas.append(
                    PADDelta(
                        float(found.get("dP", 0.0)),
                        float(found.get("dA", 0.0)),
                        float(found.get("dD", 0.0)),
                        question_id=str(qid),
                    )
                )
                continue

        # Scene question mapping
        if qid in scene_map:
            found = None
            for opt in scene_map[qid].get("options", []):
                if (
                    opt.get("id") == a
                    or opt.get("id") == str(a)
                    or opt.get("text") == a
                ):
                    found = opt
                    break
            if found:
                pad_deltas.append(
                    PADDelta(
                        float(found.get("dP", 0.0)),
                        float(found.get("dA", 0.0)),
                        float(found.get("dD", 0.0)),
                        question_id=str(qid),
                    )
                )
                continue

        # If we couldn't map, append zero delta (safe fallback)
        logger.warning(
            f"No mapping found for question {qid} answer {a}; using zero delta"
        )
        pad_deltas.append(PADDelta(0.0, 0.0, 0.0, question_id=str(qid)))

    # Run analysis
    result = engine.analyze_pad_profile(pad_deltas)

    # Format response
    resp = {
        "primary_emotion": result.primary_emotion,
        "secondary_emotion": result.secondary_emotion,
        "core_triad": {
            "pleasure": result.core_triad.pleasure,
            "arousal": result.core_triad.arousal,
            "dominance": result.core_triad.dominance,
        },
        "top_emotions": [
            {"name": s.emotion_name, "score": s.prevalence_score}
            for s in result.emotion_scores[:6]
        ],
        "metadata": result.metadata,
    }
    return resp
