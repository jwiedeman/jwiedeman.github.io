---
layout: ../../../layouts/Layout.astro
title: "Mycology Classification"
description: "Design notes for an image model that suggests likely fungus species from a photo, with clear safety limits."
---
<div class="container">
  <header class="page-header">
    <h1 class="page-header__title">Mycology Classification</h1>
    <p class="page-header__subtitle">An image model that suggests likely fungus species from a photo.</p>
  </header>

  <p class="mono" style="margin-bottom: var(--space-4);"><a href="/lab/ai/">← AI lab</a></p>

**Concept. Not built; this page describes a proposed design.**

## What it would do

- Take a photo of a mushroom and return the most likely species, with a confidence score.
- Fall back to genus or family when it cannot tell species apart.
- Flag species known to be toxic, and lookalikes of toxic species.
- Work offline on a phone.

## How it would work

1. Start from an image model pretrained on general photos (for example a vision transformer).
2. Fine-tune it on labeled fungus photos.
3. Predict at several levels (family, genus, species) so a low-confidence species guess can fall back to genus.
4. Look up each prediction in a toxicity table and show a warning when it matches a toxic species or a known lookalike.
5. Shrink the model (distillation, quantization) so it runs on a phone.

## Data it would need

| Data | Possible source | Notes |
| --- | --- | --- |
| Labeled photos | iNaturalist research-grade observations, Mushroom Observer | Labels are crowd-sourced; some are wrong |
| Expert-checked test set | Herbarium records, mycologist review | Needed to measure accuracy honestly |
| Toxicity information | Field guides, poison control references | Must be reviewed by an expert |
| Location and date | Photo metadata | Can narrow down likely species |

## Targets (assumptions, not measurements)

- Top-3 suggestions include the right species for most common species in the region.
- Response under 200 ms on a mid-range phone.
- Model file small enough to download on mobile data (under 100 MB).

## Safety rules

- Never say a mushroom is safe to eat.
- Always show the top few candidates, not just one.
- Show a toxicity warning when any candidate in the top few is toxic or a known lookalike.
- Tell the user to confirm with an expert or a local mycological society.

## Risks and open questions

- Many species cannot be told apart from a photo. Spore prints, smell, or microscopy may be needed.
- Training photos over-represent common, photogenic species and some regions.
- A confident wrong answer about a toxic species could cause serious harm.
- Should the app ask for several photos (cap top, gills, stem base) before suggesting anything?
- How to measure accuracy: an expert-checked test set the model never saw during training.

</div>
