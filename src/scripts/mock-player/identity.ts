/**
 * Visitor identity and page context: the fields every enterprise analytics
 * stack attaches to each hit. Persisted in localStorage like first-party
 * cookies would be, so a returning visitor keeps their anonymous ID and
 * session count across page loads.
 */
import type { EventContext, PageContext, UserContext } from './events';

const KEY = 'mockplayer.identity.v1';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // GA4 / Adobe default inactivity timeout

interface Stored {
  anonymousId: string;
  userId: string | null;
  tier: UserContext['tier'];
  firstSeen: string;
  sessionId: string;
  sessionNumber: number;
  sessionStartedAt: string;
  lastHitAt: number;
  consent: UserContext['consent'];
  variant: string;
  campaign: PageContext['campaign'];
}

export const DEMO_USERS = [
  { id: 'usr_48213', email: 'avery@example.com', tier: 'subscriber' as const },
  { id: 'usr_77105', email: 'jordan@example.com', tier: 'registered' as const },
];

export const CAMPAIGNS: Record<string, NonNullable<PageContext['campaign']>> = {
  newsletter: { source: 'newsletter', medium: 'email', name: 'artemis_weekly', content: 'hero_video' },
  paid_social: { source: 'meta', medium: 'paid_social', name: 'fall_launch_2026', term: 'space_video', content: 'carousel_2' },
  search: { source: 'google', medium: 'cpc', name: 'brand_video', term: 'nasa launch video' },
  partner: { source: 'partner_site', medium: 'referral', name: 'syndication_q4' },
};

const rid = (prefix = '') =>
  prefix +
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 14)}`);

/** GA-style client id: random 10 digits . first-seen unix seconds */
const gaClientId = (firstSeen: string) => `${Math.floor(1e9 + Math.random() * 9e9)}.${Math.floor(Date.parse(firstSeen) / 1000)}`;

function parseUA(ua: string) {
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  const os = /Windows NT/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  return { browser, os };
}

export class Identity {
  private s: Stored;
  /** True the first time this browser is seen (before any reload). */
  isNewVisitor: boolean;
  /** Simulated device type; follows the player's form factor. */
  deviceType = 'desktop';
  /** Simulated connection type; follows the network panel. */
  connectionType = '';
  /** Simulated viewer location label (what IP geolocation would report). */
  geo = '';
  pageViewId = rid('pv_');
  readonly gaCid: string;
  readonly ecid: string;
  private listeners = new Set<() => void>();

  constructor() {
    let stored: Stored | null = null;
    try {
      stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch {
      stored = null;
    }
    this.isNewVisitor = !stored;
    this.s = stored ?? this.fresh();
    this.touchSession();
    const params = new URLSearchParams(location.search);
    if (params.get('utm_source')) {
      this.s.campaign = {
        source: params.get('utm_source')!,
        medium: params.get('utm_medium') || '(none)',
        name: params.get('utm_campaign') || '(not set)',
        term: params.get('utm_term') || undefined,
        content: params.get('utm_content') || undefined,
      };
    }
    this.gaCid = this.cached('gacid', () => gaClientId(this.s.firstSeen));
    // Adobe Experience Cloud ID: 38 digits
    this.ecid = this.cached('ecid', () => Array.from({ length: 38 }, () => Math.floor(Math.random() * 10)).join(''));
    this.save();
  }

  private cached(name: string, make: () => string) {
    const k = `${KEY}.${name}`;
    try {
      const v = localStorage.getItem(k);
      if (v) return v;
      const n = make();
      localStorage.setItem(k, n);
      return n;
    } catch {
      return make();
    }
  }

  private fresh(): Stored {
    const now = new Date().toISOString();
    return {
      anonymousId: rid('anon_'),
      userId: null,
      tier: 'anonymous',
      firstSeen: now,
      sessionId: String(Math.floor(Date.now() / 1000)),
      sessionNumber: 0,
      sessionStartedAt: now,
      lastHitAt: 0,
      consent: { analytics: false, advertising: false, personalization: false, decided: false },
      variant: Math.random() < 0.5 ? 'control' : 'endcard_v2',
      campaign: null,
    };
  }

  /** Start a new analytics session after 30 minutes of inactivity (GA4/Adobe rule). */
  private touchSession() {
    const now = Date.now();
    if (!this.s.lastHitAt || now - this.s.lastHitAt > SESSION_TIMEOUT_MS) {
      this.s.sessionId = String(Math.floor(now / 1000));
      this.s.sessionNumber += 1;
      this.s.sessionStartedAt = new Date(now).toISOString();
    }
    this.s.lastHitAt = now;
  }

  private save(notify = true) {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.s));
    } catch {
      /* storage blocked: identity lives for this page only */
    }
    if (notify) for (const fn of this.listeners) fn();
  }

  onChange(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  get consent() {
    return this.s.consent;
  }
  get userId() {
    return this.s.userId;
  }
  get anonymousId() {
    return this.s.anonymousId;
  }
  get tier() {
    return this.s.tier;
  }
  get campaign() {
    return this.s.campaign;
  }
  get variant() {
    return this.s.variant;
  }
  get sessionNumber() {
    return this.s.sessionNumber;
  }
  get sessionId() {
    return this.s.sessionId;
  }

  setConsent(c: Partial<Omit<UserContext['consent'], 'decided'>>) {
    this.s.consent = { ...this.s.consent, ...c, decided: true };
    this.save();
  }

  /** Forget consent choices so the banner shows again. */
  clearConsent() {
    this.s.consent = { analytics: false, advertising: false, personalization: false, decided: false };
    this.save();
  }

  signIn(user = DEMO_USERS[0]) {
    this.s.userId = user.id;
    this.s.tier = user.tier;
    this.save();
    return user;
  }

  signOut() {
    this.s.userId = null;
    this.s.tier = 'anonymous';
    this.save();
  }

  setCampaign(key: string | null) {
    this.s.campaign = key ? CAMPAIGNS[key] ?? null : null;
    this.save();
  }

  setVariant(v: string) {
    this.s.variant = v;
    this.save();
  }

  /** Brand-new visitor: new anonymous ID, cleared consent, session 1. */
  reset() {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem(`${KEY}.gacid`);
      localStorage.removeItem(`${KEY}.ecid`);
    } catch {
      /* ignore */
    }
    this.s = this.fresh();
    this.isNewVisitor = true;
    this.pageViewId = rid('pv_');
    this.touchSession();
    (this as { gaCid: string }).gaCid = this.cached('gacid', () => gaClientId(this.s.firstSeen));
    (this as { ecid: string }).ecid = this.cached('ecid', () => Array.from({ length: 38 }, () => Math.floor(Math.random() * 10)).join(''));
    this.save();
  }

  user(): UserContext {
    this.touchSession();
    return {
      anonymousId: this.s.anonymousId,
      gaClientId: this.gaCid,
      ecid: this.ecid,
      userId: this.s.userId,
      loggedIn: !!this.s.userId,
      tier: this.s.tier,
      analyticsSessionId: this.s.sessionId,
      sessionNumber: this.s.sessionNumber,
      sessionStartedAt: this.s.sessionStartedAt,
      isNewVisitor: this.isNewVisitor,
      firstSeen: this.s.firstSeen,
      consent: { ...this.s.consent },
      experiment: { id: 'exp_endcard_layout', variant: this.s.variant },
    };
  }

  page(): PageContext {
    const ua = navigator.userAgent;
    const { browser, os } = parseUA(ua);
    const c = this.s.campaign;
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType ?? 'unknown';
    const url = new URL(location.href);
    if (c) {
      url.searchParams.set('utm_source', c.source);
      url.searchParams.set('utm_medium', c.medium);
      url.searchParams.set('utm_campaign', c.name);
      if (c.term) url.searchParams.set('utm_term', c.term);
      if (c.content) url.searchParams.set('utm_content', c.content);
    }
    return {
      url: url.toString(),
      path: location.pathname,
      title: document.title,
      referrer: c?.medium === 'cpc' ? 'https://www.google.com/' : c?.medium === 'paid_social' ? 'https://l.facebook.com/' : document.referrer,
      search: url.search,
      campaign: c,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      viewport: `${innerWidth}x${innerHeight}`,
      colorDepth: screen.colorDepth,
      userAgent: ua,
      browser,
      os,
      deviceType: this.deviceType,
      connection: this.connectionType || conn,
      pageViewId: this.pageViewId,
    };
  }

  context(): EventContext {
    const ctx = { user: this.user(), page: this.page() };
    this.save(false);
    return ctx;
  }
}
