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
  dates: "9.8",
  opening_he: "18:30 | אירוע פתיחה",
  opening_time: "9-13.8 - הגשות פתוחות",
  location_he: "בניין דה-בוטון\nאוניברסיטת תל-אביב",
  box_color: "#FDE767",
  bg_color: "#D6D6D6",
  // logo (uploaded via admin), position is physical left/right
  logo_url: "/logo-horizontal-8.png",
  logo_pos: "left",
  // typography of the three main title lines: size px, weight, line-height,
  // style: normal | outline | mixed (first word outlined)
  t_he_size: "36",
  t_he_weight: "900",
  t_he_lh: "1.15",
  t_he_style: "mixed",
  t_en_size: "36",
  t_en_weight: "900",
  t_en_lh: "1.15",
  t_en_style: "normal",
  t_ar_size: "34",
  t_ar_weight: "700",
  t_ar_lh: "1.4",
  t_ar_style: "outline",
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
