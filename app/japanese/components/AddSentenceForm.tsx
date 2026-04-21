"use client";

import { useRef } from "react";
import { addSentence } from "../actions";

export default function AddSentenceForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await addSentence(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="add-form">
      <input
        name="sentence"
        type="text"
        placeholder="日语句子（例：今日はいい天気です）"
        required
      />
      <input
        name="translation"
        type="text"
        placeholder="中文翻译（例：今天天气很好）"
        required
      />
      <button type="submit">添加句子</button>
    </form>
  );
}
