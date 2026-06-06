import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JapaneseWordGame from "@/app/japanese-word/JapaneseWordGame";

describe("JapaneseWordGame", () => {
  it("renders the first quiz and updates feedback after a correct answer", () => {
    render(<JapaneseWordGame />);

    expect(
      screen.getByRole("heading", { level: 1, name: "日语动词变形辨识游戏" }),
    ).toBeDefined();

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
    expect(screen.getByRole("button", { name: "下一题" })).toBeDefined();
  });

  it("shows error feedback after a wrong answer and loads a new question on next", () => {
    render(<JapaneseWordGame />);

    const optionButtons = screen.getAllByRole("button").filter((button) =>
      button.getAttribute("data-choice") === "true",
    );

    const wrong = optionButtons.find(
      (button) => button.getAttribute("data-correct") !== "true",
    );
    expect(wrong).toBeDefined();

    fireEvent.click(wrong!);

    expect(screen.getByText(/回答错误。正确答案是/)).toBeDefined();
    expect(screen.getByRole("button", { name: "下一题" })).toBeDefined();
  });
});
