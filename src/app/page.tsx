import { groupChaptersByEra } from "@/core/content/eras";
import { loadJourneys } from "@/core/content/journeys";
import { listChapters } from "@/core/content/load";
import { loadRoadmap } from "@/core/content/roadmap";
import { ldJson, siteJsonLd } from "@/core/content/seo";
import { Button, Card, DongSonBand, Icon, type IconName, Kicker, Link, SectionHead } from "@/core/ui";
import { ContinueButton, ReadSummary } from "@/core/ui/ReadProgress";
import SmoothScroll from "@/core/ui/SmoothScroll";
import TopBar from "@/core/ui/TopBar";
import { href } from "@/core/ui/i18n";
import { site } from "@/site.config";
import ChapterBrowser from "./ChapterBrowser";
import HomeDrum from "./HomeDrum";
import Journeys from "./Journeys";
import css from "./page.module.scss";

/** Số sự kiện chưa có chương được gợi ý ở trang chủ. */
const SUGGEST = 6;

const HELP: { icon: IconName; title: string; text: string }[] = [
  { icon: "pen", title: "Viết & sửa lời kể", text: "Mỗi chương là một file Markdown. Sửa ngay trên GitHub, không cần biết lập trình." },
  { icon: "check", title: "Thẩm định sử liệu", text: "Thấy chi tiết chưa chính xác? Mở một góp ý kèm nguồn — mọi phản hồi đều được ghi nhận." },
  { icon: "cube", title: "Dựng cảnh 3D", text: "Làm model bằng Blender, dựng cảnh bằng Three.js theo bộ khung có sẵn." },
];

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
    <div className={css.home}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(siteJsonLd(chapters))} />
      <SmoothScroll />
      <TopBar scrolls />
      <header className={css.hero}>
        <HomeDrum />
        <div className={css.heroText}>
          <Kicker>Dự án cộng đồng&nbsp;· Mã nguồn mở</Kicker>
          <h1 className={css.title}>
            Lược sử
            <br />
            Việt Nam
          </h1>
          <p className={css.lead}>
            Học lịch sử qua những câu chuyện 3D tương tác. Mỗi chương là một trận đánh, một quyết định, một bước ngoặt — kể bằng hình ảnh, âm thanh và chính đôi tay người xem.
          </p>
          <div className={css.cta}>
            <ContinueButton chapters={chapters.map((c) => ({ slug: c.slug, title: c.title }))} />
            <Button href="/lo-trinh">
              <Icon name="map" /> Bản đồ & lộ trình
            </Button>
          </div>
          <p className={css.stats}>
            <span>
              <b>{chapters.length}</b> chương
            </span>
            <span>
              <b>{events.length}</b> sự kiện có nguồn
            </span>
            <Link href="/en" hrefLang="en" lang="en">
              English
            </Link>
          </p>
        </div>
        <Link className={css.down} href="#hanh-trinh">
          <span>Khám phá</span>
          <Icon name="down" size={16} />
        </Link>
      </header>

      <section className={css.section} id="hanh-trinh">
        <div className={css.inner}>
          <SectionHead kicker="Bắt đầu từ đâu" title="Hành trình gợi ý" lead="Các chương nối nhau theo một chủ đề: xem hết chương này thì chuyển sang chương kế." />
          <Journeys journeys={loadJourneys()} />
        </div>
      </section>

      <section className={css.section} id="cac-chuong">
        <div className={css.inner}>
          <SectionHead
            kicker="Thư viện"
            title="Các chương"
            lead="Xếp theo thời kỳ, từ thời tiền sử đến nay. Mỗi chương xem được dạng cảnh 3D hoặc đọc bản chữ."
            action={
              <Button variant="quiet" href="/lo-trinh">
                Xem trên bản đồ <Icon name="arrow" size={14} />
              </Button>
            }
          />
          <ReadSummary slugs={chapters.map((c) => c.slug)} />
          <ChapterBrowser eras={eras} />
        </div>
      </section>

      {waiting.length > 0 && (
        <section className={css.section}>
          <div className={css.inner}>
            <SectionHead
              kicker="Cần người viết"
              title="Đang chờ người viết"
              lead={
                <>
                  {events.length} sự kiện đã được xếp trên <Link href="/lo-trinh">bản đồ lộ trình</Link>, {events.filter((e) => e.slug).length} sự kiện đã có chương. Mỗi
                  thời kỳ một gợi ý — chọn một sự kiện và cùng viết tiếp.
                </>
              }
            />
            <ol className={css.waiting}>
              {waiting.map((e) => (
                <Card as="li" key={`${e.sortYear}-${e.title}`} className={css.waitCard}>
                  <p className={css.waitYear}>{e.year}</p>
                  <h3 className={css.waitTitle}>{e.title}</h3>
                  <p className={css.waitText}>{e.text}</p>
                  <Button size="sm" href={`${site.repo}/issues/new?template=de-xuat-chuong.yml&title=${encodeURIComponent(`[Chương] ${e.title} (${e.year})`)}`}>
                    Nhận viết chương này
                  </Button>
                </Card>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className={`${css.section} ${css.community}`}>
        <div className={css.inner}>
          <SectionHead kicker="Cùng góp sức" title="Lịch sử là của chung" lead="Dự án mở, phi lợi nhuận. Ai cũng có thể góp một tay — không nhất thiết phải biết lập trình." />
          <ul className={css.help}>
            {HELP.map((h) => (
              <Card as="li" key={h.title} tone="plain">
                <span className={css.helpIcon}>
                  <Icon name={h.icon} size={18} />
                </span>
                <h3 className={css.helpTitle}>{h.title}</h3>
                <p className={css.helpText}>{h.text}</p>
              </Card>
            ))}
          </ul>
          <div className={css.ctaRow}>
            <Button variant="primary" href="/dong-gop">
              Việc đang cần giúp
            </Button>
            <Button href={`${site.repo}/blob/${site.branch}/CONTRIBUTING.md`}>Hướng dẫn đóng góp</Button>
          </div>
        </div>
      </section>

      <footer className={css.footer}>
        <div className={css.inner}>
          <DongSonBand className={css.footBand} />
          <div className={css.footGrid}>
            <div>
              <p className={css.footBrand}>{site.name}</p>
              <p className={css.footNote}>Học lịch sử qua câu chuyện 3D tương tác. Dự án mở, phi lợi nhuận, do cộng đồng cùng viết.</p>
            </div>
            <nav className={css.footNav} aria-label="Liên kết cuối trang">
              <Link href="/lo-trinh">Bản đồ & lộ trình</Link>
              <Link href="/phuong-phap">Phương pháp & nguồn</Link>
              <Link href="/dong-gop">Việc cần giúp</Link>
              <Link href="/thiet-ke">Hệ thống thiết kế</Link>
              <Link href={site.repo}>GitHub</Link>
              <Link href="/en" hrefLang="en" lang="en">
                English
              </Link>
            </nav>
          </div>
          <p className={css.license}>
            Mã nguồn <Link href={`${site.repo}/blob/${site.branch}/LICENSE`}>{site.license.code.name}</Link> · Nội dung{" "}
            <Link href={site.license.content.url} rel="license">
              {site.license.content.name}
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
