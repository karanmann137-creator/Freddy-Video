import React from "react";
import { Composition } from "remotion";
import { FrozenPipe, frozenPipeFrames } from "./videos/FrozenPipe";

export const Root: React.FC = () => (
  <>
    <Composition id="FrozenPipe" component={FrozenPipe} width={1080} height={1920} fps={30} durationInFrames={frozenPipeFrames} />
  </>
);
