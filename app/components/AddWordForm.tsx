"use client";

import { useRef } from "react";
import { addWord } from "@/app/actions";

export default function AddWordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await addWord(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="input-row">
      <input
        name="word"
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoComplete="off"
        placeholder="Enter an English word"
        maxLength={32}
        required
      />
      <button type="submit">Add Word</button>
    </form>
  );
}
