"use client";

import { useSyncExternalStore } from "react";

// Tuỳ chọn hiển thị của người xem — chỉ lưu localStorage trên máy họ, không gửi đi đâu.

const KEY = "lsvn-prefs";
const EVENT = "lsvn-prefs";

export type Prefs = {
  /** Hiện câu hỏi ôn tập cuối chương. */
  quiz: boolean;
};

const DEFAULTS: Prefs = { quiz: true };

function read(): Prefs {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return { ...DEFAULTS, ...(v && typeof v === "object" ? v : {}) };
  } catch {
    return DEFAULTS;
  }
}

let cache: { raw: string | null; value: Prefs } | null = null;
function snapshot(): Prefs {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (!cache || cache.raw !== raw) cache = { raw, value: read() };
  return cache.value;
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...read(), [key]: value }));
  } catch {
    // trình duyệt chặn lưu trữ: chỉ đổi trong phiên này
    cache = { raw: cache?.raw ?? null, value: { ...snapshot(), [key]: value } };
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function usePref<K extends keyof Prefs>(key: K): Prefs[K] {
  return useSyncExternalStore(subscribe, () => snapshot()[key], () => DEFAULTS[key]);
}
