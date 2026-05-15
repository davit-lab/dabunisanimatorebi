// Major Georgian cities with default map centers
export interface City { id: string; ka: string; en: string; lat: number; lng: number; }

export const CITIES: City[] = [
  { id: 'tbilisi',  ka: 'თბილისი',   en: 'Tbilisi',   lat: 41.7151, lng: 44.8271 },
  { id: 'batumi',   ka: 'ბათუმი',    en: 'Batumi',    lat: 41.6168, lng: 41.6367 },
  { id: 'kutaisi',  ka: 'ქუთაისი',   en: 'Kutaisi',   lat: 42.2679, lng: 42.7180 },
  { id: 'rustavi',  ka: 'რუსთავი',    en: 'Rustavi',   lat: 41.5497, lng: 44.9930 },
  { id: 'gori',     ka: 'გორი',      en: 'Gori',      lat: 41.9847, lng: 44.1086 },
  { id: 'zugdidi',  ka: 'ზუგდიდი',   en: 'Zugdidi',   lat: 42.5088, lng: 41.8709 },
  { id: 'poti',     ka: 'ფოთი',      en: 'Poti',      lat: 42.1500, lng: 41.6700 },
  { id: 'telavi',   ka: 'თელავი',    en: 'Telavi',    lat: 41.9197, lng: 45.4731 },
  { id: 'akhaltsikhe', ka: 'ახალციხე', en: 'Akhaltsikhe', lat: 41.6394, lng: 42.9856 },
  { id: 'mtskheta', ka: 'მცხეთა',    en: 'Mtskheta',  lat: 41.8458, lng: 44.7203 },
];

export const DEFAULT_CITY = CITIES[0];
