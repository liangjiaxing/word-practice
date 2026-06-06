import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JapaneseWordGame from "@/app/japanese-word/JapaneseWordGame";

describe("JapaneseWordGame", () => {
  it("renders the first quiz and updates progress after a correct answer", () => {
    render(<JapaneseWordGame />);

    expect(
      screen.getByRole("heading", { level: 1, name: "日语动词变形辨识游戏" }),
    ).toBeDefined();
    expect(screen.getByText(/判断给出的动词变形/)).toBeDefined();

    const optionButtons = screen.getAllByRole("button").filter((button) =>
      button.getAttribute("data-choice") === "true",
    );
    expect(optionButtons).toHaveLength(4);

    const correct = optionButtons.find(
      (button) => button.getAttribute("data-correct") === "true",
    );
    expect(correct).toBeDefined();

    fireEvent.click(correct!);

    expect(screen.getByText(/回答正确/)).toBeDefined();
    expect(screen.getByText("已答对 1 / 1")).toBeDefined();
    expect(screen.getByRole("button", { name: "下一题" })).toBeDefined();
  });

  it("switches the drill type when a filter chip is selected", () => {
    render(<JapaneseWordGame />);

    const chip = screen.getAllByRole("button", { name: "使役形" }).find((btn) =>
      btn.classList.contains("jw-chip"),
    );
    expect(chip).toBeDefined();
    fireEvent.click(chip!);

    expect(screen.getByText(/何形ですか？/)).toBeDefined();
  });
});
