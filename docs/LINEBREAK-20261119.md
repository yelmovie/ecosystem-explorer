# 문장 줄바꿈 균형 점검·수정 (2026-11-19~20)

기준: `_shared/LINEBREAK-BALANCE-20261119.md`(16개 공통). 문구·대사는 바꾸지 않고 줄바꿈 위치만 고쳤다.

## 측정 방법

- 공통 자동 탐색: `_scratch/linebreak-audit-20261119/run.mjs 14 <주소> 18 <크기>`
- 14번 전용 화면 측정: `.tmp/linebreak-20261119/scenes.mjs`(저장값을 심어 직접 진입 + `measure.js`). 홈·이어하기 홈·지도·도토 말풍선·지도 힌트·설정·소개·생태 미션, 활동 p01~p09, p01 힌트·관찰 선택·조사 완료, p03·p05 힌트, p05 먹이 안내, p10 보고·설계·완성 설계·엔딩·인증서·실천 계획 창. 관찰 장면 이름표끼리 겹침·장면 밖 여부도 함께 잰다.
- 크기: 1280×800, 1920×1080(레이아웃 점검은 1024×768·360×740 추가).

## 결과

| | 1280×800 | 1920×1080 |
|---|---|---|
| 운영 전(전용 측정) | 16 | 11 |
| 공통 규칙만 | 8 | 10 |
| 수정 후 로컬·운영 | 5 → 실제 문제 1(허용) | 4 → 실제 문제 0 |
| 자동 탐색(run.mjs) 운영 전 → 후 | 3 → 1(허용) | – → 0(로컬) |

## 고친 곳 (모두 `src/korean-linebreak.css` 아래 「프로젝트 보정」)

- 공통 규칙 파일 `src/korean-linebreak.css`를 `index.html`에서 다른 스타일보다 먼저 링크. `scripts/build.mjs`가 `src/` 전체를 `dist`로 복사해서 따로 손댈 것 없음.
- 공통 규칙만으로 해결: 소개 창 첫 문단 「…다음 장소가 열려.」, p03 역할 카드 설명 「…양분을 / 만들어.」「…양분을 / 얻어.」, p10 실천 계획 창 「…이야기해 / 봐.」
- `:is(.hint-bubble-copy, .map-doto-bubble) p { text-wrap: balance }`: 지도 도토 말풍선 「…함께 갈 수 / 있어!」, p03 힌트 「…끌어 / 놓아도 돼.」
- 관찰 장면 단추 `.observe-scene .hotspot`(700px 이상): `width: max-content; min-width: clamp(72px,16cqw,112px)`, 이름표 `b`는 `max-width: 10em; overflow-wrap: normal; text-wrap: balance`. 104px 단추에 갇혀 생기던 「그루터기|의 버섯」 낱말 끊김과 「물가의 / 풀」「흐르는 / 물」 한 글자 끝줄을 해결. 단추는 가운데 기준 배치(`translate(-50%,-50%)`)라 위치가 그대로이고 배경이 없어서 보이는 모양은 이름표만 한 줄이 된다. 처음에는 이름표만 넓혔지만 `verify-responsive`에 `text-outside-control`이 걸려 단추 폭을 넓히는 쪽으로 바꿨다.
- `.observation-note > p { text-wrap: balance }`: 관찰 노트 「…잘게 부서지는 죽은 / 나무가 보여.」

## 남은 것

- 허용: p01 관찰 수첩(선택지가 있을 때 4칸, 91px 칸) 「그루터기의 / 버섯」. 두 낱말 사이에서 뜻대로 끊기고, 한 줄로 만들려면 글자 크기나 칸 크기를 바꿔야 한다(이번 범위 밖). 1920에서는 생기지 않는다.
- 오탐(`<br>`로 일부러 나눈 줄을 도구가 단어끊김으로 셈): 소개 창 크레딧 목록, p10 엔딩 문장 「네가 찾은 증거와 고친 설계가 / 생물들의 먹이 길을 이어 줬어.」, 인증서 제목 「생명의 연결을 지킨 / 생태 탐험가」. 줄 길이도 고르다.
- 측정 못 함: 학습 안내 대화창(`voice-guide`)은 지금 화면에서 여는 단추가 없어 닿지 못했다. 개념 영상 자막은 영상에 구워진 글이라 범위 밖. 지도 악당 대사 말풍선은 움직이는 중이라 도구가 건너뛴다.

## 검증

- `npm run check` 통과, `npm test` 81/81
- `verify-responsive.cjs`(1920×1080·1280×800·1024×768·360×740, 117화면): 0건, 오류 0
- 커밋 `20c98bf`(index.html, src/korean-linebreak.css만, 다른 세션 변경 미포함) 푸시
- 배포: `run-lock.sh lbk-deploy-2 _scratch/deploy-20261118/deploy.sh 14 "14 environments" worker-cfg ecosystem-explorer`(설정 `cfg/14.json`, 직전 기록과 같은 명령). Worker 버전 `e25cc47d-ffe4-4579-924a-07115063860a`
- `cmp.sh`: `src/korean-linebreak.css` 빌드=운영 `d164f44426265a5f` MATCH, `index.html`(/) MATCH
- 운영 주소 재측정(1280×800): 전용 측정·자동 탐색 모두 로컬과 같음(허용 1건과 오탐만)
- 추가 수정(2026-11-20, 지침 8절): `src/reward-cards.css` `.rc-locked small` 아래 네 줄(컨테이너 152px 이하·높이 600px 이상에서 `max-width: 4.6em`). 보관함 잠긴 문구가 1280·1920 한 줄, 1024 「악당을 / 물리치면 / 열려요」 세 줄, 카드 넘침 없음(로컬·운영). 커밋 `6bf8170`, Worker `ee126c70-6037-4a32-a05e-bf7f65084327`, `cmp.sh` `src/reward-cards.css`·index MATCH.

## 남은 것 정리 (2026-11-20, 지침 9절) — 고친 것 없음, 배포 없음

- **지도 악당 말풍선**: `.tmp/linebreak-20261119/villain.mjs`로 지도 화면(1·2장 완료 상태라 악당 층이 뜸)의 `.map-encounter-layer` 안에 실제 클래스 `.map-encounter-say`(악당 머리 위 말풍선)와 `.map-encounter-clear`(위쪽 「매듭 악당 · “…”」 알림)를 애니메이션 없이 만들고, 움직이는 진짜 악당은 숨긴 채 대사를 한 줄씩 넣어 `measure.js`로 쟀다. 대상은 `map-encounter-theme.js` 5스테이지 × 도발 2·맞음 2·퇴장 1 = 25줄, 기본 대사 4줄, 알림 5줄로 34개. 1280×800·1024×768 모두 **문제 0개**(1줄 10·2줄 14·3줄 5, 알림은 모두 2줄). 끝줄이 가장 짧은 것도 「내 역할은 ‘매듭 묶기 담당’이면 / 되지!」(가장 긴 줄의 39%)였다. 1차 공통 규칙의 `text-wrap: pretty`가 이미 막고 있어 보정을 넣지 않았다. 말풍선이 화면 밖으로 나가거나 캐릭터를 가리지 않는 것도 스크린샷으로 확인했다.
- **학습 안내 대화창(`voice-guide`)**: `app.js`에 처리 코드(`showLearningGuide`)만 남아 있고, `src`·`index.html` 어디에도 `data-action="voice-guide"` 단추를 만드는 코드가 없다. 지금 화면에서는 열리지 않는 안 쓰는 화면이라 재지 않았다.
- **캔버스 글**: `map.js`(지도·복원·인물 그림)와 `reward-cards.js`의 2D 캔버스는 그림만 그린다. `fillText`·`strokeText`·`font`·`measureText`가 없어 캔버스에 그리는 글 자체가 없다. 확인함, 문제없음.
- 그대로 두기로 한 것: 관찰 수첩 「그루터기의 / 버섯」(공통 결정).
