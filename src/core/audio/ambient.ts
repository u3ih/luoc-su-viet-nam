// Âm thanh nền tổng hợp thời gian thực: tiếng sông, gió, tiếng trống đồng dồn dập
// theo cường độ trận đánh, và những câu nhạc ngũ cung kiểu đàn bầu lúc yên ả.
// Không tải file nào.

type Ambient = { setVolume: (v: number) => void; dispose: () => void };

function noiseBuffer(ctx: AudioContext, seconds: number, brown: boolean) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = w;
  }
  return buf;
}

export function createAmbient(getBattle: () => number): Ambient {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // sông
  const river = ctx.createBufferSource();
  river.buffer = noiseBuffer(ctx, 4, true);
  river.loop = true;
  const riverLp = ctx.createBiquadFilter();
  riverLp.type = "lowpass";
  riverLp.frequency.value = 520;
  const riverGain = ctx.createGain();
  riverGain.gain.value = 0.55;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain).connect(riverLp.frequency);
  river.connect(riverLp).connect(riverGain).connect(master);

  // gió
  const wind = ctx.createBufferSource();
  wind.buffer = noiseBuffer(ctx, 3, false);
  wind.loop = true;
  const windBp = ctx.createBiquadFilter();
  windBp.type = "bandpass";
  windBp.frequency.value = 900;
  windBp.Q.value = 0.6;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.025;
  wind.connect(windBp).connect(windGain).connect(master);

  river.start();
  wind.start();
  lfo.start();

  const hitBuf = noiseBuffer(ctx, 0.3, false);

  // trống: thân trầm + tiếng đồng ngân
  function drum(at: number, strength: number) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(92, at);
    o.frequency.exponentialRampToValueAtTime(42, at + 0.45);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.9 * strength, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.1);
    o.connect(g).connect(master);
    o.start(at);
    o.stop(at + 1.2);

    for (const [f, a] of [
      [211, 0.06],
      [338, 0.035],
      [527, 0.02],
    ]) {
      const b = ctx.createOscillator();
      const bg = ctx.createGain();
      b.type = "triangle";
      b.frequency.value = f;
      bg.gain.setValueAtTime(0.0001, at);
      bg.gain.exponentialRampToValueAtTime(a * strength, at + 0.005);
      bg.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
      b.connect(bg).connect(master);
      b.start(at);
      b.stop(at + 1.7);
    }

    const n = ctx.createBufferSource();
    n.buffer = hitBuf;
    const nf = ctx.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 260;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.35 * strength, at);
    ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
    n.connect(nf).connect(ng).connect(master);
    n.start(at);
  }

  // bộ hẹn giờ nhìn trước 0.2s để nhịp đều dù main thread bận
  let nextBeat = ctx.currentTime + 0.5;
  let beat = 0;
  const timer = window.setInterval(() => {
    const battle = getBattle();
    if (battle < 0.05) {
      nextBeat = ctx.currentTime + 0.3;
      return;
    }
    while (nextBeat < ctx.currentTime + 0.2) {
      const accent = beat % 4 === 0 ? 1 : 0.6;
      drum(nextBeat, Math.min(1, battle * 1.1) * accent);
      nextBeat += 1.6 - battle * 1.05;
      beat++;
    }
  }, 50);

  // Đàn bầu: một dây, tiếng ngân dài, luyến (vuốt cao độ) và rung đặc trưng.
  // Thang ngũ cung (Hò Xự Xang Xê Cống) quanh La3.
  const PENTA = [220, 247.5, 293.3, 330, 371.25, 440, 495, 586.7];
  function pluck(at: number, freq: number, bendTo: number, dur: number) {
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    o.type = "sine";
    o2.type = "triangle";
    o.frequency.setValueAtTime(freq, at);
    o.frequency.setValueAtTime(freq, at + dur * 0.35);
    o.frequency.exponentialRampToValueAtTime(bendTo, at + dur * 0.6);
    // rung (vibrato) tăng dần ở cuối nốt
    const vib = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vib.frequency.value = 5.5;
    vibGain.gain.setValueAtTime(0, at);
    vibGain.gain.linearRampToValueAtTime(bendTo * 0.012, at + dur);
    vib.connect(vibGain).connect(o.frequency);
    o2.frequency.value = freq * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.09, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g);
    o2.connect(g2).connect(g);
    g.connect(lp).connect(master);
    for (const x of [o, o2, vib]) {
      x.start(at);
      x.stop(at + dur + 0.05);
    }
  }
  let nextPhrase = ctx.currentTime + 3;
  function maybePhrase(battle: number) {
    if (battle > 0.15 || ctx.currentTime < nextPhrase) return;
    let at = ctx.currentTime + 0.1;
    let idx = 2 + Math.floor(Math.random() * 4);
    const notes = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < notes; i++) {
      idx = Math.max(0, Math.min(PENTA.length - 1, idx + [-2, -1, 1, 1, 2][Math.floor(Math.random() * 5)]));
      const f = PENTA[idx];
      const bend = Math.random() < 0.5 ? f : PENTA[Math.min(PENTA.length - 1, idx + 1)];
      const dur = i === notes - 1 ? 3.2 : 0.9 + Math.random() * 0.8;
      pluck(at, f, bend, dur);
      at += dur * 0.75;
    }
    nextPhrase = at + 8 + Math.random() * 8;
  }
  const melodyTimer = window.setInterval(() => maybePhrase(getBattle()), 500);

  return {
    setVolume(v) {
      void ctx.resume();
      master.gain.setTargetAtTime(v, ctx.currentTime, 0.4);
    },
    dispose() {
      window.clearInterval(timer);
      window.clearInterval(melodyTimer);
      void ctx.close();
    },
  };
}
