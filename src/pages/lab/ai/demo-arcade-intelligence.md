---
layout: ../../../layouts/Layout.astro
title: "Demo Arcade Intelligence"
description: "Reinforcement learning sandbox with live human-versus-agent matchups and telemetry."
---

<p class="mono"><a href="/lab/ai/">← Back to AI Lab index</a></p>

# Demo Arcade Intelligence

<p class="mono">Project ID: AI-004 · Stage: Exhibition-ready showcase with continuous training</p>

## Mission Profile

Demo Arcade Intelligence is an experiential lab installation that pits reinforcement learners against human challengers in retro-inspired arcade environments. Each game cabinet streams telemetry to the lab, enabling policy iteration, interpretability experiments, and a living leaderboard.

## Core Capabilities

- **Continuous training loop:** Agents retrain after each tournament cycle using Proximal Policy Optimization with curriculum schedules.
- **Human drop-in mode:** Visitors can instantly jump into the live environment; the system switches to inference-only mode while preserving fair scoring.
- **Explainability layer:** Post-match briefings outline key decision branches, reward contributions, and input sensitivities for each agent run.

## Systems Overview

| Module | Purpose | Notes |
| --- | --- | --- |
| Cabinet hardware | FPGA-based controller boards, 120 Hz displays | Deterministic latency pipeline for both human and agent inputs. |
| Training cluster | Kubernetes-managed GPU workers, Ray RLlib stack | Handles policy rollouts, evaluation, and checkpoint rotation. |
| Leaderboard service | Astro-powered microsite, Supabase backend | Publishes rankings, highlights hero runs, and archives telemetry. |

## Observability

- **Run cards:** Automatically generated dossiers summarize score differentials, policy entropy, and notable events for each match.
- **Spectator HUD:** Overlays agent attention heatmaps and reward accumulation so audiences can follow strategy shifts in real time.
- **Operator console:** Allows lab staff to pause training, pin stable checkpoints, or trigger curated exhibition modes.

## Safety & Fair Play

- Agents undergo fairness checks to prevent glitch exploitation or soft-lock strategies.
- Human sessions include accessibility presets such as slowed pace and remappable controls.
- Leaderboard moderation rules ensure public handles remain appropriate and free from sensitive data.

## Next Milestones

1. Add cooperative co-play scenarios where humans and agents collaborate toward shared objectives.
2. Release a public telemetry API for researchers interested in strategy evolution data.
3. Explore portable cabinet kits for traveling exhibitions and partner campuses.

## Collaboration Signals

- **Program sponsor:** Experience Design Lab
- **Primary engineer:** Reinforcement Learning Architect
- **Contact:** <a href="mailto:lab@jessicawiedeman.com" class="mono">lab@jessicawiedeman.com</a>

<hr />

<p class="mono">Document updated: 2024-05-12</p>
