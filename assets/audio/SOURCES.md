# 효과음 출처

## 지금 앱에서 나는 효과음 (2026-11-18 확인)

- 버튼·정답·오답·힌트 같은 화면 효과음: 녹음 파일 없이 `src/theme-effects.js`가 Web Audio로 직접 합성한다(`docs/AUDIO-PROVENANCE.md`).
- 지도 악당 공격·타격·퇴장·등장·접촉음: `sfx/map-*.mp3` 6개. CC0 출처는 `assets/CREDITS.md`의 「2026-11-17 지도 악당 효과음 (CC0)」 절.
- 성취 카드 효과음(날아옴·공개·칸에 들어감·완성): `sfx/card-*.mp3` 5개. CC0 출처는 `assets/CREDITS.md`의 「2026-11-18 성취 카드」 절.
- 아래 Kenney 효과음 7개는 앱 코드가 재생하지 않는다.

## Kenney Interface Sounds (미사용, 보관)

- 원작자: Kenney
- 팩: Interface Sounds (1.0), 2020-02-11
- 공식 소개 / 라이선스: https://kenney.nl/assets/interface-sounds
- 원작자 게시물: https://opengameart.org/content/interface-sounds
- 다운로드: https://opengameart.org/sites/default/files/kenney_interfaceSounds.zip
- 확인·다운로드: 2026-10-22
- 이용 조건: CC0 1.0, 개인·교육·상업적 이용 가능. 원문은 `LICENSE.txt`에 보관.
- 원본 ZIP SHA-256: `F2193D072726D6758A5F7871B2DCC54DCCE0D5C35C6F0A62F92549B327C81232`
- 처리: 원본 OGG를 FFmpeg/libmp3lame 품질 5로 MP3 변환.
- 보관 위치: `kenney/` (2026-11-18 이동). 빌드는 `assets/audio` 바로 아래 파일만 복사하므로 이 7개는 배포본(`dist`)에 들어가지 않는다.
- 2026-10-22에는 화면 효과음으로 썼지만, 지금 화면 효과음은 위 합성음으로 바뀌어 앱 실행 중에는 쓰지 않는다.

| 파일 | 앱 실행 중 | 개념 영상(`assets/concepts/p01~p10.mp4`) |
|---|---|---|
| kenney/click_003.mp3 | 미사용(보관) | 쓰지 않음 |
| kenney/error_001.mp3 | 미사용(보관) | 쓰지 않음 |
| kenney/pluck_001.mp3 | 미사용(보관) | 이름표 등장음으로 영상 소리에 합성됨 |
| kenney/drop_003.mp3 | 미사용(보관) | 놓기 소리로 영상 소리에 합성됨 |
| kenney/switch_002.mp3 | 미사용(보관) | 바뀜 소리로 영상 소리에 합성됨 |
| kenney/maximize_001.mp3 | 미사용(보관) | 확대 소리로 영상 소리에 합성됨 |
| kenney/confirmation_002.mp3 | 미사용(보관) | 결론 소리로 영상 소리에 합성됨 |

개념 영상은 `films/build.mjs`가 위 5개를 `films/pNN/assets/sfx/`로 복사해 렌더링한 결과다. 배포되는 MP4 안에 소리가 이미 섞여 있어 별도 MP3 파일은 필요 없다. 영상을 다시 만들 때만 `kenney/`의 파일을 쓴다. `scripts/make-concepts.py`(이전 영상 제작 스크립트)도 `kenney/confirmation_002.mp3`를 가리킨다.
