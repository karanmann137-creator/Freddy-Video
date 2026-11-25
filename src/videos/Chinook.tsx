// "Phone won't stop buzzing" — comparison type, painted: watercolor. One kitchen (rain, then warm morning) and the front door.
// Pictures come from tools/art/paint_chinook.py; people, phone, list, coins and jar are drawn here and move over them.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, CommentCard, Progress, Sfx, VoiceClip, clamp, FONT, C } from "../kit";

const art = (n: string) => staticFile(`art/chinook/${n}.jpg`);
const HAND = "Comic Relief, Comic Sans MS, cursive";
const ease = Easing.inOut(Easing.cubic);

// where each spoken clip starts (frames). Lengths from tools/tts.py: 145 56 32 32 40 41 163 125 123 122 39 81 143 183 145 123
const V = [10, 175, 243, 285, 327, 377, 445, 626, 769, 910, 1075, 1130, 1229, 1390, 1591, 1790];
const B = { list: 165, person: 430, calls: 620, door: 762, tired: 903, turn: 1060, warm: 1122, est: 1222, pick: 1383, jar: 1584, end: 1768, total: 1940 };
export const chinookFrames = B.total;

// ---- camera: keys of [frame, centre x, centre y, scale] in picture coordinates (1080 x 1920) ----
type Key = [number, number, number, number];
const cam = (frame: number, keys: Key[]) => {
  let a = keys[0], b = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) if (frame >= keys[i][0] && frame <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
  if (frame <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], s: keys[0][3] };
  if (frame >= keys[keys.length - 1][0]) { const k = keys[keys.length - 1]; return { x: k[1], y: k[2], s: k[3] }; }
  const f = (frame - a[0]) / (b[0] - a[0]);
  const e = ease(f);
  return { x: a[1] + (b[1] - a[1]) * e, y: a[2] + (b[2] - a[2]) * e, s: a[3] + (b[3] - a[3]) * e };
};
const KITCHEN: Key[] = [
  [0, 540, 980, 1.0], [B.list, 610, 1060, 1.3], [215, 400, 720, 1.4], [B.person, 360, 700, 1.5], [480, 540, 1000, 1.15], [B.calls, 560, 980, 1.3],
  [660, 640, 1120, 1.5], [B.door - 1, 650, 1100, 1.8],
  [B.tired, 560, 1050, 1.2], [960, 500, 980, 1.15], [B.turn, 380, 760, 1.4], [1100, 540, 960, 1.0],
  [B.warm, 540, 980, 1.0], [B.pick, 540, 940, 1.15], [1480, 560, 1180, 1.5], [1650, 560, 1150, 1.5], [1740, 370, 730, 1.4], [B.end, 370, 730, 1.4], [1800, 540, 960, 1.0],
];
const DOOR: Key[] = [[B.door, 540, 900, 1.0], [B.tired, 540, 1000, 1.3]];

const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---- rain over a rectangle of the picture ----
const Rain: React.FC<{ x0: number; y0: number; x1: number; y1: number; n: number; opacity: number }> = ({ x0, y0, x1, y1, n, opacity }) => {
  const frame = useCurrentFrame();
  if (opacity <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x0, top: y0, width: x1 - x0, height: y1 - y0, overflow: "hidden", opacity }}>
      {Array.from({ length: n }).map((_, i) => {
        const sp = 18 + rnd(i) * 14, len = 36 + rnd(i + 9) * 50, x = rnd(i + 3) * (x1 - x0);
        const y = ((frame * sp + rnd(i + 5) * 1000) % (y1 - y0 + len)) - len;
        return <div key={i} style={{ position: "absolute", left: x + y * 0.08, top: y, width: 3, height: len, background: "rgba(235,242,250,.75)", borderRadius: 2, transform: "rotate(-5deg)" }} />;
      })}
    </div>
  );
};

// ---- the handwritten list on the fridge ----
const LIST = ["Leaky tap", "Sticky door", "Loose towel bar", "Caulk around the tub"];
const WRITE = [V[2], V[3], V[4], V[5]];
const TICK = [1688, 1704, 1720, 1736];
const ListPaper: React.FC<{ scale?: number; ticks?: boolean }> = ({ scale = 1, ticks = false }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 117, top: 478, width: 240, height: 400, transform: `rotate(-2deg) scale(${scale})`, transformOrigin: "50% 0%" }}>
      {LIST.map((t, i) => {
        const w = interpolate(frame, [WRITE[i], WRITE[i] + 20], [0, 100], { ...clamp, easing: Easing.out(Easing.quad) });
        const tk = ticks ? interpolate(frame, [TICK[i], TICK[i] + 8], [0, 1], clamp) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: 16, top: 28 + i * 82, width: 215, fontFamily: HAND, fontSize: 31, lineHeight: 1.12, color: "#3b3a44" }}>
            <div style={{ clipPath: `inset(0 ${100 - w}% 0 0)`, textDecoration: tk > 0.5 ? "line-through" : "none", textDecorationColor: "#2f9d52", textDecorationThickness: 3 }}>{t}</div>
            {tk > 0 ? <svg width="46" height="40" viewBox="0 0 46 40" style={{ position: "absolute", left: 150 + (i === 3 ? 30 : i === 2 ? 20 : 0), top: -6 }}>
              <path d="M4 22 L17 35 L42 5" fill="none" stroke="#2f9d52" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - tk)} /></svg> : null}
          </div>
        );
      })}
    </div>
  );
};

// ---- the person (poses blend, so a shrug or a slump is a move, not a swap) ----
type Pose = { headDy: number; tilt: number; body: number; lA: number[]; rA: number[]; mouth: number };
const POSES: Record<string, Pose> = {
  stand: { headDy: 0, tilt: 0, body: 0, lA: [-150, 150, -120, 250], rA: [150, 150, 120, 250], mouth: 0.3 },
  hold: { headDy: 0, tilt: -3, body: 0, lA: [-165, 140, -90, 70], rA: [165, 150, 110, 215], mouth: 0 },
  shrug: { headDy: 14, tilt: 6, body: -8, lA: [-210, 130, -225, 40], rA: [210, 130, 225, 40], mouth: -0.3 },
  slump: { headDy: 215, tilt: 14, body: 150, lA: [-170, 170, 40, 120], rA: [170, 170, -40, 120], mouth: -0.6 },
  happy: { headDy: -4, tilt: 0, body: 0, lA: [-160, 160, -70, 200], rA: [160, 160, 70, 200], mouth: 1 },
  type: { headDy: 10, tilt: 0, body: 0, lA: [-170, 190, -80, 260], rA: [170, 190, 80, 260], mouth: 0.4 },
};
const mixPose = (a: string, b: string, t: number): Pose => {
  const A = POSES[a], B2 = POSES[b], m = (x: number, y: number) => x + (y - x) * t, arr = (p: number[], q: number[]) => p.map((v, i) => m(v, q[i]));
  return { headDy: m(A.headDy, B2.headDy), tilt: m(A.tilt, B2.tilt), body: m(A.body, B2.body), lA: arr(A.lA, B2.lA), rA: arr(A.rA, B2.rA), mouth: m(A.mouth, B2.mouth) };
};
const Person: React.FC<{ x: number; y: number; pose: Pose; shirt: string; holdList?: boolean }> = ({ x, y, pose, shirt, holdList }) => {
  const SK = "#e3ae86", HAIR = "#3c2a24", dark = "#00000022";
  const sh = 40 + pose.body;
  const arm = (a: number[], sx: number) => `M${sx},${sh} L${a[0]},${a[1] + pose.body} L${a[2]},${a[3] + pose.body}`;
  return (
    <svg width={700} height={700} viewBox="-350 -250 700 700" style={{ position: "absolute", left: x - 350, top: y - 250, overflow: "visible" }}>
      <path d={`M-140,${sh + 10} Q-140,${sh - 40} -90,${sh - 45} L90,${sh - 45} Q140,${sh - 40} 140,${sh + 10} L152,${sh + 330} L-152,${sh + 330} Z`} fill={shirt} stroke={dark} strokeWidth={3} />
      <rect x={-24} y={sh - 70} width={48} height={40} rx={12} fill={SK} />
      <path d={arm(pose.lA, -118)} fill="none" stroke={shirt} strokeWidth={56} strokeLinecap="round" strokeLinejoin="round" />
      <path d={arm(pose.rA, 118)} fill="none" stroke={shirt} strokeWidth={56} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pose.lA[2]} cy={pose.lA[3] + pose.body} r={30} fill={SK} />
      <circle cx={pose.rA[2]} cy={pose.rA[3] + pose.body} r={30} fill={SK} />
      {holdList ? <g transform={`translate(${pose.lA[2] - 10},${pose.lA[3] + pose.body - 70}) rotate(-6)`}>
        <rect x={-55} y={-60} width={110} height={140} rx={4} fill="#fffdf5" stroke="#8a7f6c" strokeWidth={3} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={-38} y={-38 + i * 28} width={76 - (i === 3 ? 18 : i * 5)} height={7} rx={3} fill="#3b3a44" opacity={0.7} />)}
        <circle cx={pose.lA[2] > -100 ? 40 : -40} cy={75} r={30} fill={SK} opacity={0} />
      </g> : null}
      <g transform={`translate(0,${pose.headDy + pose.body}) rotate(${pose.tilt} 0 -40)`}>
        <ellipse cx={0} cy={-100 + sh - 40} rx={62} ry={70} fill={SK} stroke={dark} strokeWidth={3} />
        <ellipse cx={-62} cy={-92 + sh - 40} rx={9} ry={14} fill={SK} /><ellipse cx={62} cy={-92 + sh - 40} rx={9} ry={14} fill={SK} />
        <path d={`M-66,${-100 + sh - 40} Q-66,${-190 + sh - 40} 0,${-188 + sh - 40} Q66,${-190 + sh - 40} 66,${-100 + sh - 40} Q40,${-152 + sh - 40} -8,${-150 + sh - 40} Q-46,${-142 + sh - 40} -66,${-100 + sh - 40} Z`} fill={HAIR} />
        <circle cx={-22} cy={-98 + sh - 40} r={5.5} fill="#2b2430" /><circle cx={22} cy={-98 + sh - 40} r={5.5} fill="#2b2430" />
        <path d={`M-36,${-118 + sh - 40 - pose.mouth * -4} L-10,${-122 + sh - 40}`} stroke={HAIR} strokeWidth={5} strokeLinecap="round" />
        <path d={`M36,${-118 + sh - 40 - pose.mouth * -4} L10,${-122 + sh - 40}`} stroke={HAIR} strokeWidth={5} strokeLinecap="round" />
        <path d={`M-18,${-62 + sh - 40} Q0,${-62 + sh - 40 + pose.mouth * 16} 18,${-62 + sh - 40}`} fill="none" stroke="#7a3b2e" strokeWidth={5} strokeLinecap="round" />
      </g>
    </svg>
  );
};

// ---- the phone on the counter (b1 and b4) ----
const CallPhone: React.FC<{ x: number; buzz: number; dim: number }> = ({ x, buzz, dim }) => {
  const frame = useCurrentFrame();
  const shake = buzz > 0 ? Math.sin(frame * 2.6) * 5 * buzz : 0;
  const rows = [0, 1, 2, 3, 4];
  return (
    <div style={{ position: "absolute", left: x - 95 + shake, top: 920, width: 190, height: 345, opacity: dim }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "#1d2230", boxShadow: "10px 14px 0 rgba(0,0,0,.18)" }} />
      <div style={{ position: "absolute", left: 10, top: 14, right: 10, bottom: 14, borderRadius: 18, background: dim < 1 ? "#232a3a" : "#f4f7fb", overflow: "hidden" }}>
        <div style={{ height: 38, background: "#d9534a", color: "#fff", fontFamily: FONT, fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>Calls</div>
        {rows.map((i) => {
          const pop = interpolate(frame, [4 + i * 7, 12 + i * 7], [0, 1], clamp);
          return <div key={i} style={{ height: 52, borderBottom: "1px solid #d5dbe4", display: "flex", alignItems: "center", padding: "0 10px", gap: 10, opacity: Math.max(pop, i < 2 ? 1 : 0) }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: "#9aa6b6" }} />
            <div style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 15, color: "#2b2f3a" }}>Unknown</div>
            <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: 10, background: "#d9534a" }} />
          </div>;
        })}
      </div>
    </div>
  );
};

// ---- coins, jar ----
const Coin: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 40 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r * 0.32, width: r * 2, height: r * 0.64 + 10 }}>
    <div style={{ position: "absolute", left: 0, top: 10, width: r * 2, height: r * 0.64, borderRadius: "50%", background: "#b8861f" }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: r * 2, height: r * 0.64, borderRadius: "50%", background: "#f2c14e", border: "3px solid #c99a2a", boxSizing: "border-box" }} />
  </div>
);
const Stack: React.FC<{ x: number; baseY: number; n: number; shown?: number }> = ({ x, baseY, n, shown }) => (
  <>{Array.from({ length: n }).map((_, i) => (shown === undefined || i < shown) ? <Coin key={i} x={x} y={baseY - i * 16} /> : null)}</>
);

// ---- phone screen (screen space): job card, estimates, pick ----
const AVATARS = ["#3f78c9", "#5b8f55", "#c4623f"];
const PhoneUI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = interpolate(frame, [B.warm + 2, B.warm + 28, 1455, 1488], [1, 0, 0, 1], { ...clamp, easing: ease });
  if (rise >= 1) return null;
  const typed = interpolate(frame, [B.warm + 24, B.warm + 80], [0, 1], clamp);
  const card = spring({ frame: frame - (B.warm + 84), fps, config: { damping: 12 } });
  const showCard = frame >= B.warm + 84;
  const estFrom = B.est + 6;
  const picked = frame >= 1424;
  return (
    <div style={{ position: "absolute", left: 170, top: 760 + rise * 1200, width: 740, height: 1300, borderRadius: 70, background: "#1d2230", boxShadow: "0 20px 0 rgba(0,0,0,.2)", padding: 22 }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 52, background: "#f8f5ee", overflow: "hidden", position: "relative" }}>
        <div style={{ height: 96, background: C.orange, color: "#fff", fontFamily: FONT, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>New job</div>
        {frame >= estFrom ? null : !showCard ? (
          <div style={{ margin: 34, padding: 26, borderRadius: 24, background: "#fff", border: "3px solid #d5dbe4", height: 330, fontFamily: HAND, fontSize: 44, color: "#3b3a44", lineHeight: 1.3 }}>
            {LIST.join(", ").slice(0, Math.round(LIST.join(", ").length * typed))}<span style={{ opacity: Math.floor(frame / 8) % 2 }}>|</span>
          </div>
        ) : (
          <div style={{ margin: "34px 34px 0", padding: 28, borderRadius: 28, background: "#fff", boxShadow: "0 8px 0 rgba(0,0,0,.08)", border: `4px solid ${C.orange}`, transform: `scale(${0.85 + card * 0.15})`, opacity: card }}>
            <div style={{ fontFamily: FONT, fontSize: 36, color: "#2b2f3a", marginBottom: 14 }}>Your job</div>
            {LIST.map((t, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: HAND, fontSize: 38, color: "#3b3a44", padding: "7px 0" }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: C.orange }} />{t}</div>)}
          </div>
        )}
        {frame >= estFrom ? (
          <div style={{ position: "absolute", left: 34, right: 34, top: 130 }}>
            {AVATARS.map((c, i) => {
              const s = spring({ frame: frame - estFrom - i * 14, fps, config: { damping: 13 } });
              const chosen = picked && i === 1;
              const grow = chosen ? interpolate(frame, [1424, 1436], [1, 1.05], clamp) : 1;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 24px", marginBottom: 22, borderRadius: 28, background: "#fff",
                  border: chosen ? `6px solid ${C.orange}` : "3px solid #d5dbe4", boxShadow: "0 8px 0 rgba(0,0,0,.08)", transform: `translateX(${(1 - s) * 800}px) scale(${grow})`, opacity: picked && !chosen ? 0.45 : 1 }}>
                  <div style={{ width: 96, height: 96, borderRadius: 48, background: c, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 22, width: "70%", borderRadius: 11, background: "#cfd6e0", marginBottom: 14 }} />
                    <div style={{ height: 16, width: "45%", borderRadius: 8, background: "#e4e8ee" }} />
                  </div>
                  <div style={{ background: C.orange, color: "#fff", fontFamily: FONT, fontSize: 46, padding: "10px 20px 10px 18px", borderRadius: "14px 30px 30px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    $<div style={{ width: 64, height: 18, borderRadius: 9, background: "rgba(255,255,255,.85)" }} /></div>
                </div>
              );
            })}
            {picked ? <div style={{ textAlign: "center", fontFamily: FONT, fontSize: 44, color: "#2f9d52", opacity: interpolate(frame, [1436, 1446], [0, 1], clamp) }}>Picked ✓</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
// a hand and forearm coming up from the bottom of the frame to tap the chosen estimate
const TapHand: React.FC = () => {
  const frame = useCurrentFrame();
  const up = interpolate(frame, [1396, 1420, 1426, 1446, 1470], [1, 0, 0.04, 0.04, 1], { ...clamp, easing: ease });
  if (up >= 1) return null;
  return (
    <svg width={260} height={900} viewBox="0 0 260 900" style={{ position: "absolute", left: 520, top: 1180 + up * 900 }}>
      <rect x={70} y={150} width={120} height={800} rx={50} fill="#2f7f86" />
      <rect x={78} y={60} width={104} height={160} rx={46} fill="#e3ae86" />
      <rect x={100} y={0} width={34} height={140} rx={17} fill="#e3ae86" />
    </svg>
  );
};

const Sign: React.FC<{ text: string; x: number; flipAt: number; color: string }> = ({ text, x, flipAt, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - flipAt, fps, config: { damping: 9 } });
  const bob = Math.sin(frame / 9 + x) * 6;
  const sx = Math.abs(Math.cos((1 - s) * Math.PI * 1.5)) * (1 - 0.0);
  return (
    <div style={{ position: "absolute", left: x - 110, top: 560 + bob, width: 220, height: 78, borderRadius: 14, background: color, border: "4px solid #00000030", color: "#fff", fontFamily: FONT, fontSize: 34,
      display: "flex", alignItems: "center", justifyContent: "center", transform: `scaleX(${Math.max(0.02, sx)}) rotate(${(1 - s) * 12}deg)`, opacity: s > 0 ? 1 : 0, boxShadow: "6px 8px 0 rgba(0,0,0,.18)" }}>{text}</div>
  );
};

const Bubble: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < 0 || f > 48) return null;
  const s = spring({ frame: f, fps, config: { damping: 9 } });
  const out = interpolate(f, [36, 48], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x - 45, top: y - 130 - f * 1.2, width: 90, height: 90, borderRadius: 45, background: "#fff", border: "4px solid #d9534a", color: "#d9534a", fontFamily: FONT, fontSize: 64,
      display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s})`, opacity: out, boxShadow: "5px 7px 0 rgba(0,0,0,.15)" }}>?</div>
  );
};

export const Chinook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inDoor = frame >= B.door && frame < B.tired;
  const c = cam(frame, inDoor ? DOOR : KITCHEN);
  const world = `translate(540px,960px) scale(${c.s}) translate(${-c.x}px,${-c.y}px)`;

  const warm = interpolate(frame, [1085, 1122], [0, 1], clamp);
  const rainOp = interpolate(frame, [1050, 1088], [1, 0], clamp);

  // the phone: slides across the counter with each buzz in b1, rings again in b4, goes quiet at the turn
  const buzzTimes = [6, 58, 110, 628, 668, 708];
  const buzzNow = buzzTimes.some((b) => frame >= b && frame < b + 18) ? 1 : 0;
  const phoneX = interpolate(frame, [0, 165, 620, 760], [520, 700, 700, 760], clamp);
  const phoneDim = interpolate(frame, [B.turn, B.turn + 22], [1, 0], clamp) * (frame < B.door ? 1 : frame >= B.tired ? 1 : 0);
  const phoneOn = frame < B.door || (frame >= B.tired && frame < B.turn + 22);

  // the person
  let pose: Pose = POSES.stand;
  if (frame < B.list) pose = POSES.stand;
  else if (frame < B.person) pose = mixPose("stand", "hold", interpolate(frame, [B.list, B.list + 40], [0, 1], clamp));
  else if (frame < B.calls) pose = mixPose("hold", "shrug", interpolate(frame, [500, 530], [0, 1], { ...clamp, easing: ease })) as Pose;
  else if (frame < B.tired) pose = mixPose("shrug", "hold", interpolate(frame, [B.calls, B.calls + 30], [0, 1], clamp));
  else if (frame < 1080) pose = mixPose("hold", "slump", interpolate(frame, [B.tired + 6, B.tired + 50], [0, 1], { ...clamp, easing: ease }));
  else if (frame < B.warm) pose = mixPose("slump", "happy", interpolate(frame, [1072, 1110], [0, 1], { ...clamp, easing: ease }));
  else pose = mixPose("happy", "type", interpolate(frame, [B.warm, B.warm + 20], [0, 1], clamp));
  const holdList = frame >= B.person - 10 && frame < 1080 && !(frame >= B.tired + 30);
  const shirt = frame < 1100 ? "#d9a441" : "#2f7f86";
  const personShown = !inDoor;

  const listScale = interpolate(frame, [960, 1010, 1058], [1, 1.5, 1.5], { ...clamp, easing: ease });
  const listVisible = frame < B.person - 10 || frame >= B.tired;
  const ticks = frame >= 1650;

  // coin choreography (b10 second half to b11)
  const coinDrop = interpolate(frame, [1498, 1520], [-500, 0], { ...clamp, easing: Easing.in(Easing.quad) });
  const split = interpolate(frame, [1522, 1548], [0, 1], { ...clamp, easing: ease });
  const toJar = interpolate(frame, [1596, 1640], [0, 1], { ...clamp, easing: ease });
  const showCoins = frame >= 1496 && frame < 1700;
  const lockPop = spring({ frame: frame - 1650, fps, config: { damping: 8 } });

  const bg = inDoor ? "door" : "kitchen_rain";
  return (
    <AbsoluteFill style={{ background: "#2a2a30" }}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: world }}>
          <Img src={art(bg)} style={{ position: "absolute", width: 1080, height: 1920 }} />
          {!inDoor ? <Img src={art("kitchen_warm")} style={{ position: "absolute", width: 1080, height: 1920, opacity: warm }} /> : null}
          {!inDoor ? <Rain x0={625} y0={215} x1={1030} y1={775} n={46} opacity={rainOp * 0.9} /> : <Rain x0={252} y0={264} x1={828} y1={1250} n={90} opacity={0.85} />}
          {!inDoor && listVisible ? <ListPaper scale={listScale} ticks={ticks} /> : null}

          {/* person behind the counter: clipped at the counter top */}
          {personShown ? (
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1250, overflow: "hidden" }}>
              <Person x={520} y={790} pose={pose} shirt={shirt} holdList={holdList} />
              {frame >= 470 && frame < B.calls ? <><Sign text="PLUMBER" x={400} flipAt={478} color="#3f78c9" /><Sign text="HANDYMAN" x={650} flipAt={520} color="#c4623f" /></> : null}
              {frame >= B.calls && frame < B.door ? [0, 1, 2, 3].map((i) => <Bubble key={i} at={buzzTimes[3] + i * 38} x={phoneX + 60} y={920} />) : null}
            </div>
          ) : null}

          {phoneOn && frame < 1090 ? <CallPhone x={phoneX} buzz={buzzNow} dim={phoneDim > 0 ? 1 : 1} /> : null}
          {phoneOn && frame >= B.turn ? <div style={{ position: "absolute", left: phoneX - 95, top: 920, width: 190, height: 345, borderRadius: 26, background: `rgba(29,34,48,${1 - phoneDim})`, opacity: 1 - phoneDim }} /> : null}

          {inDoor ? (
            <div style={{ position: "absolute", left: 0, top: 0 }}>
              <Person x={590} y={800} pose={mixPose("stand", "stand", 0)} shirt="#2f7f86" />
              <TagBlank />
              <DoorbellPulse />
            </div>
          ) : null}

          {/* jar and coins on the counter */}
          {frame >= 1490 && !inDoor ? (
            <div style={{ position: "absolute", left: 0, top: 0 }}>
              <Jar lock={lockPop} show={frame >= 1590} />
              {showCoins ? (
                <>
                  {frame < 1530 ? <Coin x={540} y={1225 + coinDrop} /> : null}
                  {frame >= 1522 ? <Stack x={540 - 200 * split + 200 * toJar * 0} baseY={1262 - 0 * toJar} n={2} shown={frame < 1596 ? 2 : 0} /> : null}
                  {frame >= 1522 ? <Stack x={540 + 190 * split} baseY={1262} n={4} shown={frame < 1596 ? 4 : 0} /> : null}
                  {frame >= 1544 && frame < 1596 ? <div style={{ position: "absolute", left: 540 - 200 - 62, top: 1262 - 60, width: 124, textAlign: "center", fontFamily: FONT, fontSize: 40, color: "#fff", background: C.orange, borderRadius: 14, padding: "2px 0", transform: "translateY(-50px)" }}>40%</div> : null}
                  {frame >= 1596 ? [0, 1, 2, 3, 4, 5].map((i) => {
                    const p = interpolate(toJar, [i * 0.1, 0.45 + i * 0.1], [0, 1], clamp);
                    const sx = i < 2 ? 340 : 730, sy = 1262 - (i < 2 ? i : i - 2) * 16;
                    const x = sx + (590 - sx) * p, y = sy + (1255 - sy) * p - Math.sin(p * Math.PI) * 120 - (p > 0.95 ? ((i % 3) * 18) : 0);
                    return <Coin key={i} x={x} y={Math.min(y, 1255 - (i % 3) * 16)} r={34} />;
                  }) : null}
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {frame >= B.warm + 2 && frame < 1495 ? <AbsoluteFill><PhoneUI /><TapHand /></AbsoluteFill> : null}

      {/* captions: top third, at most nine words, the kit as drawn */}
      <Caption text="Phone won't stop buzzing." from={0} to={B.list} size={112} />
      <Caption text="The list on the fridge" from={B.list + 5} to={B.person - 6} size={104} />
      <Caption text="Plumber? Handyman? Not sure." from={B.person + 5} to={B.calls - 6} size={86} />
      <Caption text="Same questions, every call" from={B.calls + 5} to={B.door - 6} size={92} />
      <Caption text={"No price until they're at your door"} from={B.door + 5} to={B.tired - 6} size={84} />
      <Caption text="A short list. A second job." from={B.tired + 5} to={B.turn - 6} size={88} />
      <Caption text="There's a better way." from={B.turn + 5} to={B.warm - 6} size={108} />
      <Caption text="Describe the job once" from={B.warm + 4} to={B.est - 6} size={108} />
      <Caption text="See the price, then choose" from={B.est + 4} to={B.pick - 6} size={88} />
      <Caption text="You pick. 40% confirms your pro." from={B.pick + 4} to={B.jar - 6} size={84} />
      <Caption text={"Held until the job's complete"} from={B.jar + 4} to={B.end - 4} size={86} />
      <CommentCard from={B.end} question="Which one's happened to you?" prompt="Comment below" />
      {frame >= B.end + 20 ? <EndIcons from={B.end + 20} /> : null}

      {/* voice */}
      {V.map((v, i) => <VoiceClip key={i} name="chinook" n={i + 1} at={v} />)}

      {/* sound for this video (tools/sfx/chinook.py): a room tone and rain under everything, then a sound only where something happens */}
      <RoomBed />
      {buzzTimes.map((b) => <Sfx key={b} name="chinook/buzz" at={b} volume={0.32} />)}
      {WRITE.map((w) => <Sfx key={w} name="chinook/pencil" at={w + 2} volume={0.3} />)}
      <Sfx name="chinook/doorbell" at={B.door + 14} volume={0.5} />
      <Sfx name="chinook/warm" at={B.turn + 6} volume={0.4} />
      <Sfx name="chinook/tap" at={1424} volume={0.5} />
      <Sfx name="chinook/coin" at={1526} volume={0.45} />
      <Sfx name="chinook/coin" at={1624} volume={0.35} />
      <Sfx name="chinook/lock" at={1652} volume={0.5} />
      <Sfx name="chinook/chime" at={B.end + 4} volume={0.4} />
      <Progress />
    </AbsoluteFill>
  );
};

import { Audio, Sequence } from "remotion";
const RoomBed: React.FC = () => (
  <>
    {[0, 300, 600, 900, 1200, 1500, 1800].map((s) => <Sequence key={"r" + s} from={s} layout="none"><Audio src={staticFile("sfx/chinook/room.wav")} volume={0.14} /></Sequence>)}
    {/* the owner's street-rain recording (2026-11-24), about 12 dB under the voice; it stops when the picture's rain stops */}
    <Audio src={staticFile("sfx/chinook/rain-street.wav")} volume={(f) => 0.38 * interpolate(f, [B.turn - 10, B.turn + 30], [1, 0], clamp)} />
  </>
);

const Jar: React.FC<{ lock: number; show: boolean }> = ({ lock, show }) => {
  if (!show) return null;
  return (
    <div style={{ position: "absolute", left: 590 - 105, top: 1262 - 250, width: 210, height: 255 }}>
      <div style={{ position: "absolute", left: 0, top: 30, width: 210, height: 225, borderRadius: "30px 30px 40px 40px", background: "rgba(190,225,240,.38)", border: "6px solid rgba(255,255,255,.75)", boxSizing: "border-box", boxShadow: "6px 8px 0 rgba(0,0,0,.1)" }} />
      <div style={{ position: "absolute", left: 26, top: 50, width: 14, height: 150, borderRadius: 7, background: "rgba(255,255,255,.7)" }} />
      <div style={{ position: "absolute", left: -8, top: 0, width: 226, height: 44, borderRadius: 14, background: C.orange, border: "4px solid #00000025", boxSizing: "border-box" }} />
      <svg width="76" height="84" viewBox="0 0 76 84" style={{ position: "absolute", left: 67, top: 100, transform: `scale(${lock})` }}>
        <path d="M18 38 V26 a20 20 0 0 1 40 0 V38" fill="none" stroke="#3a3a44" strokeWidth="9" strokeLinecap="round" />
        <rect x="6" y="36" width="64" height="44" rx="10" fill="#f2c14e" stroke="#b8861f" strokeWidth="4" />
        <circle cx="38" cy="56" r="7" fill="#3a3a44" />
      </svg>
    </div>
  );
};

const TagBlank: React.FC = () => {
  const frame = useCurrentFrame();
  const sw = Math.sin((frame - B.door) / 11) * 8;
  return (
    <div style={{ position: "absolute", left: 470, top: 1010, transform: `rotate(${sw}deg)`, transformOrigin: "50% 0%" }}>
      <div style={{ width: 4, height: 40, background: "#7a6a52", margin: "0 auto" }} />
      <div style={{ width: 180, height: 110, background: "#fffdf5", border: "5px solid #8a7f6c", borderRadius: "12px 40px 40px 12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "6px 8px 0 rgba(0,0,0,.2)", color: "#c9c3b4", fontFamily: FONT, fontSize: 64 }}>$ ?</div>
    </div>
  );
};
const DoorbellPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - (B.door + 14);
  if (f < 0 || f > 50) return null;
  const r = interpolate(f, [0, 50], [20, 90], clamp);
  return <div style={{ position: "absolute", left: 925 - r, top: 810 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `6px solid ${C.orange}`, opacity: 1 - f / 50 }} />;
};

const EndIcons: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 11 } });
  const wob = Math.sin(frame / 3) * 7;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1560, display: "flex", justifyContent: "center", gap: 180, transform: `scale(${s})` }}>
      <div style={{ width: 210, height: 210, borderRadius: 40, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${wob}deg)` }}>
        <svg width="120" height="120" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="#d9534a" /></svg>
      </div>
      <div style={{ width: 210, height: 210, borderRadius: 40, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 90, height: 130, borderRadius: 18, background: "#efe7d6", border: "6px solid #8a7f6c", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 46, height: 46, borderRadius: 23, background: C.orange }} />
        </div>
      </div>
    </div>
  );
};
