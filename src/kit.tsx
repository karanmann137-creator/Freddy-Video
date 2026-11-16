// Shared pieces every video can use: brand colours, captions, end card.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const C = { navy: "#1a2236", deep: "#0f1524", orange: "#ea6b14", text: "#f0f4ff" };
export const FONT = "Arial Black, Arial, sans-serif";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Words pop in one at a time. `from`/`to` are frames on the video timeline. */
export const Caption: React.FC<{ text: string; from: number; to: number; size?: number; n?: number; sub?: string; top?: number }> =
  ({ text, from, to, size = 112, n, sub, top = 200 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    if (frame < from || frame >= to) return null;
    const f = frame - from;
    const out = interpolate(frame, [to - 6, to], [1, 0], clamp);
    const words = text.split(" ");
    return (
      <AbsoluteFill style={{ alignItems: "center", paddingTop: top, opacity: out }}>
        {n ? (
          <div style={{ width: 130, height: 130, borderRadius: 65, background: C.orange, color: "#fff", fontFamily: FONT, fontWeight: 900,
            fontSize: 84, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28,
            transform: `scale(${spring({ frame: f, fps, config: { damping: 9 } })})` }}>{n}</div>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 26px", padding: "0 60px" }}>
          {words.map((w, i) => {
            const s = spring({ frame: f - i * 3, fps, config: { damping: 11, mass: 0.5 } });
            return <span key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: C.text,
              textShadow: "0 8px 0 rgba(0,0,0,.45)", transform: `translateY(${(1 - s) * 70}px) scale(${0.6 + s * 0.4})`, opacity: s,
              display: "inline-block" }}>{w}</span>;
          })}
        </div>
        {sub ? <div style={{ marginTop: 26, fontFamily: FONT, fontWeight: 900, fontSize: 58, color: C.orange,
          opacity: interpolate(f, [14, 22], [0, 1], clamp) }}>{sub}</div> : null}
      </AbsoluteFill>
    );
  };

export const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return <div style={{ position: "absolute", top: 0, left: 0, height: 14, width: `${(frame / durationInFrames) * 100}%`, background: C.orange }} />;
};

export const EndCard: React.FC<{ from: number; line1: string; line2: string }> = ({ from, line1, line2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from) return null;
  const s = spring({ frame: frame - from, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ background: `rgba(15,21,36,${0.93 * s})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 118, color: C.text, textAlign: "center", padding: "0 70px", lineHeight: 1.05,
        transform: `scale(${0.8 + s * 0.2})`, opacity: s }}>{line1}</div>
      <div style={{ fontFamily: FONT, fontSize: 60, color: C.text, opacity: 0.85 * s, textAlign: "center", padding: "36px 90px 0", lineHeight: 1.2 }}>{line2}</div>
      <div style={{ marginTop: 70, background: C.orange, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 76, padding: "26px 60px", borderRadius: 28,
        transform: `scale(${spring({ frame: frame - from - 12, fps, config: { damping: 8 } })})` }}>freddyfixit.ca</div>
    </AbsoluteFill>
  );
};
