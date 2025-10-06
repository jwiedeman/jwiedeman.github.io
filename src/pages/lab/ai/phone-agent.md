---
layout: ../../../layouts/Layout.astro
title: "Phone Agent"
description: "Voice-first assistant that triages inbound calls, schedules follow-ups, and syncs with CRM systems."
---

<p class="mono"><a href="/lab/ai/">← Back to AI Lab index</a></p>

# Phone Agent

<p class="mono">Project ID: AI-003 · Stage: Controlled production beta with lab partners</p>

## Mission Profile

The Phone Agent is a conversational concierge that fields inbound calls, answers routine questions, and routes high-priority conversations to human staff. It blends speech recognition, large language model reasoning, and calendar/CRM automation into a compliant, monitored pipeline.

## Core Capabilities

- **Call classification:** Real-time detection of caller intent with configurable confidence thresholds for escalation.
- **Action execution:** Integrations with Google Workspace, Office 365, and Salesforce schedule follow-ups, log case notes, and trigger workflows.
- **Tone and compliance guardrails:** Style prompts reference brand voice while a deterministic policy layer enforces restricted topics, mandatory disclaimers, and fallback routing.

## Interaction Flow

1. SIP gateway ingests the call and records consent while the agent greets the caller.
2. Streaming ASR produces token-level transcripts; intent classifier updates state machine slots.
3. Reasoning layer generates the next utterance, which passes through safety filters before TTS playback.
4. Post-call, structured notes and action summaries sync to the CRM, and quality metrics log to the analytics warehouse.

## Monitoring & Evaluation

- **Live dashboards:** Provide per-call transcripts, sentiment charts, and escalation stats for supervisors.
- **Red team scenarios:** Weekly injection of adversarial prompts to verify guardrail integrity.
- **A/B experiments:** Compare new prompt templates against baseline to measure booking rate lift and handle time reduction.

## Security & Privacy

- Calls are encrypted end-to-end; transcripts are retained for 30 days with automated PII scrubbing.
- Human reviewers access only anonymized excerpts during QA, with dual-control approvals for exporting data.
- Compliance pack includes SOC 2-aligned controls and documented incident response runbooks.

## Next Milestones

1. Expand language coverage to Spanish and French with locale-specific tone packs.
2. Launch proactive callback capability tied to the lab's marketing automation engine.
3. Integrate agent performance metrics into the shared Lab operations scorecard.

## Collaboration Signals

- **Program sponsor:** Customer Experience Studio
- **Primary engineer:** Conversational AI Lead
- **Contact:** <a href="mailto:lab@jessicawiedeman.com" class="mono">lab@jessicawiedeman.com</a>

<hr />

<p class="mono">Document updated: 2024-05-12</p>
