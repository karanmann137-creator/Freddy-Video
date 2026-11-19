import React from "react";
import { Composition } from "remotion";
import { FrozenPipe, frozenPipeFrames } from "./videos/FrozenPipe";
import { Drip2am, drip2amFrames } from "./videos/Drip2am";
import { FurnaceQuiet, furnaceQuietFrames } from "./videos/FurnaceQuiet";

export const Root: React.FC = () => (
  <>
    <Composition id="FrozenPipe" component={FrozenPipe} width={1080} height={1920} fps={30} durationInFrames={frozenPipeFrames} />
    <Composition id="Drip2am" component={Drip2am} width={1080} height={1920} fps={30} durationInFrames={drip2amFrames} />
    <Composition id="FurnaceQuiet" component={FurnaceQuiet} width={1080} height={1920} fps={30} durationInFrames={furnaceQuietFrames} />
  </>
);
