"use client";

import { useMemo, useRef, useState } from "react";
import { fold, shortEra } from "@/core/content/era-id";
import { Button, Card, Chip, ChipRow, Icon, Link, Seal, SearchField, SectionHead, Segmented } from "@/core/ui";
import { useTilt } from "@/core/ui/hooks/useTilt";
import { ReadBadge } from "@/core/ui/ReadProgress";
import css from "./ChapterBrowser.module.scss";

export type ChapterCard = { slug: string; title: string; year: string; era: string; teaser: string; seal: string[]; textUrl: string };
export type EraBlock = { id: string; title: string; intro: string; events: number; cards: ChapterCard[] };

type View = "the" | "dong";
const VIEWS: { value: View; label: string }[] = [
  { value: "the", label: "Thẻ" },
  { value: "dong", label: "Dòng thời gian" },
];

/** Số thẻ hiện sẵn mỗi thời kỳ khi chưa lọc; phần còn lại mở bằng nút "Xem thêm" (vẫn có trong HTML, chỉ ẩn đi). */
const PREVIEW = 8;

/**
 * Danh sách chương của trang chủ: chia theo thời kỳ, có ô tìm, chip lọc thời kỳ và hai kiểu xem — "Thẻ" (đọc teaser)
 * hoặc "Dòng thời gian" (mỗi chương một dòng). Lần render đầu chưa lọc nên HTML server có đủ chữ của mọi chương.
 */
export default function ChapterBrowser({ eras }: { eras: EraBlock[] }) {
  const [query, setQuery] = useState("");
  const [era, setEra] = useState("");
  const [view, setView] = useState<View>("the");
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());
  const root = useRef<HTMLDivElement>(null);
  useTilt(root, `.${css.card}`, 5);

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
    <div className={css.root} ref={root}>
      <div className={css.bar}>
        <div className={css.row}>
          <SearchField className={css.search} label="Tìm chương" placeholder="Tìm theo tên, năm, nhân vật…" value={query} onChange={setQuery} />
          <Segmented className={css.views} label="Kiểu hiển thị" options={VIEWS} value={view} onChange={setView} />
        </div>
        <ChipRow label="Lọc theo thời kỳ" className={css.chips}>
          <Chip on={!era} count={total} onClick={() => setEra("")}>
            Tất cả
          </Chip>
          {eras.map((e) => (
            <Chip key={e.id} on={era === e.id} count={e.cards.length} onClick={() => setEra(era === e.id ? "" : e.id)}>
              {shortEra(e.title)}
            </Chip>
          ))}
        </ChipRow>
        <p className={css.count} role="status">
          {filtered && (
            <>
              {count} / {total} chương
              <Button
                size="sm"
                onClick={() => {
                  setQuery("");
                  setEra("");
                }}
              >
                <Icon name="close" size={12} /> Xoá bộ lọc
              </Button>
            </>
          )}
        </p>
      </div>

      {!shown.length && (
        <p className={css.empty}>
          Không có chương nào khớp. Thử bớt từ khoá, hoặc xem cả <Link href="/lo-trinh">lộ trình</Link> — nơi có cả những sự kiện chưa có chương.
        </p>
      )}

      {shown.map((e) => (
        <section key={e.id} id={e.id} className={css.era} aria-labelledby={`${e.id}-h`}>
          <SectionHead
            level={3}
            id={`${e.id}-h`}
            className={css.eraHead}
            title={
              <>
                {e.title} <span className={css.eraCount}>{e.cards.length} chương</span>
              </>
            }
            lead={!filtered && e.intro ? e.intro : undefined}
            action={
              <Button variant="quiet" size="sm" href={`/lo-trinh#${e.id}`}>
                {e.events} sự kiện trên bản đồ <Icon name="arrow" size={13} />
              </Button>
            }
          />
          {view === "the" ? (
            <>
              <ol className={css.grid}>
                {e.cards.map((c, i) => (
                  <Card as="li" tone="lacquer" interactive key={c.slug} className={css.card} hidden={!filtered && !opened.has(e.id) && i >= PREVIEW}>
                    <Seal lines={c.seal} />
                    <p className={css.year}>{c.year}</p>
                    <h4 className={css.cardTitle}>
                      <Link href={`/chuong/${c.slug}`} data-cover="">
                        {c.title}
                      </Link>
                    </h4>
                    <p className={css.teaser}>{c.teaser}</p>
                    <div className={css.cardFoot}>
                      <ReadBadge slug={c.slug} />
                      <Link className={css.textLink} href={c.textUrl} data-above="">
                        <Icon name="book" size={13} /> Bản chữ
                      </Link>
                      <span className={css.go} aria-hidden="true">
                        <Icon name="arrow" size={16} />
                      </span>
                    </div>
                  </Card>
                ))}
              </ol>
              {!filtered && !opened.has(e.id) && e.cards.length > PREVIEW && (
                <Button
                  block
                  className={css.more}
                  onClick={() => {
                    setOpened(new Set(opened).add(e.id));
                    // nút biến mất sau khi bấm: chuyển tiêu điểm tới thẻ đầu tiên vừa hiện
                    requestAnimationFrame(() => document.querySelector<HTMLElement>(`#${e.id} li:nth-child(${PREVIEW + 1}) a`)?.focus());
                  }}
                >
                  Xem thêm {e.cards.length - PREVIEW} chương thời {shortEra(e.title).toLowerCase()}
                  <Icon name="down" size={14} />
                </Button>
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
