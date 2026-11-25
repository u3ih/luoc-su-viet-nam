"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { setNarrationLang } from "../audio/narrator";
import { SLOW_EVENT } from "../engine/quality";
import { markSeen } from "../story/progress";
import { computeT, resetStory, story } from "../story/store";
import { narrationOf, type Chapter, type JourneyStep } from "../types";
import BeatSection from "./BeatSection";
import ChapterEnd, { AUTOPLAY_KEY } from "./ChapterEnd";
import { Link } from "@/core/ui";
import { ScrollTrigger } from "./gsap";
import Hero from "./Hero";
import { useAmbient } from "./hooks/useAmbient";
import { useNarration } from "./hooks/useNarration";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { href, uiText } from "./i18n";
import IntroOverlay from "./IntroOverlay";
import css from "./StoryShell.module.scss";
import Timeline from "./Timeline";
import TopBar from "./TopBar";

// Three.js + cảnh của chương chỉ tải sau khi chữ đã hiển thị.
const SceneStage = dynamic(() => import("./SceneStage"), { ssr: false });

type Status = "loading" | "ready" | "fallback";

/**
 * Khung trang kể chuyện dùng cho MỌI chương. Nhận dữ liệu chương (chữ + cấu hình cảnh)
 * và tự lo: cảnh 3D, cuộn mượt, dòng thời gian, giọng kể, âm thanh, tương tác.
 */
export default function StoryShell({ chapter, editUrl }: { chapter: Chapter; editUrl: string }) {
  const t = uiText(chapter.lang);
  const textUrl = href.text(chapter.slug, chapter.lang);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  /** Phân cảnh vừa được kể xong (chế độ tự cuộn); -1 = đang đọc dở. */
  const [spokenAt, setSpokenAt] = useState(-1);
  /** Phân cảnh tương tác mà máy đang tự kéo giúp người xem. */
  const [autoInteract, setAutoInteract] = useState<string | null>(null);
  /** Hành trình đang đi (?hanh-trinh=…) — đọc sau khi mount vì trang dựng tĩnh. */
  const [journey, setJourney] = useState<JourneyStep | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [notice, setNotice] = useState<"slow" | "fail" | null>(null);

  const scroll = useSmoothScroll();
  const ambient = useAmbient();
  const beat = chapter.beats[active];
  const done = !!(beat.interaction && completed[beat.interaction.key]);
  const narrationText = done ? beat.interaction!.completeText : narrationOf(beat);
  const narrationAudio = done ? beat.interaction!.completeAudio : beat.audio;
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
    // tiến độ xem chỉ ghi khi màn mở đầu đã mở (đang dựng cảnh thì active luôn là 0)
    if (opened) markSeen(chapter.slug, active, chapter.beats.length);
  }, [active, opened, chapter]);
  const narration = useNarration(narrationText, narrationAudio, () => setSpokenAt(activeRef.current));

  useEffect(() => {
    setNarrationLang(chapter.lang);
    const id = new URLSearchParams(window.location.search).get("hanh-trinh");
    setJourney(chapter.journeys.find((j) => j.id === id) ?? null);
  }, [chapter]);

  // Tới từ chương trước bằng chế độ nghe kể: mở màn xong thì tự kể tiếp.
  useEffect(() => {
    if (!opened) return;
    let auto = false;
    try {
      auto = sessionStorage.getItem(AUTOPLAY_KEY) === "1";
      sessionStorage.removeItem(AUTOPLAY_KEY);
    } catch {
      auto = false;
    }
    if (auto && !narration.on) void narration.toggle();
    // chỉ chạy một lần khi màn mở
  }, [opened]);

  // Máy yếu: gợi ý đọc bản chữ (một lần mỗi trang).
  useEffect(() => {
    const onSlow = () => setNotice((n) => n ?? "slow");
    window.addEventListener(SLOW_EVENT, onSlow);
    return () => window.removeEventListener(SLOW_EVENT, onSlow);
  }, []);
  useEffect(() => {
    if (status === "fallback") setNotice("fail");
  }, [status]);

  // Trình chiếu: chữ to, ← → / bấm vào cảnh để chuyển phân cảnh, Esc để thoát.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("is-presenting", presenting);
    // chữ đổi cỡ thì vị trí các phân cảnh đổi theo: giữ phân cảnh đang xem ở giữa màn
    const keep = activeRef.current;
    const recenter = setTimeout(() => goToRef.current(keep, 0.6), 400);
    if (!presenting) return () => clearTimeout(recenter);
    root.requestFullscreen?.().catch(() => {});
    const onFs = () => !document.fullscreenElement && setPresenting(false);
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest("button, a, input, label, select, header, nav")) return;
      stepRef.current(e.clientX < window.innerWidth / 4 ? -1 : 1);
    };
    document.addEventListener("fullscreenchange", onFs);
    window.addEventListener("click", onClick);
    return () => {
      clearTimeout(recenter);
      root.classList.remove("is-presenting");
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("click", onClick);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, [presenting]);

  useEffect(() => {
    resetStory();
    const measure = () => {
      story.centers = sections.current.map((el) => {
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2;
      });
      ScrollTrigger.refresh();
    };
    const onScroll = () => {
      const t = computeT(window.scrollY, window.innerHeight);
      setActive(Math.round(t));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current?.style.setProperty("--progress", String(max > 0 ? window.scrollY / max : 0));
      // cuộn qua phân cảnh tương tác mà chưa làm → coi như hoàn thành để câu chuyện tiếp diễn
      chapter.beats.forEach((b, i) => {
        if (b.interaction && t > i + 0.55 && !story.completedAt[b.interaction.key]) {
          story.completedAt[b.interaction.key] = performance.now();
          setCompleted((c) => ({ ...c, [b.interaction!.key]: true }));
        }
      });
    };
    const onPointer = (e: PointerEvent) => {
      story.pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      story.pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    measure();
    onScroll();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    void document.fonts?.ready.then(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [chapter]);

  const setRef = (i: number) => (el: HTMLElement | null) => {
    sections.current[i] = el;
  };
  const last = chapter.beats.length - 1;
  // bấm liền tay thì tính tiếp từ đích đang cuộn tới, không phải từ phân cảnh máy quay đang trôi qua
  const heading = useRef({ i: 0, at: 0 });
  const goTo = (i: number, duration?: number) => {
    const to = Math.max(0, Math.min(last, i));
    heading.current = { i: to, at: performance.now() };
    scroll.scrollTo(story.centers[to] - window.innerHeight / 2, duration);
  };
  const step = (d: number) => {
    const h = heading.current;
    const from = performance.now() - h.at < 1600 ? h.i : activeRef.current;
    goTo(from + d, 1.5);
  };
  const complete = (key: string) => setCompleted((c) => ({ ...c, [key]: true }));

  const stepRef = useRef(step);
  const goToRef = useRef(goTo);
  useEffect(() => {
    stepRef.current = step;
    goToRef.current = goTo;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable]")) return;
      const onControl = !!el?.closest("button, a");
      let d = 0;
      const presenting = document.documentElement.classList.contains("is-presenting");
      if (e.key === "Escape" && presenting) return setPresenting(false);
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "j" || (presenting && e.key === "ArrowRight") || (e.key === " " && !e.shiftKey && !onControl)) d = 1;
      else if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k" || (presenting && e.key === "ArrowLeft") || (e.key === " " && e.shiftKey && !onControl)) d = -1;
      else if (e.key === "Home") goToRef.current(0, 1.8);
      else if (e.key === "End") goToRef.current(Infinity, 1.8);
      else return;
      e.preventDefault();
      if (d) stepRef.current(d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Chế độ tự cuộn (bật cùng giọng kể): kể xong phân cảnh thì nghỉ một nhịp rồi cuộn sang phân cảnh sau.
  // Gặp phân cảnh tương tác: chờ người xem tự kéo; một lúc không ai kéo thì máy kéo giúp, kể lời kết rồi đi tiếp.
  // Người xem tự cuộn đi chỗ khác thì giọng kể đọc phân cảnh mới và nhịp tự cuộn tính lại từ đó.
  useEffect(() => setSpokenAt(-1), [narrationText]);
  useEffect(() => {
    if (!narration.on) setAutoInteract(null);
  }, [narration.on]);
  useEffect(() => {
    if (!narration.on || spokenAt !== active) return;
    const b = chapter.beats[active];
    if (b.interaction && !completed[b.interaction.key]) {
      const key = b.interaction.key;
      const timer = setTimeout(() => setAutoInteract(key), 6000);
      return () => clearTimeout(timer);
    }
    if (active >= last) return;
    const timer = setTimeout(() => goTo(active + 1), 1100);
    return () => clearTimeout(timer);
  }, [narration.on, spokenAt, active, completed]);

  return (
    <>
      <div className={`stage stage--${status}`} aria-hidden="true">
        {status !== "fallback" && (
          <SceneStage
            slug={chapter.slug}
            ids={chapter.beats.map((b) => b.id)}
            config={chapter.scene}
            onReady={() => setStatus("ready")}
            onFail={() => setStatus("fallback")}
          />
        )}
      </div>
      <div className={`scrim scrim--${chapter.beats[active]?.layout ?? (active % 2 === 0 ? "right" : "left")}`} aria-hidden="true" />
      <div className="progress" ref={progressRef} aria-hidden="true" />

      <IntroOverlay lang={chapter.lang} ready={status !== "loading"} label={`${chapter.era} · ${chapter.year}`} title={chapter.title} onDone={() => setOpened(true)} />

      <TopBar
        lang={chapter.lang}
        narration={narration}
        ambient={ambient}
        textUrl={textUrl}
        title={active > 0 ? `${chapter.title} · ${chapter.year}` : undefined}
        present={{ on: presenting, toggle: () => setPresenting((p) => !p), chipClass: css.presentChip, exitClass: css.presentExit }}
      />
      {narration.missing && (
        <p className="toast" role="status">
          {t.noVoice}
        </p>
      )}
      {notice && (
        <p className={css.notice} role="status">
          <span>{notice === "slow" ? t.slow : t.noScene}</span>
          <Link href={textUrl}>{t.slowRead} →</Link>
          <button type="button" onClick={() => setNotice(null)} aria-label={t.cancel}>
            ✕
          </button>
        </p>
      )}
      <Timeline lang={chapter.lang} items={chapter.beats.map((b, i) => (i === 0 ? chapter.year : b.kicker))} active={active} onGo={(i) => goTo(i, 1.8)} />

      <main>
        {chapter.beats.map((b, i) =>
          b.layout === "hero" ? (
            <Hero key={b.id} lang={chapter.lang} chapter={chapter} beat={b} sectionRef={setRef(i)} play={opened} loading={status === "loading"} onStart={() => goTo(1, 2)} />
          ) : (
            <BeatSection
              key={b.id}
              beat={b}
              chapter={chapter}
              index={i}
              sectionRef={setRef(i)}
              completed={!!(b.interaction && completed[b.interaction.key])}
              autoPlay={!!b.interaction && autoInteract === b.interaction.key}
              onComplete={() => b.interaction && complete(b.interaction.key)}
            >
              {i === last && (
                <ChapterEnd
                  chapter={chapter}
                  editUrl={editUrl}
                  journey={journey}
                  autoNext={narration.on && spokenAt === last && active === last}
                  onRestart={() => goTo(0, 3)}
                  onReview={(id) => goTo(chapter.beats.findIndex((x) => x.id === id), 2)}
                />
              )}
            </BeatSection>
          ),
        )}
      </main>
    </>
  );
}
