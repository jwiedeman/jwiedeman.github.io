/**
 * Destination mappers: one canonical event -> what each vendor library is
 * called with, and the HTTP request that library would send.
 *
 * Nothing here is sent: the trainer shows the requests so you can see the
 * exact shape of each hit. (Load your own GTM container to fire real tags.)
 *
 * Consent is applied per vendor, the way production setups behave:
 *  - GTM always receives the dataLayer push (consent travels with it).
 *  - GA4 drops to Consent Mode cookieless pings when analytics is denied.
 *  - Adobe, Segment, and Tealium are blocked when analytics is denied.
 */
import type { CanonicalEvent } from './events';

export interface Req {
  method: 'GET' | 'POST';
  url: string;
  body?: unknown;
}

export interface Mapped {
  /** The library call a developer would write. */
  call: string;
  payload: unknown;
  request?: Req | null;
  note?: string;
  /** Set when consent (or policy) prevents the call. */
  blocked?: string;
}

export interface Destination {
  id: string;
  label: string;
  vendor: string;
  map: (e: CanonicalEvent) => Mapped | null;
}

/* Demo account identifiers, shown in request URLs. */
export const DEMO_IDS = {
  ga4: 'G-JFWDEMO001',
  adobeRsid: 'jfwdemoprod',
  adobeTrackingServer: 'jfwdemo.sc.omtrdc.net',
  adobeDatastream: '00000000-0000-0000-0000-00000demo01',
  segmentWriteKey: 'DEMO_WRITE_KEY_NOT_REAL',
  tealium: { account: 'jfw-demo', profile: 'video', datasource: 'demo01' },
};

const enc = encodeURIComponent;
const qs = (params: Record<string, unknown>) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${enc(String(v))}`)
    .join('&');
const clean = <T extends Record<string, unknown>>(o: T) => {
  for (const k of Object.keys(o)) if (o[k] === undefined || o[k] === null) delete o[k];
  return o;
};
const analyticsOk = (e: CanonicalEvent) => e.context.user.consent?.analytics === true;
const BLOCKED = 'Blocked: analytics consent not granted';
const round = (n: number) => Math.round(n);

/* ------------------------------------------------------------------ */
/* GTM / dataLayer                                                     */
/* ------------------------------------------------------------------ */

export const gtmDestination: Destination = {
  id: 'gtm',
  label: 'GTM',
  vendor: 'Google Tag Manager',
  map: (e) => {
    const payload = {
      event: `mockplayer.${e.event}`,
      mockplayer: { event: e.event, category: e.category, seq: e.seq, sessionId: e.sessionId, params: e.params, content: e.content, ad: e.ad, player: e.player, qoe: e.qoe },
      user: { anonymous_id: e.context.user.anonymousId, user_id: e.context.user.userId, login_status: e.context.user.loggedIn ? 'logged_in' : 'anonymous', tier: e.context.user.tier, ab_variant: e.context.user.experiment.variant },
      consent: e.context.user.consent,
      page: { path: e.context.page.path, title: e.context.page.title, campaign: e.context.page.campaign },
    };
    return {
      call: `dataLayer.push({ event: '${payload.event}', … })`,
      payload,
      request: null,
      note: 'GTM evaluates triggers on this push; the tags it fires make their own requests.',
    };
  },
};

/* ------------------------------------------------------------------ */
/* GA4 (gtag.js)                                                       */
/* ------------------------------------------------------------------ */

const GA4_NAMES: Record<string, string> = {
  page_view: 'page_view',
  campaign_arrival: 'page_view',
  identity_reset: 'first_visit',
  playback_started: 'video_start',
  milestone: 'video_progress',
  content_completed: 'video_complete',
  play: 'video_resume',
  pause: 'video_pause',
  seek_complete: 'video_seek',
  buffer_start: 'video_buffer_start',
  buffer_end: 'video_buffer_end',
  bitrate_change: 'video_quality_change',
  ad_break_start: 'video_ad_break_start',
  ad_start: 'video_ad_start',
  ad_quartile: 'video_ad_progress',
  ad_skip: 'video_ad_skip',
  ad_click: 'video_ad_click',
  ad_complete: 'video_ad_complete',
  ad_break_end: 'video_ad_break_end',
  overlay_ad_impression: 'video_overlay_ad_view',
  overlay_ad_click: 'video_overlay_ad_click',
  companion_impression: 'video_companion_view',
  companion_click: 'video_companion_click',
  pause_ad_impression: 'video_pause_ad_view',
  pause_ad_click: 'video_pause_ad_click',
  chapter_start: 'video_chapter_start',
  chapter_complete: 'video_chapter_complete',
  chapter_skip: 'video_chapter_skip',
  skip_intro: 'video_skip_intro',
  cta_impression: 'video_cta_view',
  cta_click: 'video_cta_click',
  endcard_impression: 'video_endcard_view',
  endcard_click: 'video_endcard_click',
  subscribe_click: 'video_subscribe_click',
  resume_accept: 'video_resume_from_saved',
  share: 'share',
  like: 'video_like',
  cast_start: 'video_cast_start',
  cast_end: 'video_cast_end',
  slate_start: 'video_slate_start',
  gate_shown: 'video_gate_view',
  gate_passed: 'video_gate_pass',
  gate_failed: 'video_gate_fail',
  gate_dismissed: 'video_gate_dismiss',
  sign_in: 'login',
  fullscreen_enter: 'video_fullscreen',
  pip_enter: 'video_pip',
  captions_on: 'video_captions',
  captions_off: 'video_captions',
  mute: 'video_mute',
  unmute: 'video_mute',
  rate_change: 'video_rate_change',
  error: 'video_error',
  session_end: 'video_session_end',
};

let ga4HitSeq = 0;

function ga4Params(e: CanonicalEvent): Record<string, unknown> {
  const c = e.content;
  const p: Record<string, unknown> = {};
  if (c && e.event !== 'page_view' && e.event !== 'campaign_arrival') {
    Object.assign(p, {
      video_provider: 'mock_player',
      video_title: c.title,
      video_url: `${e.context.page.url.split('?')[0]}#${c.id}`,
      video_duration: round(c.duration),
      video_current_time: round(c.position),
      video_percent: round(c.percent),
      stream_type: c.streamType,
      form_factor: e.player.formFactor,
    });
  }
  const P = e.params;
  switch (e.event) {
    case 'milestone':
      p.video_percent = P.percent;
      break;
    case 'seek_complete':
      Object.assign(p, { seek_from: round(Number(P.from)), seek_to: round(Number(P.to)) });
      break;
    case 'buffer_end':
      p.buffer_ms = P.durationMs;
      break;
    case 'bitrate_change':
      Object.assign(p, { video_quality: P.to, video_bitrate_kbps: P.bitrateKbps, quality_reason: P.reason });
      break;
    case 'captions_on':
    case 'captions_off':
      p.captions_enabled = e.event === 'captions_on';
      break;
    case 'mute':
    case 'unmute':
      p.muted = e.event === 'mute';
      break;
    case 'rate_change':
      p.playback_rate = P.to;
      break;
    case 'error':
      Object.assign(p, { error_code: P.code, error_type: P.type, fatal: P.fatal });
      break;
    case 'share':
      Object.assign(p, { method: P.method, content_type: 'video', item_id: c?.id });
      break;
    case 'sign_in':
      p.method = P.method;
      break;
    case 'chapter_start':
    case 'chapter_complete':
    case 'chapter_skip':
      Object.assign(p, { chapter_name: P.chapterName, chapter_index: P.chapterIndex });
      break;
    case 'cta_impression':
    case 'cta_click':
      Object.assign(p, { cta_id: P.ctaId, cta_text: P.label });
      break;
    case 'endcard_impression':
    case 'endcard_click':
      Object.assign(p, { ab_variant: P.variant, endcard_slot: P.slot, recommended_id: P.target });
      break;
    case 'gate_shown':
    case 'gate_passed':
    case 'gate_failed':
    case 'gate_dismissed':
      p.gate_type = P.type;
      break;
    case 'slate_start':
      p.slate_type = P.type;
      break;
    case 'session_end':
      Object.assign(p, { time_played_s: round(e.qoe.timePlayedSeconds), rebuffer_count: e.qoe.rebufferCount, startup_ms: e.qoe.startupMs });
      break;
  }
  if (e.ad) Object.assign(p, { ad_id: e.ad.adId, ad_break_type: e.ad.breakType, ad_type: e.ad.adType, ad_insertion: e.ad.insertion, ad_pod_position: e.ad.podIndex });
  if (e.event === 'ad_quartile') p.ad_percent = P.quartile;
  for (const k of Object.keys(p)) if (p[k] === undefined || p[k] === null) delete p[k];
  return p;
}

export const ga4Destination: Destination = {
  id: 'ga4',
  label: 'GA4',
  vendor: 'Google Analytics 4',
  map: (e) => {
    const u = e.context.user;
    const pg = e.context.page;
    const consentGranted = analyticsOk(e);
    const gcs = `G1${u.consent.advertising ? 1 : 0}${consentGranted ? 1 : 0}`;

    if (e.event === 'consent_update') {
      const update = {
        analytics_storage: P(e, 'analytics') ? 'granted' : 'denied',
        ad_storage: P(e, 'advertising') ? 'granted' : 'denied',
        ad_user_data: P(e, 'advertising') ? 'granted' : 'denied',
        ad_personalization: P(e, 'personalization') ? 'granted' : 'denied',
      };
      return { call: `gtag('consent', 'update', {…})`, payload: update, request: null, note: 'Consent Mode v2 update; later hits carry the new gcs value.' };
    }

    const name = GA4_NAMES[e.event];
    if (!name) return null;
    const params = ga4Params(e);
    const numeric = (v: unknown) => typeof v === 'number';
    const evParams: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) evParams[`${numeric(v) ? 'epn' : 'ep'}.${k}`] = typeof v === 'boolean' ? String(v) : v;
    ga4HitSeq += 1;
    const query = qs({
      v: 2,
      tid: DEMO_IDS.ga4,
      gtm: '45je6a10v9100000000za200',
      _p: pg.pageViewId.replace(/\D/g, '').slice(0, 10) || '1',
      gcs,
      gcd: consentGranted ? '13r3r3r3r5' : '13p3p3p2p5',
      npa: u.consent.advertising ? undefined : 1,
      // Consent Mode advanced: no client_id is stored or sent when analytics is denied.
      cid: consentGranted ? u.gaClientId : undefined,
      ul: pg.language.toLowerCase(),
      sr: pg.screen,
      uid: consentGranted ? u.userId ?? undefined : undefined,
      _s: ga4HitSeq,
      sid: u.analyticsSessionId,
      sct: u.sessionNumber,
      seg: 1,
      dl: pg.url,
      dr: pg.referrer || undefined,
      dt: pg.title,
      en: name,
      'up.login_status': u.loggedIn ? 'logged_in' : 'anonymous',
      'up.subscription_tier': u.tier,
      'up.ab_endcard': u.experiment.variant,
      ...evParams,
    });
    const call = e.event === 'sign_in' ? `gtag('config', '${DEMO_IDS.ga4}', { user_id: '${u.userId}' }); gtag('event', 'login', {…})` : `gtag('event', '${name}', {…})`;
    return {
      call,
      payload: { name, params, user_id: u.userId ?? undefined },
      request: { method: 'POST', url: `https://region1.google-analytics.com/g/collect?${query}` },
      note: consentGranted ? undefined : 'Consent Mode (advanced): cookieless ping, no client_id, no user_id.',
    };
  },
};

function P(e: CanonicalEvent, k: string) {
  return e.params[k] === true;
}

/* ------------------------------------------------------------------ */
/* Adobe Analytics (AppMeasurement s.tl / s.t) — sample solution design */
/* ------------------------------------------------------------------ */

/** Sample SDR: which success event each canonical event sets. */
const AA_EVENTS: Record<string, (e: CanonicalEvent) => string | null> = {
  page_view: () => '',
  campaign_arrival: () => '',
  playback_started: () => 'event1',
  milestone: (e) => ({ 25: 'event2', 50: 'event3', 75: 'event4' } as Record<number, string>)[Number(e.params.percent)] ?? null,
  content_completed: () => 'event5',
  heartbeat: () => 'event6=10',
  ad_start: () => 'event10',
  ad_complete: () => 'event11',
  ad_skip: () => 'event12',
  ad_click: () => 'event13',
  overlay_ad_click: () => 'event14',
  companion_click: () => 'event15',
  buffer_start: () => 'event20',
  bitrate_change: () => 'event21',
  error: () => 'event30',
  chapter_start: () => 'event40',
  cta_click: () => 'event50',
  endcard_click: () => 'event51',
  subscribe_click: () => 'event52',
  share: () => 'event53',
  like: () => 'event54',
  sign_in: () => 'event60',
  gate_shown: () => 'event61',
  gate_passed: () => 'event62',
};

const aaTimestamp = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} ${d.getDay()} ${d.getTimezoneOffset()}`;
};

export const adobeAnalyticsDestination: Destination = {
  id: 'adobe_aa',
  label: 'Adobe Analytics',
  vendor: 'Adobe Analytics (AppMeasurement)',
  map: (e) => {
    const rule = AA_EVENTS[e.event];
    if (!rule) return null;
    const events = rule(e);
    if (events === null) return null;
    const pageHit = e.event === 'page_view' || e.event === 'campaign_arrival';
    const u = e.context.user;
    const pg = e.context.page;
    const c = e.content;
    const vars: Record<string, unknown> = clean({
      pageName: 'lab:analytics:tools:mock player',
      channel: 'lab',
      campaign: pg.campaign ? `${pg.campaign.source}:${pg.campaign.medium}:${pg.campaign.name}` : undefined,
      eVar1: c?.title,
      eVar2: c?.id,
      eVar3: e.player.name,
      eVar4: c?.streamType,
      eVar5: e.player.formFactor,
      eVar10: e.ad?.adId,
      eVar11: e.ad ? `${e.ad.adType}|${e.ad.insertion}` : undefined,
      eVar21: e.event === 'bitrate_change' ? String(e.params.to) : undefined,
      eVar30: e.event === 'error' ? String(e.params.code) : undefined,
      eVar40: e.event === 'chapter_start' ? String(e.params.chapterName) : undefined,
      eVar50: e.event === 'cta_click' ? String(e.params.ctaId) : undefined,
      eVar60: u.loggedIn ? 'logged in' : 'anonymous',
      eVar61: e.event.startsWith('gate_') ? String(e.params.type) : undefined,
      eVar70: u.experiment.variant,
      eVar80: u.userId ?? undefined,
      prop1: e.event,
      events: events || undefined,
    });
    const linkName = `video:${e.event.replace(/_/g, ' ')}`;
    const call = pageHit
      ? `s.pageName = '${vars.pageName}'; s.t();`
      : `s.linkTrackVars = '${Object.keys(vars).filter((k) => k !== 'pageName').join(',')}'; s.linkTrackEvents = '${String(events).split('=')[0]}'; s.tl(true, 'o', '${linkName}');`;
    if (!analyticsOk(e)) return { call, payload: vars, request: null, blocked: BLOCKED };
    const map: Record<string, string> = { campaign: 'v0', pageName: 'pageName', channel: 'ch', events: 'events' };
    const params: Record<string, unknown> = {
      AQB: 1,
      ndh: 1,
      pf: 1,
      t: aaTimestamp(e.timestamp),
      mid: e.context.user.ecid,
      aamlh: 9,
      ce: 'UTF-8',
      g: pg.url,
      r: pg.referrer || undefined,
      cc: 'USD',
    };
    for (const [k, v] of Object.entries(vars)) {
      const key = map[k] ?? (k.startsWith('eVar') ? `v${k.slice(4)}` : k.startsWith('prop') ? `c${k.slice(4)}` : k);
      params[key] = v;
    }
    if (!pageHit) Object.assign(params, { pe: 'lnk_o', pev2: linkName });
    Object.assign(params, { s: pg.screen, c: pg.colorDepth, j: '1.6', v: 'N', k: 'Y', bw: pg.viewport.split('x')[0], bh: pg.viewport.split('x')[1], AQE: 1 });
    return {
      call,
      payload: vars,
      request: { method: 'GET', url: `https://${DEMO_IDS.adobeTrackingServer}/b/ss/${DEMO_IDS.adobeRsid}/1/JS-2.27.0/s${String(e.seq).padStart(6, '0')}?${qs(params)}` },
      note: 'Sample solution design: eVar1 title, eVar2 id, eVar5 device, event1 start, event2-4 quartiles, event5 complete, event6 seconds watched.',
    };
  },
};

/* ------------------------------------------------------------------ */
/* Adobe Streaming Media via Edge Network (XDM mediaCollection)        */
/* ------------------------------------------------------------------ */

const ADOBE_STATE: Record<string, [string, 'start' | 'end']> = {
  fullscreen_enter: ['fullscreen', 'start'],
  fullscreen_exit: ['fullscreen', 'end'],
  mute: ['mute', 'start'],
  unmute: ['mute', 'end'],
  captions_on: ['closedCaptioning', 'start'],
  captions_off: ['closedCaptioning', 'end'],
  pip_enter: ['pictureInPicture', 'start'],
  pip_exit: ['pictureInPicture', 'end'],
};

export const adobeMediaDestination: Destination = {
  id: 'adobe_media',
  label: 'Adobe Media',
  vendor: 'Adobe Streaming Media (Edge)',
  map: (e) => {
    if (e.event === 'consent_update') {
      const val = P(e, 'analytics') ? 'y' : 'n';
      return { call: `alloy('setConsent', { consent: [{ standard: 'Adobe', version: '2.0', value: { collect: { val: '${val}' } } }] })`, payload: { collect: { val } }, request: null };
    }
    if (!e.content) return null;
    const playhead = Math.floor(e.ad ? e.ad.position : e.content.position);
    let eventType: string | null = null;
    let extra: Record<string, unknown> = {};
    let note: string | undefined;
    const c = e.content;
    switch (e.event) {
      case 'session_start':
        eventType = 'media.sessionStart';
        extra = { sessionDetails: { name: c.id, friendlyName: c.title, length: round(c.duration) || 86400, contentType: c.streamType === 'live' ? 'Live' : 'VOD', streamType: 'video', playerName: e.player.name, channel: 'lab', hasResume: false } };
        break;
      case 'playback_started':
      case 'play':
      case 'buffer_end':
      case 'seek_complete':
      case 'error_recovered':
      case 'slate_end':
        eventType = 'media.play';
        if (e.event === 'playback_started') extra = { qoeDataDetails: { timeToStart: e.qoe.startupMs, bitrate: e.qoe.bitrateKbps } };
        if (e.event === 'seek_complete') note = 'Adobe has no seek event: seeks are a pause then a play.';
        break;
      case 'resume_accept':
        eventType = 'media.play';
        note = 'Resumed sessions set sessionDetails.hasResume = true on sessionStart.';
        break;
      case 'pause':
      case 'seek_start':
      case 'slate_start':
        eventType = 'media.pauseStart';
        break;
      case 'buffer_start':
        eventType = 'media.bufferStart';
        break;
      case 'heartbeat':
        eventType = 'media.ping';
        break;
      case 'bitrate_change':
        eventType = 'media.bitrateChange';
        extra = { qoeDataDetails: { bitrate: e.qoe.bitrateKbps, droppedFrames: e.qoe.droppedFrames } };
        break;
      case 'chapter_start':
        eventType = 'media.chapterStart';
        extra = { chapterDetails: { friendlyName: e.params.chapterName, index: Number(e.params.chapterIndex) + 1, length: e.params.chapterLength, offset: e.params.chapterStart } };
        break;
      case 'chapter_complete':
        eventType = 'media.chapterComplete';
        break;
      case 'chapter_skip':
        eventType = 'media.chapterSkip';
        break;
      case 'ad_break_start':
        eventType = 'media.adBreakStart';
        extra = { advertisingPodDetails: { friendlyName: e.ad?.breakType ?? String(e.params.insertion), index: e.ad?.breakPosition ?? 0, offset: Math.floor(c.position) } };
        break;
      case 'ad_start':
        eventType = 'media.adStart';
        extra = { advertisingDetails: { name: e.ad!.adId, friendlyName: e.ad!.adTitle, length: round(e.ad!.duration), podPosition: e.ad!.podIndex, playerName: e.player.name, advertiser: e.ad!.advertiser } };
        break;
      case 'ad_complete':
        eventType = 'media.adComplete';
        break;
      case 'ad_skip':
        eventType = 'media.adSkip';
        break;
      case 'ad_break_end':
        eventType = 'media.adBreakComplete';
        break;
      case 'content_completed':
        eventType = 'media.sessionComplete';
        break;
      case 'session_end':
        eventType = 'media.sessionEnd';
        break;
      case 'error':
        eventType = 'media.error';
        extra = { errorDetails: { name: String(e.params.code), source: e.params.type === 'player' ? 'player' : 'external' } };
        break;
      default: {
        const st = ADOBE_STATE[e.event];
        if (!st) return null;
        eventType = 'media.statesUpdate';
        extra = st[1] === 'start' ? { statesStart: [{ name: st[0] }] } : { statesEnd: [{ name: st[0] }] };
      }
    }
    const u = e.context.user;
    const identityMap: Record<string, unknown> = { ECID: [{ id: u.ecid, primary: !u.userId }] };
    if (u.userId) identityMap.CRMID = [{ id: u.userId, primary: true, authenticatedState: 'authenticated' }];
    const mediaCollection: Record<string, unknown> = { playhead, ...extra };
    if (eventType !== 'media.sessionStart') mediaCollection.sessionID = '<from sessionStart response>';
    const xdm = { eventType, timestamp: e.timestamp, identityMap, mediaCollection };
    const call = `alloy('sendEvent', { xdm: { eventType: '${eventType}', … } })`;
    if (!analyticsOk(e)) return { call, payload: { xdm }, request: null, blocked: BLOCKED };
    return {
      call,
      payload: { xdm },
      request: { method: 'POST', url: `https://edge.adobedc.net/ee/va/v1/${eventType.replace('media.', '')}?configId=${DEMO_IDS.adobeDatastream}`, body: { events: [{ xdm }] } },
      note,
    };
  },
};

/* ------------------------------------------------------------------ */
/* Segment (analytics.js) — Video Spec + identify/page                 */
/* ------------------------------------------------------------------ */

const SEGMENT_NAMES: Record<string, string> = {
  playback_started: 'Video Playback Started',
  pause: 'Video Playback Paused',
  play: 'Video Playback Resumed',
  buffer_start: 'Video Playback Buffer Started',
  buffer_end: 'Video Playback Buffer Completed',
  seek_start: 'Video Playback Seek Started',
  seek_complete: 'Video Playback Seek Completed',
  heartbeat: 'Video Content Playing',
  chapter_start: 'Video Content Started',
  chapter_complete: 'Video Content Completed',
  content_completed: 'Video Playback Completed',
  session_end: 'Video Playback Exited',
  ad_break_start: 'Video Ad Break Started',
  ad_break_end: 'Video Ad Break Completed',
  ad_start: 'Video Ad Started',
  ad_quartile: 'Video Ad Playing',
  ad_complete: 'Video Ad Completed',
  ad_skip: 'Video Ad Skipped',
  ad_click: 'Video Ad Clicked',
  overlay_ad_impression: 'Video Overlay Ad Viewed',
  overlay_ad_click: 'Video Overlay Ad Clicked',
  overlay_ad_close: 'Video Overlay Ad Closed',
  companion_impression: 'Companion Ad Viewed',
  companion_click: 'Companion Ad Clicked',
  pause_ad_impression: 'Pause Ad Viewed',
  pause_ad_click: 'Pause Ad Clicked',
  bitrate_change: 'Video Quality Updated',
  error: 'Video Playback Interrupted',
  skip_intro: 'Video Intro Skipped',
  cta_impression: 'CTA Viewed',
  cta_click: 'CTA Clicked',
  endcard_impression: 'Video Recommendations Viewed',
  endcard_click: 'Video Recommendation Clicked',
  subscribe_click: 'Subscribe Clicked',
  share: 'Video Shared',
  like: 'Video Liked',
  unlike: 'Video Unliked',
  cast_start: 'Video Cast Started',
  cast_end: 'Video Cast Ended',
  slate_start: 'Video Slate Started',
  slate_end: 'Video Slate Ended',
  gate_shown: 'Gate Viewed',
  gate_passed: 'Gate Passed',
  gate_failed: 'Gate Failed',
  gate_dismissed: 'Gate Dismissed',
  resume_accept: 'Video Resume Accepted',
  resume_decline: 'Video Resume Declined',
  sign_out: 'Signed Out',
  consent_update: 'Segment Consent Preference Updated',
};

function segmentContext(e: CanonicalEvent) {
  const pg = e.context.page;
  const [w, hgt] = pg.screen.split('x').map(Number);
  return clean({
    library: { name: 'analytics.js', version: 'npm:next-1.72.0' },
    page: { path: pg.path, referrer: pg.referrer, search: pg.search, title: pg.title, url: pg.url },
    userAgent: pg.userAgent,
    locale: pg.language,
    timezone: pg.timezone,
    screen: { width: w, height: hgt },
    campaign: pg.campaign ? { name: pg.campaign.name, source: pg.campaign.source, medium: pg.campaign.medium, term: pg.campaign.term, content: pg.campaign.content } : undefined,
    consent: { categoryPreferences: { analytics: e.context.user.consent.analytics, advertising: e.context.user.consent.advertising, personalization: e.context.user.consent.personalization } },
  } as Record<string, unknown>);
}

export const segmentDestination: Destination = {
  id: 'segment',
  label: 'Segment',
  vendor: 'Segment (analytics.js)',
  map: (e) => {
    const u = e.context.user;
    const envelope = {
      anonymousId: u.anonymousId,
      userId: u.userId ?? undefined,
      context: segmentContext(e),
      messageId: `ajs-next-${e.sessionId.slice(0, 8)}-${e.seq}`,
      timestamp: e.timestamp,
      writeKey: DEMO_IDS.segmentWriteKey,
    };
    if (e.event === 'page_view' || e.event === 'campaign_arrival') {
      const body = clean({ type: 'page', name: 'Mock Player', properties: { path: e.context.page.path, url: e.context.page.url, referrer: e.context.page.referrer, title: e.context.page.title }, ...envelope } as Record<string, unknown>);
      return analyticsOk(e)
        ? { call: `analytics.page('Mock Player')`, payload: body, request: { method: 'POST', url: 'https://api.segment.io/v1/p', body } }
        : { call: `analytics.page('Mock Player')`, payload: body, request: null, blocked: BLOCKED };
    }
    if (e.event === 'sign_in') {
      const body = clean({ type: 'identify', traits: { tier: e.params.tier, login_method: e.params.method }, ...envelope } as Record<string, unknown>);
      return analyticsOk(e)
        ? { call: `analytics.identify('${u.userId}', { tier: '${e.params.tier}' })`, payload: body, request: { method: 'POST', url: 'https://api.segment.io/v1/i', body }, note: 'identify links this anonymousId to the userId for all past and future events.' }
        : { call: `analytics.identify('${u.userId}', {…})`, payload: body, request: null, blocked: BLOCKED };
    }
    if (e.event === 'identity_reset') return { call: 'analytics.reset()', payload: { anonymousId: u.anonymousId }, request: null, note: 'Clears userId and traits and issues a new anonymousId.' };
    const name = SEGMENT_NAMES[e.event];
    if (!name) return null;
    const c = e.content;
    const props: Record<string, unknown> = {
      session_id: e.sessionId,
      content_asset_id: c?.id,
      content_pod_id: e.event.startsWith('chapter_') ? `chapter-${e.params.chapterIndex}` : undefined,
      position: c ? round(c.position) : undefined,
      total_length: c ? round(c.duration) : undefined,
      bitrate: e.qoe.bitrateKbps,
      video_player: e.player.name,
      sound: e.player.muted ? 0 : round(e.player.volume * 100),
      full_screen: e.player.fullscreen,
      ad_enabled: true,
      quality: e.qoe.resolution,
      livestream: c?.streamType === 'live',
    };
    if (['session_start', 'content_completed', 'heartbeat', 'chapter_start', 'chapter_complete'].includes(e.event)) {
      Object.assign(props, { asset_id: c?.id, title: e.event.startsWith('chapter_') ? `${c?.title}: ${e.params.chapterName}` : c?.title, publisher: 'NASA', full_episode: true });
    }
    if (e.event === 'seek_start') props.seek_position = round(Number(e.params.from));
    if (e.event === 'seek_complete') props.seek_position = round(Number(e.params.to));
    if (e.event === 'error') props.method = `${e.params.type}:${e.params.code}`;
    if (e.event === 'consent_update') Object.assign(props, { category_preferences: { analytics: e.params.analytics, advertising: e.params.advertising, personalization: e.params.personalization } });
    if (['cta_impression', 'cta_click', 'endcard_impression', 'endcard_click', 'gate_shown', 'gate_passed', 'gate_failed', 'gate_dismissed', 'slate_start', 'slate_end', 'share'].includes(e.event)) Object.assign(props, e.params);
    if (e.ad) {
      Object.assign(props, {
        ad_asset_id: e.ad.adId,
        ad_pod_id: e.ad.breakId,
        ad_type: e.ad.breakType === 'preroll' ? 'pre-roll' : e.ad.breakType === 'midroll' ? 'mid-roll' : 'post-roll',
        asset_id: e.ad.adId,
        pod_id: e.ad.breakId,
        title: e.ad.adTitle,
        publisher: e.ad.advertiser,
        position: round(e.ad.position),
        total_length: round(e.ad.duration),
      });
    }
    clean(props);
    const body = clean({ type: 'track', event: name, properties: props, ...envelope } as Record<string, unknown>);
    const call = `analytics.track('${name}', {…})`;
    // Consent preference updates are always sent so the warehouse knows the choice.
    if (!analyticsOk(e) && e.event !== 'consent_update') return { call, payload: body, request: null, blocked: BLOCKED };
    return { call, payload: body, request: { method: 'POST', url: 'https://api.segment.io/v1/t', body } };
  },
};

/* ------------------------------------------------------------------ */
/* Tealium iQ (utag.js) + Collect                                     */
/* ------------------------------------------------------------------ */

export const tealiumDestination: Destination = {
  id: 'tealium',
  label: 'Tealium',
  vendor: 'Tealium iQ (utag.js)',
  map: (e) => {
    const u = e.context.user;
    const pg = e.context.page;
    if (e.event === 'consent_update') {
      const all = P(e, 'analytics') && P(e, 'advertising');
      const none = !P(e, 'analytics') && !P(e, 'advertising');
      const call = all ? 'utag.gdpr.setConsentValue(1)' : none ? 'utag.gdpr.setConsentValue(0)' : "utag.gdpr.setPreferencesValues({ analytics: …, advertising: … })";
      return { call, payload: { analytics: e.params.analytics, advertising: e.params.advertising }, request: null };
    }
    const view = e.event === 'page_view' || e.event === 'campaign_arrival';
    const c = e.content;
    const udo: Record<string, unknown> = clean({
      tealium_event: view ? 'page_view' : e.event === 'sign_in' ? 'user_login' : `video_${e.event}`,
      page_name: 'lab:analytics:tools:mock player',
      page_type: 'video_tool',
      page_url: pg.url,
      page_title: pg.title,
      page_referrer: pg.referrer || undefined,
      utm_source: pg.campaign?.source,
      utm_medium: pg.campaign?.medium,
      utm_campaign: pg.campaign?.name,
      customer_id: u.userId ?? undefined,
      customer_type: u.tier,
      ab_test_variant: u.experiment.variant,
      video_id: c?.id,
      video_name: c?.title,
      video_length: c ? round(c.duration) : undefined,
      video_position: c ? round(c.position) : undefined,
      video_percent: c ? round(c.percent) : undefined,
      video_stream_type: c?.streamType,
      video_player: e.player.name,
      video_device: e.player.formFactor,
      video_rendition: e.qoe.rendition || undefined,
      ad_id: e.ad?.adId,
      ad_type: e.ad ? `${e.ad.adType}|${e.ad.insertion}` : undefined,
      event_detail: Object.keys(e.params).length ? JSON.stringify(e.params) : undefined,
    } as Record<string, unknown>);
    const call = view ? `utag.view({ tealium_event: 'page_view', … })` : `utag.link({ tealium_event: '${udo.tealium_event}', … })`;
    if (!analyticsOk(e)) return { call, payload: udo, request: null, blocked: BLOCKED };
    const body = {
      tealium_account: DEMO_IDS.tealium.account,
      tealium_profile: DEMO_IDS.tealium.profile,
      tealium_datasource: DEMO_IDS.tealium.datasource,
      tealium_visitor_id: u.anonymousId.replace(/^anon_|-/g, ''),
      tealium_session_id: u.analyticsSessionId,
      tealium_session_number: u.sessionNumber,
      tealium_timestamp_epoch: Math.floor(Date.parse(e.timestamp) / 1000),
      ...udo,
    };
    return { call, payload: udo, request: { method: 'POST', url: 'https://collect.tealiumiq.com/event', body }, note: 'utag.js runs the loaded tags; the Tealium Collect tag sends this to EventStream.' };
  },
};

export const DESTINATIONS: Destination[] = [gtmDestination, ga4Destination, adobeAnalyticsDestination, adobeMediaDestination, segmentDestination, tealiumDestination];
