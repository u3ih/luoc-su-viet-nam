import { Chip, Link } from "@/core/ui";
import type { Lang } from "../types";
import { href, uiText } from "./i18n";

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
  lang = "vi",
  present,
}: {
  narration?: Toggle & { supported: boolean };
  ambient?: Toggle;
  textUrl?: string;
  scrolls?: boolean;
  title?: string;
  onRoadmap?: boolean;
  lang?: Lang;
  /** Nút trình chiếu (trang chương, màn rộng). */
  present?: Toggle & { chipClass: string; exitClass: string };
}) {
  const t = uiText(lang);
  return (
    <header className={`topbar ${scrolls ? "topbar--scrolls" : ""}`}>
      <div className="topbar__where">
        <Link href={href.home(lang)} className="brand">
          <span className="brand__mark" aria-hidden="true" />
          {t.brand}
        </Link>
        <span className={`topbar__title ${title ? "is-shown" : ""}`} aria-hidden={!title}>
          {title}
        </span>
      </div>
      <div className="controls">
        {narration?.supported && (
          <Chip icon="mic" on={narration.on} onClick={narration.toggle} aria-label={t.listen} title={t.listenTitle}>
            {narration.on ? t.listening : t.listen}
          </Chip>
        )}
        {ambient && (
          <Chip icon={ambient.on ? "sound-on" : "sound-off"} on={ambient.on} onClick={ambient.toggle}>
            {t.sound}
          </Chip>
        )}
        {present && (
          <Chip
            icon="screen"
            ghost={!present.on}
            on={present.on}
            onClick={present.toggle}
            title={present.on ? t.presentExit : t.presentTitle}
            className={present.on ? present.exitClass : present.chipClass}
          >
            {present.on ? t.presentExit : t.present}
          </Chip>
        )}
        {onRoadmap || lang === "en" ? (
          <Chip icon="grid" ghost href={lang === "en" ? "/en" : "/#cac-chuong"}>
            {t.chapters}
          </Chip>
        ) : (
          <Chip icon="map" ghost href="/lo-trinh" aria-label={t.roadmap}>
            {t.roadmapShort}
          </Chip>
        )}
        {textUrl && (
          <Chip icon="doc" ghost href={textUrl}>
            {t.textShort}
          </Chip>
        )}
      </div>
    </header>
  );
}
