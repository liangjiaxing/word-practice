import { supabase } from "@/lib/supabase";
import PracticeModes from "./components/PracticeModes";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: words } = await supabase
    .from("words")
    .select("id, word")
    .order("created_at", { ascending: false });

  const wordRows = words ?? [];

  return (
    <main className="app">
      <h1>Word Pronunciation Practice</h1>
      <p className="subtitle">
        Add an English word, listen, record your pronunciation, and get a score.
      </p>

      <PracticeModes words={wordRows} />
    </main>
  );
}
