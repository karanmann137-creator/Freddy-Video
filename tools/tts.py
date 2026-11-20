#!/usr/bin/env python3
"""Speak lines with the Freddy Fix It voice.

  python3 tools/tts.py <name> "line one" "line two" ...
Writes public/voice/<name>-1.wav, -2.wav ... and prints each file's length in
frames at 30fps, so the video's beats can be timed to the speech.
The voice is fixed here so every video sounds the same. Do not change BLEND,
VOICE or SPEED per video.
"""
import os, re, sys, numpy as np, sherpa_onnx, soundfile as sf

# The Freddy voice (2026-11-19): a blend of Kokoro voices chosen to sound closest
# to the narrator sample the owner supplied. It is written into slot 53 (an
# unused non-English voice) of a copy of voices.bin, because Kokoro needs exactly 54.
BLEND = {"am_michael": 0.455, "af_nicole": 0.153, "am_santa": 0.123, "af_river": 0.114,
         "am_liam": 0.063, "am_fenrir": 0.044, "bm_george": 0.034, "bm_lewis": 0.013}
NAMES = ("af_alloy af_aoede af_bella af_heart af_jessica af_kore af_nicole af_nova af_river af_sarah af_sky "
         "am_adam am_echo am_eric am_fenrir am_liam am_michael am_onyx am_puck am_santa "
         "bf_alice bf_emma bf_isabella bf_lily bm_daniel bm_fable bm_george bm_lewis").split()
VOICE = 53
SPEED = 1.0    # natural rate; 1.05 sounded rushed to the owner (2026-11-16)
D = os.path.join(os.environ.get("VOICE_DIR", os.path.expanduser("~/.cache/freddy-voice")), "kokoro-multi-lang-v1_0")


LOCAL_LEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), "voice-lexicon.txt")  # local names, hand-set
AUTO_LEX = os.path.join(os.path.dirname(D), "auto-lexicon.txt")  # espeak guesses for any other unknown word
ESPEAK_TO_KOKORO = [("tʃ", "ʧ"), ("dʒ", "ʤ"), ("oʊ", "O"), ("eɪ", "A"), ("aɪ", "I"), ("aʊ", "W"), ("ɔɪ", "Y"), ("ɚ", "əɹ"), ("ɝ", "ɜɹ"), ("ː", "")]


def add_unknown_words(lines):
    """Kokoro silently skips words its lexicon lacks (it dropped Airdrie and Okotoks), so give each one a pronunciation."""
    known = set()
    for p in (f"{D}/lexicon-us-en.txt", LOCAL_LEX, AUTO_LEX):
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f: known.update(l.split(" ", 1)[0] for l in f)
    missing = sorted({w for t in lines for w in re.findall(r"[a-z]+(?:'[a-z]+)?", t.lower())} - known)
    if not missing: return
    print(f"adding pronunciations: {', '.join(missing)} (add to tools/voice-lexicon.txt if one sounds wrong)", file=sys.stderr)
    import espeakng_loader
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    EspeakWrapper.set_library(espeakng_loader.get_library_path()); EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
    from phonemizer import phonemize
    with open(f"{D}/tokens.txt", encoding="utf-8") as f: ok = {l.split(" ")[0] for l in f if l.strip()}
    with open(AUTO_LEX, "a", encoding="utf-8") as f:
        for w in missing:
            ipa = phonemize(w, language="en-us", backend="espeak", with_stress=True, strip=True).replace(" ", "")
            for a, b in ESPEAK_TO_KOKORO: ipa = ipa.replace(a, b)
            f.write(f"{w} {' '.join(c for c in ipa if c in ok)}\n")


def freddy_voices():
    out = f"{D}/voices-freddy.bin"
    if not os.path.exists(out):
        v = np.fromfile(f"{D}/voices.bin", dtype=np.float32).reshape(54, 510, 256)
        v[VOICE] = sum(w * v[NAMES.index(n)] for n, w in BLEND.items()) / sum(BLEND.values())
        v.tofile(out)
    return out

def main():
    name, lines = sys.argv[1], sys.argv[2:]
    add_unknown_words(lines)
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=f"{D}/model.onnx", voices=freddy_voices(), tokens=f"{D}/tokens.txt", data_dir=f"{D}/espeak-ng-data", dict_dir=f"{D}/dict", lexicon=",".join(p for p in (LOCAL_LEX, AUTO_LEX, f"{D}/lexicon-us-en.txt") if os.path.exists(p))),
        num_threads=4))
    tts = sherpa_onnx.OfflineTts(cfg)
    os.makedirs("public/voice", exist_ok=True)
    for i, text in enumerate(lines, 1):
        a = tts.generate(text, sid=VOICE, speed=SPEED)
        path = f"public/voice/{name}-{i}.wav"
        if not len(a.samples): sys.exit(f"voice produced no audio for: {text}")
        sf.write(path, np.asarray(a.samples, dtype="float32"), int(a.sample_rate), subtype="PCM_16")
        print(f"{path}\t{round(len(a.samples) / a.sample_rate * 30)} frames\t{text}")

main()
