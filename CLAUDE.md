# freddy-video

Short vertical videos (1080x1920, 30fps) for Freddy Fix It, written as code with Remotion and three.js. No footage, no AI video credits.

## Layout
- `src/kit.tsx` — brand constants and the pieces every video shares: `Caption` (words pop in), `Progress`, `CommentCard`, `Voice`, `Sfx`, `C` colours, `FONT`. (`EndCard` names the website; do not use it unless the owner asks for a direct ad.) Do not restyle these per video; they are what makes every video read as Freddy Fix It.
- `src/videos/<Name>.tsx` — one file per video. `FrozenPipe.tsx` is the reference for quality and structure.
- `src/Root.tsx` — register each video as a `<Composition>`.
- `published/` — finished MP4s, named `YYYY-MM-DD-slug.mp4`. Public link: `https://raw.githubusercontent.com/karanmann137-creator/Freddy-Video/main/published/<file>`.
- `render.sh` — `./render.sh <Id> out/x.mp4` renders; `./render.sh <Id> out/f.png 120` renders one frame to check.

## What makes a video acceptable (owner's words, 2026-11-15)
The first tests were rejected because they had "nothing to do with the subject matter", "no hook" and "nothing engaging". So:
1. **The picture is the subject.** If the topic is a frozen pipe, the viewer watches a pipe freeze and burst. Never generic shapes behind text.
2. **Hook inside the first 2.5 seconds**: a line that makes sense with the sound off, plus something visibly about to go wrong or change.
3. **Something moves every beat**: each caption has a matching action on screen (valve turns, water stops).
4. **The look follows the script's `visual_style`** ("family / twist", for example "toon-3d / night scene"). The playbook's STYLE ROTATION decides when a family is new and when a winning one returns. A returning family must get its twist (new setting, palette or camera) so it never looks like a repeat of an earlier video; a new family must look unlike everything in `src/videos`. Check the playbook's STYLE REFERENCES for looks the owner has shown us. Keep the font, captions and closing card from the kit. Never copy a competitor's look, a named brand's toys or characters, or another creator's exact video.
5. Captions: at most 9 words on screen, heavy sans (`FONT`), top third of the frame, subject in the middle.
6. **End on a question, not a pitch.** Close with `CommentCard`: a question or a simple "comment if this has happened to you". In helpful and entertainment videos do not say or show the business name, the website, "post a job" or "join us" anywhere; the account name on the post is the only branding.
7. **Script types** (the script row's `format` column says which; the playbook's SCRIPT TYPES has the full rules): `helpful: ...` shows what to do, on the thing itself. `entertainment` is pure fun with no advice and no business. `comparison` is the one type that names us: first a bad experience people have with big home-service apps (shown as an experience, never naming another company or stating facts about one), then how Freddy Fix It does it, saying the name once and using only what the script says, which comes from the playbook's WHAT WE CAN CLAIM. Never add a claim, number or guarantee of your own.

## Pacing (owner's call, 2026-11-15: the 19-second cut beat the 15-second one)
- 17 to 22 seconds total. Hook lands by about 2.5 s. Beats run 2.5 to 3.5 s; let a line breathe rather than rushing it.
- Shape: hook (what could happen) -> the twist or the cost (the reveal, biggest sound) -> 2 to 4 payoff beats -> question card (about 3 s).
- Something must already be moving on frame 1. Change the picture (camera move, new object, colour shift) at every beat.
- Spoken lines are full natural sentences, up to about 12 words. The on-screen caption is shorter than the spoken line.
- Most people watch with the sound off: the hook must work from the caption and picture alone.
- FrozenPipe.tsx is the pacing reference.

## Technical notes
- Use `useCurrentFrame()` for all motion. No `Math.random()` (use a seeded function like `rnd` in FrozenPipe), no CSS animations, no timers: frames render out of order.
- 3D goes inside `<ThreeCanvas width={1080} height={1920}>` from `@remotion/three`. Visible width at the subject is narrow (portrait), so keep the subject within about 3.5 units wide at 10 units from the camera, or move the scene under a fixed camera as FrozenPipe does.
- Always render 5 or 6 single frames across the video and LOOK at them before rendering the full video. Fix anything off-frame, overlapping the captions or unreadable.
- Rendering uses the system Chrome; Remotion's own browser download is blocked in this environment.

## Voiceover (owner asked for one consistent voice, 2026-11-15)
- Every video is narrated by the same free local voice. Once per workspace run `tools/setup-voice.sh` (about 350 MB from GitHub).
- Write one spoken line per beat: a natural sentence version of that beat's caption, up to about 12 words. Never say the website; say the business name only in a comparison video, once.
- `python3 tools/tts.py <slug> "line 1" "line 2" ...` writes `public/voice/<slug>-N.wav` and prints each line's length in frames. Make every beat at least that long plus about 10 frames, then add `<Voice name="<slug>" starts={[...beat start frames]} />` from the kit. FrozenPipe shows the pattern.
- Never change `VOICE` or `SPEED` in tools/tts.py for one video; the voice must match across all videos. Commit the wav files.
- No music is mixed into the file. Do not add copyrighted songs.

## Sound effects (owner asked for them at key moments, 2026-11-15)
- `<Sfx name="..." at={frame} volume={0.4} />` from the kit plays one effect from `public/sfx/`. All of them are generated by `tools/make_sfx.py`, so there is nothing to license. Do not download sound effects or memes sounds from the web.
- Kit: `riser` (2 s of building tension: start it 60 frames before the reveal so it ends on it), `impact` (the big moment), `whoosh` (camera moves, transitions), `pop` (something appears), `ding` (success, end card), `tick` (counters), `spray` (water, air, steam), `glitch` (something breaking).
- Every video needs at least: a build-up into the hook's reveal, a hit on the reveal, a cue on each step, and a ding on the closing card. Keep effects under the voice (volume 0.2 to 0.5; only `impact` may go to 0.9). FrozenPipe shows the pattern.
- If a video needs a sound the kit lacks, add it to `tools/make_sfx.py` in the same style, rerun it, and commit the new wav.

## Trending audio (Instagram only, optional)
- The playbook (Google Doc 1oeTWYRT0Dedy36xaiwEuA8YFFhWhAZnqZsdFJ_i6yVA, read only) has a section "THIS WEEK'S AUDIO" where the owner lists Instagram audio names.
- Use one only if its mood suits this video (do not put an upbeat party track under a flood or a safety warning). If none fits, or the list is empty, skip it.
- To use it, add to the Metricool post's instagramData: `"audioConfiguration": {"audioId": "<name exactly as listed>", "audioVolume": 12, "videoVolume": 100}` so it sits quietly under the voice. If Metricool rejects the post because of the audio, schedule it again once without audioConfiguration and say so in the report. Never mix such a track into the video file.

## Publishing
- The repo's real name is `Freddy-Video` (capital F and V); the raw link is case-sensitive.
- Finished videos are committed straight to `main` so the public link works. Metricool copies the file when a post is scheduled (confirmed 2026-11-15).
