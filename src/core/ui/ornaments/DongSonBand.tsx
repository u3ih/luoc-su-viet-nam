// Dải hoa văn ngang "vòng tròn chấm giữa có tiếp tuyến" — đúng motif các vành 2, 4, 7, 9, 13, 14
// trên mặt trống Ngọc Lũ: hai vòng kề nhau nối bằng một tiếp tuyến chéo. Dùng dưới tiêu đề, làm vạch chia.
import { useId } from "react";

// Ô lặp rộng 12: vòng tâm (6, 7) bán kính 3,6. Tiếp tuyến trong của hai vòng kề nhau đi qua trung điểm
// (12, 7) và chạm vòng tại (6 ± 2,16, 7 ∓ 2,88) — cos α = 2r / khoảng cách tâm = 0,6.
export default function DongSonBand({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} height="14" width="100%" aria-hidden="true">
      <defs>
        <pattern id={`ds-${id}`} width="12" height="14" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="7" r="3.6" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="6" cy="7" r="1.2" fill="currentColor" />
          <path d="M8.16 4.12 L12 7 M0 7 L3.84 9.88" stroke="currentColor" strokeWidth="0.9" />
        </pattern>
      </defs>
      <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="currentColor" strokeWidth="0.8" />
      <rect y="0" width="100%" height="14" fill={`url(#ds-${id})`} />
      <line x1="0" y1="13.5" x2="100%" y2="13.5" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}
