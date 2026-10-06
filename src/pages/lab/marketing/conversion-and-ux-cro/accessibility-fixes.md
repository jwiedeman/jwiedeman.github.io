---
layout: ../../../../layouts/Layout.astro
title: "Accessibility Fixes"
description: "Fix accessibility problems so more people can use your site and complete a purchase."
---
# Accessibility Fixes

Web accessibility means everyone can use your site, including people with disabilities. The WHO estimates about 1.3 billion people, roughly 16% of the world's population, live with a significant disability. Accessibility fixes remove barriers that stop people from navigating, filling out forms, and buying. The same fixes usually make the site easier for everyone.

## How it works

Most accessibility problems are general usability problems that hit disabled users hardest. Low-contrast text is hard to read for people with low vision and for anyone on a phone in sunlight. Missing form labels confuse screen readers and sighted users alike. Small tap targets block people with motor impairments and frustrate everyone on mobile. Fixing these issues improves the experience across your whole audience.

## How to do it

1. Run an automated audit with axe DevTools, WAVE, or Lighthouse. Fix all critical and serious issues first.
2. Unplug the mouse. Complete signup and checkout using only Tab, Enter, Space, and Escape. Fix anything you cannot reach or operate.
3. Check color contrast against WCAG AA: 4.5:1 for normal text, 3:1 for large text. Pay attention to buttons, placeholder text, and error messages.
4. Use a logical heading order (h1, then h2, then h3).
5. Add alt text to content images. Use empty `alt=""` for decorative images.
6. Give every form field a visible label. Do not rely on placeholder text.
7. Add ARIA attributes to custom widgets such as dropdowns, tabs, and modals.
8. Test with a screen reader: VoiceOver on Mac and iOS, NVDA on Windows, TalkBack on Android. Automated tools miss many issues.

## What to measure

- **Automated audit pass rate**: Share of checks passed in axe or Lighthouse. Track it per release.
- **Keyboard task completion**: Can a keyboard-only user finish signup, checkout, and contact forms? This should be yes for every flow.
- **Open issue count by severity**: Number of unresolved critical and serious issues on conversion pages.

## Best practices

- Fix conversion pages first: signup, checkout, and product pages.
- Keep visible focus indicators. Do not set `outline: none` without a replacement style.
- Write alt text that says what the image shows or does. "Chart of revenue by year" is useful. "Blue chart" is not.

## Common pitfalls

- Relying on automated tools alone and calling the site compliant. Tools cannot judge whether alt text is meaningful or tab order makes sense.
- Installing an accessibility overlay widget and treating it as a fix. Overlays do not repair the underlying code and are widely criticized by disabled users.
- Treating accessibility as a one-time project. New features and content can break it. Add checks to your QA process.
