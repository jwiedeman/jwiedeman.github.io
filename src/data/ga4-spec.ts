/**
 * GA4 tracking spec: every common web, app, and TV component mapped to the
 * GA4 event and parameters to send. Drives /lab/analytics/ga4-spec/
 * (cards, reference tables) and its client script (live examples, code
 * generation, validation).
 *
 * Event types follow Google's hierarchy: use automatically collected and
 * enhanced measurement events first, then recommended events, and custom
 * events only when neither fits.
 */

export type EventType = 'automatic' | 'enhanced' | 'recommended' | 'custom' | 'command';
export type Platform = 'web' | 'app' | 'tv';
export type ParamValue = string | number | boolean | Record<string, unknown>[];

export interface SpecEvent {
  name: string;
  type: EventType;
  /** Example parameters. `{value}`-style tokens are filled in by the live example. */
  params: Record<string, ParamValue>;
  when: string;
  /** Suggested key event (formerly "conversion"). */
  key?: boolean;
}

export interface SpecEntry {
  id: string;
  category: string;
  component: string;
  summary: string;
  platforms: Platform[];
  /** Which live example to render. */
  ui: string;
  /** Buttons for the generic `buttons` example. */
  buttons?: { label: string; event: string; params?: Record<string, ParamValue> }[];
  events: SpecEvent[];
  notes?: string[];
}

export const CATEGORIES = [
  { id: 'pages', title: 'Pages and screens' },
  { id: 'navigation', title: 'Navigation and discovery' },
  { id: 'forms', title: 'Forms, accounts, and onboarding' },
  { id: 'messaging', title: 'Banners, dialogs, and consent' },
  { id: 'content', title: 'Content engagement' },
  { id: 'media', title: 'Video and audio' },
  { id: 'commerce', title: 'Ecommerce' },
  { id: 'tv', title: 'TV, subscriptions, and casting' },
  { id: 'app', title: 'App lifecycle' },
  { id: 'quality', title: 'Errors, performance, and experiments' },
  { id: 'games', title: 'Games' },
] as const;

export const TYPE_LABEL: Record<EventType, string> = {
  automatic: 'Automatic',
  enhanced: 'Enhanced measurement',
  recommended: 'Recommended',
  custom: 'Custom',
  command: 'Command',
};

export const TYPE_HELP: Record<EventType, string> = {
  automatic: 'Collected by gtag.js or the Firebase SDK with no code.',
  enhanced: 'Web only. Collected automatically when the enhanced measurement toggle is on in the data stream.',
  recommended: 'Defined by Google with fixed names and parameters. Use the exact names so reports and integrations work.',
  custom: 'Named by you. Follows GA4 naming rules; parameters must be registered as custom dimensions to appear in reports.',
  command: 'Not an event. A gtag command that changes settings for the events that follow.',
};

export const PLATFORM_LABEL: Record<Platform, string> = { web: 'Web', app: 'App', tv: 'TV / OTT' };

/* Sample catalog used by the ecommerce example. */
export const ITEMS = [
  { item_id: 'SKU_1042', item_name: 'Trail running shoe', item_brand: 'Northfield', item_category: 'Footwear', item_variant: 'Blue / 10', price: 129, quantity: 1 },
  { item_id: 'SKU_2210', item_name: 'Merino base layer', item_brand: 'Northfield', item_category: 'Apparel', item_variant: 'Black / M', price: 68, quantity: 1 },
  { item_id: 'SKU_3307', item_name: 'Insulated bottle', item_brand: 'Northfield', item_category: 'Accessories', item_variant: '750 ml', price: 32, quantity: 1 },
];
const LIST = { item_list_id: 'running_gear', item_list_name: 'Running gear' };
const listed = ITEMS.map((it, i) => ({ ...it, index: i, ...LIST }));
const one = [{ ...ITEMS[0] }];
const VIDEO = {
  video_provider: 'html5',
  video_title: 'Product tour',
  video_url: 'https://example.com/media/product-tour.mp4',
  video_duration: 120,
};

export const SPEC: SpecEntry[] = [
  /* ---------------------------------------------------------- pages */
  {
    id: 'page-view',
    category: 'pages',
    component: 'Page load',
    summary: 'Every web page load. Sent by the config command, so most sites need no extra code.',
    platforms: ['web'],
    ui: 'buttons',
    buttons: [{ label: 'Send page_view', event: 'page_view', params: { page_location: '{location}', page_title: '{title}' } }],
    events: [
      {
        name: 'page_view',
        type: 'automatic',
        params: { page_location: 'https://example.com/pricing?utm_source=newsletter', page_title: 'Pricing', page_referrer: 'https://www.google.com/' },
        when: 'Each full page load, from gtag("config").',
      },
    ],
    notes: [
      'page_location carries utm_* and gclid parameters. GA4 reads traffic source from it, so do not strip them before the hit is sent.',
      'Do not also send page_view from a GTM tag. Two systems sending the same event doubles the count.',
    ],
  },
  {
    id: 'spa-route',
    category: 'pages',
    component: 'Single-page app route change',
    summary: 'The URL changes without a full page load (React, Vue, Angular, Next.js client navigation).',
    platforms: ['web'],
    ui: 'spa',
    events: [
      {
        name: 'page_view',
        type: 'enhanced',
        params: { page_location: 'https://example.com/pricing', page_title: 'Pricing', page_referrer: 'https://example.com/' },
        when: 'History change. Enhanced measurement detects pushState and popstate.',
      },
    ],
    notes: [
      'Send page_view after the new title and URL are set; otherwise the event reports the previous page.',
      'If the router changes the URL more than once per navigation, turn off "page changes based on browser history events" and send page_view yourself.',
    ],
  },
  {
    id: 'screen-view',
    category: 'pages',
    component: 'App or TV screen',
    summary: 'A screen becomes visible in a native app or TV app. The equivalent of page_view.',
    platforms: ['app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Open Settings', event: 'screen_view', params: { screen_name: 'Settings', screen_class: 'SettingsScreen' } },
      { label: 'Open Player', event: 'screen_view', params: { screen_name: 'Player', screen_class: 'PlayerScreen' } },
    ],
    events: [
      {
        name: 'screen_view',
        type: 'automatic',
        params: { screen_name: 'Settings', screen_class: 'SettingsScreen' },
        when: 'Screen shown. Logged automatically for Android activities and iOS view controllers.',
      },
    ],
    notes: [
      'Log it manually for Jetpack Compose, SwiftUI, React Native, and Flutter, which the SDK cannot see.',
      'TV apps without a Firebase SDK (Roku, Tizen, webOS) send screen_view over the Measurement Protocol.',
    ],
  },
  {
    id: 'scroll',
    category: 'pages',
    component: 'Scroll depth',
    summary: 'How far down the page people read.',
    platforms: ['web'],
    ui: 'scroll',
    events: [
      { name: 'scroll', type: 'enhanced', params: { percent_scrolled: 90 }, when: 'Once per page, at 90% depth.' },
      {
        name: 'scroll',
        type: 'custom',
        params: { percent_scrolled: 50 },
        when: 'Optional extra thresholds (25, 50, 75) from a GTM Scroll Depth trigger.',
      },
    ],
    notes: [
      'If you add thresholds, turn enhanced scroll off and send all of them (including 90) from one place, so 90% is not counted twice.',
      'Apps and TV apps have no page scroll; track meaningful list positions with view_item_list or custom events instead.',
    ],
  },

  /* ---------------------------------------------------------- navigation */
  {
    id: 'nav',
    category: 'navigation',
    component: 'Menu, footer, and breadcrumb links',
    summary: 'Internal navigation. One event for every menu, with the menu named in a parameter.',
    platforms: ['web', 'app', 'tv'],
    ui: 'nav',
    events: [
      {
        name: 'nav_click',
        type: 'custom',
        params: { link_text: 'Pricing', link_url: '/pricing', nav_location: 'header' },
        when: 'A navigation link or menu item is selected.',
      },
    ],
    notes: [
      'nav_location values: header, footer, breadcrumb, sidebar, tab_bar (app), side_menu (TV).',
      'The destination page_view already records the visit; nav_click tells you which menu led there.',
    ],
  },
  {
    id: 'outbound',
    category: 'navigation',
    component: 'Outbound link',
    summary: 'A link to another domain.',
    platforms: ['web'],
    ui: 'outbound',
    events: [
      {
        name: 'click',
        type: 'enhanced',
        params: { link_url: 'https://developers.google.com/analytics', link_domain: 'developers.google.com', link_classes: 'docs-link', link_id: '', outbound: true },
        when: 'A link to a domain outside the data stream is clicked.',
      },
    ],
    notes: ['Add your other domains under "Configure your domains" so links between them count as internal, not outbound.'],
  },
  {
    id: 'tabs',
    category: 'navigation',
    component: 'Tabs',
    summary: 'Switching between panels of content on the same page or screen.',
    platforms: ['web', 'app', 'tv'],
    ui: 'tabs',
    events: [
      {
        name: 'select_content',
        type: 'recommended',
        params: { content_type: 'tab', content_id: 'specifications' },
        when: 'The user selects a tab. Not sent for the tab shown by default.',
      },
    ],
  },
  {
    id: 'accordion',
    category: 'navigation',
    component: 'Accordion and FAQ',
    summary: 'Expandable sections.',
    platforms: ['web', 'app'],
    ui: 'accordion',
    events: [
      {
        name: 'select_content',
        type: 'recommended',
        params: { content_type: 'faq', content_id: 'return_policy' },
        when: 'An item is expanded. Collapsing is not tracked.',
      },
    ],
  },
  {
    id: 'carousel',
    category: 'navigation',
    component: 'Carousel',
    summary: 'A rotating set of slides.',
    platforms: ['web', 'app', 'tv'],
    ui: 'carousel',
    events: [
      {
        name: 'carousel_slide',
        type: 'custom',
        params: { carousel_name: 'home_hero', slide_index: 2, slide_name: 'Spring sale', method: 'arrow' },
        when: 'The user moves the carousel (arrow, swipe, dot). Never sent for autoplay.',
      },
    ],
    notes: ['If a slide is a promotion, also send view_promotion and select_promotion for it.'],
  },
  {
    id: 'search',
    category: 'navigation',
    component: 'Site and in-app search',
    summary: 'A search box.',
    platforms: ['web', 'app', 'tv'],
    ui: 'search',
    events: [
      { name: 'search', type: 'recommended', params: { search_term: '{value}' }, when: 'A search is submitted.' },
      {
        name: 'view_search_results',
        type: 'enhanced',
        params: { search_term: 'trail shoes' },
        when: 'Web only: a page loads whose URL contains q, s, search, query, or keyword.',
      },
    ],
    notes: [
      'On the web, use either the enhanced event or a manual search event, not both.',
      'Send the term as typed, lowercased and trimmed. If people search for order numbers or email addresses, redact them first.',
    ],
  },
  {
    id: 'filters',
    category: 'navigation',
    component: 'Filters and sorting',
    summary: 'Refining a list of products, articles, or titles.',
    platforms: ['web', 'app', 'tv'],
    ui: 'filters',
    events: [
      {
        name: 'filter_apply',
        type: 'custom',
        params: { list_name: 'running_gear', filter_name: 'size', filter_value: '10' },
        when: 'A filter is turned on. One event per filter, not one per list refresh.',
      },
      {
        name: 'sort_apply',
        type: 'custom',
        params: { list_name: 'running_gear', sort_by: 'price_low_high' },
        when: 'The sort order is changed.',
      },
    ],
  },
  {
    id: 'load-more',
    category: 'navigation',
    component: 'Pagination and "load more"',
    summary: 'Requesting the next set of results.',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [{ label: 'Load more', event: 'load_more', params: { list_name: 'running_gear', page_number: 2 } }],
    events: [
      {
        name: 'load_more',
        type: 'custom',
        params: { list_name: 'running_gear', page_number: 2 },
        when: 'More results load in place. Numbered pages that change the URL are already page_views.',
      },
    ],
  },

  /* ---------------------------------------------------------- forms */
  {
    id: 'form',
    category: 'forms',
    component: 'Form',
    summary: 'A contact, quote, or application form, from first interaction to confirmed submission.',
    platforms: ['web', 'app'],
    ui: 'form',
    events: [
      {
        name: 'form_start',
        type: 'enhanced',
        params: { form_id: 'contact', form_name: 'Contact sales', form_destination: 'https://example.com/api/contact' },
        when: 'First interaction with a field, once per form per session.',
      },
      {
        name: 'form_error',
        type: 'custom',
        params: { form_id: 'contact', field_name: 'email', error_type: 'invalid_format' },
        when: 'Validation fails. Send the field and the rule, never what was typed.',
      },
      {
        name: 'form_submit',
        type: 'enhanced',
        params: { form_id: 'contact', form_name: 'Contact sales', form_destination: 'https://example.com/api/contact', form_submit_text: 'Send' },
        when: 'The form is submitted (an attempt, not a confirmed success).',
      },
      {
        name: 'generate_lead',
        type: 'recommended',
        params: { currency: 'USD', value: 50, lead_source: 'contact_form' },
        when: 'The server accepts the submission.',
        key: true,
      },
    ],
    notes: [
      'Enhanced form events fire on the browser submit, including submissions that later fail. Use generate_lead (or sign_up) on confirmed success as the key event.',
      'Never send field values. Names, emails, and phone numbers in GA4 break Google\'s terms.',
    ],
  },
  {
    id: 'sign-up',
    category: 'forms',
    component: 'Account creation',
    summary: 'A new account is created.',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Sign up with email', event: 'sign_up', params: { method: 'email' } },
      { label: 'Sign up with Google', event: 'sign_up', params: { method: 'google' } },
    ],
    events: [{ name: 'sign_up', type: 'recommended', params: { method: 'email' }, when: 'The account is created, after the server confirms.', key: true }],
  },
  {
    id: 'login',
    category: 'forms',
    component: 'Sign in and sign out',
    summary: 'Authentication, and attaching the account ID to later events.',
    platforms: ['web', 'app', 'tv'],
    ui: 'login',
    events: [
      { name: 'login', type: 'recommended', params: { method: 'google' }, when: 'Sign-in succeeds. Set user_id at the same time.' },
      { name: 'logout', type: 'custom', params: {}, when: 'The user signs out. Clear user_id afterwards.' },
    ],
    notes: [
      'user_id must be your own internal account ID. Never an email address or anything a person could be identified by.',
      'Set user_id before sending login so the login event itself carries it.',
    ],
  },
  {
    id: 'onboarding',
    category: 'forms',
    component: 'Onboarding and tutorials',
    summary: 'A guided first-run flow or product tour.',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Start tour', event: 'tutorial_begin' },
      { label: 'Finish tour', event: 'tutorial_complete' },
    ],
    events: [
      { name: 'tutorial_begin', type: 'recommended', params: {}, when: 'The tutorial starts.' },
      { name: 'tutorial_complete', type: 'recommended', params: {}, when: 'The last step is finished. Skipping does not count.' },
    ],
    notes: ['For step-level analysis, add a custom tutorial_step event with step_number and step_name.'],
  },
  {
    id: 'upload',
    category: 'forms',
    component: 'File upload',
    summary: 'Attaching a file to a form or profile.',
    platforms: ['web', 'app'],
    ui: 'upload',
    events: [
      {
        name: 'file_upload',
        type: 'custom',
        params: { upload_context: 'job_application', file_extension: 'pdf', file_size_kb: 240 },
        when: 'The upload finishes. Never send the file name; it often contains a person\'s name.',
      },
    ],
  },

  /* ---------------------------------------------------------- messaging */
  {
    id: 'promotion',
    category: 'messaging',
    component: 'Promotion banner',
    summary: 'An internal promotion: hero banner, sale strip, or featured tile.',
    platforms: ['web', 'app', 'tv'],
    ui: 'promo',
    events: [
      {
        name: 'view_promotion',
        type: 'recommended',
        params: { promotion_id: 'SPRING25', promotion_name: 'Spring sale', creative_name: 'spring_hero_v2', creative_slot: 'home_hero' },
        when: 'At least half the banner is visible for one second.',
      },
      {
        name: 'select_promotion',
        type: 'recommended',
        params: { promotion_id: 'SPRING25', promotion_name: 'Spring sale', creative_name: 'spring_hero_v2', creative_slot: 'home_hero' },
        when: 'The banner is clicked or selected.',
      },
    ],
    notes: ['Promotion parameters can also be set per item inside items, when one banner features specific products.'],
  },
  {
    id: 'cta',
    category: 'messaging',
    component: 'Call-to-action button',
    summary: 'A prominent button such as "Start free trial" or "Book a demo".',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Start free trial', event: 'cta_click', params: { cta_text: 'Start free trial', cta_location: 'pricing_table', link_url: '/signup' } },
      { label: 'Book a demo', event: 'cta_click', params: { cta_text: 'Book a demo', cta_location: 'hero', link_url: '/demo' } },
    ],
    events: [
      {
        name: 'cta_click',
        type: 'custom',
        params: { cta_text: 'Start free trial', cta_location: 'pricing_table', link_url: '/signup' },
        when: 'The button is clicked.',
      },
    ],
    notes: [
      'cta_click measures the button. The outcome (sign_up, begin_checkout, generate_lead) is a separate event, and the outcome is the key event.',
      'Keep cta_text in one language. Translated labels split one button into several rows.',
    ],
  },
  {
    id: 'dialog',
    category: 'messaging',
    component: 'Modal dialog',
    summary: 'An overlay that asks for attention: an offer, a survey, a confirmation.',
    platforms: ['web', 'app', 'tv'],
    ui: 'dialog',
    events: [
      { name: 'modal_view', type: 'custom', params: { modal_name: 'exit_offer' }, when: 'The dialog opens.' },
      {
        name: 'modal_close',
        type: 'custom',
        params: { modal_name: 'exit_offer', close_method: 'button' },
        when: 'It closes. close_method: button, escape, backdrop, or action.',
      },
    ],
  },
  {
    id: 'consent',
    category: 'messaging',
    component: 'Consent banner',
    summary: 'Cookie and data-use choices, using Consent Mode v2.',
    platforms: ['web', 'app'],
    ui: 'consent',
    events: [
      {
        name: 'consent default',
        type: 'command',
        params: { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 },
        when: 'Before any tag runs, from a script above the GA4 snippet.',
      },
      {
        name: 'consent update',
        type: 'command',
        params: { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' },
        when: 'The user makes a choice, and on every later page load from the stored choice.',
      },
    ],
    notes: [
      'While analytics_storage is denied, gtag.js sends cookieless pings (no client ID, gcs=G100) that GA4 uses for modeling.',
      'Apps set the same four signals with setConsent() in the Firebase SDK.',
    ],
  },

  /* ---------------------------------------------------------- content */
  {
    id: 'content-card',
    category: 'content',
    component: 'Content card',
    summary: 'Selecting an article, video, or document from a list.',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Open "Consent Mode v2 explained"', event: 'select_content', params: { content_type: 'article', content_id: 'consent-mode-v2' } },
      { label: 'Open "Product tour" video', event: 'select_content', params: { content_type: 'video', content_id: 'product-tour' } },
    ],
    events: [{ name: 'select_content', type: 'recommended', params: { content_type: 'article', content_id: 'consent-mode-v2' }, when: 'A card is selected.' }],
    notes: ['For products, use select_item with items instead.'],
  },
  {
    id: 'share',
    category: 'content',
    component: 'Share',
    summary: 'Copying a link or sharing to another app.',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Copy link', event: 'share', params: { method: 'copy_link', content_type: 'article', item_id: 'ga4-tracking-spec' } },
      { label: 'Share to LinkedIn', event: 'share', params: { method: 'linkedin', content_type: 'article', item_id: 'ga4-tracking-spec' } },
      { label: 'Native share sheet', event: 'share', params: { method: 'system_share_sheet', content_type: 'article', item_id: 'ga4-tracking-spec' } },
    ],
    events: [
      {
        name: 'share',
        type: 'recommended',
        params: { method: 'copy_link', content_type: 'article', item_id: 'ga4-tracking-spec' },
        when: 'The share action is chosen. The system share sheet does not report which app was picked.',
      },
    ],
  },
  {
    id: 'download',
    category: 'content',
    component: 'File download',
    summary: 'A link to a PDF, spreadsheet, archive, or installer.',
    platforms: ['web'],
    ui: 'download',
    events: [
      {
        name: 'file_download',
        type: 'enhanced',
        params: {
          file_extension: 'pdf',
          file_name: '/files/ga4-tracking-spec.pdf',
          link_text: 'Download the spec (PDF)',
          link_url: 'https://example.com/files/ga4-tracking-spec.pdf',
        },
        when: 'A link to a common document, archive, audio, or video extension is clicked.',
      },
    ],
  },
  {
    id: 'reactions',
    category: 'content',
    component: 'Rate, like, save, and follow',
    summary: 'Lightweight reactions to content.',
    platforms: ['web', 'app', 'tv'],
    ui: 'reactions',
    events: [
      { name: 'content_rate', type: 'custom', params: { content_type: 'article', content_id: 'ga4-tracking-spec', rating: 4 }, when: 'A rating is submitted.' },
      { name: 'content_like', type: 'custom', params: { content_type: 'article', content_id: 'ga4-tracking-spec' }, when: 'Liked. Send content_unlike when removed.' },
      { name: 'content_save', type: 'custom', params: { content_type: 'article', content_id: 'ga4-tracking-spec' }, when: 'Saved for later. Products use add_to_wishlist instead.' },
      { name: 'join_group', type: 'recommended', params: { group_id: 'analytics-engineering' }, when: 'Following a topic, community, or team.' },
    ],
  },

  /* ---------------------------------------------------------- media */
  {
    id: 'video',
    category: 'media',
    component: 'Video player',
    summary: 'Playback on any player: HTML5, YouTube, app, or TV. Same names everywhere so one report covers all.',
    platforms: ['web', 'app', 'tv'],
    ui: 'video',
    events: [
      { name: 'video_start', type: 'enhanced', params: { ...VIDEO, video_current_time: 0, video_percent: 0, visible: true }, when: 'Playback starts.' },
      {
        name: 'video_progress',
        type: 'enhanced',
        params: { ...VIDEO, video_current_time: 30, video_percent: 25, visible: true },
        when: 'At 10, 25, 50, and 75 percent, once each.',
      },
      { name: 'video_complete', type: 'enhanced', params: { ...VIDEO, video_current_time: 120, video_percent: 100, visible: true }, when: 'The end is reached.' },
      { name: 'video_pause', type: 'custom', params: { ...VIDEO, video_current_time: 41, video_percent: 34 }, when: 'The viewer pauses.' },
      { name: 'video_seek', type: 'custom', params: { ...VIDEO, video_seek_from: 41, video_seek_to: 88 }, when: 'The viewer scrubs to a new position.' },
      { name: 'video_error', type: 'custom', params: { ...VIDEO, error_code: 'MEDIA_ERR_NETWORK', video_current_time: 41 }, when: 'Playback fails.' },
    ],
    notes: [
      'Enhanced measurement only covers embedded YouTube players with the JS API enabled. For every other player, send these events yourself with the same names and parameters.',
      'Do not send a heartbeat every few seconds. Percent milestones answer "how much was watched" at a fraction of the volume.',
      'The Mock Player in Analytics > Tools covers the full media spec: ads, quality, buffering, live streams, and six vendors.',
    ],
  },
  {
    id: 'audio',
    category: 'media',
    component: 'Audio and podcasts',
    summary: 'Audio playback. Mirrors the video events with an audio_ prefix.',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Play episode', event: 'audio_start', params: { audio_title: 'Episode 12: Consent Mode', audio_duration: 1860, audio_percent: 0 } },
      { label: '50% listened', event: 'audio_progress', params: { audio_title: 'Episode 12: Consent Mode', audio_duration: 1860, audio_percent: 50 } },
      { label: 'Finish episode', event: 'audio_complete', params: { audio_title: 'Episode 12: Consent Mode', audio_duration: 1860, audio_percent: 100 } },
    ],
    events: [
      { name: 'audio_start', type: 'custom', params: { audio_title: 'Episode 12: Consent Mode', audio_duration: 1860, audio_percent: 0 }, when: 'Playback starts.' },
      { name: 'audio_progress', type: 'custom', params: { audio_title: 'Episode 12: Consent Mode', audio_duration: 1860, audio_percent: 50 }, when: 'At 10, 25, 50, and 75 percent.' },
      { name: 'audio_complete', type: 'custom', params: { audio_title: 'Episode 12: Consent Mode', audio_duration: 1860, audio_percent: 100 }, when: 'The end is reached.' },
    ],
  },

  /* ---------------------------------------------------------- commerce */
  {
    id: 'store',
    category: 'commerce',
    component: 'Product list to purchase',
    summary: 'The full ecommerce funnel. Every event carries an items array with the same item fields.',
    platforms: ['web', 'app', 'tv'],
    ui: 'store',
    events: [
      { name: 'view_item_list', type: 'recommended', params: { ...LIST, items: listed }, when: 'A product list is shown.' },
      { name: 'select_item', type: 'recommended', params: { ...LIST, items: [listed[0]] }, when: 'A product in a list is selected.' },
      { name: 'view_item', type: 'recommended', params: { currency: 'USD', value: 129, items: one }, when: 'A product detail page or screen is shown.' },
      { name: 'add_to_wishlist', type: 'recommended', params: { currency: 'USD', value: 129, items: one }, when: 'Saved to a wishlist.' },
      { name: 'add_to_cart', type: 'recommended', params: { currency: 'USD', value: 129, items: one }, when: 'Added to the cart.' },
      { name: 'remove_from_cart', type: 'recommended', params: { currency: 'USD', value: 129, items: one }, when: 'Removed from the cart.' },
      { name: 'view_cart', type: 'recommended', params: { currency: 'USD', value: 129, items: one }, when: 'The cart is opened.' },
      { name: 'begin_checkout', type: 'recommended', params: { currency: 'USD', value: 129, coupon: 'SPRING25', items: one }, when: 'Checkout starts.' },
      { name: 'add_shipping_info', type: 'recommended', params: { currency: 'USD', value: 129, shipping_tier: 'ground', items: one }, when: 'A shipping option is submitted.' },
      { name: 'add_payment_info', type: 'recommended', params: { currency: 'USD', value: 129, payment_type: 'credit_card', items: one }, when: 'Payment details are submitted.' },
      {
        name: 'purchase',
        type: 'recommended',
        params: { transaction_id: 'T_20261006_0042', currency: 'USD', value: 129, tax: 10.32, shipping: 0, coupon: 'SPRING25', items: one },
        when: 'The order is confirmed. Once per order.',
        key: true,
      },
      { name: 'refund', type: 'recommended', params: { transaction_id: 'T_20261006_0042', currency: 'USD', value: 129 }, when: 'An order is refunded. Usually sent from the server.' },
    ],
    notes: [
      'value is revenue excluding tax and shipping, and it needs currency. Without currency, GA4 drops the revenue.',
      'transaction_id deduplicates purchases. Reloading the confirmation page must not send a second purchase.',
      'Each item needs item_id or item_name. Keep item fields identical across all events so funnels join.',
      'Clear the previous ecommerce object in the dataLayer ({ ecommerce: null }) before each GTM ecommerce push.',
    ],
  },

  /* ---------------------------------------------------------- tv */
  {
    id: 'tv-rows',
    category: 'tv',
    component: 'TV home rows and remote control',
    summary: 'Browsing rows of titles with a D-pad. Focus moves on every key press; only selections are tracked.',
    platforms: ['tv'],
    ui: 'tv',
    events: [
      {
        name: 'select_content',
        type: 'recommended',
        params: { content_type: 'episode', content_id: 'show_42_s1e3', item_list_name: 'Continue watching', index: 2 },
        when: 'A title is selected with OK or Enter.',
      },
      { name: 'screen_view', type: 'automatic', params: { screen_name: 'Title details', screen_class: 'DetailsScreen' }, when: 'The details screen opens.' },
    ],
    notes: [
      'Never send focus changes. A ten-minute browse can produce hundreds, and they say nothing about intent.',
      'Most TV platforms have no GA4 SDK. Send these events from the app over the Measurement Protocol with a client_id you generate once and store on the device.',
    ],
  },
  {
    id: 'subscription',
    category: 'tv',
    component: 'Paywall, trial, and subscription',
    summary: 'Gated content and the subscription lifecycle.',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Hit paywall', event: 'paywall_view', params: { paywall_type: 'metered', content_id: 'show_42_s1e3' } },
      { label: 'Start 7-day trial', event: 'trial_start', params: { plan_id: 'plus_monthly', trial_days: 7 } },
      {
        label: 'Subscribe',
        event: 'purchase',
        params: {
          transaction_id: 'SUB_88214',
          currency: 'USD',
          value: 9.99,
          items: [{ item_id: 'plus_monthly', item_name: 'Plus, monthly', item_category: 'subscription', price: 9.99, quantity: 1 }],
        },
      },
      { label: 'Cancel', event: 'subscription_cancel', params: { plan_id: 'plus_monthly', cancel_reason: 'too_expensive' } },
    ],
    events: [
      { name: 'paywall_view', type: 'custom', params: { paywall_type: 'metered', content_id: 'show_42_s1e3' }, when: 'A paywall or registration wall is shown.' },
      { name: 'trial_start', type: 'custom', params: { plan_id: 'plus_monthly', trial_days: 7 }, when: 'A free trial begins.', key: true },
      {
        name: 'purchase',
        type: 'recommended',
        params: { transaction_id: 'SUB_88214', currency: 'USD', value: 9.99, items: [{ item_id: 'plus_monthly', item_name: 'Plus, monthly', item_category: 'subscription', price: 9.99, quantity: 1 }] },
        when: 'The first paid charge succeeds.',
        key: true,
      },
      { name: 'subscription_cancel', type: 'custom', params: { plan_id: 'plus_monthly', cancel_reason: 'too_expensive' }, when: 'The user cancels.' },
    ],
    notes: [
      'Renewals happen with nobody on the page. Send them from your billing system over the Measurement Protocol with the subscriber\'s client_id and user_id.',
      'App store purchases are logged automatically as in_app_purchase once the store account is linked.',
    ],
  },
  {
    id: 'cast',
    category: 'tv',
    component: 'Casting and AirPlay',
    summary: 'Sending playback from a phone or browser to a TV.',
    platforms: ['web', 'app'],
    ui: 'buttons',
    buttons: [
      { label: 'Cast to TV', event: 'cast_start', params: { cast_protocol: 'chromecast', content_id: 'product-tour' } },
      { label: 'Stop casting', event: 'cast_end', params: { cast_protocol: 'chromecast', content_id: 'product-tour' } },
    ],
    events: [
      { name: 'cast_start', type: 'custom', params: { cast_protocol: 'chromecast', content_id: 'product-tour' }, when: 'A session connects. cast_protocol: chromecast or airplay.' },
      { name: 'cast_end', type: 'custom', params: { cast_protocol: 'chromecast', content_id: 'product-tour' }, when: 'The session ends.' },
    ],
    notes: ['While casting, playback events still come from the sender (phone or browser); add a casting: true parameter to them.'],
  },

  /* ---------------------------------------------------------- app */
  {
    id: 'app-auto',
    category: 'app',
    component: 'Automatically collected app events',
    summary: 'Logged by the Firebase SDK with no code. Shown here so you know not to send them yourself.',
    platforms: ['app'],
    ui: 'buttons',
    buttons: [
      { label: 'first_open', event: 'first_open' },
      { label: 'session_start', event: 'session_start' },
      { label: 'user_engagement', event: 'user_engagement' },
      { label: 'app_update', event: 'app_update', params: { previous_app_version: '4.11.0' } },
      { label: 'notification_open', event: 'notification_open', params: { message_name: 'weekly_digest' } },
      { label: 'in_app_purchase', event: 'in_app_purchase', params: { product_id: 'plus_monthly', price: 9.99, currency: 'USD', quantity: 1 } },
    ],
    events: [
      { name: 'first_open', type: 'automatic', params: {}, when: 'First launch after install (or reinstall).' },
      { name: 'session_start', type: 'automatic', params: {}, when: 'The app is opened after 30 minutes or more in the background.' },
      { name: 'user_engagement', type: 'automatic', params: {}, when: 'Periodically while the app is in the foreground.' },
      { name: 'app_update', type: 'automatic', params: { previous_app_version: '4.11.0' }, when: 'First launch after an update.' },
      { name: 'notification_open', type: 'automatic', params: { message_name: 'weekly_digest' }, when: 'A Firebase Cloud Messaging notification is opened.' },
      { name: 'in_app_purchase', type: 'automatic', params: { product_id: 'plus_monthly', price: 9.99, currency: 'USD', quantity: 1 }, when: 'An App Store or Google Play purchase completes.' },
    ],
    notes: ['These names are reserved. Sending them manually is either rejected or double-counted.'],
  },
  {
    id: 'push-permission',
    category: 'app',
    component: 'Push notification permission',
    summary: 'The operating system permission prompt.',
    platforms: ['web', 'app'],
    ui: 'buttons',
    buttons: [
      { label: 'Allow', event: 'notification_permission', params: { permission_status: 'granted', prompt_type: 'system' } },
      { label: "Don't allow", event: 'notification_permission', params: { permission_status: 'denied', prompt_type: 'system' } },
    ],
    events: [
      {
        name: 'notification_permission',
        type: 'custom',
        params: { permission_status: 'granted', prompt_type: 'system' },
        when: 'The user answers the prompt. prompt_type: pre_permission (your own screen) or system.',
      },
    ],
    notes: ['Also store the answer as a user property (push_enabled) so audiences can use it.'],
  },

  /* ---------------------------------------------------------- quality */
  {
    id: 'error',
    category: 'quality',
    component: 'Errors',
    summary: 'Handled errors and failed requests that the user notices.',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Handled error', event: 'exception', params: { description: 'TypeError: cart is undefined (checkout.js:88)', fatal: false } },
      { label: 'Fatal error', event: 'exception', params: { description: 'ChunkLoadError: checkout bundle failed', fatal: true } },
    ],
    events: [
      { name: 'exception', type: 'recommended', params: { description: 'TypeError: cart is undefined (checkout.js:88)', fatal: false }, when: 'An error is caught.' },
    ],
    notes: [
      'Keep description under 100 characters and free of user data; error messages often contain emails or IDs.',
      'Apps report crashes through Crashlytics (app_exception); do not send them again.',
    ],
  },
  {
    id: 'web-vitals',
    category: 'quality',
    component: 'Core Web Vitals',
    summary: 'Real-user loading, responsiveness, and layout stability.',
    platforms: ['web'],
    ui: 'vitals',
    events: [
      {
        name: 'web_vitals',
        type: 'custom',
        params: { metric_name: 'LCP', metric_value: 1840, metric_rating: 'good', metric_id: 'v4-1728201600000-123' },
        when: 'When the web-vitals library reports a metric (usually on page hide).',
      },
    ],
    notes: [
      "Google's web-vitals example names the event after the metric (LCP, INP, CLS). A single web_vitals event with metric_name keeps them in one report; either works if you are consistent.",
      'Report metric_value as a number (milliseconds; CLS is unitless) and register it as a custom metric.',
    ],
  },
  {
    id: 'experiment',
    category: 'quality',
    component: 'A/B test exposure',
    summary: 'Which variant of an experiment a user saw.',
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Show variant A', event: 'experiment_view', params: { experiment_id: 'pricing_2026_10', variant_id: 'a' } },
      { label: 'Show variant B', event: 'experiment_view', params: { experiment_id: 'pricing_2026_10', variant_id: 'b' } },
    ],
    events: [
      {
        name: 'experiment_view',
        type: 'custom',
        params: { experiment_id: 'pricing_2026_10', variant_id: 'b' },
        when: 'The variant is actually rendered, not when the user is assigned.',
      },
    ],
    notes: ['Firebase A/B Testing and most testing tools can send this for you; check before adding your own.'],
  },

  /* ---------------------------------------------------------- games */
  {
    id: 'games',
    category: 'games',
    component: 'Game progress and currency',
    summary: "Google's recommended events for games, used as-is.",
    platforms: ['web', 'app', 'tv'],
    ui: 'buttons',
    buttons: [
      { label: 'Start level', event: 'level_start', params: { level_name: 'Canyon 3' } },
      { label: 'Finish level', event: 'level_end', params: { level_name: 'Canyon 3', success: true } },
      { label: 'Level up', event: 'level_up', params: { level: 4, character: 'scout' } },
      { label: 'Post score', event: 'post_score', params: { score: 18450, level: 3, character: 'scout' } },
      { label: 'Unlock achievement', event: 'unlock_achievement', params: { achievement_id: 'first_win' } },
      { label: 'Earn coins', event: 'earn_virtual_currency', params: { virtual_currency_name: 'coins', value: 200 } },
      { label: 'Spend coins', event: 'spend_virtual_currency', params: { virtual_currency_name: 'coins', value: 150, item_name: 'speed_boost' } },
    ],
    events: [
      { name: 'level_start', type: 'recommended', params: { level_name: 'Canyon 3' }, when: 'A level begins.' },
      { name: 'level_end', type: 'recommended', params: { level_name: 'Canyon 3', success: true }, when: 'A level ends, won or lost.' },
      { name: 'level_up', type: 'recommended', params: { level: 4, character: 'scout' }, when: 'The player levels up.' },
      { name: 'post_score', type: 'recommended', params: { score: 18450, level: 3, character: 'scout' }, when: 'A score is recorded.' },
      { name: 'unlock_achievement', type: 'recommended', params: { achievement_id: 'first_win' }, when: 'An achievement unlocks.' },
      { name: 'earn_virtual_currency', type: 'recommended', params: { virtual_currency_name: 'coins', value: 200 }, when: 'Currency is earned.' },
      { name: 'spend_virtual_currency', type: 'recommended', params: { virtual_currency_name: 'coins', value: 150, item_name: 'speed_boost' }, when: 'Currency is spent.' },
    ],
  },
];

/** Plain-language definitions for every parameter used in the spec. */
export const PARAM_DOCS: Record<string, string> = {
  page_location: 'Full URL including query string. Max 1,000 characters.',
  page_title: 'Document title. Max 300 characters.',
  page_referrer: 'Previous URL. Max 420 characters.',
  screen_name: 'Readable screen name you choose (Settings, Player).',
  screen_class: 'Class or component that rendered the screen.',
  percent_scrolled: 'Scroll depth threshold reached, as a number.',
  link_text: 'Visible text of the link or menu item.',
  link_url: 'Destination URL or path.',
  link_domain: 'Destination domain (outbound links).',
  link_classes: 'CSS classes on the link element.',
  link_id: 'id attribute of the link element.',
  outbound: 'true when the link leaves your configured domains.',
  nav_location: 'Which menu: header, footer, breadcrumb, sidebar, tab_bar, side_menu.',
  content_type: 'Kind of thing selected: article, video, episode, tab, faq.',
  content_id: 'Stable ID of the content. Not the title, which can change.',
  carousel_name: 'Which carousel.',
  slide_index: 'Zero-based slide position.',
  slide_name: 'Slide label.',
  method: 'How it happened: email, google, copy_link, arrow, swipe.',
  search_term: 'What was searched, lowercased and trimmed.',
  list_name: 'Which list was refined.',
  filter_name: 'Filter dimension (size, color, genre).',
  filter_value: 'Value chosen.',
  sort_by: 'Sort order chosen.',
  page_number: 'Page of results now loaded.',
  form_id: 'id attribute of the form.',
  form_name: 'name attribute or a readable label.',
  form_destination: 'Where the form posts.',
  form_submit_text: 'Text of the submit button.',
  field_name: 'Field that failed validation.',
  error_type: 'Validation rule that failed (required, invalid_format).',
  currency: 'ISO 4217 code (USD, EUR). Required whenever value is sent.',
  value: 'Monetary value of the event, excluding tax and shipping.',
  lead_source: 'Where the lead came from.',
  upload_context: 'What the file was for.',
  file_extension: 'Extension without the dot.',
  file_size_kb: 'Size in kilobytes.',
  file_name: 'Path of the downloaded file.',
  promotion_id: 'Internal promotion ID.',
  promotion_name: 'Readable promotion name.',
  creative_name: 'Which creative version.',
  creative_slot: 'Where it was placed.',
  cta_text: 'Button label, in one language.',
  cta_location: 'Where on the page or screen.',
  modal_name: 'Which dialog.',
  close_method: 'button, escape, backdrop, or action.',
  item_id: 'ID of the shared item.',
  rating: 'Number given (1 to 5).',
  group_id: 'ID of the group or topic.',
  video_provider: 'Player or platform (youtube, html5, roku).',
  video_title: 'Title of the video.',
  video_url: 'Source or page URL.',
  video_duration: 'Length in seconds.',
  video_current_time: 'Playhead position in seconds.',
  video_percent: 'Percent watched milestone.',
  visible: 'Whether the player was on screen.',
  video_seek_from: 'Position before the seek, in seconds.',
  video_seek_to: 'Position after the seek, in seconds.',
  error_code: 'Player or platform error code.',
  audio_title: 'Episode or track title.',
  audio_duration: 'Length in seconds.',
  audio_percent: 'Percent listened milestone.',
  item_list_id: 'ID of the product list.',
  item_list_name: 'Readable name of the list or row.',
  items: 'Array of products. Each needs item_id or item_name; up to 200 per event.',
  coupon: 'Coupon code applied to the order.',
  shipping_tier: 'Shipping option chosen.',
  payment_type: 'Payment method chosen.',
  transaction_id: 'Unique order ID. Deduplicates purchases.',
  tax: 'Tax amount.',
  shipping: 'Shipping cost.',
  index: 'Position in the list or row, zero-based.',
  paywall_type: 'metered, hard, or registration.',
  plan_id: 'Subscription plan.',
  trial_days: 'Length of the trial.',
  cancel_reason: 'Reason chosen from a fixed list.',
  cast_protocol: 'chromecast or airplay.',
  previous_app_version: 'Version before the update.',
  message_name: 'Campaign name of the notification.',
  product_id: 'Store product ID.',
  price: 'Unit price.',
  quantity: 'Number of units.',
  permission_status: 'granted or denied.',
  prompt_type: 'pre_permission or system.',
  description: 'Short error description, no user data.',
  fatal: 'true if the app or page could not continue.',
  metric_name: 'LCP, INP, CLS, FCP, or TTFB.',
  metric_value: 'Metric value (ms, or unitless for CLS).',
  metric_rating: 'good, needs-improvement, or poor.',
  metric_id: 'Unique ID per page load, from web-vitals.',
  experiment_id: 'Experiment key.',
  variant_id: 'Variant shown.',
  level_name: 'Level name.',
  success: 'Whether the level was completed.',
  level: 'Level number.',
  character: 'Character used.',
  score: 'Score value.',
  achievement_id: 'Achievement ID.',
  virtual_currency_name: 'Currency name.',
  item_name: 'Name of the item.',
};

/** Things a good spec says not to send. */
export const DO_NOT_TRACK = [
  ['Personal data', 'Emails, names, phone numbers, street addresses, and free-text field values. Sending them breaks Google\'s terms and can force deletion of the property\'s data. This includes URLs that contain them.'],
  ['Hover and pointer movement', 'Mouse moves, hovers, and tooltips showing. High volume, no intent.'],
  ['Focus and keystrokes', 'Every key press, and every D-pad focus change on TV. Track the selection instead.'],
  ['Automatic motion', 'Carousel autoplay, autoplaying previews, and timed rotations. Only user actions.'],
  ['Heartbeats', 'An event every few seconds of playback. Use percent milestones.'],
  ['The same event twice', 'An action already covered by enhanced measurement, sent again from GTM or code.'],
  ['Unique values as dimensions', 'Timestamps, session IDs, or order IDs in parameters you report on. They create millions of rows that GA4 collapses into "(other)". BigQuery is the place for row-level IDs.'],
] as const;

/** Every distinct event in the spec, for the reference table. */
export function allEvents() {
  const map = new Map<string, { name: string; type: EventType; params: Set<string>; components: string[]; key: boolean }>();
  for (const entry of SPEC) {
    for (const ev of entry.events) {
      if (ev.type === 'command') continue;
      const row = map.get(ev.name) ?? { name: ev.name, type: ev.type, params: new Set<string>(), components: [], key: false };
      Object.keys(ev.params).forEach((p) => row.params.add(p));
      if (!row.components.includes(entry.component)) row.components.push(entry.component);
      row.key ||= !!ev.key;
      // An event that is automatic or enhanced anywhere is listed under that type.
      const rank: EventType[] = ['automatic', 'enhanced', 'recommended', 'custom', 'command'];
      if (rank.indexOf(ev.type) < rank.indexOf(row.type)) row.type = ev.type;
      map.set(ev.name, row);
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
