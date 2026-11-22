# 14 생명의 그물 지도 · 납품 안내

기존 인계 문서: [`../HANDOFF.md`](../HANDOFF.md)(날짜별 작업 기록), [`../README.md`](../README.md), [`../PRD.md`](../PRD.md), [`../TRD.md`](../TRD.md).

## 1. 한눈에

- 프로젝트 이름: 생명의 그물 지도(14 environments, 운영 이름 ecosystem-explorer)
- 운영 주소: https://ecosystem-explorer.yelsam.workers.dev
- 저장소: https://github.com/yelmovie/ecosystem-explorer (브랜치 `main`)
- 현재 앱 커밋: `49e3d34`(2026-11-22, 앱 소스 마지막 변경)

## 2. 폴더 구조

- 배포됨: `dist/`(빌드 결과). `index.html`, `favicon.svg`, `sw.js`, `src/`, 그리고 `assets/`의 `web`·`og`·`concepts`·`audio`(voices·bgm·sfx 포함)·`learning-v2`·`learning-v3`·`fonts`·`map-encounters`·`reward-cards`만 복사됩니다(`scripts/build.mjs`).
- `worker/media-range.js`: 영상 Range 처리 코드(Worker 진입점).
- 보관용(배포 안 됨): `asset-bank/`, `references/`, `artifacts/`, `films/`(개념영상 원본), `docs/`, `tests/`, `tools/`.
- 문서: `PRD.md`, `TRD.md`, `README.md`, `HANDOFF.md`.

## 3. 실행·빌드·검사 명령

`package.json`과 `README.md`에서 확인한 것입니다. Node.js 20 이상이 필요합니다.

- `npm run dev`: 소스 개발 서버(`scripts/serve.mjs`, 기본 4184 포트)
- `npm run build`: `dist/` 생성(`scripts/build.mjs`, 이어서 `postbuild`로 `scripts/clean-build-metadata.mjs`)
- `npm run preview`: `dist/` 미리보기(`PORT=4185`처럼 포트 변경 가능)
- `npm run check`: 소스 JS 구문 검사
- `npm test`: `node --test tests/*.test.mjs`
- 개념영상 다시 만들기: `README.md`의 HyperFrames 절차(`films/build.mjs`, `films/render.mjs`).
- 의존성 설치 단계는 없습니다(`package.json`에 dependencies가 없는 정적 사이트 빌드).

## 4. 배포

- 호스팅: Cloudflare Workers(정적 에셋 + Worker). 저장소 안에 `wrangler` 설정 파일은 없습니다.
- 설정 파일 위치: 저장소 밖 작업 폴더의 `_scratch/deploy-20261118/cfg/14.json`을 `deploy.sh`가 `__DIST__`·`__APP__`을 바꿔 쓰는 방식입니다. 담긴 값은 `name: ecosystem-explorer`, `main: worker/media-range.js`, `assets.directory: dist`, `binding: ASSETS`, `run_worker_first: /assets/concepts/*, /assets/map-encounters/*`, `not_found_handling: none`, `html_handling: auto-trailing-slash`입니다.
- 배포 명령(`HANDOFF.md` 기록): `_scratch/deploy-20261118/deploy.sh 14 "14 environments" worker-cfg ecosystem-explorer`. 이 스크립트는 `origin/main`을 받아 빌드한 뒤 `wrangler deploy --config`를 실행합니다.
- Range 처리: `worker/media-range.js`가 `.mp4`·`.webm`·`.m4v` 요청에 206 조각을 돌려줍니다(정적 에셋은 Range에 전체 파일을 돌려줘 탐색이 안 되기 때문). 이야기 영상은 `/assets/concepts/` 아래라 같은 경로로 처리됩니다.
- 푸시로 자동 배포되는 워크플로는 없습니다(`.github/` 없음). 배포는 직접 실행합니다.

## 5. 다른 호스팅으로 옮길 때

- 정적 파일 폴더: `npm run build`가 만드는 `dist/` 전체.
- 서비스워커 `sw.js`는 루트에 있어야 하며 배포 빌드에서만 등록됩니다(`HANDOFF.md`의 오프라인 재방문 기록).
- 영상 Range: 호스팅이 206 응답을 지원하지 않으면 `worker/media-range.js`와 같은 처리가 필요합니다(없으면 영상 탐색이 안 되고 iPad Safari에서 mp4가 재생되지 않을 수 있습니다).
- 환경 값·비밀 키는 앱이 쓰지 않습니다(확인한 범위: `package.json`, `scripts/build.mjs`).

## 6. 버전과 변경 이력

- `6d40098` 2026-11-22 지도 악당을 다 물리쳐도 지도 피날레 영상을 띄우지 않음(악당은 성취 카드만, 마무리 영상은 p10 완료 때 한 번). Worker 버전 `1a765a93`
- `49e3d34` 2026-11-22 마무리 영상 F3 Veo 교체(이야기 영상 여섯 장면 모두 Veo)
- `2da3672` 2026-11-22 처음 이야기 영상 I1·I3 Veo 교체
- `5f24721` 2026-11-21 마무리 영상 F2 Veo 교체
- `dac726f` 2026-11-21 마무리 영상 F1 Veo 교체
- `45ec053` 2026-11-21 인트로 I2 구글 Flow Veo 교체
- `6406c6a` 2026-11-21 이야기 영상 최종 마무리(자막·로고·축하 모션)
- `e023e87` 2026-11-21 처음·마무리 이야기 영상 추가
- `ca1d468` 2026-11-21 300자 넘는 논리 줄 정리
- `ef55283`, `26695a2` 2026-11-21 뒤로 가기·오프라인 재방문, 해금 다시 계산
- `717fb6e` 2026-11-21 성취 카드 글자 기준 맞춤

## 7. 권리·출처

[`RIGHTS-LEDGER-20261121.md`](RIGHTS-LEDGER-20261121.md)에 32줄을 정리했습니다. 확인됨 27, 근거 약함 4(VID-02 지도 파이널 영상, VOX-02, VOX-03, FNT-02), 출처 미확인 1(IMG-13 `favicon.svg`)입니다. 그림은 Codex, 이야기 영상은 구글 Flow·Gemini 앱(Veo)입니다. 요금제 증빙은 사용자 자료 대기입니다.

## 8. 알려진 한계와 남은 일

`docs/reviews/SCORE-20261121.md` 기준 95점(실기기 제외 97점)입니다. 남은 감점은 다음과 같습니다.

- E2 `src/app.js` 구조(다음 단계)
- A12 교사 수업 검수(`docs/TEACHER-REVIEW-20261121.md`), F12 그림 권리 자료(장부)
- 실기기·수업 확인: B16, D10
- 앱이 부르지 않는데 배포본에 들어 있는 파일이 있습니다(장부 「집계」 참고). 빼면 확인할 줄이 줄어듭니다.

## 운영 대조 기록 (2026-11-22 12:56)

- 조율 세션이 운영 주소의 `index`와 스크립트·스타일 파일 40개를 저장소 `origin/main`과 대조했습니다. 결과는 모두 일치입니다(불일치 0).
- 위 본문에 「운영 반영 확인 필요」로 적힌 칸은 이 대조로 확인된 것입니다. 이후 앱을 다시 배포하면 `_scratch/final-recheck-20261120/prodcmp.sh 14`로 다시 대조합니다.
