// Dải hoa văn ngang (vòng tròn tiếp tuyến + vạch chéo) — dùng dưới tiêu đề, làm vạch chia.
import { useId } from "react";

export default function DongSonBand({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} height="14" width="100%" aria-hidden="true">
      <defs>
        <pattern id={`ds-${id}`} width="28" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="7" cy="7" r="1.4" fill="currentColor" />
          <path d="M11.6 9.5 L16.4 4.5 M14 11.5 L20 3 M18 11 L21 7" stroke="currentColor" strokeWidth="0.9" />
        </pattern>
      </defs>
      <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="currentColor" strokeWidth="0.8" />
      <rect y="0" width="100%" height="14" fill={`url(#ds-${id})`} />
      <line x1="0" y1="13.5" x2="100%" y2="13.5" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}
