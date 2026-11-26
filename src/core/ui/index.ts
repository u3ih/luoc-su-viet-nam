// Design system "sơn mài hiện đại" — đặc tả: src/core/ui/DESIGN.md, xem trực tiếp: /thiet-ke.
// Mọi nơi import component nền từ đây (pnpm check-ui chặn import thẳng next/link, next/image, next/navigation…).
// Chỉ export component nhẹ; component tính năng (StoryShell, HistoryMap…) import theo đường dẫn file.
export { default as Button } from "./base/Button";
export { default as Card } from "./base/Card";
export { default as Chip } from "./base/Chip";
export { default as ChipRow } from "./base/ChipRow";
export { default as Disclosure } from "./base/Disclosure";
export { default as Field, Input, Select } from "./base/Field";
export { default as Icon, iconNames, type IconName } from "./base/Icon";
export { default as Image } from "./base/Image";
export { default as Kicker } from "./base/Kicker";
export { default as Link } from "./base/Link";
export { useNavigate } from "./base/navigation";
export { default as SearchField } from "./base/SearchField";
export { default as SectionHead } from "./base/SectionHead";
export { default as Segmented } from "./base/Segmented";
export { default as Tag } from "./base/Tag";
export { default as DongSonBand } from "./ornaments/DongSonBand";
export { default as DongSonDrum } from "./ornaments/DongSonDrum";
export { default as Seal } from "./ornaments/Seal";
export { default as Star } from "./ornaments/Star";
