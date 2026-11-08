# Prep Mantraa: handoff (7 Nov 2026)

Pipeline lives in `D:\Prep Mantraa Claude` (CLAUDE.md = workflow, PROFILE.md = style standard, also saved here as `claude/prep-mantraa-profile.md`). The device copy is the source of truth for all code (several files were edited directly on the device).

## Done
- Brand theme from 6 reference shorts (Learn Spark black-board style + Vision IAS / SelfmadeVerse list/timeline builds) → two looks: Black Board (canvas/board) and Navy Studio (mcq/news/points/timeline/compare/bigfact/facts).
- Engine: `pipeline/engine/pm_render.py` (Pillow + FFmpeg, ~20–100 fps), 40+ hand-drawn doodles in `doodles.py` (incl. diya, bandage, river, shovel, brick, face_sad), canvas items text/label/image/line/arrow/arc/circle/dot/axes/shape/doodle, `thumb` scene (series cover = frame 0, exported as thumbnail.jpg; long titles auto-fit), `facts` scene (photo + title + icon rows: river/district/state/country/excavator/find).
- Audio: `audio_clean.py` (denoise with fallback chain, Whisper **chunked ~40 s with live progress**, filler/stutter cuts, energy-based pause squeeze, `--words` to re-edit without re-transcribing), `mix.py` (ducked music bed, SFX cues, −13 LUFS shorts / −14 long, −1 dBTP).
- **Output layout:** every video gets its own folder `export\<YYYY-MM-DD>_<Topic>\` → `PrepMantraa_<Topic>.mp4`, `thumbnail.jpg`, `youtube.txt`, `instagram.txt`, `notes.txt` (`pipeline\outdir.py`; Topic from `projects\<slug>\folder_name.txt`).
- Videos made:
  - `2026-11-07_CA-Ep01_MudVolcano-Pasni-HeartLamp` (Current Affairs Series Ep 1). All three news items from 2025; the thumbnail date tag says NOV 2026 (flagged).
  - **Harappan Sites Trick series, 7 shorts** from one raw 11.7-min lecture (`inbox\done\1107(2).mp4`, ends with an "Ensure BPSC" card, left out): `2026-11-07_IVC-Site01-Harappa-Trick` … `Site07-Dholavira-Trick` (45–81 s, −13 LUFS). Builder: `projects\heritage-raw\build_shorts.py` (cuts voice per site, per-site specs: thumb → map circle → facts card → story canvas with doodles → decode compare "कहानी → याद करो" → [recap facts for 5–7] → outro "अगली साइट"); upload text: `projects\heritage-raw\write_meta.py`. Corrected slide errors: Mohenjodaro Wheeler 1930→(no year; actual 1950), Chanhudaro Mackay 1925→1935, Kalibangan Ghosh 1951→1953 (in notes.txt).
- **AUTO mode:** `MAKE_VIDEO.cmd` → `pipeline\auto.py` → Whisper or Claude script + edge-tts → Claude Code headless (`pipeline\prompts\auto_build.md`) → the video's export folder. Not yet run for real on Windows.

## Manual / interactive path
1. Recording in `inbox\`. 2. `setup\02_process_audio.cmd <slug> "<file>"` (Whisper on the Windows PC; CUDA, model `turbo`, Hindi prompt; long files are chunked). 3. Claude reads `audio\words.json`, writes `spec.json` + `folder_name.txt`, renders, mixes, writes upload text.
- In the linked VM, background processes are killed when each command ends, so render with `pipeline\render_chunked.py <slug>` (resumable 15–20 s parts, concat) in repeated ≤175 s calls, then `mix.py`.
- Images: `setup\03_get_assets_<slug>.cmd` downloads Wikimedia Commons files via Special:FilePath (the VM and cloud have no internet).

## Gotchas
- New FFmpeg on Windows crashed at end of file with arnndn/afftdn tn=1, so the fallback chain handles it.
- Whisper: Hindi prompt + turbo; a single pass on long audio stalled, so it now transcribes in chunks. Triton warning (no CUDA toolkit) is harmless.
- Restart detection only for 3+ word repeats.
- device_commit_files sometimes uploads a cached older copy of a file committed a few minutes earlier, so verify md5 after commit or patch on the device directly. Never commit in parallel with the edit.
- Old FFmpeg (VM) alimiter has no `level` option, so mix.py falls back. Missing captions.json is fine (engine treats it as empty).

## Open
- First real AUTO run on Windows.
- Music: generated beds are basic; drop royalty-free tracks into `music\<mood>\`.
- Captions off for board shorts by default.
