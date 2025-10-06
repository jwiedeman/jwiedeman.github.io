---
layout: ../../../layouts/Layout.astro
title: "Meta Ads Launch Manual"
description: "Blueprint for Meta Advantage campaigns spanning Facebook, Instagram, and Audience Network."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">
  <p class="supertitle mono">Lab / Ads Platform Manual</p>
  <h1>Meta Ads Launch Manual</h1>
  <p class="intro">Meta’s ecosystem rewards signal density and creative variety. This manual captures the operating procedure for Meta Advantage+ shopping, lead generation, and consideration campaigns.</p>

  <section>
    <h2>Account flight plan</h2>
    <ul>
      <li>Unify pixel, Conversions API, and offline events inside Events Manager with deduplication keys configured.</li>
      <li>Use Advantage campaign budget (CBO) for scaled programs; reserve ABO for tight guardrails or incrementality tests.</li>
      <li>Apply naming taxonomy: <span class="mono">[LOB]-[Geo]-[Funnel]-[Offer]-[Experiment]</span> at the ad set level for quick log reviews.</li>
    </ul>
  </section>

  <section>
    <h2>Audience playbooks</h2>
    <ul>
      <li>Seed lookalikes with high-quality first-party conversions (value-based when available). Maintain 1%, 2-3%, and 5% tiers.</li>
      <li>Maintain stacked interest-based ad sets only if they outperform broad + Advantage audience benchmarks after 2 flight cycles.</li>
      <li>Refresh remarketing windows: 1-day, 7-day, 30-day site visitors plus product catalog retargeting when feeds are present.</li>
    </ul>
  </section>

  <section>
    <h2>Creative systems</h2>
    <p>Meta favors a healthy mix of lo-fi native content and polished assets.</p>
    <ul>
      <li>Develop modular asset kits: square, vertical, and landscape plus 15s and 30s video edits. Provide raw footage for Advantage+ creative remixes.</li>
      <li>Use branded templates for Stories/Reels to maintain compliance while enabling text swaps.</li>
      <li>Document best-performing hooks and CTAs in a shared creative telemetry log.</li>
    </ul>
  </section>

  <section>
    <h2>Signal integrity</h2>
    <p>Bid automation relies on clean conversion data.</p>
    <ul>
      <li>Leverage Conversions API Gateway or direct server-side integration to reduce signal loss from privacy controls.</li>
      <li>Map each conversion event to an onsite/CRM status, and deprecate redundant events in Events Manager.</li>
      <li>Enable Aggregated Event Measurement configuration with prioritized events for ATT-restricted traffic.</li>
    </ul>
  </section>

  <section>
    <h2>Optimization cadences</h2>
    <ul>
      <li><strong>Twice weekly:</strong> Review learning phase progress, break out ad sets that cap budget too early.</li>
      <li><strong>Weekly:</strong> Rotate creatives based on thumb-stop rate, hold-out brand lift tests for validation.</li>
      <li><strong>Monthly:</strong> Inspect Incrementality experiments or geo-holdouts to calibrate MMM or MER targets.</li>
    </ul>
  </section>

  <section>
    <h2>Pre-launch checklist</h2>
    <ul>
      <li>Pixel, CAPI, and offline events deduplicated and validated with the Test Events tool.</li>
      <li>Commerce catalogs synced (if applicable) with proper domain verification.</li>
      <li>All ads reviewed in Creative Hub mockups for compliance and accessibility (captions, safe zones).</li>
      <li>Alerting configured in Ads Manager or third-party monitor for spend anomalies.</li>
    </ul>
  </section>
</div>
