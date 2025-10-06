---
layout: ../../../layouts/Layout.astro
title: "Mycology Classification"
description: "Vision transformer tuned for field-grade fungal identification and risk guidance."
---

<p class="mono"><a href="/lab/ai/">← Back to AI Lab index</a></p>

# Mycology Classification

<p class="mono">Project ID: AI-002 · Stage: Field trials with citizen science partners</p>

## Mission Profile

The mycology classifier augments field researchers and foragers with instant, high-accuracy identification. It couples a transformer backbone with curated datasets from herbariums, community science uploads, and lab-grown exemplars, producing species-level predictions and contextual safety notes even in offline conditions.

## Core Capabilities

- **Hierarchical taxonomy:** Predicts kingdom through species, surfacing genus-level confidence intervals when ambiguity is detected.
- **Risk envelopes:** Maps each identification against toxicity databases and generates a color-coded advisory with edible, caution, or danger flags.
- **Habitat intelligence:** Merges geospatial layers—soil composition, host trees, and climate history—to recommend likely co-located species.

## Model Development

| Phase | Dataset Composition | Outcome |
| --- | --- | --- |
| Pretraining | 2.4M public fungi images, herbarium scans, synthetic augmentations | Established foundational morphological embeddings. |
| Fine-tuning | 180k lab-curated images with spore print spectra | Lifted macro accuracy from 82% to 93% on held-out evaluations. |
| Active learning | 12k community submissions flagged for review | Added 37 rare species and reduced false positives on amanitas by 63%. |

## Deployment Architecture

- **Mobile bundle:** Core model distilled to a 65 MB ONNX runtime optimized with quantization for Android and iOS native wrappers.
- **Offline cache:** Region-specific model deltas and toxicity guides pre-sync when the device regains connectivity.
- **Knowledge loop:** Confirmed identifications upload anonymized image embeddings plus environment notes for retraining cycles.

## Ethical and Safety Considerations

- All high-risk predictions require a secondary confirmation prompt before sharing edible recommendations.
- Transparency module exposes top attention heatmaps so users can learn diagnostic features.
- Partner botanists review ambiguous clusters monthly to avoid reinforcing dataset bias.

## Current Results

- 93.2% top-1 accuracy across the 120-species validation battery; 98.7% top-3 accuracy.
- Offline inference latency averages 148 ms on mid-tier devices; 72 ms on flagship models.
- Shared taxonomy service now powers seasonal alerts on the Mushroom Forecasting project.

## Next Milestones

1. Ship multilingual interface layers for Spanish, Japanese, and German partners.
2. Expand spore print recognition from lab captures to crowd-sourced macro lens attachments.
3. Publish an interpretability brief outlining key morphological differentiators per class.

## Collaboration Signals

- **Program sponsor:** Biodiversity Initiative
- **Primary engineer:** Applied CV Lead, Biosensing Pod
- **Contact:** <a href="mailto:lab@jessicawiedeman.com" class="mono">lab@jessicawiedeman.com</a>

<hr />

<p class="mono">Document updated: 2024-05-12</p>
