import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getText, listChapters } from "@/core/content/load";
import { site } from "@/site.config";

// /anh/<slug> — ảnh chia sẻ (Open Graph) của chương chưa có ảnh chụp cảnh 3D trong public/og/. Dựng sẵn lúc build.
// Satori không đọc biến CSS nên màu chép từ token trong globals.css: then, canh-gian, vang, vang-nhat, giay, giay-mo, son.
const C = { then: "#120b08", canhGian: "#4a2414", vang: "#d4a24c", vangNhat: "#e8c47e", giay: "#f1e6d2", giayMo: "#c9b9a0", son: "#b8322a" };

const font = (f: string) => readFileSync(join(process.cwd(), "src/app/fonts/og", f));

export function generateStaticParams() {
  return listChapters().map((c) => ({ slug: c.slug }));
}

export async function GET(_req: Request, { params }: RouteContext<"/anh/[slug]">) {
  const c = getText((await params).slug);
  if (!c) return new Response("Không có chương này", { status: 404 });
  const seal = c.seal ?? [c.title.split(" ")[0], c.year];
  const long = c.title.length > 22;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: `radial-gradient(circle at 78% 30%, ${C.canhGian}, ${C.then} 62%)`, color: C.giay, padding: "64px 72px", fontFamily: "Be Vietnam Pro" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: C.vang }}>{`${c.era} · ${c.year}`}</div>
            <div style={{ display: "flex", marginTop: 22, fontFamily: "LSVN Display", fontSize: long ? 76 : 104, lineHeight: 1.02, color: C.vangNhat, maxWidth: 880 }}>{c.title}</div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 30, lineHeight: 1.4, color: C.giayMo, maxWidth: 860 }}>{c.teaser}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", width: 56, height: 2, background: C.vang }} />
            <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: 2 }}>{site.name}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", alignSelf: "flex-start", marginTop: 8, padding: "14px 16px", border: `4px solid ${C.son}`, color: C.son, fontFamily: "LSVN Display", fontSize: 34, lineHeight: 1.1 }}>
          {seal.map((s) => (
            <div key={s} style={{ display: "flex" }}>
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Be Vietnam Pro", data: font("BeVietnamPro-Regular.ttf"), weight: 400, style: "normal" },
        { name: "Be Vietnam Pro", data: font("BeVietnamPro-SemiBold.ttf"), weight: 600, style: "normal" },
        { name: "LSVN Display", data: font("lsvn-display-800.ttf"), weight: 800, style: "normal" },
      ],
    },
  );
}
