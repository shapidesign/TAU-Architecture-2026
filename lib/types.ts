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
export type Presenter = { name: string; time: string };
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

// 3D building map pins — stored as JSON in settings.building_map_json
// Coords are model-native cm: x east, y north (z up).
export type BuildingMap = {
  chip_bg: string;
  chip_fg: string;
  rooms: { num: string; x: number; y: number }[];
  entrance: { x: number; y: number };
  bar: { x: number; y: number };
  wc: { x: number; y: number };
  trees: { id: string; x: number; y: number }[];
};

export const DEFAULT_BUILDING_MAP: BuildingMap = {
  chip_bg: "#FDE767",
  chip_fg: "#111111",
  rooms: [
    { num: "201", x: 3191, y: -713 },
    { num: "202", x: 2410, y: -713 },
    { num: "203", x: 1715, y: -713 },
    { num: "204", x: 901, y: -713 },
    { num: "205", x: 100, y: 63 },
    { num: "206", x: 242, y: 927 },
    { num: "207", x: 862, y: 927 },
    { num: "208", x: 1647, y: 927 },
    { num: "209", x: 2682, y: 915 },
    { num: "210", x: 3285, y: 922 },
    { num: "211", x: 3997, y: 926 },
    { num: "214", x: 7064, y: 827 },
    { num: "216", x: 7043, y: -810 },
  ],
  entrance: { x: 4250, y: -1300 },
  bar: { x: 3050, y: 80 },
  wc: { x: 5040, y: 40 },
  trees: [
    { id: "tree-west", x: 4520, y: 0 },
    { id: "tree-east", x: 5530, y: 0 },
  ],
};

export type Settings = Record<string, string>;

export function parseJson<T>(value: string | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
