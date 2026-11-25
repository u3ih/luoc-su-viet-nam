"use client";

import type { Lang, QuizQuestion } from "../types";
import Quiz from "./Quiz";

/** Ôn tập ở bản chữ: "Xem lại" cuộn tới đoạn tương ứng trong trang. */
export default function ReadingQuiz(props: { quiz: QuizQuestion[]; lang: Lang; slug: string }) {
  return <Quiz {...props} onReview={(id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })} />;
}
