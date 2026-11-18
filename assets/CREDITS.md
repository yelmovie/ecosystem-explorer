# 캐릭터 음성 (2026-11-18)

게임에서 재생하는 모아·도토 대사 음성은 ElevenLabs 유료 요금제(상업 이용 가능)의 `eleven_v4` AI 생성 음성이다. 모아는 `Jusen - Gentle, Warm & Clear`, 도토는 `Aria – Bright & Youthful Korean` 라이브러리 음성을 쓴다. 실제 인물의 목소리를 복제하지 않았다. 2026-11-18에 만든 `audio/voices/el-*.mp3`의 줄별 대사·생성 ID·받아쓰기 검수·음량·SHA-256은 `docs/VOICE-FILL-20261118.json`, 그 전 ElevenLabs 줄은 `docs/VOICE-PROVENANCE-20261110.json`에 있다. 도토의 `audio/voices/hint-p10.mp3` 한 줄은 아직 Seed Audio 참조 복제본이며 ElevenLabs로 다시 만들 예정이다.

# 나눔스퀘어 네오 UI 글꼴 (2026-11-10)

네이버 공식 배포 원본 WOFF2 Regular/Bold를 수정 없이 함께 제공한다.
- 공식 안내: https://campaign.naver.com/nanumsquare_neo/
- 원본: https://campaign.naver.com/nanumsquare_neo/download/NaverNanumSquareNeo.zip
- 라이선스: SIL Open Font License 1.1. 전체 저작권 안내·전문은 `fonts/NanumSquareNeo-OFL.txt`.
- 기존 영상·삽화에 포함된 글자는 영상 제작 당시 글꼴을 유지한다.
- 이미지·영상·음성의 개별 출처와 제작 이력은 기존 `docs/ASSET_REVIEW.md` 및 `docs/reviews/` 기록을 따른다.

## 2026-11-12 과학 설명 그림

Codex의 OpenAI 기본 이미지 생성 도구로 프로젝트의 숲·물가 삽화에 맞춘 두 장을 생성했다. 글자와 조작 요소는 앱에서 분리해 표시한다.

| 적용 파일 | 설명과 용도 |
|---|---|
| `learning-v2/forest-floor-lab-v3.webp` | 물가와 숲 바닥을 담은 1280×720 배경. P04 역할 실험과 P10 생태계 설계에 적용 |
| `learning-v2/decomposer-log-v3.webp` | 죽은 나무를 분해하는 버섯과 균사를 나타낸 1000×667 설명 그림. P03·P04 개념 안내에 적용 |

버섯 그림은 한 사례를 설명하는 삽화이며 실 모양 균사를 크게 나타냈다. 앱에도 같은 설명을 붙였다. 외장 SSD에 원본 사본과 해시를 보존하고 실제 화면을 확인했다. 생성 도구가 임시로 저장한 이번 두 내장 원본은 외장 사본과 해시 일치를 확인한 뒤 정리했다. 생성·검증 근거는 `docs/reviews/EDUCATION-20261112.md`와 해당 증거 파일에 기록한다.

## 2026-11-13 생명의 그물 지도 일러스트

Codex 기본 이미지 생성 도구로 지도와 투명 캐릭터 두 종을 만들었다. 지도의 오솔길과 다리는 실제 이미지 위의 위치에 맞춰 조작 좌표를 지정한다.

- `web/ecology-map-v3.webp`: 관찰의 물가, 양분의 정원, 연결의 초원, 시간의 습지, 복원의 연구소.
- `web/moa-explorer-v3.webp`: 수달 연구원 모아의 전신.
- `web/doto-explorer-v3.webp`: 초록 스카프를 두른 다람쥐 도토의 전신.

## 2026-11-13 캐릭터 개편

Codex 이미지 생성 도구로 생태 탐험가 모아(사람)와 고양이 도토의 투명 전신, 지도 방향별 걷기, 음성 대화 얼굴을 만들었다. 지도 배경과 학습 장소는 그대로 유지한다.

- `web/moa-human-v4.webp`, `web/doto-cat-v4.webp`: 시작 화면의 전신 이미지
- `web/moa-walk-v4.webp`, `web/doto-walk-v4.webp`: 지도에서 쓰는 정면·후면·옆면 픽셀 스프라이트
- `web/moa-voice-v4.webp`, `web/doto-voice-v4.webp`: 기존 음성 재생에 맞춰 전환하는 대화 프레임
- `og/og-explorers-v4.jpg`: 새 캐릭터가 들어간 공유 이미지

## 2026-11-17 배경음 2곡 (Suno 생성)

| 적용 파일 | 재생 위치 | 출처 | 비고 |
|---|---|---|---|
| `audio/bgm/main-theme.mp3` (시작·홈·지도·활동 반복), `audio/bgm/final-theme.mp3` (엔딩·인증서 한 번, 지도 파이널 대화상자) | `src/audio.js`, `src/map-finale.js` | 2026-11-17 사용자가 Suno로 생성해 제공 | 원본은 references/suno 보관. 상업 이용 근거: 생성 당시 Suno Premier 유료 요금제(2026-11-18 사용자 확인) |

## 2026-11-17 지도 악당 효과음 (CC0)

과학34 공용 효과음 라이브러리(`_shared/sfx-library-20261117`, 라이선스 재확인 완료)에서 숲·물가 단원에 맞춰 골랐다. 라이브러리 처리(앞뒤 무음 제거·짧은 페이드·게인 정규화·모노 MP3) 외에 추가 편집은 없고, 재생 시 `src/audio.js`에서 음량·길이·2타 재생 속도만 조절한다. 재생은 `src/theme-effects.js`의 기존 효과음 규칙(음소거·목소리 재생 중 무음·탭 숨김 정지·한 번에 한 소리)을 따른다.

| 적용 파일 | 쓰임 | 원본(라이브러리 파일) | 작성자 | 라이선스 | 출처 |
|---|---|---|---|---|---|
| `audio/sfx/map-swing.mp3` | 공격 시작(잎 휘두르기, 앞 0.38초) | leafpilehit.wav (`leaf-rustle-03`) | j1987 | CC0 1.0 | https://freesound.org/people/j1987/sounds/106130 |
| `audio/sfx/map-hit-1.mp3` | 1타 명중, 2타 명중(낮은 재생 속도) | Wood knock (`wood-knock-01`) | Raclure | CC0 1.0 | https://freesound.org/people/Raclure/sounds/405549 |
| `audio/sfx/map-hit-heavy.mp3` | 3타 명중 | Loud Pillow Hit 2.wav (`hit-heavy-02`) | saturdaysoundguy | CC0 1.0 | https://freesound.org/people/saturdaysoundguy/sounds/388035 |
| `audio/sfx/map-exit.mp3` | 악당 퇴장(덤불로 사라짐, 앞 0.85초) | bushmovement.wav (`leaf-rustle-01`) | j1987 | CC0 1.0 | https://freesound.org/people/j1987/sounds/106114 |
| `audio/sfx/map-appear.mp3` | 악당이 처음 보일 때(페이지당 악당별 한 번) | Mouth Pop 1 (`villain-appear-02`) | michorvath | CC0 1.0 | https://freesound.org/people/michorvath/sounds/269501 |
| `audio/sfx/map-bump.mp3` | 아군이 악당에 닿아 움찔 | 68 Golpe Ardilla.wav (`hurt-bump-02`) | checholio | CC0 1.0 | https://freesound.org/people/checholio/sounds/443848 |

모든 악당 격퇴 축하음은 넣지 않았다. 파이널 대화상자가 열리면서 파이널 배경음이 시작돼 겹치기 때문이다.

## 2026-11-18 Kenney 효과음 사용 현황 정리

`audio/SOURCES.md`에 Kenney Interface Sounds 7개가 쓰임과 함께 적혀 있었지만, 앱 코드(`src/`)와 빌드 결과 어디에서도 재생하지 않는다. 화면 효과음은 `src/theme-effects.js` 합성음이고, 녹음 효과음은 위 지도 악당 6개뿐이다.

| 파일 | 상태 |
|---|---|
| `audio/kenney/click_003.mp3`, `audio/kenney/error_001.mp3` | 미사용(보관) |
| `audio/kenney/pluck_001.mp3`, `drop_003.mp3`, `switch_002.mp3`, `maximize_001.mp3`, `confirmation_002.mp3` | 앱에서는 미사용(보관). 개념 영상 MP4 제작 때 소리로 합성됨 |

7개 모두 `audio/kenney/`로 옮겨 배포본에서 뺐다. 출처·라이선스(CC0 1.0)는 `audio/SOURCES.md`, `audio/LICENSE.txt`에 그대로 둔다.

## 2026-11-18 성취 카드

지도의 매듭 악당을 세 번 맞혀 물리치면 받는 성취 카드 5장의 그림과 소리.

- 그림 `reward-cards/card-{1..5}-{0..4}.webp`(640×960), `reward-cards/thumb-{1..5}-{0..4}.webp`(96×144): 2026-11-18 ChatGPT 앱의 Codex 내장 이미지 도구(GPT 이미지)로 이 프로젝트를 위해 생성했다. 탐험가 모아(`web/moa-human-v4.webp`, `web/moa-voice-v4.webp`)·고양이 도토(`web/doto-cat-v4.webp`, `web/doto-voice-v4.webp`)와 다섯 장소의 활동 배경을 화풍 참고로 붙였다. 글자 없이 생성했고 테두리·별·이름은 코드(`src/reward-cards.js`, `src/reward-cards.css`)로 올린다. 원본 PNG는 `_scratch/reward-cards-20261118/gen/14/`에 있다. 학습용 장면 그림이며 과학 사실의 증거로 쓰지 않는다.
- 소리: 과학34 공용 효과음 라이브러리(`_shared/sfx-library-20261117`)에서 이름만 바꿔 복사했다(가공은 라이브러리에서 한 무음 제거·음량 정규화뿐). 모두 CC0 1.0이며 라이브러리 작성 때(2026-11-17) 원본 페이지에서 라이선스를 다시 확인했다. 재생은 지도 악당 효과음과 같은 경로(`src/audio.js` → `src/theme-effects.js`)라 음소거·음량·한 번에 한 소리 규칙을 그대로 따른다. 다만 카드가 열려 있는 동안에는 악당의 퇴장 대사 음성이 카드 소리를 끄지 않는다.

| 적용 파일 | 쓰임 | 라이브러리 파일 | 원본 제목 · 작성자 | 라이선스 | 출처 |
|---|---|---|---|---|---|
| `audio/sfx/card-whoosh.mp3` | 카드가 날아올 때·보관함 칸으로 날아갈 때(휙) | `sfx/wind-whoosh-03.mp3` | Slow Swosh 40 · qubodup | CC0 1.0 | https://freesound.org/people/qubodup/sounds/60027 |
| `audio/sfx/card-reveal.mp3` | 카드 공개(브론즈·실버·골드, 반짝) | `sfx/reward-01.mp3` | Fantasy_ui_Button_3.wav · ZenithInfinitiveStudios | CC0 1.0 | https://freesound.org/people/ZenithInfinitiveStudios/sounds/376745 |
| `audio/sfx/card-epic.mp3` | 카드 공개(홀로·레전드, 긴 징글) | `sfx/reward-03.mp3` | Achievement Happy Beeps Jingle · CogFireStudios | CC0 1.0 | https://freesound.org/people/CogFireStudios/sounds/619838 |
| `audio/sfx/card-slot.mp3` | 카드가 보관함 칸에 들어갈 때(톡) | `sfx/pickup-01.mp3` | item-pickup-v1.wav · DeltaCode | CC0 1.0 | https://freesound.org/people/DeltaCode/sounds/678384 |
| `audio/sfx/card-complete.mp3` | 다섯 장을 모두 모았을 때. 지도 파이널 대화상자가 열리면 멈춰 파이널 배경음과 겹치지 않는다 | `sfx/victory-jingle-01.mp3` | Game Success Fanfare Short · el_boss | CC0 1.0 | https://freesound.org/people/el_boss/sounds/677858 |
