// Con dấu son (triện) — chữ xếp dọc trong khung vuông đỏ.
export default function Seal({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <span className={`seal ${className ?? ""}`} aria-hidden="true">
      <span className="seal__inner">
        {lines.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </span>
    </span>
  );
}
