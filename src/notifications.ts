import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { GearItem } from './types';
import { addMonths, computeAlerts, parseExpiry } from './alerts';

const SETTINGS_KEY = 'gonza:notifications';
const CHANNEL = 'avisos';
const HOUR = 9;
const MAX_SCHEDULED = 60;

export interface ReminderSettings {
  enabled: boolean;
  /** How many days before an expiry or a due check to remind. */
  leadDays: number;
}

export const DEFAULT_SETTINGS: ReminderSettings = { enabled: false, leadDays: 7 };

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function loadReminderSettings(): Promise<ReminderSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveReminderSettings(s: ReminderSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

/** Asks for the notification permission (Android 13+) and creates the channel; true when granted. */
export async function ensureReminderPermission(): Promise<boolean> {
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Avisos de equipo',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

function atNine(d: Date) {
  const x = new Date(d.getTime());
  x.setHours(HOUR, 0, 0, 0);
  return x;
}

async function schedule(title: string, body: string, date: Date) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL },
  });
}

/**
 * Rebuilds every local reminder from the current gear: cancels the old ones, then schedules (a) a reminder
 * `leadDays` before each expiry, (b) one when each periodic check falls due, and (c) a next-morning digest
 * if anything already needs attention. Called whenever Inicio sees new data, so edits are reflected without
 * tracking individual notifications. The in-app "Para revisar" card stays the reliable source — Android may
 * delay notifications for apps in battery-saving mode.
 */
export async function rescheduleReminders(items: GearItem[]): Promise<void> {
  const settings = await loadReminderSettings();
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.enabled) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  const now = new Date();
  const jobs: { title: string; body: string; date: Date }[] = [];

  for (const it of items) {
    const exp = parseExpiry(it.expiresAt);
    if (exp) {
      const lead = atNine(new Date(exp.getTime() - settings.leadDays * 86400000));
      if (lead > now) jobs.push({ title: 'Se acerca un vencimiento', body: `${it.name} vence en ${settings.leadDays} días.`, date: lead });
      const day = atNine(exp);
      if (day > now) jobs.push({ title: 'Vence hoy', body: `${it.name} vence hoy.`, date: day });
    }
    if (it.reviewEveryMonths && it.lastReviewedAt) {
      const last = new Date(it.lastReviewedAt);
      if (!isNaN(last.getTime())) {
        const due = atNine(addMonths(last, it.reviewEveryMonths));
        if (due > now) jobs.push({ title: 'Toca revisar', body: `${it.name}: control de ${it.reviewEveryMonths} meses.`, date: due });
      }
    }
  }

  const { total } = computeAlerts(items, now);
  if (total > 0) {
    const tomorrow = atNine(new Date(now.getTime() + 86400000));
    jobs.push({ title: 'Preparacionista', body: `Tenés ${total} ${total === 1 ? 'cosa' : 'cosas'} para revisar en tu equipo.`, date: tomorrow });
  }

  jobs.sort((a, b) => a.date.getTime() - b.date.getTime());
  for (const j of jobs.slice(0, MAX_SCHEDULED)) {
    await schedule(j.title, j.body, j.date);
  }
}
