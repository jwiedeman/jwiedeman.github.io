---
layout: ../../../layouts/Layout.astro
title: "X Ads Operations Brief"
description: "Guidance for awareness and performance programs on X (Twitter)."
headingTracker:
  enabled: true
  contentId: tracked-content
---
<div class="container" id="tracked-content">
  <p class="supertitle mono">Lab / Ads Platform Manual</p>
  <h1>X Ads Operations Brief</h1>
  <p class="intro">X Ads (formerly Twitter) excel when conversation and reach tactics are orchestrated together. This brief outlines how to structure campaigns, fuel the pixel, and manage brand safety.</p>

  <section>
    <h2>Campaign structure</h2>
    <ul>
      <li>Create separate campaigns for Reach, Website Traffic, Conversions, and App objectives. Avoid mixing objectives within one flight.</li>
      <li>Use ad group naming: <span class="mono">[Objective]-[Audience]-[Creative]-[Flight]</span>.</li>
      <li>Enable Frequency Cap for Reach campaigns (1 per user per day unless testing high frequency launches).</li>
    </ul>
  </section>

  <section>
    <h2>Audience systems</h2>
    <ul>
      <li>Combine keyword targeting (15-25 terms) with follower look-alikes of influential accounts.</li>
      <li>Deploy tailored audiences from site visitors, customer lists, and app users; refresh lists every 7 days for active programs.</li>
      <li>Use conversation targeting or event targeting for cultural moments; align creative approvals ahead of time.</li>
    </ul>
  </section>

  <section>
    <h2>Creative payload</h2>
    <ul>
      <li>Leverage Website Cards and Conversation Cards for performance programs, Video Ads for awareness.</li>
      <li>Draft copy variations with clear CTAs; limit to 2 hashtags to avoid siphoning traffic.</li>
      <li>Plan replies for conversation ads. Ensure community managers have macros for follow-up responses.</li>
    </ul>
  </section>

  <section>
    <h2>Pixel and measurement</h2>
    <ul>
      <li>Install X Pixel via GTM; verify Page View and conversion events with the Pixel Helper.</li>
      <li>Implement the Conversions API (CAPI) for server-side events when dealing with gated conversions or app installs.</li>
      <li>Set up conversion attribution windows per campaign: 1/7 day (view/click) for awareness, 1/30 for performance programs.</li>
    </ul>
  </section>

  <section>
    <h2>Brand safety</h2>
    <ul>
      <li>Apply adjacency controls: block lists, allow lists, and keyword exclusion lists updated weekly.</li>
      <li>Activate third-party verification (DoubleVerify, IAS) when budgets justify.</li>
      <li>Monitor conversation threads for sentiment; escalate outliers to comms within 2 hours.</li>
    </ul>
  </section>

  <section>
    <h2>Go / no-go checklist</h2>
    <ul>
      <li>Pixel and CAPI events validated across purchase funnel.</li>
      <li>Conversation reply macros reviewed by legal/PR.</li>
      <li>Brand safety lists uploaded and associated with campaigns.</li>
      <li>Budget pacing alerts configured in Ads Manager or third-party stack.</li>
    </ul>
  </section>
</div>
