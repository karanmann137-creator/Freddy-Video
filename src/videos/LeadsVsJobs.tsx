// "Still paying for leads?" — recruit type for pros, isometric look (tool bench and a Calgary street map). Everything is drawn in code.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Caption, CommentCard, Progress, Sfx, VoiceClip, clamp } from "../kit";

const rnd = (i: number) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (f: number, a: number, b: number) => { const t = interpolate(f, [a, b], [0, 1], clamp); return t * t * (3 - 2 * t); };
type V3 = [number, number, number];

// each voice line starts 10 frames into its beat and is followed by about 20+ frames of quiet
const T = { pay: 118, map: 260, quote: 390, nopay: 510, card: 590, total: 697 };

const Box: React.FC<{ p: V3; s: V3; c: string; r?: V3; glow?: number }> = ({ p, s, c, r = [0, 0, 0], glow = 0 }) => (
  <mesh position={p} rotation={r}><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={0.7} emissive={c} emissiveIntensity={glow} /></mesh>
);
const Coin: React.FC<{ p: V3; spin?: number }> = ({ p, spin = 0 }) => (
  <mesh position={p} rotation={[spin, 0, 0.3 * spin]}><cylinderGeometry args={[0.24, 0.24, 0.06, 28]} /><meshStandardMaterial color="#ffc933" metalness={0.6} roughness={0.35} emissive="#a87800" emissiveIntensity={0.4} /></mesh>
);
const hop = (a: V3, b: V3, t: number, h: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t) + 4 * h * t * (1 - t), lerp(a[2], b[2], t)];

// the van: white body, dark windows; `tray` adds the open card tray on the roof; `lit` turns the headlights on
const Van: React.FC<{ p: V3; tray?: boolean; lit?: boolean }> = ({ p, tray, lit }) => (
  <group position={p}>
    <Box p={[0, 0.65, 0]} s={[2.6, 0.9, 1.2]} c="#f2f4fa" />
    <Box p={[1.0, 0.55, 0]} s={[0.9, 0.7, 1.2]} c="#e2e6f2" />
    <Box p={[1.3, 0.85, 0]} s={[0.35, 0.35, 1.0]} c="#1b2a55" />
    <Box p={[0, 1.15, 0]} s={[2.6, 0.1, 1.2]} c="#ea6b14" />
    {[[-0.8, 0.62], [0.9, 0.62], [-0.8, -0.62], [0.9, -0.62]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.28, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.3, 0.3, 0.2, 20]} /><meshStandardMaterial color="#1a1d2a" /></mesh>
    ))}
    <Box p={[1.48, 0.45, 0.4]} s={[0.06, 0.16, 0.2]} c={lit ? "#fff3a0" : "#6b6f80"} glow={lit ? 1.2 : 0} />
    <Box p={[1.48, 0.45, -0.4]} s={[0.06, 0.16, 0.2]} c={lit ? "#fff3a0" : "#6b6f80"} glow={lit ? 1.2 : 0} />
    {tray ? <Box p={[-0.4, 1.28, 0]} s={[1.3, 0.1, 1.0]} c="#c4501a" /> : null}
  </group>
);

const Card: React.FC<{ p: V3; hit: boolean; r?: V3 }> = ({ p, hit, r }) => (
  <group position={p} rotation={r}>
    <Box p={[0, 0, 0]} s={[0.82, 0.05, 0.56]} c="#ffffff" />
    <Box p={[-0.22, 0.04, 0]} s={[0.22, 0.03, 0.22]} c={hit ? "#ea6b14" : "#8d97b5"} />
    <Box p={[0.12, 0.04, -0.1]} s={[0.34, 0.03, 0.06]} c="#c3cbe0" />
    <Box p={[0.12, 0.04, 0.08]} s={[0.24, 0.03, 0.06]} c="#c3cbe0" />
  </group>
);

// ---------- the bench (beats 1, 2, 4, 5) ----------
const Bench: React.FC<{ f: number }> = ({ f }) => {
  const MACH: V3 = [-1.0, 1.5, -0.4];
  const SLOT_Y = 2.03;
  const WALLET: V3 = [1.4, 1.14, 0.35];
  // beat 1: one coin drops in, a blank card slides out
  const drop = ease(f, 6, 30);
  const coin1: V3 = [MACH[0], lerp(4.2, SLOT_Y, drop), MACH[2]];
  const cardOut = ease(f, 34, 62);
  // beat 2: coins hop out of the wallet into the slot, the phone rings, nobody answers
  const b2 = f - T.pay;
  const hops = [8, 40, 72].map((s) => interpolate(b2, [s, s + 24], [0, 1], clamp));
  const ring = (k: number) => ((b2 - 28 + k * 12) % 36) / 36;
  const ringing = b2 > 28 && f < T.map;
  const buzz = ringing ? Math.sin(f * 2.4) * 0.06 : 0;
  // beat 4: cards on the bench, the pro flicks through, taps one, swipes the rest away
  const q = f - T.quote;
  const finger = interpolate(q, [4, 38], [-1.9, 1.9], clamp);
  const tap = interpolate(q, [44, 52, 60], [0, 1, 0], clamp);
  const sel = ease(q, 50, 62);
  const swipe = ease(q, 70, 100);
  // beat 5: a lid closes over the slot and the coin goes back
  const n = f - T.nopay;
  const lid = ease(n, 8, 32);
  const back = interpolate(n, [38, 66], [0, 1], clamp);
  const showCards = f >= T.quote && f < T.nopay;
  return (
    <group>
      {/* floor tile and bench */}
      <Box p={[0, -0.1, 0]} s={[7.6, 0.2, 7.6]} c="#2d3d66" />
      <Box p={[0, 0.9, 0]} s={[4.2, 0.2, 1.9]} c="#c98b4f" />
      {[[-1.9, -0.75], [1.9, -0.75], [-1.9, 0.75], [1.9, 0.75]].map(([x, z], i) => <Box key={i} p={[x, 0.4, z]} s={[0.22, 0.8, 0.22]} c="#8f5d2e" />)}
      <Box p={[0, 0.5, 0]} s={[3.6, 0.1, 1.4]} c="#a6743b" />
      {/* the lead machine: a box with a coin slot, and a blank card sliding out of its front */}
      <Box p={MACH} s={[1.0, 1.0, 1.0]} c="#ea6b14" />
      <Box p={[MACH[0], SLOT_Y - 0.02, MACH[2]]} s={[0.6, 0.05, 0.12]} c="#1a1d2a" />
      <Box p={[MACH[0], 1.55, MACH[2] + 0.5]} s={[0.5, 0.22, 0.04]} c="#c4501a" />
      {f >= 34 && f < T.quote ? <Box p={[MACH[0], 1.56, MACH[2] + 0.5 + cardOut * 0.7]} s={[0.78, 0.03, 0.5]} c="#ffffff" /> : null}
      {f >= 6 && f < 30 ? <Coin p={coin1} spin={f * 0.5} /> : null}
      {/* the wallet */}
      <Box p={WALLET} s={[0.8, 0.14, 0.55]} c="#7a4a2a" />
      <Box p={[WALLET[0] + 0.1, WALLET[1] + 0.06, WALLET[2] + 0.05]} s={[0.5, 0.05, 0.3]} c="#6a3e22" />
      {hops.map((t, i) => (t > 0 && t < 1 ? <Coin key={i} p={hop([WALLET[0], WALLET[1] + 0.2, WALLET[2]], [MACH[0] + 0.1, SLOT_Y + 0.1, MACH[2]], t, 1.7)} spin={f * 0.6 + i} /> : null))}
      {/* the phone rings and rings (beat 2 only) */}
      {f >= T.pay && f < T.map ? (
        <group position={[0.3 + buzz, 1.07, 0.5]} rotation={[0, 0.5 + buzz * 2, 0]}>
          <Box p={[0, 0, 0]} s={[0.6, 0.1, 1.0]} c="#1d2438" />
          <Box p={[0, 0.06, 0]} s={[0.5, 0.02, 0.86]} c={ringing && Math.floor(f / 6) % 2 ? "#7cc4ff" : "#3b5a99"} glow={ringing ? 0.6 : 0} />
          {ringing ? [0, 1, 2].map((k) => { const t = ring(k); return (
            <mesh key={k} position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.5 + t * 2.2}><ringGeometry args={[0.8, 0.9, 40]} /><meshBasicMaterial color="#7cc4ff" transparent opacity={(1 - t) * 0.9} /></mesh>
          ); }) : null}
        </group>
      ) : null}
      {/* beat 4: the cards laid out on the bench */}
      {showCards ? (
        <group>
          {[-1.6, -0.8, 0, 0.8, 1.6].map((x, i) => {
            const near = Math.max(0, 1 - Math.abs(finger - x) / 0.9);
            const lift = near * 0.12 * (q < 40 ? 1 : 0);
            const isSel = i === 2;
            const away = isSel ? 0 : swipe;
            const dir = i < 2 ? -1 : 1;
            return (
              <Card key={i} p={[x + dir * away * 4.2, 1.03 + lift + (isSel ? sel * 0.35 : 0), 0.62 + (isSel ? 0 : away * 0.8)]} hit={i === 2 || i === 0 || i === 4} r={[0, away * 0.9 * dir, 0]} />
            );
          })}
          {/* a green tick on the chosen card */}
          {sel > 0.3 ? (
            <group position={[0, 1.03 + sel * 0.35 + 0.08, 0.62]} scale={sel}>
              <Box p={[-0.05, 0, 0.04]} s={[0.12, 0.05, 0.04]} c="#41d68a" r={[0, -0.8, 0]} glow={0.5} />
              <Box p={[0.08, 0, 0]} s={[0.3, 0.05, 0.04]} c="#41d68a" r={[0, 0.8, 0]} glow={0.5} />
            </group>
          ) : null}
          {/* the pro's fingertip */}
          <group position={[q < 44 ? finger : lerp(finger, 0, 1), 1.55 - tap * 0.4 - (q > 66 ? 0 : 0), q < 44 ? 0.9 : 0.8]}>
            <mesh position={[0, 0.25, 0]}><sphereGeometry args={[0.16, 18, 18]} /><meshStandardMaterial color="#f0aa7d" /></mesh>
            <mesh position={[0.15, 0.7, 0.3]} rotation={[0.3, 0, -0.35]}><capsuleGeometry args={[0.16, 1.0, 6, 14]} /><meshStandardMaterial color="#f0aa7d" /></mesh>
          </group>
        </group>
      ) : null}
      {/* beat 5: lid slides over the slot, the coin goes back in the pocket */}
      {f >= T.nopay ? (
        <>
          <Box p={[MACH[0] + (1 - lid) * 1.6, 2.06, MACH[2]]} s={[1.05, 0.1, 1.05]} c="#4a5578" />
          {back > 0 && back < 1 ? <Coin p={hop([MACH[0], 2.3, MACH[2] + 0.2], [WALLET[0], WALLET[1] + 0.2, WALLET[2]], back, 1.8)} spin={f * 0.6} /> : null}
        </>
      ) : null}
      {/* the van, parked and idle behind the bench */}
      <Van p={[0.6, 0, -3.0]} />
    </group>
  );
};

// ---------- the Calgary map (beat 3) ----------
const MapScene: React.FC<{ f: number }> = ({ f }) => {
  const g = f - T.map;
  const lit = ease(g, 0, 24);
  const blocks: JSX.Element[] = [];
  const pal = ["#4b5f93", "#5d74ad", "#6f85bd", "#3f5282"];
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    const k = (i + 1) * 3 + (j + 1);
    blocks.push(<Box key={k} p={[i * 3.2, 0.2 + rnd(k) * 0.15, j * 3.2]} s={[2.2, 0.4 + rnd(k) * 0.3, 2.2]} c={pal[k % 4]} />);
    blocks.push(<Box key={"w" + k} p={[i * 3.2, 0.4 + rnd(k) * 0.3 + 0.1, j * 3.2]} s={[1.2, 0.2, 1.2]} c="#e8edff" glow={lit * 0.2} />);
  }
  // matching cards (orange mark) ride the streets to the van; the others pass by
  const VAN: V3 = [0.4, 0, 1.6];
  const cards: JSX.Element[] = [];
  [0, 1, 2, 3].forEach((k) => {
    const s = 22 + k * 22, d = 80;
    const t = interpolate(g, [s, s + d], [0, 1], clamp);
    if (t <= 0) return;
    // down the street at x=-1.6 (z from -4.6 to 1.6), along z=1.6 to the van, then up into the tray
    let p: V3;
    if (t < 0.62) p = [-1.6, 0.32, lerp(-4.6, 1.6, t / 0.62)];
    else if (t < 0.88) p = [lerp(-1.6, -0.8, (t - 0.62) / 0.26), 0.32, 1.6];
    else p = [-0.8, lerp(0.32, 1.45 + k * 0.07, (t - 0.88) / 0.12), 1.6];
    cards.push(<Card key={"m" + k} p={p} hit r={[0, t < 0.62 ? Math.PI / 2 : 0, 0]} />);
  });
  [0, 1, 2, 3, 4].forEach((k) => {
    const s = 10 + k * 20;
    const t = interpolate(g, [s, s + 90], [0, 1], clamp);
    if (t <= 0 || t >= 1) return;
    cards.push(<Card key={"o" + k} p={[1.6, 0.32, lerp(-4.6, 4.8, t)]} hit={false} r={[0, Math.PI / 2, 0]} />);
  });
  return (
    <group>
      <Box p={[0, -0.1, 0]} s={[10.4, 0.2, 10.4]} c="#26335a" />
      {/* streets, lit orange as the map wakes up */}
      {[-1.6, 1.6].map((v) => <Box key={"a" + v} p={[0, 0.02, v]} s={[10.2, 0.04, 0.12]} c="#ea6b14" glow={lit * 0.9} />)}
      {[-1.6, 1.6].map((v) => <Box key={"b" + v} p={[v, 0.02, 0]} s={[0.12, 0.04, 10.2]} c="#ea6b14" glow={lit * 0.9} />)}
      {blocks}
      <Van p={VAN} tray lit={g > 10} />
      {cards}
    </group>
  );
};

const World: React.FC = () => {
  const f = useCurrentFrame();
  const onMap = f >= T.map && f < T.quote;
  // slow push on every beat; the camera target drifts a little so the picture changes each time
  const beat = f < T.pay ? 0 : f < T.map ? 1 : f < T.quote ? 2 : f < T.nopay ? 3 : 4;
  const start = [0, T.pay, T.map, T.quote, T.nopay][beat];
  const len = [T.pay, T.map - T.pay, T.quote - T.map, T.nopay - T.quote, 80][beat];
  const k = (f - start) / len;
  const zoom = [lerp(0.9, 1.0, k), lerp(1.0, 0.93, k), lerp(0.72, 0.8, k), lerp(1.0, 1.1, k), lerp(1.0, 1.1, k)][beat];
  const px = [lerp(0.6, 0, k), lerp(0, -0.5, k), lerp(0.4, -0.3, k), lerp(-0.2, 0.3, k), lerp(0.4, -0.2, k)][beat];
  const shake = f >= 0 && f < 8 ? 0 : 0;
  return (
    <ThreeCanvas width={1080} height={1920} orthographic camera={{ position: [10, 10, 10], zoom: 150 }}>
      <color attach="background" args={["#141b30"]} />
      <ambientLight intensity={1.35} />
      <directionalLight position={[6, 10, 4]} intensity={2.3} />
      <directionalLight position={[-5, 4, 6]} intensity={0.7} />
      <group position={onMap ? [px, -1.0, 0] : [px - 1, -1.8, 1]} scale={zoom}>
        {onMap ? <MapScene f={f} /> : <Bench f={f} />}
      </group>
    </ThreeCanvas>
  );
};

export const LeadsVsJobs: React.FC = () => {
  const S = T;
  return (
    <AbsoluteFill style={{ background: "#141b30" }}>
      <World />
      <AbsoluteFill style={{ background: "linear-gradient(rgba(15,21,36,.7) 0%, rgba(15,21,36,.35) 22%, rgba(15,21,36,0) 38%)" }} />

      <Caption text="Calgary handymen: still paying for leads?" from={0} to={S.pay} size={92} />
      <Caption text="Pay. Call. Hope." from={S.pay} to={S.map} size={138} />
      <Caption text="Jobs in your trade come to you." from={S.map} to={S.quote} size={100} />
      <Caption text="Quote only the ones you want." from={S.quote} to={S.nopay} size={100} />
      <Caption text="No paying for leads." from={S.nopay} to={S.card} size={118} />
      <CommentCard from={S.card} question="First job you'd quote?" prompt="Link in bio" />

      {/* voice: each line starts 10 frames into its beat */}
      <VoiceClip name="leads" n={1} at={10} />
      <VoiceClip name="leads" n={2} at={S.pay + 10} />
      <VoiceClip name="leads" n={3} at={S.map + 10} />
      <VoiceClip name="leads" n={4} at={S.quote + 10} />
      <VoiceClip name="leads" n={5} at={S.nopay + 10} />
      <VoiceClip name="leads" n={6} at={S.card + 10} />

      {/* sound made for this video (tools/sfx/leads.py): coins, a phone nobody answers, a map waking up */}
      <Sfx name="leads/coin" at={26} volume={0.6} />
      <Sfx name="leads/slot" at={30} volume={0.6} />
      <Sfx name="leads/paper" at={36} volume={0.45} />
      {[8, 40, 72].map((f) => <Sfx key={f} name="leads/hop" at={S.pay + f + 20} volume={0.5} />)}
      {[0, 1, 2, 3].map((i) => <Sfx key={i} name="leads/ring" at={S.pay + 30 + i * 28} volume={0.55} />)}
      <Sfx name="leads/lights" at={S.map} volume={0.5} />
      {[0, 1, 2, 3].map((k) => <Sfx key={k} name={k % 2 ? "leads/land2" : "leads/land1"} at={S.map + 22 + k * 22 + 78} volume={0.5} />)}
      {[0, 1, 2, 3, 4, 5].map((i) => <Sfx key={i} name="leads/flick" at={S.quote + 6 + i * 6} volume={0.3} />)}
      <Sfx name="leads/tap" at={S.quote + 48} volume={0.7} />
      <Sfx name="leads/check" at={S.quote + 54} volume={0.5} />
      <Sfx name="leads/sweep" at={S.quote + 70} volume={0.45} />
      <Sfx name="leads/lid" at={S.nopay + 30} volume={0.8} />
      <Sfx name="leads/pocket" at={S.nopay + 60} volume={0.5} />
      <Sfx name="leads/ask" at={S.card + 6} volume={0.45} />
      <Progress />
    </AbsoluteFill>
  );
};
export const leadsVsJobsFrames = T.total;
