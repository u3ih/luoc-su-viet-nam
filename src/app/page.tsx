import Link from "next/link";
import { githubLinks } from "@/core/content/links";
import { groupChaptersByEra } from "@/core/content/eras";
import { listChapters } from "@/core/content/load";
import { loadRoadmap } from "@/core/content/roadmap";
import { ldJson, siteJsonLd } from "@/core/content/seo";
import DongSonBand from "@/core/ui/ornaments/DongSonBand";
import DongSonDrum from "@/core/ui/ornaments/DongSonDrum";
import { ReadSummary } from "@/core/ui/ReadProgress";
import { site } from "@/site.config";
import ChapterBrowser from "./ChapterBrowser";
import css from "./page.module.scss";

/** Số sự kiện chưa có chương được gợi ý ở trang chủ. */
const SUGGEST = 6;

export default function Home() {
  const chapters = listChapters().filter((c) => c.status === "ready");
  const roadmap = loadRoadmap();
  const events = roadmap.flatMap((e) => e.events);
  const eras = groupChaptersByEra(chapters).map((g) => ({
    id: g.id,
    title: g.title,
    intro: g.intro,
    events: g.events,
    cards: g.chapters.map((c) => ({ slug: c.slug, title: c.title, year: c.year, era: c.era, teaser: c.teaser, seal: c.seal ?? [c.title.split(" ")[0], c.year], textUrl: githubLinks(c.dir).textUrl })),
  }));
  // gợi ý trải đều qua các thời kỳ (mỗi thời kỳ lấy sự kiện chưa có chương có lời mô tả dài nhất), thay vì dồn vào mấy sự kiện đầu tiên
  const pool = roadmap
    .map((era) => era.events.filter((e) => !e.slug).sort((a, b) => b.text.length - a.text.length)[0])
    .filter((e): e is NonNullable<typeof e> => !!e);
  const step = Math.max(1, Math.floor(pool.length / SUGGEST));
  const waiting = pool.filter((_, i) => i % step === 0).slice(0, SUGGEST);
  return (
    <div className="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(siteJsonLd(chapters))} />
      <header className="home__hero">
        <DongSonDrum className="home__drum" />
        <p className="kicker">Dự án cộng đồng · Mã nguồn mở</p>
        <h1 className="home__title">
          Lược sử
          <br />
          Việt Nam
        </h1>
        <p className="home__lead">
          Học lịch sử qua những câu chuyện 3D tương tác. Mỗi chương là một trận đánh, một quyết định, một bước ngoặt — kể bằng hình ảnh, âm thanh và chính đôi tay người xem.
        </p>
        <div className="home__cta">
          {chapters[0] && (
            <Link className="btn btn--primary" href={`/chuong/${chapters[0].slug}`}>
              ▶ Bắt đầu từ {chapters[0].title}
            </Link>
          )}
          <Link className="btn" href="/lo-trinh">
            Bản đồ & lộ trình lịch sử
          </Link>
        </div>
      </header>

      <section className="home__section" id="cac-chuong">
        <h2 className="home__h2">Các chương</h2>
        <DongSonBand className="band" />
        <ReadSummary slugs={chapters.map((c) => c.slug)} />
        <ChapterBrowser eras={eras} />
      </section>

      <section className="home__section">
        <h2 className="home__h2">Đang chờ người viết</h2>
        <DongSonBand className="band" />
        <p className={css.note}>
          {events.length} sự kiện từ thời tiền sử đến nay đã được xếp trên{" "}
          <Link href="/lo-trinh">bản đồ lộ trình</Link>, {events.filter((e) => e.slug).length} sự kiện đã có chương. Dưới đây là mỗi thời kỳ một gợi ý; chọn một sự kiện và cùng viết tiếp.
        </p>
        <ol className="chapters">
          {waiting.map((e) => (
            <li key={`${e.sortYear}-${e.title}`} className="chapter-card chapter-card--soon">
              <p className="chapter-card__era">{e.place ?? "Lộ trình"}</p>
              <p className={`chapter-card__year ${e.year.length > 5 ? css.yearLong : ""}`}>{e.year}</p>
              <h3 className="chapter-card__title">{e.title}</h3>
              <p className="chapter-card__teaser">{e.text}</p>
              <div className="chapter-card__actions">
                <a className="btn" href={`${site.repo}/issues/new?template=de-xuat-chuong.yml&title=${encodeURIComponent(`[Chương] ${e.title} (${e.year})`)}`} target="_blank" rel="noreferrer">
                  Nhận viết chương này
                </a>
              </div>
            </li>
          ))}
        </ol>
        <div className="home__cta">
          <Link className="btn btn--primary" href="/lo-trinh">
            Xem toàn bộ lộ trình
          </Link>
        </div>
      </section>

      <section className="home__section home__community">
        <h2 className="home__h2">Lịch sử là của chung</h2>
        <DongSonBand className="band" />
        <div className="community">
          <div>
            <h3>Viết & sửa lời kể</h3>
            <p>Mỗi chương là một file Markdown. Sửa ngay trên GitHub, không cần biết lập trình.</p>
          </div>
          <div>
            <h3>Thẩm định sử liệu</h3>
            <p>Thấy chi tiết chưa chính xác? Mở một góp ý kèm nguồn — mọi phản hồi đều được ghi nhận.</p>
          </div>
          <div>
            <h3>Dựng cảnh 3D</h3>
            <p>Làm model bằng Blender, dựng cảnh bằng Three.js theo bộ khung có sẵn.</p>
          </div>
        </div>
        <a className="btn btn--primary" href={`${site.repo}/blob/${site.branch}/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
          Hướng dẫn đóng góp
        </a>
      </section>

      <footer className="home__footer">
        <span>{site.name}</span> · Dự án mở, phi lợi nhuận ·{" "}
        <a href={site.repo} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <br />
        Mã nguồn{" "}
        <a href={`${site.repo}/blob/${site.branch}/LICENSE`} target="_blank" rel="noreferrer">
          {site.license.code.name}
        </a>{" "}
        · Nội dung{" "}
        <a href={site.license.content.url} target="_blank" rel="license noreferrer">
          {site.license.content.name}
        </a>
      </footer>
    </div>
  );
}
