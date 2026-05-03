import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import JapaneseWordGame from "@/app/japanese-word/JapaneseWordGame";

describe("JapaneseWordGame", () => {
  it("renders the first quiz and updates progress after a correct answer", () => {
    render(<JapaneseWordGame />);

    expect(screen.getByRole("heading", { level: 1, name: "日语单词变形记忆游戏" })).toBeDefined();
    expect(screen.getByText(/从基础形选出指定变形/)).toBeDefined();

    const optionButtons = screen.getAllByRole("button").filter((button) =>
      button.getAttribute("data-choice") === "true"
    );
    expect(optionButtons).toHaveLength(4);

    const correct = optionButtons.find((button) => button.getAttribute("data-correct") === "true");
    expect(correct).toBeDefined();

    fireEvent.click(correct!);

    expect(screen.getByText(/回答正确/)).toBeDefined();
    expect(screen.getByText("已答对 1 / 1")).toBeDefined();
    expect(screen.getByRole("button", { name: "下一题" })).toBeDefined();
  });

  it("switches the drill type when a filter chip is selected", () => {
    render(<JapaneseWordGame />);

    fireEvent.click(screen.getByRole("button", { name: "命令形" }));

    expect(screen.getByText(/当前练习：命令形/)).toBeDefined();
    expect(screen.getByText(/的命令形是哪个？/)).toBeDefined();
  });

  it("supports input mode and marks a typed correct answer", () => {
    render(<JapaneseWordGame />);

    const correct = screen
      .getAllByRole("button")
      .find((button) => button.getAttribute("data-choice") === "true" && button.getAttribute("data-correct") === "true");

    expect(correct).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "输入模式" }));

    const input = screen.getByPlaceholderText("输入你记住的变形");
    fireEvent.change(input, { target: { value: correct!.textContent ?? "" } });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(screen.getByText(/回答正确/)).toBeDefined();
    expect(screen.getByText("已答对 1 / 1")).toBeDefined();
  });

  it("shows the right answer after a wrong typed answer", () => {
    render(<JapaneseWordGame />);

    fireEvent.click(screen.getByRole("button", { name: "输入模式" }));
    fireEvent.change(screen.getByPlaceholderText("输入你记住的变形"), {
      target: { value: "完全错误" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));

    expect(screen.getByText(/回答错误。正确答案是/)).toBeDefined();
    expect(screen.getByText("已答对 0 / 1")).toBeDefined();
  });
});
