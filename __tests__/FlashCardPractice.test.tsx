import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FlashCardPractice from "@/app/components/FlashCardPractice";

const words = [
  { id: 1, word: "inactive" },
  { id: 2, word: "action" },
];

describe("FlashCardPractice", () => {
  it("moves to the next word on right swipe and previous word on left swipe", () => {
    render(<FlashCardPractice words={words} />);

    const card = screen.getByLabelText("Flash card: inactive");
    expect(screen.getByText("inactive")).toBeDefined();
    expect(screen.getByText("Word 1 of 2")).toBeDefined();

    fireEvent.pointerDown(card, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(card, { clientX: 180, clientY: 104 });

    expect(screen.getByText("action")).toBeDefined();
    expect(screen.getByText("Word 2 of 2")).toBeDefined();

    fireEvent.pointerDown(card, { clientX: 180, clientY: 100 });
    fireEvent.pointerUp(card, { clientX: 100, clientY: 104 });

    expect(screen.getByText("inactive")).toBeDefined();
    expect(screen.getByText("Word 1 of 2")).toBeDefined();
  });

  it("shows a record fallback when speech recognition is unavailable", () => {
    render(<FlashCardPractice words={words} />);

    fireEvent.click(screen.getByRole("button", { name: "Record" }));

    expect(screen.getByText("Speech recognition not supported on this browser.")).toBeDefined();
  });
});
