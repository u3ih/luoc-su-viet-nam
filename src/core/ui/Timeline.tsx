/** Dòng thời gian bên phải: mỗi phân cảnh một nút hình vành trống. */
export default function Timeline({ items, active, onGo }: { items: string[]; active: number; onGo: (i: number) => void }) {
  return (
    <nav className="timeline" aria-label="Các phân cảnh">
      <ol>
        {items.map((label, i) => (
          <li key={i}>
            <button className={i === active ? "is-active" : i < active ? "is-past" : ""} onClick={() => onGo(i)} aria-current={i === active ? "step" : undefined}>
              <span className="timeline__dot" />
              <span className="timeline__label">{label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
