const PATHS = {
  mic: "M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
  "sound-on": "M4 9v6h4l5 4V5L8 9H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11",
  "sound-off": "M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  doc: "M4 4h10l6 6v10H4z M14 4v6h6 M8 14h8 M8 17h5",
  grid: "M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z",
  up: "M6 15l6-6 6 6",
  down: "M6 9l6 6 6-6",
  left: "M15 6l-6 6 6 6",
  right: "M9 6l6 6-6 6",
  screen: "M3 5h18v11H3zM8 20h8M12 16v4",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  arrow: "M5 12h14M13 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
  pen: "M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4",
  check: "M5 12l5 5 9-10",
  cube: "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13",
  play: "M8 5l11 7-11 7V5z",
  restart: "M4 12a8 8 0 1 0 3-6.2M4 4v4h4",
  filter: "M4 6h16M7 12h10M10 18h4",
} as const;

export type IconName = keyof typeof PATHS;

/** Mọi biểu tượng đang có (trang /thiet-ke liệt kê). */
export const iconNames = Object.keys(PATHS) as IconName[];

export default function Icon({ name, size = 14, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
