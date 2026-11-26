// "Don't load the van yet" — pro-tip for contractors, blueprint look.
// One place drawn as an architect's section: a snowy driveway with the van, the house cut open to show
// its bathroom (and the basement below). The camera moves through that one drawing; the van's dash is the
// one other shot, looking out through the windshield. At the end the blueprint lines fill with warm colour.
import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Caption, CommentCard, FONT, Progress, Sfx, Voice, clamp } from "../kit";

const rnd = (i: number) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (f: number, a: number, b: number) => { const t = interpolate(f, [a, b], [0, 1], clamp); return t * t * (3 - 2 * t); };

// beat starts (frames @30fps): each = previous start + its voice line + about 18 frames of breath (32 before the turn and the question)
const B = [0, 111, 263, 379, 504, 645, 779, 842, 989, 1152, 1296, 1426, 1572];
const TOTAL = 1740;

const BG = "#123f78";
const LINE = "#e9f2ff";
const SOFT = "rgba(190,215,250,0.55)";
const FILL0 = "rgba(120,170,240,0.10)";
const SKIN = "#f0c49c";

type Look = { warm: number };
const fillOf = (l: Look, c: string, base = FILL0) => interpolateColors(l.warm, [0, 1], [base, c]);
const strokeOf = (l: Look) => interpolateColors(l.warm, [0, 1], [LINE, "#2a3552"]);

// ---------------- a person, drawn in world units (feet at y=0, about 350 tall) ----------------
const Person: React.FC<{
  x: number; face: 1 | -1; arm: number; arm2?: number; kneel?: number; nod?: number; walk?: number;
  pro?: boolean; l: Look; hold?: React.ReactNode; opacity?: number;
}> = ({ x, face, arm, arm2 = 8, kneel = 0, nod = 0, walk = 0, pro, l, hold, opacity = 1 }) => {
  const s = strokeOf(l);
  const drop = kneel * 70;
  const shirt = pro ? fillOf(l, "#3d5a80", "rgba(140,185,245,0.22)") : fillOf(l, "#7a4f8c", "rgba(140,185,245,0.22)");
  const legs = fillOf(l, "#2f3a52", "rgba(140,185,245,0.16)");
  const sw = Math.sin(walk) * 22;
  const sh = { x: x + 8 * face, y: -272 + drop };
  const end = (deg: number, len = 118) => ({ x: sh.x + Math.sin((deg * Math.PI) / 180) * len * face, y: sh.y + Math.cos((deg * Math.PI) / 180) * len });
  const h1 = end(arm), h2 = end(arm2, 112);
  return (
    <g opacity={opacity} strokeLinecap="round" strokeLinejoin="round">
      {/* back arm */}
      <line x1={sh.x - 6 * face} y1={sh.y} x2={h2.x - 10 * face} y2={h2.y} stroke={s} strokeWidth={24} opacity={0.5} />
      {/* legs: kneeling folds the front leg forward */}
      {kneel > 0.5 ? (
        <g>
          <path d={`M${x - 10} ${-150 + drop} L${x - 18 * face} ${-8} L${x - 70 * face} ${-8}`} stroke={s} strokeWidth={26} fill="none" />
          <path d={`M${x + 10} ${-150 + drop} L${x + 60 * face} ${-80} L${x + 64 * face} 0`} stroke={s} strokeWidth={26} fill="none" />
        </g>
      ) : (
        <g>
          <line x1={x - 10} y1={-150} x2={x - 10 + sw} y2={0} stroke={s} strokeWidth={28} />
          <line x1={x - 10} y1={-150} x2={x - 10 + sw} y2={0} stroke={legs} strokeWidth={20} />
          <line x1={x + 10} y1={-150} x2={x + 10 - sw} y2={0} stroke={s} strokeWidth={28} />
          <line x1={x + 10} y1={-150} x2={x + 10 - sw} y2={0} stroke={legs} strokeWidth={20} />
          <ellipse cx={x - 10 + sw + 10 * face} cy={-6} rx={22} ry={9} fill={s} />
          <ellipse cx={x + 10 - sw + 10 * face} cy={-6} rx={22} ry={9} fill={s} />
        </g>
      )}
      {/* body */}
      <rect x={x - 38} y={-292 + drop} width={76} height={150} rx={26} fill={shirt} stroke={s} strokeWidth={4} />
      {pro ? <rect x={x - 38} y={-235 + drop} width={76} height={14} fill={C.orange} /> : null}
      {pro ? <rect x={x - 38} y={-205 + drop} width={76} height={14} fill={C.orange} /> : null}
      {/* head */}
      <g transform={`rotate(${nod * 14 * face} ${x} ${-300 + drop})`}>
        <circle cx={x + 4 * face} cy={-326 + drop} r={29} fill={fillOf(l, SKIN, "rgba(200,225,255,0.2)")} stroke={s} strokeWidth={4} />
        {pro ? (
          <g>
            <path d={`M${x - 27 + 4 * face} ${-332 + drop} A29 29 0 0 1 ${x + 31 + 4 * face} ${-332 + drop} Z`} fill={C.orange} stroke={s} strokeWidth={3} />
            <circle cx={x + 4 * face} cy={-364 + drop} r={9} fill={C.orange} stroke={s} strokeWidth={3} />
          </g>
        ) : (
          <path d={`M${x - 26 + 4 * face} ${-322 + drop} Q${x + 4 * face} ${-372 + drop} ${x + 34 * face} ${-330 + drop} L${x - 22 * face} ${-300 + drop} Z`} fill={fillOf(l, "#4a3022", "rgba(220,235,255,0.5)")} stroke={s} strokeWidth={3} />
        )}
        <circle cx={x + 18 * face} cy={-328 + drop} r={3.5} fill={s} />
      </g>
      {/* front arm and whatever it holds */}
      <line x1={sh.x} y1={sh.y} x2={h1.x} y2={h1.y} stroke={s} strokeWidth={26} />
      <line x1={sh.x} y1={sh.y} x2={h1.x} y2={h1.y} stroke={shirt} strokeWidth={17} />
      <circle cx={h1.x} cy={h1.y} r={13} fill={fillOf(l, SKIN, "rgba(200,225,255,0.3)")} stroke={s} strokeWidth={3} />
      {hold ? <g transform={`translate(${h1.x} ${h1.y})`}>{hold}</g> : null}
    </g>
  );
};

const Toolbox: React.FC<{ l: Look }> = ({ l }) => {
  const s = strokeOf(l);
  return (
    <g>
      <rect x={-48} y={-46} width={96} height={52} rx={5} fill={fillOf(l, "#c0392b", "rgba(234,107,20,0.35)")} stroke={s} strokeWidth={4} />
      <line x1={-48} y1={-28} x2={48} y2={-28} stroke={s} strokeWidth={3} />
      <path d="M-20 -46 L-20 -60 L20 -60 L20 -46" fill="none" stroke={s} strokeWidth={5} />
    </g>
  );
};

const PhoneSmall: React.FC<{ l: Look }> = ({ l }) => (
  <g transform="rotate(-20)"><rect x={-14} y={-26} width={28} height={50} rx={5} fill="#0d1b30" stroke={strokeOf(l)} strokeWidth={3} />
    <rect x={-10} y={-20} width={20} height={36} fill="#d7e7ff" /></g>
);

const CaulkGun: React.FC<{ l: Look }> = ({ l }) => {
  const s = strokeOf(l);
  return (
    <g transform="rotate(-8)">
      <rect x={-20} y={-14} width={92} height={24} rx={6} fill={fillOf(l, "#e8e8e8", "rgba(220,235,255,0.35)")} stroke={s} strokeWidth={3} />
      <path d="M72 -6 L100 -2 L72 2 Z" fill={s} />
      <path d="M-20 0 L-34 30" stroke={s} strokeWidth={8} />
    </g>
  );
};

// ---------------- the van, side view; nose to the left ----------------
const Van: React.FC<{ x: number; l: Look; rearOpen: number; slide: number; screen: number; wheel: number }> = ({ x, l, rearOpen, slide, screen, wheel }) => {
  const s = strokeOf(l);
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-50 -34 L-50 -122 L22 -200 L70 -232 L420 -236 L424 -34 Z" fill={fillOf(l, "#f4f5f8", "rgba(150,195,250,0.16)")} stroke={s} strokeWidth={5} strokeLinejoin="round" />
      <path d="M-50 -112 L424 -112" stroke={C.orange} strokeWidth={14} />
      {/* cab window and the phone on its dash */}
      <path d="M-22 -128 L30 -190 L110 -194 L110 -128 Z" fill={fillOf(l, "#9fc1e6", "rgba(10,30,60,0.55)")} stroke={s} strokeWidth={4} />
      <rect x={8} y={-150} width={14} height={22} rx={3} fill={interpolateColors(screen, [0, 1], ["#0b1a30", "#ffd9b0"])} stroke={s} strokeWidth={2} />
      {screen > 0.05 ? <circle cx={15} cy={-139} r={40} fill="#ffb36b" opacity={0.35 * screen} /> : null}
      {/* sliding side door */}
      <g transform={`translate(${slide * 120} 0)`}>
        <rect x={130} y={-218} width={118} height={182} fill={fillOf(l, "#eceef3", "rgba(150,195,250,0.14)")} stroke={s} strokeWidth={4} />
        <line x1={150} y1={-130} x2={176} y2={-130} stroke={s} strokeWidth={6} />
      </g>
      <line x1={130} y1={-222} x2={370} y2={-222} stroke={SOFT} strokeWidth={3} />
      {/* rear door swung open toward us */}
      {rearOpen > 0.02 ? <path d={`M420 -230 L${420 + 70 * rearOpen} -210 L${420 + 70 * rearOpen} -40 L420 -36 Z`} fill={fillOf(l, "#e5e7ee", "rgba(150,195,250,0.2)")} stroke={s} strokeWidth={4} /> : null}
      <rect x={-56} y={-82} width={14} height={22} rx={4} fill="#fff3c4" />
      {[30, 330].map((wx) => (
        <g key={wx} transform={`translate(${wx} -40) rotate(${wheel})`}>
          <circle r={40} fill="#0f1f38" stroke={s} strokeWidth={5} />
          <circle r={18} fill="none" stroke={s} strokeWidth={3} />
          <line x1={-18} y1={0} x2={18} y2={0} stroke={s} strokeWidth={3} /><line x1={0} y1={-18} x2={0} y2={18} stroke={s} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
};

// ---------------- the whole drawing: street, driveway, house section with the bathroom ----------------
const World: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const warm = ease(f, B[11] + 12, B[11] + 75);
  const l: Look = { warm };
  const s = strokeOf(l);

  // story state
  const fixed = f >= B[9];                          // caulk redone in beat 10
  const bead = interpolate(f, [B[9] + 45, B[9] + 120], [1160, 1395], clamp);
  const light = f >= B[8] + 112 ? 1 : 0;            // vanity light flicked on in beat 9
  const lightGlow = interpolate(f, [B[8] + 112, B[8] + 120], [0, 1], clamp) * light;
  const catchDoor = f >= B[3] && f < B[4] ? interpolate(f, [B[3] + 66, B[3] + 84, B[3] + 88, B[3] + 92], [0, 0.62, 0.52, 0.6], clamp) : 0;
  const doorsOpen = [0, 1, 2].map((k) => (f >= B[8] && f < B[9] + 10 ? ease(f, B[8] + 10 + k * 22, B[8] + 26 + k * 22) : 0));
  const tapRun = f >= B[8] + 74 && f < B[9] ? 1 : 0;
  const invoicePin = f >= B[5] && f < B[6];
  const pinIn = spring({ frame: f - B[5] - 6, fps, config: { damping: 12 } });
  const clockSpin = f >= B[5] && f < B[6] ? (f - B[5]) * 9 : f * 0.15;
  const caulkPulse = 0.55 + 0.45 * Math.sin(f / 4);

  // van position: parked at 0; rewinds back in from the street in beat 7
  const vanX = f >= B[6] && f < B[7] ? lerp(-760, 0, ease(f, B[6] + 2, B[6] + 40)) : 0;
  const wheel = f >= B[6] && f < B[7] ? -ease(f, B[6] + 2, B[6] + 40) * 900 : 0;
  const rearOpen = f < B[1] ? 1 : f >= B[6] && f < B[7] ? ease(f, B[6] + 38, B[6] + 46) : f >= B[11] ? 1 - ease(f, B[11] + 100, B[11] + 112) : 1;
  const slide = f >= B[11] ? ease(f, B[11] + 78, B[11] + 92) * (1 - ease(f, B[11] + 104, B[11] + 114)) : 0;
  const screen = f < B[1] ? interpolate(f, [34, 40], [0, 1], clamp) : 0;

  // toolbox: beat 1 slides into the van; beat 7 slides back out onto the driveway
  const tbIn = ease(f, 6, 70);
  const tbOut = ease(f, B[6] + 46, B[6] + 60);

  // people
  const people: React.ReactNode[] = [];
  if (f < B[1]) {
    const px = lerp(612, 556, tbIn);
    people.push(<Person key="p" pro l={l} x={px} face={-1} arm={lerp(48, 82, tbIn)} arm2={lerp(40, 70, tbIn)} walk={tbIn * 3} />);
  }
  if (f >= B[7] && f < B[8]) {
    const g = Math.sin((f - B[7]) / 9) * 26;
    people.push(<Person key="c" l={l} x={850} face={1} arm={10} arm2={6} />);
    people.push(<Person key="p" pro l={l} x={930} face={1} arm={95 + g} />);
  }
  if (f >= B[8] && f < B[9]) {
    const reach = f < B[8] + 100 ? 70 + Math.sin((f - B[8]) / 6) * 8 : interpolate(f, [B[8] + 100, B[8] + 112, B[8] + 130], [70, 150, 20], clamp);
    people.push(<Person key="c" l={l} x={800} face={1} arm={12} />);
    people.push(<Person key="p" pro l={l} x={1135} face={-1} arm={reach} />);
  }
  if (f >= B[9] && f < B[10]) {
    const kx = interpolate(f, [B[9], B[9] + 40, B[9] + 120], [1100, 1150, 1360], clamp);
    const kneel = ease(f, B[9] + 18, B[9] + 36);
    people.push(<Person key="c" l={l} x={1040} face={1} arm={interpolate(f, [B[9] + 4, B[9] + 20], [10, 62], clamp)} />);
    people.push(<Person key="p" pro l={l} x={kx - 70} face={1} kneel={kneel} arm={kneel > 0.5 ? 72 : 20} hold={kneel > 0.5 ? <CaulkGun l={l} /> : null} />);
  }
  if (f >= B[10] && f < B[11]) {
    const give = ease(f, B[10] + 20, B[10] + 44);
    const nod = f > B[10] + 70 ? Math.max(0, Math.sin((f - B[10] - 70) / 4)) * (f < B[10] + 110 ? 1 : 0) : 0;
    people.push(<Person key="c" l={l} x={985} face={1} arm={lerp(10, 92, give)} nod={nod} hold={give > 0.6 ? <PhoneSmall l={l} /> : null} />);
    people.push(<Person key="p" pro l={l} x={1140} face={-1} arm={lerp(10, 88, Math.min(1, give * 1.6)) * (give > 0.6 ? 1 - ease(f, B[10] + 50, B[10] + 62) : 1)} hold={give <= 0.6 && give > 0.05 ? <PhoneSmall l={l} /> : null} />);
  }
  if (f >= B[11]) {
    const t = interpolate(f, [B[11] + 10, B[11] + 105], [0, 1], clamp);
    const px = lerp(1120, 190, t);
    const inVan = ease(f, B[11] + 98, B[11] + 108);
    people.push(<Person key="c" l={l} x={985} face={-1} arm={interpolate(f, [B[11] + 60, B[11] + 75, B[11] + 90], [10, 150, 140], clamp) + Math.sin(f / 3) * 10 * (f > B[11] + 75 ? 1 : 0)} />);
    people.push(<Person key="p" pro l={l} x={px} face={-1} arm={20 + Math.sin(f / 3.5) * 20} walk={t * 34} opacity={1 - inVan} />);
  }

  // phone bubble in beat 1 (the hook) and fading under the question card
  const bubbleIn = spring({ frame: f - 40, fps, config: { damping: 10 } });
  const bubbleAlpha = f < B[1] ? bubbleIn : f >= B[12] ? 1 - ease(f, B[12] + 10, B[12] + 70) : 0;

  return (
    <g>
      <defs>
        <pattern id="gMinor" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1.5} /></pattern>
        <pattern id="gMajor" width={200} height={200} patternUnits="userSpaceOnUse"><path d="M200 0 L0 0 0 200" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2} /></pattern>
        <pattern id="hatch" width={26} height={26} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1={0} y1={0} x2={0} y2={26} stroke="rgba(220,235,255,0.22)" strokeWidth={3} /></pattern>
        <pattern id="tile" width={48} height={48} patternUnits="userSpaceOnUse" x={1160} y={-560}><path d="M48 0 L0 0 0 48" fill="none" stroke={warm > 0.5 ? "rgba(60,80,110,0.35)" : "rgba(220,235,255,0.3)"} strokeWidth={2} /></pattern>
        <clipPath id="outsideHouse"><rect x={-3000} y={-400} width={3640} height={500} /><rect x={1430} y={-400} width={3000} height={500} /></clipPath>
        <clipPath id="vanRear"><rect x={426} y={-400} width={2000} height={500} /></clipPath>
        <radialGradient id="lamp"><stop offset="0" stopColor="#ffd59a" stopOpacity={0.55} /><stop offset="1" stopColor="#ffd59a" stopOpacity={0} /></radialGradient>
      </defs>
      {/* the sheet */}
      <rect x={-3000} y={-2600} width={6400} height={4400} fill={interpolateColors(warm, [0, 1], [BG, "#22314f"])} />
      <rect x={-3000} y={-2600} width={6400} height={4400} fill="url(#gMinor)" />
      <rect x={-3000} y={-2600} width={6400} height={4400} fill="url(#gMajor)" />
      {/* moon and dimension lines over the house */}
      <circle cx={260} cy={-820} r={70} fill="none" stroke={SOFT} strokeWidth={4} />
      <circle cx={260} cy={-820} r={70} fill={fillOf(l, "#fff2c8", "rgba(220,235,255,0.06)")} />
      <g stroke={SOFT} strokeWidth={3}>
        <line x1={640} y1={-960} x2={1430} y2={-960} /><line x1={640} y1={-985} x2={640} y2={-935} /><line x1={1430} y1={-985} x2={1430} y2={-935} />
        <line x1={1560} y1={0} x2={1560} y2={-590} /><line x1={1535} y1={0} x2={1585} y2={0} /><line x1={1535} y1={-590} x2={1585} y2={-590} />
        <line x1={-40} y1={140} x2={424} y2={140} /><line x1={-40} y1={115} x2={-40} y2={165} /><line x1={424} y1={115} x2={424} y2={165} />
      </g>
      {/* street: houses across the road, lamps */}
      {[-2300, -1850, -1400, -950].map((hx, i) => (
        <g key={hx} stroke={SOFT} strokeWidth={4} fill={fillOf(l, "#3b4a6b", "rgba(120,170,240,0.06)")}>
          <path d={`M${hx} 0 L${hx} ${-220 - i * 20} L${hx + 170} ${-330 - i * 20} L${hx + 340} ${-220 - i * 20} L${hx + 340} 0 Z`} />
          <rect x={hx + 60} y={-160 - i * 20} width={60} height={60} fill={i % 2 ? "rgba(255,214,150,0.6)" : "none"} />
        </g>
      ))}
      {[-2050, -1150, -350].map((lx) => (
        <g key={lx}>
          <circle cx={lx + 40} cy={-360} r={150} fill="url(#lamp)" />
          <path d={`M${lx} 0 L${lx} -380 Q${lx} -400 ${lx + 40} -390`} stroke={s} strokeWidth={6} fill="none" />
          <rect x={lx + 26} y={-392} width={34} height={14} fill="#ffe3a8" />
        </g>
      ))}
      {/* ground, snow and earth */}
      <rect x={-3000} y={40} width={6400} height={1500} fill="url(#hatch)" />
      <rect x={-3000} y={0} width={6400} height={40} fill={fillOf(l, "#7c8796", "rgba(160,200,255,0.12)")} stroke={s} strokeWidth={4} />
      <path clipPath="url(#outsideHouse)" d={`M-3000 0 ${Array.from({ length: 64 }).map((_, i) => `Q${-3000 + i * 100 + 50} ${-14 - rnd(i) * 18} ${-2900 + i * 100} 0`).join(" ")}`} fill={fillOf(l, "#ffffff", "rgba(240,248,255,0.5)")} stroke={s} strokeWidth={3} />
      {/* the water service and sewer line running under the driveway to the street, as a section shows them */}
      <g stroke={LINE} strokeWidth={4} fill={fillOf(l, "#6d7f99", "rgba(10,25,55,0.5)")}>
        <rect x={-3000} y={250} width={3640} height={34} />
        <rect x={-3000} y={330} width={3640} height={50} />
        <rect x={-1250} y={40} width={90} height={260} fill={fillOf(l, "#59677d", "rgba(10,25,55,0.6)")} />
        {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={-1240} y1={70 + i * 26} x2={-1170} y2={70 + i * 26} stroke={SOFT} strokeWidth={3} />)}
        <rect x={-600} y={244} width={26} height={46} fill="none" /><rect x={200} y={244} width={26} height={46} fill="none" />
      </g>
      {/* fence and tree right of the house */}
      <g stroke={SOFT} strokeWidth={4}>
        {[1500, 1560, 1620, 1680, 1740, 1800].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={-150} />)}
        <line x1={1480} y1={-120} x2={1820} y2={-120} /><line x1={1480} y1={-50} x2={1820} y2={-50} />
        <path d="M1950 0 L1950 -260 M1950 -180 L1890 -260 M1950 -210 L2020 -300" fill="none" />
      </g>

      {/* ===== house section ===== */}
      {/* basement */}
      <rect x={640} y={40} width={790} height={380} fill={fillOf(l, "#4a5770", "rgba(10,25,55,0.45)")} stroke={s} strokeWidth={5} />
      <rect x={610} y={420} width={850} height={44} fill="url(#hatch)" stroke={s} strokeWidth={4} />
      <g stroke={SOFT} strokeWidth={4} fill="none">
        {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M${700 + i * 26} ${60 + i * 50} l26 0 l0 50`} />)}
        <rect x={1180} y={220} width={110} height={200} fill={fillOf(l, "#8a96a8")} /><rect x={1200} y={250} width={70} height={40} />
        <rect x={1320} y={230} width={80} height={190} rx={36} fill={fillOf(l, "#c9ced8")} />
      </g>
      {/* floors, walls, roof */}
      <rect x={640} y={0} width={790} height={40} fill={fillOf(l, "#9a7a58")} stroke={s} strokeWidth={4} />
      <rect x={670} y={-560} width={730} height={560} fill={fillOf(l, "#f1e6d2", "rgba(15,35,70,0.35)")} />
      <rect x={1160} y={-560} width={240} height={390} fill="url(#tile)" />
      <rect x={640} y={-590} width={30} height={190} fill={fillOf(l, "#d8cbb4")} stroke={s} strokeWidth={4} />
      <rect x={1400} y={-590} width={30} height={590} fill={fillOf(l, "#d8cbb4")} stroke={s} strokeWidth={4} />
      <rect x={800} y={-590} width={20} height={170} fill={fillOf(l, "#d8cbb4")} stroke={s} strokeWidth={4} />
      <rect x={640} y={-590} width={790} height={30} fill={fillOf(l, "#d8cbb4")} stroke={s} strokeWidth={4} />
      {/* front door, open */}
      <path d="M670 -400 L728 -380 L728 -14 L670 0" fill={fillOf(l, "#8c5a3c")} stroke={s} strokeWidth={4} />
      <path d="M600 -590 L1035 -860 L1470 -590 Z" fill={fillOf(l, "#6e5847")} stroke={s} strokeWidth={5} strokeLinejoin="round" />
      <path d="M700 -600 L1035 -810 L1370 -600" fill="none" stroke={SOFT} strokeWidth={3} />
      {/* coat hook in the entry */}
      <path d="M700 -340 l40 0 M720 -340 l0 120" stroke={SOFT} strokeWidth={4} />
      {/* window over the tub */}
      <rect x={1225} y={-500} width={140} height={160} fill={fillOf(l, "#ffcf87", "rgba(255,200,130,0.35)")} stroke={s} strokeWidth={4} />
      <line x1={1295} y1={-500} x2={1295} y2={-340} stroke={s} strokeWidth={3} /><line x1={1225} y1={-420} x2={1365} y2={-420} stroke={s} strokeWidth={3} />
      {/* wall clock */}
      <g transform="translate(1120 -440)">
        <circle r={38} fill={fillOf(l, "#ffffff")} stroke={s} strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={-22} stroke={s} strokeWidth={5} transform={`rotate(${clockSpin / 12})`} />
        <line x1={0} y1={0} x2={0} y2={-31} stroke={C.orange} strokeWidth={3} transform={`rotate(${clockSpin})`} />
      </g>
      {/* mirror, light, switch */}
      <rect x={885} y={-520} width={170} height={200} rx={10} fill={fillOf(l, "#cfe3f0", "rgba(200,225,255,0.12)")} stroke={s} strokeWidth={4} />
      <line x1={905} y1={-500} x2={955} y2={-450} stroke={SOFT} strokeWidth={3} />
      <rect x={905} y={-552} width={130} height={18} rx={9} fill={light ? "#fff1c2" : fillOf(l, "#d0d0d0")} stroke={s} strokeWidth={3} />
      <rect x={1085} y={-345} width={20} height={32} rx={3} fill="none" stroke={s} strokeWidth={3} />
      {/* the invoice pinned on the mirror (beat 6) */}
      {invoicePin ? (
        <g transform={`translate(970 ${lerp(-470, -420, pinIn)}) rotate(${(1 - pinIn) * -12 + 3}) scale(${0.6 + 0.4 * pinIn})`} opacity={Math.min(1, pinIn * 1.5)}>
          <rect x={-58} y={-70} width={116} height={146} fill="#f7fbff" stroke={s} strokeWidth={3} />
          <text x={0} y={-36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill="#123f78">INVOICE</text>
          {[0, 1, 2, 3].map((k) => <line key={k} x1={-40} y1={-12 + k * 18} x2={k === 3 ? 10 : 40} y2={-12 + k * 18} stroke="#7d9cc4" strokeWidth={5} />)}
          <rect x={-40} y={52} width={80} height={12} fill={C.orange} />
          <circle cx={0} cy={-64} r={9} fill={C.orange} stroke={s} strokeWidth={2} />
        </g>
      ) : null}
      {/* vanity: counter, basin, tap, three doors */}
      <rect x={860} y={-252} width={225} height={22} fill={fillOf(l, "#e9e4dc")} stroke={s} strokeWidth={4} />
      <rect x={868} y={-230} width={210} height={210} fill={fillOf(l, "#3a2a20", "rgba(5,20,45,0.6)")} stroke={s} strokeWidth={4} />
      <path d="M930 -252 Q970 -210 1010 -252" fill="none" stroke={s} strokeWidth={4} />
      <path d="M968 -252 L968 -292 Q968 -306 990 -306 L998 -306" fill="none" stroke={s} strokeWidth={7} strokeLinecap="round" />
      {tapRun ? <line x1={996} y1={-300} x2={996} y2={-250} stroke="#9fe0ff" strokeWidth={7} strokeDasharray="10 8" strokeDashoffset={-f * 4} /> : null}
      {[0, 1, 2].map((k) => {
        const open = Math.max(doorsOpen[k], k === 2 ? catchDoor : 0);
        const x0 = 868 + k * 70;
        const w = 70 * Math.cos(open * 1.35);
        return (
          <g key={k}>
            <rect x={x0} y={-226} width={70} height={202} fill="rgba(0,10,25,0.75)" />
            <rect x={x0} y={-226} width={Math.max(4, w)} height={202} fill={fillOf(l, "#b07a4a", "rgba(70,120,190,0.95)")} stroke={s} strokeWidth={4} />
            {open > 0.1 ? <path d={`M${x0 + w} -226 L${x0 + w + 26 * Math.sin(open * 1.35)} -236 L${x0 + w + 26 * Math.sin(open * 1.35)} -14 L${x0 + w} -24 Z`} fill={fillOf(l, "#93603a", "rgba(90,140,210,0.95)")} stroke={s} strokeWidth={3} /> : null}
            <line x1={x0 + Math.max(4, w) - 14} y1={-140} x2={x0 + Math.max(4, w) - 14} y2={-110} stroke={s} strokeWidth={5} />
          </g>
        );
      })}
      {catchDoor > 0.5 ? (
        <g stroke={C.orange} strokeWidth={6} strokeLinecap="round" opacity={interpolate(f, [B[3] + 84, B[3] + 90, B[3] + 120], [0, 1, 0.6], clamp)}>
          <line x1={1078} y1={-238} x2={1100} y2={-262} /><line x1={1084} y1={-226} x2={1114} y2={-236} /><line x1={1080} y1={-214} x2={1112} y2={-206} />
        </g>
      ) : null}
      {/* tub and its caulk line */}
      <path d="M1160 -170 L1398 -170 L1398 -40 Q1398 0 1350 0 L1200 0 Q1160 0 1160 -40 Z" fill={fillOf(l, "#fbfbf8")} stroke={s} strokeWidth={5} />
      <line x1={1170} y1={-150} x2={1388} y2={-150} stroke={SOFT} strokeWidth={3} />
      {!fixed ? (
        <g>
          <line x1={1160} y1={-172} x2={1398} y2={-172} stroke={C.orange} strokeWidth={22} opacity={f >= B[3] && f < B[4] ? 0.35 * caulkPulse : 0.15} />
          <line x1={1160} y1={-172} x2={1398} y2={-172} stroke={C.orange} strokeWidth={9} />
        </g>
      ) : (
        <g>
          <line x1={bead} y1={-172} x2={1398} y2={-172} stroke={C.orange} strokeWidth={9} />
          <line x1={1160} y1={-172} x2={bead} y2={-172} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" />
        </g>
      )}
      {/* room glow once the light is on */}
      {lightGlow > 0 ? <ellipse cx={970} cy={-420} rx={420} ry={360} fill="#ffe2a6" opacity={0.16 * lightGlow * (1 - warm * 0.5)} /> : null}

      {/* van and the toolbox */}
      <g clipPath="url(#vanRear)">
        {f < B[1] ? <g transform={`translate(${lerp(612, 556, tbIn) - lerp(70, 116, tbIn)} -150)`}><Toolbox l={l} /></g> : null}
      </g>
      {f >= B[6] && f < B[7] ? <g transform={`translate(${lerp(380, 500, tbOut)} ${f < B[7] ? lerp(-150, 0, tbOut) : 0})`} opacity={f >= B[6] + 46 ? 1 : 0}><Toolbox l={l} /></g> : null}
      <Van x={vanX} l={l} rearOpen={rearOpen} slide={slide} screen={screen} wheel={wheel} />
      {people}
      {/* the text bubble from the phone on the dash */}
      {bubbleAlpha > 0.01 ? (
        <g transform={`translate(190 -400) scale(${0.7 + 0.3 * Math.min(1, bubbleAlpha)})`} opacity={Math.min(1, bubbleAlpha)}>
          <rect x={-170} y={-62} width={420} height={110} rx={34} fill={C.orange} stroke="#fff" strokeWidth={4} />
          <path d="M-110 46 L-150 120 L-50 46 Z" fill={C.orange} />
          <text x={40} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill="#fff">Just one more thing...</text>
        </g>
      ) : null}
    </g>
  );
};

// ---------------- the van's dash, looking out through the windshield ----------------
const Dash: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const drive = f >= B[4];
  const b = f - (drive ? B[4] : B[1]);
  const push = drive ? 1 + ease(f, B[4], B[5]) * 0.06 : f < B[2] ? 1 + ease(f, B[1], B[2]) * 0.06 : lerp(1.06, 1.22, ease(f, B[2] + 40, B[3]));
  const bump = drive ? Math.sin(f / 3.1) * 3 + Math.sin(f / 7.3) * 2 : 0;
  // beat 2: tap send, the invoice flies off out through the windshield
  const tap = f < B[2] ? interpolate(f, [B[1] + 50, B[1] + 58, B[1] + 66], [0, 1, 0], clamp) : 0;
  const fly = f < B[2] ? ease(f, B[1] + 62, B[1] + 100) : 1;
  // beat 3: three calendar pages, then a buzz and the bubble
  const pages = f >= B[2] ? [0, 1, 2].map((k) => ease(f, B[2] + 8 + k * 14, B[2] + 18 + k * 14)) : [0, 0, 0];
  const day = 1 + pages.filter((p) => p > 0.5).length - (f >= B[2] ? 0 : 1);
  const buzzing = f >= B[2] + 52 && f < B[2] + 78;
  const buzz = buzzing ? Math.sin(f * 2.6) * 7 : 0;
  const bubble = f >= B[2] ? spring({ frame: f - B[2] - 54, fps, config: { damping: 11 } }) : 0;
  const wipe = drive ? Math.sin(b / 7) : 0;
  const screenOn = !drive && (f < B[2] || f >= B[2] + 50);

  return (
    <AbsoluteFill style={{ background: "#0d2a52" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <pattern id="dGrid" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M40 0 L0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1.5} /></pattern>
          <clipPath id="glass"><path d="M60 300 L1020 300 L1060 1090 L20 1090 Z" /></clipPath>
        </defs>
        <g transform={`translate(540 ${1000 + bump}) scale(${push}) translate(-640 -1000)`}>
          <rect x={-200} y={-200} width={1500} height={2400} fill={BG} />
          <rect x={-200} y={-200} width={1500} height={2400} fill="url(#dGrid)" />
          {/* outside, through the glass */}
          <g clipPath="url(#glass)">
            <rect x={0} y={280} width={1080} height={820} fill={drive ? "#0b2346" : "#183f73"} />
            {!drive ? (
              <g stroke={LINE} strokeWidth={4} fill="rgba(120,170,240,0.10)">
                <path d="M0 930 Q300 905 540 925 T1080 915 L1080 1100 L0 1100 Z" fill="rgba(240,248,255,0.35)" />
                <path d="M300 930 L300 640 L540 470 L780 640 L780 930 Z" />
                <rect x={500} y={780} width={80} height={150} />
                <rect x={350} y={780} width={100} height={80} /><rect x={630} y={780} width={100} height={80} />
                <rect x={480} y={600} width={120} height={100} fill="#ffcf87" />
                <circle cx={540} cy={650} r={110} fill="#ffcf87" opacity={0.18} stroke="none" />
                <path d="M300 640 L540 470 L780 640" fill="none" strokeWidth={8} />
              </g>
            ) : (
              <g>
                <path d="M540 640 L-300 1100 L1380 1100 Z" fill="#163a66" />
                <path d="M540 640 L-300 1100 M540 640 L1380 1100" stroke={LINE} strokeWidth={4} />
                {Array.from({ length: 6 }).map((_, i) => {
                  const t = ((b * 0.02 + i / 6) % 1);
                  const y = 640 + Math.pow(t, 2.2) * 460;
                  return <line key={i} x1={540} y1={y} x2={540} y2={y + 6 + t * t * 60} stroke={C.orange} strokeWidth={2 + t * 14} />;
                })}
                {Array.from({ length: 4 }).map((_, i) => {
                  const t = ((b * 0.012 + i / 4) % 1);
                  const side = i % 2 ? 1 : -1;
                  const x = 540 + side * (40 + Math.pow(t, 2) * 900), y = 600 - Math.pow(t, 2) * 500;
                  return (
                    <g key={i} opacity={Math.min(1, t * 4)}>
                      <circle cx={x} cy={y} r={30 + t * 140} fill="#ffd59a" opacity={0.18} />
                      <line x1={x} y1={y} x2={x} y2={640 + Math.pow(t, 2) * 460} stroke={LINE} strokeWidth={2 + t * 8} />
                    </g>
                  );
                })}
              </g>
            )}
            {/* snow */}
            {Array.from({ length: 70 }).map((_, i) => {
              const sp = drive ? 7 : 1.6;
              const y = 280 + ((rnd(i) * 820 + f * sp * (0.6 + rnd(i + 3))) % 820);
              const x = drive ? 540 + (rnd(i + 9) - 0.5) * 1200 * ((y - 280) / 820 + 0.2) : rnd(i + 9) * 1080 + Math.sin(f / 20 + i) * 14;
              return <circle key={i} cx={x} cy={y} r={2 + rnd(i + 5) * 4} fill="#fff" opacity={0.75} />;
            })}
            {/* the invoice flying out toward the house */}
            {f < B[2] && fly > 0 && fly < 1 ? (
              <g transform={`translate(${lerp(710, 540, fly)} ${lerp(930, 640, fly)}) scale(${lerp(1, 0.15, fly)})`} opacity={1 - fly * 0.6}>
                <rect x={-90} y={-110} width={180} height={220} fill="#f7fbff" stroke={LINE} strokeWidth={4} />
                <text x={0} y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#123f78">INVOICE</text>
                {[0, 1, 2].map((k) => <line key={k} x1={-60} y1={-20 + k * 30} x2={60} y2={-20 + k * 30} stroke="#7d9cc4" strokeWidth={8} />)}
              </g>
            ) : null}
          </g>
          {/* wipers: resting flat when parked, sweeping while driving */}
          {[260, 700].map((wx) => {
            const ang = drive ? -0.08 - 1.45 * (0.5 + 0.5 * wipe) : -0.06;
            return <line key={wx} x1={wx} y1={1082} x2={wx + 380 * Math.cos(ang)} y2={1082 + 380 * Math.sin(ang)} stroke="#0a1426" strokeWidth={12} strokeLinecap="round" />;
          })}
          {/* frame of the glass, roof trim, mirror */}
          <path d="M60 300 L1020 300 L1060 1090 L20 1090 Z" fill="none" stroke={LINE} strokeWidth={10} />
          <rect x={-200} y={180} width={1500} height={120} fill="#0f2d58" stroke={LINE} strokeWidth={5} />
          <rect x={470} y={300} width={140} height={60} rx={14} fill="#0f2d58" stroke={LINE} strokeWidth={5} />
          {/* dash */}
          <path d="M-200 1090 L1300 1090 L1300 1420 L-200 1420 Z" fill="#163a66" stroke={LINE} strokeWidth={6} />
          {[120, 860].map((vx) => <rect key={vx} x={vx} y={1150} width={120} height={50} rx={10} fill="none" stroke={SOFT} strokeWidth={4} />)}
          {Array.from({ length: 5 }).map((_, i) => <line key={i} x1={130} y1={1160 + i * 9} x2={230} y2={1160 + i * 9} stroke={SOFT} strokeWidth={2} />)}
          {/* flip calendar */}
          <g transform="translate(330 960)">
            <rect x={0} y={0} width={170} height={135} rx={8} fill="#f7fbff" stroke={LINE} strokeWidth={4} />
            <rect x={0} y={0} width={170} height={34} rx={8} fill={C.orange} />
            <text x={85} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#123f78">{`DAY ${Math.min(3, Math.max(1, day))}`}</text>
            {pages.map((p, k) => p > 0 && p < 1 ? (
              <g key={k} transform={`translate(0 34) scale(1 ${Math.cos(p * Math.PI)})`}><rect x={0} y={0} width={170} height={101} fill="#e3eefc" stroke={LINE} strokeWidth={3} /></g>
            ) : null)}
            {[40, 130].map((rx) => <circle key={rx} cx={rx} cy={8} r={7} fill="#123f78" />)}
          </g>
          {/* phone on its mount */}
          <rect x={690} y={1210} width={40} height={90} fill="#0f2d58" stroke={LINE} strokeWidth={4} />
          <g transform={`translate(${710 + buzz} 1000)`}>
            <rect x={-130} y={-230} width={260} height={460} rx={34} fill="#0a1426" stroke={LINE} strokeWidth={6} />
            <rect x={-112} y={-205} width={224} height={410} rx={18} fill={screenOn ? "#e8f1ff" : "#0d1d36"} />
            {screenOn && f < B[2] ? (
              <g>
                <g transform={`translate(0 ${-fly * 30})`} opacity={1 - fly}>
                  <text x={0} y={-150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#123f78">INVOICE</text>
                  {[0, 1, 2, 3].map((k) => <line key={k} x1={-80} y1={-100 + k * 34} x2={k === 3 ? 20 : 80} y2={-100 + k * 34} stroke="#9bb6da" strokeWidth={10} />)}
                </g>
                <rect x={-80} y={110} width={160} height={58} rx={29} fill={fly > 0.5 ? "#2e9d5b" : C.orange} transform={`scale(${1 - tap * 0.08})`} />
                <text x={0} y={150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">{fly > 0.5 ? "SENT" : "SEND"}</text>
              </g>
            ) : null}
            {screenOn && f >= B[2] ? (
              <g transform={`scale(${bubble})`}>
                <rect x={-100} y={-60} width={200} height={110} rx={26} fill={C.orange} />
                <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">Hey, just one</text>
                <text x={0} y={24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">little thing.</text>
              </g>
            ) : null}
            {buzzing ? <g stroke={C.orange} strokeWidth={6} strokeLinecap="round"><path d="M-160 -60 l-30 -10 M-160 0 l-36 0 M-160 60 l-30 10 M160 -60 l30 -10 M160 0 l36 0 M160 60 l30 10" /></g> : null}
          </g>
          {/* steering wheel, seat, the caulk tube on the passenger seat */}
          <path d="M-200 1420 L1300 1420 L1300 2200 L-200 2200 Z" fill="#0f2d58" />
          <circle cx={170} cy={1620} r={330} fill="none" stroke={LINE} strokeWidth={34} />
          <circle cx={170} cy={1620} r={330} fill="none" stroke="#0f2d58" strokeWidth={20} />
          <circle cx={170} cy={1620} r={90} fill="#163a66" stroke={LINE} strokeWidth={6} />
          <path d="M800 1480 Q1100 1460 1300 1500 L1300 2200 L760 2200 Z" fill="#183f73" stroke={LINE} strokeWidth={6} />
          <path d="M840 1600 Q1060 1580 1300 1620" fill="none" stroke={SOFT} strokeWidth={4} />
          {drive ? (
            <g transform="translate(980 1545) rotate(-14)">
              <rect x={-100} y={-24} width={200} height={48} rx={10} fill="#f7fbff" stroke={LINE} strokeWidth={4} />
              <rect x={-60} y={-24} width={60} height={48} fill={C.orange} />
              <path d="M100 -10 L170 0 L100 10 Z" fill="#f7fbff" stroke={LINE} strokeWidth={3} />
            </g>
          ) : null}
          {/* the pro's arm reaching for the phone: hi-vis sleeve from the bottom of frame */}
          {!drive && f < B[2] ? (
            <g transform={`translate(${tap * -10} ${tap * 16})`}>
              <path d="M330 2100 Q460 1500 680 1150" stroke={LINE} strokeWidth={110} strokeLinecap="round" fill="none" />
              <path d="M330 2100 Q460 1500 680 1150" stroke="#3d5a80" strokeWidth={96} strokeLinecap="round" fill="none" />
              <path d="M430 1640 L520 1600" stroke={C.orange} strokeWidth={26} />
              <circle cx={690} cy={1135} r={50} fill={SKIN} stroke={LINE} strokeWidth={5} />
            </g>
          ) : null}
          {drive ? (
            <g>
              <path d="M-60 2100 Q20 1700 40 1480" stroke={LINE} strokeWidth={104} strokeLinecap="round" fill="none" />
              <path d="M-60 2100 Q20 1700 40 1480" stroke="#3d5a80" strokeWidth={90} strokeLinecap="round" fill="none" />
              <circle cx={50} cy={1420} r={50} fill={SKIN} stroke={LINE} strokeWidth={5} />
            </g>
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------- camera through the world drawing ----------------
type Cam = [number, number, number];
const SHOTS: [number, number, Cam, Cam, number?, number?][] = [
  [B[0], B[1], [330, -150, 1.25], [350, -170, 1.45]],
  [B[3], B[3] + 58, [1278, -240, 2.15], [1278, -235, 2.5]],
  [B[3] + 58, B[4], [1278, -235, 2.5], [985, -175, 2.35], 0, 24],
  [B[5], B[6], [975, -400, 2.3], [1040, -410, 2.85]],
  [B[6], B[7], [-360, -150, 1.2], [240, -150, 1.25], 0, 40],
  [B[7], B[8], [1070, -300, 1.45], [1010, -275, 1.8]],
  [B[8], B[9], [985, -290, 1.95], [1010, -310, 1.7]],
  [B[9], B[10], [1210, -215, 2.0], [1265, -190, 2.3]],
  [B[10], B[11], [1030, -285, 1.9], [995, -275, 2.2]],
  [B[11], B[12], [1040, -285, 1.7], [700, -230, 0.74], 12, 110],
  [B[12], TOTAL, [700, -230, 0.74], [690, -240, 0.8]],
];
const camAt = (f: number): Cam => {
  for (const [a, b, c0, c1, d0 = 0, d1] of SHOTS) {
    if (f >= a && f < b) {
      const t = ease(f, a + d0, d1 === undefined ? b : a + d1);
      return [lerp(c0[0], c1[0], t), lerp(c0[1], c1[1], t), lerp(c0[2], c1[2], t)];
    }
  }
  return SHOTS[0][2];
};

const Snow: React.FC<{ f: number; amount: number }> = ({ f, amount }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 80 }).map((_, i) => {
      const y = (rnd(i) * 1920 + f * (2 + rnd(i + 3) * 2)) % 1920;
      const x = (rnd(i + 9) * 1080 + Math.sin(f / 22 + i) * 18) % 1080;
      return <circle key={i} cx={x} cy={y} r={2.5 + rnd(i + 5) * 4} fill="#fff" opacity={0.55 * amount} />;
    })}
  </svg>
);

export const FinalPayment: React.FC = () => {
  const frame = useCurrentFrame();
  const inDash = (frame >= B[1] && frame < B[3]) || (frame >= B[4] && frame < B[5]);
  const [cx, cy, z] = camAt(frame);
  const outside = frame < B[1] || (frame >= B[6] && frame < B[7]) || frame >= B[11] + 80;
  const rewind = frame >= B[6] && frame < B[7];
  return (
    <AbsoluteFill style={{ background: BG }}>
      {inDash ? <Dash f={frame} /> : (
        <AbsoluteFill>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920">
            <g transform={`translate(540 1060) scale(${z}) translate(${-cx} ${-cy})`}><World f={frame} /></g>
          </svg>
          {outside ? <Snow f={frame} amount={1} /> : null}
        </AbsoluteFill>
      )}
      {rewind ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: ((frame * 37 + i * 400) % 1920), height: 6, background: "rgba(255,255,255,0.18)" }} />
          ))}
          <div style={{ position: "absolute", bottom: 240, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 120, color: C.orange,
            opacity: 0.6 + 0.4 * Math.sin(frame / 3), textShadow: "0 6px 0 rgba(0,0,0,.4)" }}>◀◀</div>
        </AbsoluteFill>
      ) : null}
      <Caption text="Don't load the van yet." from={B[0]} to={B[1]} size={118} />
      <Caption text="Invoice sent from the driveway" from={B[1]} to={B[2]} size={104} />
      <Caption text={'Three days later: "One little thing"'} from={B[2]} to={B[3]} size={100} />
      <Caption text="The caulk. The cabinet door." from={B[3]} to={B[4]} size={104} />
      <Caption text="Back across town. For caulk." from={B[4]} to={B[5]} size={104} />
      <Caption text="Last payment: still waiting" from={B[5]} to={B[6]} size={104} />
      <Caption text="Here's the fix." from={B[6]} to={B[7]} size={124} />
      <Caption text="Walk it with the client first" from={B[7]} to={B[8]} size={104} />
      <Caption text="Doors, taps, good light" from={B[8]} to={B[9]} size={108} />
      <Caption text="Fix it while the tools are out" from={B[9]} to={B[10]} size={100} />
      <Caption text="Go over the invoice together" from={B[10]} to={B[11]} size={104} />
      <Caption text="Nothing left to hold it up" from={B[11]} to={B[12]} size={104} />
      <CommentCard from={B[12]} question="Smallest thing that held you up?" prompt="Pros: tell us below" />
      <Voice name="payment" starts={B} />
      {/* one bed under everything, then a sound only on the actions that matter */}
      <Sfx name="payment/wind" at={0} volume={0.22} />
      <Sfx name="payment/buzz" at={36} volume={0.45} />
      <Sfx name="payment/whoosh" at={B[1] + 62} volume={0.3} />
      <Sfx name="payment/buzz" at={B[2] + 52} volume={0.45} />
      <Sfx name="payment/catch" at={B[3] + 84} volume={0.5} />
      <Sfx name="payment/ticks" at={B[5] + 10} volume={0.25} />
      <Sfx name="payment/rewind" at={B[6]} volume={0.45} />
      <Sfx name="payment/click" at={B[8] + 112} volume={0.4} />
      <Sfx name="payment/slam" at={B[11] + 112} volume={0.45} />
      <Sfx name="payment/chime" at={B[12] + 14} volume={0.35} />
      <Progress />
    </AbsoluteFill>
  );
};
export const finalPaymentFrames = TOTAL;
