// "The whole quote: four words." — red-flags type for clients, brick-built look. One real place: a front hallway with
// stairs, a hall table, a door, a bench and winter boots. Everything is chunky rounded blocks with studs, lit by Stage.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { Caption, CommentCard, Progress, Sfx, VoiceClip, clamp } from "../kit";
import { Stage } from "../stage3d";

// ---------- timing (frames at 30 fps). Voice line N starts at V[N-1]; every line is followed by 18+ frames of quiet ----------
const V = [6, 102, 250, 400, 607, 797, 993, 1189, 1283];
const B = { b2: 98, b3: 245, b4: 395, b5: 603, b6: 793, b7: 990, b8: 1175, b9: 1272, total: 1410 };
export const fourWordQuoteFrames = B.total;

type V3 = [number, number, number];
const ease = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const seg = (f: number, a: number, b: number) => ease(interpolate(f, [a, b], [0, 1], clamp));

// ---------- palette ----------
const COL = {
  cream: "#efe0bf", wain: "#2f6f78", wood: "#a9703f", woodLt: "#c98e55", floor: "#c9a36f", red: "#d8443a", navy: "#26325a",
  skin: "#f0b48a", skin2: "#c98a62", coat: "#d8443a", coat2: "#2f6f78", pants: "#2b3558", boot: "#5a3a26", orange: "#ea6b14",
  white: "#f7f4ee", green: "#2fbf71", dark: "#1a2236", yellow: "#f2c230",
};

// ---------- canvas textures redrawn every frame from the frame number (no timers, no randomness) ----------
function useCanvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const cv = React.useMemo(() => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }, [w, h]);
  const tex = React.useMemo(() => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }, [cv]);
  const g = cv.getContext("2d")!;
  g.clearRect(0, 0, w, h);
  draw(g, w, h);
  tex.needsUpdate = true;
  return tex;
}
const BOLD = "900 80px Arial Black, Arial, sans-serif";
function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function wrapText(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = []; let line = "";
  for (const w of text.split(" ")) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
}

const Label: React.FC<{ pos: V3; w: number; h: number; text: string; bg: string; fg?: string; size?: number; rot?: V3; depth?: number }> =
  ({ pos, w, h, text, bg, fg = "#fff", size = 90, rot = [0, 0, 0], depth = 0.08 }) => {
    const tex = useCanvasTex(Math.round(w * 400), Math.round(h * 400), (g, cw, ch) => {
      g.fillStyle = bg; g.fillRect(0, 0, cw, ch); g.fillStyle = fg; g.font = `900 ${size}px Arial Black, Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
      const lines = wrapText(g, text, cw * 0.9); lines.forEach((l, i) => g.fillText(l, cw / 2, ch / 2 + (i - (lines.length - 1) / 2) * size * 1.1));
    });
    return (
      <group position={pos} rotation={rot}>
        <RoundedBox args={[w, h, depth]} radius={0.04} smoothness={3}><meshStandardMaterial color={bg} roughness={0.5} /></RoundedBox>
        <mesh position={[0, 0, depth / 2 + 0.003]}><planeGeometry args={[w * 0.96, h * 0.94]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      </group>
    );
  };

// ---------- blocks ----------
const M: React.FC<{ c: string; r?: number }> = ({ c, r = 0.5 }) => <meshStandardMaterial color={c} roughness={r} metalness={0} />;
const Blk: React.FC<{ pos: V3; s: V3; c: string; rot?: V3; rad?: number }> = ({ pos, s, c, rot = [0, 0, 0], rad = 0.04 }) => (
  <RoundedBox args={s} position={pos} rotation={rot} radius={Math.min(rad, Math.min(...s) / 2.2)} smoothness={3}><M c={c} /></RoundedBox>
);
const Studs: React.FC<{ pts: V3[]; c: string; r?: number; h?: number }> = ({ pts, c, r = 0.09, h = 0.07 }) => {
  const ref = React.useRef<THREE.InstancedMesh>(null);
  React.useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    pts.forEach((p, i) => { m.makeTranslation(p[0], p[1], p[2]); ref.current!.setMatrixAt(i, m); });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [pts]);
  return <instancedMesh ref={ref} args={[undefined as any, undefined as any, pts.length]}><cylinderGeometry args={[r, r, h, 12]} /><M c={c} r={0.45} /></instancedMesh>;
};
const grid = (x0: number, x1: number, z0: number, z1: number, y: number, step: number): V3[] => {
  const o: V3[] = []; for (let x = x0; x <= x1 + 1e-6; x += step) for (let z = z0; z <= z1 + 1e-6; z += step) o.push([x, y, z]); return o;
};

// ---------- the hallway ----------
const WALL_Z = -3.2;
const Wall: React.FC = () => {
  const tex = useCanvasTex(1024, 512, (g, w, h) => {
    const rows = 8, bh = h / rows, bw = 128;
    g.fillStyle = "#cdb98f"; g.fillRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) for (let i = -1; i < w / bw + 1; i++) {
      const x = i * bw + (r % 2 ? bw / 2 : 0); const k = Math.sin(r * 12.9 + i * 78.2) * 0.5 + 0.5;
      g.fillStyle = `rgb(${236 - k * 14},${222 - k * 14},${190 - k * 16})`; rr(g, x + 3, r * bh + 3, bw - 6, bh - 6, 6); g.fill();
    }
  });
  React.useMemo(() => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(4, 1.5); }, [tex]);
  return (
    <group>
      <mesh position={[0.75, 3, WALL_Z - 0.1]}><boxGeometry args={[14, 7, 0.2]} /><meshStandardMaterial map={tex} roughness={0.85} /></mesh>
      <Blk pos={[0.75, 0.6, WALL_Z + 0.04]} s={[14, 1.2, 0.16]} c={COL.wain} rad={0.02} />
      <Blk pos={[0.75, 1.24, WALL_Z + 0.08]} s={[14, 0.1, 0.26]} c="#3d8a94" rad={0.02} />
    </group>
  );
};
const studFloor = grid(-6, 8, -3.0, 1.5, 0.0, 0.5);
const Floor: React.FC = () => (
  <group>
    <Blk pos={[1, -0.15, -0.8]} s={[15, 0.3, 5.4]} c={COL.floor} rad={0.05} />
    <Studs pts={studFloor.map((p) => [p[0], 0.03, p[2]] as V3)} c="#bf985f" r={0.1} h={0.06} />
  </group>
);

const STEPS = 8, RUN = 0.8, RISE = 0.45, X0 = 0.5, SZ = -1.6;
const railY = (x: number) => 0.5625 * (x - 0.9) + 1.4;
const Stairs: React.FC<{ wob: number }> = ({ wob }) => {
  const rail: React.ReactNode[] = [];
  const xs = X0 + 0.4, xe = X0 + STEPS * RUN - 0.2;
  const dx = xe - 0.6, dy = railY(xe) - railY(0.6), len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
  return (
    <group>
      {Array.from({ length: STEPS }, (_, i) => {
        const x = X0 + i * RUN + RUN / 2, h = RISE * (i + 1);
        rail.push(<Blk key={"b" + i} pos={[xs + i * RUN, (RISE * (i + 1) + railY(xs + i * RUN)) / 2 - 0.05, SZ]} s={[0.1, railY(xs + i * RUN) - RISE * (i + 1) - 0.1, 0.1]} c={COL.woodLt} />);
        return (
          <group key={i}>
            <Blk pos={[x, h / 2, -2.35]} s={[RUN, h, 1.5]} c={i % 2 ? COL.wood : "#b87a45"} rad={0.05} />
            <Blk pos={[x, h + 0.02, -2.35]} s={[RUN + 0.02, 0.06, 1.52]} c={COL.woodLt} rad={0.03} />
            <Studs pts={[[x - 0.2, h + 0.07, -2.7], [x + 0.2, h + 0.07, -2.7], [x - 0.2, h + 0.07, -2.0], [x + 0.2, h + 0.07, -2.0]]} c={COL.woodLt} />
          </group>
        );
      })}
      {rail}
      <Blk pos={[(0.6 + xe) / 2, (railY(0.6) + railY(xe)) / 2 + 0.05, SZ]} s={[len, 0.14, 0.2]} rot={[0, 0, ang]} c="#7c4a26" rad={0.06} />
      <Blk pos={[xe + 0.1, railY(xe) - 0.5, SZ]} s={[0.22, 1.6, 0.22]} c="#6a3f20" />
      {/* the loose newel post: pivots about its foot */}
      <group position={[0.6, 0, SZ]} rotation={[0, 0, wob]}>
        <Blk pos={[0, 0.78, 0]} s={[0.24, 1.56, 0.24]} c="#6a3f20" rad={0.06} />
        <Blk pos={[0, 1.6, 0]} s={[0.34, 0.14, 0.34]} c="#7c4a26" rad={0.05} />
        <Studs pts={[[0, 1.7, 0]]} c="#7c4a26" r={0.08} />
      </group>
    </group>
  );
};

const Door: React.FC = () => (
  <group position={[-4.6, 0, WALL_Z + 0.1]}>
    <Blk pos={[0, 1.35, 0]} s={[1.5, 2.8, 0.18]} c="#3a2a22" />
    <Blk pos={[0, 1.25, 0.1]} s={[1.2, 2.5, 0.12]} c="#a23a2c" />
    <Blk pos={[0, 1.7, 0.17]} s={[0.8, 0.9, 0.05]} c="#b84a3a" />
    <Blk pos={[0, 0.7, 0.17]} s={[0.8, 0.8, 0.05]} c="#b84a3a" />
    <mesh position={[0.45, 1.2, 0.22]}><sphereGeometry args={[0.07, 16, 12]} /><meshStandardMaterial color="#e8c24a" roughness={0.3} metalness={0.5} /></mesh>
    <Blk pos={[0.15, 0.04, 1.0]} s={[1.5, 0.08, 0.9]} c="#26325a" />
    <Studs pts={grid(-0.45, 0.65, 0.7, 1.3, 0.1, 0.3).slice(0, 12)} c="#26325a" r={0.06} h={0.05} />
  </group>
);
const Boots: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    {[0, 0.38].map((o, i) => (
      <group key={i} position={[o, 0, 0]} rotation={[0, i ? -0.15 : 0.1, 0]}>
        <Blk pos={[0, 0.07, 0.07]} s={[0.3, 0.14, 0.55]} c="#2b1c14" />
        <Blk pos={[0, 0.34, -0.06]} s={[0.28, 0.5, 0.3]} c={COL.boot} />
        <Blk pos={[0, 0.58, -0.06]} s={[0.32, 0.08, 0.34]} c="#e9e3d6" rad={0.03} />
      </group>
    ))}
  </group>
);
const Bench: React.FC = () => (
  <group position={[-2.3, 0, -2.5]}>
    <Blk pos={[0, 0.55, 0]} s={[1.3, 0.12, 0.6]} c={COL.wood} />
    <Blk pos={[-0.5, 0.27, 0]} s={[0.12, 0.54, 0.5]} c={COL.wood} />
    <Blk pos={[0.5, 0.27, 0]} s={[0.12, 0.54, 0.5]} c={COL.wood} />
    <Studs pts={[[-0.4, 0.64, 0], [0, 0.64, 0], [0.4, 0.64, 0]]} c={COL.wood} />
  </group>
);
const Table: React.FC = () => (
  <group position={[-0.7, 0, -2.6]}>
    <Blk pos={[0, 0.96, 0]} s={[1.9, 0.12, 0.6]} c={COL.woodLt} />
    {[-0.8, 0.8].map((x) => <Blk key={x} pos={[x, 0.45, 0]} s={[0.14, 0.9, 0.5]} c={COL.wood} />)}
    <Blk pos={[0, 0.3, 0]} s={[1.5, 0.08, 0.45]} c={COL.wood} />
    <Studs pts={[[-0.75, 1.05, 0], [-0.25, 1.05, 0.2], [0.75, 1.05, -0.1]]} c={COL.woodLt} />
  </group>
);

const Clock: React.FC<{ f: number }> = ({ f }) => {
  const m = f >= B.b6 && f < B.b7 ? ((f - B.b6) / 6) * 0.6 : 0.4;
  return (
    <group position={[-3.4, 2.55, WALL_Z + 0.15]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 0.1, 40]} /><M c="#f7f4ee" /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.02]}><cylinderGeometry args={[0.56, 0.56, 0.08, 40]} /><M c={COL.red} /></mesh>
      {[0, 1, 2, 3].map((i) => <Blk key={i} pos={[Math.sin((i * Math.PI) / 2) * 0.4, Math.cos((i * Math.PI) / 2) * 0.4, 0.07]} s={[0.06, 0.06, 0.04]} c="#1a2236" rad={0.01} />)}
      <group position={[0, 0, 0.08]} rotation={[0, 0, -m]}><Blk pos={[0, 0.17, 0]} s={[0.06, 0.4, 0.03]} c="#1a2236" rad={0.01} /></group>
      <group position={[0, 0, 0.1]} rotation={[0, 0, -m / 12]}><Blk pos={[0, 0.11, 0]} s={[0.08, 0.26, 0.03]} c="#1a2236" rad={0.01} /></group>
    </group>
  );
};

const Calendar: React.FC<{ f: number }> = ({ f }) => {
  const tex = useCanvasTex(460, 560, (g, w, h) => {
    g.fillStyle = "#f7f4ee"; g.fillRect(0, 0, w, h); g.fillStyle = COL.red; g.fillRect(0, 0, w, 120);
    g.fillStyle = "#fff"; g.font = "900 62px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("THURSDAY", w / 2, 62);
    g.fillStyle = "#cfc9bc"; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) g.fillRect(40 + c * 78, 150 + r * 62 + 130 * 0, 52, 8);
    const bob = Math.sin(f / 6) * 10, s = 1 + 0.06 * Math.sin(f / 6);
    g.save(); g.translate(w / 2, 340 + bob); g.scale(s, s); g.fillStyle = COL.orange; g.beginPath(); g.arc(0, 0, 130, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.font = "900 190px Arial Black, Arial, sans-serif"; g.fillText("?", 0, 12); g.restore();
  });
  return (
    <group position={[-2.3, 2.7, WALL_Z + 0.12]}>
      <RoundedBox args={[1.0, 1.2, 0.08]} radius={0.04} smoothness={3}><M c="#f7f4ee" /></RoundedBox>
      <mesh position={[0, -0.02, 0.045]}><planeGeometry args={[0.94, 1.14]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </group>
  );
};

// ---------- phone with the text bubble on its screen ----------
const Phone: React.FC<{ f: number; pop: number; shake: number; shrink: number }> = ({ f, pop, shake, shrink }) => {
  const tex = useCanvasTex(560, 1080, (g, w, h) => {
    g.fillStyle = "#eef2fa"; g.fillRect(0, 0, w, h); g.fillStyle = COL.navy; g.fillRect(0, 0, w, 110);
    g.fillStyle = "#fff"; g.font = "900 44px Arial Black, Arial, sans-serif"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText("Railing guy", 36, 62);
    const s = Math.max(0.01, pop * (1 - shrink * 0.97));
    g.save(); g.translate(40, 190); g.scale(s, s);
    g.fillStyle = COL.green; rr(g, 0, 0, 480, 470, 56); g.fill();
    g.fillStyle = "#fff"; g.font = "900 70px Arial Black, Arial, sans-serif"; g.textBaseline = "alphabetic";
    ["Railing.", "Cash.", "Thursday", "maybe."].forEach((l, i) => g.fillText(l, 36, 120 + i * 96));
    g.restore();
  });
  return (
    <group position={[-0.65 + shake, 1.02 + 0.82, -2.55]} rotation={[-0.1, 0.06, shake * 0.8]}>
      <RoundedBox args={[0.84, 1.6, 0.1]} radius={0.08} smoothness={4}><M c="#151b33" r={0.35} /></RoundedBox>
      <mesh position={[0, 0, 0.053]}><planeGeometry args={[0.72, 1.39]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </group>
  );
};

// ---------- people ----------
type Pose = { x: number; z: number; yaw: number; armR: [number, number]; armL: [number, number]; seated?: boolean; nod?: number; bob?: number; tap?: number; look?: number; phone?: boolean; show?: boolean };
const Arm: React.FC<{ side: 1 | -1; rx: number; rz: number; c: string; skin: string; y: number }> = ({ side, rx, rz, c, skin, y }) => (
  <group position={[side * 0.46, y, 0]} rotation={[rx, 0, rz]}>
    <Blk pos={[0, -0.32, 0]} s={[0.2, 0.7, 0.2]} c={c} rad={0.08} />
    <Blk pos={[0, -0.74, 0]} s={[0.2, 0.2, 0.2]} c={skin} rad={0.09} />
  </group>
);
const Person: React.FC<{ p: Pose; coat: string; hat: string; skin?: string; brim?: boolean; hatStud?: boolean }> = ({ p, coat, hat, skin = COL.skin, brim, hatStud }) => {
  if (p.show === false) return null;
  const lift = p.seated ? -0.28 : 0, bob = p.bob ?? 0;
  return (
    <group position={[p.x, 0, p.z]} rotation={[0, p.yaw, 0]}>
      {p.seated ? (
        <>
          {[-0.2, 0.2].map((x, i) => (
            <group key={x}>
              <Blk pos={[x, 0.66, 0.35]} s={[0.3, 0.3, 0.75]} c={COL.pants} />
              <group position={[x, 0, 0.72]} rotation={[(i ? (p.tap ?? 0) : 0), 0, 0]}>
                <Blk pos={[0, 0.35, 0]} s={[0.3, 0.7, 0.3]} c={COL.pants} />
                <Blk pos={[0, 0.07, 0.05]} s={[0.34, 0.16, 0.45]} c="#2b1c14" />
              </group>
            </group>
          ))}
        </>
      ) : (
        [-0.2, 0.2].map((x) => (
          <group key={x}><Blk pos={[x, 0.4, 0]} s={[0.3, 0.8, 0.3]} c={COL.pants} /><Blk pos={[x, 0.07, 0.05]} s={[0.34, 0.16, 0.45]} c="#2b1c14" /></group>
        ))
      )}
      <group position={[0, bob, 0]}>
        <Blk pos={[0, 1.18 + lift, 0]} s={[0.78, 0.78, 0.44]} c={coat} rad={0.1} />
        <Blk pos={[0, 1.58 + lift, 0]} s={[0.84, 0.1, 0.48]} c={coat} rad={0.04} />
        <Arm side={1} rx={p.armR[0]} rz={p.armR[1]} c={coat} skin={skin} y={1.48 + lift} />
        <Arm side={-1} rx={p.armL[0]} rz={p.armL[1]} c={coat} skin={skin} y={1.48 + lift} />
        {p.phone ? (
          <group position={[-0.46 + 0.05, 1.48 + lift - 0.3, 0.65]} rotation={[0.2, 0, 0]}><Blk pos={[0, 0, 0]} s={[0.26, 0.46, 0.05]} c="#151b33" rad={0.03} /><Blk pos={[0, 0, 0.03]} s={[0.2, 0.38, 0.02]} c="#9fd0ff" rad={0.02} /></group>
        ) : null}
        <group position={[0, 1.88 + lift, 0]} rotation={[p.nod ?? 0, p.look ?? 0, 0]}>
          <Blk pos={[0, 0, 0]} s={[0.54, 0.54, 0.5]} c={skin} rad={0.14} />
          <Blk pos={[-0.13, 0.04, 0.26]} s={[0.07, 0.1, 0.03]} c="#1a2236" rad={0.015} />
          <Blk pos={[0.13, 0.04, 0.26]} s={[0.07, 0.1, 0.03]} c="#1a2236" rad={0.015} />
          <Blk pos={[0, -0.12, 0.26]} s={[0.2, 0.04, 0.03]} c="#7a3a2a" rad={0.015} />
          <Blk pos={[0, 0.32, 0]} s={[0.6, 0.26, 0.56]} c={hat} rad={0.1} />
          {brim ? <Blk pos={[0, 0.22, 0.32]} s={[0.5, 0.05, 0.3]} c={hat} rad={0.02} /> : null}
          {hatStud ? <Studs pts={[[0, 0.5, 0]]} c={hat} r={0.1} h={0.1} /> : null}
        </group>
      </group>
    </group>
  );
};

// ---------- camera ----------
type Shot = { a: number; b: number; p0: V3; t0: V3; p1: V3; t1: V3 };
const SHOTS: Shot[] = [
  { a: 0, b: B.b2, p0: [-0.2, 1.9, 6.0], t0: [-0.2, 1.65, -2.5], p1: [-0.3, 1.85, 4.7], t1: [-0.15, 1.75, -2.5] },
  { a: B.b2, b: B.b3, p0: [0.3, 1.7, 4.9], t0: [0.15, 1.4, -1.3], p1: [0.4, 1.55, 4.2], t1: [0.3, 1.2, -1.45] },
  { a: B.b3, b: B.b4, p0: [-0.5, 1.9, 6.4], t0: [-0.5, 1.9, -2.5], p1: [-0.5, 2.4, 6.6], t1: [-0.5, 2.4, -2.5] },
  { a: B.b4, b: B.b5, p0: [-0.6, 2.1, 6.2], t0: [-0.6, 2.1, -2.5], p1: [-0.45, 2.0, 5.0], t1: [-0.45, 2.0, -2.5] },
  { a: B.b5, b: B.b6, p0: [-3.6, 1.9, 5.8], t0: [-3.6, 1.5, -2.2], p1: [-3.9, 1.8, 5.4], t1: [-3.9, 1.5, -2.2] },
  { a: B.b6, b: B.b7, p0: [-3.5, 1.6, 4.3], t0: [-3.5, 1.4, -2.3], p1: [-3.1, 2.4, 4.7], t1: [-3.1, 2.6, -2.5] },
  { a: B.b7, b: B.b8, p0: [-0.6, 2.0, 6.0], t0: [-0.6, 1.9, -1.2], p1: [-0.6, 2.1, 4.4], t1: [-0.6, 1.95, -1.2] },
  { a: B.b8, b: B.b9, p0: [-0.4, 1.75, 5.5], t0: [-0.4, 1.5, -0.4], p1: [-0.4, 1.75, 4.7], t1: [-0.4, 1.5, -0.4] },
  { a: B.b9, b: B.total + 1, p0: [-0.4, 1.9, 5.4], t0: [-0.4, 1.6, -2.5], p1: [-0.4, 1.8, 6.6], t1: [-0.4, 1.6, -2.5] },
];
const Cam: React.FC<{ f: number }> = ({ f }) => {
  const { camera } = useThree();
  const s = SHOTS.find((x) => f >= x.a && f < x.b) ?? SHOTS[SHOTS.length - 1];
  const t = ease(interpolate(f, [s.a, s.b], [0, 1], clamp));
  const p = lerp3(s.p0, s.p1, t), tg = lerp3(s.t0, s.t1, t);
  camera.position.set(...p); camera.lookAt(...tg);
  return null;
};

// ---------- flags ----------
const Flag: React.FC<{ n: number; pos: V3; start: number; f: number }> = ({ n, pos, start, f }) => {
  const { fps } = useVideoConfig();
  const k = f - start;
  const tex = useCanvasTex(160, 120, (g, w, h) => { g.fillStyle = COL.red; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.font = "900 100px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(n), w / 2, h / 2 + 6); });
  if (k < 0) return null;
  const drop = 1 - spring({ frame: k, fps, config: { damping: 9, stiffness: 140, mass: 0.7 } });
  return (
    <group position={[pos[0], pos[1] + drop * 2.2, pos[2]]}>
      <Blk pos={[0, 0.7, 0]} s={[0.07, 1.4, 0.07]} c="#3a2a22" rad={0.03} />
      <group position={[0.34, 1.15, 0]} rotation={[0, Math.sin(f / 5 + n) * 0.12, 0]}>
        <RoundedBox args={[0.68, 0.5, 0.05]} radius={0.03} smoothness={3}><M c={COL.red} /></RoundedBox>
        <mesh position={[0, 0, 0.03]}><planeGeometry args={[0.64, 0.46]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      </group>
      <Studs pts={[[0, 1.42, 0]]} c="#3a2a22" r={0.06} h={0.06} />
    </group>
  );
};

// ---------- the built quote (board of rows that snap in) ----------
const Row: React.FC<{ y: number; text: string; start: number; f: number; tickAt: number }> = ({ y, text, start, f, tickAt }) => {
  const { fps } = useVideoConfig();
  const k = f - start; const s = spring({ frame: k, fps, config: { damping: 13, stiffness: 120 } });
  const tk = Math.max(0, Math.min(1, (f - tickAt) / 8));
  const tex = useCanvasTex(920, 240, (g, w, h) => {
    g.fillStyle = "#fffaf0"; rr(g, 0, 0, w, h, 36); g.fill();
    g.fillStyle = COL.dark; g.font = "900 84px Arial Black, Arial, sans-serif"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(text, 40, h / 2 + 4);
    if (tk > 0) { g.save(); g.translate(w - 110, h / 2); g.scale(0.4 + tk * 0.6, 0.4 + tk * 0.6); g.fillStyle = COL.green; g.beginPath(); g.arc(0, 0, 70, 0, 7); g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 20; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(-32, 4); g.lineTo(-8, 30); g.lineTo(36, -26); g.stroke(); g.restore(); }
  });
  if (k < 0) return null;
  return (
    <group position={[(1 - s) * 2.6, y, 0.08]} scale={[1, 1, 1]}>
      <RoundedBox args={[1.6, 0.42, 0.1]} radius={0.05} smoothness={3}><M c="#fffaf0" /></RoundedBox>
      <mesh position={[0, 0, 0.056]}><planeGeometry args={[1.58, 0.4]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </group>
  );
};
const Easel: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const up = spring({ frame: f - (B.b7 + 2), fps, config: { damping: 12 } });
  const line = seg(f, 1098, 1124);
  const head = useCanvasTex(840, 240, (g, w, h) => { g.fillStyle = COL.orange; rr(g, 0, 0, w, h, 36); g.fill(); g.fillStyle = "#fff"; g.font = "900 100px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("A GOOD QUOTE", w / 2, h / 2 + 4); });
  if (f < B.b7 || f >= B.b8) return null;
  return (
    <group position={[-0.6, 0, -1.2]} scale={[up, up, up]}>
      <Blk pos={[-0.7, 0.9, -0.2]} s={[0.1, 1.8, 0.1]} c={COL.wood} rot={[0.12, 0, 0]} />
      <Blk pos={[0.7, 0.9, -0.2]} s={[0.1, 1.8, 0.1]} c={COL.wood} rot={[0.12, 0, 0]} />
      <Blk pos={[0, 2.0, 0]} s={[1.9, 2.5, 0.12]} c={COL.cream} rad={0.06} />
      <group position={[0, 0, 0.06]}>
        <group position={[0, 2.95 - 0.35 - 0.02, 0]} />
        <mesh position={[0, 2.95 - 0.12, 0.04]}><planeGeometry args={[1.5, 0.42]} /><meshBasicMaterial map={head} toneMapped={false} /></mesh>
        <Row y={2.28} text="WHAT they'll do" start={1024} tickAt={1042} f={f} />
        <Row y={1.8} text="WHAT'S included" start={1050} tickAt={1068} f={f} />
        <Row y={1.32} text="WHEN they start" start={1073} tickAt={1091} f={f} />
        <Blk pos={[-0.8 + 0.8 * line, 0.98, 0.06]} s={[1.6 * line + 0.001, 0.07, 0.03]} c={COL.navy} rad={0.02} />
      </group>
    </group>
  );
};
const HeldCard: React.FC<{ f: number; pos: V3 }> = ({ f, pos }) => {
  const w4 = seg(f, 1212, 1236);
  const tex = useCanvasTex(640, 800, (g, w, h) => {
    g.fillStyle = "#fffaf0"; g.fillRect(0, 0, w, h); g.fillStyle = COL.orange; g.fillRect(0, 0, w, 130);
    g.fillStyle = "#fff"; g.font = "900 62px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("A GOOD QUOTE", w / 2, 68);
    ["WHAT they'll do", "WHAT'S included", "WHEN they start"].forEach((t, i) => {
      g.fillStyle = COL.dark; g.font = "900 50px Arial Black, Arial, sans-serif"; g.textAlign = "left"; g.fillText(t, 36, 210 + i * 120);
      g.fillStyle = COL.green; g.beginPath(); g.arc(w - 60, 210 + i * 120, 30, 0, 7); g.fill();
    });
    g.globalAlpha = w4; g.fillStyle = COL.navy; g.fillText("IN WRITING", 36, 570); g.fillRect(36, 600, 420 * w4, 10); g.globalAlpha = 1;
  });
  return (
    <group position={pos} rotation={[0, 0, -0.05]}>
      <RoundedBox args={[0.95, 1.2, 0.05]} radius={0.03} smoothness={3}><M c={COL.cream} /></RoundedBox>
      <mesh position={[0, 0, 0.03]}><planeGeometry args={[0.92, 1.15]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </group>
  );
};

// ---------- actors per beat ----------
const OFF: Pose = { x: 60, z: 0, yaw: 0, armR: [0, 0], armL: [0, 0], show: false };
const clientPose = (f: number): Pose => {
  if (f >= B.b2 && f < B.b3) { const push = Math.sin(f / 4) * 0.05; return { x: -0.35, z: -1.2, yaw: 0, armR: [-0.35, 1.2 + push], armL: [-1.05, 0], phone: true, bob: Math.sin(f / 9) * 0.01, look: 0.15 }; }
  if (f >= B.b5 && f < B.b6) { const g = f - B.b5; return { x: -3.2, z: -1.9, yaw: -Math.PI / 2, armR: [-1.45 + Math.sin(g / 6) * 0.03, 0], armL: [-0.25, 0], bob: Math.sin(g / 10) * 0.01 }; }
  if (f >= B.b6 && f < B.b7) { const g = f - B.b6; return { x: -2.3, z: -2.75, yaw: 0, armR: [-0.9, 0.1], armL: [-0.9, -0.1], seated: true, tap: Math.max(0, Math.sin(g / 3)) * 0.35, nod: -0.05 + Math.sin(g / 14) * 0.06, bob: 0 }; }
  if (f >= B.b8 && f < B.b9) { const g = f - B.b8; return { x: -0.85, z: -0.2, yaw: 0.45, armR: [-1.1, -0.35], armL: [-1.1, 0.35], bob: Math.sin(g / 9) * 0.01 }; }
  return OFF;
};
const proPose = (f: number): Pose => {
  if (f >= B.b5 && f < B.b6) { const g = f - B.b5; return { x: -4.6, z: -1.9, yaw: Math.PI / 2, armR: [-0.2, 0], armL: [-1.45, 0], bob: Math.sin(g / 10) * 0.01, nod: seg(g, 70, 90) * 0.1 }; }
  if (f >= B.b8 && f < B.b9) { const g = f - B.b8; const nod = g > 28 ? Math.max(0, Math.sin((g - 28) / 4)) * 0.35 : 0; return { x: 0.3, z: -0.2, yaw: -0.45, armR: [0, 0], armL: [-0.2, 0], nod }; }
  return OFF;
};

const Bills: React.FC<{ f: number }> = ({ f }) => {
  if (f < B.b5 + 30 || f >= B.b6) return null;
  const hand: V3 = [-3.95, 1.0, -1.45], to: V3 = [-3.82, 1.02, -1.45];
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const t = seg(f, B.b5 + 40 + i * 14, B.b5 + 62 + i * 14);
        const p = lerp3(hand, to, t); const arc = Math.sin(t * Math.PI) * 0.35;
        return <Blk key={i} pos={[p[0] - 0.05 + (t * 0.05), p[1] + arc + i * 0.02 * t, p[2]]} s={[0.34, 0.03, 0.18]} c="#5db86a" rot={[0, 0, Math.sin(t * 9) * 0.3 * (1 - t) ]} rad={0.01} />;
      })}
    </>
  );
};
const BlankPage: React.FC<{ f: number }> = ({ f }) => {
  if (f < B.b5 + 95 || f >= B.b6) return null;
  const t = seg(f, B.b5 + 95, B.b5 + 175);
  const y = lerp(2.4, 0.08, t), x = -3.9 + Math.sin(t * 9) * 0.35 * (1 - t);
  return <Blk pos={[x, y, -1.3]} s={[0.5, 0.02, 0.66]} c="#ffffff" rot={[Math.sin(t * 7) * 0.5 * (1 - t) + 0.2 * (1 - t), t * 1.4, Math.cos(t * 6) * 0.4 * (1 - t)]} rad={0.005} />;
};

// signs for "repair or rebuild"
const Signs: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  if (f < B.b3 + 20 || f >= B.b4) return null;
  const a = spring({ frame: f - (B.b3 + 20), fps, config: { damping: 8 } });
  const b = spring({ frame: f - (B.b3 + 44), fps, config: { damping: 8 } });
  const sw = (ph: number) => Math.sin((f - B.b3) / 9 + ph) * 0.16;
  const Sign = (x: number, text: string, bg: string, s: number, ph: number) => (
    <group position={[x, 3.45, -2.5]} rotation={[0, 0, sw(ph)]} scale={[s, s, s]}>
      <Blk pos={[-0.35, 0.2, 0]} s={[0.04, 0.4, 0.04]} c="#3a2a22" rad={0.01} />
      <Blk pos={[0.35, 0.2, 0]} s={[0.04, 0.4, 0.04]} c="#3a2a22" rad={0.01} />
      <Label pos={[0, -0.25, 0]} w={1.15} h={0.55} text={text} bg={bg} size={96} />
    </group>
  );
  return (
    <>
      {Sign(-1.25, "REPAIR", COL.wain, a, 0)}
      {Sign(0.05, "REBUILD", COL.orange, b, 2)}
      {f > B.b3 + 70 ? <Label pos={[1.15, 2.35 + Math.sin(f / 7) * 0.06, -2.4]} w={0.55} h={0.55} text="?" bg={COL.red} size={190} rot={[0, 0, 0.1]} /> : null}
    </>
  );
};

// the two vague quotes for flag one
const Cards: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  if (f < B.b4 + 10 || f >= B.b5) return null;
  const k = f - B.b4;
  const a = spring({ frame: k - 10, fps, config: { damping: 12 } });
  const slide = seg(f, B.b4 + 70, B.b4 + 100);
  const bump = f > B.b4 + 100 ? Math.exp(-(f - B.b4 - 100) / 8) * Math.sin((f - B.b4 - 100) / 2) * 0.12 : 0;
  const bx = lerp(2.6, 0.55, slide) + bump;
  return (
    <>
      <group scale={[a, a, a]}><Label pos={[-0.9, 3.15, -2.3]} w={1.3} h={0.7} text="Fix railing." bg="#fffaf0" fg={COL.dark} size={84} rot={[0, 0, 0.03]} /></group>
      <Label pos={[bx, 3.15, -2.3]} w={1.3} h={0.7} text="Railing work." bg="#e6efe9" fg={COL.dark} size={84} rot={[0, 0, -0.04 - bump]} />
      {f > B.b4 + 104 ? <Label pos={[-0.2, 3.9 + Math.sin(f / 7) * 0.05, -2.3]} w={0.5} h={0.5} text="?" bg={COL.red} size={170} rot={[0, 0, 0.1]} /> : null}
    </>
  );
};

// ---------- the scene ----------
const Scene3D: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const wob = f < B.b2 ? Math.sin(f / 3) * 0.035 * (1 - f / 200)
    : f < B.b3 ? Math.sin(f / 4) * 0.075
    : f < B.b4 ? 0.012 * Math.sin(f / 9) : 0.006 * Math.sin(f / 11);
  const pop = spring({ frame: f + 6, fps, config: { damping: 9, stiffness: 160 } });
  const buzz = f < 16 ? Math.sin(f * 2.2) * 0.012 : 0;
  const shrink = seg(f, B.b9 - 6, B.b9 + 30);
  const client = clientPose(f), pro = proPose(f);
  return (
    <Stage camera={{ position: [-0.2, 1.9, 6.0], fov: 38 }} tint="#2a3350" keyColor="#fff3dc" floorY={0.02} shadows={false}>
      <Cam f={f} />
      <Wall /><Floor /><Stairs wob={wob} /><Door /><Boots x={-3.95} z={-2.55} /><Bench /><Table /><Clock f={f} /><Calendar f={f} />
      <Phone f={f} pop={f < 4 ? Math.max(0.5, pop) : pop} shake={buzz} shrink={shrink} />
      {/* four word blocks tumble onto the table as the closing question lands */}
      {f >= B.b9 - 4 ? ["Railing.", "Cash.", "Thursday", "maybe."].map((w, i) => {
        const t = seg(f, B.b9 - 4 + i * 6, B.b9 + 16 + i * 6);
        return <Label key={w} pos={[-1.2 + i * 0.5, lerp(3.2, 1.12 + i * 0.0, t) + (t < 1 ? 0 : 0), -2.2 + (i % 2) * 0.15]} w={0.46} h={0.2} text={w} bg={COL.green} size={48} rot={[0, 0, (1 - t) * 0.6 * (i % 2 ? 1 : -1)]} depth={0.12} />;
      }) : null}
      <Signs f={f} /><Cards f={f} />
      <Flag n={1} pos={[0.05, 1.02, -2.5]} start={B.b4 + 6} f={f} />
      {f < B.b6 ? <Flag n={2} pos={[-2.75, 0.02, -1.2]} start={B.b5 + 6} f={f} /> : null}
      <Flag n={3} pos={[-3.55, 0.02, -2.3]} start={B.b6 + 6} f={f} />
      <Person p={client} coat={f >= B.b6 && f < B.b7 ? COL.coat : COL.coat} hat={COL.coat2} hatStud />
      <Person p={pro} coat={COL.orange} hat="#f2c230" skin={COL.skin2} brim />
      <Bills f={f} /><BlankPage f={f} /><Easel f={f} />
      {f >= B.b8 && f < B.b9 ? <HeldCard f={f} pos={[-0.3, 1.2, 0.55]} /> : null}
    </Stage>
  );
};

// ---------- video ----------
export const FourWordQuote: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#2a3350" }}>
      <Scene3D f={f} />
      <Caption text="The whole quote: four words." from={4} to={B.b2 - 2} size={104} />
      <Caption text="Finally asking about the railing" from={B.b2 + 2} to={B.b3 - 2} size={104} />
      <Caption text="Repair or rebuild? Can't tell." from={B.b3 + 2} to={B.b4 - 2} size={104} />
      <Caption text="Flag 1: one line, no detail" from={B.b4 + 2} to={B.b5 - 2} size={104} />
      <Caption text="Flag 2: cash up front, nothing on paper" from={B.b5 + 2} to={B.b6 - 2} size={90} />
      <Caption text={'Flag 3: "Thursday, maybe."'} from={B.b6 + 2} to={B.b7 - 2} size={104} />
      <Caption text="A good quote: what, what's included, when" from={B.b7 + 2} to={B.b8 - 2} size={90} />
      <Caption text="Good pros won't mind you asking" from={B.b8 + 2} to={B.b9 - 2} size={96} />
      <CommentCard from={B.b9 + 2} question="Shortest quote you've seen?" prompt="How many words?" />
      <Progress />
      {V.map((s, i) => <VoiceClip key={i} name="quote" n={i + 1} at={s} />)}
      <Sfx name="quote/room" at={0} volume={0.3} />
      <Sfx name="quote/buzz" at={2} volume={0.45} />
      <Sfx name="quote/creak" at={B.b2 + 22} volume={0.3} />
      <Sfx name="quote/thunk" at={B.b4 + 14} volume={0.45} />
      <Sfx name="quote/thunk" at={B.b5 + 14} volume={0.45} />
      <Sfx name="quote/thunk" at={B.b6 + 14} volume={0.45} />
      <Sfx name="quote/cash" at={B.b5 + 44} volume={0.35} />
      <Sfx name="quote/clock" at={B.b6 + 20} volume={0.3} />
      <Sfx name="quote/snap" at={1024} volume={0.4} />
      <Sfx name="quote/snap" at={1050} volume={0.4} />
      <Sfx name="quote/snap" at={1073} volume={0.4} />
      <Sfx name="quote/chime" at={1100} volume={0.35} />
    </AbsoluteFill>
  );
};
