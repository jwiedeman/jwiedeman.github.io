"""
Phone Agent - Markov Chain Rule Engine

State machine with fuzzy pattern matching for conversation flow control.
Processes transcribed speech against YAML rules and determines responses.
"""

import re
import yaml
from dataclasses import dataclass, field
from typing import Optional, Callable
from pathlib import Path

try:
    from rapidfuzz import fuzz
    HAS_FUZZY = True
except ImportError:
    HAS_FUZZY = False


@dataclass
class Action:
    """Represents an action to take in response to a match."""
    play: Optional[str] = None
    next_state: Optional[str] = None
    escalate: bool = False
    hangup: bool = False
    store: Optional[str] = None  # variable name to store input


@dataclass
class MatchResult:
    """Result of pattern matching."""
    matched: bool = False
    confidence: float = 0.0
    action: Optional[Action] = None
    trigger_text: str = ""


@dataclass
class ConversationState:
    """Tracks current conversation context."""
    current_state: str = "greeting"
    retry_count: int = 0
    variables: dict = field(default_factory=dict)
    history: list = field(default_factory=list)


class RulesEngine:
    """
    Markov chain-style rule engine for phone conversations.

    Loads YAML rules and matches transcribed speech to determine
    which audio to play and which state to transition to next.
    """

    def __init__(self, rules_path: str):
        self.rules_path = Path(rules_path)
        self.rules = {}
        self.settings = {}
        self.matching_config = {}
        self.audio_config = {}
        self.conversation = ConversationState()

        self._load_rules()

    def _load_rules(self):
        """Load and parse YAML rules file."""
        with open(self.rules_path, 'r') as f:
            config = yaml.safe_load(f)

        self.settings = config.get('settings', {})
        self.rules = config.get('states', {})
        self.matching_config = config.get('matching', {})
        self.audio_config = config.get('audio', {})

        # Set initial state
        self.conversation.current_state = self.settings.get('initial_state', 'greeting')

    def _preprocess_text(self, text: str) -> str:
        """Clean and normalize input text for matching."""
        text = text.lower().strip()

        # Remove filler words if configured
        filler_words = self.matching_config.get('ignore_filler_words', [])
        for filler in filler_words:
            text = re.sub(rf'\b{re.escape(filler)}\b', '', text)

        # Normalize whitespace
        text = ' '.join(text.split())

        return text

    def _match_pattern(self, text: str, pattern: str) -> tuple[bool, float]:
        """
        Match text against a pattern.

        Supports:
        - Pipe-separated keywords: "hello|hi|hey"
        - Wildcard: "*" matches anything
        - Fuzzy matching if rapidfuzz available
        """
        if pattern == "*":
            return True, 1.0

        # Split pipe-separated patterns
        keywords = [k.strip() for k in pattern.split('|')]

        threshold = self.matching_config.get('threshold', 0.7)

        for keyword in keywords:
            # Exact substring match
            if keyword in text:
                return True, 1.0

            # Fuzzy match if available
            if HAS_FUZZY:
                # Check each word in text against keyword
                words = text.split()
                for word in words:
                    ratio = fuzz.ratio(word, keyword) / 100.0
                    if ratio >= threshold:
                        return True, ratio

                # Also check partial ratio for phrases
                ratio = fuzz.partial_ratio(keyword, text) / 100.0
                if ratio >= threshold:
                    return True, ratio

        return False, 0.0

    def _match_regex(self, text: str, pattern: str) -> tuple[bool, float]:
        """Match text against a regex pattern."""
        try:
            if re.search(pattern, text, re.IGNORECASE):
                return True, 1.0
        except re.error:
            pass
        return False, 0.0

    def _parse_action(self, trigger_config: dict) -> Action:
        """Parse trigger config into an Action object."""
        action_config = trigger_config.get('action', trigger_config)

        return Action(
            play=action_config.get('play'),
            next_state=action_config.get('next'),
            escalate=action_config.get('escalate', False),
            hangup=action_config.get('hangup', False),
            store=action_config.get('store')
        )

    def process_input(self, transcribed_text: str) -> MatchResult:
        """
        Process transcribed speech and determine response.

        Args:
            transcribed_text: Speech-to-text output from caller

        Returns:
            MatchResult with action to take
        """
        text = self._preprocess_text(transcribed_text)
        state_config = self.rules.get(self.conversation.current_state, {})
        triggers = state_config.get('triggers', [])

        best_match = MatchResult()
        best_confidence = 0.0

        # Check each trigger
        for trigger in triggers:
            matched = False
            confidence = 0.0

            # Check match pattern (pipe-separated keywords)
            if 'match' in trigger:
                matched, confidence = self._match_pattern(text, trigger['match'])

            # Check regex pattern
            elif 'regex' in trigger:
                matched, confidence = self._match_regex(text, trigger['regex'])

            # Apply weight modifier if present
            weight = trigger.get('weight', 1.0)
            confidence *= weight

            if matched and confidence > best_confidence:
                best_confidence = confidence
                best_match = MatchResult(
                    matched=True,
                    confidence=confidence,
                    action=self._parse_action(trigger),
                    trigger_text=trigger.get('match', trigger.get('regex', ''))
                )

        # Handle no match - use fallback
        if not best_match.matched:
            fallback = state_config.get('fallback', {})
            max_retries = fallback.get('retry', self.settings.get('max_retries', 2))

            self.conversation.retry_count += 1

            if self.conversation.retry_count > max_retries:
                # Escalate after max retries
                if fallback.get('escalate_after_retry', self.settings.get('default_escalate', True)):
                    return MatchResult(
                        matched=False,
                        action=Action(escalate=True),
                        trigger_text="max_retries_exceeded"
                    )

            return MatchResult(
                matched=False,
                action=Action(play=fallback.get('play')),
                trigger_text="fallback"
            )

        # Reset retry count on successful match
        self.conversation.retry_count = 0

        return best_match

    def transition(self, result: MatchResult):
        """
        Execute state transition based on match result.

        Args:
            result: MatchResult from process_input
        """
        if result.action and result.action.next_state:
            old_state = self.conversation.current_state
            self.conversation.current_state = result.action.next_state
            self.conversation.history.append({
                'from': old_state,
                'to': result.action.next_state,
                'trigger': result.trigger_text
            })

        # Store variable if requested
        if result.action and result.action.store:
            self.conversation.variables[result.action.store] = result.trigger_text

    def get_entry_action(self) -> Optional[Action]:
        """Get on_enter action for current state if any."""
        state_config = self.rules.get(self.conversation.current_state, {})
        on_enter = state_config.get('on_enter', {})

        if on_enter:
            return Action(play=on_enter.get('play'))
        return None

    def reset(self):
        """Reset conversation to initial state."""
        self.conversation = ConversationState()
        self.conversation.current_state = self.settings.get('initial_state', 'greeting')


# Example usage / testing
if __name__ == "__main__":
    import sys

    # Test with sample rules
    test_rules = """
settings:
  initial_state: greeting
  max_retries: 2

states:
  greeting:
    on_enter:
      play: "greetings/welcome.mp3"
    triggers:
      - match: "hello|hi|hey"
        next: "main_menu"

  main_menu:
    triggers:
      - match: "hours|open"
        action:
          play: "info/hours.mp3"
          next: "done"
      - match: "person|human"
        action:
          escalate: true
    fallback:
      play: "fallback/retry.mp3"
      retry: 2
      escalate_after_retry: true

  done:
    on_enter:
      play: "greetings/goodbye.mp3"
    triggers:
      - match: "*"
        action:
          hangup: true

matching:
  threshold: 0.7
  ignore_filler_words:
    - "um"
    - "uh"
"""

    # Write test rules to temp file
    from tempfile import NamedTemporaryFile
    with NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
        f.write(test_rules)
        temp_path = f.name

    engine = RulesEngine(temp_path)

    # Test sequence
    test_inputs = [
        "hello there",
        "um what are your hours",
        "thanks bye"
    ]

    print("=== Phone Agent Rules Engine Test ===\n")

    # Get entry action
    entry = engine.get_entry_action()
    if entry:
        print(f"[ENTRY] Play: {entry.play}")

    for text in test_inputs:
        print(f"\n[INPUT] \"{text}\"")
        print(f"[STATE] {engine.conversation.current_state}")

        result = engine.process_input(text)

        print(f"[MATCH] {result.matched} (confidence: {result.confidence:.2f})")

        if result.action:
            if result.action.play:
                print(f"[ACTION] Play: {result.action.play}")
            if result.action.next_state:
                print(f"[ACTION] Next: {result.action.next_state}")
            if result.action.escalate:
                print("[ACTION] ESCALATE to human")
            if result.action.hangup:
                print("[ACTION] HANGUP")

        engine.transition(result)

        # Get entry action for new state
        entry = engine.get_entry_action()
        if entry:
            print(f"[ENTRY] Play: {entry.play}")

    # Cleanup
    import os
    os.unlink(temp_path)
