import type { Journey } from "@/core/content/journeys";
import { Button, Card, Disclosure, Icon, Link } from "@/core/ui";
import { href } from "@/core/ui/i18n";
import css from "./Journeys.module.scss";

/** Hành trình chọn sẵn ở trang chủ (content/hanh-trinh.md): bắt đầu từ chương đầu, cuối mỗi chương dẫn sang chương kế. */
export default function Journeys({ journeys }: { journeys: Journey[] }) {
  return (
    <ol className={css.grid}>
      {journeys.map((j) => {
        const start = `${href.chapter(j.steps[0].slug)}?hanh-trinh=${j.id}`;
        return (
          <Card as="li" tone="lacquer" key={j.id} className={css.card}>
            <p className={css.meta}>
              <Icon name="route" size={14} />
              {j.steps.length} chương · {j.steps[0].year} – {j.steps.at(-1)!.year}
            </p>
            <h3 className={css.title}>{j.title}</h3>
            <p className={css.intro}>{j.intro}</p>
            <Disclosure summary="Các chương trong hành trình" className={css.steps}>
              <ol>
                {j.steps.map((s) => (
                  <li key={s.slug}>
                    <Link href={`${href.chapter(s.slug)}?hanh-trinh=${j.id}`}>{s.title}</Link> <span>{s.year}</span>
                  </li>
                ))}
              </ol>
            </Disclosure>
            <Button variant="primary" href={start} className={css.start}>
              <Icon name="play" size={12} /> Bắt đầu hành trình
            </Button>
          </Card>
        );
      })}
    </ol>
  );
}
