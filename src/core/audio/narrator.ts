// Giọng kể. Ưu tiên file audio thu sẵn (chapter.audio); nếu chưa có thì dùng
// giọng tiếng Việt tổng hợp sẵn trong trình duyệt/hệ điều hành (Web Speech API).
// Edge có giọng neural "HoaiMy"/"NamMinh"; macOS/iOS có "Linh"; Android có Google TTS.

const PREFERRED = [/HoaiMy/i, /NamMinh/i, /Natural/i, /Online/i, /Google/i, /Linh/i];

let voice: SpeechSynthesisVoice | null = null;
let audio: HTMLAudioElement | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  const vi = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("vi"));
  for (const re of PREFERRED) {
    const v = vi.find((x) => re.test(x.name));
    if (v) return v;
  }
  return vi[0] ?? null;
}

export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Chờ danh sách giọng (Chrome nạp bất đồng bộ). */
export function loadVoice(): Promise<SpeechSynthesisVoice | null> {
  if (!ttsSupported()) return Promise.resolve(null);
  voice = pickVoice();
  if (voice) return Promise.resolve(voice);
  return new Promise((resolve) => {
    const done = () => {
      voice = pickVoice();
      resolve(voice);
    };
    speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
}

export function stop() {
  audio?.pause();
  if (ttsSupported()) speechSynthesis.cancel();
}

export function speak(text: string, audioSrc?: string) {
  stop();
  if (audioSrc) {
    audio ??= new Audio();
    audio.src = audioSrc;
    void audio.play().catch(() => {});
    return;
  }
  if (!ttsSupported() || !voice) return;
  // Chrome tự cắt câu dài (~15s) — tách theo câu và xếp hàng đợi; cancel() xoá cả hàng.
  const sentences = text.match(/[^.!?…]+[.!?…]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  for (const s of sentences) {
    const u = new SpeechSynthesisUtterance(s);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.95;
    speechSynthesis.speak(u);
  }
}
