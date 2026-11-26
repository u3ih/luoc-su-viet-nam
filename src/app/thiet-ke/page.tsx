import type { Metadata } from "next";
import { Button, Card, Chip, Disclosure, DongSonBand, DongSonDrum, Icon, iconNames, Kicker, Link, Seal, SectionHead, Star, Tag } from "@/core/ui";
import TopBar from "@/core/ui/TopBar";
import { site } from "@/site.config";
import Demo from "./Demo";
import css from "./page.module.scss";

export const metadata: Metadata = {
  title: "Hệ thống thiết kế",
  description: "Token màu, chữ, khoảng cách và component nền của Lược sử Việt Nam — cho người đóng góp giao diện.",
  alternates: { canonical: "/thiet-ke" },
  robots: { index: false, follow: true },
};

const PRINCIPLES = [
  ["Cổ ở chất liệu, mới ở bố cục", "Then, son, vàng kim, giấy dó, chữ serif và hoa văn Đông Sơn là chất liệu. Bố cục thì thoáng, bo mềm, ít viền, phân cấp rõ."],
  ["Một điểm son mỗi vùng", "Mỗi vùng màn hình chỉ một nút son (primary). Hành động phụ dùng nút viền hoặc chữ."],
  ["Hoa văn là điểm nhấn", "Dải hoa văn, mặt trống, con dấu chỉ đặt ở ranh giới lớn: dưới tiêu đề phân cảnh, chân trang, thẻ chương. Không rải đều mọi tiêu đề."],
  ["Chữ trước, trang trí sau", "Tiêu đề serif, thân chữ sans 16–17px, dòng 1,7. Nhãn chữ hoa giãn cách chỉ dùng cho dòng nhỏ trên tiêu đề."],
  ["Điện thoại trước", "Vùng chạm ≥ 44px, hàng chip cuộn ngang sát mép, nút chính rộng hết hàng, ô nhập 16px."],
] as const;

const COLORS = [
  ["--bg", "Nền then"],
  ["--surface-1", "Mặt thẻ"],
  ["--surface-lacquer", "Sơn mài"],
  ["--surface-veil", "Màn tối trên cảnh 3D"],
  ["--text", "Chữ"],
  ["--text-muted", "Chữ phụ"],
  ["--text-faint", "Chữ mờ"],
  ["--accent", "Vàng kim"],
  ["--accent-soft", "Vàng nhạt"],
  ["--action", "Son"],
  ["--son-sang", "Son sáng"],
  ["--canh-gian", "Cánh gián"],
] as const;

const TYPE = [
  ["--fs-display", "Lược sử Việt Nam", "display"],
  ["--fs-h1", "Bản đồ lịch sử", "display"],
  ["--fs-h2", "Các chương", "display"],
  ["--fs-h3", "Thời Lý", "display"],
  ["--fs-lg", "Lời dẫn: một dòng sông, một con nước.", "body"],
  ["--fs-base", "Thân chữ: Ngô Quyền cho đóng cọc lớn đầu bịt sắt xuống lòng sông.", "body"],
  ["--fs-sm", "Chữ phụ: Nguồn tham khảo, chú thích, nhãn nút.", "body"],
  ["--fs-xs", "Chữ nhỏ: giấy phép, ghi chú cuối trang.", "body"],
] as const;

const SPACE = ["--s-1", "--s-2", "--s-3", "--s-4", "--s-5", "--s-6", "--s-7", "--s-8", "--s-9"];

export default function DesignPage() {
  return (
    <div className={css.page}>
      <TopBar scrolls />
      <div className={css.inner}>
        <SectionHead
          level={1}
          kicker="Hệ thống thiết kế"
          title="Sơn mài hiện đại"
          lead={
            <>
              Token và component nền dùng chung cho mọi trang. Mã: <code>src/app/globals.css</code> (token), <code>src/core/ui/base</code> (component) — import duy nhất
              qua <code>@/core/ui</code>. Đặc tả đầy đủ:{" "}
              <Link href={`${site.repo}/blob/${site.branch}/src/core/ui/DESIGN.md`}>DESIGN.md</Link>.
            </>
          }
        />

        <section className={css.block}>
          <SectionHead level={2} title="Nguyên tắc" />
          <ol className={css.grid}>
            {PRINCIPLES.map(([t, d], i) => (
              <Card as="li" key={t} tone={i === 0 ? "lacquer" : "plain"}>
                <p className={css.num}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className={css.h3}>{t}</h3>
                <p className={css.muted}>{d}</p>
              </Card>
            ))}
          </ol>
        </section>

        <section className={css.block}>
          <SectionHead level={2} title="Màu" lead="Dùng token theo vai trò. Không viết mã màu lẻ trong component." />
          <ul className={css.swatches}>
            {COLORS.map(([v, label]) => (
              <li key={v}>
                <span className={css.swatch} style={{ background: `var(${v})` }} />
                <b>{label}</b>
                <code>{v}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className={css.block}>
          <SectionHead level={2} title="Chữ" lead="Tiêu đề: LSVN Display (Playfair Display). Thân: Be Vietnam Pro. Hai phông, không thêm phông thứ ba." />
          <ul className={css.type}>
            {TYPE.map(([v, sample, f]) => (
              <li key={v}>
                <code>{v}</code>
                <span className={f === "display" ? css.display : undefined} style={{ fontSize: `var(${v})` }}>
                  {sample}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={css.block}>
          <SectionHead level={2} title="Khoảng cách, bo góc, nổi khối" lead="Bậc 4px. Mục cách nhau --section-y; trong thẻ dùng --s-3 tới --s-5." />
          <ul className={css.space}>
            {SPACE.map((v) => (
              <li key={v}>
                <code>{v}</code>
                <span style={{ width: `var(${v})` }} />
              </li>
            ))}
          </ul>
          <ul className={css.radii}>
            {["--r-sm", "--r-md", "--r-lg", "--r-pill"].map((r) => (
              <li key={r} style={{ borderRadius: `var(${r})` }}>
                <code>{r}</code>
              </li>
            ))}
            {["--shadow-1", "--shadow-2"].map((s) => (
              <li key={s} style={{ boxShadow: `var(${s})` }}>
                <code>{s}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className={css.block}>
          <SectionHead level={2} title="Nút & chip" />
          <div className={css.stack}>
            <div className={css.row}>
              <Button variant="primary">
                <Icon name="play" size={12} /> Xem trực quan
              </Button>
              <Button>
                <Icon name="map" /> Bản đồ & lộ trình
              </Button>
              <Button variant="quiet">
                Xem trên bản đồ <Icon name="arrow" size={14} />
              </Button>
              <Button size="sm">Nhỏ</Button>
            </div>
            <div className={css.row}>
              <Chip>Chip</Chip>
              <Chip on>Đang chọn</Chip>
              <Chip count={21}>Có số đếm</Chip>
              <Chip icon="book">Có biểu tượng</Chip>
              <Tag>truyền thuyết</Tag>
              <Tag tone="gold">diễn ý</Tag>
              <Tag tone="son">mới</Tag>
            </div>
          </div>
        </section>

        <section className={css.block}>
          <SectionHead level={2} title="Ô nhập & bộ lọc" />
          <Demo />
        </section>

        <section className={css.block}>
          <SectionHead level={2} title="Thẻ" lead="Card: plain (mặt giấy), lacquer (sơn mài — thẻ nổi bật), veil (nền tối đặt trên cảnh 3D); interactive khi cả thẻ là link." />
          <ul className={css.grid}>
            {(["plain", "lacquer", "veil"] as const).map((tone) => (
              <Card as="li" key={tone} tone={tone} interactive>
                <p className={css.num}>938</p>
                <h3 className={css.h3}>
                  <Link href="/chuong/bach-dang-938" data-cover="">
                    Bạch Đằng · {tone}
                  </Link>
                </h3>
                <p className={css.muted}>Một dòng sông, một con nước, và một bãi cọc ngầm.</p>
              </Card>
            ))}
          </ul>
          <Disclosure summary="Disclosure — mục thu gọn">
            <p className={css.muted}>Nội dung vẫn có trong HTML để tìm kiếm và trình đọc màn hình đọc được.</p>
          </Disclosure>
        </section>

        <section className={css.block}>
          <SectionHead level={2} title="Biểu tượng" lead="Nét mảnh 2px, khung 24. Thêm biểu tượng mới vào base/Icon.tsx." />
          <ul className={css.icons}>
            {iconNames.map((n) => (
              <li key={n}>
                <Icon name={n} size={20} />
                <code>{n}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className={css.block}>
          <SectionHead level={2} title="Hoa văn" lead="Vẽ đúng hiện vật (trống Ngọc Lũ) — nguồn và giấy phép ghi trong ornaments/." />
          <div className={css.ornaments}>
            <DongSonDrum className={css.drum} />
            <div className={css.stack}>
              <Kicker>Kicker · nhãn trên tiêu đề</Kicker>
              <DongSonBand className="band" />
              <div className={css.row}>
                <Seal lines={["Bạch", "938"]} />
                <Star className={css.star} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
