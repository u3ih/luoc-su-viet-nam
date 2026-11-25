// Kiểm tra mọi link nguồn còn mở được: `nguon:` trong content/lo-trinh.md và link trong mục nguồn của story.md.
//
//   pnpm check-links            # in link hỏng; lỗi (exit 1) nếu có link chết hẳn (404/410/không phân giải được tên miền)
//
// Trang chặn máy (403/429) hoặc chậm chỉ cảnh báo — nhiều trang chính thống không trả lời bot nhưng người đọc vẫn mở được.
// Chạy hàng tuần trên GitHub Actions (.github/workflows/links.yml); bảng kết quả ghi vào $GITHUB_STEP_SUMMARY.

import { appendFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CONTENT = join(ROOT, "content");
const UA = "luocsu-linkcheck/1.0 (+https://github.com/u3ih/luoc-su-viet-nam)";
/** Số tên miền kiểm song song; trong một tên miền kiểm lần lượt, giãn cách GAP ms (Wikipedia trả 429 nếu dồn dập). */
const CONCURRENCY = 8;
const GAP = 400;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TIMEOUT = 20000;

/** url → nơi dùng */
const urls = new Map();
const add = (url, where) => {
  let u = url.replace(/[.,;]+$/, "");
  // ")" cuối là của câu chữ bao quanh chứ không phải của URL (Wikipedia hay có "(938)") khi ngoặc bị lệch
  while (u.endsWith(")") && (u.match(/\(/g) ?? []).length < (u.match(/\)/g) ?? []).length) u = u.slice(0, -1);
  if (!urls.has(u)) urls.set(u, []);
  urls.get(u).push(where);
};

readFileSync(join(CONTENT, "lo-trinh.md"), "utf8")
  .split("\n")
  .forEach((line, i) => {
    const nguon = line.match(/nguon:\s*([^|>]*)/)?.[1];
    for (const u of nguon?.trim().split(/\s+/) ?? []) if (/^https?:\/\//.test(u)) add(u, `lo-trinh.md:${i + 1}`);
  });
for (const d of readdirSync(CONTENT, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name.startsWith("_")) continue;
  for (const f of ["story.md", "story.en.md"]) {
    const p = join(CONTENT, d.name, f);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, "utf8");
    const sources = text.split(/^## (Nguồn tham khảo|Sources)\s*$/m)[2] ?? "";
    for (const m of sources.matchAll(/https?:\/\/[^\s>\]]+/g)) add(m[0], `${d.name}/${f}`);
  }
}

async function check(url, tries = 3) {
  for (const method of ["HEAD", "GET"]) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      const res = await fetch(url, { method, redirect: "follow", signal: ctl.signal, headers: { "user-agent": UA, accept: "text/html,*/*" } });
      res.body?.cancel().catch(() => {});
      if (res.ok) return { ok: true };
      if (res.status === 429 && tries > 0) {
        await sleep(Math.min(60, Number(res.headers.get("retry-after")) || 8) * 1000);
        return check(url, tries - 1);
      }
      // nhiều máy chủ không hỗ trợ HEAD: thử lại bằng GET
      if (method === "HEAD" && res.status !== 404 && res.status !== 410) continue;
      return { ok: false, status: res.status, dead: res.status === 404 || res.status === 410 };
    } catch (e) {
      if (method === "HEAD") continue;
      const code = e?.cause?.code ?? e?.name ?? "lỗi";
      return { ok: false, status: code, dead: code === "ENOTFOUND" };
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, status: "?", dead: false };
}

const list = [...urls.keys()];
const byHost = new Map();
for (const u of list) {
  const host = new URL(u).hostname;
  if (!byHost.has(host)) byHost.set(host, []);
  byHost.get(host).push(u);
}
const hosts = [...byHost.values()].sort((a, b) => b.length - a.length);
const bad = [];
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < hosts.length) {
      for (const url of hosts[next++]) {
        const r = await check(url);
        if (!r.ok) bad.push({ url, ...r, where: urls.get(url) });
        await sleep(GAP);
      }
    }
  }),
);

const dead = bad.filter((b) => b.dead);
const warn = bad.filter((b) => !b.dead);
const line = (b) => `- ${b.status} ${b.url} (${b.where.slice(0, 3).join(", ")}${b.where.length > 3 ? "…" : ""})`;
const report = [
  `## Kiểm tra link nguồn`,
  ``,
  `${list.length} link · ${dead.length} chết · ${warn.length} cần xem lại (chặn máy, chậm, lỗi máy chủ)`,
  ...(dead.length ? ["", "### Link chết", ...dead.map(line)] : []),
  ...(warn.length ? ["", "### Cần xem lại", ...warn.map(line)] : []),
].join("\n");

console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n");
process.exit(dead.length ? 1 : 0);
