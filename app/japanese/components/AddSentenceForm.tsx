"use client";

import { useRef, useState } from "react";
import { addSentence } from "../actions";

export default function AddSentenceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await addSentence(formData);
    formRef.current?.reset();
    setLoading(false);
  }

  return (
    <form ref={formRef} action={handleSubmit} className="add-form">
      <input
        name="sentence"
        type="text"
        placeholder="输入日语句子（例：今日はいい天気です）"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "翻译中..." : "添加句子"}
      </button>
    </form>
  );
}
