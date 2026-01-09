---
layout: ../../../layouts/Layout.astro
title: "Foot Traffic Intelligence"
description: "Fusion of on-prem sensors and predictive models to map movement across venues in near real time."
---
<div class="container">
  <header class="page-header">
    <div class="page-header__meta">
      <span class="section-index">Lab / AI / AI-006</span>
      <span class="classification classification--accent">Pilot Deployment</span>
    </div>
    <h1 class="page-header__title">Foot Traffic Intelligence</h1>
    <p class="page-header__subtitle">Multi-Modal Occupancy & Flow Analysis</p>
  </header>

  <p class="mono" style="margin-bottom: var(--space-4);"><a href="/lab/ai/">← Back to AI Lab index</a></p>

## Mission Profile

This module documents the lab's multi-modal counting platform. The objective is to quantify footfall and dwell time across interior and exterior spaces without storing personally identifiable imagery. By pairing passive Wi-Fi probing with camera silhouettes and door magnetometry, the system maintains privacy while delivering operations teams a live situational picture.

## Core Capabilities

- **Fusion analytics:** Sensor streams converge into a probabilistic occupancy model that estimates ingress, egress, and zone-level density.
- **Short-term forecasting:** A Kalman-filtered predictor surfaces 15-minute congestion warnings so staffing leads can pre-stage resources.
- **Operational surfaces:** Live tiles and historical reports publish to the existing analytics control center with export hooks for CSV, JSON, and webhook pushes.

## System Architecture

| Layer | Components | Notes |
| --- | --- | --- |
| Edge acquisition | ESP32 Wi-Fi sniffers, PoE cameras, door sensors | Performs anonymization, hashing, and frame differencing locally. |
| Edge inference | NVIDIA Jetson Orin Nano, TensorRT pipelines | Generates embeddings, runs temporal models, and enforces retention policies. |
| Cloud coordination | AWS IoT Core, Kinesis Data Streams, serverless feature store | Normalizes signals, stores aggregates, and triggers alert pipelines. |
| Experience | Superset dashboards, Grafana panels, SMS alert bridge | Serves operations teams with real-time and retrospective insights. |

## Data Stewardship & Ethics

- Raw video never leaves the site; only blurred silhouettes and numeric vectors transmit upstream.
- MAC addresses undergo salted hashing with 24-hour key rotation to prevent long-term tracking.
- Venue signage and privacy briefings are deployed ahead of sensor activation to preserve visitor trust.

## Current Results

- Baseline accuracy within ±4% of manual clicker counts during live events across two pilot arenas.
- Congestion alerts triggered an average of 11 minutes before historical staffing interventions.
- Integrations completed with the lab's analytics warehouse for nightly reconciliation and QA.

## Next Milestones

1. Expand pilot to mixed indoor/outdoor campus and validate weather hardening of enclosures.
2. Introduce counterfactual simulations that model the impact of staffing adjustments on dwell time.
3. Package deployment scripts and compliance documentation for partner rollouts.

</div>
