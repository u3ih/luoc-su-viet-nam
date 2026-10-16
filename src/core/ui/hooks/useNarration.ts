"use client";

import { useEffect, useRef, useState } from "react";
import { loadVoice, speak, stop, ttsSupported } from "../../audio/narrator";

type VoiceStatus = "idle" | "ok" | "missing";

/** Thời gian đọc ước lượng khi máy không có giọng tiếng Việt (~2,6 tiếng/giây, cộng một nhịp nghỉ). */
const readingMs = (text: string) => 1200 + text.split(/\s+/).filter(Boolean).length * 380;

/**
 * Bật/tắt giọng kể; tự đọc `text` mỗi khi nó đổi và gọi `onEnd` khi đọc xong (để tự cuộn sang phân cảnh sau).
 * Máy không có giọng tiếng Việt thì vẫn "đọc thầm": chờ theo độ dài đoạn văn rồi báo xong, để chế độ tự cuộn vẫn chạy.
 */
export function useNarration(text: string, audio: string | undefined, onEnd: () => void) {
  const [on, setOn] = useState(false);
  const [voice, setVoice] = useState<VoiceStatus>("idle");
  const [supported, setSupported] = useState(false);
  const endRef = useRef(onEnd);
  useEffect(() => {
    endRef.current = onEnd;
  });

  useEffect(() => setSupported(ttsSupported()), []);
  useEffect(() => {
    if (!on || voice === "idle") return;
    const done = () => endRef.current();
    if (speak(text, audio, done)) return;
    const timer = setTimeout(done, readingMs(text));
    return () => clearTimeout(timer);
  }, [on, voice, text, audio]);
  useEffect(() => () => stop(), []);

  async function toggle() {
    if (on) {
      stop();
      setOn(false);
      return;
    }
    setOn(true);
    if (voice === "idle") setVoice((await loadVoice()) ? "ok" : "missing");
  }

  return { on, toggle, supported, missing: on && voice === "missing" && !audio };
}
