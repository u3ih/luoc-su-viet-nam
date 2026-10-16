import Link from "next/link";

type Toggle = { on: boolean; toggle: () => void };

/** Thanh trên: về trang chủ, bật giọng kể (kèm tự cuộn) / âm thanh, mở bản chữ trên GitHub. */
export default function TopBar({ narration, ambient, textUrl }: { narration?: Toggle & { supported: boolean }; ambient?: Toggle; textUrl?: string }) {
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <span className="brand__mark" aria-hidden="true" />
        Lược sử Việt Nam
      </Link>
      <div className="controls">
        {narration?.supported && (
          <button className={`chip ${narration.on ? "chip--on" : ""}`} onClick={narration.toggle} aria-pressed={narration.on} title="Nghe kể — trang tự cuộn theo nhịp đọc">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
            <span>{narration.on ? "Đang kể · tự cuộn" : "Nghe kể"}</span>
          </button>
        )}
        {ambient && (
          <button className={`chip ${ambient.on ? "chip--on" : ""}`} onClick={ambient.toggle} aria-pressed={ambient.on}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" />
              {ambient.on ? <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /> : <path d="M17 9l5 6M22 9l-5 6" />}
            </svg>
            <span>Âm thanh</span>
          </button>
        )}
        <Link className="chip chip--ghost" href="/lo-trinh" aria-label="Lộ trình lịch sử">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />
          </svg>
          <span>Lộ trình</span>
        </Link>
        {textUrl && (
          <a className="chip chip--ghost" href={textUrl} target="_blank" rel="noreferrer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 4h10l6 6v10H4z M14 4v6h6 M8 14h8 M8 17h5" />
            </svg>
            <span>Bản chữ</span>
          </a>
        )}
      </div>
    </header>
  );
}
