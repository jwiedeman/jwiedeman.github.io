import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jwiedeman.github.io',
  prefetch: true,
  // Renamed pages keep their old URLs working.
  redirects: {
    '/lab/analytics/ga4-sandbox': '/lab/analytics/ga4-spec/'
  }
});
