---
layout: ../../../layouts/Layout.astro
title: "Mushroom Forecasting Alerts"
description: "Design notes for a model that estimates when and where mushroom species are likely to fruit, from weather and sighting data."
---
<div class="container">
  <header class="page-header">
    <h1 class="page-header__title">Mushroom Forecasting Alerts</h1>
    <p class="page-header__subtitle">Estimate when and where a mushroom species is likely to fruit, and send an alert.</p>
  </header>

  <p class="mono" style="margin-bottom: var(--space-4);"><a href="/lab/ai/">← AI lab</a></p>

**Concept. Not built; this page describes a proposed design.**

## What it would do

- Combine weather forecasts, recent weather history, and past sightings.
- Estimate, for each map grid cell and day, the chance that a chosen species is fruiting.
- Let a user pick species and an area, and send an alert when the chance passes a threshold.

## How it would work

1. Collect past sightings with date and location for each species.
2. Join each sighting to the weather in the weeks before it: rainfall, temperature, soil moisture.
3. Add fixed site data: elevation, land cover, and likely host trees.
4. Fit a model per species that predicts the chance of a sighting from those inputs. A simple option is a logistic regression or gradient-boosted trees; a Bayesian model could add uncertainty ranges.
5. Run the model daily on the weather forecast and publish a map.

## Data sources

| Data | Possible source | Update rate |
| --- | --- | --- |
| Weather forecast | NOAA National Digital Forecast Database | Hourly |
| Weather history | NOAA or local weather stations | Daily |
| Soil moisture | Public soil moisture products, or own sensors | Daily |
| Sightings | iNaturalist, Mushroom Observer | As submitted |
| Terrain and land cover | USGS elevation, national land cover data | Rarely |

## Outputs

- A map layer of fruiting chance per grid cell (target: about 1 km cells).
- Alerts by email or push notification for chosen species and areas.
- A daily summary listing areas with a high chance.

## Risks and open questions

- Sightings show where people look, not where mushrooms grow. Popular trails will look like hotspots.
- Many species have few records. The model may only work for common species.
- Forecasts could send many people to the same small area. Sensitive or protected sites may need to be hidden.
- An alert is not an identification. The app must not suggest that anything found is safe to eat.
- How to check accuracy: hold out one recent season of sightings and compare predicted against actual.

</div>
