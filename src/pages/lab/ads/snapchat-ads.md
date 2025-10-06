---
layout: ../../../layouts/Layout.astro
title: "Snapchat Ads Mission Checklist"
description: "Framework for Snap Ads, AR Lens campaigns, and pixel instrumentation."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">
  <p class="supertitle mono">Lab / Ads Platform Manual</p>
  <h1>Snapchat Ads Mission Checklist</h1>
  <p class="intro">Snapchat delivers high-impact storytelling through vertical video and augmented reality. This checklist keeps creative, pixel data, and pacing aligned.</p>

  <section>
    <h2>Campaign structure</h2>
    <ul>
      <li>Organize campaigns by objective: Awareness, Engagement, Traffic, App Installs, or Conversions.</li>
      <li>Use ad set naming: <span class="mono">[Objective]-[Audience]-[Placement]-[Flight]</span>.</li>
      <li>Run AR Lens or Filter campaigns separately from Snap Ads to isolate delivery.</li>
    </ul>
  </section>

  <section>
    <h2>Creative requirements</h2>
    <ul>
      <li>Video: 1080x1920, 9:16 ratio, 3-180 seconds, with burned-in captions and brand within first 2 seconds.</li>
      <li>Collection Ads: provide at least 4 product tiles with unique URLs.</li>
      <li>AR Lenses: deliver lens files, preview video, and icon assets per Snap specs; test lens performance on target devices.</li>
    </ul>
  </section>

  <section>
    <h2>Audience strategy</h2>
    <ul>
      <li>Mix Lifestyle Categories, lookalike audiences, and first-party match lists.</li>
      <li>Deploy Pixel Custom Audiences for retargeting (site visitors, cart abandoners). Refresh within 7 days.</li>
      <li>Use placement exclusions for Discover publishers if brand safety requires.</li>
    </ul>
  </section>

  <section>
    <h2>Pixel and measurement</h2>
    <ul>
      <li>Implement Snap Pixel events: PAGE_VIEW, VIEW_CONTENT, ADD_CART, START_CHECKOUT, PURCHASE, SIGN_UP.</li>
      <li>Enable Advanced Conversions (CAPI) for stronger attribution.</li>
      <li>Configure conversion windows: 1/7 for upper funnel, 1/28 for conversion programs.</li>
    </ul>
  </section>

  <section>
    <h2>Optimization and QA</h2>
    <ul>
      <li><strong>Daily:</strong> Monitor swipe-up rate, cost per pixel event, and Lens interaction rate.</li>
      <li><strong>Weekly:</strong> Rotate creative sets; test Lens variations or new filter overlays.</li>
      <li><strong>Monthly:</strong> Review Mixpanel/GA4 downstream performance for incrementality and cross-channel impact.</li>
    </ul>
  </section>

  <section>
    <h2>Pre-launch checklist</h2>
    <ul>
      <li>Pixel events validated with Snap Pixel Helper.</li>
      <li>AR Lens QA completed (tracking, occlusion, end card functionality).</li>
      <li>Brand safety lists (publisher and category) applied.</li>
      <li>Flight calendar shared with community/support teams.</li>
    </ul>
  </section>
</div>
