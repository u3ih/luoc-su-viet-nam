"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { markSeen } from "../story/progress";
import { computeT, resetStory, story } from "../story/store";
import { narrationOf, type Chapter } from "../types";
import BeatSection from "./BeatSection";
import ChapterEnd from "./ChapterEnd";
import { ScrollTrigger } from "./gsap";
import Hero from "./Hero";
import { useAmbient } from "./hooks/useAmbient";
import { useNarration } from "./hooks/useNarration";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import IntroOverlay from "./IntroOverlay";
import Timeline from "./Timeline";
import TopBar from "./TopBar";

// Three.js + cảnh của chương chỉ tải sau khi chữ đã hiển thị.
const SceneStage = dynamic(() => import("./SceneStage"), { ssr: false });

type Status = "loading" | "ready" | "fallback";

/**
 * Khung trang kể chuyện dùng cho MỌI chương. Nhận dữ liệu chương (chữ + cấu hình cảnh)
 * và tự lo: cảnh 3D, cuộn mượt, dòng thời gian, giọng kể, âm thanh, tương tác.
 */
export default function StoryShell({ chapter, textUrl, editUrl }: { chapter: Chapter; textUrl: string; editUrl: string }) {
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
  const goTo = (i: number) => scroll.scrollTo(story.centers[i] - window.innerHeight / 2);
  const complete = (key: string) => setCompleted((c) => ({ ...c, [key]: true }));
  const last = chapter.beats.length - 1;

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

      <IntroOverlay ready={status !== "loading"} label={`${chapter.era} · ${chapter.year}`} title={chapter.title} onDone={() => setOpened(true)} />

      <TopBar narration={narration} ambient={ambient} textUrl={textUrl} />
      {narration.missing && (
        <p className="toast" role="status">
          Trình duyệt này chưa có giọng đọc tiếng Việt nên trang sẽ tự cuộn theo nhịp đọc thầm. Muốn nghe kể, thử Microsoft Edge, Safari
          hoặc Chrome trên Android.
        </p>
      )}
      <Timeline items={chapter.beats.map((b, i) => (i === 0 ? chapter.year : b.kicker))} active={active} onGo={goTo} />

      <main>
        {chapter.beats.map((b, i) =>
          b.layout === "hero" ? (
            <Hero key={b.id} chapter={chapter} beat={b} sectionRef={setRef(i)} play={opened} loading={status === "loading"} />
          ) : (
            <BeatSection
              key={b.id}
              beat={b}
              index={i}
              sectionRef={setRef(i)}
              completed={!!(b.interaction && completed[b.interaction.key])}
              autoPlay={!!b.interaction && autoInteract === b.interaction.key}
              onComplete={() => b.interaction && complete(b.interaction.key)}
            >
              {i === last && <ChapterEnd chapter={chapter} textUrl={textUrl} editUrl={editUrl} />}
            </BeatSection>
          ),
        )}
      </main>
    </>
  );
}
