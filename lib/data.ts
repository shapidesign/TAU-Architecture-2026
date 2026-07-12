import { sb } from "./supabase";
import type { Faculty, Graduate, Settings } from "./types";

// Poster defaults — the site renders even before/without the database.
export const DEFAULT_SETTINGS: Settings = {
  exh_he: "תערוכות בוגרים.ות",
  exh_en: "Graduate Exhibition",
  exh_ar: "معرض الخريجين",
  faculty_he: "הפקולטה לאדריכלות ע״ש דוד עזריאלי",
  title_he: "אדריכלות במעבר",
  title_en_prefix: "Architecture in",
  title_ar: "عمارة قيد الانتقال",
  dates: "09.08–13.08",
  opening_he: "אירוע הפתיחה",
  opening_time: "18:30 09.08",
  location_he: "בניין דה בוטון, אוני׳ תל אביב",
  box_color: "#FDE767",
  bg_color: "#D6D6D6",
};

export async function getSettings(): Promise<Settings> {
  try {
    const { data } = await sb().from("settings").select("key,value");
    return {
      ...DEFAULT_SETTINGS,
      ...Object.fromEntries((data ?? []).map((r) => [r.key, r.value])),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function getGraduates(): Promise<Graduate[]> {
  try {
    const { data } = await sb()
      .from("graduates")
      .select("*")
      .order("sort_order")
      .order("name_he");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getGraduate(id: string): Promise<Graduate | null> {
  try {
    const { data } = await sb().from("graduates").select("*").eq("id", id).single();
    return data;
  } catch {
    return null;
  }
}

export async function getFaculty(): Promise<Faculty[]> {
  try {
    const { data } = await sb()
      .from("faculty")
      .select("*")
      .order("sort_order")
      .order("name_he");
    return data ?? [];
  } catch {
    return [];
  }
}
