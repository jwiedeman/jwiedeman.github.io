"""
Phone Agent - Main Entry Point

Raspberry Pi-based voice agent for landline phones.
Coordinates SIP handling, speech recognition, rule engine, and audio playback.
"""

import asyncio
import signal
import logging
import argparse
from pathlib import Path
from typing import Optional

from rules_engine import RulesEngine, MatchResult, Action
from audio_player import AudioPlayer, AudioRecorder
from speech import SpeechRecognizer, MockSpeechRecognizer

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)


class PhoneAgent:
    """
    Main phone agent controller.

    Orchestrates the conversation flow between:
    - SIP/RTP audio (phone line)
    - Speech-to-text (Vosk)
    - Rule engine (Markov chain matching)
    - Audio playback (MP3 responses)
    """

    def __init__(
        self,
        rules_path: str,
        audio_dir: str,
        vosk_model: Optional[str] = None,
        sample_rate: int = 16000
    ):
        self.rules_path = Path(rules_path)
        self.audio_dir = Path(audio_dir)
        self.vosk_model = Path(vosk_model) if vosk_model else None
        self.sample_rate = sample_rate

        # Components
        self.rules_engine: Optional[RulesEngine] = None
        self.audio_player: Optional[AudioPlayer] = None
        self.audio_recorder: Optional[AudioRecorder] = None
        self.speech_recognizer = None

        self._is_running = False
        self._call_active = False
        self._pending_text: Optional[str] = None

    def _initialize_components(self):
        """Initialize all agent components."""
        logger.info("Initializing Phone Agent components...")

        # Rules engine
        self.rules_engine = RulesEngine(str(self.rules_path))
        logger.info(f"Loaded rules from: {self.rules_path}")

        # Audio player
        self.audio_player = AudioPlayer(str(self.audio_dir), self.sample_rate)
        logger.info(f"Audio directory: {self.audio_dir}")

        # Audio recorder
        self.audio_recorder = AudioRecorder(self.sample_rate)

        # Speech recognizer
        if self.vosk_model and self.vosk_model.exists():
            self.speech_recognizer = SpeechRecognizer(
                str(self.vosk_model),
                self.sample_rate,
                on_partial=self._on_partial_transcription,
                on_final=self._on_final_transcription
            )
            logger.info(f"Loaded Vosk model: {self.vosk_model}")
        else:
            logger.warning("No Vosk model - using mock recognizer")
            self.speech_recognizer = MockSpeechRecognizer(
                on_partial=self._on_partial_transcription,
                on_final=self._on_final_transcription
            )

    def _on_partial_transcription(self, text: str):
        """Handle partial (real-time) transcription."""
        logger.debug(f"[PARTIAL] {text}")
        # Could show real-time feedback or detect barge-in keywords

    def _on_final_transcription(self, text: str):
        """Handle final transcription result."""
        logger.info(f"[STT] {text}")
        self._pending_text = text

    async def _handle_action(self, action: Action):
        """Execute an action from the rules engine."""
        if action.play:
            logger.info(f"[PLAY] {action.play}")
            await self.audio_player.play_async(action.play)

        if action.escalate:
            logger.info("[ESCALATE] Transferring to human operator")
            await self._escalate_call()

        if action.hangup:
            logger.info("[HANGUP] Ending call")
            self._call_active = False

    async def _escalate_call(self):
        """Transfer call to human operator."""
        # In real implementation, this would:
        # 1. Play hold music
        # 2. Initiate transfer via SIP
        # 3. Bridge calls or forward to queue
        logger.info("Call escalation - would transfer to operator")
        self._call_active = False

    async def _process_turn(self):
        """Process one conversation turn."""
        if not self._pending_text:
            return

        text = self._pending_text
        self._pending_text = None

        # Process through rules engine
        result = self.rules_engine.process_input(text)

        logger.info(f"[MATCH] {result.matched} | trigger: {result.trigger_text}")

        # Execute action
        if result.action:
            await self._handle_action(result.action)

        # Transition state
        self.rules_engine.transition(result)

        # Play entry audio for new state
        entry_action = self.rules_engine.get_entry_action()
        if entry_action:
            await self._handle_action(entry_action)

    async def _call_loop(self):
        """Main call handling loop."""
        logger.info("Starting call loop")
        self._call_active = True

        # Start recording and recognition
        self.speech_recognizer.start()
        self.audio_recorder.start(self.speech_recognizer.feed_audio)

        # Play initial greeting
        entry_action = self.rules_engine.get_entry_action()
        if entry_action:
            await self._handle_action(entry_action)

        # Main loop
        while self._call_active and self._is_running:
            await self._process_turn()
            await asyncio.sleep(0.1)  # Prevent busy-waiting

        # Cleanup
        self.audio_recorder.stop()
        self.speech_recognizer.stop()

        logger.info("Call ended")

    async def handle_incoming_call(self):
        """Handle an incoming call."""
        logger.info("Incoming call detected")

        # Reset state for new call
        self.rules_engine.reset()

        # Run call loop
        await self._call_loop()

    async def run(self):
        """Run the phone agent (main entry point)."""
        self._initialize_components()
        self._is_running = True

        logger.info("Phone Agent ready - waiting for calls")

        # In real implementation, this would:
        # 1. Register SIP account
        # 2. Wait for incoming calls
        # 3. Spawn call handler for each call

        # For testing, simulate a single call
        await self.handle_incoming_call()

    def shutdown(self):
        """Gracefully shutdown the agent."""
        logger.info("Shutting down Phone Agent...")
        self._is_running = False
        self._call_active = False

        if self.audio_player:
            self.audio_player.stop()


async def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(description='Phone Agent - Voice assistant for landline phones')
    parser.add_argument('--rules', '-r', default='config/rules.yaml', help='Path to rules YAML file')
    parser.add_argument('--audio', '-a', default='audio', help='Path to audio files directory')
    parser.add_argument('--model', '-m', help='Path to Vosk model directory')
    parser.add_argument('--sample-rate', '-s', type=int, default=16000, help='Audio sample rate')
    parser.add_argument('--debug', '-d', action='store_true', help='Enable debug logging')

    args = parser.parse_args()

    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    agent = PhoneAgent(
        rules_path=args.rules,
        audio_dir=args.audio,
        vosk_model=args.model,
        sample_rate=args.sample_rate
    )

    # Handle graceful shutdown
    loop = asyncio.get_event_loop()

    def signal_handler():
        agent.shutdown()

    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, signal_handler)

    try:
        await agent.run()
    except KeyboardInterrupt:
        agent.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
