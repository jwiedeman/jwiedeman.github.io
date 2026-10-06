/**
 * One GA4 event, written four ways: web (gtag.js), Android (Kotlin),
 * iOS (Swift), and the Measurement Protocol (TV apps and servers), plus the
 * /g/collect request gtag.js would send.
 */

export type Params = Record<string, unknown>;
export interface Identity {
  measurementId: string;
  clientId: string;
  sessionId: number;
  sessionNumber: number;
  userId: string | null;
  analyticsGranted: boolean;
  adsGranted: boolean;
}

const MONEY = new Set(['value', 'price', 'tax', 'shipping']);
const money = (v: unknown) => (Number.isInteger(Number(v)) ? `${Number(v)}.0` : String(Number(v)));
const isItems = (v: unknown): v is Record<string, unknown>[] => Array.isArray(v);
const json = (v: unknown) => JSON.stringify(v);
const indent = (s: string, n: number) => s.replace(/\n/g, `\n${' '.repeat(n)}`);

function jsValue(v: unknown, depth = 1): string {
  if (isItems(v)) {
    const pad = '  '.repeat(depth + 1);
    const inner = v.map((it) => `${pad}{ ${Object.entries(it).map(([k, x]) => `${k}: ${jsValue(x)}`).join(', ')} }`).join(',\n');
    return `[\n${inner}\n${'  '.repeat(depth)}]`;
  }
  return typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : String(v);
}

export function gtagCode(name: string, params: Params, command = false): string {
  const entries = Object.entries(params);
  if (command) {
    const [verb, sub] = name.split(' ');
    return `gtag('${verb}', '${sub}', {\n${entries.map(([k, v]) => `  ${k}: ${jsValue(v)}`).join(',\n')}\n});`;
  }
  if (!entries.length) return `gtag('event', '${name}');`;
  return `gtag('event', '${name}', {\n${entries.map(([k, v]) => `  ${k}: ${jsValue(v)}`).join(',\n')}\n});`;
}

/** Firebase parameters are strings, longs, or doubles; booleans go as strings. */
function kotlinValue(v: unknown): string {
  if (typeof v === 'number') return Number.isInteger(v) ? `${v}L` : `${v}`;
  if (typeof v === 'boolean') return `"${v}"`;
  return json(String(v));
}

export function kotlinCode(name: string, params: Params): string {
  const lines: string[] = [];
  const pre: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (isItems(v)) {
      const names = v.map((it, i) => {
        const id = `item${i + 1}`;
        const puts = Object.entries(it).map(([ik, iv]) =>
          typeof iv === 'number'
            ? Number.isInteger(iv) && !MONEY.has(ik)
              ? `    putLong("${ik}", ${iv}L)`
              : `    putDouble("${ik}", ${money(iv)})`
            : `    putString("${ik}", ${json(String(iv))})`,
        );
        pre.push(`val ${id} = Bundle().apply {\n${puts.join('\n')}\n}`);
        return id;
      });
      lines.push(`    param("${k}", arrayOf(${names.join(', ')}))`);
    } else {
      const val = MONEY.has(k) ? money(v) : kotlinValue(v);
      lines.push(`    param("${k}", ${val})`);
    }
  }
  const body = lines.length ? `firebaseAnalytics.logEvent("${name}") {\n${lines.join('\n')}\n}` : `firebaseAnalytics.logEvent("${name}", null)`;
  return [...pre, body].join('\n\n');
}

function swiftValue(v: unknown, key = ''): string {
  if (typeof v === 'boolean') return `"${v}"`;
  if (MONEY.has(key)) return money(v);
  if (typeof v === 'number') return String(v);
  return json(String(v));
}

export function swiftCode(name: string, params: Params): string {
  const pre: string[] = [];
  const lines: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (isItems(v)) {
      const names = v.map((it, i) => {
        const id = `item${i + 1}`;
        pre.push(`let ${id}: [String: Any] = [\n${Object.entries(it).map(([ik, iv]) => `  "${ik}": ${swiftValue(iv, ik)}`).join(',\n')}\n]`);
        return id;
      });
      lines.push(`  "${k}": [${names.join(', ')}]`);
    } else lines.push(`  "${k}": ${swiftValue(v, k)}`);
  }
  const body = lines.length
    ? `Analytics.logEvent("${name}", parameters: [\n${lines.join(',\n')}\n])`
    : `Analytics.logEvent("${name}", parameters: nil)`;
  return [...pre, body].join('\n\n');
}

export function mpCode(name: string, params: Params, id: Identity): string {
  const body: Record<string, unknown> = { client_id: id.clientId };
  if (id.userId) body.user_id = id.userId;
  body.consent = { ad_user_data: id.adsGranted ? 'GRANTED' : 'DENIED', ad_personalization: id.adsGranted ? 'GRANTED' : 'DENIED' };
  body.events = [{ name, params: { ...params, session_id: String(id.sessionId), engagement_time_msec: 100 } }];
  return [
    `POST https://www.google-analytics.com/mp/collect`,
    `     ?measurement_id=${id.measurementId}&api_secret=<API_SECRET>`,
    `Content-Type: application/json`,
    ``,
    indent(JSON.stringify(body, null, 2), 0),
  ].join('\n');
}

/** The /g/collect request gtag.js would send (simplified: one event per request). */
export function collectUrl(name: string, params: Params, id: Identity): { url: string; fields: [string, string][] } {
  const f: [string, string][] = [
    ['v', '2'],
    ['tid', id.measurementId],
    ['gcs', `G1${id.adsGranted ? 1 : 0}${id.analyticsGranted ? 1 : 0}`],
  ];
  if (id.analyticsGranted) {
    f.push(['cid', id.clientId], ['sid', String(id.sessionId)], ['sct', String(id.sessionNumber)], ['seg', '1']);
    if (id.userId) f.push(['uid', id.userId]);
  }
  f.push(['dl', location.origin + location.pathname], ['dt', document.title], ['en', name]);
  let itemN = 0;
  for (const [k, v] of Object.entries(params)) {
    if (isItems(v)) {
      for (const it of v) {
        itemN += 1;
        const map: Record<string, string> = { item_id: 'id', item_name: 'nm', item_brand: 'br', item_category: 'ca', item_variant: 'va', price: 'pr', quantity: 'qt', index: 'lp' };
        const parts = Object.entries(it)
          .filter(([ik]) => map[ik])
          .map(([ik, iv]) => `${map[ik]}${iv}`);
        f.push([`pr${itemN}`, parts.join('~')]);
      }
    } else if (k === 'currency') f.push(['cu', String(v)]);
    else if (typeof v === 'number') f.push([`epn.${k}`, String(v)]);
    else f.push([`ep.${k}`, String(v)]);
  }
  const qs = f.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return { url: `https://region1.google-analytics.com/g/collect?${qs}`, fields: f };
}
