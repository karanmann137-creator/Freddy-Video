// "The whole job text: 'Leak.'" — trade-life type for contractors, low-poly look at dusk. All pictures are faceted polygons drawn in code.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, CommentCard, Progress, Sfx, VoiceClip, clamp, FONT } from "../kit";

// beats leave room to breathe: the voice starts 10 frames in and each line is followed by 20+ frames of quiet
const T = { b2: 125, b3: 220, b4: 334, b5: 459, end: 572, total: 660 };
const DOOR = 286; // the van has stopped, the front door opens

// ---------- low-poly helpers ----------
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const rgbOf = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixc = (a: string, b: string, t: number) => { const A = rgbOf(a), B = rgbOf(b); return A.map((v, i) => v + (B[i] - v) * t); };
const rgb = (c: number[], k = 1) => `rgb(${c.map((v) => Math.max(0, Math.min(255, Math.round(v * k)))).join(",")})`;
const P: React.FC<{ pts: number[][]; fill: string; opacity?: number }> = ({ pts, fill, opacity = 1 }) => (
  <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={fill} stroke={fill} strokeWidth={1.5} strokeLinejoin="round" opacity={opacity} />
);

/** A rectangle of faceted triangles shading from `top` to `bot` colour. */
const FacetBg: React.FC<{ x?: number; y?: number; w: number; h: number; top: string; bot: string; cols?: number; rows?: number; seed?: number; jit?: number; shade?: number }> =
  ({ x = 0, y = 0, w, h, top, bot, cols = 8, rows = 10, seed = 1, jit = 0.14, shade = 0.1 }) => {
    const pts: number[][][] = [];
    for (let j = 0; j <= rows; j++) {
      const row: number[][] = [];
      for (let i = 0; i <= cols; i++) {
        const jx = i > 0 && i < cols ? (rnd(seed + i * 13 + j * 7) - 0.5) * (w / cols) * jit * 2 : 0;
        const jy = j > 0 && j < rows ? (rnd(seed * 3 + i * 5 + j * 11) - 0.5) * (h / rows) * jit * 2 : 0;
        row.push([x + (i * w) / cols + jx, y + (j * h) / rows + jy]);
      }
      pts.push(row);
    }
    const tris: React.ReactNode[] = [];
    let n = 0;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const a = pts[j][i], b = pts[j][i + 1], c = pts[j + 1][i], d = pts[j + 1][i + 1];
      const two = (i + j) % 2 ? [[a, b, c], [b, d, c]] : [[a, b, d], [a, d, c]];
      for (const t of two) {
        const cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
        const k = 1 + (rnd(seed * 31 + n++ * 17) - 0.5) * shade * 2;
        tris.push(<P key={n} pts={t} fill={rgb(mixc(top, bot, Math.max(0, Math.min(1, (cy - y) / h))), k)} />);
      }
    }
    return <>{tris}</>;
  };

/** Faceted tradesperson bust (front view, 300x420 box). `shrug` 0..1 lifts the shoulders. */
const Pro: React.FC<{ x: number; y: number; scale?: number; shrug?: number; tilt?: number }> = ({ x, y, scale = 1, shrug = 0, tilt = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <g transform={`translate(0,${-shrug * 26})`}>
      <P pts={[[20, 420], [40, 255], [110, 220], [150, 420]]} fill="#d65a0c" />
      <P pts={[[150, 420], [110, 220], [190, 220]]} fill="#ea6b14" />
      <P pts={[[150, 420], [190, 220], [260, 255], [280, 420]]} fill="#f2803a" />
      <P pts={[[110, 220], [150, 262], [190, 220]]} fill="#b84a08" />
      <P pts={[[40, 255], [110, 220], [96, 250]]} fill="#f2803a" />
    </g>
    <P pts={[[122, 200], [178, 200], [172, 240], [128, 240]]} fill="#c58e68" />
    <g transform={`rotate(${tilt},150,170)`}>
      <P pts={[[150, 85], [100, 105], [85, 160]]} fill="#d9a07a" />
      <P pts={[[150, 85], [85, 160], [110, 215]]} fill="#c58e68" />
      <P pts={[[150, 85], [110, 215], [190, 215]]} fill="#e0a982" />
      <P pts={[[150, 85], [190, 215], [215, 160]]} fill="#c58e68" />
      <P pts={[[150, 85], [215, 160], [200, 105]]} fill="#d9a07a" />
      <P pts={[[70, 118], [150, 40], [230, 118], [214, 104], [150, 82], [86, 104]]} fill="#1f2a47" />
      <P pts={[[86, 104], [150, 82], [214, 104], [218, 124], [82, 124]]} fill="#ea6b14" />
      <circle cx={122} cy={158} r={7} fill="#1a2236" /><circle cx={178} cy={158} r={7} fill="#1a2236" />
      <rect x={128} y={196} width={44} height={6} rx={3} fill="#7a4a35" />
    </g>
  </g>
);

const Bubble: React.FC<{ x: number; y: number; w: number; h: number; at: number; fill: string; color: string; children: React.ReactNode }> = ({ x, y, w, h, at, fill, color, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 10, mass: 0.5 } });
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect width={w} height={h} rx={34} fill={fill} />
      <foreignObject x={0} y={0} width={w} height={h}>
        <div style={{ width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT, fontWeight: 900, color, lineHeight: 1.1 }}>{children}</div>
      </foreignObject>
    </g>
  );
};

/** The phone showing the job text. Drawn at 0,0 (about 480x860). */
const Phone: React.FC<{ frame: number }> = ({ frame }) => {
  const typing = frame >= T.b2 + 30 && frame < T.b2 + 54;
  return (
    <g>
      <rect x={-14} y={-14} width={508} height={888} rx={64} fill="#0b0f1d" />
      <rect x={0} y={0} width={480} height={860} rx={52} fill="#e9edf6" />
      <rect x={0} y={0} width={480} height={110} rx={52} fill="#cfd6e6" />
      <rect x={0} y={60} width={480} height={50} fill="#cfd6e6" />
      <circle cx={64} cy={56} r={30} fill="#9aa6c2" />
      <rect x={110} y={44} width={170} height={24} rx={12} fill="#9aa6c2" />
      <Bubble x={24} y={150} w={300} h={130} at={6} fill="#ffffff" color="#1a2236"><span style={{ fontSize: 84 }}>LEAK</span></Bubble>
      <Bubble x={236} y={320} w={220} h={96} at={T.b2 + 12} fill="#ea6b14" color="#fff"><span style={{ fontSize: 46 }}>Where?</span></Bubble>
      {typing ? (
        <g>
          <rect x={24} y={450} width={150} height={80} rx={34} fill="#ffffff" />
          {[0, 1, 2].map((i) => <circle key={i} cx={64 + i * 36} cy={490 - Math.max(0, Math.sin((frame - i * 4) / 3.2)) * 12} r={10} fill="#9aa6c2" />)}
        </g>
      ) : null}
      <Bubble x={24} y={450} w={360} h={150} at={T.b2 + 54} fill="#ffffff" color="#1a2236"><span style={{ fontSize: 46 }}>Kitchen.<br />Or bathroom.</span></Bubble>
    </g>
  );
};

const Fade: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return <AbsoluteFill style={{ opacity: interpolate(frame, [from, from + 7], [0, 1], clamp) }}>{children}</AbsoluteFill>;
};

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

const Windows: React.FC<{ x: number; y: number; w: number; h: number; seed: number; on?: number }> = ({ x, y, w, h, seed, on = 0.4 }) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < Math.floor(w / 46); i++) for (let j = 0; j < Math.floor(h / 70); j++)
    if (rnd(seed + i * 7 + j * 3) < on) out.push(<rect key={`${i}-${j}`} x={x + 14 + i * 46} y={y + 18 + j * 70} width={22} height={30} fill="#ffd27a" opacity={0.85} />);
  return <>{out}</>;
};

// ---------- scene 1: the dash, the phone, the text (0 -> 220) ----------
const SceneDash: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, T.b3], [1, 1.12], clamp);
  const buzzing = (f >= 4 && f < 30) || (f >= T.b2 + 52 && f < T.b2 + 78);
  const shake = buzzing ? Math.sin(f * 2.7) * 7 : 0;
  const wipe = (s: number) => (f >= s && f < s + 30 ? Math.sin((Math.PI * (f - s)) / 30) : 0);
  const sweep = Math.max(wipe(T.b2 + 22), wipe(T.b2 + 66));
  const shrug = interpolate(f, [T.b2 + 70, T.b2 + 78, T.b2 + 92], [0, 1, 0.8], clamp);
  return (
    <Svg>
      <g transform={`translate(540,1000) scale(${push}) translate(-540,-1000)`}>
        <FacetBg w={1080} h={1250} top="#1c2158" bot="#f08a5c" cols={9} rows={10} seed={4} />
        <P pts={[[390, 1180], [440, 1040], [490, 1180]]} fill="#ffc27a" opacity={0} />
        <circle cx={540} cy={1130} r={150} fill="#ffc98a" opacity={0.55} />
        {/* far skyline */}
        {[[40, 150, 260], [190, 120, 200], [310, 190, 330], [500, 140, 240], [640, 170, 300], [810, 130, 220], [940, 160, 280]].map(([bx, bw, bh], i) => (
          <g key={i}>
            <P pts={[[bx, 1250], [bx, 1250 - bh], [bx + bw, 1250 - bh + 20], [bx + bw, 1250]]} fill={i % 2 ? "#3a2a5e" : "#2f2554"} />
            <P pts={[[bx + bw, 1250], [bx + bw, 1250 - bh + 20], [bx + bw + 30, 1250 - bh + 50], [bx + bw + 30, 1250]]} fill="#241c44" />
            <Windows x={bx} y={1250 - bh + 30} w={bw} h={bh - 40} seed={i * 11 + 3} on={0.3} />
          </g>
        ))}
        <FacetBg y={1190} w={1080} h={80} top="#4a4468" bot="#2a2646" cols={12} rows={2} seed={8} />
      </g>
      {/* windshield frame and wipers */}
      <P pts={[[0, 0], [150, 0], [60, 1300], [0, 1300]]} fill="#0f1426" />
      <P pts={[[1080, 0], [930, 0], [1020, 1300], [1080, 1300]]} fill="#0f1426" />
      {[250, 620].map((px) => (
        <g key={px} transform={`rotate(${-5 - sweep * 68},${px},1270)`}>
          <P pts={[[px, 1264], [px + 440, 1272], [px + 440, 1284], [px, 1278]]} fill="#05070f" />
        </g>
      ))}
      <FacetBg y={1260} w={1080} h={660} top="#1a2038" bot="#0d1122" cols={9} rows={6} seed={21} shade={0.06} />
      <P pts={[[0, 1260], [1080, 1260], [1080, 1300], [0, 1300]]} fill="#0b0f1d" />
      {/* phone on the dash */}
      <g transform={`translate(${300 + shake},${560}) rotate(-3,240,430)`}><Phone frame={f} /></g>
      <Pro x={-60} y={1480} scale={1.05} shrug={shrug} tilt={shrug * -7} />
    </Svg>
  );
};

// ---------- scene 2: the drive across town (220 -> 294) ----------
const Van: React.FC<{ bob: number; spin: number }> = ({ bob, spin }) => (
  <g transform={`translate(260,${1010 + bob})`}>
    <P pts={[[0, 90], [400, 90], [400, 250], [0, 250]]} fill="#e8e6ee" />
    <P pts={[[0, 90], [200, 90], [100, 250], [0, 250]]} fill="#f6f4fa" />
    <P pts={[[200, 90], [400, 90], [400, 250], [100, 250]]} fill="#d6d4e0" />
    <P pts={[[400, 110], [470, 110], [545, 185], [545, 250], [400, 250]]} fill="#cfcdd9" />
    <P pts={[[430, 124], [468, 124], [518, 178], [430, 178]]} fill="#5d89c9" />
    <P pts={[[468, 124], [518, 178], [490, 178]]} fill="#8fb3e8" />
    <P pts={[[0, 196], [545, 196], [545, 214], [0, 214]]} fill="#ea6b14" />
    {[[40, 40, 330], [80, 40, 330]].map(([_, y0], i) => <rect key={i} x={30} y={62 - i * 16 + 6} width={360} height={9} fill="#2a2f4a" />)}
    <rect x={60} y={44} width={300} height={10} rx={5} fill="#b9bdd0" /><rect x={60} y={30} width={240} height={10} rx={5} fill="#d9a07a" />
    {[110, 440].map((wx) => (
      <g key={wx} transform={`translate(${wx},252)`}>
        <circle r={50} fill="#14172a" />
        <g transform={`rotate(${spin})`}>
          {[0, 60, 120, 180, 240, 300].map((a) => <P key={a} pts={[[0, 0], [Math.cos((a * Math.PI) / 180) * 36, Math.sin((a * Math.PI) / 180) * 36], [Math.cos(((a + 30) * Math.PI) / 180) * 36, Math.sin(((a + 30) * Math.PI) / 180) * 36]]} fill={a % 120 ? "#8e93ad" : "#b9bdd0"} />)}
        </g>
      </g>
    ))}
    <P pts={[[545, 215], [556, 212], [556, 232], [545, 232]]} fill="#ffe29a" />
  </g>
);

const SceneDrive: React.FC = () => {
  const f = useCurrentFrame();
  const u = interpolate(f, [T.b3, DOOR - 4], [0, 1], clamp);
  const dist = 2400 * (1 - (1 - u) * (1 - u));
  const speed = 1 - u;
  const row = (period: number, k: number, render: (i: number) => React.ReactNode) => {
    const off = (dist * k) % period;
    return [-1, 0, 1, 2].map((m) => <g key={m} transform={`translate(${m * period - off},0)`}>{render(m)}</g>);
  };
  return (
    <Svg>
      <FacetBg w={1080} h={1150} top="#1c2158" bot="#f08a5c" cols={9} rows={9} seed={6} />
      <circle cx={760} cy={1010} r={140} fill="#ffc98a" opacity={0.5} />
      {row(1080, 0.25, () => [[30, 140, 330], [200, 180, 250], [420, 130, 390], [590, 190, 280], [810, 150, 340]].map(([bx, bw, bh], i) => (
        <g key={i}>
          <P pts={[[bx, 1150], [bx, 1150 - bh], [bx + bw, 1150 - bh + 18], [bx + bw, 1150]]} fill={i % 2 ? "#4a3a78" : "#3d3068"} />
          <Windows x={bx} y={1150 - bh + 24} w={bw} h={bh - 30} seed={i * 9 + 5} on={0.25} />
        </g>
      )))}
      {row(1080, 0.6, () => [[0, 210, 470], [250, 170, 340], [470, 230, 520], [740, 180, 380], [950, 130, 430]].map(([bx, bw, bh], i) => (
        <g key={i}>
          <P pts={[[bx, 1180], [bx, 1180 - bh], [bx + bw, 1180 - bh + 24], [bx + bw, 1180]]} fill={i % 2 ? "#2d2350" : "#251c44"} />
          <P pts={[[bx + bw, 1180], [bx + bw, 1180 - bh + 24], [bx + bw + 34, 1180 - bh + 60], [bx + bw + 34, 1180]]} fill="#1a1333" />
          <Windows x={bx} y={1180 - bh + 40} w={bw} h={bh - 60} seed={i * 17 + 9} on={0.45} />
        </g>
      )))}
      <FacetBg y={1190} w={1080} h={120} top="#4b476b" bot="#33304f" cols={12} rows={2} seed={3} />
      <FacetBg y={1300} w={1080} h={620} top="#2c2a45" bot="#141228" cols={10} rows={7} seed={13} />
      {row(1080, 1, () => [0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i * 180 + 20} y={1442} width={100} height={12} fill="#ffd27a" opacity={0.7} />))}
      {row(1080, 1, () => [0, 1].map((i) => (
        <g key={i}>
          <rect x={i * 540 + 250} y={820} width={10} height={400} fill="#14182e" />
          <circle cx={i * 540 + 255} cy={816} r={34} fill="#ffd27a" opacity={0.35} /><circle cx={i * 540 + 255} cy={816} r={14} fill="#ffe9a8" />
        </g>
      )))}
      <Van bob={Math.sin(f / 2.4) * 5 * speed} spin={dist / 1.1} />
    </Svg>
  );
};

// ---------- scene 3: the front door opens onto the basement stairs (286 -> 342) ----------
const SceneDoor: React.FC = () => {
  const f = useCurrentFrame();
  const open = interpolate(f, [DOOR + 8, DOOR + 30], [1, 0.1], clamp);
  const push = interpolate(f, [DOOR + 10, T.b4 + 8], [1, 1.35], clamp);
  return (
    <Svg>
      <FacetBg w={1080} h={1920} top="#2c2147" bot="#4a3358" cols={7} rows={12} seed={15} shade={0.08} />
      <g transform={`translate(540,1100) scale(${push}) translate(-540,-1100)`}>
        <P pts={[[270, 600], [810, 600], [810, 1540], [270, 1540]]} fill="#150f26" />
        {[0, 1, 2, 3, 4, 5, 6].map((k) => {
          const x0 = 310 + k * 22, x1 = 770 - k * 22, y0 = 980 + k * 70;
          return (
            <g key={k}>
              <P pts={[[x0, y0], [x1, y0], [x1 - 10, y0 + 28], [x0 + 10, y0 + 28]]} fill={rgb(mixc("#6f6a92", "#1a1530", k / 7))} />
              <P pts={[[x0 + 10, y0 + 28], [x1 - 10, y0 + 28], [x1 - 22, y0 + 70], [x0 + 22, y0 + 70]]} fill={rgb(mixc("#3b3560", "#0e0a1c", k / 7))} />
            </g>
          );
        })}
        <P pts={[[270, 600], [810, 600], [790, 640], [290, 640]]} fill="#6a4a38" />
        <P pts={[[270, 600], [290, 640], [290, 1540], [270, 1540]]} fill="#5a3d2e" />
        <P pts={[[810, 600], [810, 1540], [790, 1540], [790, 640]]} fill="#5a3d2e" />
        {/* warm light spilling from the hallway on the top step */}
        <P pts={[[330, 980], [750, 980], [770, 1060], [310, 1060]]} fill="#ffd27a" opacity={0.12} />
        {/* the door leaf swings away from its left hinge */}
        <g transform={`translate(272,0) scale(${open},1) translate(-272,0)`}>
          <P pts={[[272, 640], [800, 640], [800, 1540], [272, 1540]]} fill="#8a5a36" />
          <P pts={[[272, 640], [536, 640], [272, 1090]]} fill="#9d6a42" />
          <P pts={[[536, 640], [800, 640], [800, 1090], [536, 1540], [272, 1540], [272, 1090]]} fill="#7a4d2c" opacity={0.55} />
          <circle cx={740} cy={1100} r={20} fill="#ffd27a" />
        </g>
      </g>
    </Svg>
  );
};

// ---------- scene 4: stain on the ceiling, drip trail up the stairs (334 -> 467) ----------
const SceneStain: React.FC = () => {
  const f = useCurrentFrame() - T.b4;
  const pan = interpolate(f, [58, 108], [-680, 0], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const beam = interpolate(f, [58, 108], [26, 40], clamp);
  const dropT = (f - 8) % 34;
  const trail = [[960, 2200], [925, 2090], [890, 1980], [855, 1870], [820, 1760], [785, 1650], [750, 1540], [715, 1430], [690, 1320], [660, 1262]];
  const trailOn = (i: number) => 66 + i * 4.5;
  return (
    <Svg>
      <g transform={`translate(0,${pan})`}>
        {/* upstairs hallway, warm */}
        <FacetBg y={0} w={1080} h={1250} top="#3c2d56" bot="#6b4a5e" cols={7} rows={9} seed={31} shade={0.08} />
        <P pts={[[560, 380], [860, 380], [860, 1250], [560, 1250]]} fill="#241a36" />
        <P pts={[[580, 400], [840, 400], [840, 1250], [580, 1250]]} fill="#7a5a3e" />
        <P pts={[[580, 400], [840, 400], [580, 820]]} fill="#8d6847" />
        <circle cx={800} cy={860} r={16} fill="#ffd27a" />
        <rect x={650} y={500} width={120} height={120} rx={22} fill="#5d89c9" opacity={0.7} />
        <P pts={[[670, 580], [750, 580], [740, 560], [680, 560]]} fill="#cfe4ff" opacity={0.9} />
        {/* floor upstairs, then the stairwell down to the basement */}
        <FacetBg y={1250} w={1080} h={120} top="#2a2038" bot="#1a1428" cols={9} rows={2} seed={5} />
        <FacetBg y={1370} w={1080} h={1230} top="#161c34" bot="#0b0f20" cols={7} rows={9} seed={44} shade={0.07} />
        {/* stairs */}
        {Array.from({ length: 10 }).map((_, k) => (
          <g key={k}>
            <P pts={[[640 + k * 36 + 10, 1262 + k * 110], [1080, 1262 + k * 110], [1080, 1262 + k * 110 + 24], [640 + k * 36 + 10, 1262 + k * 110 + 24]]} fill="#6c6590" />
            <P pts={[[640 + k * 36 + 10, 1286 + k * 110], [1080, 1286 + k * 110], [1080, 1372 + k * 110], [640 + k * 36 + 10, 1372 + k * 110]]} fill="#3a3560" />
          </g>
        ))}
        {/* ceiling stain, a ragged dark patch with a wet shine */}
        <P pts={[[330, 1560], [420, 1520], [540, 1530], [650, 1520], [740, 1570], [700, 1650], [610, 1700], [500, 1680], [400, 1700], [340, 1640]]} fill="#0d1224" />
        <P pts={[[420, 1560], [540, 1545], [640, 1560], [610, 1640], [500, 1660], [430, 1620]]} fill="#26304f" />
        <P pts={[[470, 1575], [560, 1565], [560, 1600], [480, 1610]]} fill="#4a5a8a" opacity={0.6} />
        {/* drip falling from the stain to a puddle on the floor */}
        <ellipse cx={540} cy={2310} rx={90} ry={16} fill="#6bb3e6" opacity={0.55} />
        {dropT >= 0 && dropT < 20 ? <ellipse cx={540} cy={1690 + (dropT / 20) * (dropT / 20) * 600} rx={12} ry={18} fill="#8ec9ff" /> : null}
        {dropT >= 20 && dropT < 30 ? <ellipse cx={540} cy={2308} rx={20 + (dropT - 20) * 8} ry={5 + (dropT - 20) * 1.4} fill="none" stroke="#8ec9ff" strokeWidth={4} opacity={1 - (dropT - 20) / 10} /> : null}
        {/* the trail of drops, up the stairs and along the hall to the bathroom door */}
        {trail.map(([tx, ty], i) => {
          const s = interpolate(f, [trailOn(i), trailOn(i) + 5], [0, 1], clamp);
          return <ellipse key={i} cx={tx} cy={ty} rx={22 * s} ry={13 * s} fill="#8ec9ff" />;
        })}
      </g>
      {/* torch light, screen-fixed, from the pro at the bottom left */}
      <g transform={`translate(110,1800) rotate(${beam})`}>
        <P pts={[[-14, 0], [-230, -1700], [230, -1700], [14, 0]]} fill="#ffe9a8" opacity={f > 4 ? 0.2 : 0} />
      </g>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 20% 90%, rgba(10,14,30,0) 0%, rgba(10,14,30,.55) 70%)" }} />
      <Pro x={-40} y={1560} scale={0.85} />
      <P pts={[[196, 1832], [316, 1832], [316, 1904], [196, 1904]]} fill="#3a4a6a" />
      <P pts={[[196, 1832], [316, 1832], [300, 1812], [212, 1812]]} fill="#6a7a9a" />
    </Svg>
  );
};

// ---------- scene 5: hours spin by, the pro is still under the sink (459 -> 580) ----------
const SceneHours: React.FC = () => {
  const f = useCurrentFrame() - T.b5;
  const dusk = interpolate(f, [0, 85], [0, 1], clamp);
  const minute = f * 21, hour = f * 21 / 12;
  const hand = (len: number, ang: number, w: number) => (
    <g transform={`rotate(${ang},800,690)`}><P pts={[[800 - w, 690], [800, 690 - len], [800 + w, 690]]} fill="#14182e" /></g>
  );
  const dropT = (f + 10) % 30;
  return (
    <Svg>
      <FacetBg w={1080} h={1920} top="#1d2a47" bot="#2e4a62" cols={7} rows={12} seed={52} shade={0.07} />
      {/* window: dusk turning to dark */}
      <rect x={70} y={500} width={360} height={440} rx={14} fill="#0d1224" />
      <g>
        <clipPath id="win"><rect x={86} y={516} width={328} height={408} rx={8} /></clipPath>
        <g clipPath="url(#win)">
          <FacetBg x={86} y={516} w={328} h={408} top={rgb(mixc("#2a3170", "#080b1a", dusk))} bot={rgb(mixc("#f08a5c", "#101736", dusk))} cols={4} rows={5} seed={9} />
          <circle cx={250} cy={860 + dusk * 120} r={70} fill="#ffc98a" opacity={0.5 * (1 - dusk)} />
        </g>
      </g>
      <rect x={246} y={516} width={8} height={408} fill="#0d1224" />
      {/* big clock, hands racing */}
      <circle cx={800} cy={690} r={190} fill="#0d1224" />
      <circle cx={800} cy={690} r={170} fill="#f4f1ea" />
      {Array.from({ length: 12 }).map((_, i) => <g key={i} transform={`rotate(${i * 30},800,690)`}><rect x={794} y={534} width={12} height={i % 3 ? 22 : 36} fill="#14182e" /></g>)}
      {hand(120, hour, 11)}
      {hand(150, minute, 7)}
      <circle cx={800} cy={690} r={14} fill="#ea6b14" />
      {/* vanity with the doors open, pipe under the sink */}
      <P pts={[[230, 1130], [850, 1130], [850, 1700], [230, 1700]]} fill="#3a2f55" />
      <P pts={[[230, 1130], [540, 1130], [230, 1700]]} fill="#4a3d6a" />
      <P pts={[[250, 1160], [830, 1160], [830, 1680], [250, 1680]]} fill="#150f26" />
      <P pts={[[200, 1060], [880, 1060], [850, 1130], [230, 1130]]} fill="#e6e8f2" />
      <P pts={[[330, 1000], [750, 1000], [730, 1060], [350, 1060]]} fill="#b9c0d8" />
      <P pts={[[520, 940], [560, 940], [560, 1000], [520, 1000]]} fill="#8e93ad" />
      <rect x={640} y={1160} width={26} height={140} fill="#8e93ad" /><rect x={560} y={1290} width={106} height={26} fill="#8e93ad" />
      <rect x={555} y={1290} width={14} height={50} fill="#ea6b14" />
      {dropT < 22 ? <ellipse cx={562} cy={1350 + (dropT / 22) * (dropT / 22) * 250} rx={9} ry={14} fill="#8ec9ff" /> : null}
      <ellipse cx={562} cy={1612} rx={46} ry={9} fill="#6bb3e6" opacity={0.5} />
      <Pro x={120} y={1380} scale={0.95} tilt={-6} />
      {/* open toolbox on the floor */}
      <P pts={[[700, 1640], [1000, 1640], [1020, 1760], [680, 1760]]} fill="#c0442a" />
      <P pts={[[700, 1640], [850, 1640], [680, 1760]]} fill="#d95a3a" />
      <P pts={[[720, 1600], [800, 1600], [800, 1640], [720, 1640]]} fill="#b9bdd0" />
      <P pts={[[830, 1580], [850, 1580], [850, 1640], [830, 1640]]} fill="#d9a07a" />
      <P pts={[[880, 1610], [980, 1610], [980, 1640], [880, 1640]]} fill="#8e93ad" />
      <AbsoluteFill style={{ background: `rgba(6,9,22,${dusk * 0.35})` }} />
    </Svg>
  );
};

// ---------- the phone returns on the closing card ----------
const EndPhone: React.FC = () => {
  const f = useCurrentFrame() - T.end;
  const { fps } = useVideoConfig();
  if (f < 0) return null;
  const s = spring({ frame: f, fps, config: { damping: 12 } });
  const wob = f > 40 ? Math.sin(f * 2.2) * 3 * Math.exp(-(f - 40) / 20) : 0;
  return (
    <Svg>
      <g transform={`translate(${540 + wob},300) scale(${0.36 * s}) translate(-240,-10)`}>
        <g transform="translate(0,0)"><Phone frame={T.b2 - 100} /></g>
      </g>
    </Svg>
  );
};

export const Leak: React.FC = () => {
  const frame = useCurrentFrame();
  const voice = [0, T.b2, T.b3, T.b4, T.b5, T.end].map((s) => s + 10);
  const ticks = Array.from({ length: 16 }, (_, i) => T.b5 + 6 + i * 6);
  return (
    <AbsoluteFill style={{ background: "#1c2158" }}>
      <Fade from={0} to={T.b3 + 7}><SceneDash /></Fade>
      <Fade from={T.b3} to={DOOR + 7}><SceneDrive /></Fade>
      <Fade from={DOOR} to={T.b4 + 7}><SceneDoor /></Fade>
      <Fade from={T.b4} to={T.b5 + 7}><SceneStain /></Fade>
      <Fade from={T.b5} to={T.total}><SceneHours /></Fade>
      <AbsoluteFill style={{ background: "linear-gradient(rgba(15,21,36,.7) 0%, rgba(15,21,36,.4) 20%, rgba(15,21,36,0) 38%)" }} />

      <Caption text="The job text: “Leak.”" from={0} to={T.b2} size={108} />
      <Caption text="“Where?” “Kitchen. Or bathroom.”" from={T.b2} to={T.b3} size={92} />
      <Caption text="Turns out: the basement." from={T.b3} to={T.b4} size={112} />
      <Caption text="The leak is upstairs." from={T.b4} to={T.b5} size={112} />
      <Caption text="“Quick fix, right?”" from={T.b5} to={T.end} size={118} />
      <CommentCard from={T.end} question="Tag your crew mate." prompt="Tag them below" />
      {frame >= T.end ? <EndPhone /> : null}

      {voice.map((at, i) => <VoiceClip key={i} name="leak" n={i + 1} at={at} />)}

      {/* sound made for this video (tools/sfx/leak.py): a phone, a van, a door, a torch, a clock */}
      <Sfx name="leak/buzz" at={4} volume={0.55} />
      <Sfx name="leak/pop" at={T.b2 + 12} volume={0.5} />
      <Sfx name="leak/wiper" at={T.b2 + 22} volume={0.4} />
      <Sfx name="leak/wiper" at={T.b2 + 66} volume={0.4} />
      <Sfx name="leak/buzz" at={T.b2 + 52} volume={0.5} />
      <Sfx name="leak/pop2" at={T.b2 + 54} volume={0.45} />
      <Sfx name="leak/engine" at={T.b3} volume={0.35} />
      <Sfx name="leak/squeak" at={DOOR - 10} volume={0.3} />
      <Sfx name="leak/creak" at={DOOR + 8} volume={0.45} />
      <Sfx name="leak/click" at={T.b4 + 4} volume={0.5} />
      {[8, 42, 76, 110].map((d) => <Sfx key={d} name="leak/plink" at={T.b4 + d + 20} volume={0.4} />)}
      {Array.from({ length: 10 }).map((_, i) => <Sfx key={i} name="leak/tip" at={T.b4 + 66 + Math.round(i * 4.5)} volume={0.3} />)}
      <Sfx name="leak/whoosh" at={T.b5 + 2} volume={0.35} />
      {ticks.map((tk, i) => <Sfx key={i} name="leak/tick" at={tk} volume={0.25} />)}
      {[0, 30, 60].map((d) => <Sfx key={d} name="leak/plink" at={T.b5 + d + 14} volume={0.3} />)}
      <Sfx name="leak/ding" at={T.end + 4} volume={0.5} />
      <Progress />
    </AbsoluteFill>
  );
};
export const leakFrames = T.total;
