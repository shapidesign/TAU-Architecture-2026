"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin, loginWithCredentials, logout } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/data";
import { sb } from "@/lib/supabase";

export type ActionState = { ok: boolean; error?: string };

function refresh() {
  revalidatePath("/", "layout");
}

export async function loginAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const ok = await loginWithCredentials(
    String(fd.get("user") ?? ""),
    String(fd.get("pass") ?? "")
  );
  if (ok) refresh();
  return ok ? { ok: true } : { ok: false, error: "שם משתמש או סיסמה שגויים" };
}

export async function logoutAction(): Promise<void> {
  await logout();
  refresh();
}

export async function saveSettings(fd: FormData): Promise<void> {
  await assertAdmin();
  const rows = Object.keys(DEFAULT_SETTINGS)
    .filter((key) => fd.has(key))
    .map((key) => ({ key, value: String(fd.get(key)) }));
  const { error } = await sb().from("settings").upsert(rows);
  if (error) throw new Error(error.message);
  refresh();
}

export async function saveLogo(fd: FormData): Promise<void> {
  await assertAdmin();
  let url = String(fd.get("current_logo") ?? "");
  const file = fd.get("logo") as File | null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop() || "png";
    const path = `branding/logo-${Date.now()}.${ext}`;
    const { error } = await sb()
      .storage.from("projects")
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type || "image/png",
      });
    if (error) throw new Error(error.message);
    url = sb().storage.from("projects").getPublicUrl(path).data.publicUrl;
  }
  const { error } = await sb()
    .from("settings")
    .upsert([
      { key: "logo_url", value: url },
      { key: "logo_pos", value: String(fd.get("logo_pos") ?? "right") },
    ]);
  if (error) throw new Error(error.message);
  refresh();
}

export async function removeLogo(): Promise<void> {
  await assertAdmin();
  const { error } = await sb()
    .from("settings")
    .upsert([{ key: "logo_url", value: "" }]);
  if (error) throw new Error(error.message);
  refresh();
}

async function uploadImages(gradId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${gradId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb()
      .storage.from("projects")
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type || "image/jpeg",
      });
    if (error) throw new Error(error.message);
    urls.push(sb().storage.from("projects").getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

function gradFields(fd: FormData) {
  return {
    name_he: String(fd.get("name_he") ?? ""),
    name_en: String(fd.get("name_en") ?? ""),
    name_ar: String(fd.get("name_ar") ?? ""),
    title: String(fd.get("title") ?? ""),
    description: String(fd.get("description") ?? ""),
    video_url: String(fd.get("video_url") ?? ""),
    link_url: String(fd.get("link_url") ?? ""),
    sort_order: Number(fd.get("sort_order") ?? 0) || 0,
  };
}

export async function createGraduate(fd: FormData): Promise<void> {
  await assertAdmin();
  const { data, error } = await sb()
    .from("graduates")
    .insert(gradFields(fd))
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const files = fd.getAll("new_images") as File[];
  if (files.length) {
    const urls = await uploadImages(data.id, files);
    if (urls.length) {
      await sb().from("graduates").update({ images: urls }).eq("id", data.id);
    }
  }
  refresh();
}

export async function updateGraduate(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id"));
  const kept = fd.getAll("kept_images").map(String);
  const added = await uploadImages(id, fd.getAll("new_images") as File[]);
  const { error } = await sb()
    .from("graduates")
    .update({ ...gradFields(fd), images: [...kept, ...added] })
    .eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteGraduate(fd: FormData): Promise<void> {
  await assertAdmin();
  const { error } = await sb()
    .from("graduates")
    .delete()
    .eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}

export async function createFaculty(fd: FormData): Promise<void> {
  await assertAdmin();
  const { error } = await sb().from("faculty").insert({
    name_he: String(fd.get("name_he") ?? ""),
    name_en: String(fd.get("name_en") ?? ""),
    role: String(fd.get("role") ?? ""),
    sort_order: Number(fd.get("sort_order") ?? 0) || 0,
  });
  if (error) throw new Error(error.message);
  refresh();
}

export async function updateFaculty(fd: FormData): Promise<void> {
  await assertAdmin();
  const { error } = await sb()
    .from("faculty")
    .update({
      name_he: String(fd.get("name_he") ?? ""),
      name_en: String(fd.get("name_en") ?? ""),
      role: String(fd.get("role") ?? ""),
      sort_order: Number(fd.get("sort_order") ?? 0) || 0,
    })
    .eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteFaculty(fd: FormData): Promise<void> {
  await assertAdmin();
  const { error } = await sb()
    .from("faculty")
    .delete()
    .eq("id", String(fd.get("id")));
  if (error) throw new Error(error.message);
  refresh();
}
