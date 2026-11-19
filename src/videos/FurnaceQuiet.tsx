// "Furnace gone quiet" — diy-or-pro type, clay look (cold-night living room). All shapes are drawn in code.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Caption, CommentCard, Progress, Sfx, VoiceClip, clamp, FONT } from "../kit";

// each voice line starts 10 frames into its beat and is followed by 20+ frames of quiet
const T = { thermo: 119, filter: 240, gas: 375, panel: 485, card: 620, total: 715 };

type Tri = [string, string, string];
const BEIGE: Tri = ["#f6ead2", "#e2d1ae", "#b49e76"];
const BLUEGREY: Tri = ["#93a7c8", "#6c82a9", "#465a82"];
const ORANGE: Tri = ["#ff9d55", "#ea6b14", "#b34a08"];
const RED: Tri = ["#ff7d70", "#e0443a", "#a32922"];
const SKIN: Tri = ["#ffd5b4", "#f0aa7d", "#c87d54"];
const WHITE: Tri = ["#ffffff", "#eef2fa", "#c1cbe0"];
const GREY: Tri = ["#938f8b", "#706c69", "#4c4846"];
const WOOD: Tri = ["#cc8e5c", "#a36b3f", "#6e4527"];
const SOFA: Tri = ["#ef7a54", "#c9563e", "#8e3a28"];
const TEAL: Tri = ["#74d8cc", "#41b0a1", "#247a70"];
const DARK: Tri = ["#3a4468", "#262e4c", "#161c33"];

const clayBg = ([hi, mid, lo]: Tri) => `radial-gradient(ellipse at 30% 24%, ${hi} 0%, ${mid} 48%, ${lo} 100%)`;
const CLAY_SHADOW = "inset -8px -12px 18px rgba(0,0,0,.30), inset 6px 8px 14px rgba(255,255,255,.22), 8px 14px 0 rgba(0,0,0,.22)";

const Clay: React.FC<{ x: number; y: number; w: number; h: number; c: Tri; r?: number | string; style?: React.CSSProperties; children?: React.ReactNode }> =
  ({ x, y, w, h, c, r = 30, style, children }) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, background: clayBg(c), boxShadow: CLAY_SHADOW, ...style }}>{children}</div>
  );

// a clay hand pointing up; (x, y) is the fingertip, rot turns it clockwise around the fingertip
const Hand: React.FC<{ x: number; y: number; rot: number; scale?: number }> = ({ x, y, rot, scale = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `rotate(${rot}deg) scale(${scale})`, transformOrigin: "0 0" }}>
    <Clay x={-70} y={90} w={140} h={150} c={SKIN} r={60} />
    <Clay x={-96} y={120} w={44} h={100} c={SKIN} r={22} style={{ transform: "rotate(28deg)" }} />
    <Clay x={-16} y={0} w={34} h={140} c={SKIN} r={17} />
    <Clay x={22} y={70} w={34} h={60} c={SKIN} r={17} />
    <Clay x={-52} y={70} w={34} h={60} c={SKIN} r={17} />
    <Clay x={-62} y={230} w={124} h={200} c={SKIN} r={40} />
  </div>
);

// one beat: slides in with a little ease, fades at the end, and drifts in slowly the whole time
const Scene: React.FC<{ from: number; to: number; origin?: string; children: (g: number) => React.ReactNode }> = ({ from, to, origin = "50% 55%", children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const g = frame - from;
  const inn = interpolate(g, [0, 8], [0, 1], clamp);
  const out = interpolate(frame, [to - 4, to], [1, 0], clamp);
  const e = 1 - Math.pow(1 - inn, 3);
  const zoom = 1 + (g / (to - from)) * 0.06;
  return (
    <AbsoluteFill style={{ opacity: Math.min(inn, out), transform: `translateY(${(1 - e) * 50}px) scale(${zoom})`, transformOrigin: origin }}>
      {children(g)}
    </AbsoluteFill>
  );
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (g: number, a: number, b: number) => { const t = interpolate(g, [a, b], [0, 1], clamp); return t * t * (3 - 2 * t); };

const Wall: React.FC<{ floor?: boolean }> = ({ floor = true }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(#1c2650 0%, #2a3868 55%, #324175 100%)" }} />
    {floor ? <div style={{ position: "absolute", left: 0, top: 1460, width: 1080, height: 460, background: "linear-gradient(#4b3532, #2f2120)" }} /> : null}
    {floor ? <div style={{ position: "absolute", left: 0, top: 1440, width: 1080, height: 26, background: clayBg(BEIGE) }} /> : null}
  </>
);

// ---------- beat 1: the cold, silent room ----------
const Room: React.FC<{ g: number }> = ({ g }) => {
  const cool = ease(g, 0, 119);
  const level = lerp(0.72, 0.2, cool);
  return (
    <>
      <Wall />
      {/* window with frost creeping in from the corners and snow outside */}
      <Clay x={80} y={560} w={390} h={560} c={BEIGE} r={34}>
        <div style={{ position: "absolute", left: 26, top: 26, right: 26, bottom: 26, borderRadius: 18, overflow: "hidden", background: "linear-gradient(#0b1236, #1d2b60)" }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 20 + ((i * 53) % 300) + Math.sin((g + i * 7) / 12) * 12, top: ((g * 3 + i * 61) % 520) - 10,
              width: 8 + (i % 3) * 3, height: 8 + (i % 3) * 3, borderRadius: "50%", background: "#fff", opacity: 0.85 }} />
          ))}
          {[[-50, -50], [230, -50], [-50, 360], [230, 360]].map(([px, py], i) => (
            <div key={i} style={{ position: "absolute", left: px, top: py, width: 190 * (0.6 + cool * 0.7), height: 190 * (0.6 + cool * 0.7), borderRadius: "46% 54% 50% 50%",
              background: "radial-gradient(circle at 40% 35%, #fff 0%, #dfeaff 60%, rgba(200,220,255,.5) 100%)", opacity: 0.9 }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 267, height: 26, background: clayBg(BEIGE), boxShadow: "0 4px 0 rgba(0,0,0,.15)" }} />
      </Clay>
      {/* wall thermometer, the level sinks the whole beat */}
      <Clay x={800} y={600} w={92} h={520} c={WHITE} r={46}>
        <div style={{ position: "absolute", left: 26, top: 30, width: 40, height: 440, borderRadius: 20, background: "#10173a", overflow: "hidden", boxShadow: "inset 4px 6px 10px rgba(0,0,0,.5)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${level * 100}%`, background: clayBg(RED), opacity: 1 - cool }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${level * 100}%`, background: "linear-gradient(#9ed0ff,#4f8fe0)", opacity: cool }} />
        </div>
        <div style={{ position: "absolute", left: -4, top: 450, width: 100, height: 100, borderRadius: "50%", background: cool > 0.5 ? clayBg(["#bfe0ff", "#4f8fe0", "#2b5ea8"]) : clayBg(RED), boxShadow: CLAY_SHADOW }} />
      </Clay>
      {/* sofa */}
      <Clay x={230} y={980} w={620} h={300} c={SOFA} r={90} />
      <Clay x={170} y={1100} w={120} h={240} c={SOFA} r={60} />
      <Clay x={790} y={1100} w={120} h={240} c={SOFA} r={60} />
      <Clay x={200} y={1170} w={680} h={170} c={SOFA} r={60} />
      {/* person under a blanket, shivering */}
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${Math.sin(g * 1.9) * 3}px)` }}>
        <Clay x={385} y={1030} w={320} h={290} c={TEAL} r="46% 46% 36% 36%" />
        <Clay x={400} y={1190} w={290} h={34} c={["#8be6da", "#56c2b4", "#2f8c80"]} r={17} />
        <Clay x={455} y={880} w={170} h={170} c={SKIN} r="50%" />
        <Clay x={445} y={860} w={190} h={80} c={ORANGE} r="50% 50% 30% 30%" />
        <div style={{ position: "absolute", left: 500, top: 962, width: 16, height: 20, borderRadius: "50%", background: "#3a2a28" }} />
        <div style={{ position: "absolute", left: 560, top: 962, width: 16, height: 20, borderRadius: "50%", background: "#3a2a28" }} />
        <div style={{ position: "absolute", left: 518, top: 1004, width: 40, height: 14, borderRadius: "50%", background: "#8a4a3a" }} />
      </div>
      {/* breath puffs: visible breath means it is cold */}
      {[0, 1, 2, 3].map((k) => {
        const ph = ((g + k * 18) % 72) / 72;
        return <div key={k} style={{ position: "absolute", left: 640 + ph * 120, top: 990 - ph * 70, width: 30 + ph * 46, height: 30 + ph * 46, borderRadius: "50%",
          background: "#fff", opacity: (1 - ph) * 0.75 }} />;
      })}
      {/* silent floor vent */}
      <Clay x={380} y={1500} w={320} h={110} c={DARK} r={22}>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ position: "absolute", left: 22, right: 22, top: 18 + i * 17, height: 8, borderRadius: 4, background: "#0b0f22" }} />)}
      </Clay>
    </>
  );
};

// ---------- beat 2: the thermostat ----------
const Thermostat: React.FC<{ g: number }> = ({ g }) => {
  const slide = ease(g, 22, 46);
  const dial = ease(g, 62, 100);
  const setAngle = lerp(-52, 58, dial);
  const lamp = g >= 102;
  const knobX = lerp(400, 570, slide);
  const handIn = ease(g, 0, 20);
  const toDial = ease(g, 50, 62);
  const handOut = ease(g, 104, 120);
  const hx = lerp(lerp(1000, knobX + 60, handIn), 690, toDial) + handOut * 400;
  const hy = lerp(lerp(1500, 1215, handIn), 1010, toDial) + handOut * 200;
  return (
    <>
      <Wall floor={false} />
      <Clay x={330} y={740} w={420} h={560} c={BEIGE} r={80}>
        {/* dial: a dark face, a blue marker for the room and an orange one for the setting */}
        <Clay x={60} y={40} w={300} h={300} c={WHITE} r="50%">
          <div style={{ position: "absolute", left: 28, top: 28, width: 244, height: 244, borderRadius: "50%", background: clayBg(DARK), boxShadow: "inset 6px 8px 14px rgba(0,0,0,.5)" }}>
            {Array.from({ length: 13 }).map((_, i) => (
              <div key={i} style={{ position: "absolute", left: 119, top: 12, width: 6, height: 18, borderRadius: 3, background: "#6c7aa8", transform: `rotate(${-60 + i * 10}deg)`, transformOrigin: "3px 110px" }} />
            ))}
            <div style={{ position: "absolute", left: 112, top: 8, width: 20, height: 20, borderRadius: "50%", background: "#7cc4ff", transformOrigin: "10px 114px", transform: "rotate(0deg)", boxShadow: "0 0 14px #7cc4ff" }} />
            <div style={{ position: "absolute", left: 110, top: 2, width: 24, height: 34, background: "#ff9d55", clipPath: "polygon(50% 100%, 0 0, 100% 0)", transformOrigin: "12px 120px", transform: `rotate(${setAngle}deg)`, filter: "drop-shadow(0 0 8px #ea6b14)" }} />
          </div>
        </Clay>
        {/* lamp that lights when it is calling for heat */}
        <div style={{ position: "absolute", left: 340, top: 24, width: 34, height: 34, borderRadius: "50%", background: lamp ? "#ff8a2a" : "#6a5f52", boxShadow: lamp ? "0 0 30px 10px rgba(255,138,42,.7)" : "inset 3px 4px 6px rgba(0,0,0,.4)" }} />
        {/* OFF / HEAT slider */}
        <div style={{ position: "absolute", left: 60, top: 430, width: 300, height: 84, borderRadius: 42, background: "#1c2240", boxShadow: "inset 5px 7px 12px rgba(0,0,0,.55)" }}>
          <div style={{ position: "absolute", left: 20, top: -44, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: slide < 0.5 ? "#ffcc99" : "#5c668f" }}>OFF</div>
          <div style={{ position: "absolute", right: 20, top: -44, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: slide >= 0.5 ? "#ff9d55" : "#5c668f" }}>HEAT</div>
        </div>
      </Clay>
      {/* the knob rides on top of the slider */}
      <Clay x={knobX} y={1190} w={120} h={64} c={ORANGE} r={32} />
      <Hand x={hx} y={hy} rot={-24} scale={1.15} />
    </>
  );
};

// ---------- furnace body shared by beats 3 and 5 ----------
const FurnaceBody: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <>
    <Clay x={x} y={y} w={520} h={900} c={BLUEGREY} r={44} />
    <Clay x={x + 50} y={y + 50} w={420} h={120} c={DARK} r={22}>
      {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{ position: "absolute", left: 20 + i * 66, top: 16, width: 12, height: 88, borderRadius: 6, background: "#0b0f22" }} />)}
    </Clay>
    <Clay x={x + 50} y={y + 210} w={150} h={70} c={GREY} r={20} />
    <div style={{ position: "absolute", left: x + 70, top: y + 232, width: 24, height: 24, borderRadius: "50%", background: "#5a5350" }} />
  </>
);

// ---------- beat 3: the filter ----------
const Pleats: React.FC<{ x: number; y: number; dirty: boolean }> = ({ x, y, dirty }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 430, height: 118, borderRadius: 14, overflow: "hidden",
    background: dirty ? "repeating-linear-gradient(90deg,#7b7774 0 16px,#5d5a58 16px 24px)" : "repeating-linear-gradient(90deg,#ffffff 0 16px,#cdd6ea 16px 24px)",
    border: `12px solid ${dirty ? "#8a7c64" : "#e6d6b2"}`, boxSizing: "border-box", boxShadow: "8px 14px 0 rgba(0,0,0,.25)" }}>
    {dirty ? [[30, 20, 70], [140, 40, 90], [260, 10, 80], [340, 50, 60]].map(([a, b, s], i) => (
      <div key={i} style={{ position: "absolute", left: a, top: b - 10, width: s, height: s * 0.6, borderRadius: "50%", background: "rgba(60,56,54,.75)" }} />
    )) : null}
  </div>
);

const Filter: React.FC<{ g: number }> = ({ g }) => {
  const out = ease(g, 20, 55);
  const dirtyGone = ease(g, 62, 84);
  const cleanIn = ease(g, 62, 84);
  const cleanSlot = ease(g, 92, 116);
  const dx = lerp(160, 490, out) + dirtyGone * 560;
  const dy = 1191 + dirtyGone * 160;
  const cx = lerp(lerp(1090, 490, cleanIn), 160, cleanSlot);
  const handIn = ease(g, 6, 20);
  const handOut = ease(g, 56, 70);
  const handIn2 = ease(g, 80, 90);
  const handOut2 = ease(g, 112, 126);
  const dust = (g > 26 && g < 60) ? (g - 26) / 34 : 0;
  return (
    <>
      <Wall />
      <FurnaceBody x={120} y={640} />
      <Clay x={140} y={1170} w={480} h={140} c={DARK} r={18} />
      {g < 84 ? <div style={{ position: "absolute", left: dx, top: dy, transform: `rotate(${dirtyGone * 24}deg)`, opacity: 1 - dirtyGone * 0.4 }}><Pleats x={0} y={0} dirty /></div> : null}
      {g >= 62 ? <Pleats x={cx} y={1191} dirty={false} /> : null}
      {/* dust puffs as the dirty one slides out */}
      {[0, 1, 2, 3, 4].map((k) => dust > 0 ? (
        <div key={k} style={{ position: "absolute", left: 480 + k * 70 + dust * 40, top: 1150 - dust * 150 - (k % 2) * 40, width: 40 + dust * 40, height: 40 + dust * 40, borderRadius: "50%",
          background: "#9b9792", opacity: (1 - dust) * 0.7 }} />
      ) : null)}
      <Hand x={lerp(1050, dx + 380, handIn) + handOut * 300} y={lerp(1600, 1190, handIn) + handOut * 300} rot={-30} scale={1.0} />
      {g >= 76 ? <Hand x={lerp(1050, cx + 380, handIn2) + handOut2 * 300} y={lerp(1600, 1190, handIn2) + handOut2 * 300} rot={-30} scale={1.0} /> : null}
    </>
  );
};

// ---------- beat 4: gas smell, leave and call ----------
const Warn: React.FC<{ g: number }> = ({ g }) => {
  const walk = ease(g, 6, 68);
  const px = lerp(300, 760, walk);
  const open = ease(g, 42, 62);
  const leave = ease(g, 66, 100);
  const bob = Math.abs(Math.sin(g * 0.5)) * 10;
  const swing = Math.sin(g * 0.5) * 20;
  const tri = Math.sin(g / 5) * 10;
  return (
    <>
      <Wall />
      {/* the front door: a dark opening to the snowy night behind the leaf */}
      <div style={{ position: "absolute", left: 640, top: 560, width: 380, height: 900, borderRadius: "30px 30px 0 0", background: "linear-gradient(#10183f,#24366f)", overflow: "hidden" }}>
        {Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 30 + ((i * 71) % 320), top: ((g * 4 + i * 83) % 860), width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />)}
      </div>
      <Clay x={640} y={560} w={380} h={900} c={WOOD} r="30px 30px 0 0" style={{ transformOrigin: "0 50%", transform: `scaleX(${lerp(1, 0.16, open)})` }}>
        <div style={{ position: "absolute", left: 300, top: 440, width: 40, height: 40, borderRadius: "50%", background: clayBg(BEIGE) }} />
      </Clay>
      {/* the furnace stays where it is; the warning triangle floats over it */}
      <Clay x={70} y={900} w={300} h={560} c={BLUEGREY} r={36} />
      <Clay x={110} y={940} w={220} h={70} c={DARK} r={16} />
      <div style={{ position: "absolute", left: 90, top: 640 + tri, width: 260, height: 230, background: clayBg(ORANGE), clipPath: "polygon(50% 0, 100% 100%, 0 100%)", filter: "drop-shadow(8px 12px 0 rgba(0,0,0,.25))" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 80, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 120, color: "#fff" }}>!</div>
      </div>
      {/* the person walks out with the phone at their ear */}
      <div style={{ position: "absolute", left: px, top: 1060 - bob + leave * 20, opacity: 1 - leave, transform: `scale(${1 - leave * 0.25})`, transformOrigin: "50% 100%" }}>
        <Clay x={-10} y={250} w={40} h={130} c={DARK} r={20} style={{ transform: `rotate(${swing}deg)`, transformOrigin: "50% 0" }} />
        <Clay x={50} y={250} w={40} h={130} c={DARK} r={20} style={{ transform: `rotate(${-swing}deg)`, transformOrigin: "50% 0" }} />
        <Clay x={-30} y={90} w={160} h={200} c={TEAL} r={60} />
        <Clay x={5} y={-20} w={100} h={100} c={SKIN} r="50%" />
        <Clay x={90} y={110} w={34} h={120} c={TEAL} r={17} style={{ transform: "rotate(-150deg)", transformOrigin: "50% 15%" }} />
        <Clay x={102} y={14} w={28} h={54} c={DARK} r={8} />
      </div>
    </>
  );
};

// ---------- beat 5: the panel stays shut ----------
const Panel: React.FC<{ g: number }> = ({ g }) => {
  const reach = ease(g, 0, 40);
  const recoil = ease(g, 56, 84);
  const stamp = interpolate(g, [54, 64], [0, 1], clamp);
  const sc = lerp(2.4, 1, stamp);
  const shake = g > 62 && g < 74 ? Math.sin(g * 3) * 6 : 0;
  const hx = lerp(1060, 690, reach) + recoil * 360;
  const hy = lerp(1500, 1180, reach) + recoil * 300;
  return (
    <>
      <Wall />
      <FurnaceBody x={250} y={600} />
      <Clay x={330} y={1010} w={360} h={320} c={BEIGE} r={26}>
        {[[22, 22], [310, 22], [22, 270], [310, 270]].map(([a, b], i) => <div key={i} style={{ position: "absolute", left: a, top: b, width: 26, height: 26, borderRadius: "50%", background: "#8a7a5c", boxShadow: "inset 2px 3px 4px rgba(0,0,0,.4)" }} />)}
        <Clay x={140} y={120} w={80} h={80} c={GREY} r={20} />
      </Clay>
      <Hand x={hx} y={hy} rot={-62} scale={1.05} />
      {stamp > 0 ? (
        <div style={{ position: "absolute", left: 220 + shake, top: 1000, width: 620, height: 340, opacity: stamp, transform: `scale(${sc})` }}>
          <div style={{ position: "absolute", left: 40, top: 140, width: 540, height: 64, borderRadius: 32, background: clayBg(RED), transform: "rotate(30deg)", boxShadow: CLAY_SHADOW }} />
          <div style={{ position: "absolute", left: 40, top: 140, width: 540, height: 64, borderRadius: 32, background: clayBg(RED), transform: "rotate(-30deg)", boxShadow: CLAY_SHADOW }} />
        </div>
      ) : null}
    </>
  );
};

// ---------- beat 6: the two answers, as clay icons over the question card ----------
const Icons: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.card + 14) return null;
  const f = frame - T.card;
  const pop = Math.min(1, (f - 14) / 10);
  const bob = Math.sin(f / 6) * 8;
  return (
    <>
      <div style={{ position: "absolute", left: 160, top: 1440 + bob, transform: `scale(${pop})` }}>
        <Clay x={0} y={0} w={300} h={300} c={BEIGE} r={56}>
          <Clay x={70} y={50} w={160} h={160} c={WHITE} r="50%" />
          <div style={{ position: "absolute", left: 140, top: 62, width: 20, height: 56, borderRadius: 8, background: "#ea6b14" }} />
          <div style={{ position: "absolute", left: 60, top: 235, width: 180, height: 30, borderRadius: 15, background: "#1c2240" }} />
        </Clay>
      </div>
      <div style={{ position: "absolute", left: 620, top: 1440 - bob, transform: `scale(${pop})` }}>
        <div style={{ position: "absolute", left: 0, top: 70, width: 300, height: 160, borderRadius: 18, overflow: "hidden", border: "14px solid #e6d6b2", boxSizing: "border-box",
          background: "repeating-linear-gradient(90deg,#ffffff 0 18px,#cdd6ea 18px 28px)", boxShadow: "8px 14px 0 rgba(0,0,0,.25)" }} />
      </div>
    </>
  );
};

export const FurnaceQuiet: React.FC = () => {
  const S = T;
  return (
    <AbsoluteFill style={{ background: "#1c2650" }}>
      <Scene from={0} to={S.thermo} origin="75% 55%">{(g) => <Room g={g} />}</Scene>
      <Scene from={S.thermo} to={S.filter} origin="50% 55%">{(g) => <Thermostat g={g} />}</Scene>
      <Scene from={S.filter} to={S.gas} origin="40% 65%">{(g) => <Filter g={g} />}</Scene>
      <Scene from={S.gas} to={S.panel} origin="60% 55%">{(g) => <Warn g={g} />}</Scene>
      <Scene from={S.panel} to={S.card} origin="45% 65%">{(g) => <Panel g={g} />}</Scene>
      <AbsoluteFill style={{ background: "linear-gradient(rgba(15,21,36,.7) 0%, rgba(15,21,36,.4) 22%, rgba(15,21,36,0) 38%)" }} />

      <Caption text="2 checks before you panic" from={0} to={S.thermo} size={118} />
      <Caption text="Thermostat on HEAT" from={S.thermo} to={S.filter} size={100} n={1} top={170} />
      <Caption text="Check the filter" from={S.filter} to={S.gas} size={104} n={2} top={170} />
      <Caption text="Gas smell? Out. Licensed pro." from={S.gas} to={S.panel} size={100} />
      <Caption text="The rest is a pro job" from={S.panel} to={S.card} size={112} />
      <CommentCard from={S.card} question="Filter or thermostat?" prompt="Comment below" />
      <Icons />

      {/* voice: each line starts 10 frames into its beat */}
      <VoiceClip name="furnace" n={1} at={10} />
      <VoiceClip name="furnace" n={2} at={S.thermo + 10} />
      <VoiceClip name="furnace" n={3} at={S.filter + 10} />
      <VoiceClip name="furnace" n={4} at={S.gas + 10} />
      <VoiceClip name="furnace" n={5} at={S.panel + 10} />
      <VoiceClip name="furnace" n={6} at={S.card + 10} />

      {/* sound made for this video (tools/sfx/furnace.py): a cold hush, clicks, clay and cloth */}
      <Sfx name="furnace/wind" at={0} volume={0.3} />
      {[8, 30, 56, 80].map((f) => <Sfx key={f} name="furnace/frost" at={f} volume={0.3} />)}
      <Sfx name="furnace/swish" at={S.thermo} volume={0.3} />
      <Sfx name="furnace/click" at={S.thermo + 30} volume={0.7} />
      {Array.from({ length: 8 }).map((_, i) => <Sfx key={i} name="furnace/ratchet" at={S.thermo + 64 + i * 5} volume={0.45} />)}
      <Sfx name="furnace/relay" at={S.thermo + 102} volume={0.7} />
      <Sfx name="furnace/swish" at={S.filter} volume={0.3} />
      <Sfx name="furnace/scrape" at={S.filter + 20} volume={0.5} />
      <Sfx name="furnace/dust" at={S.filter + 30} volume={0.5} />
      <Sfx name="furnace/scrape" at={S.filter + 66} volume={0.4} />
      <Sfx name="furnace/scrape" at={S.filter + 92} volume={0.45} />
      <Sfx name="furnace/seat" at={S.filter + 114} volume={0.6} />
      <Sfx name="furnace/alert" at={S.gas + 2} volume={0.5} />
      {[10, 22, 34, 46, 58].map((f) => <Sfx key={f} name="furnace/step" at={S.gas + f} volume={0.4} />)}
      <Sfx name="furnace/door" at={S.gas + 44} volume={0.5} />
      <Sfx name="furnace/swish" at={S.panel} volume={0.3} />
      <Sfx name="furnace/stamp" at={S.panel + 56} volume={0.9} />
      <Sfx name="furnace/bells" at={S.card + 6} volume={0.45} />
      <Progress />
    </AbsoluteFill>
  );
};
export const furnaceQuietFrames = T.total;
