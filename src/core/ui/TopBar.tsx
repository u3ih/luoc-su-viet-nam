import { Chip, Link } from "@/core/ui";

type Toggle = { on: boolean; toggle: () => void };

/**
 * Thanh trên: về trang chủ, bật giọng kể (kèm tự cuộn) / âm thanh, mở bản chữ trên GitHub.
 * `scrolls`: trang thường (không có cảnh 3D phía sau) — thanh cuộn đi cùng trang thay vì dính trên nội dung.
 */
export default function TopBar({
  narration,
  ambient,
  textUrl,
  scrolls,
  title,
  onRoadmap,
}: {
  narration?: Toggle & { supported: boolean };
  ambient?: Toggle;
  textUrl?: string;
  scrolls?: boolean;
  title?: string;
  onRoadmap?: boolean;
}) {
  return (
    <header className={`topbar ${scrolls ? "topbar--scrolls" : ""}`}>
      <div className="topbar__where">
        <Link href="/" className="brand">
          <span className="brand__mark" aria-hidden="true" />
          Lược sử Việt Nam
        </Link>
        <span className={`topbar__title ${title ? "is-shown" : ""}`} aria-hidden={!title}>
          {title}
        </span>
      </div>
      <div className="controls">
        {narration?.supported && (
          <Chip icon="mic" on={narration.on} onClick={narration.toggle} aria-label="Nghe kể" title="Nghe kể — trang tự cuộn theo nhịp đọc">
            {narration.on ? "Đang kể · tự cuộn" : "Nghe kể"}
          </Chip>
        )}
        {ambient && (
          <Chip icon={ambient.on ? "sound-on" : "sound-off"} on={ambient.on} onClick={ambient.toggle}>
            Âm thanh
          </Chip>
        )}
        {onRoadmap ? (
          <Chip icon="grid" ghost href="/#cac-chuong">
            Các chương
          </Chip>
        ) : (
          <Chip icon="map" ghost href="/lo-trinh" aria-label="Lộ trình lịch sử">
            Lộ trình
          </Chip>
        )}
        {textUrl && (
          <Chip icon="doc" ghost href={textUrl}>
            Bản chữ
          </Chip>
        )}
      </div>
    </header>
  );
}
