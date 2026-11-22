# 14 생명의 그물 지도 · 권리 장부 (2026-11-21)

범위: 운영 빌드 `dist/`(커밋 `717fb6e`에서 빌드)에 들어가는 그림·영상·음악·효과음·목소리·글꼴 파일 전부. 코드로 만드는 화면 효과음도 한 줄로 넣었다.

- 이번에 빌드를 다시 돌리지 않았다. 지금 `dist/assets`를 원본 `assets/`와 비교하니 내용이 같았다.
- 근거는 저장소 안 기록(`assets/CREDITS.md`, `assets/audio/SOURCES.md`, `docs/`, `asset-bank/`, `references/`, `films/`, `scripts/`, git 기록)과 `_shared/`, `_scratch/`의 작업 기록만 썼다. 추측으로 칸을 채우지 않았다.
- 상태 뜻
  - **확인됨**: 기록이 만든 곳과 이용 조건을 모두 적고 있다.
  - **근거 약함**: 만든 곳은 적혀 있지만 이용 조건(요금제·약관)이 없거나, 기록이 간접적이다(저장소 밖 작업 폴더에만 있음, 크기만으로 맞춘 기록 등).
  - **출처 미확인**: 누가·무엇으로 만들었는지 적은 기록을 못 찾았다.
- 표시 「앱 미사용」: 앱 코드(`dist/src`, `dist/index.html`)에서 파일 이름을 찾지 못했다. 배포본에는 들어 있다.
- 이 장부는 출처 기록 정리다. 법률 검토나 상업 이용 허락을 대신하지 않는다.

## 그림 (13줄 · 81파일. 개념 영상 포스터 10장은 영상 줄에 넣었다)

| 파일(묶음) | 만든 곳(생성 도구·제공처·라이브러리) | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **IMG-01** `web/bg-pond.webp`, `bg-meadow.webp`, `logo.webp`, `moa-sheet.webp`(앱 미사용), `moa-title.webp`(앱 미사용) · 5장 | 제공받은 원본 PNG(`chatgpt_generated_27·32·39·40.png`)를 sharp로 WebP 변환. `moa-title`은 `moa-sheet`의 첫 칸을 잘라 냄. 원본은 ChatGPT 공유 대화(`references/shared-conversation/`)의 생성 그림과 **크기·해상도만으로** 짝지어져 있다 | 생성일 기록 없음. 저장소 추가 2026-10-28(커밋 `70fcc94`). 변환 `scripts/make-web-assets.cjs`, 자르기 `_scratch/title-round2-20261114.CqowcloF/assets.mjs`(2026-11-14, 커밋 `38a5aed`). 누가 생성·제공했는지 기록 없음 | 기록 없음 | `docs/ASSET_REVIEW.md`, `scripts/make-web-assets.cjs`, `references/shared-conversation/image-records.json`(match_basis "size and dimensions only"), `references/file-moves.json` | 확인됨(사용자 확인) |
| **IMG-02** `og/og-image.jpg`(앱 미사용. 공유 이미지는 IMG-08을 씀) | IMG-01과 같은 원본(27·39·40번)에 글자를 얹어 sharp로 합성 | 저장소 추가 2026-10-28. 합성 `scripts/make-web-assets.cjs` | 기록 없음. 재료가 IMG-01이라 그 조건을 따른다 | `scripts/make-web-assets.cjs` | 확인됨(사용자 확인) |
| **IMG-03** `learning-v2/` 20장 | Codex 내장 이미지 생성 도구. 18장은 2026-10-28 묶음, `forest-floor-lab-v3`·`decomposer-log-v3` 2장은 2026-11-12 | 18장: 프롬프트 원문과 원본 경로 `asset-bank/learning-v2/generation-manifest.json`, 작업 기록 `docs/VISUAL-UPGRADE-20261028.md`. 2장: `assets/CREDITS.md` 「2026-11-12 과학 설명 그림」, `docs/reviews/EDUCATION-20261112.md` | 기록 없음(생성 계정 요금제·약관 미기록) | `asset-bank/learning-v2/generation-manifest.json`, `assets/CREDITS.md`, `docs/reviews/EDUCATION-20261112.md` | 확인됨 |
| **IMG-04** `learning-v3/` 15장(배경·보드·단서 10장, 소품 `prop-*` 5장) | `gpt-imagegen` 스킬(ChatGPT 앱의 Codex 이미지 도구). 소품 5장은 `asset-bank/learning-v2/sapling-alpha.png`를 화풍 참고로 붙임 | 2026-11-17(커밋 `0cb47d7`, `65a46cf`, `4bbb3eb`). 프롬프트 `asset-bank/learning-v3/prompts.tsv`, `asset-bank/ui-v4/prompts.tsv`, 실행 스크립트 `run.sh` 2개 | 기록 없음 | `asset-bank/learning-v3/`, `asset-bank/ui-v4/` | 확인됨 |
| **IMG-05** `web/` 캐릭터·지도 9장: `ecology-map-v3`, `moa-explorer-v3`(앱 미사용), `doto-explorer-v3`(앱 미사용), `moa-human-v4`, `doto-cat-v4`, `moa-walk-v4`, `doto-walk-v4`, `moa-voice-v4`, `doto-voice-v4` | Codex 이미지 생성 도구 | 2026-11-13(CREDITS), 저장소 추가 2026-11-14(커밋 `eeee1fb`). 프롬프트 기록 못 찾음 | 기록 없음 | `assets/CREDITS.md` 「2026-11-13 생명의 그물 지도 일러스트」·「2026-11-13 캐릭터 개편」 | 확인됨 |
| **IMG-06** `web/moa-human-portrait-v4.webp` | 파일 이름이 CREDITS에 없다. 변환 스크립트가 IMG-05의 `moa-human.png`와 같은 원본 폴더(`_scratch/map-hud-20261113/art-originals/`)에서 만든다 | 2026-11-13 무렵, 커밋 `eeee1fb`. 변환 `_scratch/map-clean-top-20261113/prepare-14-art.cjs`. 생성 도구·프롬프트 기록 없음 | 기록 없음 | `_scratch/map-clean-top-20261113/prepare-14-art.cjs` | 확인됨(사용자 확인) |
| **IMG-07** `web/moa-dialogue.webp`, `doto-dialogue.webp`(둘 다 앱 미사용) | 「GPT 이미지 생성으로 기존 디자인을 보존해 중립/말하는 표정」을 만들었다는 작업 기록 | 2026-11-12, 저장소 추가 커밋 `94d2711`. 기록 `_scratch/npc-14-16-20261112/HANDOFF.md`, 묶기 `pack.sh` | 기록 없음 | `_scratch/npc-14-16-20261112/HANDOFF.md` | 확인됨(사용자 확인) |
| **IMG-08** `og/og-explorers-v4.jpg`(카톡 등 공유 이미지, `index.html`의 og:image) | Codex 이미지 생성 도구(CREDITS 「캐릭터 개편」 절의 「새 캐릭터가 들어간 공유 이미지」) | 2026-11-13~14, 커밋 `eeee1fb`. 프롬프트·합성 방법 기록 못 찾음 | 기록 없음 | `assets/CREDITS.md` | 확인됨(사용자 확인) |
| **IMG-09** `reward-cards/` 10장(`card-*` 5, `thumb-*` 5) | ChatGPT 앱의 Codex 내장 이미지 도구(GPT 이미지). IMG-05 캐릭터와 장소 배경을 화풍 참고로 붙임. 테두리·별·이름은 코드 | 2026-11-18, 커밋 `d01d24f`. 원본 `_scratch/reward-cards-20261118/gen/14/`, 프롬프트 `_scratch/reward-cards-20261118/specs/14.json` + `queue.mjs` | 기록 없음 | `assets/CREDITS.md` 「2026-11-18 성취 카드」 | 확인됨 |
| **IMG-10** `map-encounters/hero-redraw.png`, `ally-redraw.png`, `villain-redraw.png` | Codex 기본 이미지 도구로 지도 전투 자세를 새로 그림 | 2026-11-14, 커밋 `f1aa078`. 공통 프롬프트와 생성본 `_scratch/redraw-12-15-20261114/README.md`, `generated/14.png` | 기록 없음 | `_scratch/redraw-12-15-20261114/README.md`, `_scratch/map-redraw-20261114/README.md` | 확인됨 |
| **IMG-11** `map-encounters/hero.png`, `ally.png`(둘 다 앱 미사용) | IMG-05의 `moa-walk-v4.webp`, `doto-walk-v4.webp` 한 칸을 잘라 기울이고 늘려 만든 6칸 시트(코드 변형, 새 그림 아님) | 2026-11-14, 커밋 `1ae03aa`. `_scratch/map-encounters-12-16/pack.swift` | 기록 없음. 재료가 IMG-05라 그 조건을 따른다 | `_scratch/map-encounters-12-16/pack.swift` | 확인됨 |
| **IMG-12** `map-encounters/villain-left.png`(앱 미사용) | 시안 작업 파일 `_scratch/villain-concepts-20261114/map-mockup-work/cutouts-12-16.png`에서 잘라 냄. 같은 폴더의 `prompts-v2.md`는 악당 시안을 「Codex 기본 이미지 도구」로 만들었다고 적음. 잘라 낸 작업 파일 자체의 생성 기록은 못 찾음 | 2026-11-14, 커밋 `1ae03aa`. `_scratch/map-encounters-12-16/pack.swift`, `_scratch/villain-concepts-20261114/prompts-v2.md`(14번 프롬프트 28행) | 기록 없음 | `_shared/MAP-VILLAINS-HANDOFF-20261114.md`, `_scratch/villain-concepts-20261114/prompts-v2.md` | 확인됨(사용자 확인) |
| **IMG-13** `favicon.svg` | 기록 없음. 파일은 사각형 하나와 잎 모양 path 하나로 된 SVG 코드다. 외부 파일을 부르지 않는다 | 기록 없음. 저장소 추가 2026-10-28(커밋 `70fcc94`) | 기록 없음 | `favicon.svg` | 출처 미확인 |

## 영상 (2줄 · 21파일)

| 파일(묶음) | 만든 곳(생성 도구·제공처·라이브러리) | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **VID-01** 개념 영상 `concepts/p01~p10.mp4` 10편 + 포스터 `p01~p10.jpg` 10장 | HyperFrames로 코드 렌더. 그림은 게임 그림을 잘라 씀: `learning-v2`(IMG-03), 모아 자세 시트 `chatgpt_generated_40.png`(IMG-01 원본), `moa-human-v4`(IMG-05). 소리는 Kenney Interface Sounds 5개(CC0, 내레이션·음악 없음). 글자는 나눔스퀘어 네오(FNT-01). 포스터는 영상 마지막 프레임 | 2026-11-10 교체(커밋 `8aaced3`), 2026-11-14 다시 렌더(커밋 `00ed158`). `films/build.mjs`, `films/render.mjs`, `films/REVIEW.md` | 소리·글꼴은 CC0·OFL로 확인. 그림 재료는 IMG-01·IMG-03·IMG-05 조건을 따른다(모두 기록 없음) | `films/REVIEW.md`, `films/build.mjs`, `assets/audio/SOURCES.md`, `assets/audio/LICENSE.txt` | 확인됨 |
| **VID-02** `map-encounters/map-finale.mp4`(6초, 소리 트랙 없음) | 처음 판은 앱의 지도 공격 화면 캡처 한 장에 글자를 얹어 ffmpeg로 만듦. 2026-11-14 커밋 `a7dbba6`(「나눔스퀘어 네오와 깨끗한 지도 그림」)에서 다시 만들었는데 그 작업 스크립트는 못 찾음 | 2026-11-14. 처음 판 `_scratch/stage-villain-dialogue/movies.py`(재료 `_scratch/live-map-contact-review/originals/14-attack.png`). 커밋 `9b6d588`, `a7dbba6` | 따로 없음. 화면 속 그림은 IMG-05·IMG-10 조건을 따른다 | `_scratch/stage-villain-dialogue/movies.py` | 근거 약함 |

## 음악 (1줄 · 2파일)

| 파일(묶음) | 만든 곳(생성 도구·제공처·라이브러리) | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **MUS-01** `audio/bgm/main-theme.mp3`, `final-theme.mp3` | Suno. 사용자가 생성해 제공 | 2026-11-17, 커밋 `380d766`. 원본 `references/suno/`(git 제외 폴더) | Suno Premier 유료 요금제(2026-11-18 사용자 확인) | `assets/CREDITS.md` 「2026-11-17 배경음 2곡」, `_shared/voice-provenance-20261118.md` 「요금제」 표 | 확인됨 |

## 효과음 (5줄 · 15파일 + 코드 합성음)

| 파일(묶음) | 만든 곳(생성 도구·제공처·라이브러리) | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **SFX-01** 지도 악당 6개: `map-swing`, `map-hit-1`, `map-hit-heavy`, `map-exit`, `map-appear`, `map-bump` | Freesound 원작자 j1987, Raclure, saturdaysoundguy, michorvath, checholio. 과학34 공용 효과음 라이브러리(`_shared/sfx-library-20261117`)를 거쳐 가져옴 | 2026-11-17. 파일별 원본 주소가 CREDITS 표에 있음 | CC0 1.0(라이브러리 작성 때 원본 페이지에서 재확인) | `assets/CREDITS.md` 「2026-11-17 지도 악당 효과음」, `_shared/sfx-library-20261117/README.md` | 확인됨 |
| **SFX-02** 지도 발자국·종소리 3개: `map-step-1`, `map-step-2`, `map-unlock-chime` | Freesound 원작자 sgossner, Yoyodaman234, ZenithInfinitiveStudios. 공용 라이브러리 경유(SHA-256 일치 확인 기록) | 2026-11-19. 파일별 원본 주소가 CREDITS 표에 있음 | CC0 1.0 | `assets/CREDITS.md` 「2026-11-19 지도 발자국·장소 열림 소리」 | 확인됨 |
| **SFX-03** `map-unlock.mp3` | Kenney Interface Sounds 1.0의 `maximize_008`. 공용 라이브러리 경유 | 2026-11-19 | CC0 1.0 | `assets/CREDITS.md` 같은 절, https://kenney.nl/assets/interface-sounds | 확인됨 |
| **SFX-04** 성취 카드 5개: `card-whoosh`, `card-reveal`, `card-epic`, `card-slot`, `card-complete` | Freesound 원작자 qubodup, ZenithInfinitiveStudios, CogFireStudios, DeltaCode, el_boss. 공용 라이브러리 경유 | 2026-11-18. 파일별 원본 주소가 CREDITS 표에 있음 | CC0 1.0 | `assets/CREDITS.md` 「2026-11-18 성취 카드」 | 확인됨 |
| **SFX-05** 화면 효과음(버튼·정답·오답·힌트 등). 파일 없음 | `src/theme-effects.js`가 Web Audio로 직접 합성. 녹음·샘플·외부 서비스 없음 | 기록 `docs/AUDIO-PROVENANCE.md` 「New sound effects」, `assets/audio/SOURCES.md` | 이 작업용으로 쓴 코드. 외부 라이선스 의존 없음 | `docs/AUDIO-PROVENANCE.md`, `assets/audio/SOURCES.md` | 확인됨 |

## 목소리 (5줄 · 130파일)

| 파일(묶음) | 만든 곳(생성 도구·제공처·라이브러리) | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **VOX-01** `audio/voices/el-*.mp3` 102개 | ElevenLabs `eleven_v4`. 라이브러리 목소리 모아 `Jusen - Gentle, Warm & Clear`, 도토 `Aria – Bright & Youthful Korean`, 매듭 악당 `Harry - Character`. 실제 인물 복제 아님 | 2026-11-18. 줄별 대사·flowId·generationId·받아쓰기 검수·SHA-256이 기록에 있고, 배포 파일 102개 모두 해시가 맞음 | ElevenLabs Creator(유료, 연간) 요금제 생성물, 상업 이용 가능(기록 문구). 요금제는 계정 조회와 사용자 확인 | `docs/VOICE-FILL-20261118.json`(license 항목), `assets/CREDITS.md` 「캐릭터 음성」, `_shared/voice-provenance-20261118.md` | 확인됨 |
| **VOX-02** `welcome.mp3`, `guide-p01~p10.mp3`, `hint-p01~p09.mp3` · 20개 | ElevenLabs v4. 모아 Jusen, 도토 Aria(Voice Library) | 2026-11-12. 줄별 sourceUuid·SHA-256 기록, 배포 파일 20개 모두 해시가 맞음 | 기록 문구는 「ElevenLabs account and Voice Library terms」뿐이다. 당시 요금제는 Starter(유료)라는 사용자 확인만 있고 조건 문구·화면은 없다 | `docs/VOICE-PROVENANCE-20261110.json`, `_shared/voice-provenance-20261118.md` | 근거 약함 |
| **VOX-03** `hint-p10.mp3`(앱 미사용. 지금은 `el-hint-p10.mp3`가 재생됨) | Higgsfield / ByteDance Seed Audio 1.0. 참조 음성은 「Existing synthetic game character recording」이고 그 SHA-256은 ElevenLabs Aria로 만든 `hint-p09.mp3`와 같다 | 2026-11-14. sourceUuid·SHA-256 기록, 해시 일치 | 기록 없음(license 항목 비어 있음) | `docs/VOICE-PROVENANCE-20261110.json`(hint-p10 줄), `_shared/voice-provenance-20261118.md` 「납품 전에 메워야 할 빈칸」 3번 | 근거 약함 |
| **VOX-04** `summary-1~5.mp3`, `ending.mp3` · 6개(앱 미사용. 지금은 `el-summary-*`, `el-ending`이 재생됨) | 모모 로컬 Qwen3-TTS-12Hz-1.7B-VoiceDesign, preset-04 | 2026-11-10. 줄별 seed·sourceUuid·SHA-256 기록, 해시 일치 | Apache-2.0(Qwen3-TTS 모델) | `docs/VOICE-PROVENANCE-20261110.json`, `docs/VOICE-FILL-20261118.json`(replacedFiles) | 확인됨 |
| **VOX-05** `audio/npc-welcome.m4a`(앱 미사용. 이 파일을 여는 `src/welcome-voice.js`를 아무 모듈도 부르지 않음) | 모모 `momo-voice`(Supertonic 3), 한국어 F1 | 2026-11-07 생성. 원본 WAV와 배포 AAC의 해시·길이 기록 | Supertonic 3 OpenRAIL-M. 라이선스 사본 `docs/SUPERTONIC3-LICENSE.txt` | `docs/AUDIO-PROVENANCE.md` 「NPC narration」, `docs/SUPERTONIC3-LICENSE.txt` | 확인됨 |

## 글꼴 (2줄 · 5파일 + 라이선스 글)

| 파일(묶음) | 만든 곳(생성 도구·제공처·라이브러리) | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **FNT-01** `fonts/NanumSquareNeoTTF-bRg.woff2`, `-cBd.woff2`, `-dEb.woff2`(앱 CSS에서는 안 부름. 개념 영상 렌더에 씀), `NanumSquareNeo-OFL.txt` | 네이버 나눔스퀘어 네오 공식 배포본, 수정 없음 | 2026-11-10 CREDITS. 원본 https://campaign.naver.com/nanumsquare_neo/download/NaverNanumSquareNeo.zip | SIL OFL 1.1. 전문 동봉 | `assets/CREDITS.md` 「나눔스퀘어 네오 UI 글꼴」, `assets/fonts/NanumSquareNeo-OFL.txt` | 확인됨 |
| **FNT-02** `fonts/title-400.woff2`, `title-700.woff2`(CSS 이름 「Eco Garden Title」, 시작 화면용) | 나눔스퀘어 네오 Regular(`bRg`)·Bold(`cBd`)에서 시작 화면 글자만 남긴 부분 글꼴. 글꼴 이름을 「Eco Garden Title」로 바꿈(fontTools subset) | 2026-11-14, 커밋 `e4d5ab9`. 기록은 저장소 밖 작업 스크립트 `_scratch/title-round3-20261114.KyAZ8ySu/edit.py` 6행뿐. CREDITS에 없음 | 원본이 SIL OFL 1.1. OFL의 예약 글꼴 이름(NanumSquareNeo)은 바꾼 이름으로 피해 갔다. 바꾼 파일 안에 저작권·라이선스 이름 항목이 남았는지는 이번에 열어 보지 못함 | `_scratch/title-round3-20261114.KyAZ8ySu/edit.py`, `_scratch/title-round2-20261114.CqowcloF/edit.py`(같은 함수 정의) | 근거 약함 |

## 기타 (2줄 · 12파일)

| 파일(묶음) | 만든 곳(생성 도구·제공처·라이브러리) | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **ETC-01** `audio/LICENSE.txt`, `audio/SOURCES.md` | `LICENSE.txt`는 Kenney Interface Sounds 1.0 라이선스 원문. `SOURCES.md`는 이 프로젝트가 쓴 출처 문서. 둘 다 보관 중인 Kenney 7개(배포본 밖 `assets/audio/kenney/`)와 개념 영상 속 소리를 설명한다 | 2026-10-22 다운로드·확인, 2026-11-18 갱신. 원본 ZIP SHA-256 기록 | CC0 1.0 원문 | `assets/audio/SOURCES.md`, `assets/audio/LICENSE.txt` | 확인됨 |
| **ETC-02** 개념 영상 자막 `concepts/p01~p10.vtt` 10개 | 이 프로젝트가 쓴 문장. `scripts/make-vtt.mjs`가 `src/learning.js`의 영상 시간표에서 만든다 | 기록 `scripts/make-vtt.mjs` 1행 | 자체 작성 글. 외부 자료 없음 | `scripts/make-vtt.mjs`, `src/learning.js` | 확인됨 |

참고: FNT-02는 사용자 자료 없이 풀 수 있다. `assets/CREDITS.md`에 원본 글꼴·바꾼 이름·만든 스크립트를 한 줄 적으면 된다(이번 작업 범위 밖이라 고치지 않았다).

## 집계

확인됨 27 · 근거 약함 4 · 출처 미확인 1 (총 32줄: 2026-11-22 점검에서 VID-03·VOX-06 포함해 다시 셈) — 2026-11-21 3-2a 보강 뒤. 보강 전: 확인됨 12 · 근거 약함 17 · 출처 미확인 1

- 그림 13줄: 확인됨 12, 출처 미확인 1(IMG-13). 2026-11-21 3-2a 보강으로 IMG-01~12가 확인됨이 됐다(위 「3-2a 보강」). 요금제 화면 캡처는 아래 「사용자가 줘야 하는 자료」에 남는다.
- 남은 열린 줄: IMG-13 `favicon.svg`(출처 미확인), VID-02 `map-finale.mp4`, VOX-02, VOX-03, FNT-02(근거 약함). 이야기 영상(VID-03)에 임시 장면은 없다.
- 배포본에 들어 있지만 앱이 부르지 않는 파일: `web/moa-sheet`, `moa-title`, `moa-explorer-v3`, `doto-explorer-v3`, `moa-dialogue`, `doto-dialogue`, `og/og-image.jpg`, `map-encounters/hero.png`, `ally.png`, `villain-left.png`, `fonts/NanumSquareNeoTTF-dEb.woff2`, 옛 목소리 7개(`summary-1~5`, `ending`, `hint-p10`), `npc-welcome.m4a`. 배포본에서 빼면 조건을 확인해야 할 줄이 줄어든다.

## 사용자가 줘야 하는 자료

- **ChatGPT 제공 원본 15장(`chatgpt_generated_26~40.png`)의 출처.** 누가 어느 계정으로 만들었는지, 생성 당시 ChatGPT 요금제 화면, 생성 대화(공유 링크 `chatgpt.com/share/6acf7b4b-…`)의 소유자 확인. 다른 사람이나 업체가 준 그림이면 받은 경위가 담긴 계약서나 메일. → IMG-01, IMG-02, VID-01
- **Codex·ChatGPT 이미지 도구의 요금제 화면과 이용 약관 캡처.** 출력물 소유·상업 이용 조항이 보이게. 생성일 2026-10-28, 11-12, 11-13, 11-14, 11-17, 11-18 무렵 같은 요금제였는지 한 줄 확인. → IMG-03 ~ IMG-12, VID-01, VID-02
- **캐릭터·지도 그림의 생성 대화 기록(프롬프트·날짜).** `ecology-map-v3`, 모아·도토 v3/v4, 모아 초상, 대화 얼굴 2장, 공유 이미지 `og-explorers-v4`. 남아 있으면 캡처나 내보내기. → IMG-05, IMG-06, IMG-07, IMG-08
- **ElevenLabs Starter 요금제 화면(2026-11-12 무렵)과 상업 이용 조항, Voice Library 목소리(Jusen·Aria) 이용 조건 캡처.** → VOX-02
- **Higgsfield 요금제·이용 조건 캡처.** 또는 앱이 쓰지 않는 `hint-p10.mp3`를 배포본에서 빼기로 결정. 이 파일은 ElevenLabs로 만든 `hint-p09.mp3`를 참조 음성으로 썼으니, 그렇게 써도 되는지 ElevenLabs 조건도 함께 보면 좋다. → VOX-03
- **`favicon.svg`를 직접 만들었다는 한 줄 확인**(또는 만든 사람·도구). → IMG-13
- **지도 파이널 영상을 다시 만든 작업 파일 위치**(커밋 `a7dbba6`, 2026-11-14). 모르면 지금 영상을 다시 만들고 스크립트를 저장소에 남겨도 된다. → VID-02
- (보강) **ElevenLabs Creator, Suno Premier 요금제 화면 캡처.** 지금도 확인됨이지만 사용자 확인 문장만 있어 캡처가 있으면 단단해진다. → VOX-01, MUS-01


## 3-2a 보강 (2026-11-21)

방법: `_shared/CODEX-IMAGE-RECORDS-20261121.md`. 생성 기록 색인은 읽기만 했다(`_shared/codex-image-records-20261121/index.jsonl`, `index-claude.jsonl`). 사용자 확인 「16곳 그림은 전부 Codex(GPT), 영상은 제미나이, 모두 유료 요금제 — 전부 맞아」(2026-11-21 09:25, 조율 세션)를 같은 문서에서 인용했다.

### 생성 기록을 찾은 줄

| 줄 | 생성 기록 | 상태 |
|---|---|---|
| IMG-03 | Codex 세션 `rollout-2026-11-11T23-30-21-01a1cb04…`(작업 폴더 `14 environments`). 2026-11-11 15:34 UTC 「A single scientifically plausible natural-history illustration for a Korean elementary school ecology game」, 15:33 UTC 「Create one wide 16:9 illustrated environment backdrop…」. 11-12에 들어간 설명 그림 2장과 시각이 맞는다. 나머지 18장은 원래 적힌 `generation-manifest.json` | 확인됨 |
| IMG-04 | Claude Code 대화 `-Volumes-T7-Shield-iscreammedia-sc34-14-environments/fdadc4c…`·`5c1e441…`의 `gpt-image.sh` 호출. 2026-11-16 14:56 UTC 「Wide 16:9 painterly children's science-book illustration…」(`clue-drain.png`), 15:13 UTC 「Wide 16:9 painterly children's storybook background of a calm late-afternoon meadow…」(`compare-board.png`). 나머지는 원래 적힌 `prompts.tsv` | 확인됨 |
| IMG-05 | Codex 세션 `rollout-2026-11-13T17-52-56-01a1d41c…`(과학34 루트에서 연 세션)의 생성 기록 4건:<br>· 2026-11-13 10:47 UTC 「Create ONLY the clean, background artwork for an interactive educational ecology village map…」(`ecology-map-v3`)<br>· 11:12 UTC 「…full body 2D game character sprite… Moa…」<br>· 11:14 UTC 「…transparent RGBA game sprite of Doto, a friendly petite orange tabby CAT…」<br>· 세션 `rollout-2026-11-14T01-22-36-01a1d5b7…` 2026-11-13 16:59 UTC 「Draw a production sprite sheet of the exact two attached game characters: Moa, a brown-ponytailed young scient…」(걷기 시트)<br>`*-voice-v4`·`*-explorer-v3`는 같은 세션에서 나온 캐릭터의 파생본으로 보이지만 파일 이름 연결은 못 찾았다. 이 두 묶음은 사용자 확인으로 덮인다 | 확인됨 |
| IMG-09 | 대기열 `_scratch/reward-cards-20261118/specs/14.json` + `queue.mjs`(방법 문서 3장의 ③). 유료 요금제는 사용자 확인 | 확인됨 |
| IMG-10 | `_scratch/redraw-12-15-20261114/README.md`의 공통 프롬프트와 생성본 `generated/14.png`(방법 문서 3장의 ③). 유료 요금제는 사용자 확인 | 확인됨 |
| IMG-11 | 재료가 IMG-05(코드 변형)라 IMG-05를 따른다 | 확인됨 |
| VID-01 | 코드 렌더(HyperFrames). 재료인 그림(IMG-01·03·05), 소리(Kenney CC0), 글꼴(OFL)이 모두 확인됨이 되어 따라 올린다 | 확인됨 |

### 생성 로그는 없고 사용자 확인으로 채운 줄

| 줄 | 사정 |
|---|---|
| IMG-01·IMG-02 | 2026-10-28 이전 그림이라 이 맥에 생성 로그가 없다(기록은 11-05부터). 저장소 증거(ChatGPT 공유 대화의 생성 그림)와 사용자 확인이 같은 쪽(GPT)을 가리킨다 |
| IMG-06 | 11-13 무렵. IMG-05와 같은 원본 폴더에서 나왔지만 이 파일과 이어지는 생성 기록은 못 찾았다 |
| IMG-07 | 11-12. 색인의 11-12 13:06 UTC 「…NPC portrait sprite pair for Moa…」 기록은 프롬프트로 보아 다른 프로젝트(10번 수달 모아)일 수 있어 근거로 쓰지 않았다 |
| IMG-08 | 11-13~14. 공유 이미지의 생성·합성 기록은 못 찾았다 |
| IMG-12 | 11-14. 시안 작업 파일의 생성 기록은 못 찾았다(같은 폴더 `prompts-v2.md`가 「Codex 기본 이미지 도구」라고 적음) |

### 바꾸지 않은 줄

| 줄 | 상태 | 이유 |
|---|---|---|
| IMG-13 `favicon.svg` | 출처 미확인 | 생성 그림이 아니라 사각형과 잎 path 두 개로 된 SVG 코드다. 사용자 확인(「그림은 Codex」)과 파일 모양이 맞지 않아 덮어쓰지 않았다. 누가 썼는지 한 줄 확인이 필요하다 |
| VID-02 `map-finale.mp4` | 근거 약함 | 다시 만든 스크립트를 못 찾았다. 커밋 `a7dbba6`가 재료(나눔스퀘어 네오, 지도 그림)를 적지만 만든 방법 기록이 없다. 저장소 증거는 ffmpeg 합성이라 「영상은 제미나이」 확인과도 맞지 않아 그대로 둔다 |
| VOX-02·VOX-03·FNT-02 | 근거 약함 | 목소리·글꼴은 이 확인의 범위가 아니다 |

## 2026-11-21 추가: 이야기 영상

| 파일(묶음) | 만든 곳 | 만든 날·기록 위치 | 이용 조건 | 근거 파일 경로 | 상태 |
|---|---|---|---|---|---|
| **VID-03** `concepts/story-intro.mp4`·`story-finale.mp4`·포스터 2장 | 장면 그림 6장은 `gpt-imagegen`(Codex 이미지 도구, GPT 이미지). 여섯 장면 모두 실제 영상 클립(Veo): 인트로 I2는 구글 Flow(Veo 3.1 Fast), 나머지 다섯 장면(I1·I3·F1·F2·F3)은 Gemini 앱 동영상 만들기(Veo). 장면 사이 디졸브·자막·제목은 ffmpeg 합성. 클립별 계정·채팅은 아래 「VID-03 보강」 줄. 배경음 MUS-01, 글꼴 FNT-01 | 2026-11-21. 그림 원본 `.tmp/story-video-20261121/frames/i1~f3.png`, 프롬프트 `prompts.json`, 합성 `stills.py`·`compose.py`, `gpt-imagegen` 상태 기록 | ChatGPT·Google(Flow·Gemini 앱) 유료 요금제(사용자 확인 2026-11-21, 보조 계정 포함). 영상에 Veo 표시가 남아 있다 | `assets/CREDITS.md` 「2026-11-21 이야기 영상」 | 확인됨 |
| **VOX-06** `audio/voices/story-*.mp3` 6줄 | 기존 ElevenLabs 녹음(VOX-01 줄 `el-home-story`·`el-villain-5-5`·`el-ending-scene`)을 잘라 씀 | 2026-11-21, `ffmpeg -ss/-to` 문장 사이 쉼에서 자름 | VOX-01과 같음 | `assets/CREDITS.md` 「2026-11-21 이야기 영상」 | 확인됨 |

- VID-03 보강(2026-11-21 16:30): 인트로 I2 영상 클립 = 구글 Flow(Veo 3.1 Fast), 보조 계정 1, 화면 요금제 표시 PRO, 사용자 확인 2026-11-21 「둘 다 유료」, 생성 요청 15:56 KST. 시작 그림은 위 GPT 이미지 `i2.png`. Veo 표시(워터마크) 그대로.
- VID-03 보강(2026-11-21 18:13): 파이널 F1 영상 클립 = Gemini 앱 동영상 만들기(Veo), 보조 계정 1, 사용자 확인 2026-11-21 「둘 다 유료」(Gemini 화면의 요금제 표시는 읽지 않음), 채팅 `786ea2572f5b49b8`. 남은 네 장면(I1·I3·F2·F3)은 GPT 그림 + ffmpeg 카메라 움직임 그대로.
- VID-03 보강(2026-11-21 20:37): 파이널 F2 영상 클립 = Gemini 앱 동영상 만들기(Veo), 보조 계정 1, 사용자 확인 2026-11-21 「둘 다 유료」, 채팅 `863c806b211b3ec3`(짧은 프롬프트, 세 번째 요청). 먹이 관계 확인 통과(포식 장면 없음). 남은 세 장면(I1·I3·F3)은 GPT 그림 + ffmpeg 카메라 움직임 그대로(I1·I3 Gemini 오류 3회, F3 미전송).
- VID-03 보강(2026-11-22 11:56): 인트로 I1·I3 영상 클립 = Gemini 앱 동영상 만들기(Veo), 보조 계정 1, 사용자 확인 2026-11-21 「둘 다 유료」, 채팅 I1 `b65245f219ad105b`·I3 `2a38c6f046a12c26`(입력창 모드 「자동 모드」, 프롬프트 `*-vid-v4`). 먹이 관계·인물 확인 통과. 남은 임시 장면은 F3 하나.
- VID-03 보강(2026-11-22 12:09): 파이널 F3 영상 클립 = Gemini 앱 동영상 만들기(Veo), 보조 계정 1, 사용자 확인 2026-11-21 「둘 다 유료」, 채팅 `7ad4d054d2931683`(「자동 모드」, `f3-vid-v4`). 인물·장면 확인 통과. 임시 장면 없음(여섯 장면 모두 Veo: I2 Flow, 나머지 Gemini 앱).
- VID-03·VOX-06 보강(2026-11-21 18:30 최종 마무리): 영상 길이 인트로 26초·파이널 28초, 자막은 공용 burn.py(주아체 OFL `_shared/caption-motion-20261118/fonts`), 모션그래픽은 ffmpeg+libass 도형과 앱 제목 그림 `web/logo.webp`(IMG-01). 새 목소리 1줄 `audio/voices/story-finale-4.mp3` = ElevenLabs `eleven_v4`, 모아 목소리 Jusen(VOX-01과 같은 계정·요금제), requestId `MrwUprFK1jtwTv7JAssq`. 근거 `docs/story-films-20261121/README.md`.
