"use client";

import { useId } from "react";
import Icon from "./Icon";
import css from "./SearchField.module.scss";

type Props = {
  /** Nhãn cho trình đọc màn hình (và hiện trên ô nếu `showLabel`). */
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  showLabel?: boolean;
  className?: string;
};

/** Ô tìm kiếm: bo tròn, kính lúp bên trái, cỡ chữ 16px trên điện thoại để Safari iOS không tự phóng to. */
export default function SearchField({ label, placeholder, value, onChange, showLabel, className }: Props) {
  const id = useId();
  return (
    <div className={`${css.field} ${className ?? ""}`}>
      <label htmlFor={id} className={showLabel ? css.label : css.sr}>
        {label}
      </label>
      <span className={css.box}>
        <Icon name="search" size={16} className={css.icon} />
        <input id={id} type="search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.currentTarget.value)} />
      </span>
    </div>
  );
}
