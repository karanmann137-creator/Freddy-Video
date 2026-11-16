// "Frozen pipe" — toon 3D story: pipe frosts over, bursts, then the three fixes.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { C, Caption, CommentCard, Progress, Sfx, Voice, clamp, FONT } from "../kit";

const rnd = (i: number) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
const mix = (a: string, b: string, t: number) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();

// beats (frames @30fps)
// each beat is at least as long as its spoken line (see tools/tts.py output) plus a short breath
const T = { burst: 80, valve: 175, tap: 270, warm: 350, end: 465, total: 565 };

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frost = interpolate(frame, [5, 70], [0, 1], clamp) * interpolate(frame, [T.warm + 15, T.end - 15], [1, 0], clamp);
  const flow = interpolate(frame, [T.burst, T.burst + 6], [0, 1], clamp) * interpolate(frame, [T.valve + 40, T.valve + 75], [1, 0], clamp);
  const shake = frame >= T.burst && frame < T.burst + 18 ? (rnd(frame) - 0.5) * 0.35 * (1 - (frame - T.burst) / 18) : 0;
  // camera target slides between pipe (0), valve (+3.2), tap (-3.2), pipe (0)
  const toValve = spring({ frame: frame - T.valve, fps, config: { damping: 16 } });
  const toTap = spring({ frame: frame - T.tap, fps, config: { damping: 16 } });
  const toWarm = spring({ frame: frame - T.warm, fps, config: { damping: 16 } });
  const camX = 3.2 * toValve - 6.4 * toTap + 3.2 * toWarm;
  const push = interpolate(frame, [0, T.burst], [11.5, 9.2], clamp);
  const turn = interpolate(frame, [T.valve + 25, T.valve + 80], [0, Math.PI * 3], clamp);
  const pipeCol = mix("#b87333", "#dff1ff", frost);
  const warm = frame >= T.warm && frame < T.end ? 3 + Math.sin(frame / 4) * 1.2 : 0;
  const puddle = interpolate(frame, [T.burst + 5, T.valve + 70], [0, 1], clamp);

  return (
    <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 0.4, 10], fov: 40 }}>
      <color attach="background" args={[C.navy]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 8]} intensity={2.4} />
      <pointLight position={[0.8, -0.6, 2]} color={C.orange} intensity={warm * 6} distance={6} />
      <group position={[-camX + shake, -1.1 + shake * 0.6, 10 - push]}>
        {/* wall + floor */}
        <mesh position={[0, 0, -1.2]}><planeGeometry args={[30, 14]} /><meshToonMaterial color="#232d47" /></mesh>
        {[-6, -3, 0, 3, 6].map((x) => <mesh key={x} position={[x + 1.5, 0, -1.15]}><boxGeometry args={[0.12, 14, 0.05]} /><meshToonMaterial color="#1b2338" /></mesh>)}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]}><planeGeometry args={[30, 6]} /><meshToonMaterial color="#141b2d" /></mesh>
        {/* puddle */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, -2.58, 0.6]} scale={[puddle * 2.6, puddle * 1.1, 1]}><circleGeometry args={[1, 40]} /><meshToonMaterial color="#3aa0ff" /></mesh>
        {/* main pipe + brackets */}
        <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.42, 0.42, 14, 28]} /><meshToonMaterial color={pipeCol} /></mesh>
        {[-5, -1.7, 1.7, 5].map((x) => <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.52, 0.52, 0.34, 28]} /><meshToonMaterial color={mix("#8a5524", "#c8e4f5", frost)} /></mesh>)}
        {/* frost crystals */}
        {Array.from({ length: 46 }).map((_, i) => {
          const a = rnd(i) * Math.PI * 2, x = (rnd(i + 50) - 0.5) * 3.2;
          const s = spring({ frame: frame - 8 - i * 1.3, fps, config: { damping: 8 } }) * frost * (0.1 + rnd(i + 9) * 0.16);
          return <mesh key={i} position={[x, Math.sin(a) * 0.46, Math.cos(a) * 0.46]} rotation={[a, i, 0]} scale={s}><octahedronGeometry args={[1, 0]} /><meshToonMaterial color="#ffffff" /></mesh>;
        })}
        {/* crack */}
        {frame >= T.burst ? <mesh position={[0.15, -0.12, 0.43]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.7, 0.07, 0.02]} /><meshBasicMaterial color="#05080f" /></mesh> : null}
        {frame >= T.burst ? <mesh position={[0.3, -0.02, 0.43]} rotation={[0, 0, -0.6]}><boxGeometry args={[0.4, 0.06, 0.02]} /><meshBasicMaterial color="#05080f" /></mesh> : null}
        {/* water spray */}
        {flow > 0.02 ? Array.from({ length: 70 }).map((_, i) => {
          const life = 26, t = ((frame - T.burst + i * 7) % life) / life;
          const vx = (rnd(i) - 0.5) * 3.4, vy = 1.2 + rnd(i + 3) * 2.6, vz = 1.5 + rnd(i + 7) * 2;
          return <mesh key={i} position={[0.2 + vx * t, -0.1 + vy * t - 6.5 * t * t, 0.45 + vz * t]} scale={(0.07 + rnd(i + 1) * 0.09) * flow * (1 - t * 0.5)}>
            <sphereGeometry args={[1, 8, 8]} /><meshToonMaterial color="#63b8ff" /></mesh>;
        }) : null}
        {/* shut-off valve at x=3.2 */}
        <group position={[3.2, 0, 0]}>
          <mesh position={[0, 0.75, 0]}><cylinderGeometry args={[0.12, 0.12, 0.9, 16]} /><meshToonMaterial color="#9aa3b5" /></mesh>
          <mesh><sphereGeometry args={[0.62, 24, 24]} /><meshToonMaterial color={mix("#8a5524", "#c8e4f5", frost * 0.6)} /></mesh>
          <group position={[0, 1.25, 0]} rotation={[Math.PI / 2 - 0.5, 0, turn]}>
            <mesh><torusGeometry args={[0.7, 0.13, 14, 36]} /><meshToonMaterial color="#e0342b" /></mesh>
            {[0, 1, 2].map((k) => <mesh key={k} rotation={[0, 0, (k * Math.PI) / 3]}><boxGeometry args={[1.4, 0.12, 0.12]} /><meshToonMaterial color="#e0342b" /></mesh>)}
          </group>
        </group>
        {/* tap at x=-3.2 */}
        <group position={[-3.2, 0, 0]}>
          <mesh position={[0, 0, 0.75]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.22, 0.22, 1.2, 20]} /><meshToonMaterial color="#c9d2e3" /></mesh>
          <mesh position={[0, -0.3, 1.3]}><cylinderGeometry args={[0.2, 0.16, 0.7, 20]} /><meshToonMaterial color="#c9d2e3" /></mesh>
          <group position={[0, 0.45, 1.05]} rotation={[0, interpolate(frame, [T.tap + 20, T.tap + 45], [0, 1.4], clamp), 0]}>
            <mesh><boxGeometry args={[1.1, 0.14, 0.2]} /><meshToonMaterial color={C.orange} /></mesh>
          </group>
          {frame > T.tap + 40 && frame < T.end ? [0, 1, 2].map((k) => {
            const t = ((frame - T.tap + k * 9) % 27) / 27;
            return <mesh key={k} position={[0, -0.7 - t * t * 2.2, 1.3]} scale={[0.09, 0.14, 0.09]}><sphereGeometry args={[1, 10, 10]} /><meshToonMaterial color="#63b8ff" /></mesh>;
          }) : null}
        </group>
        {/* hair dryer */}
        {frame >= T.warm ? (
          <group position={[0.95 + Math.sin(frame / 9) * 0.35, -1.0, 1.2]} rotation={[0, -0.4, 0.95]} scale={spring({ frame: frame - T.warm, fps, config: { damping: 10 } })}>
            <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.36, 0.3, 1.2, 20]} /><meshToonMaterial color={C.orange} /></mesh>
            <mesh position={[0.25, -0.65, 0]}><boxGeometry args={[0.26, 0.9, 0.26]} /><meshToonMaterial color="#2b2f3a" /></mesh>
          </group>
        ) : null}
      </group>
    </ThreeCanvas>
  );
};

export const FrozenPipe: React.FC = () => {
  const frame = useCurrentFrame();
  const temp = Math.round(interpolate(frame, [0, 65], [-4, -27], clamp));
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <Scene />
      {frame < T.burst ? (
        <div style={{ position: "absolute", bottom: 300, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 150,
          color: "#9fd4ff", textShadow: "0 8px 0 rgba(0,0,0,.5)" }}>{temp}°C</div>
      ) : null}
      <Caption text="Tonight your pipes could do this" from={0} to={T.burst} size={120} />
      <Caption text="BURST." from={T.burst} to={T.valve} size={230} sub="Every minute = more water damage" />
      <Caption n={1} text="Shut off the main water valve" from={T.valve} to={T.tap} size={96} top={150} />
      <Caption n={2} text="Open the nearest tap" from={T.tap} to={T.warm} size={104} top={150} />
      <Caption n={3} text="Warm the pipe slowly" from={T.warm} to={T.end} size={104} top={150} sub="Hair dryer. Never a flame." />
      <CommentCard from={T.end} question="Ever had a pipe burst?" prompt="Tell us what happened" />
      <Voice name="frozen-pipe" starts={[0, T.burst, T.valve, T.tap, T.warm, T.end]} />
      {/* sound: tension while it freezes, a hit on the burst, then a cue for each action */}
      <Sfx name="riser" at={T.burst - 60} volume={0.35} />
      <Sfx name="impact" at={T.burst} volume={0.9} />
      <Sfx name="spray" at={T.burst + 4} volume={0.3} />
      <Sfx name="spray" at={T.burst + 50} volume={0.22} />
      {[T.valve, T.tap, T.warm].map((f) => <Sfx key={f} name="whoosh" at={f - 4} volume={0.4} />)}
      {[T.valve, T.tap, T.warm].map((f) => <Sfx key={"p" + f} name="pop" at={f + 2} volume={0.45} />)}
      <Sfx name="ding" at={T.end + 12} volume={0.4} />
      <Progress />
    </AbsoluteFill>
  );
};
export const frozenPipeFrames = T.total;
