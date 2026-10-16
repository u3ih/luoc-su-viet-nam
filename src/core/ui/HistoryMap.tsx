"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MapView } from "../world/vietnam-map";
import css from "./HistoryMap.module.scss";
import { ReadBadge } from "./ReadProgress";

export type MapEvent = {
  year: string;
  title: string;
  text: string;
  slug?: string;
  legend: boolean;
  era: number;
  /** Tên xưa, địa chỉ trước 01/7/2025, địa chỉ hiện nay. */
  ancient?: string;
  before2025?: string;
  now?: string;
};
/** Một địa danh trên bản đồ, gom mọi sự kiện cùng chỗ. */
export type MapPin = { id: string; place: string; lat: number; lon: number; events: MapEvent[] };

type Label = { text: string; lat: number; lon: number; kind: "capital" | "city" | "province" | "island" | "archipelago" | "sea" | "country" | "commune"; sub?: string };

/** Ranh giới tỉnh (public/geo/tinh.json) và xã/phường của một tỉnh (public/geo/xa/<slug>.json) — xem scripts/geo-osm.mjs. */
type Province = { ten: string; slug: string; bbox: [number, number, number, number]; r: number[][] };
type Commune = { ten: string; c: [number, number]; r: number[][] };

/** Điểm trong đa giác (vòng phẳng [kinh độ, vĩ độ, …]). */
function inside(lat: number, lon: number, rings: number[][]) {
  let hit = false;
  for (const r of rings) {
    const n = r.length / 2;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const yi = r[i * 2 + 1];
      const yj = r[j * 2 + 1];
      if (yi > lat !== yj > lat && lon < ((r[j * 2] - r[i * 2]) * (lat - yi)) / (yj - yi) + r[i * 2]) hit = !hit;
    }
  }
  return hit;
}

/** Phóng gần hơn khoảng này thì tải ranh giới xã của tỉnh ở giữa khung; gần hơn nữa thì hiện tên xã. */
const COMMUNE_DIST = 110;
const COMMUNE_LABEL_DIST = 80;
/** Giữ tối đa bấy nhiêu tỉnh đã tải ranh giới xã (bỏ tỉnh cũ nhất). */
const MAX_PROVINCES = 3;

/** Sao năm cánh đều (đỉnh hướng lên), bán kính trong / ngoài = 0,382 như sao trên quốc kỳ. */
const STAR_POINTS = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  const r = i % 2 ? 46 * 0.382 : 46;
  return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
}).join(" ");

/** Thủ đô Hà Nội — đánh dấu bằng sao vàng năm cánh. */
const CAPITAL: [number, number] = [21.028, 105.854];

/** Nút "đi nhanh" trên bản đồ: [tên, vĩ độ, kinh độ, khoảng cách máy quay]. */
const JUMPS: [string, number, number, number][] = [
  ["Hà Nội", 21.03, 105.85, 45],
  ["Huế", 16.46, 107.59, 45],
  ["TP. Hồ Chí Minh", 10.78, 106.7, 45],
  ["Quần đảo Hoàng Sa", 16.4, 112.0, 60],
  ["Quần đảo Trường Sa", 9.9, 113.6, 110],
];

type Places = {
  tinh: { ten: string; loai?: string; toaDo: [number, number] }[];
  dao: { ten: string; toaDo: [number, number] }[];
  quanDao: { ten: string; thuoc: string; toaDo: [number, number]; dao: { ten: string; toaDo: [number, number] }[] }[];
  bien: { ten: string; toaDo: [number, number] }[];
  nuoc: { ten: string; toaDo: [number, number] }[];
};

/** Nhãn tỉnh, đảo nhỏ chỉ hiện khi đã phóng to tới khoảng cách này (đơn vị bản đồ). */
const DETAIL_DIST = 170;
/** Các mốc cách nhau dưới khoảng này (px trên màn hình) gom thành một cụm; phóng to thì tự tách ra. */
const CLUSTER_PX = 26;
/** Thứ tự ưu tiên nhãn khi chen nhau (nhỏ = giữ trước). */
const PRIO: Record<Label["kind"], number> = { archipelago: 0, capital: 1, city: 2, sea: 3, country: 4, province: 5, island: 6, commune: 7 };

type Cluster = { id: string; lat: number; lon: number; pins: MapPin[]; count: number };

/**
 * Bản đồ lộ trình: Việt Nam 3D, nhãn địa danh, mốc sự kiện theo thời kỳ. Rê chuột (hoặc chạm) vào mốc để xem
 * sự kiện; sự kiện đã có chương thì vào xem ngay.
 */
export default function HistoryMap({ pins, eras }: { pins: MapPin[]; eras: string[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const view = useRef<MapView | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [era, setEra] = useState(-1);
  const [onlyReady, setOnlyReady] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  /** Cụm mốc hiện tại — id các mốc trong từng cụm, tính lại sau mỗi lần bản đồ vẽ (chỉ đổi state khi khác). */
  const [groups, setGroups] = useState<string[][]>([]);
  /** Tên xã/phường quanh tâm khung nhìn (chỉ khi phóng rất gần). */
  const [communeLabels, setCommuneLabels] = useState<Label[]>([]);
  const geoState = useRef<{ provinces: Province[]; loaded: Map<string, Commune[]>; pending: Set<string>; labelSig: string }>({ provinces: [], loaded: new Map(), pending: new Set(), labelSig: "" });

  const shown = useMemo(
    () =>
      pins
        .map((p) => ({ ...p, events: p.events.filter((e) => (era < 0 || e.era === era) && (!onlyReady || e.slug)) }))
        .filter((p) => p.events.length),
    [pins, era, onlyReady],
  );

  const byId = useMemo(() => new Map(shown.map((p) => [p.id, p])), [shown]);
  const clusters: Cluster[] = useMemo(() => {
    const list = groups.map((ids) => ids.map((id) => byId.get(id)).filter((p): p is (typeof shown)[number] => !!p)).filter((g) => g.length);
    // mốc mới (vừa đổi bộ lọc) chưa nằm trong cụm nào: tạm đứng riêng tới lần vẽ sau
    const seen = new Set(list.flat().map((p) => p.id));
    for (const p of shown) if (!seen.has(p.id)) list.push([p]);
    return list.map((g) => ({ id: g.map((p) => p.id).join("+"), lat: g[0].lat, lon: g[0].lon, pins: g, count: g.reduce((n, p) => n + p.events.length, 0) }));
  }, [groups, byId, shown]);

  // đặt lại vị trí nhãn & mốc sau mỗi lần bản đồ vẽ — đổi style trực tiếp, không qua React
  const layout = useRef<() => void>(() => {});
  const groupSig = useRef("");

  // ranh giới xã: tải theo tỉnh đang ở giữa khung khi đã phóng gần; tên xã quanh tâm khi phóng rất gần
  function updateCommunes(v: MapView, dist: number) {
    const g = geoState.current;
    if (dist > COMMUNE_DIST * 1.3) {
      for (const slug of g.loaded.keys()) v.removeLines(`xa-${slug}`);
      g.loaded.clear();
    } else if (dist < COMMUNE_DIST) {
      const { lat, lon } = v.center();
      // khung bao tỉnh đã tính cả đặc khu ngoài khơi (Hoàng Sa, Trường Sa…) — đứng giữa biển thì lấy tỉnh có khung bao chứa điểm
      const inBox = g.provinces.filter((q) => lat >= q.bbox[0] && lat <= q.bbox[2] && lon >= q.bbox[1] && lon <= q.bbox[3]);
      const p = inBox.find((q) => inside(lat, lon, q.r)) ?? inBox[0];
      if (p && !g.loaded.has(p.slug) && !g.pending.has(p.slug)) {
        g.pending.add(p.slug);
        fetch(`/geo/xa/${p.slug}.json`)
          .then((r) => r.json() as Promise<{ xa: Commune[] }>)
          .then(({ xa }) => {
            g.pending.delete(p.slug);
            if (!view.current) return;
            g.loaded.set(p.slug, xa);
            view.current.setLines(`xa-${p.slug}`, xa.flatMap((x) => x.r), "#f1e6d2", 0.22, 0.17);
            while (g.loaded.size > MAX_PROVINCES) {
              const old = g.loaded.keys().next().value!;
              g.loaded.delete(old);
              view.current.removeLines(`xa-${old}`);
            }
          })
          .catch(() => g.pending.delete(p.slug));
      }
    }
    let next: Label[] = [];
    if (dist < COMMUNE_LABEL_DIST) {
      const { lat, lon } = v.center();
      const r2 = (dist / 600) ** 2;
      next = [...g.loaded.values()]
        .flat()
        .filter((x) => (x.c[0] - lat) ** 2 + (x.c[1] - lon) ** 2 < r2)
        .slice(0, 80)
        .map((x) => ({ text: x.ten, lat: x.c[0], lon: x.c[1], kind: "commune" as const }));
    }
    const sig = next.map((l) => l.text).join("|");
    if (sig !== g.labelSig) {
      g.labelSig = sig;
      setCommuneLabels(next);
    }
  }
  /** Kích thước nhãn (đo một lần — chữ không đổi) để tránh đo lại bố cục mỗi khung. */
  const [sizes] = useState(() => new WeakMap<HTMLElement, [number, number]>());
  useEffect(() => {
    layout.current = () => {
      const v = view.current;
      const root = wrap.current;
      if (!v || !root) return;
      const dist = v.distance();
      const detail = dist < DETAIL_DIST;
      const pt = { x: 0, y: 0 };
      updateCommunes(v, dist);
      // gom cụm: mốc nhiều sự kiện làm "đầu cụm", mốc khác rơi vào bán kính CLUSTER_PX thì nhập cụm
      const heads: { x: number; y: number; ids: string[] }[] = [];
      for (const p of [...shown].sort((a, b) => b.events.length - a.events.length)) {
        if (!v.project(p.lat, p.lon, pt)) continue;
        const h = heads.find((c) => (c.x - pt.x) ** 2 + (c.y - pt.y) ** 2 < CLUSTER_PX ** 2);
        if (h) h.ids.push(p.id);
        else heads.push({ x: pt.x, y: pt.y, ids: [p.id] });
      }
      const next = heads.map((h) => h.ids);
      const sig = next.map((g) => g.join("+")).join("|");
      if (sig !== groupSig.current) {
        groupSig.current = sig;
        setGroups(next);
      }
      // mốc trước, nhãn sau; nhãn đè lên mốc hoặc lên nhãn ưu tiên cao hơn thì ẩn (bản đồ thưa dần khi thu nhỏ)
      const taken: [number, number, number, number][] = [];
      const hits = (r: [number, number, number, number]) => taken.some((t) => r[0] < t[2] && r[2] > t[0] && r[1] < t[3] && r[3] > t[1]);
      // sao thủ đô: cỡ cố định trên màn hình, nhãn khác tránh đè lên
      root.querySelectorAll<HTMLElement>("[data-star]").forEach((el) => {
        const ok = v.project(CAPITAL[0], CAPITAL[1], pt);
        el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
        el.style.visibility = ok ? "visible" : "hidden";
        if (ok) taken.push([pt.x - 16, pt.y - 16, pt.x + 16, pt.y + 16]);
      });
      root.querySelectorAll<HTMLElement>("[data-pin]").forEach((el) => {
        const ok = v.project(Number(el.dataset.lat), Number(el.dataset.lon), pt);
        el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
        el.style.visibility = ok ? "visible" : "hidden";
        if (ok) taken.push([pt.x - 13, pt.y - 13, pt.x + 13, pt.y + 13]);
      });
      const labels = [...root.querySelectorAll<HTMLElement>("[data-label]")].sort((a, b) => Number(a.dataset.prio) - Number(b.dataset.prio));
      for (const el of labels) {
        const ok = v.project(Number(el.dataset.lat), Number(el.dataset.lon), pt);
        let show = ok && (el.dataset.detail !== "1" || detail);
        if (show) {
          let size = sizes.get(el);
          if (!size) sizes.set(el, (size = [el.firstElementChild?.clientWidth ?? 0, el.firstElementChild?.clientHeight ?? 0]));
          const [w, h] = size;
          const dx = el.dataset.anchor === "right" ? 6 : -w / 2;
          const dy = el.dataset.anchor === "above" ? -h * 1.6 : el.dataset.anchor === "below" ? 8 : -h / 2;
          const r: [number, number, number, number] = [pt.x + dx - 2, pt.y + dy - 1, pt.x + dx + w + 2, pt.y + dy + h + 1];
          show = !hits(r);
          if (show) taken.push(r);
        }
        el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
        el.style.visibility = show ? "visible" : "hidden";
      }
    };
    layout.current();
  });

  useEffect(() => {
    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (async () => {
      try {
        const [geo, places, mod] = await Promise.all([
          fetch("/geo/ne-10m-vn.json").then((r) => r.json()),
          fetch("/geo/dia-danh.json").then((r) => r.json() as Promise<Places>),
          import("../world/vietnam-map"),
        ]);
        if (disposed || !canvas.current) return;
        const islets = places.quanDao.flatMap((q) => q.dao.map((d) => d.toaDo));
        const created = await mod.createVietnamMap(canvas.current, { geo, heightUrl: "/geo/do-cao.png", islets, reducedMotion: reduced, onRender: () => layout.current() });
        if (disposed) {
          created.dispose();
          return;
        }
        view.current = created;
        // ranh giới 34 tỉnh/thành (không có cũng không sao: bản đồ vẫn chạy)
        fetch("/geo/tinh.json")
          .then((r) => (r.ok ? (r.json() as Promise<Province[]>) : []))
          .then((list) => {
            geoState.current.provinces = list;
            view.current?.setLines("tinh", list.flatMap((p) => p.r), "#e8c47e", 0.35, 0.15);
          })
          .catch(() => {});
        setLabels([
          ...places.nuoc.map((n) => ({ text: n.ten, lat: n.toaDo[0], lon: n.toaDo[1], kind: "country" as const })),
          ...places.bien.map((b) => ({ text: b.ten, lat: b.toaDo[0], lon: b.toaDo[1], kind: "sea" as const })),
          ...places.quanDao.map((q) => ({ text: q.ten, sub: q.thuoc, lat: q.toaDo[0], lon: q.toaDo[1], kind: "archipelago" as const })),
          ...places.quanDao.flatMap((q) => q.dao.map((d) => ({ text: d.ten, lat: d.toaDo[0], lon: d.toaDo[1], kind: "island" as const }))),
          ...places.dao.map((d) => ({ text: d.ten, lat: d.toaDo[0], lon: d.toaDo[1], kind: "island" as const })),
          ...places.tinh.map((t) => ({
            text: t.ten,
            lat: t.toaDo[0],
            lon: t.toaDo[1],
            kind: t.loai === "thu-do" ? ("capital" as const) : t.loai === "tp" ? ("city" as const) : ("province" as const),
          })),
        ]);
        setStatus("ready");
      } catch (err) {
        console.warn("[map] không dựng được bản đồ", err);
        if (!disposed) setStatus("failed");
      }
    })();
    return () => {
      disposed = true;
      view.current?.dispose();
      view.current = null;
    };
  }, []);

  // bấm ra ngoài thì đóng thẻ đang mở
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-map-ui]")) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  // thẻ thông tin theo danh sách mốc (id cụm = id các mốc nối bằng "+"), nên vẫn đúng khi cụm tách ra lúc phóng to
  const activeIds = new Set((open ?? hover)?.split("+") ?? []);
  const activePins = shown.filter((p) => activeIds.has(p.id));
  const active = activePins.length ? { pins: activePins } : null;
  const detailKinds = new Set(["province", "island"]);

  return (
    <div className={css.map}>
      <div className={css.filters} role="group" aria-label="Lọc sự kiện theo thời kỳ">
        <button type="button" className={`chip ${era < 0 ? "chip--on" : ""}`} aria-pressed={era < 0} onClick={() => setEra(-1)}>
          Mọi thời kỳ
        </button>
        {eras.map((e, i) => (
          <button key={e} type="button" className={`chip ${era === i ? "chip--on" : ""}`} aria-pressed={era === i} onClick={() => setEra(i)}>
            {e}
          </button>
        ))}
        <label className={css.toggle}>
          <input type="checkbox" checked={onlyReady} onChange={(e) => setOnlyReady(e.currentTarget.checked)} /> Chỉ sự kiện đã có chương
        </label>
      </div>

      <div className={css.jumps} role="group" aria-label="Đi nhanh tới">
        <span>Đi tới:</span>
        {JUMPS.map(([name, lat, lon, d]) => (
          <button key={name} type="button" className="chip" onClick={() => view.current?.focus(lat, lon, d)} disabled={status !== "ready"}>
            {name}
          </button>
        ))}
      </div>

      <div ref={wrap} className={css.stage}>
        <canvas ref={canvas} className={css.canvas} aria-label="Bản đồ Việt Nam ba chiều. Kéo để di chuyển, cuộn hoặc chụm hai ngón để phóng to." />
        {status === "loading" && <p className={css.status}>Đang dựng bản đồ…</p>}
        {status === "failed" && <p className={css.status}>Trình duyệt không dựng được bản đồ 3D. Danh sách sự kiện ở bên dưới.</p>}

        {[...labels, ...communeLabels].map((l) => (
          <span
            key={`${l.kind}-${l.text}`}
            className={`${css.label} ${css[l.kind]}`}
            data-label
            data-prio={PRIO[l.kind]}
            data-anchor={l.kind === "island" ? "right" : l.kind === "archipelago" ? "above" : l.kind === "city" || l.kind === "capital" || l.kind === "province" ? "below" : "center"}
            data-lat={l.lat}
            data-lon={l.lon}
            data-detail={detailKinds.has(l.kind) ? "1" : "0"}
            aria-hidden="true"
          >
            <span>
              {l.text}
              {l.sub && <small>{l.sub}</small>}
            </span>
          </span>
        ))}

        {status === "ready" && (
          <span className={css.star} data-star role="img" aria-label="Thủ đô Hà Nội">
            <svg viewBox="-50 -50 100 100" width="34" height="34" aria-hidden="true">
              <polygon points={STAR_POINTS} />
            </svg>
          </span>
        )}

        {status === "ready" &&
          clusters.map((c) => {
            const ready = c.pins.some((p) => p.events.some((e) => e.slug));
            const places = c.pins.map((p) => p.place).join(", ");
            return (
              <button
                key={c.id}
                type="button"
                className={`${css.pin} ${ready ? css.ready : ""} ${c.pins.some((p) => activeIds.has(p.id)) ? css.active : ""}`}
                data-pin
                data-lat={c.lat}
                data-lon={c.lon}
                data-map-ui
                aria-label={`${places}: ${c.count} sự kiện`}
                aria-expanded={open === c.id}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHover(c.id)}
                onPointerLeave={() => setHover((h) => (h === c.id ? null : h))}
                onFocus={() => setHover(c.id)}
                onBlur={() => setHover((h) => (h === c.id ? null : h))}
                onClick={() => {
                  setOpen(open === c.id ? null : c.id);
                  const v = view.current;
                  // cụm nhiều địa danh: sà xuống gần để các mốc tách ra
                  if (v) v.focus(c.lat, c.lon, c.pins.length > 1 ? Math.max(30, v.distance() * 0.45) : Math.min(v.distance(), 120));
                }}
              >
                <span className={css.dot} />
                {c.count > 1 && <span className={css.count}>{c.count}</span>}
              </button>
            );
          })}

        {status === "ready" && (
          <p className={css.credit}>
            Dữ liệu: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a> ·{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              © OpenStreetMap
            </a>
          </p>
        )}
        {status === "ready" && (
          <div className={css.zoom}>
            <button type="button" className="chip" aria-label="Phóng to" onClick={() => view.current?.zoom(0.7)}>
              +
            </button>
            <button type="button" className="chip" aria-label="Thu nhỏ" onClick={() => view.current?.zoom(1.4)}>
              −
            </button>
            <button type="button" className="chip" aria-label="Về toàn cảnh" onClick={() => view.current?.reset()}>
              ⟲
            </button>
          </div>
        )}

        {active && (
          <aside data-map-ui className={`${css.card} ${open ? css.open : ""}`} aria-live="polite">
            {active.pins.map((p) => (
              <section key={p.id} className={css.place}>
                <p className="kicker">{p.place}</p>
                <ol>
                  {p.events.map((e) => (
                    <li key={`${e.year}-${e.title}`}>
                      <p className={css.year}>
                        {e.year}
                        {e.legend && <em> · truyền thuyết</em>}
                      </p>
                      <h3>{e.title}</h3>
                      <p className={css.text}>{e.text}</p>
                      {(e.ancient || e.before2025 || e.now) && (
                        <dl className={css.addr}>
                          {e.ancient && (
                            <>
                              <dt>Tên xưa</dt>
                              <dd>{e.ancient}</dd>
                            </>
                          )}
                          {e.before2025 && (
                            <>
                              <dt>Trước 2025</dt>
                              <dd>{e.before2025}</dd>
                            </>
                          )}
                          {e.now && (
                            <>
                              <dt>Hiện nay</dt>
                              <dd>{e.now}*</dd>
                            </>
                          )}
                        </dl>
                      )}
                      {e.slug ? (
                        <p className={css.go}>
                          <Link className="btn btn--primary" href={`/chuong/${e.slug}`}>
                            ▶ Xem chương
                          </Link>
                          <ReadBadge slug={e.slug} />
                        </p>
                      ) : (
                        <p className={css.wait}>Chương này đang chờ người viết.</p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            {active.pins.some((p) => p.events.some((e) => e.now)) && (
              <p className={css.hint}>* Tính tự động từ toạ độ gần đúng, có thể lệch sang xã bên cạnh.</p>
            )}
            {!open && <p className={css.hint}>{active.pins.length > 1 ? "Bấm để phóng to, các mốc sẽ tách ra." : "Bấm vào mốc để giữ thẻ này."}</p>}
          </aside>
        )}
      </div>
    </div>
  );
}
