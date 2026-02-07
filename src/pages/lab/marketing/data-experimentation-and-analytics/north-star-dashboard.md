---
layout: ../../../../layouts/Layout.astro
title: "North Star Dashboard"
description: "Building a dashboard centered on the single metric that best captures your product's core value delivery."
headingTracker: false
---
# North Star Dashboard

A north star dashboard is a centralized reporting view organized around the single metric that best captures the core value your product delivers to customers. Rather than drowning in dozens of KPIs, the team rallies around one number — Spotify uses "time spent listening," Airbnb uses "nights booked," Slack uses "messages sent" — and the dashboard shows how every activity in the business either feeds or undermines that metric. It turns data from noise into focus.

## Core Concept

The north star metric (NSM) concept, popularized by Sean Ellis, solves the fundamental problem of dashboard bloat: when you track everything, you optimize nothing. The NSM is the single metric that, if it grows, indicates your business is healthy. It must satisfy three criteria: it reflects value delivered to customers (not just revenue extracted), it is a leading indicator of revenue growth, and it is actionable by multiple teams. The dashboard then layers input metrics (the levers that drive the NSM) underneath, creating a clear cause-and-effect view from daily activities to business outcomes.

## Implementation

1. Define your north star metric by asking: "What single user action indicates they are getting real value from our product?" — this should correlate with retention and revenue but measure value delivery, not extraction
2. Identify 3-5 input metrics that directly influence the NSM — for example, if your NSM is "weekly active projects," inputs might be "new signups," "onboarding completion rate," "features adopted per user," and "invite-sent rate"
3. Build the dashboard with the NSM as the hero metric at the top, input metrics below, and trend lines showing direction and velocity for each — use a tool like Looker, Tableau, or a custom data warehouse view
4. Set up automated alerts when the NSM or any input metric deviates beyond a defined threshold (typically two standard deviations from the rolling average)
5. Review the dashboard weekly with leadership and monthly with the full team, using it to prioritize initiatives based on which input metric has the most room for improvement

## Key Metrics

- **North star metric trend** — the primary number on the dashboard, tracked daily/weekly with period-over-period comparison
- **Input metric contribution** — the relative impact of each input metric on the NSM, quantified through regression analysis or controlled experiments
- **Dashboard engagement rate** — how frequently team members actually view the dashboard; a dashboard nobody checks is not driving alignment

## Best Practices

- Keep the dashboard to one screen — if it requires scrolling, it contains too much information and will not be used for daily decision-making
- Include both absolute numbers and rates of change: knowing the NSM is 10,000 is less useful than knowing it grew 12% this week
- Pair the dashboard with a weekly ritual (a 15-minute standup) where each team reports what they did to move their input metric, creating accountability

## Common Pitfalls

- Choosing a north star metric that the team cannot meaningfully influence on a weekly basis (annual revenue is an outcome, not a north star)
- Adding too many input metrics, which recreates the dashboard bloat the NSM was supposed to eliminate — more than 5 inputs is a warning sign
- Treating the north star as immutable; as your product and market evolve, the NSM should be re-evaluated annually to ensure it still captures core value delivery
