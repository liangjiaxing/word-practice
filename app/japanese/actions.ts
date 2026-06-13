"use server";

import { hasSupabaseEnv } from "@/lib/supabaseEnv";
import { revalidatePath } from "next/cache";

export async function getSentences() {
  if (!hasSupabaseEnv()) return [];
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data, error } = await supabase
    .from("japanese_sentences")
    .select("id, sentence, translation")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addSentence(formData: FormData) {
  if (!hasSupabaseEnv()) return;
  const sentence = (formData.get("sentence") as string)?.trim();
  if (!sentence) return;

  let translation = "";
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=ja|zh-CN`,
    );
    const data = await res.json();
    translation = data.responseData?.translatedText || "";
  } catch {
    translation = "(翻译失败)";
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { error } = await supabase
    .from("japanese_sentences")
    .insert({ sentence, translation });
  if (error) throw error;

  revalidatePath("/japanese");
}

export async function deleteSentence(id: number) {
  if (!hasSupabaseEnv()) return;
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { error } = await supabase
    .from("japanese_sentences")
    .delete()
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/japanese");
}