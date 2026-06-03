import type { Metadata } from "next";
import "./page.css";
import JapaneseWordGame from "./JapaneseWordGame";

export const metadata: Metadata = {
  title: "日语动词变形辨识游戏",
  description:
    "识别给出的动词变形，练习并区分可能形、被动形、使役形、使役被动形，覆盖一类、二类、三类动词。",
};

export default function JapaneseWordPage() {
  return <JapaneseWordGame />;
}
