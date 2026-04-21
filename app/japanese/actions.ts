"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getSentences() {
  const { data, error } = await supabase
    .from("japanese_sentences")
    .select("id, sentence, translation")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addSentence(formData: FormData) {
  const sentence = (formData.get("sentence") as string)?.trim();
  if (!sentence) return;

  // Auto translate Japanese → Chinese
  let translation = "";
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=ja|zh-CN`
    );
    const data = await res.json();
    translation = data.responseData?.translatedText || "";
  } catch {
    translation = "(翻译失败)";
  }

  const { error } = await supabase
    .from("japanese_sentences")
    .insert({ sentence, translation });
  if (error) throw error;

  revalidatePath("/japanese");
}

export async function deleteSentence(id: number) {
  const { error } = await supabase
    .from("japanese_sentences")
    .delete()
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/japanese");
}
