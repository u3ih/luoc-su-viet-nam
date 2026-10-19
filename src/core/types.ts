// Kiểu dữ liệu chung cho mọi chương.
//
// Một chương = một thư mục trong content/:
//   story.md          → ChapterText   (lời kể — ai cũng sửa được, đọc thẳng trên GitHub)
//   scene.config.ts   → SceneConfig   (camera + tham số từng phân cảnh, khớp theo id)
//   scene.ts          → SceneSetup    (dựng cảnh 3D, chỉ chạy trên trình duyệt)

export type Vec3 = [number, number, number];

/** Bầu trời & ánh sáng dựng sẵn — xem core/world/sky.ts. Số lẻ = pha trộn hai mood kề nhau. */
export const MOOD = { dawn: 0, overcast: 1, sunset: 2, night: 3, day: 4 } as const;

// ---------- phần chữ (story.md) ----------

export type SliderInteraction = {
  kind: "slider";
  /** Khoá ghi vào story.inputs — cảnh đọc để phản ứng. */
  key: string;
  /** Ngưỡng 0..1 coi như hoàn thành. */
  completeAt: number;
  labels: [string, string];
  hint: string;
  completeText: string;
  /** Giọng kể thu sẵn cho lời sau khi hoàn thành (tự gắn nếu có public/audio/<slug>/<id>.xong.mp3). */
  completeAudio?: string;
};

export type Interaction = SliderInteraction;

export type Beat = {
  id: string;
  kicker: string;
  title: string;
  body: string[];
  layout?: "hero" | "left" | "right" | "center";
  narration?: string;
  audio?: string;
  quote?: { text: string; cite: string; paraphrase?: boolean };
  note?: { title: string; text: string };
  interaction?: Interaction;
};

export type ChapterMeta = {
  slug: string;
  title: string;
  /** Năm hiển thị ("938", "Thế kỷ III TCN", "Truyền thuyết"…). */
  year: string;
  /** Năm dùng để xếp các chương theo thời gian (số âm = trước Công nguyên). */
  sortYear: number;
  era: string;
  teaser: string;
  status: "ready" | "draft";
};

export type ChapterText = ChapterMeta & {
  lead: string;
  beats: Beat[];
  sources: string[];
  disclaimer?: string;
  /** Chữ trên con dấu son ở phần mở đầu (mặc định: chữ đầu của tiêu đề + năm). */
  seal?: string[];
  /** false = bỏ mặt trống đồng ở phần mở đầu (chương trước thời Đông Sơn). Mặc định: có. */
  heroDrum?: boolean;
};

/** Chương / sự kiện kế tiếp theo thời gian (tự tính, xem core/content/load.ts). */
export type NextUp = { slug?: string; title: string; year: string };

export type Chapter = ChapterText & {
  /** Thư mục trong content/ (trùng slug, vd. "bach-dang-938"). */
  dir: string;
  scene: SceneConfig;
  /** Chương tiếp theo đã có (theo thời gian), hoặc sự kiện kế tiếp trong lộ trình đang chờ người viết. */
  next?: NextUp;
};

// ---------- phần cảnh (scene.config.ts) ----------

/** Trạng thái cảnh khi phân cảnh nằm giữa màn hình. */
export type Keyframe = {
  cam: Vec3;
  look: Vec3;
  /**
   * Chủ thể chính của hoạt cảnh. Trên màn dọc (điện thoại) máy quay nhìn vào đây thay cho `look` — `look` thường
   * được đẩy lệch để chủ thể nằm ở nửa màn hình không có chữ, mà màn dọc thì hẹp, lệch là rơi ra ngoài khung.
   * Không ghi thì dùng `look`.
   */
  focus?: Vec3;
  mood: number;
  /** Góc nhìn (mặc định 50). */
  fov?: number;
  /** Tham số riêng của chương. Không ghi thì giữ giá trị của phân cảnh trước. */
  params?: Record<string, number>;
};

export type SceneConfig = {
  /** Giá trị khởi đầu của mọi tham số chương. */
  params: Record<string, number>;
  /** Keyframe theo id phân cảnh trong story.md. */
  keyframes: Record<string, Keyframe>;
};

export function narrationOf(b: Beat): string {
  return b.narration ?? [b.title, ...b.body].join(". ").replace(/\.\./g, ".");
}
