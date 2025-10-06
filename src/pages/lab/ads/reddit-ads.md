---
layout: ../../../layouts/Layout.astro
title: "Reddit Ads Mission Manual"
description: "Playbook for community-driven reach and conversion programs on Reddit."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">
  <p class="supertitle mono">Lab / Ads Platform Manual</p>
  <h1>Reddit Ads Mission Manual</h1>
  <p class="intro">Reddit demands authenticity and community alignment. This manual ensures campaigns respect subreddit culture while meeting acquisition targets.</p>

  <section>
    <h2>Campaign structure</h2>
    <ul>
      <li>Split campaigns by objective: Brand Awareness, Traffic, Conversions, App Installs, or Video Views.</li>
      <li>Use ad group naming: <span class="mono">[Objective]-[Subreddit/Interest]-[Creative]-[Iteration]</span>.</li>
      <li>Separate prospecting vs retargeting ad groups for clean reporting.</li>
    </ul>
  </section>

  <section>
    <h2>Community targeting</h2>
    <ul>
      <li>Hand-select subreddits with active moderation and relevant discussions; avoid broad interest targeting for sensitive products.</li>
      <li>Engage moderators early if planning AMA or sponsored posts. Provide value-first content.</li>
      <li>Monitor comments multiple times per day; respond with transparent, human voice.</li>
    </ul>
  </section>

  <section>
    <h2>Creative guidance</h2>
    <ul>
      <li>Use conversational headlines and direct benefit statements. Include UTM tracking in destination URLs.</li>
      <li>For video, keep under 15 seconds with text overlays since sound is often muted.</li>
      <li>Test text posts vs. image posts; some subreddits prefer minimal imagery.</li>
    </ul>
  </section>

  <section>
    <h2>Measurement and safety</h2>
    <ul>
      <li>Install Reddit Pixel events via GTM (PageVisit, ViewContent, AddToCart, Purchase, Lead).</li>
      <li>Enable the Conversion API for server events when dealing with high-value conversions.</li>
      <li>Set brand safety filters to exclude sensitive inventory; review placements weekly.</li>
    </ul>
  </section>

  <section>
    <h2>Optimization rituals</h2>
    <ul>
      <li><strong>Daily:</strong> Check comment sentiment and escalate issues to community or PR teams.</li>
      <li><strong>Weekly:</strong> Adjust bids based on cost per qualified visit and conversion rate; rotate creative variants.</li>
      <li><strong>Monthly:</strong> Host AMA or community engagement events to support awareness flight.</li>
    </ul>
  </section>

  <section>
    <h2>Pre-launch checklist</h2>
    <ul>
      <li>Pixel validated across funnel events.</li>
      <li>Community guidelines reviewed for each target subreddit.</li>
      <li>Comment moderation workflow and escalation chart approved.</li>
      <li>Budget pacing and anomaly alerts configured.</li>
    </ul>
  </section>
</div>
