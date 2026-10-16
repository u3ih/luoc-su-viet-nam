import type { Metadata } from "next";
import Link from "next/link";
import { listChapters } from "@/core/content/load";
import { loadRoadmap } from "@/core/content/roadmap";
import { ldJson, roadmapJsonLd } from "@/core/content/seo";
import MapLoader from "@/core/ui/MapLoader";
import type { MapPin } from "@/core/ui/HistoryMap";
import DongSonBand from "@/core/ui/ornaments/DongSonBand";
import { ReadBadge, ReadSummary } from "@/core/ui/ReadProgress";
import TopBar from "@/core/ui/TopBar";
import { site } from "@/site.config";
import css from "./page.module.scss";

const description = "Bản đồ Việt Nam 3D và dòng thời gian các sự kiện lịch sử, từ thời tiền sử, Văn Lang – Âu Lạc đến hiện đại. Sự kiện nào đã có chương thì xem ngay.";

export const metadata: Metadata = {
  title: "Bản đồ & lộ trình lịch sử Việt Nam",
  description,
  alternates: { canonical: "/lo-trinh" },
  openGraph: { type: "website", locale: "vi_VN", url: "/lo-trinh", title: "Bản đồ lịch sử Việt Nam", description, images: [{ url: "/og/lo-trinh.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Bản đồ lịch sử Việt Nam", description, images: ["/og/lo-trinh.jpg"] },
};

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function RoadmapPage() {
  const eras = loadRoadmap();
  const ready = new Set(listChapters().filter((c) => c.status === "ready").map((c) => c.slug));
  const events = eras.flatMap((e, i) => e.events.map((ev) => ({ ...ev, slug: ev.slug && ready.has(ev.slug) ? ev.slug : undefined, era: i })));

  // gom sự kiện cùng địa danh thành một mốc trên bản đồ
  const pins = new Map<string, MapPin>();
  for (const ev of events) {
    if (!ev.latLon) continue;
    const key = `${ev.latLon[0].toFixed(2)},${ev.latLon[1].toFixed(2)}`;
    const pin = pins.get(key) ?? { id: key, place: ev.place ?? "", lat: ev.latLon[0], lon: ev.latLon[1], events: [] };
    pin.events.push({ year: ev.year, title: ev.title, text: ev.text, slug: ev.slug, legend: ev.legend, era: ev.era, ancient: ev.ancient, before2025: ev.before2025, now: ev.now });
    pins.set(key, pin);
  }

  return (
    <div className={css.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(roadmapJsonLd(eras))} />
      <TopBar />
      <header className={css.head}>
        <p className="kicker">Lược sử Việt Nam · Lộ trình</p>
        <h1 className={css.title}>Bản đồ lịch sử</h1>
        <p className={css.lead}>
          {events.length} sự kiện từ thời tiền sử đến nay, xếp theo thời gian và cắm mốc trên bản đồ. Rê chuột hoặc chạm vào một mốc để xem; sự kiện đã có chương thì
          vào xem ngay. Những sự kiện còn lại đang chờ cộng đồng cùng viết.
        </p>
        <ReadSummary slugs={[...ready]} />
      </header>

      <MapLoader pins={[...pins.values()]} eras={eras.map((e) => e.title)} />

      <section className={css.list} aria-label="Dòng thời gian">
        {eras.map((era, i) => (
          <section key={era.title} className={css.era} id={slugify(era.title)}>
            <h2 className={css.eraTitle}>{era.title}</h2>
            <DongSonBand className="band" />
            {era.intro && <p className={css.eraIntro}>{era.intro}</p>}
            <ol className={css.events}>
              {events
                .filter((e) => e.era === i)
                .map((e) => (
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
        ))}
        <p className={css.foot}>
          Thấy thiếu sự kiện hay sai mốc năm?{" "}
          <a href={`${site.repo}/edit/${site.branch}/content/lo-trinh.md`} target="_blank" rel="noreferrer">
            Sửa content/lo-trinh.md
          </a>{" "}
          kèm nguồn. Dữ liệu bản đồ: Natural Earth (public domain, góc nhìn Việt Nam) và ranh giới tỉnh, xã/phường sau
          01/7/2025 từ © OpenStreetMap contributors (ODbL). Địa chỉ &ldquo;hiện nay&rdquo; được tính tự động từ toạ độ gần đúng nên có thể
          lệch sang xã bên cạnh.
        </p>
      </section>
    </div>
  );
}
