import { Button, DongSonBand, Kicker, Link } from "@/core/ui";
import { site } from "@/site.config";
import type { Chapter } from "../types";
import { href, uiText } from "./i18n";
import ReadingQuiz from "./ReadingQuiz";
import css from "./ReadingView.module.scss";
import TopBar from "./TopBar";

/** Bản chữ của chương: chỉ HTML, không tải Three.js — cho máy yếu, mạng chậm, hoặc người chỉ muốn đọc. */
export default function ReadingView({ chapter, editUrl }: { chapter: Chapter; editUrl: string }) {
  const { lang } = chapter;
  const t = uiText(lang);
  return (
    <div className={css.page} lang={lang}>
      <TopBar scrolls lang={lang} />
      <article className={css.article}>
        <header className={css.head}>
          <Kicker>
            {chapter.era} · {chapter.year}
          </Kicker>
          <h1 className={css.title}>{chapter.title}</h1>
          <p className={css.lead}>{chapter.lead}</p>
          <Button variant="primary" href={href.chapter(chapter.slug, lang)}>
            {t.watch}
          </Button>
        </header>
        <DongSonBand className="band" />

        {chapter.beats.slice(1).map((b) => (
          <section key={b.id} id={b.id} className={css.beat}>
            <Kicker>{b.kicker}</Kicker>
            <h2 className={css.h2}>{b.title}</h2>
            {b.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {b.interaction?.completeText && <p>{b.interaction.completeText}</p>}
            {b.quote && (
              <figure className={css.quote}>
                <blockquote>{b.quote.paraphrase ? b.quote.text : `“${b.quote.text}”`}</blockquote>
                <figcaption>
                  — {b.quote.cite}
                  {b.quote.paraphrase && ` (${t.quote})`}
                </figcaption>
              </figure>
            )}
            {b.note && (
              <aside className={css.note}>
                <p className={css.noteTitle}>{b.note.title}</p>
                <p>{b.note.text}</p>
              </aside>
            )}
          </section>
        ))}

        <ReadingQuiz quiz={chapter.quiz} lang={lang} slug={chapter.slug} />

        <nav className={css.nav}>
          {chapter.prev?.slug && <Link href={href.text(chapter.prev.slug, lang)}>← {chapter.prev.title}</Link>}
          {chapter.next?.slug && <Link href={href.text(chapter.next.slug, lang)}>{chapter.next.title} →</Link>}
        </nav>

        {chapter.sources.length > 0 && (
          <section className={css.sources}>
            <h2>{t.sources}</h2>
            <ul>
              {chapter.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        )}
        <p className={css.small}>
          <Link href={editUrl}>{t.edit}</Link>
          {chapter.altLang && (
            <>
              {" · "}
              <Link href={href.text(chapter.slug, chapter.altLang)} hrefLang={chapter.altLang} lang={chapter.altLang}>
                {t.otherLang}
              </Link>
            </>
          )}{" "}
          · {t.aiNotice}
          {chapter.disclaimer && ` ${chapter.disclaimer}`} · {t.license}{" "}
          <Link href={site.license.content.url} rel="license">
            {site.license.content.name}
          </Link>
        </p>
      </article>
    </div>
  );
}
