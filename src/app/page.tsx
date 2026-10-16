import Link from "next/link";
import { githubLinks } from "@/core/content/links";
import { listChapters } from "@/core/content/load";
import DongSonBand from "@/core/ui/ornaments/DongSonBand";
import DongSonDrum from "@/core/ui/ornaments/DongSonDrum";
import Seal from "@/core/ui/ornaments/Seal";
import { roadmap, site } from "@/site.config";

export default function Home() {
  const chapters = listChapters().filter((c) => c.status === "ready");
  return (
    <div className="home">
      <header className="home__hero">
        <DongSonDrum className="home__drum" birds={12} />
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
              ▶ Bắt đầu với {chapters[0].title} {chapters[0].year}
            </Link>
          )}
          <a className="btn" href={`${site.repo}/blob/${site.branch}/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
            Cùng viết lịch sử
          </a>
        </div>
      </header>

      <section className="home__section">
        <h2 className="home__h2">Các chương</h2>
        <DongSonBand className="band" />
        <ol className="chapters">
          {chapters.map((c) => (
            <li key={c.slug} className="chapter-card">
              <Seal lines={[c.numeral]} />
              <p className="chapter-card__era">{c.era}</p>
              <p className="chapter-card__year">{c.year}</p>
              <h3 className="chapter-card__title">{c.title}</h3>
              <p className="chapter-card__teaser">{c.teaser}</p>
              <div className="chapter-card__actions">
                <Link className="btn btn--primary" href={`/chuong/${c.slug}`}>
                  ▶ Xem trực quan
                </Link>
                <a className="btn" href={githubLinks(c.dir).textUrl} target="_blank" rel="noreferrer">
                  Đọc bản chữ
                </a>
              </div>
            </li>
          ))}
          {roadmap.map((r) => (
            <li key={r.numeral} className="chapter-card chapter-card--soon">
              <Seal lines={[r.numeral]} />
              <p className="chapter-card__era">{r.era}</p>
              <p className="chapter-card__year">{r.year}</p>
              <h3 className="chapter-card__title">{r.title}</h3>
              <p className="chapter-card__teaser">Chương này đang chờ người viết.</p>
              <div className="chapter-card__actions">
                <a className="btn" href={`${site.repo}/issues/new?template=de-xuat-chuong.yml&title=${encodeURIComponent(`[Chương ${r.numeral}] ${r.title} (${r.year})`)}`} target="_blank" rel="noreferrer">
                  Nhận viết chương này
                </a>
              </div>
            </li>
          ))}
        </ol>
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
