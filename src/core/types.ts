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
  numeral: string;
  title: string;
  year: string;
  era: string;
  teaser: string;
  status: "ready" | "draft";
};

export type ChapterText = ChapterMeta & {
  lead: string;
  beats: Beat[];
  sources: string[];
  disclaimer?: string;
  next?: { slug?: string; numeral: string; title: string; year: string };
};

export type Chapter = ChapterText & {
  /** Thư mục trong content/ (vd. "01-bach-dang-938"). */
  dir: string;
  scene: SceneConfig;
};

// ---------- phần cảnh (scene.config.ts) ----------

/** Trạng thái cảnh khi phân cảnh nằm giữa màn hình. */
export type Keyframe = {
  cam: Vec3;
  look: Vec3;
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
