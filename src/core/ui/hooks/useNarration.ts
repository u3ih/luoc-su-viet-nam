"use client";

import { useEffect, useState } from "react";
import { loadVoice, speak, stop, ttsSupported } from "../../audio/narrator";

type VoiceStatus = "idle" | "ok" | "missing";

/** Bật/tắt giọng kể; tự đọc `text` mỗi khi nó đổi. */
export function useNarration(text: string, audio?: string) {
  const [on, setOn] = useState(false);
  const [voice, setVoice] = useState<VoiceStatus>("idle");
  const [supported, setSupported] = useState(false);

  useEffect(() => setSupported(ttsSupported()), []);
  useEffect(() => {
    if (on && (voice === "ok" || audio)) speak(text, audio);
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
