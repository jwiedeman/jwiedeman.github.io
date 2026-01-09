"""
Phone Agent - Audio Player Module

Handles MP3/WAV playback with queue management, interrupt handling,
and volume normalization for phone output.
"""

import asyncio
import threading
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, Callable
from queue import Queue, Empty
import logging

logger = logging.getLogger(__name__)

# Try to import audio libraries
try:
    import soundfile as sf
    import sounddevice as sd
    HAS_AUDIO = True
except ImportError:
    HAS_AUDIO = False
    logger.warning("soundfile/sounddevice not available - audio playback disabled")

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


@dataclass
class AudioClip:
    """Represents an audio file to play."""
    path: Path
    priority: int = 0  # Higher priority interrupts lower
    callback: Optional[Callable] = None  # Called when playback completes


class AudioPlayer:
    """
    Async-compatible audio player for phone agent responses.

    Features:
    - Queue-based playback with priority support
    - Barge-in / interrupt handling
    - Volume normalization
    - Format conversion (MP3 -> WAV)
    """

    def __init__(self, audio_dir: str, sample_rate: int = 16000):
        self.audio_dir = Path(audio_dir)
        self.sample_rate = sample_rate
        self.queue: Queue[AudioClip] = Queue()
        self.current_clip: Optional[AudioClip] = None
        self.is_playing = False
        self.should_stop = False
        self._playback_thread: Optional[threading.Thread] = None
        self._stream = None

        # Ensure audio directory exists
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, audio_file: str) -> Path:
        """Resolve audio file path relative to audio directory."""
        path = Path(audio_file)
        if not path.is_absolute():
            path = self.audio_dir / path
        return path

    def _load_audio(self, path: Path) -> Optional[tuple]:
        """
        Load audio file and return (data, sample_rate).
        Handles both WAV and MP3 via soundfile.
        """
        if not HAS_AUDIO:
            return None

        if not path.exists():
            logger.warning(f"Audio file not found: {path}")
            return None

        try:
            data, sr = sf.read(str(path), dtype='float32')

            # Resample if needed
            if sr != self.sample_rate and HAS_NUMPY:
                # Simple resampling (for production, use librosa or scipy)
                ratio = self.sample_rate / sr
                new_length = int(len(data) * ratio)
                indices = np.linspace(0, len(data) - 1, new_length).astype(int)
                data = data[indices]

            # Normalize volume
            if HAS_NUMPY:
                max_val = np.max(np.abs(data))
                if max_val > 0:
                    data = data / max_val * 0.8  # Leave headroom

            return data, self.sample_rate

        except Exception as e:
            logger.error(f"Failed to load audio {path}: {e}")
            return None

    def _playback_worker(self):
        """Background thread for audio playback."""
        while not self.should_stop:
            try:
                clip = self.queue.get(timeout=0.1)
            except Empty:
                continue

            self.current_clip = clip
            self.is_playing = True

            path = self._resolve_path(str(clip.path))
            audio_data = self._load_audio(path)

            if audio_data and HAS_AUDIO:
                data, sr = audio_data
                try:
                    # Blocking playback
                    sd.play(data, sr)
                    sd.wait()
                except Exception as e:
                    logger.error(f"Playback error: {e}")
            else:
                # Simulate playback time for testing
                logger.info(f"[SIMULATED] Playing: {clip.path}")
                asyncio.run(asyncio.sleep(1.0))

            self.is_playing = False
            self.current_clip = None

            # Execute callback if provided
            if clip.callback:
                try:
                    clip.callback()
                except Exception as e:
                    logger.error(f"Callback error: {e}")

            self.queue.task_done()

    def start(self):
        """Start the playback worker thread."""
        if self._playback_thread is None or not self._playback_thread.is_alive():
            self.should_stop = False
            self._playback_thread = threading.Thread(target=self._playback_worker, daemon=True)
            self._playback_thread.start()

    def stop(self):
        """Stop playback and worker thread."""
        self.should_stop = True
        self.interrupt()
        if self._playback_thread:
            self._playback_thread.join(timeout=2.0)

    def play(self, audio_file: str, priority: int = 0, callback: Callable = None):
        """
        Queue an audio file for playback.

        Args:
            audio_file: Path to audio file (relative to audio_dir)
            priority: Priority level (higher interrupts lower)
            callback: Function to call when playback completes
        """
        clip = AudioClip(
            path=Path(audio_file),
            priority=priority,
            callback=callback
        )

        # Check if we should interrupt current playback
        if self.current_clip and priority > self.current_clip.priority:
            self.interrupt()

        self.queue.put(clip)
        self.start()  # Ensure worker is running

    async def play_async(self, audio_file: str, priority: int = 0) -> bool:
        """
        Async version of play that waits for completion.

        Args:
            audio_file: Path to audio file
            priority: Priority level

        Returns:
            True if playback completed, False if interrupted
        """
        completed = asyncio.Event()
        was_interrupted = [False]

        def on_complete():
            completed.set()

        self.play(audio_file, priority=priority, callback=on_complete)

        try:
            await completed.wait()
            return not was_interrupted[0]
        except asyncio.CancelledError:
            self.interrupt()
            was_interrupted[0] = True
            return False

    def interrupt(self):
        """Interrupt current playback (barge-in)."""
        if HAS_AUDIO and self.is_playing:
            try:
                sd.stop()
            except Exception:
                pass

        # Clear queue
        while not self.queue.empty():
            try:
                self.queue.get_nowait()
                self.queue.task_done()
            except Empty:
                break

    def is_idle(self) -> bool:
        """Check if player is idle (not playing and queue empty)."""
        return not self.is_playing and self.queue.empty()


class AudioRecorder:
    """
    Simple audio recorder for capturing caller speech.
    Streams audio to a callback for real-time STT processing.
    """

    def __init__(self, sample_rate: int = 16000, channels: int = 1):
        self.sample_rate = sample_rate
        self.channels = channels
        self.is_recording = False
        self._stream = None
        self._callback = None

    def start(self, callback: Callable):
        """
        Start recording and stream audio chunks to callback.

        Args:
            callback: Function(audio_chunk: np.ndarray) called for each chunk
        """
        if not HAS_AUDIO:
            logger.warning("Audio recording not available")
            return

        self._callback = callback
        self.is_recording = True

        def audio_callback(indata, frames, time, status):
            if status:
                logger.warning(f"Audio status: {status}")
            if self._callback and self.is_recording:
                self._callback(indata.copy())

        try:
            self._stream = sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channels,
                dtype='float32',
                callback=audio_callback,
                blocksize=int(self.sample_rate * 0.1)  # 100ms chunks
            )
            self._stream.start()
        except Exception as e:
            logger.error(f"Failed to start recording: {e}")
            self.is_recording = False

    def stop(self):
        """Stop recording."""
        self.is_recording = False
        if self._stream:
            try:
                self._stream.stop()
                self._stream.close()
            except Exception:
                pass
            self._stream = None


# Example usage
if __name__ == "__main__":
    import time

    logging.basicConfig(level=logging.INFO)

    player = AudioPlayer("./audio")

    print("=== Audio Player Test ===")
    print("(No actual audio files - simulated playback)\n")

    # Queue some test clips
    player.play("greetings/welcome.mp3", priority=0, callback=lambda: print("[DONE] welcome.mp3"))
    player.play("info/hours.mp3", priority=0, callback=lambda: print("[DONE] hours.mp3"))

    # Wait a moment then interrupt with high priority
    time.sleep(0.5)
    print("\n[INTERRUPT] Playing high priority clip...")
    player.play("transfer/urgent.mp3", priority=10, callback=lambda: print("[DONE] urgent.mp3"))

    # Wait for queue to drain
    time.sleep(3)
    player.stop()
    print("\n=== Test Complete ===")
