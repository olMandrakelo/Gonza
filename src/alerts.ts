import { GearItem } from './types';

export const SOON_DAYS = 30;
const REVIEW_LEAD_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

/** Parses "MM/AAAA" (expires at the end of that month) or "DD/MM/AAAA"; null when it isn't a valid date. */
export function parseExpiry(text: string | undefined): Date | null {
  if (!text) return null;
  const m = text.trim().match(/^(?:(\d{1,2})\/)?(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12) return null;
  if (m[1] === undefined) return new Date(year, month, 0, 23, 59, 59);
  const day = Number(m[1]);
  const d = new Date(year, month - 1, day, 23, 59, 59);
  return d.getMonth() === month - 1 ? d : null;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  return d;
}

export type AlertKind = 'vencido' | 'vence' | 'control';

export interface GearAlert {
  item: GearItem;
  kind: AlertKind;
  /** The expiry date, or the date the next check is due. */
  date: Date;
  /** Whole days until `date`; negative when it has already passed. */
  daysLeft: number;
}

export interface Alerts {
  expired: GearAlert[];
  soon: GearAlert[];
  reviews: GearAlert[];
  total: number;
}

function daysUntil(date: Date, now: Date) {
  return Math.ceil((date.getTime() - now.getTime()) / DAY);
}

/** Single source for "what needs attention": used by Inicio and (later) the notification scheduler. */
export function computeAlerts(items: GearItem[], now: Date = new Date()): Alerts {
  const expired: GearAlert[] = [];
  const soon: GearAlert[] = [];
  const reviews: GearAlert[] = [];

  for (const item of items) {
    const exp = parseExpiry(item.expiresAt);
    if (exp) {
      const daysLeft = daysUntil(exp, now);
      if (daysLeft < 0) expired.push({ item, kind: 'vencido', date: exp, daysLeft });
      else if (daysLeft <= SOON_DAYS) soon.push({ item, kind: 'vence', date: exp, daysLeft });
    }
    if (item.reviewEveryMonths && item.reviewEveryMonths > 0) {
      const last = item.lastReviewedAt ? new Date(item.lastReviewedAt) : null;
      const due = last && !isNaN(last.getTime()) ? addMonths(last, item.reviewEveryMonths) : now;
      const daysLeft = daysUntil(due, now);
      if (daysLeft <= REVIEW_LEAD_DAYS) reviews.push({ item, kind: 'control', date: due, daysLeft });
    }
  }

  const byDate = (a: GearAlert, b: GearAlert) => a.date.getTime() - b.date.getTime();
  expired.sort(byDate);
  soon.sort(byDate);
  reviews.sort(byDate);
  return { expired, soon, reviews, total: expired.length + soon.length + reviews.length };
}
