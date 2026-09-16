import { hasSupabaseEnv } from "@/lib/supabaseEnv";
import ClockReadingLink from "./clock-reading/ClockReadingLink";
import PracticeModes from "./components/PracticeModes";
import SightReaderLink from "./sight-reader/SightReaderLink";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const wordRows = hasSupabaseEnv()
    ? await (async () => {
        const { supabase } = await import("@/lib/supabase");
        const { data: words } = await supabase
          .from("words")
          .select("id, word")
          .order("created_at", { ascending: false });
        return words ?? [];
      })()
    : [];

  return (
    <main className="app">
      <h1>Word Pronunciation Practice</h1>
      <p className="subtitle">
        Add an English word, listen, record your pronunciation, and get a score.
      </p>
      <PracticeModes words={wordRows} />

      <hr />

      <section>
        <h2>Sight Reader</h2>
        <p>五线谱辨识：从 C D E F G A B 里选音名，共 10 题并打分。</p>
        <SightReaderLink />
      </section>

      <hr />

      <section>
        <h2>认时钟</h2>
        <p>看钟面读时间，练习整点、半点与 5 分钟刻度，每轮 10 题。</p>
        <ClockReadingLink />
      </section>
    </main>
  );
}