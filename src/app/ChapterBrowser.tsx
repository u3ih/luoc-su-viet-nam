"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fold } from "@/core/content/era-id";
import Seal from "@/core/ui/ornaments/Seal";
import { ReadBadge } from "@/core/ui/ReadProgress";
import css from "./ChapterBrowser.module.scss";

export type ChapterCard = { slug: string; title: string; year: string; era: string; teaser: string; seal: string[]; textUrl: string };
export type EraBlock = { id: string; title: string; intro: string; events: number; cards: ChapterCard[] };

type View = "the" | "dong";

/** "Thời Lý" → "Lý", "Thời tiền sử" → "Tiền sử": chip gọn để cả hàng thời kỳ vừa màn hình. */
const short = (t: string) => {
  const s = t.replace(/^Thời /, "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Danh sách chương của trang chủ khi đã có nhiều chương: chia theo thời kỳ, có thanh tìm kiếm, chip lọc thời kỳ
 * và hai kiểu xem — "Thẻ" (đọc teaser) hoặc "Dòng thời gian" (mỗi chương một dòng, quét nhanh hàng chục chương).
 * Lần render đầu chưa lọc gì nên HTML server vẫn có đủ chữ của mọi chương.
 */
export default function ChapterBrowser({ eras }: { eras: EraBlock[] }) {
  const [query, setQuery] = useState("");
  const [era, setEra] = useState("");
  const [view, setView] = useState<View>("the");

  const total = useMemo(() => eras.reduce((n, e) => n + e.cards.length, 0), [eras]);
  const q = fold(query.trim());

  const shown = useMemo(
    () =>
      eras
        .filter((e) => !era || e.id === era)
        .map((e) => ({ ...e, cards: e.cards.filter((c) => !q || fold(`${c.title} ${c.year} ${c.teaser} ${c.era}`).includes(q)) }))
        .filter((e) => e.cards.length),
    [eras, era, q],
  );
  const count = shown.reduce((n, e) => n + e.cards.length, 0);
  const filtered = !!q || !!era;

  return (
    <div className={css.root}>
      <div className={css.bar}>
        <div className={css.row}>
          <label className={css.search}>
            <span className={css.sr}>Tìm chương</span>
            <input type="search" placeholder="Tìm chương: tên, năm, nhân vật…" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
          </label>
          <div className={css.views} role="group" aria-label="Kiểu hiển thị">
            <button type="button" aria-pressed={view === "the"} onClick={() => setView("the")}>
              Thẻ
            </button>
            <button type="button" aria-pressed={view === "dong"} onClick={() => setView("dong")}>
              Dòng thời gian
            </button>
          </div>
        </div>
        <ul className={css.chips} aria-label="Lọc theo thời kỳ">
          <li>
            <button type="button" aria-pressed={!era} onClick={() => setEra("")}>
              Tất cả <b>{total}</b>
            </button>
          </li>
          {eras.map((e) => (
            <li key={e.id}>
              <button type="button" aria-pressed={era === e.id} onClick={() => setEra(era === e.id ? "" : e.id)}>
                {short(e.title)} <b>{e.cards.length}</b>
              </button>
            </li>
          ))}
        </ul>
        <p className={css.count} role="status">
          {filtered ? `${count} / ${total} chương` : `${total} chương, ${eras.length} thời kỳ`}
          {filtered && (
            <button
              type="button"
              className={css.clear}
              onClick={() => {
                setQuery("");
                setEra("");
              }}
            >
              Xoá bộ lọc
            </button>
          )}
        </p>
      </div>

      {!shown.length && <p className={css.empty}>Không có chương nào khớp. Thử bớt từ khoá, hoặc xem cả{" "}
        <Link href="/lo-trinh">lộ trình</Link> — nơi có cả những sự kiện chưa có chương.</p>}

      {shown.map((e) => (
        <section key={e.id} id={e.id} className={css.era} aria-labelledby={`${e.id}-h`}>
          <header className={css.eraHead}>
            <h3 id={`${e.id}-h`} className={css.eraTitle}>
              {e.title}
            </h3>
            <p className={css.eraMeta}>
              {e.cards.length} chương · {e.events} sự kiện trên <Link href={`/lo-trinh#${e.id}`}>lộ trình</Link>
            </p>
          </header>
          {e.intro && !filtered && <p className={css.eraIntro}>{e.intro}</p>}
          {view === "the" ? (
            <ol className={`chapters ${css.grid}`}>
              {e.cards.map((c) => (
                <li key={c.slug} className={`chapter-card ${css.card}`}>
                  <Seal lines={c.seal} />
                  <p className="chapter-card__era">{c.era}</p>
                  <p className={`chapter-card__year ${css.year} ${c.year.length > 5 ? css.yearLong : ""}`}>{c.year}</p>
                  <h4 className={`chapter-card__title ${css.cardTitle}`}>{c.title}</h4>
                  <p className={`chapter-card__teaser ${css.teaser}`}>{c.teaser}</p>
                  <ReadBadge slug={c.slug} className={css.badge} />
                  <div className="chapter-card__actions">
                    <Link className="btn btn--primary" href={`/chuong/${c.slug}`}>
                      ▶ Xem trực quan
                    </Link>
                    <a className="btn" href={c.textUrl} target="_blank" rel="noreferrer">
                      Đọc bản chữ
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <ol className={css.rows}>
              {e.cards.map((c) => (
                <li key={c.slug} className={css.rowItem}>
                  <p className={css.rowYear}>{c.year}</p>
                  <div>
                    <h4 className={css.rowTitle}>
                      <Link href={`/chuong/${c.slug}`}>{c.title}</Link>
                    </h4>
                    <p className={css.rowTeaser}>{c.teaser}</p>
                  </div>
                  <ReadBadge slug={c.slug} className={css.rowBadge} />
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}
    </div>
  );
}
