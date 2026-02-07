---
layout: ../../../../layouts/Layout.astro
title: "Lookalike Audiences"
description: "Building high-performing lookalike audiences from seed lists to find new customers who resemble your best existing ones."
headingTracker: false
---
# Lookalike Audiences

Lookalike audiences let you take a list of your best customers and ask an ad platform to find millions of new people who share the same behavioral and demographic patterns. This is one of the most consistently effective prospecting tactics in paid media because it combines the targeting precision of first-party data with the reach of broad campaigns. The quality of your seed list is the single biggest factor in whether lookalikes work — garbage in, garbage out.

## Core Concept

Ad platforms analyze your seed audience (a customer list, pixel audience, or engagement audience) and identify the common traits among those users — not just demographics, but behavioral patterns like purchase frequency, content engagement, app usage, and thousands of other signals. The platform then scores its entire user base by similarity to your seed and creates an audience of the top percentage of matches. A 1% lookalike on Meta represents roughly 2.4 million people in the US who most closely resemble your seed list. The tighter the percentage, the more similar the audience; the broader the percentage, the more reach but less precision.

## Implementation

1. **Build high-quality seed audiences** — Your seed list determines everything. Best performers are typically: top 25% of customers by lifetime value, repeat purchasers (3+ orders), high-AOV buyers, or customers acquired in the last 90 days. Avoid using "all customers" as a seed — it dilutes the signal with one-time bargain hunters and refund-heavy buyers. Minimum seed size is 1,000 for Meta, but 5,000-10,000 produces noticeably better results.
2. **Upload and match your seed** — Use customer lists (email + phone + name for best match rate), pixel-based audiences (purchase events from the last 180 days), or value-based seeds where you pass customer LTV so the algorithm weights high-value customers more heavily. Check your match rate — below 50% means your data quality needs work.
3. **Create lookalikes at multiple percentage tiers** — Build 1%, 1-3%, 3-5%, and 5-10% lookalikes from the same seed. The 1% is your highest-quality prospecting audience. The 1-3% and 3-5% give you scale when the 1% saturates. Avoid going above 10% — at that point you're essentially running broad targeting.
4. **Layer lookalikes into your campaign structure** — Run your top creative against the 1% lookalike first. Once performance stabilizes, expand to 1-3% with slightly lower CPA expectations. Use 3-5% as a volume play when you need to scale aggressively. Exclude existing customers and website visitors from all lookalike campaigns.
5. **Refresh seeds quarterly** — Customer behavior changes over time. A seed list from 12 months ago reflects who your customers were, not who they are. Rebuild seeds every 60-90 days with fresh transaction data. Compare new lookalike performance against the previous version to confirm improvement.

## Key Metrics

- **Seed Match Rate** — The percentage of your uploaded customer list that the platform can match to user profiles; below 50% indicates data quality issues that will degrade lookalike quality
- **CPA by Lookalike Percentage** — Track acquisition cost at each tier (1%, 1-3%, 3-5%) to understand your efficiency-to-scale tradeoff and identify the point of diminishing returns
- **Lookalike vs. Interest-Based CPA** — Compare your lookalike campaigns against interest-targeted campaigns to quantify the value premium of first-party data modeling

## Best Practices

- Use value-based lookalikes whenever possible — telling the platform which customers are worth the most produces dramatically better results than treating all customers equally
- Build separate lookalikes from different seed types (purchasers, high-LTV, engaged email subscribers) and test them against each other; you'll often find that seed composition matters more than lookalike percentage
- Exclude your seed audience and all lower-funnel remarketing audiences from lookalike campaigns to ensure you're only reaching true new prospects

## Common Pitfalls

- Using too small a seed — Below 1,000 records, the algorithm doesn't have enough data points to identify meaningful patterns, producing lookalikes barely better than random
- Never refreshing seeds — A 2-year-old customer list produces lookalikes based on outdated behavioral patterns; your best customers from 2022 may look nothing like your best customers today
- Stacking lookalikes with interest targeting — Adding interest layers on top of a lookalike audience over-constrains the algorithm and shrinks your addressable pool; let the lookalike do the targeting work
