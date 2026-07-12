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

export type Faculty = {
  id: string;
  name_he: string;
  name_en: string;
  role: string;
  sort_order: number;
};

export type Settings = Record<string, string>;
