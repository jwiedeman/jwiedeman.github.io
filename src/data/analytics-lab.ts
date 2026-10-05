// Shared listings for the Analytics lab index and its Tools page.

export const sandboxes = [
  { title: 'GA4 Sandbox', href: '/lab/analytics/ga4-sandbox/', description: 'GA4 base snippet with a live event stream for every interaction pattern.' },
  { title: 'GTM Sandbox', href: '/lab/analytics/gtm-sandbox/', description: 'Google Tag Manager dataLayer pushes and container behavior.' },
  { title: 'Adobe Analytics', href: '/lab/analytics/adobe-analytics/', description: 'AppMeasurement setup, page views, and link tracking.' },
  { title: 'Unified Data Layer', href: '/lab/analytics/unified-data-layer/', description: 'One normalized event model routed to any vendor.' },
  { title: 'Meta Pixel', href: '/lab/analytics/meta-pixel/', description: 'Meta Pixel base code and standard events.' },
  { title: 'LinkedIn Insight Tag', href: '/lab/analytics/linkedin-pixel/', description: 'LinkedIn Insight Tag and conversion events.' },
  { title: 'X Pixel', href: '/lab/analytics/x-pixel/', description: 'X (Twitter) pixel base code and events.' },
].map((e, i) => ({ ...e, kind: 'Sandbox', id: `AN-${String(i + 1).padStart(2, '0')}` }));

export const tools = [
  {
    title: 'Mock Player',
    href: '/lab/analytics/tools/mock-player/',
    description: 'Fully instrumented video player: every device type, control, ad, and QoE event, mapped to GA4, Adobe, Segment, and the dataLayer.',
  },
].map((e, i) => ({ ...e, kind: 'Tool', id: `TL-${String(i + 1).padStart(2, '0')}` }));
