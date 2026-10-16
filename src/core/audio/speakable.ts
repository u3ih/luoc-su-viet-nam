// Chuẩn hoá chữ trước khi đưa cho giọng đọc máy. Giọng tiếng Việt của trình duyệt đọc sai khá nhiều thứ
// người đọc thấy là hiển nhiên: số La Mã ("thế kỷ X" thành "thế kỷ ích"), "TCN", dấu gạch nối khoảng năm,
// số có dấu chấm ngăn nghìn ("10.000" thành "mười chấm không"). Ở đây đổi hết sang chữ để giọng nào cũng đọc đúng.

const DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

/** 0..999, `full` = có hàng trăm đứng trước (đọc "không trăm", "lẻ"). */
function below1000(n: number, full: boolean): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  const out: string[] = [];
  if (h || full) out.push(DIGITS[h], "trăm");
  if (t === 0) {
    if (u && (h || full)) out.push("lẻ");
    if (u || !(h || full)) out.push(DIGITS[u]);
  } else if (t === 1) {
    out.push("mười");
    if (u) out.push(u === 5 ? "lăm" : DIGITS[u]);
  } else {
    out.push(DIGITS[t], "mươi");
    if (u === 1) out.push("mốt");
    else if (u === 5) out.push("lăm");
    else if (u) out.push(DIGITS[u]);
  }
  return out.join(" ");
}

/** Số nguyên không âm → chữ ("1288" → "một nghìn hai trăm tám mươi tám"). */
export function numberToWords(n: number): string {
  if (!Number.isFinite(n) || n < 0) return String(n);
  if (n === 0) return DIGITS[0];
  const units = ["", "nghìn", "triệu", "tỷ"];
  const groups: number[] = [];
  for (let x = Math.floor(n); x > 0; x = Math.floor(x / 1000)) groups.push(x % 1000);
  const out: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    out.push(below1000(g, i < groups.length - 1), units[i]);
  }
  return out.filter(Boolean).join(" ");
}

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
function romanToNumber(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]];
    n += v < (ROMAN[s[i + 1]] ?? 0) ? -v : v;
  }
  return n;
}

const read = (s: string) => numberToWords(Number(s.replace(/\./g, "")));

/** Chữ hiển thị → chữ để đọc. */
export function speakable(text: string): string {
  return (
    text
      // số La Mã sau "thế kỷ", "chương", "phần" (chỉ khi viết hoa; "\b" của JS không hiểu chữ có dấu nên dùng lookaround)
      .replace(/(thế kỷ|Thế kỷ|chương|Chương|phần|Phần)\s+([IVXLCDM]+)(?![\p{L}\d])/gu, (_, w, r) => `${w} ${numberToWords(romanToNumber(r))}`)
      .replace(/(?<![\p{L}\d])TK\s+([IVXLCDM]+)(?![\p{L}\d])/gu, (_, r) => `thế kỷ ${numberToWords(romanToNumber(r))}`)
      // khoảng năm "40–43", "179 – 111 TCN"
      .replace(/(\d[\d.]*)\s*[–—-]\s*(\d[\d.]*)/g, (_, a, b) => `${a} đến ${b}`)
      .replace(/(?<![\p{L}\d])TCN(?![\p{L}\d])/gu, "trước Công nguyên")
      .replace(/(?<![\p{L}\d])SCN(?![\p{L}\d])/gu, "sau Công nguyên")
      .replace(/(\d)\s*km(?![\p{L}\d])/gu, "$1 ki-lô-mét")
      .replace(/(\d)\s*m(?![\p{L}\d])/gu, "$1 mét")
      .replace(/~\s*/g, "khoảng ")
      .replace(/%/g, " phần trăm")
      // số thập phân kiểu Việt "4,5" → "bốn phẩy năm"
      .replace(/(?<![\d.,])(\d+),(\d+)(?![\d.,]*\d)/g, (_, a, b) => `${read(a)} phẩy ${b.split("").map((d: string) => DIGITS[+d]).join(" ")}`)
      // số nguyên, kể cả có dấu chấm ngăn nghìn "10.000"
      .replace(/\d{1,3}(?:\.\d{3})+(?!\d)|\d+/g, read)
      .replace(/[·•]/g, ",")
      .replace(/[“”"«»]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}
