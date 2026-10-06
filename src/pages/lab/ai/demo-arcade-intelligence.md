---
layout: ../../../layouts/Layout.astro
title: "Demo Arcade Intelligence"
description: "Design notes for an arcade setup where people play simple games against reinforcement learning agents."
---
<div class="container">
  <header class="page-header">
    <h1 class="page-header__title">Demo Arcade Intelligence</h1>
    <p class="page-header__subtitle">People play simple arcade games against agents that learn by playing.</p>
  </header>

  <p class="mono" style="margin-bottom: var(--space-4);"><a href="/lab/ai/">← AI lab</a></p>

**Concept. Not built; this page describes a proposed design.**

## What it would do

- Run a few simple arcade-style games (for example Pong or a maze game) on a cabinet or in a browser.
- Let a visitor play against a reinforcement learning agent, or watch two agents play.
- Retrain the agents between sessions on recorded games.
- Show a leaderboard of human and agent scores.
- Show, after each match, what the agent was paying attention to.

## How it would work

1. The game runs at a fixed frame rate. Human and agent inputs go through the same input path, so neither gets a timing advantage.
2. During play the agent only runs inference. It does not learn mid-match.
3. Each match is logged: frames, inputs, scores.
4. Between sessions, the agent is trained further (for example with PPO) on new self-play games.
5. A new version replaces the old one only if it scores better on a fixed set of test games.

## Parts

| Part | Role | Candidate tools |
| --- | --- | --- |
| Game | Rules, rendering, input | Browser canvas or a small game engine |
| Agent | Pick an action each frame | Small neural network policy |
| Training | Self-play and updates | Stable-Baselines3 or RLlib on one GPU |
| Match log | Store games for training and replays | Files or a small database |
| Leaderboard | Show scores | Static page plus a small API |
| Match summary | Show agent attention and rewards | Saliency maps, reward-over-time chart |

## Data it would need

- Game environments with a clear reward (score, win or loss).
- Self-play games for training. Human games are optional extra data.
- A fixed set of test games to compare agent versions.

## Risks and open questions

- Agents often find bugs in the game and exploit them. Each game needs checks for this.
- An agent that always wins is not fun. Difficulty may need to be capped or matched to the player.
- Attention maps look convincing but can be misleading about why the agent acted.
- A public leaderboard needs name filtering and a way to remove entries.
- Accessibility: slower game speeds and remappable controls for human players.

</div>
