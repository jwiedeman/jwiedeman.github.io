---
layout: ../../../../layouts/Layout.astro
title: "Cohort & RFM Tracking"
description: "Tracking customer cohorts by Recency, Frequency, and Monetary behavior for segmentation and retention."
headingTracker: false
---
# Cohort & RFM Tracking

Cohort analysis groups customers by shared characteristics (usually acquisition date) and tracks their behavior over time, while RFM analysis scores individual customers on three dimensions: how recently they purchased (Recency), how often they purchase (Frequency), and how much they spend (Monetary). Together, these frameworks transform a flat customer database into a dynamic segmentation system that reveals which customers are thriving, which are at risk, and where your marketing dollars will have the highest impact.

## Core Concept

Cohort analysis reveals trends that aggregate metrics hide. A 5% overall churn rate might mask the fact that your January cohort retains at 95% while your March cohort retains at 80% — indicating a product or acquisition quality problem specific to that period. RFM scoring takes this further by segmenting your existing customer base into actionable groups: "Champions" (high R, high F, high M) who should receive loyalty rewards, "At Risk" customers (formerly high F and M but declining R) who need re-engagement campaigns, and "New Customers" (high R, low F, low M) who need nurturing. The combination gives you both a longitudinal view (cohort) and a point-in-time view (RFM) of customer health.

## Implementation

1. Build cohort tables by grouping customers by acquisition week or month, then tracking key metrics (retention rate, cumulative revenue, order frequency) for each cohort over subsequent periods — visualize this as a heat-map retention triangle
2. Score every customer on Recency (days since last purchase), Frequency (total number of purchases), and Monetary (total or average spend), then quintile-rank each dimension (1-5 scale) to create a composite RFM score
3. Define RFM segments using standard groupings: Champions (5-5-5 to 4-4-4), Loyal Customers (high F), Potential Loyalists (recent but low F), At Risk (declining R, previously high F/M), Hibernating (low R, low F), and Lost (lowest R)
4. Build automated campaigns for each RFM segment: loyalty rewards for Champions, win-back offers for At Risk, onboarding sequences for New Customers, and reactivation campaigns for Hibernating
5. Overlay cohort and RFM analysis to identify systemic patterns — if customers acquired from a specific channel consistently cluster in low-RFM segments, the channel is delivering poor-quality customers regardless of initial volume

## Key Metrics

- **Cohort retention curve** — retention rate by period for each acquisition cohort, revealing whether customer quality is improving or degrading over time
- **RFM segment distribution** — the percentage of your customer base in each RFM segment, tracked monthly to monitor overall base health
- **Customer lifetime value by cohort and RFM segment** — the expected revenue from each group, used to allocate marketing budget toward the highest-value segments

## Best Practices

- Automate cohort and RFM reporting to refresh daily or weekly — stale segmentation data leads to mistimed campaigns (reaching out to "At Risk" customers after they have already churned)
- Use RFM segments to personalize messaging, offers, and channel selection rather than treating them as reporting labels — Champions get different emails than At Risk customers
- Track cohort curves for the first 90 days with high granularity (weekly) to catch early retention problems before they compound

## Common Pitfalls

- Using RFM analysis on a customer base that is too small or too new, producing segments with too few customers to be statistically or practically meaningful
- Treating RFM segments as static rather than dynamic — customers move between segments, and your campaigns should trigger based on segment transitions, not snapshots
- Ignoring the acquisition channel dimension in cohort analysis, which means you cannot distinguish between a product retention problem and an acquisition quality problem
