# Audio provenance and release review

## New sound effects
- `src/theme-effects.js` is original procedural Web Audio code authored for this task. No third-party recordings, samples, audio service, or microphone.
- Theme: birdlike discovery sweeps and water-drop connections. No external sample license dependency; this is not an absolute legal warranty.
- User interaction unlock, mute/effects settings, narration priority, hidden-tab and page-exit stop are respected. Existing settings persistence is preserved.

## Preserved existing assets
- Existing Kenney Interface Sounds retained, with CC0 text available in project source/cache license files. The license expressly permits personal, educational, and commercial use. https://kenney.nl/assets/interface-sounds / https://creativecommons.org/publicdomain/zero/1.0/
- Runtime effects now use procedural synthesis without download/decode latency. Existing procedural music retained.

## NPC narration
- Existing Korean F1 welcome narration preserved; no new generation, recording, or recognition.
- Original source metadata: `6fbe294a-f11b-4639-9dac-18987cea7c15.json`, model `momo-voice`, Korean `ko`, voice `F1`, generated 2026-11-07T22:02:14.526Z. The metadata identifies Supertonic 3 / OpenRAIL-M. Its script exactly matches the runtime caption.
- Source WAV and distributed AAC durations are recorded below. Matching script and duration support the conversion lineage; lossy AAC cannot share the WAV hash.
- Official terms: https://huggingface.co/Supertone/supertonic-3/blob/main/LICENSE . Section 6 does not claim rights to generated output, subject to use restrictions. This is licensed educational narration, NOT public domain or an unconditional copyright-free claim.
- License snapshot: `SUPERTONIC3-LICENSE.txt`.

| File | SHA-256 | Duration seconds |
|---|---|---|
| 6fbe294a-f11b-4639-9dac-18987cea7c15.wav | ba609c307a02a68e91cf2e16df2f191c76943f810f6081870d3f76b378fa41a9 | 12.469116 |
| npc-welcome.m4a | 9957c71d4d8698486ef06fc794fc80e439fad78f67789f6f61bc5d5a77fa861d | 12.469116 |

## Current verification
- Unit suite and production build passed. Real Chrome AAC playback, manual stop, mute, hidden-tab event, navigation, missing-file fallback, and touch controls passed in `scripts/qa-welcome-voice.mjs` (project 13). No subjective speaker listening performed.

## Final character dialogue, 2026-11-10
- 27 new Korean lines: Moa welcome, ten activity guides, ten Doto first-step hints, five chapter summaries and certificate ending. Intentional Listen/Replay controls retain text-only progression.
- Generated locally by Momo, Qwen3-TTS-12Hz-1.7B-VoiceDesign, stock fictional character presets; no real-person voice cloning. The model is Apache-2.0: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign/blob/main/LICENSE . This is not a public-domain or blanket rights warranty.
- Per-line script, source UUID, preset, transformations, MP3 SHA-256 and objective metrics are in `VOICE-PROVENANCE-20261110.json`. Accepted source manifest SHA-256: `bfefe67225f907d71a337bb070173c6c13282fef75cdfb31c2ccde5d9e853c26`.
- Blind Korean ASR matched all 27 original lines after whitespace/punctuation normalization. Integrated loudness −16.4 to −16.0 LUFS. ASR and waveform checks do not guarantee perceived pronunciation or speaker quality. No human physical-speaker listening was performed.
- Earlier Supertonic F1 welcome file and provenance remain preserved. The current welcome control uses the new Moa voice.
- This app has no continuous BGM: narration uses existing `mediaPriority` to suppress procedural effects. Route changes, modal closing, mute, hidden document, pagehide, and replacement dialogue stop playback.
