import type { Metadata } from "next";
import "./page.css";
import ClockReadingGame from "./ClockReadingGame";

export const metadata: Metadata = {
  title: "认时钟游戏",
  description:
    "看钟面认时间，练习整点、半点与 5 分钟刻度，每轮 10 题，适合 6 岁小朋友。",
};

export default function ClockReadingPage() {
  return <ClockReadingGame />;
}
