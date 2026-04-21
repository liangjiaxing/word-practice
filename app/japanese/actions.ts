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
  const translation = (formData.get("translation") as string)?.trim();
  if (!sentence || !translation) return;

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
