import type { Metadata } from "next";
import "./page.css";
import JapaneseWordGame from "./JapaneseWordGame";

export const metadata: Metadata = {
  title: "日语单词变形记忆游戏",
  description: "练习日语动词各种词形，包括可能形、命令形、意向形、て形、た形和ない形。",
};

export default function JapaneseWordPage() {
  return <JapaneseWordGame />;
}
