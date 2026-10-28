"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fold, slugify } from "@/core/content/era-id";
import type { RoadmapEra, RoadmapEvent } from "@/core/content/roadmap";
import type { MapPin } from "@/core/ui/HistoryMap";
import MapLoader from "@/core/ui/MapLoader";
import DongSonBand from "@/core/ui/ornaments/DongSonBand";
import { ReadBadge } from "@/core/ui/ReadProgress";
import SourceLinks from "@/core/ui/SourceLinks";
import { site } from "@/site.config";
import css from "./page.module.scss";

type Event = RoadmapEvent & { era: number };
type Bound = { value: string; bc: boolean };

const NO_PLACE = "__none__";

/** "Thời Lý" → "Lý", "Thời tiền sử" → "Tiền sử": chip gọn để cả hàng thời kỳ vừa màn hình. */
const short = (t: string) => {
  const s = t.replace(/^Thời /, "");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Tỉnh/thành hiện nay = đoạn cuối của địa chỉ "hiện nay" ("Xã A, Tỉnh B" → "Tỉnh B"). */
const provinceOf = (ev: RoadmapEvent) => ev.now?.split(",").pop()?.trim();

/** Ô năm → số dùng để so với `sortYear` (TCN thì âm); để trống = không giới hạn. */
const toYear = (b: Bound) => {
  const n = Number(b.value);
  return b.value.trim() === "" || !Number.isFinite(n) ? null : b.bc ? -Math.abs(n) : n;
};

/**
 * Bản đồ + dòng thời gian của trang lộ trình, cùng một bộ lọc: khoảng năm và tỉnh/thành hiện nay.
 * Lọc xong thì mốc trên bản đồ và danh sách bên dưới cùng thu lại. Lần render đầu chưa lọc gì nên HTML server vẫn đủ chữ.
 */
export default function RoadmapExplorer({ eras, footer }: { eras: RoadmapEra[]; footer: ReactNode }) {
  const [from, setFrom] = useState<Bound>({ value: "", bc: true });
  const [to, setTo] = useState<Bound>({ value: "", bc: false });
  const [place, setPlace] = useState("");
  const [query, setQuery] = useState("");
  const [onlyReady, setOnlyReady] = useState(false);
  const [active, setActive] = useState("");

  const all: Event[] = useMemo(() => eras.flatMap((e, i) => e.events.map((ev) => ({ ...ev, era: i }))), [eras]);

  const provinces = useMemo(() => {
    const count = new Map<string, number>();
    for (const ev of all) {
      const p = provinceOf(ev);
      if (p) count.set(p, (count.get(p) ?? 0) + 1);
    }
    return [...count.entries()].sort((a, b) => a[0].localeCompare(b[0], "vi"));
  }, [all]);
  const unplaced = useMemo(() => all.filter((ev) => !provinceOf(ev)).length, [all]);

  const lo = toYear(from);
  const hi = toYear(to);
  const rangeBad = lo !== null && hi !== null && lo > hi;

  const needle = fold(query.trim());
  const events = useMemo(
    () =>
      all.filter((ev) => {
        if (onlyReady && !ev.slug) return false;
        if (needle && !fold(`${ev.title} ${ev.text} ${ev.place ?? ""} ${ev.ancient ?? ""} ${ev.year}`).includes(needle)) return false;
        if (lo !== null && hi !== null && lo > hi) return false;
        if (lo !== null && ev.sortYear < lo) return false;
        if (hi !== null && ev.sortYear > hi) return false;
        if (place === NO_PLACE) return !provinceOf(ev);
        return !place || provinceOf(ev) === place;
      }),
    [all, lo, hi, place, needle, onlyReady],
  );

  // gom sự kiện cùng địa danh thành một mốc trên bản đồ
  const pins = useMemo(() => {
    const map = new Map<string, MapPin>();
    for (const ev of events) {
      if (!ev.latLon) continue;
      const key = `${ev.latLon[0].toFixed(2)},${ev.latLon[1].toFixed(2)}`;
      const pin = map.get(key) ?? { id: key, place: ev.place ?? "", lat: ev.latLon[0], lon: ev.latLon[1], events: [] };
      pin.events.push({ year: ev.year, title: ev.title, text: ev.text, slug: ev.slug, legend: ev.legend, era: ev.era, ancient: ev.ancient, before2025: ev.before2025, now: ev.now, sources: ev.sources });
      map.set(key, pin);
    }
    return [...map.values()];
  }, [events]);

  const filtered = lo !== null || hi !== null || !!place || !!needle || onlyReady;
  const reset = () => {
    setFrom({ value: "", bc: true });
    setTo({ value: "", bc: false });
    setPlace("");
    setQuery("");
    setOnlyReady(false);
  };

  // chip thời kỳ sáng theo thời kỳ đang nằm ở đầu màn hình
  const ids = useMemo(() => eras.map((e) => slugify(e.title)), [eras]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids, events]);

  const bound = (label: string, b: Bound, set: (b: Bound) => void) => (
    <div className={css.field}>
      <label htmlFor={`nam-${label}`}>{label}</label>
      <div className={css.yearIn}>
        <input
          id={`nam-${label}`}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="để trống"
          value={b.value}
          onChange={(e) => set({ ...b, value: e.currentTarget.value })}
        />
        <select aria-label={`${label}: trước hay sau Công nguyên`} value={b.bc ? "tcn" : "scn"} onChange={(e) => set({ ...b, bc: e.currentTarget.value === "tcn" })}>
          <option value="tcn">TCN</option>
          <option value="scn">SCN</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      <form className={css.filter} role="search" aria-label="Lọc sự kiện theo năm và tỉnh thành" onSubmit={(e) => e.preventDefault()}>
        {bound("Từ năm", from, setFrom)}
        {bound("Đến năm", to, setTo)}
        <div className={css.field}>
          <label htmlFor="loc-tinh">Tỉnh / thành (hiện nay)</label>
          <select id="loc-tinh" value={place} onChange={(e) => setPlace(e.currentTarget.value)}>
            <option value="">Mọi nơi</option>
            {provinces.map(([p, n]) => (
              <option key={p} value={p}>
                {p} ({n})
              </option>
            ))}
            {unplaced > 0 && <option value={NO_PLACE}>Chưa rõ vị trí ({unplaced})</option>}
          </select>
        </div>
        <div className={css.field}>
          <label htmlFor="loc-tu-khoa">Tìm sự kiện</label>
          <input id="loc-tu-khoa" type="search" className={css.searchIn} placeholder="tên, nhân vật, địa danh…" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
        </div>
        <label className={css.check}>
          <input type="checkbox" checked={onlyReady} onChange={(e) => setOnlyReady(e.currentTarget.checked)} />
          Chỉ sự kiện đã có chương
        </label>
        <p className={css.count} role="status">
          {rangeBad ? "Năm bắt đầu lớn hơn năm kết thúc." : `${events.length} / ${all.length} sự kiện`}
          {filtered && (
            <button type="button" className={css.clear} onClick={reset}>
              Xoá bộ lọc
            </button>
          )}
        </p>
      </form>

      <MapLoader pins={pins} eras={eras.map((e) => e.title)} />

      <section className={css.list} aria-label="Dòng thời gian">
        <nav className={css.eraNav} aria-label="Nhảy tới thời kỳ">
          <ul>
            {eras.map((era, i) => {
              const n = events.filter((e) => e.era === i).length;
              if (!n) return null;
              const id = slugify(era.title);
              return (
                <li key={id}>
                  <a href={`#${id}`} aria-current={active === id ? "location" : undefined}>
                    {short(era.title)} <b>{n}</b>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        {!events.length && <p className={css.empty}>Không có sự kiện nào khớp bộ lọc. Thử nới khoảng năm hoặc chọn &ldquo;Mọi nơi&rdquo;.</p>}
        {eras.map((era, i) => {
          const items = events.filter((e) => e.era === i);
          if (!items.length) return null;
          return (
            <section key={era.title} className={css.era} id={slugify(era.title)}>
              <h2 className={css.eraTitle}>
                {era.title} <span className={css.eraCount}>{items.length} sự kiện{items.some((e) => e.slug) ? `, ${items.filter((e) => e.slug).length} đã có chương` : ""}</span>
              </h2>
              <DongSonBand className="band" />
              {era.intro && !filtered && <p className={css.eraIntro}>{era.intro}</p>}
              <ol className={css.events}>
                {items.map((e) => (
                  <li key={`${e.sortYear}-${e.title}`} className={`${css.event} ${e.slug ? css.ready : ""}`}>
                    <p className={css.year}>{e.year}</p>
                    <div>
                      <h3 className={css.eventTitle}>
                        {e.slug ? <Link href={`/chuong/${e.slug}`}>{e.title}</Link> : e.title}
                        {e.legend && <span className={css.tag}>truyền thuyết</span>}
                      </h3>
                      <p className={css.text}>{e.text}</p>
                      {(e.ancient || e.before2025 || e.now) && (
                        <p className={css.addr}>
                          {e.ancient && <span>Tên xưa: {e.ancient}</span>}
                          {e.before2025 && <span>Trước 2025: {e.before2025}</span>}
                          {e.now && <span>Hiện nay: {e.now}</span>}
                        </p>
                      )}
                      <SourceLinks urls={e.sources} className={css.src} />
                      <p className={css.meta}>
                        {e.place && <span>{e.place}</span>}
                        {e.slug ? (
                          <>
                            <Link className={css.go} href={`/chuong/${e.slug}`}>
                              ▶ Xem chương
                            </Link>
                            <ReadBadge slug={e.slug} />
                          </>
                        ) : (
                          <a
                            className={css.claim}
                            href={`${site.repo}/issues/new?template=de-xuat-chuong.yml&title=${encodeURIComponent(`[Chương] ${e.title} (${e.year})`)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Nhận viết chương này
                          </a>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
        {footer}
      </section>
    </>
  );
}
