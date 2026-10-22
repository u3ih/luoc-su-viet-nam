"""Tạo giọng kể bằng VieNeu-TTS (mô hình mở Apache-2.0, chạy ngay trên máy, không cần khoá API).

Không chạy trực tiếp: `pnpm tts` (scripts/tts.mjs) tính danh sách việc cần làm rồi gọi file này.
    python scripts/tts_vieneu.py <jobs.json>
jobs.json = [{"out": "/đường/dẫn/tuyệt/đối/ten.mp3", "text": "chữ đã chuẩn hoá"}, ...]

Cài một lần (xem scripts/tts.mjs): uv venv .tts-venv && uv pip install --python .tts-venv/bin/python vieneu

Biến môi trường:
  VIENEU_VOICE   tên giọng (mặc định "Thiền Tâm Đức", nam miền Bắc, phong cách kể chuyện)
  VIENEU_GAP     giây nghỉ giữa hai câu (mặc định 0.45)
  VIENEU_CAP     giây tối đa của một chỗ nghỉ BÊN TRONG câu (mặc định 0.3)

Vì sao tách câu và rút chỗ nghỉ: VieNeu đọc nguyên đoạn dài như một khối và tự "ngập ngừng" giữa chừng (có lúc nghỉ
gần một giây giữa "sau" và "những cơn mưa lớn"). Đọc từng câu riêng, rút mọi chỗ lặng trong câu xuống tối đa VIENEU_CAP,
rồi nối các câu bằng khoảng nghỉ cố định, cho nhịp kể đều và dễ đoán. Đổi tham số lấy mẫu (nhiệt độ, repetition_penalty)
đã thử mà không giúp, hạ nhiệt độ còn làm giọng đứng hình 1–3 giây, nên giữ mặc định của mô hình.
Âm thanh vẫn mang dấu watermark "do AI tạo" mặc định của VieNeu (không nghe thấy) — không tắt.
"""

import json
import os
import re
import shutil
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
import soxr

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".tts-cache" / "vieneu"
VOICE = os.environ.get("VIENEU_VOICE", "Thiền Tâm Đức")
GAP = float(os.environ.get("VIENEU_GAP", 0.45))
CAP = float(os.environ.get("VIENEU_CAP", 0.3))
SR = 48000  # tần số của VieNeu v3 Turbo
OUT_SR = 24000  # giọng nói không cần hơn; nhỏ gấp đôi
MODEL_REPO, MODEL_SUB = "pnnbao-ump/VieNeu-TTS-v3-Turbo", "onnx_update"
CODEC_REPO = "OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX"


def real_copy(repo: str, sub: str | None, name: str) -> str:
    """Chép mô hình từ cache Hugging Face ra thư mục thường.

    onnxruntime từ chối đọc dữ liệu ngoài khi file là symlink trỏ ra khỏi thư mục mô hình (đúng kiểu cache HF),
    nên phải có bản sao thật để nạp.
    """
    from huggingface_hub import snapshot_download

    dst = CACHE / name
    if (dst / ".ok").exists():
        return str(dst)
    snap = Path(snapshot_download(repo, allow_patterns=[f"{sub}/*"] if sub else None))
    src = snap / sub if sub else snap
    dst.mkdir(parents=True, exist_ok=True)
    for f in src.iterdir():
        if f.is_file() or f.is_symlink():
            shutil.copy2(f.resolve(), dst / f.name)
    (dst / ".ok").touch()
    return str(dst)


def load_tts():
    from vieneu._v3_turbo_engine import onnx_runtime_lite as m

    graphs = real_copy(MODEL_REPO, MODEL_SUB, "graphs")
    codec = real_copy(CODEC_REPO, None, "codec")
    orig = m.OnnxV3LiteEngine.__init__

    def init(self, *a, **kw):
        kw["onnx_dir"] = kw.get("onnx_dir") or graphs
        kw["codec_dir"] = kw.get("codec_dir") or codec
        return orig(self, *a, **kw)

    m.OnnxV3LiteEngine.__init__ = init
    from vieneu import Vieneu

    return Vieneu()


def split_sentences(text: str) -> list[str]:
    parts = re.findall(r"[^.!?…]+[.!?…]*", text)
    return [p.strip() for p in parts if re.search(r"[\wÀ-ỹ]", p)]


def _energy(a: np.ndarray, fr: int) -> np.ndarray:
    n = len(a) // fr
    return np.sqrt(np.mean(a[: n * fr].reshape(n, fr) ** 2, axis=1))


def trim_silences(a: np.ndarray, cap: float, thr_ratio: float = 0.03, win: float = 0.01) -> np.ndarray:
    """Rút mọi khoảng lặng bên trong đoạn dài hơn `cap` giây xuống đúng `cap` (giữ hai mép khoảng lặng cho mượt)."""
    fr = int(SR * win)
    e = _energy(a, fr)
    quiet = e < e.max() * thr_ratio
    n, keep, out, i = len(e), int(cap / win), [], 0
    while i < n:
        j = i
        while j < n and quiet[j] == quiet[i]:
            j += 1
        seg = a[i * fr : j * fr]
        if quiet[i] and i > 0 and j < n and (j - i) > keep:
            half = (keep * fr) // 2
            seg = np.concatenate([seg[:half], seg[-half:]])
        out.append(seg)
        i = j
    return np.concatenate(out)


def edge_trim(a: np.ndarray, keep: float = 0.05, thr_ratio: float = 0.03) -> np.ndarray:
    fr = int(SR * 0.01)
    e = _energy(a, fr)
    idx = np.where(e >= e.max() * thr_ratio)[0]
    if not len(idx):
        return a
    return a[max(0, idx[0] * fr - int(keep * SR)) : min(len(a), (idx[-1] + 1) * fr + int(keep * SR))]


def render(tts, text: str) -> np.ndarray:
    pieces = [edge_trim(trim_silences(np.asarray(tts.infer(s, voice=VOICE), dtype=np.float32), CAP)) for s in split_sentences(text)]
    gap = np.zeros(int(GAP * SR), dtype=np.float32)
    out: list[np.ndarray] = []
    for i, p in enumerate(pieces):
        out.append(p.astype(np.float32))
        if i < len(pieces) - 1:
            out.append(gap)
    return np.concatenate(out)


def main():
    jobs = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    tts = load_tts()
    for n, job in enumerate(jobs, 1):
        wav = render(tts, job["text"])
        pcm = soxr.resample(wav, SR, OUT_SR)
        # CBR ~56 kb/s: trình duyệt tính đúng thời lượng và tua chính xác (VBR hay lệch)
        sf.write(job["out"], pcm, OUT_SR, format="MP3", bitrate_mode="CONSTANT", compression_level=0.7)
        print(f"{n}/{len(jobs)} {Path(job['out']).parent.name}/{Path(job['out']).name} {len(wav) / SR:.1f}s", flush=True)


if __name__ == "__main__":
    main()
