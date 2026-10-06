/**
 * GA4 tracking spec page: wires every live example to gtag(), keeps a log of
 * events with identity and consent state, and shows each event as web,
 * Android, iOS, Measurement Protocol, and /g/collect request code.
 */
import { SPEC, ITEMS, TYPE_LABEL, type EventType } from '../../data/ga4-spec';
import { gtagCode, kotlinCode, swiftCode, mpCode, collectUrl, type Identity, type Params } from './codegen';
import { validate, type Finding } from './validate';

type Gtag = (...args: unknown[]) => void;
interface LogEntry {
  name: string;
  params: Params;
  type: EventType | 'unknown';
  source: string;
  time: string;
  command: boolean;
  findings: Finding[];
}

const MEASUREMENT_ID = 'G-DEMO12345';
const SPEC_TYPES = new Map<string, EventType>();
for (const e of SPEC) for (const ev of e.events) if (!SPEC_TYPES.has(ev.name) || ev.type !== 'custom') SPEC_TYPES.set(ev.name, ev.type);

export function initSpecPage() {
  const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
  const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

  /* ---------------------------------------------------------------- identity */
  const rand = () => Math.floor(Math.random() * 2147483647);
  const now = Math.floor(Date.now() / 1000);
  const id: Identity = {
    measurementId: MEASUREMENT_ID,
    clientId: `${rand()}.${now}`,
    sessionId: now,
    sessionNumber: 1,
    userId: null,
    analyticsGranted: false,
    adsGranted: false,
  };
  const idPane = $('[data-identity]');
  const renderIdentity = () => {
    const rows: [string, string][] = [
      ['client_id', id.analyticsGranted ? id.clientId : 'not stored (consent denied)'],
      ['session_id', String(id.sessionId)],
      ['user_id', id.userId ?? 'not set'],
      ['consent', `analytics ${id.analyticsGranted ? 'granted' : 'denied'} · ads ${id.adsGranted ? 'granted' : 'denied'}`],
    ];
    idPane.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  };
  renderIdentity();

  /* ---------------------------------------------------------------- log */
  const log: LogEntry[] = [];
  const list = $('[data-log]');
  const count = $('[data-log-count]');
  let selected: { name: string; params: Params; command: boolean; findings: Finding[]; type: string } | null = null;
  let codeTab = 'web';

  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
  const worst = (f: Finding[]) => (f.some((x) => x.level === 'error') ? 'error' : f.some((x) => x.level === 'warn') ? 'warn' : 'ok');

  function renderDetail() {
    if (!selected) return;
    const { name, params, command } = selected;
    $('[data-d-name]').textContent = command ? `gtag('${name.replace(' ', "', '")}')` : name;
    $('[data-d-type]').innerHTML = selected.type ? `<span class="ga4spec__type ga4spec__type--${selected.type}">${TYPE_LABEL[selected.type as EventType] ?? 'Not in spec'}</span>` : '';
    $('[data-d-findings]').innerHTML = selected.findings.map((f) => `<li class="is-${f.level}">${esc(f.text)}</li>`).join('');
    let code = '';
    const auto = selected.type === 'automatic';
    if (command) {
      code =
        codeTab === 'web'
          ? gtagCode(name, params, true)
          : codeTab === 'android' || codeTab === 'ios'
            ? '// Apps use setConsent(); see Setup above.'
            : codeTab === 'mp'
              ? '// The Measurement Protocol carries consent per request:\n"consent": { "ad_user_data": "GRANTED", "ad_personalization": "GRANTED" }'
              : '// Commands change settings; no request is sent.\n// Later requests carry the new state in gcs=G1' + (id.adsGranted ? 1 : 0) + (id.analyticsGranted ? 1 : 0);
    } else if (codeTab === 'web') code = auto && name !== 'page_view' ? `// ${name} is collected automatically on this platform. No code needed.` : gtagCode(name, params);
    else if (codeTab === 'android') code = (auto ? `// Logged automatically by the Firebase SDK where available.\n// Manual equivalent:\n` : '') + kotlinCode(name, params);
    else if (codeTab === 'ios') code = (auto ? `// Logged automatically by the Firebase SDK where available.\n// Manual equivalent:\n` : '') + swiftCode(name, params);
    else if (codeTab === 'mp') code = mpCode(name, params, id);
    else {
      const req = collectUrl(name, params, id);
      code = `POST ${req.url.split('?')[0]}\n\n${req.fields.map(([k, v]) => `${k.padEnd(14)} ${v}`).join('\n')}${
        id.analyticsGranted ? '' : '\n\n(cookieless ping: no cid, sid, or uid while analytics_storage is denied)'
      }`;
    }
    $('[data-d-code]').textContent = code;
  }

  function select(entry: { name: string; params: Params; command: boolean; findings: Finding[]; type: string }) {
    selected = entry;
    renderDetail();
  }

  function addLog(e: LogEntry) {
    log.unshift(e);
    count.textContent = String(log.length);
    const li = document.createElement('li');
    li.className = `ga4console__row is-${worst(e.findings)}`;
    li.innerHTML = `<button type="button"><span class="ga4console__time">${e.time}</span><code>${esc(e.command ? e.name : e.name)}</code><span class="ga4console__src">${esc(e.source)}</span></button>`;
    li.querySelector('button')!.addEventListener('click', () => {
      $$('.ga4console__row.is-selected', list).forEach((r) => r.classList.remove('is-selected'));
      li.classList.add('is-selected');
      select(e);
    });
    list.prepend(li);
    while (list.children.length > 60) list.lastElementChild!.remove();
    $$('.ga4console__row.is-selected', list).forEach((r) => r.classList.remove('is-selected'));
    li.classList.add('is-selected');
    select(e);
  }

  function record(args: unknown[], source: string) {
    const [cmd, a, b] = args as [string, unknown, unknown];
    const time = new Date().toLocaleTimeString([], { hour12: false });
    if (cmd === 'event') {
      const name = String(a);
      const params = { ...((b as Params) ?? {}) };
      const type = SPEC_TYPES.get(name) ?? 'unknown';
      addLog({ name, params, type, source, time, command: false, findings: validate(name, params) });
    } else if (cmd === 'consent') {
      const params = { ...((b as Params) ?? {}) };
      if (a === 'update' || a === 'default') {
        if ('analytics_storage' in params) id.analyticsGranted = params.analytics_storage === 'granted';
        if ('ad_storage' in params) id.adsGranted = params.ad_storage === 'granted';
        renderIdentity();
      }
      addLog({ name: `consent ${a}`, params, type: 'command', source, time, command: true, findings: [{ level: 'ok', text: 'Consent Mode v2 command.' }] });
    } else if (cmd === 'config' || cmd === 'set') {
      const params = (cmd === 'config' ? b : a) as Params | undefined;
      if (params && 'user_id' in params) {
        id.userId = (params.user_id as string | null) ?? null;
        renderIdentity();
      }
      if (cmd === 'config' && !(params && 'user_id' in params)) {
        // config sends page_view by default
        addLog({
          name: 'page_view',
          params: { page_location: location.href, page_title: document.title },
          type: 'automatic',
          source: 'config',
          time,
          command: false,
          findings: validate('page_view', { page_location: location.href, page_title: document.title }),
        });
      }
    }
  }

  // Log what the inline snippet queued, then wrap gtag so new calls are logged and animated.
  window.specLayer?.forEach((args) => record(Array.from(args as ArrayLike<unknown>), 'snippet'));
  const queue = window.specGtag as Gtag;
  let currentSource = 'page';
  const gtag: Gtag = (...args) => {
    queue(...args);
    record(args, currentSource);
    window.dispatchEvent(
      new CustomEvent('ga4:hit', { detail: { command: String(args[0]), name: args[0] === 'event' ? String(args[1]) : String(args[0]) } }),
    );
  };
  window.specGtag = gtag;

  /** Send an event from a card, filling tokens such as {value} and {location}. */
  const fireEvent = (...a: Parameters<typeof fire>) => fire(...a);
  function fire(entryEl: Element | null, name: string, params: Params = {}, tokens: Record<string, string> = {}, useExample = true) {
    const fill = (v: unknown): unknown => {
      if (typeof v !== 'string') return v;
      const t: Record<string, string> = { location: location.href, origin: location.origin, title: document.title, ...tokens };
      const whole = v.match(/^\{(\w+)\}$/);
      if (whole && whole[1] in t) return t[whole[1]];
      return v.replace(/\{(\w+)\}/g, (m, k) => t[k] ?? m);
    };
    // Missing parameters come from the spec example, unless the card computes the full set (the store).
    const specEvent = entryEl && useExample ? SPEC.find((e) => e.id === (entryEl as HTMLElement).dataset.entry)?.events.find((ev) => ev.name === name) : undefined;
    const merged = Object.fromEntries(Object.entries({ ...(specEvent?.params ?? {}), ...params }).map(([k, v]) => [k, fill(v)]));
    currentSource = entryEl ? (entryEl.querySelector('h3')?.textContent ?? 'page') : 'page';
    gtag('event', name, merged);
    currentSource = 'page';
  }
  const entryOf = (el: Element) => el.closest('[data-entry]');

  /* ---------------------------------------------------------------- spec rows: show code without firing */
  $$<HTMLButtonElement>('[data-spec]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const [entryId, idx] = btn.dataset.spec!.split(':');
      const ev = SPEC.find((e) => e.id === entryId)!.events[Number(idx)];
      const command = ev.type === 'command';
      select({ name: ev.name, params: ev.params as Params, command, findings: command ? [{ level: 'ok', text: 'Consent Mode v2 command.' }] : validate(ev.name, ev.params as Params), type: ev.type });
      openConsole();
    }),
  );

  /* ---------------------------------------------------------------- generic buttons */
  $$<HTMLButtonElement>('[data-fire]').forEach((b) =>
    b.addEventListener('click', () => fire(entryOf(b), b.dataset.fire!, JSON.parse(b.dataset.params || '{}'))),
  );

  /* ---------------------------------------------------------------- scroll */
  $$('.ga4demo__scroll').forEach((box) => {
    const sent = new Set<number>();
    box.addEventListener('scroll', () => {
      const pct = ((box.scrollTop + box.clientHeight) / box.scrollHeight) * 100;
      for (const n of [25, 50, 75, 90])
        if (pct >= n && !sent.has(n)) {
          sent.add(n);
          $(`[data-mark="${n}"]`, box).classList.add('is-hit');
          fire(entryOf(box), 'scroll', { percent_scrolled: n });
        }
    });
  });

  /* ---------------------------------------------------------------- navigation */
  $$<HTMLAnchorElement>('[data-nav]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      fire(entryOf(a), 'nav_click', { link_text: a.textContent!.trim(), link_url: a.dataset.url!, nav_location: a.dataset.nav! });
    }),
  );
  $$<HTMLAnchorElement>('[data-outbound]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const u = new URL(a.href);
      fire(entryOf(a), 'click', { link_url: a.href, link_domain: u.hostname, link_classes: a.className, link_id: a.id, outbound: true });
    }),
  );

  /* tabs */
  $$('[data-ui="tabs"]').forEach((root) => {
    const panel = $('[data-panel]', root);
    $$<HTMLButtonElement>('[role="tab"]', root).forEach((tab) =>
      tab.addEventListener('click', () => {
        if (tab.getAttribute('aria-selected') === 'true') return;
        $$('[role="tab"]', root).forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        panel.textContent = `${tab.textContent} panel.`;
        fire(entryOf(root), 'select_content', { content_type: 'tab', content_id: tab.dataset.tab! });
      }),
    );
  });

  /* accordion: expand only */
  $$<HTMLDetailsElement>('[data-faq]').forEach((d) =>
    d.addEventListener('toggle', () => {
      if (d.open) fire(entryOf(d), 'select_content', { content_type: 'faq', content_id: d.dataset.faq! });
    }),
  );

  /* carousel: user moves tracked, autoplay not */
  $$('[data-carousel]').forEach((root) => {
    const names = ['New arrivals', 'Spring sale', 'Trail guide'];
    let i = 0;
    const label = $('[data-slide-label]', root);
    const dots = $$<HTMLButtonElement>('[data-dot]', root);
    const go = (n: number, method: string | null) => {
      i = (n + names.length) % names.length;
      label.textContent = `Slide ${i + 1} of 3: ${names[i]}`;
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
      if (method) fire(entryOf(root), 'carousel_slide', { slide_index: i, slide_name: names[i], method });
    };
    go(0, null);
    $$<HTMLButtonElement>('[data-dir]', root).forEach((b) => b.addEventListener('click', () => go(i + Number(b.dataset.dir), 'arrow')));
    dots.forEach((d) => d.addEventListener('click', () => go(Number(d.dataset.dot), 'dot')));
    window.setInterval(() => go(i + 1, null), 6000);
  });

  /* search */
  $$<HTMLFormElement>('.ga4demo__search').forEach((f) =>
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const term = $<HTMLInputElement>('input', f).value.trim().toLowerCase();
      fire(entryOf(f), 'search', {}, { value: term });
    }),
  );

  /* filters and sort */
  $$('[data-ui="filters"]').forEach((root) => {
    $$<HTMLSelectElement | HTMLInputElement>('[data-filter]', root).forEach((el) =>
      el.addEventListener('change', () => {
        const on = el instanceof HTMLInputElement ? el.checked : el.value !== '';
        if (on) fire(entryOf(root), 'filter_apply', { filter_name: el.dataset.filter!, filter_value: el instanceof HTMLInputElement ? 'true' : el.value });
      }),
    );
    $<HTMLSelectElement>('[data-sort]', root).addEventListener('change', (e) =>
      fire(entryOf(root), 'sort_apply', { sort_by: (e.target as HTMLSelectElement).value }),
    );
  });

  /* form */
  $$<HTMLFormElement>('.ga4demo__form').forEach((f) => {
    let started = false;
    const status = $('[data-form-status]', f);
    const base = { form_id: f.id, form_name: f.getAttribute('name')!, form_destination: f.getAttribute('action')! };
    f.addEventListener('focusin', () => {
      if (started) return;
      started = true;
      fire(entryOf(f), 'form_start', base);
    });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $<HTMLInputElement>('input[name="email"]', f).value.trim();
      const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      if (!ok) {
        fire(entryOf(f), 'form_error', { form_id: f.id, field_name: 'email', error_type: email ? 'invalid_format' : 'required' });
        status.textContent = 'Validation failed: form_error sent with the field and rule only.';
        return;
      }
      fire(entryOf(f), 'form_submit', { ...base, form_submit_text: 'Send' });
      status.textContent = 'Submitted. Waiting for the server…';
      window.setTimeout(() => {
        fire(entryOf(f), 'generate_lead', {});
        status.textContent = 'Server accepted: generate_lead sent. The email address was never sent.';
      }, 700);
    });
  });

  /* login */
  $$('[data-ui="login"]').forEach((root) => {
    const status = $('[data-login-status]', root);
    $$<HTMLButtonElement>('[data-login]', root).forEach((b) =>
      b.addEventListener('click', () => {
        gtag('config', MEASUREMENT_ID, { user_id: 'u_48213', send_page_view: false });
        fire(entryOf(root), 'login', { method: b.dataset.login! });
        status.textContent = 'Signed in. user_id u_48213 is attached to every following event.';
      }),
    );
    $<HTMLButtonElement>('[data-logout]', root).addEventListener('click', () => {
      fire(entryOf(root), 'logout', {});
      gtag('config', MEASUREMENT_ID, { user_id: null, send_page_view: false });
      status.textContent = 'Signed out. user_id cleared after the logout event.';
    });
  });

  /* upload */
  $$<HTMLInputElement>('[data-upload]').forEach((input) =>
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'none';
      fire(entryOf(input), 'file_upload', { file_extension: ext, file_size_kb: Math.max(1, Math.round(file.size / 1024)) });
    }),
  );

  /* promotion: view at 50% visible for 1 s, select on click */
  $$('[data-promo]').forEach((el) => {
    let timer = 0;
    let seen = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (seen) return;
        if (e.isIntersecting) {
          timer = window.setTimeout(() => {
            seen = true;
            el.classList.add('is-seen');
            fire(entryOf(el), 'view_promotion', {});
            io.disconnect();
          }, 1000);
        } else window.clearTimeout(timer);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    const choose = () => fire(entryOf(el), 'select_promotion', {});
    el.addEventListener('click', choose);
    el.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') choose();
    });
  });

  /* dialog */
  $$('[data-ui="dialog"]').forEach((root) => {
    const dlg = $<HTMLDialogElement>('[data-dialog]', root);
    let method = 'escape';
    $('[data-open-dialog]', root).addEventListener('click', () => {
      method = 'escape';
      dlg.showModal();
      fire(entryOf(root), 'modal_view', {});
    });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) {
        method = 'backdrop';
        dlg.close();
      }
    });
    $$<HTMLButtonElement>('button[type="submit"]', dlg).forEach((b) => b.addEventListener('click', () => (method = b.value)));
    dlg.addEventListener('close', () => fire(entryOf(root), 'modal_close', { close_method: method }));
  });

  /* consent */
  $$('[data-ui="consent"]').forEach((root) => {
    const status = $('[data-consent-status]', root);
    $$<HTMLButtonElement>('[data-consent]', root).forEach((b) =>
      b.addEventListener('click', () => {
        const all = b.dataset.consent === 'all';
        const analytics = b.dataset.consent !== 'none';
        const g = (on: boolean) => (on ? 'granted' : 'denied');
        currentSource = 'Consent banner';
        gtag('consent', 'update', { ad_storage: g(all), ad_user_data: g(all), ad_personalization: g(all), analytics_storage: g(analytics) });
        currentSource = 'page';
        status.textContent = `Analytics ${g(analytics)}, ads ${g(all)}. Check the Request tab on any event to see gcs change.`;
      }),
    );
  });

  /* download */
  $$<HTMLAnchorElement>('[data-download]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const path = a.dataset.download!;
      fire(entryOf(a), 'file_download', {
        file_extension: path.split('.').pop()!,
        file_name: path,
        link_text: a.textContent!.trim(),
        link_url: location.origin + path,
      });
    }),
  );

  /* reactions */
  $$('[data-ui="reactions"]').forEach((root) => {
    $$<HTMLButtonElement>('[data-rate]', root).forEach((b) =>
      b.addEventListener('click', () => {
        const n = Number(b.dataset.rate);
        $$<HTMLButtonElement>('[data-rate]', root).forEach((s) => s.classList.toggle('is-on', Number(s.dataset.rate) <= n));
        fire(entryOf(root), 'content_rate', { rating: n });
      }),
    );
    const like = $<HTMLButtonElement>('[data-like]', root);
    like.addEventListener('click', () => {
      const on = like.getAttribute('aria-pressed') !== 'true';
      like.setAttribute('aria-pressed', String(on));
      like.textContent = on ? 'Liked' : 'Like';
      fire(entryOf(root), on ? 'content_like' : 'content_unlike', { content_type: 'article', content_id: 'ga4-tracking-spec' });
    });
  });

  /* video: simulated player at 10x */
  $$('[data-video]').forEach((root) => {
    const DURATION = 120;
    const playBtn = $<HTMLButtonElement>('[data-video-play]', root);
    const seek = $<HTMLInputElement>('[data-video-seek]', root);
    const time = $('[data-video-time]', root);
    const state = $('[data-video-state]', root);
    let t = 0;
    let playing = false;
    let started = false;
    let iv = 0;
    const done = new Set<number>();
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    const pos = () => ({ video_current_time: Math.round(t), video_percent: Math.round((t / DURATION) * 100), visible: true });
    const send = (name: string, extra: Params = {}) => {
      const p: Params = { ...pos(), ...extra };
      if (name === 'video_seek' || name === 'video_error') delete p.visible;
      if (name === 'video_seek') {
        delete p.video_current_time;
        delete p.video_percent;
      }
      fire(entryOf(root), name, p);
    };
    const render = () => {
      seek.value = String(Math.round(t));
      time.textContent = fmt(t);
    };
    const stop = () => {
      playing = false;
      window.clearInterval(iv);
      playBtn.textContent = 'Play';
    };
    playBtn.addEventListener('click', () => {
      if (playing) {
        stop();
        state.textContent = 'Paused';
        send('video_pause');
        return;
      }
      if (t >= DURATION) {
        t = 0;
        done.clear();
        started = false;
      }
      playing = true;
      playBtn.textContent = 'Pause';
      state.textContent = 'Playing';
      if (!started) {
        started = true;
        send('video_start', { video_current_time: Math.round(t), video_percent: 0 });
      }
      iv = window.setInterval(() => {
        t = Math.min(DURATION, t + 1);
        render();
        for (const m of [10, 25, 50, 75])
          if ((t / DURATION) * 100 >= m && !done.has(m)) {
            done.add(m);
            send('video_progress', { video_percent: m });
          }
        if (t >= DURATION) {
          stop();
          state.textContent = 'Ended';
          send('video_complete', { video_percent: 100 });
        }
      }, 100);
    });
    let from = 0;
    seek.addEventListener('pointerdown', () => (from = t));
    seek.addEventListener('keydown', () => (from = t));
    seek.addEventListener('change', () => {
      const to = Number(seek.value);
      if (to === Math.round(from)) return;
      send('video_seek', { video_seek_from: Math.round(from), video_seek_to: to });
      t = to;
      // Milestones skipped by seeking are not sent.
      for (const m of [10, 25, 50, 75]) if ((t / DURATION) * 100 >= m) done.add(m);
      render();
    });
    $('[data-video-error]', root).addEventListener('click', () => {
      stop();
      state.textContent = 'Playback failed';
      send('video_error', { error_code: 'MEDIA_ERR_NETWORK' });
    });
  });

  /* store */
  $$('[data-store]').forEach((root) => {
    const entry = entryOf(root);
    const fire = (el: Element | null, name: string, params: Params) => fireEvent(el, name, params, {}, false);
    const cart: (typeof ITEMS)[number][] = [];
    let current: (typeof ITEMS)[number] | null = null;
    let lastOrder: { id: string; value: number; items: Params[] } | null = null;
    const status = $('[data-store-status]', root);
    const total = () => cart.reduce((s, it) => s + it.price * it.quantity, 0);
    const listMeta = { item_list_id: 'running_gear', item_list_name: 'Running gear' };
    const cartItems = () => cart.map((it) => ({ ...it }));
    const renderCart = () => {
      $('[data-cart-total]', root).textContent = `$${total()}`;
      const ul = $('[data-cart]', root);
      ul.innerHTML = '';
      cart.forEach((it, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${it.item_name} × ${it.quantity}</span>`;
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'ga4btn';
        rm.textContent = 'Remove';
        rm.addEventListener('click', () => {
          const [gone] = cart.splice(i, 1);
          fire(entry, 'remove_from_cart', { currency: 'USD', value: gone.price * gone.quantity, items: [{ ...gone }] });
          renderCart();
        });
        li.append(rm);
        ul.append(li);
      });
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        fire(entry, 'view_item_list', { ...listMeta, items: ITEMS.map((it, i) => ({ ...it, index: i, ...listMeta })) });
      },
      { threshold: 0.6 },
    );
    io.observe($('[data-product-list]', root));
    $$<HTMLButtonElement>('[data-product]', root).forEach((b) =>
      b.addEventListener('click', () => {
        const i = Number(b.dataset.product);
        current = ITEMS[i];
        fire(entry, 'select_item', { ...listMeta, items: [{ ...current, index: i, ...listMeta }] });
        fire(entry, 'view_item', { currency: 'USD', value: current.price, items: [{ ...current }] });
        const d = $('[data-detail]', root);
        d.hidden = false;
        $('[data-detail-name]', root).textContent = `${current.item_name} · $${current.price}`;
      }),
    );
    $$<HTMLButtonElement>('[data-store-action]', root).forEach((b) =>
      b.addEventListener('click', () => {
        const act = b.dataset.storeAction!;
        const needCart = ['view_cart', 'checkout', 'shipping', 'payment', 'purchase'].includes(act);
        if (needCart && !cart.length) {
          status.textContent = 'Add something to the cart first.';
          return;
        }
        const base = { currency: 'USD', value: total(), items: cartItems() };
        if (act === 'wishlist' && current) fire(entry, 'add_to_wishlist', { currency: 'USD', value: current.price, items: [{ ...current }] });
        if (act === 'cart' && current) {
          const found = cart.find((c) => c.item_id === current!.item_id);
          if (found) found.quantity += 1;
          else cart.push({ ...current });
          fire(entry, 'add_to_cart', { currency: 'USD', value: current.price, items: [{ ...current }] });
          renderCart();
        }
        if (act === 'view_cart') fire(entry, 'view_cart', base);
        if (act === 'checkout') fire(entry, 'begin_checkout', base);
        if (act === 'shipping') fire(entry, 'add_shipping_info', { ...base, shipping_tier: 'ground' });
        if (act === 'payment') fire(entry, 'add_payment_info', { ...base, payment_type: 'credit_card' });
        if (act === 'purchase') {
          const tid = `T_${Date.now().toString(36).toUpperCase()}`;
          const value = total();
          fire(entry, 'purchase', { transaction_id: tid, currency: 'USD', value, tax: Math.round(value * 0.08 * 100) / 100, shipping: 0, items: cartItems() });
          lastOrder = { id: tid, value, items: cartItems() };
          cart.length = 0;
          renderCart();
          status.textContent = `Order ${tid} placed. Its transaction_id would stop a duplicate purchase on reload.`;
        }
        if (act === 'refund') {
          if (!lastOrder) {
            status.textContent = 'Place an order first.';
            return;
          }
          fire(entry, 'refund', { transaction_id: lastOrder.id, currency: 'USD', value: lastOrder.value });
          status.textContent = `Order ${lastOrder.id} refunded. A full refund needs only transaction_id; add items for a partial refund.`;
          lastOrder = null;
        }
      }),
    );
  });

  /* tv rows */
  $$('[data-tv]').forEach((root) => {
    const tiles = $$<HTMLButtonElement>('[data-tile]', root);
    const focusCount = $('[data-tv-focus]', root);
    let r = 0;
    let c = 0;
    let moves = 0;
    const tileAt = (rr: number, cc: number) => tiles.find((t) => t.dataset.tile === `${rr}:${cc}`)!;
    const focus = () => tiles.forEach((t) => t.classList.toggle('is-focus', t.dataset.tile === `${r}:${c}`));
    const choose = (t: HTMLButtonElement) => {
      const [rr, cc] = t.dataset.tile!.split(':').map(Number);
      fire(entryOf(root), 'select_content', {
        content_type: rr === 0 ? 'episode' : 'movie',
        content_id: t.dataset.content!,
        item_list_name: t.dataset.row!,
        index: cc,
      });
      fire(entryOf(root), 'screen_view', { screen_name: 'Title details', screen_class: 'DetailsScreen' });
    };
    root.addEventListener('keydown', (e) => {
      const k = (e as KeyboardEvent).key;
      const moveMap: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (moveMap[k]) {
        e.preventDefault();
        r = Math.min(1, Math.max(0, r + moveMap[k][0]));
        c = Math.min(3, Math.max(0, c + moveMap[k][1]));
        moves += 1;
        focusCount.textContent = String(moves);
        focus();
      } else if (k === 'Enter') {
        e.preventDefault();
        choose(tileAt(r, c));
      }
    });
    tiles.forEach((t) =>
      t.addEventListener('click', () => {
        [r, c] = t.dataset.tile!.split(':').map(Number);
        focus();
        choose(t);
      }),
    );
  });

  /* web vitals: this page's real LCP */
  $$('[data-ui="vitals"]').forEach((root) => {
    const status = $('[data-vitals-status]', root);
    let lcp = 0;
    try {
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1) as PerformanceEntry & { startTime: number };
        if (last) lcp = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      /* unsupported */
    }
    $('[data-vitals]', root).addEventListener('click', () => {
      const value = Math.round(lcp || performance.now());
      const rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      fire(entryOf(root), 'web_vitals', { metric_name: 'LCP', metric_value: value, metric_rating: rating, metric_id: `v4-${now}-${rand() % 1000}` });
      status.textContent = lcp ? `This page's LCP: ${value} ms (${rating}).` : 'LCP is not available in this browser; sent the time since load instead.';
    });
  });

  /* ---------------------------------------------------------------- builder */
  const bName = $<HTMLInputElement>('[data-b-name]');
  const bParams = $<HTMLTextAreaElement>('[data-b-params]');
  const bFindings = $('[data-b-findings]');
  const readBuilder = (): { name: string; params: Params; findings: Finding[] } => {
    const name = bName.value.trim();
    let params: Params = {};
    const findings: Finding[] = [];
    try {
      const parsed = JSON.parse(bParams.value || '{}');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) params = parsed;
      else findings.push({ level: 'error', text: 'Parameters must be a JSON object.' });
    } catch (err) {
      findings.push({ level: 'error', text: `Parameters are not valid JSON: ${(err as Error).message}` });
    }
    return { name, params, findings: [...findings, ...validate(name, params, { manual: true })].filter((f, _, all) => f.level !== 'ok' || all.length === 1) };
  };
  $('[data-b-check]').addEventListener('click', () => {
    const b = readBuilder();
    bFindings.innerHTML = b.findings.map((f) => `<li class="is-${f.level}">${esc(f.text)}</li>`).join('');
    select({ ...b, command: false, type: SPEC_TYPES.get(b.name) ?? 'custom' });
    openConsole();
  });
  $('[data-b-send]').addEventListener('click', () => {
    const b = readBuilder();
    bFindings.innerHTML = b.findings.map((f) => `<li class="is-${f.level}">${esc(f.text)}</li>`).join('');
    if (b.findings.some((f) => f.text.startsWith('Parameters'))) return;
    currentSource = 'Event builder';
    gtag('event', b.name, b.params);
    currentSource = 'page';
    openConsole();
  });

  /* ---------------------------------------------------------------- console chrome */
  const consoleEl = $('[data-console]');
  const toggle = $<HTMLButtonElement>('[data-console-toggle]');
  function openConsole() {
    consoleEl.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }
  toggle.addEventListener('click', () => {
    const open = !consoleEl.classList.contains('is-open');
    consoleEl.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  $('[data-console-clear]').addEventListener('click', () => {
    log.length = 0;
    list.innerHTML = '';
    count.textContent = '0';
  });
  $$<HTMLButtonElement>('[data-code]').forEach((tab) =>
    tab.addEventListener('click', () => {
      codeTab = tab.dataset.code!;
      $$('[data-code]').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      renderDetail();
    }),
  );
  $<HTMLButtonElement>('[data-copy]').addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText($('[data-d-code]').textContent ?? '');
      btn.textContent = 'Copied';
    } catch {
      btn.textContent = 'Copy failed';
    }
    window.setTimeout(() => (btn.textContent = 'Copy'), 1200);
  });

  // Expose for scripted demos and tests.
  (window as unknown as { ga4Spec: unknown }).ga4Spec = { log, identity: id };
}

declare global {
  interface Window {
    specLayer?: unknown[];
    specGtag?: (...args: unknown[]) => void;
  }
}
