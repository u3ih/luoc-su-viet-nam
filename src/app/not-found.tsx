import type { Metadata } from "next";
import { Button, DongSonDrum, Kicker } from "@/core/ui";
import TopBar from "@/core/ui/TopBar";
import css from "./not-found.module.scss";

export const metadata: Metadata = { title: "Không tìm thấy trang" };

export default function NotFound() {
  return (
    <div className={css.page}>
      <TopBar scrolls />
      <DongSonDrum className={css.drum} />
      <main className={css.body}>
        <Kicker>Lạc lối · 404</Kicker>
        <h1 className={css.title}>Trang này chưa có trong sử sách</h1>
        <p className={css.lead}>Đường dẫn có thể đã đổi, hoặc chương này đang chờ người viết. Hãy chọn một lối khác để đi tiếp.</p>
        <div className={css.cta}>
          <Button variant="primary" href="/#cac-chuong">
            Xem các chương
          </Button>
          <Button href="/lo-trinh">
            Bản đồ & lộ trình lịch sử
          </Button>
        </div>
      </main>
    </div>
  );
}
