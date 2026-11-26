import { Link } from "@/core/ui";

/** Link nguồn đọc đầy đủ của một sự kiện; hiện tên miền cho người xem biết sẽ sang trang nào. */
export default function SourceLinks({ urls, className }: { urls: string[]; className?: string }) {
  if (!urls.length) return null;
  return (
    <p className={className}>
      <span>Nguồn: </span>
      {urls.map((u, i) => (
        <span key={u}>
          {i > 0 && " · "}
          <Link href={u}>
            {new URL(u).hostname.replace(/^www\./, "")}
          </Link>
        </span>
      ))}
    </p>
  );
}
