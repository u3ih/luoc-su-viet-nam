/** Link nguồn đọc đầy đủ của một sự kiện; hiện tên miền cho người xem biết sẽ sang trang nào. */
export default function SourceLinks({ urls, className }: { urls: string[]; className?: string }) {
  if (!urls.length) return null;
  return (
    <p className={className}>
      <span>Nguồn đọc đầy đủ: </span>
      {urls.map((u, i) => (
        <span key={u}>
          {i > 0 && " · "}
          <a href={u} target="_blank" rel="noopener noreferrer">
            {new URL(u).hostname.replace(/^www\./, "")}
          </a>
        </span>
      ))}
    </p>
  );
}
