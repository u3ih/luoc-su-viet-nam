import type { Metadata } from "next";
import { listChapters } from "@/core/content/load";
import { loadRoadmap } from "@/core/content/roadmap";
import { ldJson, roadmapJsonLd } from "@/core/content/seo";
import { ReadSummary } from "@/core/ui/ReadProgress";
import TopBar from "@/core/ui/TopBar";
import { site } from "@/site.config";
import css from "./page.module.scss";
import RoadmapExplorer from "./RoadmapExplorer";

const description = "Bản đồ Việt Nam 3D và dòng thời gian các sự kiện lịch sử, từ thời tiền sử, Văn Lang – Âu Lạc đến hiện đại. Sự kiện nào đã có chương thì xem ngay.";

export const metadata: Metadata = {
  title: "Bản đồ & lộ trình lịch sử Việt Nam",
  description,
  alternates: { canonical: "/lo-trinh" },
  openGraph: { type: "website", locale: "vi_VN", url: "/lo-trinh", title: "Bản đồ lịch sử Việt Nam", description, images: [{ url: "/og/lo-trinh.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Bản đồ lịch sử Việt Nam", description, images: ["/og/lo-trinh.jpg"] },
};

export default function RoadmapPage() {
  const eras = loadRoadmap();
  const ready = new Set(listChapters().filter((c) => c.status === "ready").map((c) => c.slug));
  // chương chưa sẵn sàng (draft) thì coi như chưa có chương
  const shown = eras.map((era) => ({ ...era, events: era.events.map((ev) => ({ ...ev, slug: ev.slug && ready.has(ev.slug) ? ev.slug : undefined })) }));
  const total = shown.reduce((n, e) => n + e.events.length, 0);

  return (
    <div className={css.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(roadmapJsonLd(eras))} />
      <TopBar />
      <header className={css.head}>
        <p className="kicker">Lược sử Việt Nam · Lộ trình</p>
        <h1 className={css.title}>Bản đồ lịch sử</h1>
        <p className={css.lead}>
          {total} sự kiện từ thời tiền sử đến nay, xếp theo thời gian và cắm mốc trên bản đồ. Rê chuột hoặc chạm vào một mốc để xem; sự kiện đã có chương thì
          vào xem ngay. Những sự kiện còn lại đang chờ cộng đồng cùng viết.
        </p>
        <ReadSummary slugs={[...ready]} />
      </header>

      <RoadmapExplorer
        eras={shown}
        footer={
          <p className={css.foot}>
            Thấy thiếu sự kiện hay sai mốc năm?{" "}
            <a href={`${site.repo}/edit/${site.branch}/content/lo-trinh.md`} target="_blank" rel="noreferrer">
              Sửa content/lo-trinh.md
            </a>{" "}
            kèm nguồn. Dữ liệu bản đồ: Natural Earth (public domain, góc nhìn Việt Nam) và ranh giới tỉnh, xã/phường sau
            01/7/2025 từ © OpenStreetMap contributors (ODbL). Địa chỉ &ldquo;hiện nay&rdquo; được tính tự động từ toạ độ gần đúng nên có thể
            lệch sang xã bên cạnh.
          </p>
        }
      />
    </div>
  );
}
