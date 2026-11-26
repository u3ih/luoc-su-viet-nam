"use client";

import { useState } from "react";
import { Button, Chip, ChipRow, Field, Icon, Input, SearchField, Segmented, Select } from "@/core/ui";
import css from "./page.module.scss";

/** Phần có trạng thái của trang /thiet-ke: ô tìm, nút chọn kiểu, chip lọc, ô nhập. */
export default function Demo() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"the" | "dong">("the");
  const [era, setEra] = useState("ly");
  return (
    <div className={css.stack}>
      <div className={css.row}>
        <SearchField className={css.grow} label="Tìm chương" placeholder="Tìm theo tên, năm, nhân vật…" value={q} onChange={setQ} />
        <Segmented
          label="Kiểu hiển thị"
          options={[
            { value: "the", label: "Thẻ" },
            { value: "dong", label: "Dòng thời gian" },
          ]}
          value={view}
          onChange={setView}
        />
      </div>
      <ChipRow label="Lọc thời kỳ">
        {[
          ["", "Tất cả", 375],
          ["ly", "Lý", 21],
          ["tran", "Trần", 26],
          ["le", "Lê sơ", 18],
        ].map(([id, label, n]) => (
          <Chip key={id} on={era === id} count={n as number} onClick={() => setEra(id as string)}>
            {label}
          </Chip>
        ))}
      </ChipRow>
      <div className={css.row}>
        <Field label="Từ năm" htmlFor="demo-nam">
          <Input id="demo-nam" type="number" placeholder="để trống" />
        </Field>
        <Field label="Tỉnh / thành" htmlFor="demo-tinh">
          <Select id="demo-tinh" defaultValue="">
            <option value="">Mọi nơi</option>
            <option>Quảng Ninh</option>
            <option>Thanh Hoá</option>
          </Select>
        </Field>
        <Button size="sm">
          <Icon name="close" size={12} /> Xoá bộ lọc
        </Button>
      </div>
    </div>
  );
}
