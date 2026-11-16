# freddy-video

Short vertical videos (1080x1920, 30fps) for Freddy Fix It, written as code with Remotion and three.js. No footage, no AI video credits.

## Layout
- `src/kit.tsx` — brand constants and the pieces every video shares: `Caption` (words pop in), `Progress`, `EndCard`, `C` colours, `FONT`. Do not restyle these per video; they are what makes every video read as Freddy Fix It.
- `src/videos/<Name>.tsx` — one file per video. `FrozenPipe.tsx` is the reference for quality and structure.
- `src/Root.tsx` — register each video as a `<Composition>`.
- `published/` — finished MP4s, named `YYYY-MM-DD-slug.mp4`. Public link: `https://raw.githubusercontent.com/karanmann137-creator/Freddy-Video/main/published/<file>`.
- `render.sh` — `./render.sh <Id> out/x.mp4` renders; `./render.sh <Id> out/f.png 120` renders one frame to check.

## What makes a video acceptable (owner's words, 2026-11-15)
The first tests were rejected because they had "nothing to do with the subject matter", "no hook" and "nothing engaging". So:
1. **The picture is the subject.** If the topic is a frozen pipe, the viewer watches a pipe freeze and burst. Never generic shapes behind text.
2. **Hook inside the first 2.5 seconds**: a line that makes sense with the sound off, plus something visibly about to go wrong or change.
3. **Something moves every beat**: each caption has a matching action on screen (valve turns, water stops).
4. **A different look every video.** Change the visual style each time (toon, low-poly PS2, bricks, blueprint line-art, paper cut-out, neon, black and white...). The style name is recorded in the script bank so the weekly review can score it. Keep the font, captions and end card from the kit.
5. Captions: at most 9 words on screen, heavy sans (`FONT`), top third of the frame, subject in the middle.
6. End card with a reason to act and freddyfixit.ca.

## Technical notes
- Use `useCurrentFrame()` for all motion. No `Math.random()` (use a seeded function like `rnd` in FrozenPipe), no CSS animations, no timers: frames render out of order.
- 3D goes inside `<ThreeCanvas width={1080} height={1920}>` from `@remotion/three`. Visible width at the subject is narrow (portrait), so keep the subject within about 3.5 units wide at 10 units from the camera, or move the scene under a fixed camera as FrozenPipe does.
- Always render 5 or 6 single frames across the video and LOOK at them before rendering the full video. Fix anything off-frame, overlapping the captions or unreadable.
- Rendering uses the system Chrome; Remotion's own browser download is blocked in this environment.

## Voiceover (owner asked for one consistent voice, 2026-11-15)
- Every video is narrated by the same free local voice. Once per workspace run `tools/setup-voice.sh` (about 350 MB from GitHub).
- Write one spoken line per beat: a natural sentence version of that beat's caption, short enough to say in the beat. Say the site as "Freddy Fix It dot C A".
- `python3 tools/tts.py <slug> "line 1" "line 2" ...` writes `public/voice/<slug>-N.wav` and prints each line's length in frames. Make every beat at least that long plus about 10 frames, then add `<Voice name="<slug>" starts={[...beat start frames]} />` from the kit. FrozenPipe shows the pattern.
- Never change `VOICE` or `SPEED` in tools/tts.py for one video; the voice must match across all videos. Commit the wav files.
- No music is mixed into the file. Do not add copyrighted songs.

## Publishing
- The repo's real name is `Freddy-Video` (capital F and V); the raw link is case-sensitive.
- Finished videos are committed straight to `main` so the public link works. Metricool copies the file when a post is scheduled (confirmed 2026-11-15).
