# Handoff — what happened in the first session (3 Nov 2026)

## 1. Setup (done)
- Installed via winget: Git, Node.js LTS, Python 3.12, FFmpeg (Gyan), yt-dlp. pip: torch CUDA 12.8 + openai-whisper. npm: hyperframes; HyperFrames agent skills installed into this folder (`.agents/skills`, symlinked in `.claude/skills`).
- Install/verify scripts + logs: `setup\` (install.ps1, verify.ps1, versions.txt, AI-Video-Editor-Tools.xlsx lists versions).
- `setup\runner.ps1` / `START-RUNNER.cmd` = a job runner that executed scripts dropped into `setup\queue\` (used because the cloud session could not type into Windows terminals). **Not needed in Claude Code** — run commands directly.

## 2. Reference study → style-sheet.md (done)
- Ref 1 (content, delivery, subtitles) = *scientific dot think* shorts: uso3Rd_wt70, 5MtDiOFXlDU, AN0ATVg_7dU, 3MVMryHQL3Y, VoxNTq8a1Xw.
- Ref 2 (visuals, thumbnails, channel consistency) = the user's own Merit Mantra shorts: uvoOLe3m5HU, 1qBPbRJVKqs, i6FxuLpyajE, 9Akf6T3r5YQ, F3-_5JugVLA.
- Downloaded with yt-dlp to `reference\ref1`, `reference\ref2` (+ thumbnails, info json, Whisper word timings `*.words.json`).
- Measurements in `reference\analysis\` (per-video `stats.json`, `timing.json`, contact sheets, frames), Demucs stems + `audio.json` in `reference\analysis\stems\htdemucs\`. Analysis scripts: `reference\analysis\scripts\` (analyze.py = cuts/colour/loudness, timing.py = caption & dissolve timing, audio.py = voice-vs-music levels, SFX, tempo).
- Key findings: Ref 1 voice is on 92–93% of runtime, first word ≤0.15 s, ~3.1–3.8 words/s, phrase captions on a #151F31 bar at y 1357–1443, Montserrat-like 600 58 px white, hard swaps. Ref 2: navy/blue/orange cinematic look, dissolves ~1 s, keyword overlays, thumbnail yellow #FBE414 + #6B1000 outline, fire-seal end card.
- `style-sheet.md` (v1.1) is the standing default; also saved to the claude.ai Project "Saurabh" as `claude/style-sheet.md`.

## 3. First video: "How does an airplane fly — and how is it related to birds?" (done)
- Output: `export\Merit-Mantra_Airplane-vs-Birds.mp4` (2160×3840, 82.8 s, -14.0 LUFS, -1.0 dBTP) + `-thumbnail.jpg`.
- Project: `projects\airplane-birds\` (HyperFrames). `index.html` + `compositions\` (thumb, sa…sg scenes, captions). Render: `renders\airplane-birds.mp4` (1080p).
- Script (24 lines, Hinglish, Devanagari for TTS + romanized caption chunks): `projects\airplane-birds\pipeline\script_lines.json`. Structure: hook (575-ton plane) → pigeon/no engine → airfoil + angle of attack → 280 km/h, low/high pressure, lift, downwash (Newton + Bernoulli) → twist: Wright brothers learned roll control from vultures' wingtip twist → ailerons → alula ≈ slats/flaps → winglets ≈ eagle's spread feathers → "metal ki chidiya" → CTA → end card.
- Visuals: free stock images/cutouts from `media-use resolve --type image` (in `.media\images`), graded into plates by `pipeline\make_plates.py` → `assets\plates\`. Avoid image_001/012/021/007 (branded Boeing diagram with text).
- Audio: Kokoro hm_omega, speed 1.15, per-line wavs `assets\voice\lines\` → `pipeline\build_narration.py` (atempo 1.06) → `assets\voice\narration.wav` + `pipeline\timing.json`. Music: bgm_001 (0–30 s, -18 dB under voice) → bgm_003 (28–66 s, -11 dB, the "lift") → bgm_002 (64.4 s–end). SFX: pops on keyword overlays, whooshes at section dissolves (15.75, 28.0, 59.33 s), booms at 47.91 & 73.02 s, riser into 73.02 s. `pipeline\mix.py` → `assets\audio\final_mix.wav` (two-pass loudnorm -14 LUFS).
- End card: last 1.35 s of the user's own 1qBPbRJVKqs (`assets\brand\endcard.mp4`, media-start 0.45). Seal logo cut from it (`assets\plates\seal.png`).

### Rebuild / edit pipeline (run from `projects\airplane-birds`)
```
py -3.12 pipeline\build_narration.py      # after changing voice lines
py -3.12 pipeline\make_plates.py          # after changing images/grade
py -3.12 pipeline\mix.py                  # after changing narration/music/SFX timing
py -3.12 pipeline\hf_build.py             # regenerates index.html + compositions from timing.json
npx hyperframes check --json
npx hyperframes snapshot --at 0.2,16,28,42,59.6
set CI=1 && npx hyperframes render --quality delivery -o renders/airplane-birds.mp4
ffmpeg -i renders/airplane-birds.mp4 -i assets/audio/final_mix.wav -map 0:v -map 1:a -vf scale=2160:3840:flags=lanczos -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -c:a aac -b:a 320k -movflags +faststart -shortest "..\..\export\Merit-Mantra_Airplane-vs-Birds.mp4"
```
Note: hf_build.py and mix.py were written in a Linux sandbox and path-adapted for Windows; if a path fails, check it first.

## 4. Gotchas learned
- HyperFrames hides an outgoing scene the moment the next scene host starts → overlapping hosts dip to black. Dissolves are done with an **underlay** (copy of the outgoing frame) inside the incoming scene (see `Scene(underlay=…)` in hf_build.py).
- Never give a shot and an element inside it the same id (GSAP animated the whole frame). Shots are `<scene>-shot-<name>`.
- SVG: a glow `filter` on a perfectly vertical/horizontal path makes it vanish (zero-width bbox) — use a `rect`.
- Airfoil angle of attack: in SVG `rotation: +9` = nose up.
- `npx hyperframes render` ends with an NPS survey prompt; `CI=1` skips it.
- Container-less now: everything runs locally in Claude Code.

## 5. Open items / ideas
- Voice is offline Kokoro (robotic). Options: HyperFrames Pro (HeyGen Hindi voice + AI images matching Ref 2), or the user records voiceover into `raw footage\`.
- Thumbnails in Ref 2 feature the presenter's face; none available yet — ask the user for a photo.
- Style sheet targets 55–70 s; the user asked for 1–1.5 min, so the first video is 83 s.
