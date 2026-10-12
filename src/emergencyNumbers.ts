export interface EmergencyNumber {
  label: string;
  display: string;
  dial: string;
}

/**
 * Static reference numbers shown (tap-to-call) at the top of Familia's "Plan de emergencia"
 * mode — not user data, so it's a plain constant rather than something stored/edited. `dial`
 * is digits-only for Linking.openURL('tel:...'); `display` keeps the number readable.
 */
export const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  { label: 'Emergencias', display: '911', dial: '911' },
  { label: 'SAME', display: '107', dial: '107' },
  { label: 'Bomberos', display: '100', dial: '100' },
  { label: 'Defensa Civil Rosario', display: '0341 480-2100', dial: '03414802100' },
];
