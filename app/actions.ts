"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addWord(formData: FormData) {
  const word = (formData.get("word") as string)?.trim().toLowerCase();
  if (!word) return;

  // Check duplicate
  const { data: existing } = await supabase
    .from("words")
    .select("id")
    .eq("word", word)
    .single();

  if (existing) return;

  const { error } = await supabase.from("words").insert({ word });
  if (error) throw error;

  revalidatePath("/");
}

export async function deleteWord(id: number) {
  const { error } = await supabase.from("words").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/");
}
