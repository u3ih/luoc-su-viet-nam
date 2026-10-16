"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./HistoryMap";
import css from "./HistoryMap.module.scss";

// Bản đồ chỉ dựng trên trình duyệt (WebGL); danh sách sự kiện bên dưới vẫn render từ server.
const HistoryMap = dynamic(() => import("./HistoryMap"), { ssr: false, loading: () => <div className={css.placeholder} aria-hidden="true" /> });

export default function MapLoader(props: { pins: MapPin[]; eras: string[] }) {
  return <HistoryMap {...props} />;
}
