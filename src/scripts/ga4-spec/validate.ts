/**
 * Checks an event against GA4's collection rules and this spec's conventions.
 * Limits are for standard (non-360) properties.
 */

export type Level = 'error' | 'warn' | 'ok';
export interface Finding {
  level: Level;
  text: string;
}

const NAME_RE = /^[A-Za-z][A-Za-z0-9_]*$/;
const RESERVED_PREFIXES = ['_', 'firebase_', 'ga_', 'google_', 'gtag.'];
/** Names GA4 collects itself; sending them manually is rejected or double-counted. */
export const RESERVED_EVENTS = [
  'ad_activeview', 'ad_click', 'ad_exposure', 'ad_query', 'ad_reward', 'adunit_exposure', 'app_clear_data', 'app_exception',
  'app_install', 'app_remove', 'app_store_refund', 'app_update', 'app_upgrade', 'dynamic_link_app_open', 'dynamic_link_app_update',
  'dynamic_link_first_open', 'error', 'first_open', 'first_visit', 'in_app_purchase', 'notification_dismiss', 'notification_foreground',
  'notification_open', 'notification_receive', 'os_update', 'session_start', 'user_engagement',
];
const ECOMMERCE_ITEMS_REQUIRED = [
  'view_item_list', 'select_item', 'view_item', 'add_to_wishlist', 'add_to_cart', 'remove_from_cart', 'view_cart',
  'begin_checkout', 'add_shipping_info', 'add_payment_info', 'purchase',
];
const LONG_VALUES: Record<string, number> = { page_location: 1000, page_referrer: 420, page_title: 300 };
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
/** Needs separators, so IDs and timestamps do not match. */
const PHONE = /(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;

export function validate(name: string, params: Record<string, unknown>, opts: { manual?: boolean } = {}): Finding[] {
  const out: Finding[] = [];
  const err = (text: string) => out.push({ level: 'error', text });
  const warn = (text: string) => out.push({ level: 'warn', text });

  if (!name) err('Event name is empty.');
  else {
    if (name.length > 40) err(`Event name is ${name.length} characters; the limit is 40.`);
    if (!NAME_RE.test(name)) err('Event names must start with a letter and use only letters, numbers, and underscores.');
    if (RESERVED_PREFIXES.some((p) => name.startsWith(p))) err('Names starting with _, firebase_, ga_, google_, or gtag. are reserved.');
    if (opts.manual && RESERVED_EVENTS.includes(name)) err(`${name} is collected automatically. Do not send it yourself.`);
    if (/[A-Z]/.test(name)) warn('Use snake_case. Names are case-sensitive, so Sign_Up and sign_up become two events.');
  }

  const keys = Object.keys(params);
  if (keys.length > 25) err(`${keys.length} parameters; the limit is 25 per event.`);
  for (const k of keys) {
    if (k.length > 40) err(`Parameter "${k}" is longer than 40 characters.`);
    if (!NAME_RE.test(k)) err(`Parameter "${k}" must start with a letter and use only letters, numbers, and underscores.`);
    if (RESERVED_PREFIXES.some((p) => k.startsWith(p))) err(`Parameter "${k}" uses a reserved prefix.`);
    const v = params[k];
    if (typeof v === 'string') {
      const max = LONG_VALUES[k] ?? 100;
      if (v.length > max) err(`"${k}" is ${v.length} characters; values over ${max} are truncated.`);
      if (EMAIL.test(v)) err(`"${k}" looks like it contains an email address. Personal data is not allowed in GA4.`);
      else if (PHONE.test(v)) warn(`"${k}" looks like it may contain a phone number.`);
    }
    if (k !== 'items' && Array.isArray(v)) err(`"${k}" is an array; only items may be an array.`);
  }

  if ('value' in params && !('currency' in params) && !name.includes('virtual_currency')) err('value is sent without currency; GA4 ignores the revenue.');
  if (ECOMMERCE_ITEMS_REQUIRED.includes(name)) {
    const items = params.items;
    if (!Array.isArray(items) || !items.length) err(`${name} needs an items array.`);
    else {
      if (items.length > 200) err('More than 200 items in one event.');
      items.forEach((it, i) => {
        const o = it as Record<string, unknown>;
        if (!o.item_id && !o.item_name) err(`items[${i}] needs item_id or item_name.`);
      });
    }
  }
  if (name === 'purchase' && !params.transaction_id) warn('purchase without transaction_id cannot be deduplicated.');
  if (name === 'search' && typeof params.search_term === 'string' && !params.search_term.trim()) warn('search_term is empty.');

  if (!out.length) out.push({ level: 'ok', text: 'Follows GA4 naming rules and limits.' });
  return out;
}
