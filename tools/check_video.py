#!/usr/bin/env python3
"""Whole-video check, run on the finished MP4 before publishing.

    python3 tools/check_video.py out/video.mp4            check
    python3 tools/check_video.py out/video.mp4 --fix      also write out/<name>-fixed.mp4 at -14 LUFS

Writes out/<name>-sheet.png: one frame every 1.5 seconds, numbered with its
time, so the whole video can be looked at in one image (open it with Read and
look at every tile). Prints length, audio loudness and every quiet gap, then
a list of problems. Exit code 1 if a hard rule fails.

Why: generators were checking 6 stills and never seeing the whole video or
hearing the mix (owner, 2026-11-19).
"""
import json, os, re, subprocess, sys, tempfile, glob

def run(args):
    return subprocess.run(args, capture_output=True, text=True)

def main(path):
    if not os.path.exists(path):
        sys.exit(f"no such file: {path}")
    probe = json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path]).stdout)
    dur = float(probe["format"]["duration"])
    has_audio = any(s["codec_type"] == "audio" for s in probe["streams"])
    problems = []

    # Contact sheet: a frame every 1.5 s, 6 per row, with the time stamped on each.
    n = int(dur / 1.5) + 1
    rows = (n + 5) // 6
    os.makedirs("out", exist_ok=True)
    sheet = os.path.join("out", os.path.splitext(os.path.basename(path))[0] + "-sheet.png")
    vf = ("fps=1/1.5,scale=270:-1,"
          "drawtext=text='%{pts\\:hms}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6,"
          f"tile=6x{rows}:padding=4:color=white")
    r = run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", vf, "-frames:v", "1", sheet])
    if r.returncode != 0:  # drawtext needs a font; fall back without timestamps
        vf = f"fps=1/1.5,scale=270:-1,tile=6x{rows}:padding=4:color=white"
        run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", vf, "-frames:v", "1", sheet])
    print(f"contact sheet: {sheet}  ({n} frames, one every 1.5 s, left to right, top to bottom)")

    # Does the picture keep changing? Compare the lower two thirds (below the
    # captions) of frames 1.5 s apart; 3+ near-identical steps in a row = a
    # stretch of 4.5 s or more where the scene just sits there.
    try:
        from PIL import Image, ImageChops, ImageStat
        with tempfile.TemporaryDirectory() as td:
            run(["ffmpeg", "-v", "error", "-i", path, "-vf", "fps=1/1.5,scale=180:-1", f"{td}/f%03d.png"])
            fr = sorted(glob.glob(f"{td}/f*.png"))
            diffs = []
            for a, b in zip(fr, fr[1:]):
                A, B = Image.open(a).convert("L"), Image.open(b).convert("L")
                box = (0, A.height // 3, A.width, A.height)
                diffs.append(ImageStat.Stat(ImageChops.difference(A.crop(box), B.crop(box))).mean[0])
            run_len, start = 0, 0
            for i, d in enumerate(diffs + [99]):
                if d < 8.0:  # a slow drift of the same shot measures about 6 to 7
                    if run_len == 0: start = i
                    run_len += 1
                else:
                    if run_len >= 3:
                        problems.append(f"the same shot holds from {start*1.5:.1f} s to {(start+run_len)*1.5:.1f} s with only small movement; cut to a new angle or add a new action")
                    run_len = 0
    except ImportError:
        print("(Pillow not installed; skipped the movement check)")

    print(f"length: {dur:.1f} s")
    if not 28 <= dur <= 35.5:
        problems.append(f"length {dur:.1f} s is outside 28 to 35 s")

    if not has_audio:
        problems.append("no audio track")
    else:
        e = run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
        lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", e)
        peak = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)
        if lufs:
            L = float(lufs[-1]); print(f"loudness: {L:.1f} LUFS (aim -16 to -12)")
            if L < -20: problems.append(f"too quiet overall ({L:.1f} LUFS); raise the voice")
            if L > -9: problems.append(f"too loud overall ({L:.1f} LUFS)")
        if peak:
            P = float(peak[-1]); print(f"true peak: {P:.1f} dBFS")
            if P > -0.5: problems.append(f"clipping risk (peak {P:.1f} dBFS); lower the loudest sound")
        s = run(["ffmpeg", "-hide_banner", "-i", path, "-af", "silencedetect=n=-38dB:d=0.9", "-f", "null", "-"]).stderr
        starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", s)]
        ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", s)]
        gaps = [(a, b) for a, b in zip(starts, ends + [dur])]
        quiet = sum(b - a for a, b in gaps)
        print(f"near-silent stretches over 0.9 s: {len(gaps)}, {quiet:.1f} s in total")
        for a, b in gaps:
            print(f"  {max(a,0):5.1f}-{b:5.1f} s")
        if quiet > 0.2 * dur:
            problems.append(f"{quiet:.1f} s of near-silence; the voice should fill most of the video")

    if "--fix" in sys.argv and has_audio:
        fixed = os.path.join("out", os.path.splitext(os.path.basename(path))[0] + "-fixed.mp4")
        run(["ffmpeg", "-v", "error", "-y", "-i", path, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", fixed])
        print(f"\nwrote {fixed} with the audio brought to -14 LUFS; publish that file instead")

    print("\nPROBLEMS:" if problems else "\nno hard problems found")
    for p in problems:
        print(" -", p)
    print("\nNow open the contact sheet and check every tile: is frame 1 already the hook moment? "
          "Is any tile mostly empty? Is anything floating or cut off? Does every caption sit clear of the subject? "
          "Does the picture change between tiles?")
    sys.exit(1 if problems else 0)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__))
