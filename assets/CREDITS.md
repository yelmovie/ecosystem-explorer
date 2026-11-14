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
