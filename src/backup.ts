import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const FORMAT = 'preparacionista-backup';
const PREFIX = 'gonza:';
const SEEDED_FLAG = 'gonza:seeded-checklist-dia-cero';

export interface BackupFile {
  data: Record<string, string>;
  exportedAt: string;
}

/** Writes every `gonza:*` key to a JSON file and opens the share sheet so it can be saved or sent. */
export async function exportBackup(): Promise<void> {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  const pairs = await AsyncStorage.multiGet(keys);
  const data: Record<string, string> = {};
  for (const [k, v] of pairs) if (v !== null) data[k] = v;
  const exportedAt = new Date().toISOString();
  const json = JSON.stringify({ format: FORMAT, version: 1, exportedAt, data });
  const uri = `${FileSystem.cacheDirectory}preparacionista-copia-${exportedAt.slice(0, 10)}.json`;
  await FileSystem.writeAsStringAsync(uri, json);
  if (!(await Sharing.isAvailableAsync())) throw new Error('Compartir no está disponible en este dispositivo.');
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Guardar copia de Preparacionista' });
}

/** Lets the user pick a backup file; returns null when cancelled and throws if it isn't one of ours. */
export async function pickBackup(): Promise<BackupFile | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/*', '*/*'], copyToCacheDirectory: true });
  if (res.canceled || !res.assets?.[0]) return null;
  const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es una copia válida.');
  }
  if (parsed?.format !== FORMAT || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new Error('Ese archivo no es una copia de Preparacionista.');
  }
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (k.startsWith(PREFIX) && typeof v === 'string') data[k] = v;
  }
  return { data, exportedAt: String(parsed.exportedAt ?? '') };
}

/** Replaces all current app data with the backup's. The seed flag is always set so the starter list doesn't reload over it. */
export async function applyBackup(backup: BackupFile): Promise<void> {
  const current = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  if (current.length) await AsyncStorage.multiRemove(current);
  const entries = Object.entries({ ...backup.data, [SEEDED_FLAG]: 'done' });
  await AsyncStorage.multiSet(entries);
}
