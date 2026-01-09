"""
Phone Agent - Speech Processing Module

Handles speech-to-text using Vosk (offline) with optional
Whisper.cpp fallback for improved accuracy.
"""

import json
import queue
import threading
import logging
from pathlib import Path
from typing import Optional, Callable
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Try to import Vosk
try:
    from vosk import Model, KaldiRecognizer
    HAS_VOSK = True
except ImportError:
    HAS_VOSK = False
    logger.warning("Vosk not available - STT disabled")

# Try to import webrtcvad for voice activity detection
try:
    import webrtcvad
    HAS_VAD = True
except ImportError:
    HAS_VAD = False
    logger.warning("webrtcvad not available - using simple VAD")

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


@dataclass
class TranscriptionResult:
    """Result from speech-to-text processing."""
    text: str
    is_final: bool
    confidence: float = 0.0


class VoiceActivityDetector:
    """
    Voice Activity Detection to identify speech segments.
    Uses webrtcvad if available, falls back to energy-based detection.
    """

    def __init__(self, sample_rate: int = 16000, aggressiveness: int = 2):
        """
        Args:
            sample_rate: Audio sample rate (8000, 16000, 32000, or 48000)
            aggressiveness: VAD aggressiveness (0-3), higher = more aggressive
        """
        self.sample_rate = sample_rate
        self.frame_duration = 30  # ms
        self.frame_size = int(sample_rate * self.frame_duration / 1000)

        if HAS_VAD:
            self.vad = webrtcvad.Vad(aggressiveness)
        else:
            self.vad = None

        # Energy-based fallback parameters
        self.energy_threshold = 0.01
        self.speech_frames = 0
        self.silence_frames = 0

    def is_speech(self, audio_chunk: bytes) -> bool:
        """
        Detect if audio chunk contains speech.

        Args:
            audio_chunk: Raw PCM audio bytes (16-bit)

        Returns:
            True if speech detected
        """
        if HAS_VAD and self.vad:
            try:
                # webrtcvad expects specific frame sizes
                return self.vad.is_speech(audio_chunk, self.sample_rate)
            except Exception:
                pass

        # Fallback: energy-based detection
        if HAS_NUMPY:
            audio = np.frombuffer(audio_chunk, dtype=np.int16).astype(np.float32)
            audio /= 32768.0  # Normalize
            energy = np.sqrt(np.mean(audio ** 2))
            return energy > self.energy_threshold

        return True  # Assume speech if we can't detect

    def process_frame(self, audio_chunk: bytes) -> tuple[bool, bool]:
        """
        Process audio frame and track speech/silence state.

        Args:
            audio_chunk: Raw PCM audio bytes

        Returns:
            (is_speaking, end_of_utterance)
        """
        is_speech = self.is_speech(audio_chunk)

        if is_speech:
            self.speech_frames += 1
            self.silence_frames = 0
        else:
            self.silence_frames += 1

        # Detect end of utterance (speech followed by silence)
        end_of_utterance = (
            self.speech_frames > 5 and  # Had speech
            self.silence_frames > 15     # ~450ms silence
        )

        if end_of_utterance:
            self.speech_frames = 0
            self.silence_frames = 0

        return is_speech, end_of_utterance


class SpeechRecognizer:
    """
    Real-time speech-to-text using Vosk.

    Processes audio streams and emits transcription results
    via callbacks for both partial and final results.
    """

    def __init__(
        self,
        model_path: str,
        sample_rate: int = 16000,
        on_partial: Callable[[str], None] = None,
        on_final: Callable[[str], None] = None
    ):
        """
        Args:
            model_path: Path to Vosk model directory
            sample_rate: Audio sample rate
            on_partial: Callback for partial results (real-time)
            on_final: Callback for final results (after utterance)
        """
        self.model_path = Path(model_path)
        self.sample_rate = sample_rate
        self.on_partial = on_partial
        self.on_final = on_final

        self.model = None
        self.recognizer = None
        self.vad = VoiceActivityDetector(sample_rate)

        self._audio_queue: queue.Queue = queue.Queue()
        self._is_running = False
        self._worker_thread: Optional[threading.Thread] = None

        self._load_model()

    def _load_model(self):
        """Load Vosk model."""
        if not HAS_VOSK:
            logger.error("Vosk not installed - cannot load model")
            return

        if not self.model_path.exists():
            logger.error(f"Model not found: {self.model_path}")
            return

        try:
            self.model = Model(str(self.model_path))
            self.recognizer = KaldiRecognizer(self.model, self.sample_rate)
            self.recognizer.SetWords(True)
            logger.info(f"Loaded Vosk model: {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to load Vosk model: {e}")

    def _process_audio(self, audio_data: bytes) -> Optional[TranscriptionResult]:
        """
        Process audio chunk through recognizer.

        Args:
            audio_data: Raw PCM audio bytes (16-bit, mono)

        Returns:
            TranscriptionResult or None
        """
        if not self.recognizer:
            return None

        # Check if this is final (end of utterance)
        _, is_final = self.vad.process_frame(audio_data)

        if self.recognizer.AcceptWaveform(audio_data):
            result = json.loads(self.recognizer.Result())
            text = result.get('text', '').strip()
            if text:
                return TranscriptionResult(
                    text=text,
                    is_final=True,
                    confidence=self._extract_confidence(result)
                )
        else:
            result = json.loads(self.recognizer.PartialResult())
            text = result.get('partial', '').strip()
            if text:
                return TranscriptionResult(
                    text=text,
                    is_final=False
                )

        return None

    def _extract_confidence(self, result: dict) -> float:
        """Extract confidence score from Vosk result."""
        # Vosk includes word-level confidence
        words = result.get('result', [])
        if words:
            confidences = [w.get('conf', 0) for w in words]
            return sum(confidences) / len(confidences)
        return 0.0

    def _worker(self):
        """Background worker for processing audio queue."""
        while self._is_running:
            try:
                audio_data = self._audio_queue.get(timeout=0.1)
            except queue.Empty:
                continue

            result = self._process_audio(audio_data)

            if result:
                if result.is_final and self.on_final:
                    self.on_final(result.text)
                elif not result.is_final and self.on_partial:
                    self.on_partial(result.text)

    def start(self):
        """Start the recognition worker."""
        if self._is_running:
            return

        self._is_running = True
        self._worker_thread = threading.Thread(target=self._worker, daemon=True)
        self._worker_thread.start()

    def stop(self):
        """Stop the recognition worker."""
        self._is_running = False
        if self._worker_thread:
            self._worker_thread.join(timeout=2.0)

        # Get final result if any
        if self.recognizer:
            result = json.loads(self.recognizer.FinalResult())
            text = result.get('text', '').strip()
            if text and self.on_final:
                self.on_final(text)

    def feed_audio(self, audio_chunk):
        """
        Feed audio data for recognition.

        Args:
            audio_chunk: numpy array or bytes of audio data
        """
        if HAS_NUMPY and isinstance(audio_chunk, np.ndarray):
            # Convert float32 to int16 bytes
            audio_int16 = (audio_chunk * 32767).astype(np.int16)
            audio_bytes = audio_int16.tobytes()
        else:
            audio_bytes = audio_chunk

        self._audio_queue.put(audio_bytes)

    def reset(self):
        """Reset recognizer state for new utterance."""
        if self.recognizer:
            self.recognizer.Reset()


class MockSpeechRecognizer:
    """
    Mock recognizer for testing without Vosk model.
    Simulates STT with predefined responses.
    """

    def __init__(self, on_partial=None, on_final=None):
        self.on_partial = on_partial
        self.on_final = on_final
        self._is_running = False
        self._input_queue: queue.Queue = queue.Queue()

    def start(self):
        self._is_running = True

    def stop(self):
        self._is_running = False

    def feed_audio(self, audio_chunk):
        pass  # Ignore audio in mock mode

    def inject_text(self, text: str, is_final: bool = True):
        """Inject text as if it was transcribed (for testing)."""
        if is_final and self.on_final:
            self.on_final(text)
        elif not is_final and self.on_partial:
            self.on_partial(text)

    def reset(self):
        pass


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=== Speech Recognition Test ===\n")

    if not HAS_VOSK:
        print("Vosk not installed - using mock recognizer")
        recognizer = MockSpeechRecognizer(
            on_partial=lambda t: print(f"[PARTIAL] {t}"),
            on_final=lambda t: print(f"[FINAL] {t}")
        )
        recognizer.start()

        # Simulate transcription
        recognizer.inject_text("hello", is_final=False)
        recognizer.inject_text("hello there", is_final=True)
        recognizer.inject_text("what are your hours", is_final=True)

        recognizer.stop()
    else:
        print("Vosk available - would load model")
        print("Run with: python speech.py /path/to/vosk-model")

    print("\n=== Test Complete ===")
