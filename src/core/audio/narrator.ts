// Giọng kể. Ưu tiên file audio thu sẵn (chapter.audio); nếu chưa có thì dùng
// giọng tiếng Việt tổng hợp sẵn trong trình duyệt/hệ điều hành (Web Speech API).
// Edge có giọng neural "HoaiMy"/"NamMinh"; macOS/iOS có "Linh" (tải thêm bản Enhanced/Premium thì hay hơn);
// Android có Google TTS.
//
// Những chỗ dễ đọc sai (và cách xử lý):
// - Chrome tạo lại danh sách giọng mỗi lần "voiceschanged". Gán `utterance.voice` bằng object của danh sách cũ
//   thì Chrome lặng lẽ bỏ qua và đọc bằng giọng mặc định của máy — thường là giọng tiếng Anh. Vì vậy chỉ nhớ
//   `voiceURI`, mỗi lần đọc tra lại trong danh sách hiện tại, và luôn đặt `lang = "vi-VN"`.
// - Không có giọng tiếng Việt thì KHÔNG đọc (giọng tiếng Anh đọc chữ Việt nghe như tiếng nước ngoài).
// - Số, số La Mã, "TCN"… được đổi sang chữ trước khi đọc (speakable.ts).

import { speakable } from "./speakable";

/** Thứ tự ưu tiên: giọng neural/online trước, rồi giọng "nâng cao" của Apple, rồi giọng thường. */
const RANK = [/HoaiMy/i, /NamMinh/i, /Neural|Natural/i, /Online/i, /Premium/i, /Enhanced|nâng cao/i, /Google/i, /Linh/i, /An\b/i];

let voiceURI: string | null = null;
let audio: HTMLAudioElement | null = null;
/** Mỗi lần speak/stop tăng lên — sự kiện của lượt đọc cũ (bị huỷ) không được báo "đã đọc xong". */
let generation = 0;
let keepAlive: ReturnType<typeof setInterval> | undefined;

const isVietnamese = (v: SpeechSynthesisVoice) => /^vi([-_]|$)/i.test(v.lang) || /vietnam|tiếng việt/i.test(v.name);

function rank(v: SpeechSynthesisVoice) {
  const i = RANK.findIndex((re) => re.test(v.name));
  return (i < 0 ? RANK.length : i) + (v.localService ? 0 : -0.5);
}

function vietnameseVoices() {
  return speechSynthesis
    .getVoices()
    .filter(isVietnamese)
    .sort((a, b) => rank(a) - rank(b));
}

/** Giọng đang dùng, tra trong danh sách HIỆN TẠI (xem ghi chú đầu file). */
function currentVoice(): SpeechSynthesisVoice | null {
  const list = vietnameseVoices();
  return list.find((v) => v.voiceURI === voiceURI) ?? list[0] ?? null;
}

export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/** Chờ danh sách giọng (Chrome nạp bất đồng bộ, có khi báo "voiceschanged" nhiều lần). */
export function loadVoice(): Promise<SpeechSynthesisVoice | null> {
  if (!ttsSupported()) return Promise.resolve(null);
  const pick = () => {
    const v = vietnameseVoices()[0] ?? null;
    voiceURI = v?.voiceURI ?? null;
    return v;
  };
  const now = pick();
  if (now) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      const v = pick();
      if (!v) return;
      speechSynthesis.removeEventListener("voiceschanged", done);
      clearTimeout(timer);
      resolve(v);
    };
    speechSynthesis.addEventListener("voiceschanged", done);
    const timer = setTimeout(() => {
      speechSynthesis.removeEventListener("voiceschanged", done);
      resolve(pick());
    }, 2500);
  });
}

export function stop() {
  generation++;
  clearInterval(keepAlive);
  audio?.pause();
  if (ttsSupported()) speechSynthesis.cancel();
}

/** Tách câu cho hàng đợi: Chrome tự cắt utterance dài (~15 s), câu ngắn cũng cho ngắt nghỉ tự nhiên hơn. */
function sentences(text: string) {
  return (text.match(/[^.!?…;]+[.!?…;]*/g) ?? [text]).map((s) => s.trim()).filter((s) => /[\p{L}\d]/u.test(s));
}

/**
 * Đọc `text` (hoặc phát `audioSrc`). Gọi `onEnd` khi đọc hết — không gọi nếu bị huỷ giữa chừng.
 * Trả `false` nếu không đọc được (không có giọng tiếng Việt).
 */
export function speak(text: string, audioSrc?: string, onEnd?: () => void): boolean {
  stop();
  const gen = generation;
  const finish = () => {
    if (gen !== generation) return;
    clearInterval(keepAlive);
    onEnd?.();
  };
  if (audioSrc) {
    audio ??= new Audio();
    audio.src = audioSrc;
    audio.onended = finish;
    void audio.play().catch(() => {});
    return true;
  }
  const voice = ttsSupported() ? currentVoice() : null;
  if (!voice) return false;
  const parts = sentences(speakable(text));
  parts.forEach((s, i) => {
    const u = new SpeechSynthesisUtterance(s);
    u.voice = voice;
    u.lang = "vi-VN";
    u.rate = 0.92;
    if (i === parts.length - 1) {
      u.onend = finish;
      u.onerror = (e) => {
        // "interrupted"/"canceled" = do chính ta huỷ; lỗi khác thì vẫn cho câu chuyện đi tiếp
        if (e.error !== "interrupted" && e.error !== "canceled") finish();
      };
    }
    speechSynthesis.speak(u);
  });
  if (!parts.length) queueMicrotask(finish);
  // Chrome (giọng online) tự dừng hàng đợi sau ~15 s nếu không "đánh thức" — pause/resume định kỳ
  if (!voice.localService) {
    keepAlive = setInterval(() => {
      if (!speechSynthesis.speaking) return;
      speechSynthesis.pause();
      speechSynthesis.resume();
    }, 10000);
  }
  return true;
}
