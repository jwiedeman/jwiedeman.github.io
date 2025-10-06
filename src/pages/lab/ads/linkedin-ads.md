---
layout: ../../../layouts/Layout.astro
title: "LinkedIn Ads Deployment Guide"
description: "Runbook for B2B demand generation, ABM, and pipeline acceleration on LinkedIn."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">
  <p class="supertitle mono">Lab / Ads Platform Manual</p>
  <h1>LinkedIn Ads Deployment Guide</h1>
  <p class="intro">LinkedIn’s professional graph is ideal for account-based marketing and pipeline acceleration. This guide documents campaign structure, targeting controls, and lead management.</p>

  <section>
    <h2>Campaign architecture</h2>
    <ul>
      <li>Build separate campaign groups for Awareness, Consideration, and Conversion with shared objectives.</li>
      <li>Use single objective per campaign: Brand Awareness, Website Conversions, or Lead Generation depending on funnel stage.</li>
      <li>Adopt consistent taxonomy: <span class="mono">[Program]-[Segment]-[Offer]-[Quarter]</span>.</li>
    </ul>
  </section>

  <section>
    <h2>Audience design</h2>
    <ul>
      <li>Create matched audiences from CRM lists (CSV or API) segmented by buying committee roles.</li>
      <li>Layer firmographic filters: industry, company size, seniority, and job function with audience expansion disabled for ABM programs.</li>
      <li>Retarget site visitors with Insight Tag and video viewers at 25%, 50%, and 75% completion thresholds.</li>
    </ul>
  </section>

  <section>
    <h2>Creative payloads</h2>
    <p>Deliver value-forward creative that respects professional context.</p>
    <ul>
      <li>Sponsor Document Ads for deep content (whitepapers, research) with ungated preview pages.</li>
      <li>Use Conversation Ads for multi-path nurture; craft decision trees that map to buyer readiness.</li>
      <li>When using Lead Gen Forms, prefill custom questions for qualification. Sync responses to CRM within 15 minutes.</li>
    </ul>
  </section>

  <section>
    <h2>Measurement and integrations</h2>
    <ul>
      <li>Validate Insight Tag firing on key pages; map events to conversions within Campaign Manager.</li>
      <li>Enable Conversion API for server-side events when form fills are captured offsite.</li>
      <li>Pipe data into marketing automation via native connectors or tools like Zapier/Segment. Ensure UTM parameters align with reporting standards.</li>
    </ul>
  </section>

  <section>
    <h2>Optimization cadence</h2>
    <ul>
      <li><strong>Weekly:</strong> Review frequency, CTR, and cost per qualified visit. Shift budget between campaign groups accordingly.</li>
      <li><strong>Bi-weekly:</strong> Evaluate creative fatigue; rotate new conversation paths or document assets.</li>
      <li><strong>Quarterly:</strong> Refresh firmographic filters based on sales feedback and opportunity quality.</li>
    </ul>
  </section>

  <section>
    <h2>Pre-flight checklist</h2>
    <ul>
      <li>Insight Tag validated and matched audiences above minimum threshold (300 members).</li>
      <li>Lead Gen Form connectors tested for CRM/marketing automation sync.</li>
      <li>All creatives pass brand and legal review with accessible contrast and subtitles on video.</li>
      <li>Budget pacing dashboard configured (Looker Studio, Tableau, or Power BI).</li>
    </ul>
  </section>
</div>
