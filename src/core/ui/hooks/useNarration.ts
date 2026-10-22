"use client";

import { useEffect, useRef, useState } from "react";
import { loadVoice, primeAudio, readingMs, speak, stop, ttsSupported } from "../../audio/narrator";

type VoiceStatus = "idle" | "ok" | "missing";

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

  // phát được file audio thu sẵn là đủ — không cần giọng máy (vài trình duyệt trong ứng dụng không có speechSynthesis)
  useEffect(() => setSupported(ttsSupported() || typeof Audio !== "undefined"), []);
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
    primeAudio();
    setOn(true);
    if (voice !== "idle") return;
    // Có file audio thu sẵn thì phát ngay, không chờ trình duyệt nạp danh sách giọng (có thể mất tới 2,5 s);
    // vẫn nạp ngầm để các phân cảnh chưa có audio còn dùng được giọng máy.
    if (audio) {
      setVoice("ok");
      void loadVoice();
    } else setVoice((await loadVoice()) ? "ok" : "missing");
  }

  return { on, toggle, supported, missing: on && voice === "missing" && !audio };
}
