"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fold, shortEra } from "@/core/content/era-id";
import Seal from "@/core/ui/ornaments/Seal";
import { ReadBadge } from "@/core/ui/ReadProgress";
import css from "./ChapterBrowser.module.scss";

export type ChapterCard = { slug: string; title: string; year: string; era: string; teaser: string; seal: string[]; textUrl: string };
export type EraBlock = { id: string; title: string; intro: string; events: number; cards: ChapterCard[] };

type View = "the" | "dong";

/** Số thẻ hiện sẵn mỗi thời kỳ khi chưa lọc; phần còn lại mở bằng nút "Xem thêm" (vẫn có trong HTML, chỉ ẩn đi). */
const PREVIEW = 8;

/**
 * Danh sách chương của trang chủ khi đã có nhiều chương: chia theo thời kỳ, có thanh tìm kiếm, chip lọc thời kỳ
 * và hai kiểu xem — "Thẻ" (đọc teaser) hoặc "Dòng thời gian" (mỗi chương một dòng, quét nhanh hàng chục chương).
 * Lần render đầu chưa lọc gì nên HTML server vẫn có đủ chữ của mọi chương (thẻ quá PREVIEW chỉ bị ẩn bằng `hidden`).
 */
export default function ChapterBrowser({ eras }: { eras: EraBlock[] }) {
  const [query, setQuery] = useState("");
  const [era, setEra] = useState("");
  const [view, setView] = useState<View>("the");
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());

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
                {shortEra(e.title)} <b>{e.cards.length}</b>
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
            <>
              <ol className={`chapters ${css.grid}`}>
                {e.cards.map((c, i) => (
                  <li key={c.slug} className={`chapter-card ${css.card}`} hidden={!filtered && !opened.has(e.id) && i >= PREVIEW}>
                    <Seal lines={c.seal} />
                    <p className={`chapter-card__era ${css.cardEra}`}>{c.era}</p>
                    <p className={css.year}>{c.year}</p>
                    <h4 className={`chapter-card__title ${css.cardTitle}`}>
                      <Link href={`/chuong/${c.slug}`} className={css.cardLink}>
                        {c.title}
                      </Link>
                    </h4>
                    <p className={`chapter-card__teaser ${css.teaser}`}>{c.teaser}</p>
                    <div className={css.cardFoot}>
                      <span className={css.watch} aria-hidden="true">
                        ▶ Xem trực quan
                      </span>
                      <ReadBadge slug={c.slug} />
                      <a className={css.textLink} href={c.textUrl} target="_blank" rel="noreferrer">
                        Bản chữ ↗
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
              {!filtered && !opened.has(e.id) && e.cards.length > PREVIEW && (
                <button
                  type="button"
                  className={css.more}
                  onClick={() => {
                    setOpened(new Set(opened).add(e.id));
                    // nút biến mất sau khi bấm: chuyển tiêu điểm tới thẻ đầu tiên vừa hiện
                    requestAnimationFrame(() => document.querySelector<HTMLElement>(`#${e.id} li:nth-child(${PREVIEW + 1}) a`)?.focus());
                  }}
                >
                  Xem thêm {e.cards.length - PREVIEW} chương · {e.title}
                </button>
              )}
            </>
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
