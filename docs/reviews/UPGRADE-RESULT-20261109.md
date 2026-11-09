# 고도화 결과 — 생명의 그물 지도(14) · 2026-11-09~10

브랜치 `claude/upgrade-20261109`(worktree `wt/14`), 시작 9307ed3 → 최종 커밋은 이 문서를 넣은 커밋. push·배포는 하지 않았다(메인 세션 몫). 운영본 34b7300 이후 미배포였던 지도 복구 작업대 커밋(37c59ec·2a797d8)도 이번 점검·수정 범위에 넣었다.

## 바꾼 것

| 커밋 | 내용 |
|---|---|
| 682f5b0 | 첫 화면 그림 PNG 4장 → 같은 크기 WebP 사본(`assets/web/`, 원본 PNG 보존), 1200×630 OG·카톡 썸네일(`assets/og/og-image.jpg`, 기존 배경·로고·모아 합성) + og/twitter 태그, 빌드가 dist를 비우고 시작·json 미배포, 반응형 스크립트 `SIZES` 환경변수, 계획서 |
| de31ca1 | 915×412·830×515 P06 먹이그물 아래 줄 잘림 수정, 지도 카드·홈 보조 글자 11~13→14px, hover 이동을 정밀 포인터에만, 지도 복구 작업대(반말·SVG 표시·토큰 색·상대경로·결과 문구), `npm run check`가 19개 모듈 전부 검사 |
| 8aaced3 | 개념영상 10편 HyperFrames「모아의 탐사 노트」로 교체(아래), `conceptClock` 하나로 영상·VTT·자막 강조·장면 버튼·"15초" 표기 통일, `scripts/make-vtt.mjs`, `tests/concept-timing.test.mjs`, 활동별 학습목표·검수 메타데이터(`curriculum`) + `tests/curriculum.test.mjs`, README 명령 |
| fa4382e | 높이 500px 이하에서 지도 복구 작업대를 열면 목적지 카드를 잠시 숨김(겹침 제거) |

### 개념영상

- 10편 전부 교체, 같은 경로·파일명: `assets/concepts/p01~p10.mp4`(1280×720 H.264 High + AAC 모노 96k, 30fps, faststart), 포스터 `pNN.jpg`(마지막 장면 = 움직임 줄이기 대체 정지 화면), 자막 `pNN.vtt`.
- 길이 15.02초(장면 0/5/10초), 용량 261~828KiB(10편 합 약 4.2MB, 편당 2.5MB 이하).
- 소스: `films/kit/`(공용 부품) + `films/films.data.mjs`(편별 장면) + `films/build.mjs` + `films/render.mjs` + `films/pNN/`(HyperFrames 프로젝트, 렌더 산출물·.hyperframes 제외). 검토 기록 `films/REVIEW.md`.
- 그림은 게임 속 학습 삽화·하천 전후 장면·모아 자세 시트에서 잘라 씀. 새 이미지 생성·유료 도구·모모 미사용. 효과음은 게임의 Kenney CC0만, 음악·내레이션 없음.

## 검증 명령과 실제 결과 (최종 dist 기준)

| 명령 | 결과 |
|---|---|
| `npm run check` | 통과(19개 모듈) |
| `npm test` | 43 통과 / 0 실패 (BEFORE 41) |
| `npm run build` | dist 64개 에셋 8.17MiB(영상 교체로 증가, 첫 화면 전송은 1.32MB) |
| `scripts/verify-experience.cjs` | 15검사 통과, 페이지 오류 0, 4xx 0 (15초 영상·바이트 범위·실패 시 글 대체·음소거·움직임 줄이기 포함) |
| `scripts/verify-playback.cjs` | 12검사 통과, 오류 0 |
| `scripts/verify-record-safety.cjs` | PASS |
| `scripts/verify-responsive.cjs` SIZES=1920×1080,1280×800,1024×768,1024×600,915×412,830×515 | 169화면 문제 0 (BEFORE 915×412 P06 8건) |
| `hyperframes check` 10편 | 오류 0 (남긴 경고와 이유는 films/REVIEW.md) |
| 헤드리스 Chrome(시스템 Chrome, H.264 재생) 앱 내 영상 10편 | readyState 4, duration 15.02, 자동 재생 중, 장면 버튼 2·3 → currentTime 5·10초와 자막 줄 전환 확인, 페이지 오류 0 |
| 초기 로딩(10Mbps/40ms, 3회) | load 5.40→1.22초, LCP 4.68→1.26초, 전송 6.1→1.32MB |
| 터치 에뮬레이션 hover | 터치: hover 미디어 false, transform none / 마우스: translateY(-2px) |

## 미검증 항목과 이유

- 영상 소리: 파일에 AAC 트랙과 음량(평균 −29dB, 최대 −2.7dB)만 측정, 귀로 듣지 못함.
- 운영 URL OG·카톡 미리보기, 배포 후 smoke: 배포 금지 범위. dist에서 og-image 200만 확인.
- 915×412 폰 가로 활동 화면 버튼 32px(FAIL): 무대 전체 축소 방식 때문. 교실 해상도(1024~1920)는 44px.
- 텍스트 200%·브라우저 줌, 인증서 인쇄, 40분 실플레이, 실기기 프레임·태블릿 터치, 오프라인 재방문(서비스워커 없음).
- 성취기준 원문·코드 대조: 데이터에 영역(4과14)과 `needsReview:true`만 넣었다.
- 영상 글꼴은 이 맥의 Apple SD Gothic Neo(local)로 렌더했다. 다른 맥·클라우드에서 다시 렌더하면 글꼴이 바뀔 수 있다.

## 남은 일

- 폰 가로 무대 축척 재설계(`src/app.js` syncStageViewport) → C3 해소.
- 서비스워커(영상 교체 시 캐시 무효화 포함), 배포 후 OG·카톡·smoke·인쇄 실측.
- P05 반대 방향 연결 시 오개념 피드백, 구역별 다른 지도 복구 활동.
- `films/pNN/assets`에 학습 삽화·효과음 사본이 편마다 들어가 저장소가 약 24MB 늘었다. 줄이려면 build.mjs가 공용 폴더를 링크하도록 바꿀 수 있다(HyperFrames 경로 규칙 확인 필요).
