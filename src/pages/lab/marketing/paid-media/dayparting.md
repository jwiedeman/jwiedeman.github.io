---
layout: ../../../../layouts/Layout.astro
title: "Dayparting"
description: "Scheduling ads by time-of-day and day-of-week to concentrate spend during peak conversion windows."
headingTracker: false
---
# Dayparting

Dayparting is the practice of scheduling your ad delivery to specific hours of the day and days of the week based on when your audience is most likely to convert. Rather than running ads 24/7 and letting the platform distribute impressions evenly, you concentrate budget during peak performance windows and reduce or pause spend during dead zones. For businesses where conversion behavior varies significantly by time — B2B companies, restaurants, appointment-based services, or any business where phone calls matter — dayparting can improve ROAS by 20-40% with no other changes.

## Core Concept

User behavior and intent fluctuate throughout the day. A B2B buyer is in work mode at 10am but watching Netflix at 10pm. A consumer shopping for dinner delivery is active at 5pm but not at 6am. Ad platforms serve impressions around the clock by default, which means you're paying the same CPM at 3am (when your audience is asleep) as at noon (when they're actively searching). Dayparting reallocates that wasted 3am spend to your peak hours, increasing impression density when it matters most. The result is more conversions from the same budget.

## Implementation

1. **Analyze your time-based performance data** — In Google Ads, go to Ad Schedule reports and view conversions by hour-of-day and day-of-week. In Meta, use the Breakdown > Time of Day report. In Google Analytics, check the hourly conversion patterns. You need at least 2-4 weeks of data with sufficient conversion volume to see reliable patterns.
2. **Identify your peak and dead windows** — Look for hours where CPA is significantly below average (your peaks) and hours where CPA is significantly above average or conversions are near zero (your dead zones). Common patterns: B2B peaks Tuesday-Thursday 9am-3pm, consumer ecommerce peaks evenings and weekends, local services peak during business hours.
3. **Build your ad schedule** — In Google Ads, set up an ad schedule under Campaign Settings > Ad Schedule, defining which hours and days your ads run and applying bid adjustments. For Meta (which doesn't support hourly scheduling within ad sets), use campaign budget optimization with dayparting rules in the Ads Manager, or use third-party tools that pause/enable ad sets on a schedule.
4. **Apply bid modifiers to shoulder hours** — Don't just turn ads on and off — use graduated bid adjustments. Full bids during peak hours, -20% to -40% during shoulder hours (periods adjacent to peaks), and -60% to pause during dead zones. This maintains some presence during non-peak times while concentrating most spend where it converts.
5. **Account for time zones and test different schedules** — If you advertise nationally, your "peak" window shifts across time zones. Either run separate campaigns per time zone or set your schedule based on the time zone where most of your customers are. Re-evaluate your dayparting schedule monthly, as patterns shift with seasons and changing user habits.

## Key Metrics

- **CPA by Hour-of-Day** — The foundational metric for dayparting decisions; chart this across the full 24-hour cycle to visualize your conversion peaks and valleys
- **Conversion Rate by Day-of-Week** — Some days consistently outperform others; for many B2B advertisers, Monday-Wednesday outperforms Thursday-Friday by 30%+
- **Budget Utilization Rate During Peak Hours** — The percentage of your daily budget that's spent during your designated peak windows; if peak hours consume less than 60% of spend, your schedule needs tightening

## Best Practices

- Layer dayparting with geo-bid modifiers for compound optimization — your East Coast audience might peak at different hours than your West Coast audience
- For phone-based businesses, align dayparting with staffing schedules; running ads that drive calls when nobody's available to answer is pure waste
- Test "anti-dayparting" for one week each quarter — sometimes patterns change, and running 24/7 reveals new windows of opportunity you'd been excluding

## Common Pitfalls

- Applying dayparting with too little data — Hourly conversion data is inherently noisy; making bid adjustments based on one week of data leads to false optimization that can hurt performance
- Being too aggressive with pauses — Completely turning off ads during off-peak hours means zero presence in those windows; a -50% modifier still captures bargain impressions when competition is lowest
- Forgetting about time zone differences — Scheduling ads for "9am-5pm" when your Google Ads account is set to Eastern Time means you're turning off at 2pm Pacific, potentially missing your West Coast audience entirely
