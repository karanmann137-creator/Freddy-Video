// "The 2 a.m. drip" — entertainment type, painted: papercut. Pictures come from tools/art/paint_drip.py.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, CommentCard, Progress, Sfx, VoiceClip, clamp, FONT } from "../kit";

// beats leave room to breathe: the voice starts 10 frames in and each line is followed by about 20 frames of quiet
const T = { tap: 105, weekend: 230, months: 339, bucket: 417, end: 525, total: 638 };
const art = (n: string) => staticFile(`art/drip/${n}.jpg`);
const PAPER = "#f7f1e4";

// one paper drop falling from the nozzle; `land` is where it stops (basin or bucket)
const Drop: React.FC<{ start: number; land: number }> = ({ start, land }) => {
  const f = useCurrentFrame() - start;
  if (f < 0 || f > 26) return null;
  const hang = interpolate(f, [0, 8], [0, 1], clamp);                 // swells on the nozzle
  const fall = interpolate(f, [8, 17], [0, 1], clamp);
  const y = 1062 + fall * fall * (land - 1062);
  const ring = interpolate(f, [17, 26], [0, 1], clamp);
  return (
    <>
      {f <= 17 ? <div style={{ position: "absolute", left: 426 - 17, top: y, width: 34, height: 44 * (0.4 + hang * 0.6),
        background: "#6bb3e6", borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%", boxShadow: "4px 6px 0 rgba(0,0,0,.18)" }} /> : null}
      {f > 17 ? <div style={{ position: "absolute", left: 426 - 60 * ring - 20, top: land - 8 * ring, width: 120 * ring + 40, height: 26 * ring + 8,
        border: "6px solid #6bb3e6", borderRadius: "50%", opacity: 1 - ring }} /> : null}
    </>
  );
};

// a paper calendar page stuck on the tiles
const Calendar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < T.weekend + 8 || frame >= T.bucket + 20) return null;
  const inn = spring({ frame: frame - T.weekend - 8, fps, config: { damping: 11 } });
  const months = ["AUG", "SEP", "OCT", "NOV"];
  const k = Math.min(3, Math.max(0, Math.floor((frame - T.months - 6) / 13) + 1));
  const idx = frame < T.months + 6 ? 0 : k;
  const flip = frame < T.months + 6 ? 0 : ((frame - T.months - 6) % 13) / 13;
  const out = interpolate(frame, [T.bucket, T.bucket + 20], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 90, top: 620, width: 300, height: 330, background: PAPER, borderRadius: 10, opacity: out,
      boxShadow: "10px 14px 0 rgba(0,0,0,.2)", transform: `rotate(${-5 + (1 - inn) * 30}deg) scale(${inn}) translateY(${idx < 3 && frame >= T.months + 6 ? -18 * Math.sin(flip * Math.PI) : 0}px)` }}>
      <div style={{ height: 84, background: "#d9534a", borderRadius: "10px 10px 0 0", color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 54,
        display: "flex", alignItems: "center", justifyContent: "center" }}>{months[idx]}</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: "#2b2430", textAlign: "center", marginTop: 34, lineHeight: 1.1 }}>
        {frame < T.months + 6 ? <>FIX TAP<br />SATURDAY</> : <span style={{ textDecoration: "line-through", opacity: 0.55 }}>FIX TAP<br />SATURDAY</span>}
      </div>
    </div>
  );
};

export const Drip2am: React.FC = () => {
  const frame = useCurrentFrame();
  // 1) street: slow push toward the lit window, then the cut
  const zoom = interpolate(frame, [0, T.tap], [1, 1.75], clamp);
  const night = interpolate(frame, [T.months, T.months + 40], [0.42, 0], clamp);     // dawn comes as the months flip
  const toBucket = interpolate(frame, [T.bucket - 6, T.bucket + 6], [0, 1], clamp);
  const said = [T.tap + 8, T.tap + 44, T.tap + 80];                 // the three drips the voice counts out loud
  const bump = frame >= T.tap && frame < T.tap + 8 ? 1 + 0.04 * (1 - (frame - T.tap) / 8) : 1;
  const dripsNight = [...said, T.weekend + 34, T.weekend + 84, T.months + 50];
  const dripsBucket = [T.bucket + 10, T.bucket + 84];
  return (
    <AbsoluteFill style={{ background: "#151d45" }}>
      {frame < T.tap ? (
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "39% 68%" }}>
          <Img src={art("street")} style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ transform: `scale(${bump})` }}>
          <Img src={art("tap")} style={{ position: "absolute", width: "100%", height: "100%" }} />
          <Img src={art("bucket")} style={{ position: "absolute", width: "100%", height: "100%", opacity: toBucket }} />
          {dripsNight.map((s) => <Drop key={s} start={s} land={1400} />)}
          {dripsBucket.map((s) => <Drop key={s} start={s} land={1150} />)}
          <AbsoluteFill style={{ background: `rgba(16,24,78,${night})`, mixBlendMode: "multiply" }} />
          <AbsoluteFill style={{ background: "linear-gradient(rgba(15,21,36,.62) 0%, rgba(15,21,36,.35) 22%, rgba(15,21,36,0) 40%)" }} />
          <Calendar />
        </AbsoluteFill>
      )}

      <Caption text="It's 2 a.m." from={0} to={T.tap} size={150} sub="...then you hear it" />
      {/* one more DRIP on screen each time a drop lands */}
      <Caption text="DRIP." from={said[0] + 17} to={said[1] + 17} size={150} top={230} />
      <Caption text="DRIP. DRIP." from={said[1] + 17} to={said[2] + 17} size={150} top={230} />
      <Caption text="DRIP. DRIP. DRIP." from={said[2] + 17} to={T.weekend} size={132} top={230} />
      <Caption text={"“I'll fix it this weekend”"} from={T.weekend} to={T.months} size={98} top={210} />
      <Caption text="3 months ago." from={T.months} to={T.bucket} size={140} top={230} />
      <Caption text="Now there's a bucket." from={T.bucket} to={T.end} size={112} top={210} sub="And it's full." />
      <CommentCard from={T.end} question="Is this your house?" prompt="Comment if it is" />

      {/* voice: each line starts 10 frames into its beat; "Drip." is one clip said on each landing */}
      <VoiceClip name="drip" n={1} at={10} />
      {said.map((d) => <VoiceClip key={d} name="drip" n={2} at={d + 15} />)}
      <VoiceClip name="drip" n={3} at={T.weekend + 10} />
      <VoiceClip name="drip" n={4} at={T.months + 10} />
      <VoiceClip name="drip" n={5} at={T.bucket + 10} />
      <VoiceClip name="drip" n={6} at={T.end + 10} />

      {/* sound made for this video (tools/sfx/drip.py): a clock in a quiet house, water, paper */}
      {Array.from({ length: 7 }).map((_, i) => <Sfx key={i} name={i % 2 ? "drip/tock" : "drip/tick"} at={i * 15} volume={0.22 + i * 0.04} />)}
      <Sfx name="drip/thud" at={T.tap} volume={0.8} />
      {dripsNight.map((d) => <Sfx key={d} name="drip/plink" at={d + 17} volume={0.5} />)}
      {dripsBucket.map((d) => <Sfx key={d} name="drip/plunk" at={d + 17} volume={0.55} />)}
      <Sfx name="drip/slide" at={T.weekend + 8} volume={0.4} />
      {[0, 1, 2].map((i) => <Sfx key={i} name="drip/page" at={T.months + 6 + i * 13} volume={0.5} />)}
      <Sfx name="drip/slide" at={T.bucket - 6} volume={0.4} />
      <Sfx name="drip/chime" at={T.end + 6} volume={0.45} />
      <Progress />
    </AbsoluteFill>
  );
};
export const drip2amFrames = T.total;
