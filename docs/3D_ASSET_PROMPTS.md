# 생명의 그물지도 3D 기본 이미지와 프롬프트 초안

이 목록은 「생명의 그물지도」의 3D 제작 후보와 기본 이미지 프롬프트를 정리한 초안이야. 스테이지 선택 지도만 2.5D 픽셀아트이고, 장소 내부는 기존 스타일의 2D 화면으로 유지해.

MVP에 실시간 3D는 필수가 아니야. 아래 이미지는 필요할 때 3D 모델을 만들고 2D 스프라이트나 상태별 장면으로 렌더하기 위한 원화 후보야. 이미지 생성이나 3D 모델 생성은 아직 실행하지 않았어.

# 먼저 만들 후보

| ID | 기본 이미지 | 우선도 | 사용처 | 필요한 기본 구도 |
|---|---|---|---|---|
| A01 | 수달 연구원 모아 | 1차 후보 | 지도 이동 캐릭터의 모델 기준 | 전신 3/4, 정면, 측면, 후면 |
| A02 | 자연 연구 거점 오두막 | 1차 후보 | 지도에서 장소를 구분하는 표지 | 3/4, 후면 |
| A03 | 큰 활엽수 | 1차 후보 | 지도 숲의 공통 오브젝트 | 3/4 |
| A04 | 생태 신호 장치 | 1차 후보 | 장의 상태·조사 진행 표시 | 3/4 |
| A05 | 작은 나무다리 | 2차 후보 | 지도 이동 경로 | 3/4, 측면 |
| A06 | 강가 바위 | 2차 후보 | 물가 경계와 지형 | 3/4 |
| A07 | 버섯이 붙은 썩은 통나무 | 2차 후보 | 분해 역할 관찰 | 3/4 |
| A08 | 갈대 군락 | 2차 후보 | 습지 구역의 지형 장식 | 3/4 |
| B01 | 작은 생태 실험 모형 받침 | 선택 후보 | P04 역할 실험의 2D 렌더 | 고정 사선 시점 |
| B02 | 흙 덩이 위 어린나무 | 선택 후보 | P09·P10 복원 행동의 피드백 | 3/4 |

1차 후보 4종은 모두 만들어야 하는 필수 제작량이 아니야. 기존 2D 에셋만으로 먼저 구현할 수 있고, 모아·대표 나무·신호 장치 중 필요한 것부터 제작해도 돼. 모아의 옆모습·뒷모습은 기존 이미지에 없어서 일관된 신규 설정이 필요해.

# 공통 제작 기준

- 3D 변환에 넣는 기본 이미지는 한 장에 한 대상만 두고, 전체 실루엣이 잘 보이게 만들어.
- 권장 원화 크기는 1024×1024 이상, 대상 주위 여백은 약 10~15%야. 실제 출력 해상도는 사용하는 생성 도구에서 설정해.
- 깨끗한 밝은 회색 배경, 부드럽고 균일한 조명, 약한 그림자로 형태를 분명하게 보여줘.
- 3D 모델용 원화에는 픽셀 격자를 넣지 않아. 지도에 쓸 때 모델을 고정 시점으로 렌더하고 픽셀 스프라이트의 크기·윤곽·팔레트를 통일해.
- 2D 활동 화면용 렌더는 현재 자연 일러스트와 모아의 부드러운 입체 그림체에 맞춰.
- 정면·측면·후면은 처음 확정한 기준 이미지를 참조해 각각 따로 생성해. 여러 시점을 한 장에 붙인 이미지를 그대로 단일 이미지 기반 3D 변환에 넣지 않아.
- 공통 제외 조건: text, letters, watermark, UI, collage, multiple views in one image, cropped subject, dramatic perspective, depth of field, cast shadows obscuring shape, excessive surface noise.
- 프롬프트의 reference image는 실제 생성할 때 해당 참고 이미지를 함께 넣었을 때만 유효해. 텍스트에 파일명을 적는 것만으로 참조되지는 않아.

# A01 수달 연구원 모아

참고: 캐릭터 시트 chatgpt_generated_40.png의 수달. 모자, 나뭇잎 장식, 갈색 털, 크림색 얼굴·배, 카키 조끼, 쌍안경을 유지해. 지도에서 조종할 주인공을 모아로 정할 경우 사용해.

```text
Create a clean 3D modeling reference image of the same friendly otter field researcher shown in the supplied reference. Preserve the round brown head, cream muzzle and belly, dark round eyes, small dark nose, tan safari hat with a green leaf badge, olive field vest, and compact binoculars. Show one full-body character in a neutral A-pose, arms slightly away from the torso, feet apart, tail fully visible, mouth gently closed. Empty hands, no book or magnifying glass. Front three-quarter view, orthographic-style camera, plain light gray background, soft even studio lighting, clear silhouette, simplified groomed fur, matte stylized materials suitable for a children's educational game. Center the entire character with generous margins. No text, no scenery, no extra characters, no collage.
```

추가 시점에는 기준 이미지와 위 특징을 유지하고 아래 문장 중 하나를 적용해.

- Front view, orthographic, symmetrical neutral A-pose.
- Left side view, orthographic, preserve the exact proportions and costume.
- Back view, orthographic, show the vest, hat and tail clearly.

기본 이미지 네 장은 걷기 애니메이션이 아니야. 모델 제작 후 리깅과 걷기 동작, 또는 별도의 일관된 스프라이트 제작이 필요해.

# A02 자연 연구 거점 오두막

참고: chatgpt_generated_34.png의 관찰 데크 분위기. 기존 그림 속 데크와 동일한 건물로 확정된 것은 아니야.

```text
A single small nature research hut for a friendly educational exploration game. A compact wooden cabin with a simple moss-green pitched roof, one wide open doorway, a short front observation deck, two thick supporting posts and a blank wooden sign panel. Warm light wood, clean simplified geometry, large readable shapes, matte stylized materials. Show the complete freestanding building in a front three-quarter orthographic-style view, including its back roof edge and full base. Plain light gray background, soft even studio lighting, centered with generous margins. No people, no animals, no surrounding landscape, no lettering, no furniture clutter, no collage.
```

지도에서는 목적지 하나의 대표 건물로 쓰고, 같은 오두막을 무조건 다섯 번 복제해 장의 구분을 흐리지 않도록 해.

# A03 큰 활엽수

참고: 배경 26~35번의 초록·청록 자연 팔레트. 3D 제작용 원화는 배경 전체를 베끼지 않고 나무 하나만 분리해.

```text
One stylized mature broadleaf tree as an isolated game prop. A sturdy gently curved brown trunk with a few readable branches, a broad rounded canopy built from several large clusters of green leaves, a few visible roots, no soil island. Friendly proportions, simplified botanical forms, clean silhouette readable at small scale, matte materials, colors inspired by a bright riverside nature illustration. Full tree from roots to canopy, front three-quarter orthographic-style view, plain light gray background, soft neutral studio lighting, centered with clear margins. No animals, flowers, buildings, text, scenery, or extra trees.
```

# A04 생태 신호 장치

참고: 샘플 P01의 이상 신호와 P10의 회복 신호. 처음 확정한 형태를 계속 사용하고, 색과 빛은 상태 표현으로 분리해.

```text
One small fictional ecology monitoring beacon for a friendly nature exploration game. A low round stone pedestal supporting a simple transparent protective capsule with a leaf-shaped indicator inside, framed by warm cream and moss-green structural parts. Rounded safe shapes, compact proportions, readable silhouette, matte outer materials. The indicator is unlit and neutral so its color can be changed later. Full object in front three-quarter orthographic-style view, plain light gray background, even soft studio lighting. No glow bloom, no warning text, no buttons with letters, no surrounding landscape, no extra objects.
```

정상·이상·조사 완료는 같은 모델의 표시 색이나 아이콘으로 구분해. 모델을 상태마다 새로 생성해 형태가 흔들리지 않게 해.

# A05 작은 나무다리

```text
One short freestanding wooden footbridge for a small riverside exploration map. Six broad wooden planks form a gently arched walkway, with low sturdy wooden railings on both sides and two clear support beams underneath. Warm weathered light-brown wood, rounded edges, clean simplified construction, readable at small scale. Show the entire bridge in front three-quarter orthographic-style view, both entrances and the underside supports visible. Plain light gray background, soft even studio lighting. No river, terrain, plants, people, labels, ropes crossing the walkway, or extra objects.
```

지도에서 실제로 이동 가능한 길과 그림의 다리 위치를 맞춰야 해.

# A06 강가 바위

```text
One medium-sized rounded riverside boulder as a standalone game prop, with a broad stable base, a few large readable stone planes and a small flat moss patch on its upper left surface. Cool gray stone with muted green moss, simplified matte stylized materials, smooth friendly shape rather than sharp crystals. Full object in front three-quarter orthographic-style view, centered on a plain light gray background, soft even studio lighting. No water, plants growing around it, gravel pile, terrain island, dramatic shadows, text, or additional rocks.
```

하나의 기본형을 회전·크기 변형해 재사용하되 캐릭터가 지나갈 수 있는 길과 구분되게 해.

# A07 버섯이 붙은 썩은 통나무

```text
One short decomposing fallen log as a single connected educational game prop, with a clearly visible circular broken end, a simple hollow opening, readable wood grain and three small shelf mushrooms attached to one side. Warm brown wood and muted cream-brown mushrooms, child-friendly stylization, large clean forms, matte surfaces. Show the complete log in front three-quarter orthographic-style view with both ends readable. Plain light gray background, soft neutral studio lighting. No loose insects, no surrounding forest, no soil base, no text, no extra logs.
```

그림은 분해 흔적의 관찰용이야. 균류와 다른 생물의 역할 설명은 학습 내용에서 별도로 검토해.

# A08 갈대 군락

```text
One compact clump of five stylized wetland reeds growing from a small shared root base. Broad simple green leaves curve outward, three sturdy stems carry clearly visible brown reed heads, the remaining stems are shorter. Clean connected shapes, slightly thickened leaves suitable for a small game prop, matte natural materials, an uncluttered silhouette. Show the whole plant clump in front three-quarter orthographic-style view, plain light gray background, even soft studio lighting. No water surface, animals, insects, landscape, labels, or separate plant clumps.
```

지도용으로는 세밀한 잎보다 실루엣을 우선해. 최종 렌더에서 이동 캐릭터를 과도하게 가리지 않도록 높이를 조절해.

# 선택 후보 B01 생태 실험 모형

용도: P04 역할 실험. 처음에는 2D 배경과 개별 생물 레이어로도 구현할 수 있어.

```text
One compact circular ecology diorama base for a children's science activity. A shallow raised earth platform with a clearly readable soil edge, a small curved pond recess on one side, a gently sloped grassy bank on the other, and open spaces reserved for separate plant and animal props. Soft stylized natural materials, simplified clean geometry, no decorative laboratory frame. Fixed elevated three-quarter orthographic-style view, plain light gray background, even studio lighting, entire platform visible. No animals, no trees, no mushrooms, no labels, no arrows, no user interface, no surrounding room.
```

생물·나무·낙엽은 별도 오브젝트나 레이어로 배치해. 제거 실험의 상태를 바꿀 수 있도록 모든 것을 한 덩어리 이미지로 고정하지 않는 게 핵심이야. 물 표면도 필요하면 별도 레이어로 둬.

# 선택 후보 B02 복원용 어린나무

```text
One young native-looking broadleaf sapling growing from a compact rounded soil root ball, as a single isolated restoration game prop. A short sturdy brown stem, six broad fresh green leaves and one small new leaf bud. Clear botanical silhouette, friendly stylized proportions, matte surfaces, simple large shapes. Full object in front three-quarter orthographic-style view, plain light gray background, soft even studio lighting, centered with generous margins. No pot, shovel, hands, text, scenery, extra plants, or glow effects.
```

나무 심기 선택의 피드백에 사용해. 어린나무가 즉시 큰 숲이 되는 연출은 실제 회복 시간과 혼동되지 않도록 구분해.

# 지도 전체 구도 참고 이미지

이 프롬프트는 2.5D 지도 컨셉 검토용이야. 여러 장소가 있는 전체 장면이므로 단일 오브젝트용 3D 변환에 그대로 넣는 이미지는 아니야.

```text
A cohesive 2.5D pixel-art RPG stage selection map for a children's ecology exploration game, viewed from a fixed elevated diagonal angle. A compact nature reserve contains five clearly separated destination areas connected by short walkable paths: a riverside observation point, a small field research hut, a forest clearing, a wetland lookout and a restoration garden. Include a small wooden footbridge and a continuous stream to connect the landscape visually. Warm green, turquoise and earthy colors, crisp consistent pixel clusters, readable silhouettes, coherent object scale, clear foreground and background layering. Leave generous quiet space at the top left and top right for navigation and settings controls. No text, no labels, no embedded UI, no realistic rendering, no tilt-shift blur, no collage, no giant characters.
```

다섯 장소의 이름과 실제 배치는 시나리오 대화 후 확정해. 생성된 컨셉 이미지 자체는 걷기 경로·충돌 영역·오브젝트 가림 정보를 제공하지 않으므로 구현용 데이터는 별도로 설계해야 해.

# 기존 에셋을 쓰는 방법

- 자연 배경: chatgpt_generated_26.png~35.png. 2D 활동 화면에 먼저 활용.
- 타이틀 참고: chatgpt_generated_36.png~38.png.
- 투명 로고: chatgpt_generated_39.png.
- 투명 캐릭터 시트: chatgpt_generated_40.png. 여러 포즈와 동물이 한 장에 있어 분리와 가장자리 검수가 필요해.
- 3D 같은 음영이 있는 그림과 실제 3D 모델은 달라. 현재 폴더에는 PNG와 ZIP만 있고, 회전하거나 리깅할 수 있는 3D 모델은 없어.
- 먹이그물 카드에 쓰는 생물은 교육용 종과 관계부터 확정해. 캐릭터 시트에 있는 동물을 모두 그대로 먹이그물 정답에 넣지는 않아.

기본 이미지 → 형태와 시점 확인 → 필요한 경우 3D 모델 제작 → 비례·구조 정리 → 고정 시점 렌더 → 2D 화면 또는 픽셀아트 스프라이트에 적용 순서로 진행하면 돼.
