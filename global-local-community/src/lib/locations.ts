export const KOREA_CITIES = ['Seoul', 'Busan', 'Daegu', 'Incheon', 'Daejeon', 'Gwangju', 'Ulsan', 'Jeju', 'Other'] as const;

export type KoreaCity = (typeof KOREA_CITIES)[number];

export function normalizeCity(value?: string | null) {
  const city = (value ?? '').trim();
  if (!city) return 'Other';
  if (KOREA_CITIES.includes(city as KoreaCity)) return city as KoreaCity;
  return city;
}

export function cityScopeLabel(city?: string | null, district?: string | null) {
  const normalizedCity = normalizeCity(city);
  if (district) return `${district}, ${normalizedCity}`;
  return normalizedCity;
}
