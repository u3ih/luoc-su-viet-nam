import { DongSonBand, Link } from "@/core/ui";
import { site } from "@/site.config";
import type { Chapter } from "../types";
import css from "./ChapterEnd.module.scss";

/** Cuối chương: chương tiếp theo, chương trước, nguồn, mời góp ý trên GitHub. */
export default function ChapterEnd({ chapter, textUrl, editUrl, onRestart }: { chapter: Chapter; textUrl: string; editUrl: string; onRestart: () => void }) {
  const { next, prev } = chapter;
  return (
    <div className="chapter-end beat__extra">
      <DongSonBand className="band band--dim" />
      {next &&
        (next.slug ? (
          <Link className={css.next} href={`/chuong/${next.slug}`}>
            <span className={css.nextLabel}>Chương tiếp theo</span>
            <span className={css.nextYear}>{next.year}</span>
            <span className={css.nextTitle}>{next.title}</span>
            <span className={css.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        ) : (
          <Link className={`${css.next} ${css.waiting}`} href="/lo-trinh">
            <span className={css.nextLabel}>Sự kiện kế tiếp · đang chờ người viết</span>
            <span className={css.nextYear}>{next.year}</span>
            <span className={css.nextTitle}>{next.title}</span>
            <span className={css.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      <div className={css.nav}>
        {prev?.slug && (
          <Link href={`/chuong/${prev.slug}`}>
            ← {prev.title} · {prev.year}
          </Link>
        )}
        <button type="button" onClick={onRestart}>
          ↺ Xem lại từ đầu
        </button>
      </div>

      {chapter.sources.length > 0 && (
        <div className="sources">
          <h3>Nguồn tham khảo</h3>
          <ul>
            {chapter.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="contribute">
        <Link href={textUrl}>
          Đọc bản chữ
        </Link>
        <Link href={editUrl}>
          Góp ý, sửa nội dung
        </Link>
        <Link href="/lo-trinh">Lộ trình lịch sử</Link>
        <Link href="/#cac-chuong">Các chương khác</Link>
      </div>
      <p className="disclaimer disclaimer--ai" role="note">
        {site.aiNotice}
      </p>
      {chapter.disclaimer && <p className="disclaimer">{chapter.disclaimer}</p>}
      <p className="disclaimer">
        Nội dung theo giấy phép{" "}
        <Link href={site.license.content.url} rel="license">
          {site.license.content.name}
        </Link>
        . Mã nguồn {site.license.code.name}.
      </p>
    </div>
  );
}
