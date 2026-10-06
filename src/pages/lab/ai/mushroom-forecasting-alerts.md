---
layout: ../../../layouts/Layout.astro
title: "Mushroom Forecasting Alerts"
description: "Probabilistic growth predictions that combine weather, soil, and observation networks."
---
<div class="container">
  <header class="page-header">
    <div class="page-header__meta">
      <span class="section-index">Lab / AI / AI-006</span>
      <span class="classification classification--accent">Concept</span>
    </div>
    <h1 class="page-header__title">Mushroom Forecasting Alerts</h1>
    <p class="page-header__subtitle">Predictive Fruiting Notifications</p>
  </header>

  <p class="mono" style="margin-bottom: var(--space-4);"><a href="/lab/ai/">← Back to AI Lab index</a></p>

## Overview

Mushroom Forecasting Alerts is a concept for "weather-style" notifications for foragers, land stewards, and researchers. The system would combine weather forecasts, soil sensor readings, and confirmed sightings to predict when and where particular species are likely to fruit.

## Core Capabilities

- **Spatiotemporal modeling:** Uses Bayesian hierarchical models to produce probability surfaces at 1 km grid resolution.
- **Species personalization:** Users subscribe to species profiles and receive alerts when environmental thresholds align with fruiting patterns.
- **Field kit integration:** Links to the Mycology Classification app to validate sightings and automatically refine probability estimates.

## Data Pipeline

| Stream | Source | Update Cadence |
| --- | --- | --- |
| Weather | NOAA NDFD forecasts, local mesonet stations | Hourly refresh with 7-day lookahead. |
| Soil | In-ground moisture probes, lab-managed LoRaWAN gateways | Every 15 minutes. |
| Observations | Community science submissions, ranger patrol logs | Event-driven with manual verification. |

## Alert Delivery

- **Push notifications:** Mobile alerts show the probability lift, recommended search radius, and best time window.
- **Email digests:** Daily summaries list regional hotspots, upcoming trigger windows, and notable recent finds.
- **GIS overlays:** ArcGIS-compatible layers allow land managers to overlay forecasts onto habitat management plans.

## Stewardship & Impact

- Encourages sustainable harvesting practices by highlighting conservation-sensitive areas and imposing collection limits.
- Shares anonymized trends with academic partners to study climate impacts on fungal phenology.
- Supports emergency response teams with toxicity risk alerts following extreme weather events.

## Next Milestones

1. Launch a notification API for third-party hiking and outdoor planning apps.
2. Extend coverage beyond temperate forests to coastal ecosystems and alpine zones.
3. Publish an annual "State of the Mycelium" report with longitudinal trend analysis.

</div>
