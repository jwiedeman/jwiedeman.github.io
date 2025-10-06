---
layout: ../../../layouts/Layout.astro
title: "Pinterest Ads Flight Plan"
description: "Guide for discovery commerce campaigns, Idea Pins, and conversion tracking on Pinterest."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">
  <p class="supertitle mono">Lab / Ads Platform Manual</p>
  <h1>Pinterest Ads Flight Plan</h1>
  <p class="intro">Pinterest is a visual discovery engine. This flight plan keeps creative storytelling, product feed hygiene, and conversion tracking synchronized.</p>

  <section>
    <h2>Campaign architecture</h2>
    <ul>
      <li>Build separate campaigns for Awareness, Consideration, and Conversions with the appropriate bidding strategy (CPM, CPC, CPA).</li>
      <li>Adopt ad group naming: <span class="mono">[Objective]-[Audience]-[Creative]-[Season]</span>.</li>
      <li>Use Shopping campaigns for catalog-driven programs; keep Dynamic Retargeting in its own budget lane.</li>
    </ul>
  </section>

  <section>
    <h2>Creative system</h2>
    <ul>
      <li>Produce Idea Pins with 5-7 pages telling a cohesive story. Include instructional steps, product highlights, and clear CTA.</li>
      <li>Vertical video specs: 9:16 ratio, 6-30 seconds, high-resolution imagery, captions for accessibility.</li>
      <li>Ensure all creatives include tasteful branding and text within safe zones to avoid cropping.</li>
    </ul>
  </section>

  <section>
    <h2>Catalog and feed health</h2>
    <ul>
      <li>Sync product feed daily; audit for availability, price accuracy, and taxonomy mapping.</li>
      <li>Utilize supplemental feeds to localize currency or seasonal assortments.</li>
      <li>Leverage product groupings by category, price tier, and best sellers for granular reporting.</li>
    </ul>
  </section>

  <section>
    <h2>Measurement and signals</h2>
    <ul>
      <li>Deploy Pinterest tag events: page_visit, add_to_cart, signup, lead, checkout.</li>
      <li>Enable the Conversion API (CAPI) for improved signal resilience.</li>
      <li>Set attribution windows: 1/30 (view/click) default; tighten to 1/7 for upper funnel experiments.</li>
    </ul>
  </section>

  <section>
    <h2>Optimization cadence</h2>
    <ul>
      <li><strong>Weekly:</strong> Review top search queries and adjust keyword targeting or negatives.</li>
      <li><strong>Bi-weekly:</strong> Refresh Idea Pins and video assets to maintain engagement.</li>
      <li><strong>Monthly:</strong> Evaluate assisted conversions and halo impact across discovery channels.</li>
    </ul>
  </section>

  <section>
    <h2>Pre-launch checklist</h2>
    <ul>
      <li>Product feeds validated with no critical errors.</li>
      <li>Pinterest tag and CAPI events tested in Events Manager.</li>
      <li>Creative suite uploaded with cover images and text overlays QA’d.</li>
      <li>Dashboard tracking marketing efficiency ratio (MER) across discovery channels ready.</li>
    </ul>
  </section>
</div>
