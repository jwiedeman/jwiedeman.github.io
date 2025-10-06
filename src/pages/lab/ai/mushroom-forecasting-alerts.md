---
layout: ../../../layouts/Layout.astro
title: "Mushroom Forecasting Alerts"
description: "Probabilistic growth predictions that combine weather, soil, and observation networks."
---

<p class="mono"><a href="/lab/ai/">← Back to AI Lab index</a></p>

# Mushroom Forecasting Alerts

<p class="mono">Project ID: AI-005 · Stage: Regional rollout with conservation partners</p>

## Mission Profile

Mushroom Forecasting Alerts delivers “weather-style” notifications for foragers, land stewards, and researchers. The platform ingests meteorological feeds, sensor telemetry, and classification sightings to predict when and where particular species are likely to fruit.

## Core Capabilities

- **Spatiotemporal modeling:** Uses Bayesian hierarchical models to produce probability surfaces at 1 km grid resolution.
- **Species personalization:** Users subscribe to species profiles and receive alerts when environmental thresholds align with fruiting patterns.
- **Field kit integration:** Links to the Mycology Classification app to validate sightings and automatically refine probability estimates.

## Data Pipeline

| Stream | Source | Update Cadence |
| --- | --- | --- |
| Weather | NOAA NDFD forecasts, local mesonet stations | Hourly refresh with 7-day lookahead. |
| Soil | In-ground moisture probes, lab-managed LoRaWAN gateways | 15-minute telemetry windows. |
| Observations | Community science submissions, ranger patrol logs | Event-driven with manual verification. |

## Alert Delivery

- **Push notifications:** Mobile app pings highlight the probability lift, recommended search radius, and best time window.
- **Email digests:** Daily briefs summarize regional hotspots, upcoming trigger windows, and notable recent finds.
- **GIS overlays:** ArcGIS-compatible layers allow land managers to overlay forecasts onto habitat management plans.

## Stewardship & Impact

- Encourages sustainable harvesting practices by highlighting conservation-sensitive areas and imposing collection limits.
- Shares anonymized trends with academic partners to study climate impacts on fungal phenology.
- Supports emergency response teams with toxicity risk alerts following extreme weather events.

## Next Milestones

1. Launch a notification API for third-party hiking and outdoor planning apps.
2. Extend coverage beyond temperate forests to coastal ecosystems and alpine zones.
3. Publish an annual “State of the Mycelium” report with longitudinal trend analysis.

## Collaboration Signals

- **Program sponsor:** Conservation Technology Group
- **Primary engineer:** Environmental Data Scientist
- **Contact:** <a href="mailto:lab@jessicawiedeman.com" class="mono">lab@jessicawiedeman.com</a>

<hr />

<p class="mono">Document updated: 2024-05-12</p>
