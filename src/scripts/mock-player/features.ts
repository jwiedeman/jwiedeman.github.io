/**
 * Player features layered on the core: chapters, skip intro, resume, CTAs,
 * end card, overlay / companion / pause ads, gates (consent, age,
 * registration, geo), live pre-show slate, like / share / cast, audio tracks.
 *
 * Every clickable element carries data-f="…" so play plans can click the
 * same buttons a viewer would.
 */
import type { CanonicalEvent } from './events';
import type { Identity } from './identity';
import type { MockPlayer } from './player';

export interface FeatureFlags {
  chapters: boolean;
  skipIntro: boolean;
  resume: boolean;
  cta: boolean;
  endCard: boolean;
  overlayAd: boolean;
  companion: boolean;
  pauseAd: boolean;
  consentGate: boolean;
  ageGate: boolean;
  registrationGate: boolean;
  geoBlock: boolean;
  preshow: boolean;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  chapters: true,
  skipIntro: true,
  resume: true,
  cta: true,
  endCard: true,
  overlayAd: false,
  companion: true,
  pauseAd: false,
  consentGate: true,
  ageGate: false,
  registrationGate: false,
  geoBlock: false,
  preshow: true,
};

interface Chapter {
  index: number;
  name: string;
  start: number;
  end: number;
}

const INTRO_S = 8;
const PREVIEW_S = 30;
const RESUME_KEY = 'mockplayer.resume.v1';

const h = (tag: string, cls: string, attrs: Record<string, string> = {}, text?: string) => {
  const el = document.createElement(tag);
  el.className = cls;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export class Features {
  flags: FeatureFlags = { ...DEFAULT_FLAGS };
  private chapters: Chapter[] = [];
  private chapterIndex = -1;
  private lastSeekAt = 0;
  private session = '';
  private shown = new Set<string>(); // per-session one-shots (cta, overlay, gates)
  private passed = new Set<string>(); // per-session gate clearances
  private pendingResume: number | null = null;
  private liked = new Set<string>();
  private casting = false;
  private audioTrack = 'en';
  private ageVerified = false;
  private endcardTimer: number | undefined;
  private pauseAdTimer: number | undefined;
  private els: Record<string, HTMLElement | null> = {};

  constructor(
    private player: MockPlayer,
    private identity: Identity,
    private companionSlot: HTMLElement | null
  ) {
    try {
      this.ageVerified = sessionStorage.getItem('mockplayer.age') === 'ok';
    } catch {
      /* ignore */
    }
    player.guards.push(
      (r) => this.geoGuard(r),
      (r) => this.consentGuard(r),
      (r) => this.ageGuard(r),
      (r) => this.preshowGuard(r),
      (r) => this.resumeGuard(r)
    );
    player.tickHooks.push((pos) => this.onTick(pos));
    player.menuGroups.push(
      { label: 'Chapters', items: () => (this.flags.chapters ? this.chapters.map((c) => ({ label: `${fmt(c.start)} ${c.name}`, pressed: c.index === this.chapterIndex, onClick: () => this.jumpToChapter(c.index) })) : []) },
      {
        label: 'Audio',
        items: () => [
          { label: 'English', pressed: this.audioTrack === 'en', onClick: () => this.setAudio('en') },
          { label: 'English (audio description)', pressed: this.audioTrack === 'en-ad', onClick: () => this.setAudio('en-ad') },
        ],
      }
    );
    player.onFinished = () => this.showEndCard();
    player.useEndCard = this.flags.endCard;
    player.bus.on((e) => this.onEvent(e));
    this.buildActions();
  }

  setFlag<K extends keyof FeatureFlags>(k: K, v: FeatureFlags[K]) {
    this.flags[k] = v;
    if (k === 'endCard') this.player.useEndCard = v as boolean;
    if (k === 'chapters') {
      this.buildChapters();
      this.player.refresh();
    }
  }

  /* ------------------------------------------------------------ */
  /* Session lifecycle                                            */
  /* ------------------------------------------------------------ */

  private onEvent(e: CanonicalEvent) {
    switch (e.event) {
      case 'session_start':
        this.session = e.sessionId;
        this.shown.clear();
        this.passed.clear();
        this.chapterIndex = -1;
        this.pendingResume = null;
        window.clearTimeout(this.endcardTimer);
        this.clearLayer();
        this.buildChapters();
        this.player.refresh();
        break;
      case 'playback_started':
        if (this.pendingResume !== null) {
          const at = this.pendingResume;
          this.pendingResume = null;
          this.player.seek(at, 'resume');
        }
        break;
      case 'seek_start':
        this.lastSeekAt = performance.now();
        break;
      case 'heartbeat':
      case 'pause':
        this.saveResume();
        break;
      case 'session_end':
        if (e.params.reason !== 'completed') this.saveResume();
        break;
      case 'content_completed':
        this.clearResume();
        this.closeChapter(true);
        break;
      case 'ad_start':
        if (this.flags.companion) this.showCompanion(e);
        break;
      case 'ad_break_end':
        this.hideCompanion();
        break;
    }
    if (e.event === 'pause' && this.flags.pauseAd && e.params.reason !== 'background') {
      window.clearTimeout(this.pauseAdTimer);
      this.pauseAdTimer = window.setTimeout(() => this.showPauseAd(), 700);
    }
    if (e.event === 'play' || e.event === 'session_start' || e.event === 'seek_start') this.remove('pause-ad');
  }

  private clearLayer() {
    for (const k of Object.keys(this.els)) this.remove(k);
  }

  private put(key: string, el: HTMLElement) {
    this.remove(key);
    this.els[key] = el;
    this.player.layer.append(el);
    return el;
  }

  private remove(key: string) {
    this.els[key]?.remove();
    this.els[key] = null;
  }

  /* ------------------------------------------------------------ */
  /* Chapters + skip intro                                        */
  /* ------------------------------------------------------------ */

  private buildChapters() {
    const item = this.player.item;
    this.chapters = [];
    if (!item || item.kind === 'live' || !this.flags.chapters || item.duration < 45) {
      this.player.chapterMarks = [];
      return;
    }
    const d = item.duration;
    const credits = d > 90 ? 12 : 0;
    const body = d - INTRO_S - credits;
    const names = ['Intro', 'Part 1', 'Part 2', 'Part 3'];
    const bounds = [0, INTRO_S, INTRO_S + body / 3, INTRO_S + (2 * body) / 3];
    names.forEach((name, i) => this.chapters.push({ index: i, name, start: bounds[i], end: bounds[i + 1] ?? d - credits }));
    if (credits) this.chapters.push({ index: 4, name: 'Credits', start: d - credits, end: d });
    this.player.chapterMarks = this.chapters.map((c) => c.start);
  }

  private chapterParams(c: Chapter) {
    return { chapterIndex: c.index, chapterName: c.name, chapterStart: Math.round(c.start), chapterLength: Math.round(c.end - c.start), chapterCount: this.chapters.length };
  }

  private closeChapter(completed: boolean) {
    const prev = this.chapters[this.chapterIndex];
    if (!prev) return;
    this.player.emit(completed ? 'chapter_complete' : 'chapter_skip', this.chapterParams(prev));
    this.chapterIndex = -1;
  }

  private trackChapter(pos: number) {
    if (!this.chapters.length) return;
    const c = this.chapters.find((x) => pos >= x.start && pos < x.end) ?? this.chapters[this.chapters.length - 1];
    if (c.index === this.chapterIndex) return;
    const prev = this.chapters[this.chapterIndex];
    if (prev) {
      // Reached the next chapter by playing through, or jumped there?
      const natural = c.index === prev.index + 1 && performance.now() - this.lastSeekAt > 1500 && Math.abs(pos - prev.end) < 2;
      this.player.emit(natural ? 'chapter_complete' : 'chapter_skip', this.chapterParams(prev));
    }
    this.chapterIndex = c.index;
    this.player.emit('chapter_start', this.chapterParams(c));
    this.player.refresh();
  }

  jumpToChapter(i: number) {
    const c = this.chapters[i];
    if (c) this.player.seek(c.start + 0.1, 'chapter_menu');
  }

  private updateSkipIntro(pos: number) {
    const show = this.flags.skipIntro && this.chapters.length > 0 && pos < INTRO_S - 1.5;
    if (show && !this.els['skip-intro']) {
      const b = h('button', 'mpf__skipintro', { 'data-f': 'skip-intro' }, 'Skip intro');
      b.onclick = () => {
        this.player.emit('skip_intro', { from: Math.round(this.player.position * 10) / 10, to: INTRO_S });
        this.player.seek(INTRO_S + 0.1, 'skip_intro');
        this.remove('skip-intro');
      };
      this.put('skip-intro', b);
    } else if (!show && this.els['skip-intro']) {
      this.remove('skip-intro');
    }
  }

  /* ------------------------------------------------------------ */
  /* Tick: chapters, skip intro, CTA, overlay ad, registration    */
  /* ------------------------------------------------------------ */

  private onTick(pos: number) {
    const item = this.player.item;
    this.trackChapter(pos);
    this.updateSkipIntro(pos);
    const live = item.kind === 'live';
    const ctaAt = live ? 150 : item.duration * 0.35;
    if (this.flags.cta && pos >= ctaAt && !this.shown.has('cta')) this.showCta();
    if (this.flags.overlayAd && pos >= (live ? 60 : 20) && !this.shown.has('overlay')) this.showOverlayAd();
    if (this.flags.registrationGate && !this.identity.userId && pos >= PREVIEW_S && !this.passed.has('registration') && !this.shown.has('registration')) this.showRegistrationGate();
  }

  /* ------------------------------------------------------------ */
  /* CTA, overlay, pause ad, companion                            */
  /* ------------------------------------------------------------ */

  private showCta() {
    this.shown.add('cta');
    const item = this.player.item;
    const label = item.slug.includes('hubble') || item.slug.includes('webb') ? 'Explore the telescope →' : 'Explore the mission →';
    const url = 'https://science.nasa.gov/';
    const b = h('button', 'mpf__cta', { 'data-f': 'cta' }, label);
    b.onclick = () => {
      this.player.emit('cta_click', { ctaId: 'mission_explore', label, url, position: Math.round(this.player.position) });
      this.player.toast('CTA click recorded (link not opened in the trainer)');
      this.remove('cta');
    };
    this.put('cta', b);
    this.player.emit('cta_impression', { ctaId: 'mission_explore', label, url, durationMs: 10000 });
    window.setTimeout(() => this.remove('cta'), 10000);
  }

  private showOverlayAd() {
    this.shown.add('overlay');
    const box = h('div', 'mpf__overlayad', { role: 'complementary' });
    const link = h('button', 'mpf__overlayad-body', { 'data-f': 'overlay-ad' });
    link.innerHTML = '<span>Sponsored</span> Hubble at 35: see the anniversary gallery';
    const close = h('button', 'mpf__overlayad-close', { 'data-f': 'overlay-close', 'aria-label': 'Close ad' }, '×');
    box.append(link, close);
    const params = { adId: 'OVL-HUBBLE35', format: 'non_linear_banner', size: '468x60', advertiser: 'NASA Goddard', personalized: this.player.adsPersonalized };
    link.onclick = () => {
      this.player.emit('overlay_ad_click', params);
      this.remove('overlay');
    };
    close.onclick = () => {
      this.player.emit('overlay_ad_close', params);
      this.remove('overlay');
    };
    this.put('overlay', box);
    this.player.emit('overlay_ad_impression', params);
    window.setTimeout(() => this.remove('overlay'), 15000);
  }

  private showPauseAd() {
    if (this.player.state !== 'paused' || !this.flags.pauseAd) return;
    const box = h('button', 'mpf__pausead', { 'data-f': 'pause-ad' });
    box.innerHTML = '<span>Sponsored · while you are paused</span><strong>Webb\'s deepest field yet</strong><em>Tap to see the image</em>';
    const params = { adId: 'PAUSE-WEBB', format: 'pause_ad', advertiser: 'NASA Goddard', personalized: this.player.adsPersonalized };
    box.onclick = () => {
      this.player.emit('pause_ad_click', params);
      this.remove('pause-ad');
    };
    this.put('pause-ad', box);
    this.player.emit('pause_ad_impression', params);
  }

  private showCompanion(e: CanonicalEvent) {
    const slot = this.companionSlot;
    if (!slot) return;
    slot.hidden = false;
    slot.innerHTML = '';
    const b = h('button', 'mpf__companion', { 'data-f': 'companion' });
    b.innerHTML = `<span>Companion · 300×250</span><strong>Can you spot Hubble?</strong><em>Find it in tonight's sky →</em>`;
    const params = { adId: `${e.ad?.adId}-COMP`, size: '300x250', parentAdId: e.ad?.adId, personalized: this.player.adsPersonalized };
    b.onclick = () => this.player.emit('companion_click', params);
    slot.append(b);
    this.player.emit('companion_impression', params);
  }

  private hideCompanion() {
    if (!this.companionSlot) return;
    this.companionSlot.hidden = true;
    this.companionSlot.innerHTML = '';
  }

  /* ------------------------------------------------------------ */
  /* End card (A/B: control = single up-next, endcard_v2 = grid)  */
  /* ------------------------------------------------------------ */

  private showEndCard() {
    const p = this.player;
    const variant = this.identity.variant;
    const recs = [1, 2, 3].map((k) => p.content[(p.index + k) % p.content.length]).filter((c) => c.slug !== p.item.slug);
    const shownRecs = variant === 'endcard_v2' ? recs.slice(0, 3) : recs.slice(0, 1);
    const card = h('div', `mpf__endcard mpf__endcard--${variant}`);
    const head = h('div', 'mpf__endcard-head');
    const count = h('span', 'mpf__endcard-count');
    head.append(h('span', '', {}, variant === 'endcard_v2' ? 'Watch next' : 'Up next'), count);
    const grid = h('div', 'mpf__endcard-grid');
    shownRecs.forEach((c, i) => {
      const b = h('button', 'mpf__endcard-item', { 'data-f': `endcard-${i + 1}` });
      if (c.poster) b.style.backgroundImage = `linear-gradient(transparent 40%, rgba(0,0,0,.85)), url("${c.poster}")`;
      b.append(h('strong', '', {}, c.title));
      b.onclick = () => {
        window.clearTimeout(this.endcardTimer);
        p.emit('endcard_click', { slot: i + 1, target: c.slug, variant, trigger: 'click' });
        p.load(c.slug, { autoplay: true, reason: 'endcard' });
      };
      grid.append(b);
    });
    const foot = h('div', 'mpf__endcard-foot');
    const sub = h('button', 'mpf__btn', { 'data-f': 'subscribe' }, 'Subscribe');
    sub.onclick = () => {
      p.emit('subscribe_click', { placement: 'endcard', loggedIn: !!this.identity.userId });
      p.toast('Subscribe click recorded');
    };
    const replay = h('button', 'mpf__btn', { 'data-f': 'replay' }, 'Replay');
    replay.onclick = () => {
      window.clearTimeout(this.endcardTimer);
      p.load(p.index, { autoplay: true, reason: 'replay' });
    };
    const cancel = h('button', 'mpf__btn', { 'data-f': 'endcard-cancel' }, 'Cancel autoplay');
    cancel.onclick = () => {
      window.clearTimeout(this.endcardTimer);
      count.textContent = '';
      cancel.remove();
    };
    foot.append(sub, replay);
    if (p.autoplayNext) foot.append(cancel);
    card.append(head, grid, foot);
    this.put('endcard', card);
    p.emit('endcard_impression', { variant, recommendations: shownRecs.map((c) => c.slug), autoplay: p.autoplayNext });
    if (p.autoplayNext && shownRecs[0]) {
      let n = 8;
      const step = () => {
        count.textContent = `in ${n}`;
        if (n-- <= 0) {
          p.emit('endcard_click', { slot: 1, target: shownRecs[0].slug, variant, trigger: 'autoplay' });
          p.next('autoplay');
          return;
        }
        this.endcardTimer = window.setTimeout(step, 1000);
      };
      step();
    }
  }

  /* ------------------------------------------------------------ */
  /* Gates                                                        */
  /* ------------------------------------------------------------ */

  private modal(key: string, kicker: string, title: string, body: string) {
    const m = h('div', 'mpf__gate', { role: 'dialog', 'aria-modal': 'true' });
    const inner = h('div', 'mpf__gate-inner');
    inner.append(h('span', 'mpf__gate-kicker', {}, kicker), h('strong', '', {}, title), h('p', '', {}, body));
    m.append(inner);
    this.put(key, m);
    return inner;
  }

  private consentGuard(_r: string) {
    if (!this.flags.consentGate || this.identity.consent.decided) return true;
    if (this.shown.has('consent')) return false;
    this.shown.add('consent');
    this.player.emit('gate_shown', { type: 'consent', framework: 'IAB TCF v2.2 (simulated)' });
    const box = this.modal('consent', 'Privacy', 'We value your privacy', 'We and our partners use cookies to measure video performance and show relevant ads. Choose what you allow.');
    const toggles = h('div', 'mpf__consent-toggles');
    const mk = (name: string, label: string, on: boolean) => {
      const l = h('label', '');
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.checked = on;
      c.dataset.consent = name;
      l.append(c, document.createTextNode(` ${label}`));
      toggles.append(l);
      return c;
    };
    const a = mk('analytics', 'Analytics', true);
    const ad = mk('advertising', 'Advertising', true);
    const pz = mk('personalization', 'Personalization', true);
    const row = h('div', 'mpf__gate-actions');
    const decide = (analytics: boolean, advertising: boolean, personalization: boolean, method: string) => {
      this.setConsent({ analytics, advertising, personalization }, method);
      this.player.emit('gate_passed', { type: 'consent', method });
      this.remove('consent');
      this.player.play();
    };
    const accept = h('button', 'mpf__btn mpf__btn--primary', { 'data-f': 'consent-accept' }, 'Accept all');
    const reject = h('button', 'mpf__btn', { 'data-f': 'consent-reject' }, 'Reject all');
    const save = h('button', 'mpf__btn', { 'data-f': 'consent-save' }, 'Save choices');
    accept.onclick = () => decide(true, true, true, 'accept_all');
    reject.onclick = () => decide(false, false, false, 'reject_all');
    save.onclick = () => decide(a.checked, ad.checked, pz.checked, 'custom');
    row.append(accept, reject, save);
    box.append(toggles, row);
    return false;
  }

  /** Change consent from anywhere (banner, panel, plans). */
  setConsent(c: { analytics: boolean; advertising: boolean; personalization: boolean }, method: string) {
    this.identity.setConsent(c);
    this.player.adsPersonalized = c.advertising;
    this.player.emit('consent_update', { ...c, method });
  }

  private ageGuard(_r: string) {
    if (!this.flags.ageGate || this.ageVerified) return true;
    if (this.shown.has('age')) return false;
    this.shown.add('age');
    this.player.emit('gate_shown', { type: 'age', minimumAge: 18 });
    const box = this.modal('age', 'Age verification', 'This video is for viewers 18+', 'Enter your year of birth to continue.');
    const sel = document.createElement('select');
    sel.dataset.f = 'age-year';
    const now = new Date().getFullYear();
    for (let y = now; y >= now - 90; y--) sel.append(new Option(String(y), String(y), y === now - 30, y === now - 30));
    const go = h('button', 'mpf__btn mpf__btn--primary', { 'data-f': 'age-submit' }, 'Continue');
    go.onclick = () => {
      const age = now - Number(sel.value);
      this.remove('age');
      if (age >= 18) {
        this.ageVerified = true;
        try {
          sessionStorage.setItem('mockplayer.age', 'ok');
        } catch {
          /* ignore */
        }
        this.player.emit('gate_passed', { type: 'age', age });
        this.player.play();
      } else {
        this.player.emit('gate_failed', { type: 'age', age, minimumAge: 18 });
        this.player.showSlate('age_restricted', 'This video is not available', 'You must be 18 or older to watch this video.', null);
      }
    };
    const row = h('div', 'mpf__gate-actions');
    row.append(sel, go);
    box.append(row);
    return false;
  }

  private geoGuard(_r: string) {
    if (!this.flags.geoBlock) return true;
    if (!this.shown.has('geo')) {
      this.shown.add('geo');
      this.player.emit('gate_shown', { type: 'geo', viewerRegion: 'BR', licensedRegions: ['US', 'CA', 'GB'] });
      this.player.emit('gate_failed', { type: 'geo', viewerRegion: 'BR' });
      this.player.showSlate('geo_blocked', 'Not available in your region', 'Our license for this video does not cover your location (BR).', null);
    }
    return false;
  }

  private preshowGuard(_r: string) {
    const live = this.player.item.kind === 'live';
    if (!live || !this.flags.preshow || this.passed.has('preshow')) return true;
    if (this.shown.has('preshow')) return false;
    this.shown.add('preshow');
    this.player.showSlate('preshow', 'Starting soon', 'The live tour begins in a moment.', 10000, () => {
      this.passed.add('preshow');
      this.player.play();
    });
    return false;
  }

  private resumeGuard(_r: string) {
    if (!this.flags.resume || this.passed.has('resume')) return true;
    const item = this.player.item;
    const saved = this.readResume()[item.slug];
    if (item.kind === 'live' || !saved || saved < 10 || saved > item.duration - 15) return true;
    if (this.shown.has('resume')) return false;
    this.shown.add('resume');
    this.player.emit('resume_prompt', { savedPosition: Math.round(saved) });
    const box = this.modal('resume', 'Continue watching', `Resume from ${fmt(saved)}?`, 'You watched part of this before.');
    const row = h('div', 'mpf__gate-actions');
    const yes = h('button', 'mpf__btn mpf__btn--primary', { 'data-f': 'resume-accept' }, `Resume ${fmt(saved)}`);
    const no = h('button', 'mpf__btn', { 'data-f': 'resume-decline' }, 'Start over');
    yes.onclick = () => {
      this.passed.add('resume');
      this.pendingResume = saved;
      this.player.emit('resume_accept', { position: Math.round(saved) });
      this.remove('resume');
      this.player.play();
    };
    no.onclick = () => {
      this.passed.add('resume');
      this.clearResume();
      this.player.emit('resume_decline', { position: Math.round(saved) });
      this.remove('resume');
      this.player.play();
    };
    row.append(yes, no);
    box.append(row);
    return false;
  }

  private showRegistrationGate() {
    this.shown.add('registration');
    const p = this.player;
    p.hold('gate:registration');
    p.emit('gate_shown', { type: 'registration', previewSeconds: PREVIEW_S });
    const box = this.modal('registration', 'Free preview ended', 'Sign in to keep watching', 'Create a free account or sign in to watch the rest of this video.');
    const row = h('div', 'mpf__gate-actions');
    const signin = h('button', 'mpf__btn mpf__btn--primary', { 'data-f': 'gate-signin' }, 'Sign in (demo)');
    const later = h('button', 'mpf__btn', { 'data-f': 'gate-dismiss' }, 'Not now');
    signin.onclick = () => {
      this.signIn('registration_gate');
      this.passed.add('registration');
      p.emit('gate_passed', { type: 'registration' });
      this.remove('registration');
      p.release('gate:registration');
    };
    later.onclick = () => {
      p.emit('gate_dismissed', { type: 'registration' });
      this.remove('registration');
      const bar = h('button', 'mpf__gatebar', { 'data-f': 'gate-reopen' }, 'Sign in to keep watching →');
      bar.onclick = () => {
        this.remove('gatebar');
        this.shown.delete('registration');
        p.release('gate:registration');
        this.showRegistrationGate();
      };
      this.put('gatebar', bar);
    };
    row.append(signin, later);
    box.append(row);
  }

  signIn(method = 'panel') {
    const u = this.identity.signIn();
    this.player.emit('sign_in', { method, userId: u.id, tier: u.tier });
    if (this.player.holdReasons.includes('gate:registration')) {
      this.passed.add('registration');
      this.remove('registration');
      this.remove('gatebar');
      this.player.release('gate:registration');
    }
  }

  signOut() {
    this.player.emit('sign_out', { userId: this.identity.userId });
    this.identity.signOut();
  }

  /* ------------------------------------------------------------ */
  /* Resume storage                                               */
  /* ------------------------------------------------------------ */

  private readResume(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(RESUME_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private saveResume() {
    const item = this.player.item;
    if (!item || item.kind === 'live') return;
    const all = this.readResume();
    all[item.slug] = Math.round(this.player.position);
    try {
      localStorage.setItem(RESUME_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  private clearResume() {
    const all = this.readResume();
    delete all[this.player.item?.slug];
    try {
      localStorage.setItem(RESUME_KEY, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  /* ------------------------------------------------------------ */
  /* Like / share / cast / audio                                  */
  /* ------------------------------------------------------------ */

  private buildActions() {
    const a = this.player.actions;
    const like = h('button', 'mpf__action', { 'data-f': 'like', 'aria-pressed': 'false' }, '♡');
    like.title = 'Like';
    const share = h('button', 'mpf__action', { 'data-f': 'share' }, 'Share');
    const cast = h('button', 'mpf__action', { 'data-f': 'cast', 'aria-pressed': 'false' }, 'Cast');
    like.onclick = () => this.toggleLike(like);
    share.onclick = () => this.share();
    cast.onclick = () => this.toggleCast(cast);
    a.append(like, share, cast);
    this.player.bus.on((e) => {
      if (e.event === 'session_start') {
        const on = this.liked.has(this.player.item.slug);
        like.textContent = on ? '♥' : '♡';
        like.setAttribute('aria-pressed', String(on));
      }
    });
  }

  private toggleLike(btn: HTMLElement) {
    const slug = this.player.item.slug;
    const on = !this.liked.has(slug);
    on ? this.liked.add(slug) : this.liked.delete(slug);
    btn.textContent = on ? '♥' : '♡';
    btn.setAttribute('aria-pressed', String(on));
    this.player.emit(on ? 'like' : 'unlike', { contentId: slug });
  }

  private async share() {
    const pos = Math.floor(this.player.position);
    const url = `${location.origin}${location.pathname}?v=${this.player.item.slug}&t=${pos}`;
    let method = 'copy_link';
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      method = 'copy_link_unavailable';
    }
    this.player.emit('share', { method, position: pos, url });
    this.player.toast(method === 'copy_link' ? 'Link with timestamp copied' : 'Share recorded (clipboard needs HTTPS)');
  }

  private toggleCast(btn: HTMLElement) {
    this.casting = !this.casting;
    btn.setAttribute('aria-pressed', String(this.casting));
    const params = { device: 'Living Room TV', protocol: 'cast', position: Math.round(this.player.position) };
    if (this.casting) {
      const s = h('div', 'mpf__casting');
      s.innerHTML = '<span>Casting</span><strong>Living Room TV</strong><em>Playback continues on the TV. Controls here act as a remote.</em>';
      this.put('casting', s);
      this.player.emit('cast_start', params);
    } else {
      this.remove('casting');
      this.player.emit('cast_end', params);
    }
  }

  setAudio(track: string) {
    if (track === this.audioTrack) return;
    const from = this.audioTrack;
    this.audioTrack = track;
    this.player.emit('audio_track_change', { from, to: track, simulated: true });
    if (track === 'en-ad') this.player.toast('Audio description selected (simulated track)');
  }

  /** Forget every saved resume position. */
  clearSavedPositions() {
    try {
      localStorage.removeItem(RESUME_KEY);
    } catch {
      /* ignore */
    }
  }

  /** Forget a passed age check (so the gate shows again). */
  resetAge() {
    this.ageVerified = false;
    try {
      sessionStorage.removeItem('mockplayer.age');
    } catch {
      /* ignore */
    }
  }

  /** Hide the companion slot if the feature gets turned off mid-ad. */
  refreshCompanion() {
    if (!this.flags.companion) this.hideCompanion();
  }
}
