import math
import json
from typing import List, Tuple, Dict, Any, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
import logging

# Set up logging for debugging and monitoring
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class NormalizationMethod(Enum):
    """Normalization methods available"""
    QUESTION_BASED = "question_based"  # Based on number of questions
    THEORETICAL_RANGE = "theoretical_range"  # Based on theoretical min/max
    PERCENTILE = "percentile"  # Based on percentile distribution

@dataclass
class PADDelta:
    """Represents a single PAD delta from a question response"""
    pleasure: float
    arousal: float
    dominance: float
    question_id: Optional[str] = None

    def __post_init__(self):
        """Validate PAD delta values"""
        for dim_name, value in [("pleasure", self.pleasure), ("arousal", self.arousal), ("dominance", self.dominance)]:
            if not isinstance(value, (int, float)):
                raise ValidationError(f"{dim_name} must be numeric, got {type(value)}")
            if abs(value) > 2.0:  # Reasonable bounds for deltas
                logger.warning(f"Large {dim_name} delta detected: {value}")

    def to_tuple(self) -> Tuple[float, float, float]:
        """Convert to tuple format"""
        return (self.pleasure, self.arousal, self.dominance)

@dataclass
class RawPADScore:
    """Raw summed PAD scores before normalization"""
    pleasure: float
    arousal: float
    dominance: float
    num_questions: int

    def to_tuple(self) -> Tuple[float, float, float]:
        """Convert to tuple format"""
        return (self.pleasure, self.arousal, self.dominance)

@dataclass
class CorePADTriad:
    """Normalized Core PAD Triad representing user's emotional profile"""
    pleasure: float  # P_user: -1 to +1
    arousal: float   # A_user: -1 to +1
    dominance: float # D_user: -1 to +1
    normalization_method: str
    original_range: Tuple[float, float]

    def __post_init__(self):
        """Validate normalized values are in expected range"""
        for dim_name, value in [("pleasure", self.pleasure), ("arousal", self.arousal), ("dominance", self.dominance)]:
            if not -1.0 <= value <= 1.0:
                raise ValidationError(f"Normalized {dim_name} must be in [-1, 1], got {value}")

    def to_tuple(self) -> Tuple[float, float, float]:
        """Convert to tuple format"""
        return (self.pleasure, self.arousal, self.dominance)

    def magnitude(self) -> float:
        """Calculate magnitude of PAD vector"""
        return math.sqrt(self.pleasure**2 + self.arousal**2 + self.dominance**2)

@dataclass
class EmotionScore:
    """Emotion prevalence score with detailed metrics"""
    emotion_name: str
    prevalence_score: int  # 0-100
    euclidean_distance: float
    raw_distance: float
    emotion_coordinates: Tuple[float, float, float]

    def __post_init__(self):
        """Validate emotion score"""
        if not 0 <= self.prevalence_score <= 100:
            raise ValidationError(f"Prevalence score must be 0-100, got {self.prevalence_score}")

@dataclass
class PADAnalysisResult:
    """Complete PAD analysis result"""
    raw_scores: RawPADScore
    core_triad: CorePADTriad
    emotion_scores: List[EmotionScore]
    primary_emotion: str
    secondary_emotion: str
    metadata: Dict[str, Any]

class PADCoreEngine:
    """
    Core engine for PAD (Pleasure-Arousal-Dominance) emotional analysis pipeline.

    This is the foundational component that:
    1. Processes user answer deltas
    2. Calculates raw PAD scores
    3. Normalizes to Core PAD Triad
    4. Computes emotion proximity scores
    5. Provides comprehensive analysis results
    """

    def __init__(self, normalization_method: NormalizationMethod = NormalizationMethod.QUESTION_BASED):
        """
        Initialize the PAD Core Engine

        Args:
            normalization_method: Method to use for PAD score normalization
        """
        self.normalization_method = normalization_method

        # Predefined emotion coordinates in PAD space (-1 to +1 normalized)
        self.emotion_coordinates = {
            "Anger": (-0.7, 0.8, 0.6),      # Low Pleasure, High Arousal, High Dominance
            "Happy": (0.9, 0.6, 0.7),       # High Pleasure, Med-High Arousal, High Dominance
            "Joy": (0.9, 0.8, 0.9),         # High Pleasure, High Arousal, High Dominance
            "Empathy": (0.7, 0.4, 0.3),     # High Pleasure, Med-Low Arousal, Low-Med Dominance
            "Trust": (0.8, 0.3, 0.5),       # High Pleasure, Low Arousal, Med Dominance
            "Grief_Loss": (-0.8, -0.6, -0.7), # Very Low Pleasure, Low Arousal, Very Low Dominance
            "Sadness": (-0.6, -0.4, -0.5),  # Low Pleasure, Low Arousal, Low Dominance
            "Regret_Guilt": (-0.6, -0.2, -0.5), # Low Pleasure, Slightly Low Arousal, Low Dominance
            "Anxiety": (-0.4, 0.7, -0.6),   # Low Pleasure, High Arousal, Low Dominance
            "Fear": (-0.5, 0.8, -0.7),      # Low Pleasure, High Arousal, Very Low Dominance
            "Greed": (-0.3, 0.6, 0.8),      # Negative Pleasure, High Arousal, Very High Dominance
            "Patience_Calm": (0.6, -0.4, 0.4), # High Pleasure, Low Arousal, Med Dominance
            "Serenity": (0.7, -0.7, 0.2),   # High Pleasure, Very Low Arousal, Low-Med Dominance
            "Excitement": (0.8, 0.9, 0.6),  # High Pleasure, Very High Arousal, High Dominance
            "Contempt": (-0.2, 0.3, 0.9),   # Low Pleasure, Med Arousal, Very High Dominance
            "Disgust": (-0.8, 0.2, 0.4),    # Very Low Pleasure, Low-Med Arousal, Med Dominance
        }

        # Maximum possible distance in normalized PAD cube [-1,1]³
        self.max_euclidean_distance = math.sqrt(8)  # sqrt((2)² + (2)² + (2)²)

        # Validation ranges for different components
        self.validation_ranges = {
            "delta_range": (-2.0, 2.0),      # Reasonable range for individual deltas
            "raw_score_range": (-100.0, 100.0),  # Reasonable range for raw scores
            "normalized_range": (-1.0, 1.0),     # Normalized range
        }

        logger.info(f"PAD Core Engine initialized with {len(self.emotion_coordinates)} emotions")

    def validate_input_deltas(self, deltas: List[Union[PADDelta, Tuple[float, float, float]]]) -> List[PADDelta]:
        """
        Validate and convert input deltas to PADDelta objects

        Args:
            deltas: List of PAD deltas (as PADDelta objects or tuples)

        Returns:
            List of validated PADDelta objects

        Raises:
            ValidationError: If input validation fails
        """
        if not deltas:
            raise ValidationError("Input deltas cannot be empty")

        validated_deltas = []

        for i, delta in enumerate(deltas):
            try:
                if isinstance(delta, PADDelta):
                    validated_deltas.append(delta)
                elif isinstance(delta, (tuple, list)) and len(delta) == 3:
                    pad_delta = PADDelta(
                        pleasure=float(delta[0]),
                        arousal=float(delta[1]),
                        dominance=float(delta[2]),
                        question_id=f"q_{i+1}"
                    )
                    validated_deltas.append(pad_delta)
                else:
                    raise ValidationError(f"Invalid delta format at index {i}: {delta}")

            except (ValueError, TypeError) as e:
                raise ValidationError(f"Error processing delta at index {i}: {e}")

        logger.info(f"Validated {len(validated_deltas)} input deltas")
        return validated_deltas

    def calculate_raw_pad_scores(self, deltas: List[PADDelta]) -> RawPADScore:
        """
        Calculate raw PAD scores by summing all deltas

        Args:
            deltas: List of validated PAD deltas

        Returns:
            RawPADScore object with summed values
        """
        total_pleasure = sum(delta.pleasure for delta in deltas)
        total_arousal = sum(delta.arousal for delta in deltas)
        total_dominance = sum(delta.dominance for delta in deltas)

        raw_scores = RawPADScore(
            pleasure=total_pleasure,
            arousal=total_arousal,
            dominance=total_dominance,
            num_questions=len(deltas)
        )

        # Validation check
        for dim_name, value in [("pleasure", total_pleasure), ("arousal", total_arousal), ("dominance", total_dominance)]:
            min_val, max_val = self.validation_ranges["raw_score_range"]
            if not min_val <= value <= max_val:
                logger.warning(f"Raw {dim_name} score {value} outside expected range [{min_val}, {max_val}]")

        logger.info(f"Calculated raw PAD scores from {len(deltas)} questions: P={total_pleasure:.2f}, A={total_arousal:.2f}, D={total_dominance:.2f}")
        return raw_scores

    def normalize_to_core_triad(self, raw_scores: RawPADScore) -> CorePADTriad:
        """
        Normalize raw PAD scores to Core PAD Triad (-1 to +1 range)

        Args:
            raw_scores: Raw PAD scores to normalize

        Returns:
            CorePADTriad with normalized values
        """
        if self.normalization_method == NormalizationMethod.QUESTION_BASED:
            return self._normalize_question_based(raw_scores)
        elif self.normalization_method == NormalizationMethod.THEORETICAL_RANGE:
            return self._normalize_theoretical_range(raw_scores)
        else:
            raise ValidationError(f"Unsupported normalization method: {self.normalization_method}")

    def _normalize_question_based(self, raw_scores: RawPADScore) -> CorePADTriad:
        """
        Normalize based on number of questions answered

        Assumes each question can contribute approximately ±0.5 to each dimension
        """
        # Estimate theoretical range based on number of questions
        max_contribution_per_question = 0.5
        theoretical_max = raw_scores.num_questions * max_contribution_per_question
        theoretical_min = -theoretical_max

        def normalize_dimension(raw_value: float) -> float:
            # Clamp to theoretical range
            clamped_value = max(theoretical_min, min(theoretical_max, raw_value))

            # Avoid division by zero
            if theoretical_max == theoretical_min:
                return 0.0

            # Normalize to [-1, 1] range
            normalized = (clamped_value - theoretical_min) / (theoretical_max - theoretical_min)  # [0, 1]
            normalized = (normalized * 2.0) - 1.0  # [-1, 1]

            return normalized

        core_triad = CorePADTriad(
            pleasure=normalize_dimension(raw_scores.pleasure),
            arousal=normalize_dimension(raw_scores.arousal),
            dominance=normalize_dimension(raw_scores.dominance),
            normalization_method="question_based",
            original_range=(theoretical_min, theoretical_max)
        )

        logger.info(f"Normalized using question-based method: P={core_triad.pleasure:.3f}, A={core_triad.arousal:.3f}, D={core_triad.dominance:.3f}")
        return core_triad

    def _normalize_theoretical_range(self, raw_scores: RawPADScore) -> CorePADTriad:
        """
        Normalize based on fixed theoretical range
        """
        # Fixed theoretical range (can be adjusted based on empirical data)
        theoretical_range = 20.0  # ±20 for raw scores

        def normalize_dimension(raw_value: float) -> float:
            # Clamp to theoretical range
            clamped_value = max(-theoretical_range, min(theoretical_range, raw_value))
            # Normalize to [-1, 1]
            return clamped_value / theoretical_range

        core_triad = CorePADTriad(
            pleasure=normalize_dimension(raw_scores.pleasure),
            arousal=normalize_dimension(raw_scores.arousal),
            dominance=normalize_dimension(raw_scores.dominance),
            normalization_method="theoretical_range",
            original_range=(-theoretical_range, theoretical_range)
        )

        logger.info(f"Normalized using theoretical range method: P={core_triad.pleasure:.3f}, A={core_triad.arousal:.3f}, D={core_triad.dominance:.3f}")
        return core_triad

    def calculate_emotion_proximity_scores(self, core_triad: CorePADTriad) -> List[EmotionScore]:
        """
        Calculate emotion prevalence scores using Euclidean distance

        Args:
            core_triad: User's normalized PAD coordinates

        Returns:
            List of EmotionScore objects sorted by prevalence (highest first)
        """
        emotion_scores = []
        user_coords = core_triad.to_tuple()

        for emotion_name, emotion_coords in self.emotion_coordinates.items():
            # Calculate Euclidean distance
            distance = math.sqrt(
                (user_coords[0] - emotion_coords[0]) ** 2 +
                (user_coords[1] - emotion_coords[1]) ** 2 +
                (user_coords[2] - emotion_coords[2]) ** 2
            )

            # Convert distance to prevalence score (0-100)
            # Closer distance = higher score
            # Distance 0 = 100%, Max distance = 0%
            prevalence_score = round((1 - (distance / self.max_euclidean_distance)) * 100)

            # Ensure score is within bounds
            prevalence_score = max(0, min(100, prevalence_score))

            emotion_score = EmotionScore(
                emotion_name=emotion_name,
                prevalence_score=prevalence_score,
                euclidean_distance=distance,
                raw_distance=distance,
                emotion_coordinates=emotion_coords
            )

            emotion_scores.append(emotion_score)

        # Sort by prevalence score (highest first)
        emotion_scores.sort(key=lambda x: x.prevalence_score, reverse=True)

        logger.info(f"Calculated emotion proximity scores. Primary: {emotion_scores[0].emotion_name} ({emotion_scores[0].prevalence_score}%)")
        return emotion_scores

    def analyze_pad_profile(self, input_deltas: List[Union[PADDelta, Tuple[float, float, float]]]) -> PADAnalysisResult:
        """
        Complete PAD analysis pipeline

        Args:
            input_deltas: Raw PAD deltas from user responses

        Returns:
            PADAnalysisResult with complete analysis
        """
        logger.info("Starting PAD analysis pipeline")

        # Step 1: Validate input
        validated_deltas = self.validate_input_deltas(input_deltas)

        # Step 2: Calculate raw PAD scores
        raw_scores = self.calculate_raw_pad_scores(validated_deltas)

        # Step 3: Normalize to Core PAD Triad
        core_triad = self.normalize_to_core_triad(raw_scores)

        # Step 4: Calculate emotion proximity scores
        emotion_scores = self.calculate_emotion_proximity_scores(core_triad)

        # Step 5: Extract primary and secondary emotions
        primary_emotion = emotion_scores[0].emotion_name
        secondary_emotion = emotion_scores[1].emotion_name if len(emotion_scores) > 1 else "None"

        # Step 6: Compile metadata
        metadata = {
            "total_questions": len(validated_deltas),
            "normalization_method": self.normalization_method.value,
            "max_distance": self.max_euclidean_distance,
            "triad_magnitude": core_triad.magnitude(),
            "top_3_emotions": [(score.emotion_name, score.prevalence_score) for score in emotion_scores[:3]],
            "analysis_timestamp": None  # Could add datetime if needed
        }

        result = PADAnalysisResult(
            raw_scores=raw_scores,
            core_triad=core_triad,
            emotion_scores=emotion_scores,
            primary_emotion=primary_emotion,
            secondary_emotion=secondary_emotion,
            metadata=metadata
        )

        logger.info(f"PAD analysis complete. Primary emotion: {primary_emotion}")
        return result

    def get_emotion_breakdown(self, result: PADAnalysisResult, top_n: int = 5) -> Dict[str, Any]:
        """
        Get a formatted breakdown of emotion scores

        Args:
            result: PAD analysis result
            top_n: Number of top emotions to include

        Returns:
            Dictionary with formatted emotion breakdown
        """
        top_emotions = result.emotion_scores[:top_n]

        return {
            "primary_emotion": result.primary_emotion,
            "primary_score": result.emotion_scores[0].prevalence_score,
            "secondary_emotion": result.secondary_emotion,
            "secondary_score": result.emotion_scores[1].prevalence_score if len(result.emotion_scores) > 1 else 0,
            "top_emotions": [
                {
                    "name": score.emotion_name,
                    "prevalence": score.prevalence_score,
                    "distance": round(score.euclidean_distance, 3)
                }
                for score in top_emotions
            ],
            "core_pad_triad": {
                "pleasure": round(result.core_triad.pleasure, 3),
                "arousal": round(result.core_triad.arousal, 3),
                "dominance": round(result.core_triad.dominance, 3)
            }
        }

    def export_analysis_json(self, result: PADAnalysisResult) -> str:
        """
        Export analysis result as JSON string

        Args:
            result: PAD analysis result

        Returns:
            JSON string representation
        """
        # Convert dataclasses to dictionaries for JSON serialization
        export_data = {
            "raw_scores": asdict(result.raw_scores),
            "core_triad": asdict(result.core_triad),
            "emotion_scores": [asdict(score) for score in result.emotion_scores],
            "primary_emotion": result.primary_emotion,
            "secondary_emotion": result.secondary_emotion,
            "metadata": result.metadata
        }

        return json.dumps(export_data, indent=2)
