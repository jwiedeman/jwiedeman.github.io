---
layout: ../../../layouts/Layout.astro
title: "Call Triage Agent"
description: "Design notes for a voice assistant that answers inbound calls, handles routine questions, and hands the rest to a person."
---
<div class="container">
  <header class="page-header">
    <h1 class="page-header__title">Call Triage Agent</h1>
    <p class="page-header__subtitle">A voice assistant that answers inbound calls and routes them.</p>
  </header>

  <p class="mono" style="margin-bottom: var(--space-4);"><a href="/lab/ai/">← AI lab</a></p>

**Concept. Not built; this page describes a proposed design.**

## What it would do

- Answer inbound calls and ask why the caller is calling.
- Handle routine requests itself: opening hours, directions, booking or moving an appointment.
- Transfer the call to a person when the request is urgent, sensitive, or unclear.
- After the call, write a short summary and any follow-up tasks into the CRM.

## How a call would flow

1. A SIP gateway receives the call. The agent states that the call is automated and recorded, then greets the caller.
2. Streaming speech-to-text turns the caller's words into text as they speak.
3. An intent classifier picks the most likely reason for the call and a confidence score.
4. A language model drafts the next reply. A rule layer checks it for blocked topics and required disclaimers before text-to-speech reads it out.
5. If confidence is low, or the caller asks for a person, the call is transferred.
6. When the call ends, the transcript, summary, and actions are saved to the CRM.

## Parts

| Part | Role | Candidate tools |
| --- | --- | --- |
| Telephony | Receive calls, transfer calls | SIP trunk, Twilio or similar |
| Speech-to-text | Live transcript | Whisper, Deepgram, or similar |
| Intent classifier | Pick the reason for the call | Small fine-tuned model or LLM prompt |
| Reply generator | Draft the next sentence | LLM with a fixed system prompt |
| Rule layer | Block topics, add disclaimers, force transfer | Plain code, not a model |
| Text-to-speech | Speak the reply | Any low-latency TTS |
| Integrations | Calendar and CRM writes | Google Workspace, Microsoft 365, Salesforce APIs |

## Data it would need

- A list of call reasons, with example phrases for each.
- Answers to routine questions, written and approved by the business.
- Rules for when to transfer, and to whom.
- Recorded or transcribed sample calls for testing (with consent).

## Targets (assumptions, not measurements)

- Reply delay under 1 second after the caller stops speaking.
- Every call the agent cannot resolve is transferred, not dropped.
- Transcripts deleted after a fixed period (for example, 30 days).

## Risks and open questions

- Callers may not want to talk to a bot. How easy is it to reach a person?
- Speech-to-text errors on names, addresses, and accents can lead to wrong actions.
- A language model can say things the business never approved. The rule layer reduces this but does not remove it.
- Call recording consent rules differ by state and country.
- Transcripts contain personal data. Storage, access, and deletion need a clear policy.
- How to test it: replay sample calls and check the chosen intent, the reply, and the transfer decision.

</div>
