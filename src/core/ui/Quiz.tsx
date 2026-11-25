"use client";

import { useState } from "react";
import { setPref, usePref } from "../story/prefs";
import type { Lang, QuizQuestion } from "../types";
import { uiText } from "./i18n";
import css from "./Quiz.module.scss";

/** Câu hỏi ôn tập cuối chương. Người xem tắt được (nhớ cho mọi chương); câu trả lời không lưu, không gửi đi đâu. */
export default function Quiz({ quiz, lang, slug, onReview }: { quiz: QuizQuestion[]; lang: Lang; slug: string; onReview: (beatId: string) => void }) {
  const on = usePref("quiz");
  const [picked, setPicked] = useState<(number | null)[]>(() => quiz.map(() => null));
  const t = uiText(lang);
  if (!quiz.length) return null;

  if (!on)
    return (
      <p className={css.off}>
        {t.quizOff}{" "}
        <button type="button" onClick={() => setPref("quiz", true)}>
          {t.quizOn}
        </button>
      </p>
    );

  const answered = picked.filter((p) => p !== null).length;
  const right = picked.filter((p, i) => p === quiz[i].answer).length;
  return (
    <section className={css.quiz} aria-labelledby={`quiz-${slug}`}>
      <header className={css.head}>
        <div>
          <h3 id={`quiz-${slug}`} className={css.title}>
            {t.quizTitle}
          </h3>
          <p className={css.sub}>{t.quizCount(quiz.length)}</p>
        </div>
        <button type="button" className={css.hide} onClick={() => setPref("quiz", false)}>
          {t.quizHide}
        </button>
      </header>
      <ol className={css.list}>
        {quiz.map((q, i) => {
          const p = picked[i];
          const done = p !== null;
          return (
            <li key={q.question}>
              <fieldset className={css.q} disabled={done}>
                <legend className={css.question}>{q.question}</legend>
                {q.options.map((o, k) => (
                  <label key={o} className={`${css.option} ${done && k === q.answer ? css.right : ""} ${done && k === p && k !== q.answer ? css.wrong : ""}`}>
                    <input type="radio" name={`${slug}-q${i}`} checked={p === k} onChange={() => setPicked((all) => all.map((v, j) => (j === i ? k : v)))} />
                    <span>{o}</span>
                  </label>
                ))}
              </fieldset>
              {done && (
                <div className={css.feedback} role="status">
                  <p>
                    <b>{p === q.answer ? t.quizRight : t.quizWrong(q.options[q.answer])}</b> {q.explain}
                  </p>
                  <button type="button" onClick={() => onReview(q.beat)}>
                    {t.quizReview} ↑
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {answered === quiz.length && (
        <p className={css.score} role="status">
          {t.quizScore(right, quiz.length)}{" "}
          <button type="button" onClick={() => setPicked(quiz.map(() => null))}>
            {t.quizRetry}
          </button>
        </p>
      )}
    </section>
  );
}
