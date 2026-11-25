import type { Metadata } from "next";
import { getText, listChapters, listTranslated } from "@/core/content/load";
import { loadRoadmap, wikiOnly } from "@/core/content/roadmap";
import { Kicker, Link } from "@/core/ui";
import { href } from "@/core/ui/i18n";
import TopBar from "@/core/ui/TopBar";
import { site } from "@/site.config";
import css from "../prose.module.scss";

export const metadata: Metadata = {
  title: "Cần giúp",
  description: "Những việc đang chờ cộng đồng: bổ sung nguồn chính thống, thẩm định bản nháp, viết chương mới, câu hỏi ôn tập, bản dịch tiếng Anh.",
  alternates: { canonical: "/dong-gop" },
};

const edit = (path: string) => `${site.repo}/edit/${site.branch}/${path}`;

/** Bảng việc cần làm — tính lúc build từ nội dung, không có dữ liệu nào khác. */
export default function HelpPage() {
  const chapters = listChapters();
  const ready = chapters.filter((c) => c.status === "ready");
  const drafts = chapters.filter((c) => c.status === "draft");
  const eras = loadRoadmap();
  const events = eras.flatMap((e) => e.events);
  const wiki = eras.map((e) => ({ title: e.title, events: e.events.filter(wikiOnly) })).filter((e) => e.events.length);
  const wikiCount = wiki.reduce((n, e) => n + e.events.length, 0);
  const noQuiz = ready.filter((c) => !getText(c.slug)?.quiz.length);
  const translated = new Set(listTranslated("en").map((c) => c.slug));
  const waiting = events.filter((e) => !e.slug).length;

  return (
    <div className={css.page}>
      <TopBar scrolls />
      <article className={css.body}>
        <Kicker>Lược sử Việt Nam · Đóng góp</Kicker>
        <h1>Cần giúp</h1>
        <p>
          Những việc đang chờ cộng đồng, tính tự động từ nội dung hiện có. Không cần biết lập trình: phần lớn chỉ là sửa một file chữ trên GitHub. Cách làm xem{" "}
          <Link href={`${site.repo}/blob/${site.branch}/CONTRIBUTING.md`}>hướng dẫn đóng góp</Link> và <Link href="/phuong-phap">phương pháp & nguồn</Link>.
        </p>
        <ul className={css.stat}>
          {(
            [
              [wikiCount, "sự kiện mới chỉ có nguồn Wikipedia"],
              [drafts.length, "chương nháp chờ thẩm định"],
              [waiting, "sự kiện chưa có chương"],
              [noQuiz.length, "chương chưa có câu hỏi ôn tập"],
              [ready.length - translated.size, "chương chưa có bản tiếng Anh"],
            ] as const
          )
            .filter(([n]) => n > 0)
            .map(([n, label]) => (
              <li key={label}>
                <b>{n}</b>
                <span>{label}</span>
              </li>
            ))}
        </ul>

        <h2>Bổ sung nguồn chính thống</h2>
        <p>
          Mỗi sự kiện trên lộ trình cần ít nhất một nguồn ngoài Wikipedia: chính sử, bách khoa toàn thư, bảo tàng, lưu trữ, cơ quan nhà nước, công trình nghiên cứu. Mở
          link phải đọc được và đúng chủ đề. Thêm vào trường <code>nguon:</code> của dòng sự kiện trong{" "}
          <Link href={edit("content/lo-trinh.md")}>content/lo-trinh.md</Link> (tối đa 3 link, cách nhau bằng dấu cách).
        </p>
        {wiki.map((e) => (
          <details key={e.title} className={css.more}>
            <summary>
              {e.title} · {e.events.length}
            </summary>
            <ul>
              {e.events.map((ev) => (
                <li key={`${ev.sortYear}-${ev.title}`}>
                  <b>{ev.year}</b> · {ev.slug ? <Link href={href.chapter(ev.slug)}>{ev.title}</Link> : ev.title}
                </li>
              ))}
            </ul>
          </details>
        ))}

        <h2>Thẩm định chương nháp</h2>
        <p>Chương nháp mở được bằng link nhưng chưa hiện ở trang chủ. Đọc, đối chiếu nguồn và góp ý; người có chuyên môn sử học càng quý.</p>
        {drafts.length ? (
          <ul>
            {drafts.map((c) => (
              <li key={c.slug}>
                <Link href={href.chapter(c.slug)}>
                  {c.title} ({c.year})
                </Link>{" "}
                · <Link href={edit(`content/${c.dir}/story.md`)}>sửa</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={css.muted}>Hiện không có chương nháp.</p>
        )}

        <h2>Viết chương mới</h2>
        <p>
          {waiting} sự kiện trên <Link href="/lo-trinh">lộ trình</Link> chưa có chương. Chọn một sự kiện rồi{" "}
          <Link href={`${site.repo}/issues/new?template=de-xuat-chuong.yml`}>mở đề xuất chương</Link> để mọi người biết bạn đang viết.
        </p>

        <h2>Câu hỏi ôn tập</h2>
        <p>
          2–3 câu cuối mỗi chương, đáp án chỉ lấy từ chính lời kể. Định dạng mục <code>## Ôn tập</code> xem trong{" "}
          <Link href={`${site.repo}/blob/${site.branch}/content/README.md`}>content/README.md</Link>.
        </p>
        {noQuiz.length > 0 && (
          <details className={css.more}>
            <summary>{noQuiz.length} chương chưa có</summary>
            <ul>
              {noQuiz.map((c) => (
                <li key={c.slug}>
                  <Link href={edit(`content/${c.dir}/story.md`)}>
                    {c.title} ({c.year})
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}

        <h2>Dịch sang tiếng Anh</h2>
        <p>
          Bản dịch nằm cạnh bản gốc: <code>content/&lt;chương&gt;/story.en.md</code>, giữ nguyên id phân cảnh. Đã có {translated.size} chương ở{" "}
          <Link href="/en">/en</Link>; người đọc tốt tiếng Anh có thể giúp duyệt các bản dịch này.
        </p>
      </article>
    </div>
  );
}
