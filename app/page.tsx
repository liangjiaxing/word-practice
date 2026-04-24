import { supabase } from "@/lib/supabase";
import WordItem from "./components/WordItem";
import AddWordForm from "./components/AddWordForm";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: words } = await supabase
    .from("words")
    .select("id, word")
    .order("created_at", { ascending: false });

  return (
    <main className="app">
      <h1>Word Pronunciation Practice</h1>
      <p className="subtitle">
        Add an English word, listen, record your pronunciation, and get a score.
      </p>

      <AddWordForm />

      <ul className="word-list" aria-label="Word list">
        {words?.map((w) => (
          <WordItem key={w.id} id={w.id} word={w.word} />
        ))}
      </ul>
    </main>
  );
}
