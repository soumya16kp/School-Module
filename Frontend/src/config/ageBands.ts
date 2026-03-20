/**
 * Age-banded protocols for preventive health (Module A).
 * Defines which event types apply to which grade bands: K-5, 6-8, 9-12.
 */

export const AGE_BANDS = {
  K5: { label: 'K-5', classes: [1, 2, 3, 4, 5], description: 'Primary (Classes 1-5)' },
  MIDDLE: { label: '6-8', classes: [6, 7, 8], description: 'Middle School (Classes 6-8)' },
  HIGH: { label: '9-12', classes: [9, 10, 11, 12], description: 'High School (Classes 9-12)' },
} as const;

export type BandKey = keyof typeof AGE_BANDS;

/** Which grade bands each event type applies to */
export const EVENT_TYPE_BANDS: Record<string, BandKey[]> = {
  GENERAL_CHECKUP: ['K5', 'MIDDLE', 'HIGH'],
  DENTAL_SCREENING: ['K5', 'MIDDLE', 'HIGH'],
  VISION_SCREENING: ['K5', 'MIDDLE', 'HIGH'],
  BMI_ASSESSMENT: ['K5', 'MIDDLE', 'HIGH'],
  NUTRITION_SESSION: ['K5', 'MIDDLE', 'HIGH'],
  HPV_AWARENESS: ['HIGH'],
  EXPERT_SESSION: ['K5', 'MIDDLE', 'HIGH'],
  FIRE_DRILL: ['K5', 'MIDDLE', 'HIGH'],
  BLACKOUT_DRILL: ['K5', 'MIDDLE', 'HIGH'],
  BUNKER_DRILL: ['K5', 'MIDDLE', 'HIGH'],
  CPR_TRAINING: ['MIDDLE', 'HIGH'],
  FIRST_AID_TRAINING: ['MIDDLE', 'HIGH'],
  CPR_FIRST_AID_TRAINING: ['MIDDLE', 'HIGH'],
  IMMUNIZATION_DEWORMING: ['K5', 'MIDDLE', 'HIGH'],
  HYGIENE_WELLNESS: ['K5', 'MIDDLE', 'HIGH'],
  OTHER: ['K5', 'MIDDLE', 'HIGH'],
};

export function getBandsForEventType(eventType: string): BandKey[] {
  return EVENT_TYPE_BANDS[eventType] ?? ['K5', 'MIDDLE', 'HIGH'];
}

export function getEventTypesForClass(classNum: number): string[] {
  const band = Object.entries(AGE_BANDS).find(([, b]) => (b.classes as unknown as number[]).includes(classNum))?.[0] as BandKey | undefined;
  if (!band) return [];
  return Object.entries(EVENT_TYPE_BANDS)
    .filter(([, bands]) => bands.includes(band))
    .map(([type]) => type);
}

export function getBandLabelsForEventType(eventType: string): string[] {
  return getBandsForEventType(eventType).map((k) => AGE_BANDS[k].label);
}
