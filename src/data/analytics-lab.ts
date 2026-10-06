// Shared listings for the Analytics lab index and its Tools page.

export const sandboxes = [
  { title: 'GA4 Tracking Spec', href: '/lab/analytics/ga4-spec/', description: 'Every web, app, and TV interaction mapped to GA4 events and parameters, with live examples and generated code.' },
  { title: 'GTM Sandbox', href: '/lab/analytics/gtm-sandbox/', description: 'dataLayer pushes, triggers, variables, Consent Mode v2, and the container snippet.' },
  { title: 'Adobe Analytics', href: '/lab/analytics/adobe-analytics/', description: 'AppMeasurement setup, page views, and link tracking.' },
  { title: 'Unified Data Layer', href: '/lab/analytics/unified-data-layer/', description: 'One vendor-neutral event schema mapped to GA4, Adobe Analytics, and Meta.' },
  { title: 'Meta Pixel', href: '/lab/analytics/meta-pixel/', description: 'Meta Pixel base code and standard events.' },
  { title: 'LinkedIn Insight Tag', href: '/lab/analytics/linkedin-pixel/', description: 'LinkedIn Insight Tag and conversion events.' },
  { title: 'X Pixel', href: '/lab/analytics/x-pixel/', description: 'X (Twitter) pixel base code and events.' },
].map((e) => ({ ...e, kind: 'Sandbox' }));

export const tools = [
  {
    title: 'Mock Player',
    href: '/lab/analytics/tools/mock-player/',
    description: 'Fully instrumented video player: every device type, control, ad, and QoE event, mapped to GA4, Adobe, Segment, and the dataLayer.',
  },
].map((e) => ({ ...e, kind: 'Tool' }));
