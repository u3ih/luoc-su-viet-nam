import type { Journey } from "@/core/content/journeys";
import { Button, Icon, Link } from "@/core/ui";
import { href } from "@/core/ui/i18n";
import css from "./Journeys.module.scss";

/** Hành trình chọn sẵn ở trang chủ (content/hanh-trinh.md): bắt đầu từ chương đầu, cuối mỗi chương dẫn sang chương kế. */
export default function Journeys({ journeys }: { journeys: Journey[] }) {
  return (
    <ol className={css.grid}>
      {journeys.map((j) => {
        const start = `${href.chapter(j.steps[0].slug)}?hanh-trinh=${j.id}`;
        return (
          <li key={j.id} className={css.card}>
            <p className={css.meta}>
              <Icon name="route" /> {j.steps.length} chương · {j.steps[0].year} – {j.steps.at(-1)!.year}
            </p>
            <h3 className={css.title}>{j.title}</h3>
            <p className={css.intro}>{j.intro}</p>
            <details className={css.steps}>
              <summary>Các chương</summary>
              <ol>
                {j.steps.map((s) => (
                  <li key={s.slug}>
                    <Link href={`${href.chapter(s.slug)}?hanh-trinh=${j.id}`}>
                      {s.title} <span>{s.year}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </details>
            <Button variant="primary" href={start}>
              Bắt đầu hành trình
            </Button>
          </li>
        );
      })}
    </ol>
  );
}
