import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import "@/core/ui/ui.css";
import { site } from "@/site.config";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["vietnamese", "latin"],
  weight: ["600", "800"],
  display: "swap",
});

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
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
