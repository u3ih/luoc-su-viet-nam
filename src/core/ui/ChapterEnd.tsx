import Link from "next/link";
import { site } from "@/site.config";
import type { Chapter } from "../types";
import css from "./ChapterEnd.module.scss";
import DongSonBand from "./ornaments/DongSonBand";

/** Cuối chương: nguồn, chương tiếp theo, mời góp ý trên GitHub. */
export default function ChapterEnd({ chapter, textUrl, editUrl }: { chapter: Chapter; textUrl: string; editUrl: string }) {
  return (
    <div className="chapter-end beat__extra">
      <DongSonBand className="band band--dim" />
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
      {chapter.next && (
        <p className="next">
          <span>Tiếp theo</span>
          {chapter.next.slug ? <Link href={`/chuong/${chapter.next.slug}`}>{chapter.next.title}</Link> : chapter.next.title} · {chapter.next.year}
          {!chapter.next.slug && (
            <Link className={css.wait} href="/lo-trinh">
              Đang chờ người viết
            </Link>
          )}
        </p>
      )}
      <div className="contribute">
        <a href={textUrl} target="_blank" rel="noreferrer">
          Đọc bản chữ
        </a>
        <a href={editUrl} target="_blank" rel="noreferrer">
          Góp ý, sửa nội dung
        </a>
        <Link href="/lo-trinh">Lộ trình lịch sử</Link>
        <Link href="/">Các chương khác</Link>
      </div>
      {chapter.disclaimer && <p className="disclaimer">{chapter.disclaimer}</p>}
      <p className="disclaimer">
        Nội dung theo giấy phép{" "}
        <a href={site.license.content.url} target="_blank" rel="license noreferrer">
          {site.license.content.name}
        </a>
        . Mã nguồn {site.license.code.name}.
      </p>
    </div>
  );
}
