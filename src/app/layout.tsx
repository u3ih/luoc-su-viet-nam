import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";
import "@/core/ui/ui.css";
import { site } from "@/site.config";

// Phông tự lưu trữ (SIL OFL 1.1) để build không phụ thuộc Google Fonts — nguồn và cách dựng: src/app/fonts/README.md
// Playfair Display, rút gọn latin + tiếng Việt; đổi tên thành "LSVN Display" theo Reserved Font Name của OFL.
const display = localFont({
  src: "./fonts/lsvn-display.woff2",
  weight: "600 800",
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

// Be Vietnam Pro, rút gọn latin + tiếng Việt.
const body = localFont({
  src: [
    { path: "./fonts/BeVietnamPro-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/BeVietnamPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/BeVietnamPro-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#120b08",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        {/* Đo lượt xem và Web Vitals của Vercel — không cookie, không định danh người xem. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
