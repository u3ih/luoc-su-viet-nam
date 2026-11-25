"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DongSonBand, Link } from "@/core/ui";
import { site } from "@/site.config";
import type { Chapter, JourneyStep } from "../types";
import css from "./ChapterEnd.module.scss";
import { href, uiText } from "./i18n";
import Quiz from "./Quiz";

/** Nghe kể sang chương sau: cờ này bảo chương mới tự bật giọng kể. */
export const AUTOPLAY_KEY = "lsvn-autoplay";
const AUTO_SECONDS = 12;

type Props = {
  chapter: Chapter;
  editUrl: string;
  /** Hành trình người xem đang đi (từ ?hanh-trinh=…). */
  journey: JourneyStep | null;
  /** Đang nghe kể và đã kể hết chương: đếm ngược rồi tự sang chương sau. */
  autoNext: boolean;
  onRestart: () => void;
  onReview: (beatId: string) => void;
};

/** Cuối chương: ôn tập, chương tiếp theo (theo hành trình hoặc thời gian), chương liên quan, nguồn, góp ý. */
export default function ChapterEnd({ chapter, editUrl, journey, autoNext, onRestart, onReview }: Props) {
  const { next, prev, lang } = chapter;
  const t = uiText(lang);
  const router = useRouter();
  const withJourney = (slug: string) => `${href.chapter(slug, lang)}${journey ? `?hanh-trinh=${journey.id}` : ""}`;
  const target = journey?.next ? withJourney(journey.next.slug) : next?.slug ? href.chapter(next.slug, lang) : null;

  const [left, setLeft] = useState(AUTO_SECONDS);
  const [cancelled, setCancelled] = useState(false);
  const counting = autoNext && !cancelled && !!target;
  useEffect(() => {
    if (!counting) return setLeft(AUTO_SECONDS);
    if (left <= 0) {
      try {
        sessionStorage.setItem(AUTOPLAY_KEY, "1");
      } catch {
        // không lưu được thì chương sau không tự kể, vẫn chuyển trang
      }
      router.push(target!);
      return;
    }
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [counting, left, target, router]);
  useEffect(() => {
    if (!autoNext) setCancelled(false);
  }, [autoNext]);

  const card = (to: string, label: string, year: string, title: string, waiting = false) => (
    <Link className={`${css.next} ${waiting ? css.waiting : ""}`} href={to}>
      <span className={css.nextLabel}>{label}</span>
      <span className={css.nextYear}>{year}</span>
      <span className={css.nextTitle}>{title}</span>
      <span className={css.arrow} aria-hidden="true">
        →
      </span>
    </Link>
  );

  return (
    <div className="chapter-end beat__extra">
      <DongSonBand className="band band--dim" />
      <Quiz quiz={chapter.quiz} lang={lang} slug={chapter.slug} onReview={onReview} />

      {counting && (
        <p className={css.auto} role="status">
          {t.autoNext(left)}{" "}
          <button type="button" onClick={() => setCancelled(true)}>
            {t.cancel}
          </button>
        </p>
      )}

      {journey && !journey.next && <p className={css.journeyDone}>{t.journeyDone(journey.title)}</p>}
      {journey?.next && card(withJourney(journey.next.slug), t.journey(journey.title, journey.index + 1, journey.total), journey.next.year, journey.next.title)}
      {next &&
        (next.slug
          ? journey?.next
            ? next.slug !== journey.next.slug && (
                <p className={css.chrono}>
                  {t.chronoNext}:{" "}
                  <Link href={href.chapter(next.slug, lang)}>
                    {next.title} · {next.year}
                  </Link>
                </p>
              )
            : card(href.chapter(next.slug, lang), t.nextChapter, next.year, next.title)
          : !journey?.next && card("/lo-trinh", t.nextWaiting, next.year, next.title, true))}
      <div className={css.nav}>
        {prev?.slug && (
          <Link href={href.chapter(prev.slug, lang)}>
            ← {prev.title} · {prev.year}
          </Link>
        )}
        <button type="button" onClick={onRestart}>
          {t.restart}
        </button>
      </div>

      {chapter.related.length > 0 && (
        <div className={css.related}>
          {chapter.related.map((g) => (
            <div key={`${g.kind}-${g.label}`}>
              <h3 className={css.relatedHead}>
                {g.kind === "person" ? t.samePerson : t.samePlace} · <b>{g.label}</b>
              </h3>
              <ul>
                {g.chapters.map((c) => (
                  <li key={c.slug}>
                    <Link href={href.chapter(c.slug, lang)}>
                      {c.title} <span>{c.year}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {chapter.sources.length > 0 && (
        <div className="sources">
          <h3>{t.sources}</h3>
          <ul>
            {chapter.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="contribute">
        <Link href={href.text(chapter.slug, lang)}>{t.readText}</Link>
        <Link href={editUrl}>{t.edit}</Link>
        {chapter.altLang && (
          <Link href={href.chapter(chapter.slug, chapter.altLang)} hrefLang={chapter.altLang} lang={chapter.altLang}>
            {t.otherLang}
          </Link>
        )}
        {lang === "vi" && <Link href="/lo-trinh">{t.roadmap}</Link>}
        <Link href={lang === "en" ? "/en" : "/#cac-chuong"}>{t.otherChapters}</Link>
      </div>
      <p className="disclaimer disclaimer--ai" role="note">
        {t.aiNotice}
      </p>
      {chapter.disclaimer && <p className="disclaimer">{chapter.disclaimer}</p>}
      <p className="disclaimer">
        {t.license}{" "}
        <Link href={site.license.content.url} rel="license">
          {site.license.content.name}
        </Link>
        . {t.code} {site.license.code.name}.
      </p>
    </div>
  );
}
