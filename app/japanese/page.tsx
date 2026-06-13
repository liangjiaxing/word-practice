import { hasSupabaseEnv } from "@/lib/supabaseEnv";
import SentenceItem from "./components/SentenceItem";
import AddSentenceForm from "./components/AddSentenceForm";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function JapanesePage() {
  const sentences = hasSupabaseEnv()
    ? await (async () => {
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase
          .from("japanese_sentences")
          .select("id, sentence, translation")
          .order("created_at", { ascending: true });
        return data ?? [];
      })()
    : [];

  return (
    <main className="app">
      <h1>日语句子朗读练习</h1>
      <p className="subtitle">添加日语句子，点击朗读按钮听发音。</p>
      <AddSentenceForm />
      <ul className="sentence-list">
        {sentences.map((s) => (
          <SentenceItem
            key={s.id}
            id={s.id}
            sentence={s.sentence}
            translation={s.translation}
          />
        ))}
      </ul>
    </main>
  );
}