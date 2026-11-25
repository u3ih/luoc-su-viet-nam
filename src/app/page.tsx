import { groupChaptersByEra } from "@/core/content/eras";
import { loadJourneys } from "@/core/content/journeys";
import { listChapters } from "@/core/content/load";
import { loadRoadmap } from "@/core/content/roadmap";
import { ldJson, siteJsonLd } from "@/core/content/seo";
import { Button, DongSonBand, Icon, Kicker, Link } from "@/core/ui";
import { ContinueButton, ReadSummary } from "@/core/ui/ReadProgress";
import SmoothScroll from "@/core/ui/SmoothScroll";
import { href } from "@/core/ui/i18n";
import { site } from "@/site.config";
import ChapterBrowser from "./ChapterBrowser";
import Journeys from "./Journeys";
import HomeDrum from "./HomeDrum";
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
    cards: g.chapters.map((c) => ({ slug: c.slug, title: c.title, year: c.year, era: c.era, teaser: c.teaser, seal: c.seal ?? [c.title.split(" ")[0], c.year], textUrl: href.text(c.slug) })),
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
      <SmoothScroll />
      <header className="home__hero">
        <HomeDrum />
        <Kicker>Dự án cộng đồng&nbsp;· Mã nguồn mở</Kicker>
        <h1 className={`home__title ${css.title}`}>
          Lược sử
          <br />
          Việt Nam
        </h1>
        <p className="home__lead">
          Học lịch sử qua những câu chuyện 3D tương tác. Mỗi chương là một trận đánh, một quyết định, một bước ngoặt — kể bằng hình ảnh, âm thanh và chính đôi tay người xem.
        </p>
        <div className="home__cta">
          <ContinueButton chapters={chapters.map((c) => ({ slug: c.slug, title: c.title }))} />
          <Button href="/lo-trinh">
            Bản đồ & lộ trình lịch sử
          </Button>
        </div>
        <p className={css.langs}>
          <Link href="/en" hrefLang="en" lang="en">
            English: a few chapters
          </Link>
        </p>
        <Link className={css.down} href="#cac-chuong">
          <span>Các chương</span>
          <Icon name="down" size={16} />
        </Link>
      </header>

      <section className="home__section" id="hanh-trinh">
        <h2 className="home__h2">Hành trình gợi ý</h2>
        <DongSonBand className="band" />
        <p className={css.note}>Chưa biết bắt đầu từ đâu? Chọn một hành trình: các chương nối nhau theo chủ đề, xem hết chương này thì chuyển sang chương kế.</p>
        <Journeys journeys={loadJourneys()} />
      </section>

      <section className="home__section" id="cac-chuong">
        <h2 className="home__h2">Các chương</h2>
        <DongSonBand className="band" />
        <ReadSummary slugs={chapters.map((c) => c.slug)} />
        <ChapterBrowser eras={eras} />
      </section>

      {waiting.length > 0 && (
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
                  <Button href={`${site.repo}/issues/new?template=de-xuat-chuong.yml&title=${encodeURIComponent(`[Chương] ${e.title} (${e.year})`)}`}>
                    Nhận viết chương này
                  </Button>
                </div>
              </li>
            ))}
          </ol>
          <div className="home__cta">
            <Button variant="primary" href="/lo-trinh">
              Xem toàn bộ lộ trình
            </Button>
          </div>
        </section>
      )}

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
        <div className="home__cta">
          <Button variant="primary" href="/dong-gop">
            Việc đang cần giúp
          </Button>
          <Button href={`${site.repo}/blob/${site.branch}/CONTRIBUTING.md`}>Hướng dẫn đóng góp</Button>
          <Button href="/phuong-phap">Phương pháp & nguồn</Button>
        </div>
      </section>

      <footer className="home__footer">
        <span>{site.name}</span> · Dự án mở, phi lợi nhuận · <Link href="/phuong-phap">Phương pháp & nguồn</Link> ·{" "}
        <Link href={site.repo}>
          GitHub
        </Link>
        <br />
        Mã nguồn{" "}
        <Link href={`${site.repo}/blob/${site.branch}/LICENSE`}>
          {site.license.code.name}
        </Link>{" "}
        · Nội dung{" "}
        <Link href={site.license.content.url} rel="license">
          {site.license.content.name}
        </Link>
      </footer>
    </div>
  );
}
