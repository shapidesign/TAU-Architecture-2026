export type Graduate = {
  id: string;
  name_he: string;
  name_en: string;
  name_ar: string;
  title: string;
  description: string;
  video_url: string;
  link_url: string;
  images: string[];
  sort_order: number;
};

// Presentation schedule (מועדי הגשות) — stored as JSON in settings.schedule_json
export type Presenter = { name: string; time: string; location: string };
export type Studio = {
  name: string;
  date: string;
  location: string;
  presenters: Presenter[];
};

// Arrival info (דרכי הגעה) — stored as JSON in settings.directions_json
export type DirectionSpot = {
  name: string;
  note: string;
  maps_url: string;
  waze_url: string;
};

export type Settings = Record<string, string>;

export function parseJson<T>(value: string | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
