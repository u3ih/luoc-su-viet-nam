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
  title: { default: `${site.name} — học lịch sử qua câu chuyện 3D tương tác`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords: ["lịch sử Việt Nam", "lược sử Việt Nam", "học lịch sử", "lịch sử tương tác", "Văn Lang", "Âu Lạc", "Bắc thuộc", "Bạch Đằng", "Hai Bà Trưng", "Cổ Loa"],
  authors: [{ name: `Cộng đồng ${site.name}`, url: site.repo }],
  creator: site.name,
  publisher: site.name,
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: site.name,
    url: "/",
    title: site.name,
    description: site.description,
    images: [{ url: "/og/lsvn.jpg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.description, images: ["/og/lsvn.jpg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  // Mã xác minh Google Search Console (đặt NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION trên Vercel nếu xác minh bằng thẻ meta)
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  formatDetection: { telephone: false, address: false, email: false },
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
