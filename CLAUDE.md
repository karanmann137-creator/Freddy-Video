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
6. **End on the type's ask.** Close with `CommentCard` using the script's closing line. How much a video may sell depends on its type (the script row's `format` column), following the conversion ladder in the "Hook and script library" Google Doc (id 1JOtExo7A49dcvSBhRp2XMemdTkLcwj_LzKoun2B6mhM): entertainment and trade-life never mention the business; helpful, diy-or-pro, red-flags and pro-tip never name it in the video (the caption carries a soft call to act); comparison and recruit name Freddy Fix It once, using only what the playbook's WHAT WE CAN CLAIM allows. Never show the website on screen, and never add a claim, number or guarantee the script does not have.
7. Never name or show another company, app, website or logo. Bad experiences are shown as things that happen to people.

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

## Painted scenes (drawing library, installed 2026-11-16 at the owner's request)
- `vendor/claude-drawing/` is a copy of github.com/cloveric/claude-drawing-skill (MIT): a Python library that paints illustrations in code, 83 styles (papercut, watercolor, gouache, linocut, blueprint, isometric, storybook, stainedglass, cartoon, lowpoly, pixelart and more; one module per style in `lib/`). No image model, no keys, no cost. Needs `pip install --break-system-packages numpy Pillow`.
- Use it when the script's `visual_style` family starts with `painted:` (for example `painted: papercut / winter street`). It makes still pictures, so the motion still comes from Remotion: paint the scene (and, where useful, the same scene in a second state, such as before and after), save PNG or JPG under `public/art/<slug>/`, and move them in the video with pans, zooms, cross-fades and 2D or 3D objects on top. Running an example with `--stages DIR` writes build-up snapshots that can be played as a draw-on reveal.
- `vendor/claude-drawing/SKILL.md` is the manual, in Chinese, about 3,100 lines. Do NOT read it all. Read the workflow section (lines 190 to 205), then search it for the one style module you are using, and open the matching file in `vendor/claude-drawing/examples/` or `lib/` for the calls. Paint at 1080x1920.
- A picture takes about a minute to render and usually two or three tries. Budget: at most 3 painted pictures per video. Look at every picture before using it. The owner's rules still apply: the picture is the subject, no other company's name or logo, no real people.
- Do not edit files under `vendor/`.

## Voiceover (one consistent voice; pacing rules from the owner's feedback, 2026-11-16)
- Every video is narrated by the same free local voice. Once per workspace run `tools/setup-voice.sh` (about 350 MB from GitHub).
- `python3 tools/tts.py <slug> "line 1" "line 2" ...` writes `public/voice/<slug>-N.wav` and prints each line's length in frames.
- Never change `VOICE` or `SPEED` in tools/tts.py; the voice must match across all videos. Commit the wav files.
- The owner found a tightly packed voiceover "rushed" with "unnatural pacing". So:
  - Start each line about 10 frames into its beat, and leave at least 20 frames of quiet after it before the next line. Beat length = line length + 30 or more.
  - Write lines the way a person says them, with commas and "..." where a breath belongs ("It's two a.m... and then, you hear it."). One idea per line, up to about 12 words.
  - A word that belongs to an action (a count, "Drip.", "Crack.") is its own clip, placed on the action with `<VoiceClip name n at />`, and reused for each repeat. Never have the voice rattle off "Drip. Drip. Drip." in one line while the picture does something else.
  - `<Voice name starts />` places clips 1..N in order (FrozenPipe); `<VoiceClip />` places one clip at an exact frame (Drip2am).
- Never say the website; say the business name only in a comparison video, once.
- No music is mixed into the file. Do not add copyrighted songs.

## Sound effects (owner: "different sound effects for each video, only use the same ones where it makes sense")
- Each video gets its own sounds, designed for its subject: water for plumbing, a hum and a click for electrical, wood and nails for carpentry, a quiet clock for a night scene. Write `tools/sfx/<slug>.py` using the helpers in `tools/sfxlib.py`, save into `public/sfx/<slug>/`, and play them with `<Sfx name="<slug>/<sound>" at={frame} volume={0.4} />`. `tools/sfx/drip.py` is the worked example. Everything is made in code; never download sound effects or meme sounds.
- Decide the sound from the story, not from a checklist: what builds the tension here (it may be silence and a ticking clock rather than a riser), what the reveal sounds like, what each action sounds like, and how the ending should feel.
- The shared kit in `public/sfx/` (riser, impact, whoosh, pop, ding, tick, spray, glitch; made by `tools/make_sfx.py`) is only for neutral moments where a custom sound adds nothing, such as a plain transition. Do not open two videos in a row with the same build-up and hit.
- Keep effects under the voice (volume 0.2 to 0.5; one big moment may go to 0.9), and land each sound on the frame its action happens.
- Commit the script and the wav files.

## Output and publishing (changed 2026-11-19: nothing is posted automatically)
- Buffer and Metricool are no longer used. Never call them.
- The repo's real name is `Freddy-Video` (capital F and V); the raw link is case-sensitive. Commit each finished MP4 to `published/YYYY-MM-DD-slug.mp4` on `main`; its full-quality download link is `https://raw.githubusercontent.com/karanmann137-creator/Freddy-Video/main/published/<file>`.
- The owner's shared Google Drive folder "Freddy Fix It — Social content" (folder id `1fBYg6_WOrYbQAQNrJNfobzIS8ZVdRMHs`) gets, for each video, one caption file: a Google Doc made with the Drive `create_file` tool (`parentId` = that folder, `contentMimeType: "text/plain"`, `textContent`), titled `YYYY-MM-DD <Short name> — video caption and link`. Follow the layout of the existing ones: what it is (length, audience, type), the download link, where to post (Instagram Reels, Facebook Reels, TikTok, YouTube Shorts), a title of 60 characters or fewer for YouTube and TikTok, the caption, and a trending audio suggestion if the playbook lists one that fits. Do NOT upload the MP4 to Drive: the connection refuses files over about 3 MB, and the owner adds video files himself.
- Graphics are drawn offline with `node tools/render_card.mjs card.json out.png [story]` (layout in `tools/card-layout.mjs`, copied from the website's card). Feed and story PNGs are small enough to upload to the Drive folder with `create_file`, using `base64Content` set to the file reference `sha256:<hash>:<absolute path>` and `disableConversionToGoogleType: true`.
