"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fold, shortEra, slugify } from "@/core/content/era-id";
import type { RoadmapEra, RoadmapEvent } from "@/core/content/roadmap";
import { Button, Chip, ChipRow, Disclosure, Field, Icon, Input, Link, SearchField, SectionHead, Select, Tag } from "@/core/ui";
import type { MapPin } from "@/core/ui/HistoryMap";
import MapLoader from "@/core/ui/MapLoader";
import { ReadBadge } from "@/core/ui/ReadProgress";
import SourceLinks from "@/core/ui/SourceLinks";
import { site } from "@/site.config";
import css from "./page.module.scss";

type Event = RoadmapEvent & { era: number };
type Bound = { value: string; bc: boolean };

const NO_PLACE = "__none__";

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
  /** Điện thoại: ô năm, tỉnh/thành thu vào sau nút "Lọc năm, tỉnh" để bản đồ không bị đẩy xuống quá xa. */
  const [moreOpen, setMoreOpen] = useState(false);

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
  // khi mọi sự kiện đều đã có chương thì ô "chỉ sự kiện đã có chương" không lọc được gì nữa
  const someWaiting = useMemo(() => all.some((ev) => !ev.slug), [all]);

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
    <Field label={label} htmlFor={`nam-${label}`}>
      <div className={css.yearIn}>
        <Input
          id={`nam-${label}`}
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="để trống"
          value={b.value}
          onChange={(e) => set({ ...b, value: e.currentTarget.value })}
        />
        <Select aria-label={`${label}: trước hay sau Công nguyên`} value={b.bc ? "tcn" : "scn"} onChange={(e) => set({ ...b, bc: e.currentTarget.value === "tcn" })}>
          <option value="tcn">TCN</option>
          <option value="scn">SCN</option>
        </Select>
      </div>
    </Field>
  );

  return (
    <>
      <form className={css.filter} role="search" aria-label="Lọc sự kiện theo năm và tỉnh thành" onSubmit={(e) => e.preventDefault()}>
        <SearchField className={css.searchField} label="Tìm sự kiện" placeholder="Tìm theo tên, nhân vật, địa danh…" value={query} onChange={setQuery} />
        <Button size="sm" className={css.moreBtn} aria-expanded={moreOpen} aria-controls="loc-them" onClick={() => setMoreOpen(!moreOpen)}>
          <Icon name="filter" size={14} /> Năm, tỉnh{lo !== null || hi !== null || place ? " · đang lọc" : ""}
        </Button>
        <div id="loc-them" className={`${css.more} ${moreOpen ? css.moreOpen : ""}`}>
          {bound("Từ năm", from, setFrom)}
          {bound("Đến năm", to, setTo)}
          <Field label="Tỉnh / thành (hiện nay)" htmlFor="loc-tinh">
            <Select id="loc-tinh" value={place} onChange={(e) => setPlace(e.currentTarget.value)}>
              <option value="">Mọi nơi</option>
              {provinces.map(([p, n]) => (
                <option key={p} value={p}>
                  {p} ({n})
                </option>
              ))}
              {unplaced > 0 && <option value={NO_PLACE}>Chưa rõ vị trí ({unplaced})</option>}
            </Select>
          </Field>
        </div>
        {someWaiting && (
          <label className={css.check}>
            <input type="checkbox" checked={onlyReady} onChange={(e) => setOnlyReady(e.currentTarget.checked)} />
            Chỉ sự kiện đã có chương
          </label>
        )}
        <p className={css.count} role="status">
          {rangeBad ? "Năm bắt đầu lớn hơn năm kết thúc." : `${events.length} / ${all.length} sự kiện`}
          {filtered && (
            <Button size="sm" onClick={reset}>
              <Icon name="close" size={12} /> Xoá bộ lọc
            </Button>
          )}
        </p>
      </form>

      <MapLoader pins={pins} eras={eras.map((e) => e.title)} />

      <section className={css.list} aria-label="Dòng thời gian">
        <nav className={css.eraNav} aria-label="Nhảy tới thời kỳ">
          <ChipRow label="Thời kỳ">
            {eras.map((era, i) => {
              const n = events.filter((e) => e.era === i).length;
              if (!n) return null;
              const id = slugify(era.title);
              return (
                <Chip key={id} href={`#${id}`} on={active === id} count={n} aria-current={active === id ? "location" : undefined}>
                  {shortEra(era.title)}
                </Chip>
              );
            })}
          </ChipRow>
        </nav>
        <div className={css.inner}>
          {!events.length && <p className={css.empty}>Không có sự kiện nào khớp bộ lọc. Thử nới khoảng năm hoặc chọn &ldquo;Mọi nơi&rdquo;.</p>}
          {eras.map((era, i) => {
            const items = events.filter((e) => e.era === i);
            if (!items.length) return null;
            const ready = items.filter((e) => e.slug).length;
            return (
              <section key={era.title} className={css.era} id={slugify(era.title)}>
                <SectionHead
                  title={
                    <>
                      {era.title} <span className={css.eraCount}>{items.length} sự kiện{ready ? ` · ${ready} có chương` : ""}</span>
                    </>
                  }
                  lead={era.intro && !filtered ? era.intro : undefined}
                />
                <ol className={css.events}>
                  {items.map((e) => (
                    <li key={`${e.sortYear}-${e.title}`} className={`${css.event} ${e.slug ? css.ready : ""}`}>
                      <p className={css.year}>{e.year}</p>
                      <div className={css.body}>
                        <h3 className={css.eventTitle}>
                          {e.slug ? <Link href={`/chuong/${e.slug}`}>{e.title}</Link> : e.title}
                          {e.legend && <Tag className={css.tag}>truyền thuyết</Tag>}
                        </h3>
                        <p className={css.text}>{e.text}</p>
                        <SourceLinks urls={e.sources} className={css.src} />
                        <div className={css.meta}>
                          {e.slug ? (
                            <>
                              <Button size="sm" href={`/chuong/${e.slug}`}>
                                <Icon name="play" size={11} /> Xem chương
                              </Button>
                              <ReadBadge slug={e.slug} />
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="quiet"
                              href={`${site.repo}/issues/new?template=de-xuat-chuong.yml&title=${encodeURIComponent(`[Chương] ${e.title} (${e.year})`)}`}
                            >
                              <Icon name="pen" size={12} /> Nhận viết chương này
                            </Button>
                          )}
                          {(e.ancient || e.before2025 || e.now) && (
                            <Disclosure summary={e.place ?? "Địa danh"} className={css.addr}>
                              {e.ancient && <p>Tên xưa: {e.ancient}</p>}
                              {e.before2025 && <p>Trước 2025: {e.before2025}</p>}
                              {e.now && <p>Hiện nay: {e.now}</p>}
                            </Disclosure>
                          )}
                          {!(e.ancient || e.before2025 || e.now) && e.place && <span className={css.place}>{e.place}</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
          {footer}
        </div>
      </section>
    </>
  );
}
