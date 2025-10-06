---
layout: ../../../layouts/Layout.astro
title: "Microsoft Advertising Deployment Manual"
description: "Checklist for Microsoft Search, Audience Network, and import automation."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">
  <p class="supertitle mono">Lab / Ads Platform Manual</p>
  <h1>Microsoft Advertising Deployment Manual</h1>
  <p class="intro">Microsoft Advertising complements Google coverage with search scale, audience network placements, and unique LinkedIn profile targeting. Use this manual to align launches with enterprise rigor.</p>

  <section>
    <h2>Campaign structure</h2>
    <ul>
      <li>Mirror Google Ads naming and campaign segmentation for parity, but tailor budgets to Microsoft market share.</li>
      <li>Create separate campaigns for Search, Audience Network, and Shopping. Avoid importing Display-only structures.</li>
      <li>Adopt naming: <span class="mono">[LOB]-[Geo]-[Objective]-[Engine]</span>.</li>
    </ul>
  </section>

  <section>
    <h2>Import and sync operations</h2>
    <ul>
      <li>Schedule Google Import with post-import checks (bid strategy compatibility, negative keyword lists, URL parameters).</li>
      <li>Audit automated rules to ensure budgets, bids, and ad schedules align with Microsoft auction patterns.</li>
      <li>Use Multi-platform campaigns only when creative parity is required; otherwise manage Microsoft-native optimizations.</li>
    </ul>
  </section>

  <section>
    <h2>Audience enhancements</h2>
    <ul>
      <li>Apply LinkedIn Profile Targeting (company, industry, job function) as bid modifiers on search campaigns.</li>
      <li>Leverage In-market Audiences and remarketing lists imported via UET.</li>
      <li>Use dynamic remarketing for Shopping campaigns with product audiences.</li>
    </ul>
  </section>

  <section>
    <h2>Telemetry and measurement</h2>
    <ul>
      <li>Ensure Universal Event Tracking (UET) tag is firing on all key pages; configure conversion goals accordingly.</li>
      <li>Integrate offline conversions using the Microsoft Advertising API or automated CSV uploads.</li>
      <li>Map last-touch, assist, and cross-channel contributions in BI dashboards to understand Microsoft’s incrementality.</li>
    </ul>
  </section>

  <section>
    <h2>Optimization cadence</h2>
    <ul>
      <li><strong>Weekly:</strong> Review search query reports, adjust negatives, and align ad copy to Microsoft-specific queries.</li>
      <li><strong>Bi-weekly:</strong> Evaluate Audience Network placements; exclude low-quality inventory.</li>
      <li><strong>Monthly:</strong> Compare cost per acquisition vs. Google. Rebalance budgets based on MER.</li>
    </ul>
  </section>

  <section>
    <h2>Pre-launch checklist</h2>
    <ul>
      <li>UET tag validated with Microsoft UET Tag Helper.</li>
      <li>Conversion goals mapped and imported from Google if applicable.</li>
      <li>LinkedIn Profile targeting rules approved by stakeholders.</li>
      <li>Budget pacing reports available to finance and marketing stakeholders.</li>
    </ul>
  </section>
</div>
