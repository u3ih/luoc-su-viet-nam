import { Icon } from "@/core/ui";
import css from "./Timeline.module.scss";

const pad = (n: number) => String(n).padStart(2, "0");

/** Màn rộng: dòng thời gian bên phải. Điện thoại: thanh lùi/tới dưới đáy. */
export default function Timeline({ items, active, onGo }: { items: string[]; active: number; onGo: (i: number) => void }) {
  const last = items.length - 1;
  return (
    <>
      <nav className="timeline" aria-label="Các phân cảnh">
        <button className={css.step} onClick={() => onGo(active - 1)} disabled={active <= 0} aria-label="Phân cảnh trước">
          <Icon name="up" size={16} />
        </button>
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
        <button className={css.step} onClick={() => onGo(active + 1)} disabled={active >= last} aria-label="Phân cảnh sau">
          <Icon name="down" size={16} />
        </button>
        <p className={css.count} aria-hidden="true">
          {pad(active + 1)}
          <span>/{pad(items.length)}</span>
        </p>
      </nav>

      <nav className={`${css.bar} ${active > 0 ? css.shown : ""}`} aria-label="Chuyển phân cảnh">
        <ol className={css.segments} aria-hidden="true">
          {items.map((_, i) => (
            <li key={i} className={i <= active ? css.lit : ""} />
          ))}
        </ol>
        <button className={css.barBtn} onClick={() => onGo(active - 1)} disabled={active <= 0} aria-label="Phân cảnh trước">
          <Icon name="left" size={16} />
        </button>
        <p className={css.now}>
          <span className={css.nowCount}>
            {active + 1}/{items.length}
          </span>
          <span className={css.nowLabel}>{items[active]}</span>
        </p>
        <button className={css.barBtn} onClick={() => onGo(active + 1)} disabled={active >= last} aria-label="Phân cảnh sau">
          <Icon name="right" size={16} />
        </button>
      </nav>
    </>
  );
}
