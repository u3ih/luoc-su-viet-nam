// Mặt trống đồng Đông Sơn cách điệu: ngôi sao 14 cánh ở tâm, các vành hoa văn
// (vòng tròn tiếp tuyến, răng cưa, chấm), vành chim Lạc bay ngược chiều kim đồng hồ.
// Thuần SVG, không JS — dùng làm nền, loader, điểm nhấn.

const TAU = Math.PI * 2;
const f = (n: number) => n.toFixed(2);

function star(rays: number, r0: number, r1: number) {
  const pts: string[] = [];
  for (let i = 0; i < rays * 2; i++) {
    const r = i % 2 === 0 ? r1 : r0;
    const a = (i / (rays * 2)) * TAU - Math.PI / 2;
    pts.push(`${f(Math.cos(a) * r)},${f(Math.sin(a) * r)}`);
  }
  return pts.join(" ");
}

function ringOf(n: number, r: number, render: (x: number, y: number, deg: number, i: number) => React.ReactNode) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    return render(Math.cos(a) * r, Math.sin(a) * r, (a * 180) / Math.PI, i);
  });
}

/** Chim Lạc: mỏ dài, mào, cánh xoè, đuôi dài — hướng bay theo trục +x. */
const BIRD =
  "M 9 0 L 3 -1 L 0 -2.5 L -2 -6 L -3 -2 L -6 -1.5 L -9 -3 L -7 0 L -9 3 L -6 1.5 L -3 2 L -2 6 L 0 2.5 L 3 1 Z M 3 -1 L 2 -3 L 4 -2 Z";

export default function DongSonDrum({ className, birds = 10 }: { className?: string; birds?: number }) {
  return (
    <svg className={className} viewBox="-100 -100 200 200" fill="none" stroke="currentColor" aria-hidden="true">
      <polygon points={star(14, 5, 17)} fill="currentColor" stroke="none" />
      <circle r="20" strokeWidth="0.6" />
      <circle r="23" strokeWidth="0.6" />
      {/* vành chấm */}
      {ringOf(36, 26, (x, y, _d, i) => (
        <circle key={i} cx={f(x)} cy={f(y)} r="0.9" fill="currentColor" stroke="none" />
      ))}
      <circle r="29" strokeWidth="0.6" />
      {/* vành vòng tròn tiếp tuyến */}
      {ringOf(22, 34, (x, y, _d, i) => (
        <g key={i}>
          <circle cx={f(x)} cy={f(y)} r="3.4" strokeWidth="0.55" />
          <circle cx={f(x)} cy={f(y)} r="1" fill="currentColor" stroke="none" />
        </g>
      ))}
      <circle r="39" strokeWidth="0.6" />
      {/* vành răng cưa */}
      <polygon points={star(60, 40, 44)} strokeWidth="0.5" />
      <circle r="45" strokeWidth="0.6" />
      {/* vành chim Lạc */}
      {ringOf(birds, 56, (x, y, deg, i) => (
        <path key={i} d={BIRD} transform={`translate(${f(x)} ${f(y)}) rotate(${f(deg - 90)}) scale(1.15)`} fill="currentColor" stroke="none" />
      ))}
      <circle r="66" strokeWidth="0.6" />
      {ringOf(48, 69, (x, y, _d, i) => (
        <circle key={i} cx={f(x)} cy={f(y)} r="1.6" strokeWidth="0.45" />
      ))}
      <circle r="72" strokeWidth="0.6" />
      <polygon points={star(80, 73, 77)} strokeWidth="0.45" />
      <circle r="78" strokeWidth="0.8" />
      {ringOf(28, 84, (x, y, _d, i) => (
        <g key={i}>
          <circle cx={f(x)} cy={f(y)} r="4" strokeWidth="0.55" />
          <circle cx={f(x)} cy={f(y)} r="1.4" fill="currentColor" stroke="none" />
        </g>
      ))}
      <circle r="90" strokeWidth="0.8" />
      <circle r="96" strokeWidth="1.2" />
    </svg>
  );
}
