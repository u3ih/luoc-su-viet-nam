// bán kính trong / ngoài = 0,382 như sao trên quốc kỳ
const POINTS = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  const r = i % 2 ? 46 * 0.382 : 46;
  return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
}).join(" ");

export default function Star({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} viewBox="-50 -50 100 100" width={size} height={size} aria-hidden="true">
      <polygon points={POINTS} />
    </svg>
  );
}
