// Stage: the shared 3D "studio" every 3D video sits in, so scenes never look like
// flat shapes floating on a plain background. Soft studio light from an
// in-code environment (no downloads), grounded contact shadows and a soft
// vignette. (@react-three/postprocessing renders black inside Remotion's
// ThreeCanvas with --gl=swangle, tested 2026-11-19, so it is not used.)
//
// Use:
//   <Stage camera={{ position: [0, 1.2, 9], fov: 38 }} floorY={-1.6} tint="#1d2a4a">
//     ...meshes (use meshStandardMaterial / meshPhysicalMaterial, roughness 0.4-0.8)...
//   </Stage>
// Each video still picks its own palette (tint, key light colour, materials).
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { AbsoluteFill } from "remotion";

export const Stage: React.FC<{
  children: React.ReactNode;
  camera?: { position: [number, number, number]; fov?: number };
  tint?: string;          // background and fog colour
  keyColor?: string;      // main light colour (warm for cosy, cold for night)
  floorY?: number;        // where contact shadows land
  shadows?: boolean;
}> = ({ children, camera = { position: [0, 1, 10], fov: 38 }, tint = "#1b2440", keyColor = "#ffffff", floorY = -1.5, shadows = true }) => (
  <AbsoluteFill>
  <ThreeCanvas width={1080} height={1920} camera={camera}>
    <color attach="background" args={[tint]} />
    <fog attach="fog" args={[tint, 14, 32]} />
    <hemisphereLight args={["#ffffff", tint, 0.6]} />
    <directionalLight position={[4, 7, 6]} intensity={1.6} color={keyColor} />
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={3} position={[0, 5, -6]} scale={[10, 4, 1]} color={keyColor} />
      <Lightformer form="rect" intensity={1.5} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={0.8} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color={tint} />
    </Environment>
    {shadows ? <ContactShadows position={[0, floorY, 0]} opacity={0.55} scale={14} blur={2.4} far={6} resolution={512} frames={1} /> : null}
    {children}
  </ThreeCanvas>
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)", pointerEvents: "none" }} />
  </AbsoluteFill>
);
