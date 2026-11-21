# 14 생명의 그물 지도 · 인트로·파이널 최종 합성 (2026-11-21, _shared/FILMS-FINISH-20261121.md)
# 1) 클립 3개를 8초로 맞춰 0.4초 교차 페이드 → 끝 장면 멈춤
# 2) 모션그래픽: 인트로 끝 = 앱 제목 로고가 떠오르고 호기심 한 줄 / 파이널 끝 = 나뭇잎·반짝임이 내리고 「복원 미션 완료」 배지
# 3) 배경음: 게임 주제 음악(인트로)·마무리 음악(파이널)만. 목소리 구간에서 낮춘다. 영상 생성기 소리는 쓰지 않는다.
# 4) 자막: 공용 _shared/caption-motion-20261118/burn.py(주아체, 화자 이름표, 글자 스윕, [키워드], 진행 줄)
# 결과: build/<film>-src.mp4(자막 없음) → build/<film>-app.mp4(자막, 앱용, 목소리 없음) → build/<film>-full.mp4(목소리까지 구운 확인·공유용)
# 사용: python3 compose2.py intro|finale
import json, math, os, random, subprocess, sys
name = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.abspath(os.path.join(here, '../..'))
BURN = '/Volumes/T7 Shield/iscreammedia_sc34/_shared/caption-motion-20261118/burn.py'
PY = os.path.expanduser('~/.local/share/uv/tools/earshot/bin/python')
JUA = '/Volumes/T7 Shield/iscreammedia_sc34/_shared/caption-motion-20261118/fonts'
CLIP, FADE = 8.0, 0.4
FILMS = {
  'intro': {'clips': ['i1', 'i2', 'i3'], 'bgm': 'assets/audio/bgm/main-theme.mp3', 'total': 26.0,
    'cues': [  # s, e, 화자, 자막(목소리와 글자 그대로, [키워드]), 목소리 파일, 목소리 길이
      (0.8, 4.5, '모아', '반가워, 탐험가! 나는 생태 탐험가 [모아]야.', 'story-intro-1'),
      (8.2, 10.9, '모아', '물가와 숲에 [이상 신호]가 생겼어.', 'story-intro-2'),
      (15.8, 20.1, '모아', '생물과 환경의 연결을 찾아\n[생명의 그물]을 다시 이어 줘!', 'story-intro-3'),
    ], 'title_at': 20.4},
  'finale': {'clips': ['f1', 'f2', 'f3'], 'bgm': 'assets/audio/bgm/final-theme.mp3', 'total': 28.0,
    'cues': [
      (2.4, 6.9, '매듭 악당', '흥, [매듭]은 풀고 갈게. 데굴데굴 퇴장!', 'story-finale-1'),
      (8.2, 10.9, '모아', '다시 이어진, [생명의 그물].', 'story-finale-2'),
      (15.6, 20.7, '모아', '네가 찾은 증거와 고친 설계가\n생물들의 [먹이 길]을 이어 줬어.', 'story-finale-3'),
      (20.9, 26.6, '모아', '[해냈어]! 너랑 함께한 탐험,\n정말 즐거웠어. 고마워, 탐험가!', 'story-finale-4'),
    ], 'celebrate_at': 21.0},
}
f = FILMS[name]; T = f['total']
audio_dir = os.path.join(root, 'assets/audio/voices')
def vlen(v):
    p = os.path.join(audio_dir, v + '.mp3')
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
def ts(t):
    cs = int(round(max(0, t) * 100)); return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'
def bgr(h, a=0): h = h.lstrip('#'); return f'&H{a:02X}{h[4:6]}{h[2:4]}{h[0:2]}&'

# ── 모션그래픽(ASS 도형) ──
LEAF = 'm 0 -30 b 18 -22 22 6 0 30 b -22 6 -18 -22 0 -30'          # 잎 한 장
STAR = 'm 0 -22 l 5 -5 l 22 0 l 5 5 l 0 22 l -5 5 l -22 0 l -5 -5'   # 반짝임
ev = []
if name == 'intro':
    t0 = f['title_at']
    # 로고 뒤 부드러운 어둠(글자가 그림 위에 떠 보이지 않게, 밝은 하늘 위에서도 읽히게)
    ev.append(f'Dialogue: 0,{ts(t0)},{ts(T)},D,,0,0,0,,{{\\an5\\pos(960,330)\\fad(600,0)\\bord0\\shad0\\blur60\\1c&H1C2A12&\\1a&H70&\\p1}}m -760 -230 b -300 -330 300 -330 760 -230 b 900 0 760 230 760 230 b 300 330 -300 330 -760 230 b -900 0 -760 -230 -760 -230')
    # 호기심 한 줄(답은 말하지 않는다)
    ev.append(f'Dialogue: 2,{ts(t0 + 1.0)},{ts(T)},T,,0,0,0,,{{\\an5\\move(960,640,960,616,0,500)\\fad(500,0)}}물가와 숲에 무슨 일이 생긴 걸까? {{\\1c&H5CD3FF&}}함께 찾으러 가자!')
    # 로고 둘레 반짝임 몇 개
    rnd = random.Random(14)
    for k in range(10):
        x, y = rnd.choice([rnd.randint(330, 640), rnd.randint(1280, 1590)]), rnd.randint(150, 520); st = t0 + 0.6 + k * 0.28
        ev.append(f'Dialogue: 3,{ts(st)},{ts(min(T, st + 1.4))},D,,0,0,0,,{{\\an5\\pos({x},{y})\\bord0\\shad0\\blur1.5\\1c&H8FEBFF&\\fscx10\\fscy10\\t(0,350,\\fscx100\\fscy100)\\t(350,1400,\\fscx20\\fscy20\\alpha&HFF&)\\p1}}{STAR}')
else:
    t0 = f['celebrate_at']; rnd = random.Random(21)
    # 내려오는 나뭇잎(초록·연두·노랑)과 반짝임
    cols = ['#5DAA3E', '#8CC84B', '#F2C94C', '#6FBF73', '#C9E265']
    for k in range(34):
        st = t0 + rnd.uniform(0, 3.2); dur = rnd.uniform(3.2, 5.2); x0 = rnd.randint(60, 1860); x1 = x0 + rnd.randint(-160, 160)
        sc = rnd.randint(55, 105); rot = rnd.randint(-200, 200)
        ev.append(f'Dialogue: 2,{ts(st)},{ts(min(T, st + dur))},D,,0,0,0,,{{\\an5\\move({x0},-40,{x1},1120)\\frz{rnd.randint(0,359)}\\t(\\frz{rot})\\fscx{sc}\\fscy{sc}\\bord0\\shad0\\1c{bgr(rnd.choice(cols))}\\fad(200,300)\\p1}}{LEAF}')
    for k in range(26):
        st = t0 + rnd.uniform(0.2, 5.5); x, y = rnd.randint(80, 1840), rnd.randint(60, 700)
        ev.append(f'Dialogue: 3,{ts(st)},{ts(min(T, st + 1.2))},D,,0,0,0,,{{\\an5\\pos({x},{y})\\bord0\\shad0\\blur1.5\\1c&H8FEBFF&\\fscx10\\fscy10\\t(0,300,\\fscx{rnd.randint(70,120)}\\fscy{rnd.randint(70,120)})\\t(300,1200,\\fscx15\\fscy15\\alpha&HFF&)\\p1}}{STAR}')
    # 「복원 미션 완료」 배지(앱 엔딩 배지와 같은 말): 금빛 둥근 판 + 잎 아이콘, 튀어나오며 등장
    b0 = t0 + 0.6; bw, bh = 640, 132; bx, by = 960 - bw // 2, 150
    pop = '\\fscx40\\fscy40\\t(0,220,\\fscx112\\fscy112)\\t(220,380,\\fscx100\\fscy100)'
    org = f'\\org(960,{by + bh // 2})'
    ev.append(f'Dialogue: 4,{ts(b0)},{ts(T)},D,,0,0,0,,{{\\an7\\pos({bx},{by}){org}{pop}\\fad(120,0)\\bord5\\3c&H1E4D2A&\\shad6\\4a&H70&\\1c&H4FC8F6&\\p1}}m 66 0 l {bw-66} 0 b {bw-30} 0 {bw} 30 {bw} 66 b {bw} 102 {bw-30} {bh} {bw-66} {bh} l 66 {bh} b 30 {bh} 0 102 0 66 b 0 30 30 0 66 0')
    ev.append(f'Dialogue: 5,{ts(b0)},{ts(T)},D,,0,0,0,,{{\\an5\\pos({bx + 96},{by + bh // 2 + 58})\\org({bx + 96},{by + bh // 2 + 58}){pop}\\fad(120,0)\\frz-25\\bord3\\3c&H1E4D2A&\\shad0\\1c&H3E9A4F&\\fscx120\\fscy120\\p1}}{LEAF}')
    ev.append(f'Dialogue: 6,{ts(b0)},{ts(T)},B,,0,0,0,,{{\\an5\\pos({bx + bw // 2 + 34},{by + bh // 2 + 2}){org}{pop}\\fad(120,0)}}복원 미션 완료')
head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: D,Jua,20,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1
Style: T,Jua,58,&H00FFFFFF,&H00FFFFFF,&H00123A1E,&H96000000,0,0,0,0,100,100,0,0,1,5,3,5,0,0,0,1
Style: B,Jua,76,&H0019351E,&H0019351E,&H00FFFFFF,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
deco = os.path.join(here, f'build/{name}-deco.ass'); open(deco, 'w', encoding='utf-8').write(head + '\n'.join(ev) + '\n')

# ── 그림 ──
inputs = []
for c in f['clips']: inputs += ['-i', os.path.join(here, f'clips/{c}.mp4')]
hold = T - (CLIP * 3 - FADE * 2)
norm = lambda k: f'[{k}:v]scale=1920:1080:flags=lanczos,fps=30,format=yuv420p,setsar=1,tpad=stop_mode=clone:stop=12,trim=0:{CLIP},setpts=PTS-STARTPTS[v{k}]'
v = ';'.join(norm(k) for k in range(3))
v += f';[v0][v1]xfade=transition=fade:duration={FADE}:offset={CLIP-FADE}[x1];[x1][v2]xfade=transition=fade:duration={FADE}:offset={(CLIP-FADE)*2}[x2]'
v += f';[x2]tpad=stop_mode=clone:stop={int(round(hold*30))},setpts=N/(30*TB)[base]'
if name == 'intro':
    inputs += ['-loop', '1', '-framerate', '30', '-t', str(T), '-i', os.path.join(root, 'assets/web/logo.webp')]
    t0 = f['title_at']
    # 로고: 떠오르며 커지는 등장(0.7초), 위쪽 가운데. 앱 제목 그림 그대로.
    v += (f';[3:v]format=rgba,scale=1240:-1,setpts=PTS-STARTPTS,fade=t=in:st={t0}:d=0.7:alpha=1[lg0]'
          f";[lg0]scale=w='trunc(1240*(0.82+0.18*min(1,max(0,(t-{t0})/0.7)))/2)*2':h=-2:eval=frame[lg]"
          f";[base][lg]overlay=x='(W-w)/2':y='330-h/2+18*(1-min(1,max(0,(t-{t0})/0.7)))':eval=frame:enable='gte(t,{t0})'[ov]")
    last = 'ov'; bgm_i = 4
else:
    last = 'base'; bgm_i = 3
v += f";[{last}]ass='{deco}':fontsdir='{JUA}',fade=t=out:st={T-0.7}:d=0.7,scale=1280:720:flags=lanczos,format=yuv420p[v]"
# ── 배경음: 목소리 구간(앞뒤 0.3초)에서 45%로 낮춤 ──
wins = [(s, s + vlen(vf)) for s, _, _, _, vf in f['cues']]
duck = '*'.join(f"(1-0.55*clip((t-{a-0.3:.2f})/0.3,0,1)*clip(({b+0.3:.2f}-t)/0.3,0,1))" for a, b in wins)
a = (f"[{bgm_i}:a]aresample=48000,atrim=0:{T},asetpts=PTS-STARTPTS,afade=t=in:d=1.2,afade=t=out:st={T-2.2}:d=2.2,"
     f"volume='{duck}':eval=frame,volume=0.42[mus]")
inputs += ['-i', os.path.join(root, f['bgm'])]
src = os.path.join(here, f'build/{name}-src.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', v + ';' + a, '-map', '[v]', '-map', '[mus]', '-t', str(T),
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-tune', 'animation', '-maxrate', '2300k', '-bufsize', '4600k', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000',
                '-movflags', '+faststart', src], check=True, cwd=here)
# ── 자막(공용 burn.py) ──
cues = []
for s, e, who, text, vf in f['cues']:
    L = vlen(vf); cues.append({'s': s, 'e': e, 'speech': [round(s + 0.05, 2), round(s + L - 0.25, 2)], 'who': who, 'text': text, 'voice': vf})
    # 파이널 F3 장면은 모아·도토가 왼쪽 아래에 앉아 있어 자막 상자를 오른쪽으로 옮긴다
    if name == 'finale' and s >= 15: cues[-1]['x'] = 820
film = {'src': f'{name}-src.mp4', 'out': f'{name}-app.mp4', 'theme': {'box': '#10261c', 'accent': '#ffd35c', 'hot': '#ffd35c'},
        'speakers': {'모아': '#ffe27a', '매듭 악당': ['#7cc25a', '#10261c']}, 'bottom': 56, 'sweep': True,
        'cues': [{k: c[k] for k in ('s', 'e', 'speech', 'who', 'text', 'x') if k in c} for c in cues]}
fj = os.path.join(here, f'build/{name}-captions.json'); json.dump(film, open(fj, 'w'), ensure_ascii=False, indent=1)
subprocess.run([PY, BURN, fj], check=True, cwd=here)
# ── 목소리까지 구운 확인·공유판 ──
app = os.path.join(here, f'build/{name}-app.mp4'); full = os.path.join(here, f'build/{name}-full.mp4')
vin, g = [], '[0:a]volume=1.0[m]'
for i, c in enumerate(cues):
    vin += ['-i', os.path.join(audio_dir, c['voice'] + '.mp3')]
    g += f";[{i+1}:a]aresample=48000,adelay={int(c['s']*1000)}:all=1[o{i}]"
g += ';[m]' + ''.join(f'[o{i}]' for i in range(len(cues))) + f'amix=inputs={len(cues)+1}:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[aout]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', app, *vin, '-filter_complex', g, '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000',
                '-movflags', '+faststart', full], check=True, cwd=here)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '1.5', '-i', app, '-frames:v', '1', '-q:v', '3', os.path.join(here, f'build/{name}-poster.jpg')], check=True)
json.dump({'duration': T, 'cues': [{'at': c['s'], 'voice': c['voice'], 'speaker': c['who'], 'text': c['text'].replace('[', '').replace(']', '').replace('\n', ' ')} for c in cues]},
          open(os.path.join(here, f'build/{name}-cues.json'), 'w'), ensure_ascii=False, indent=1)
for p in (src, app, full): print(os.path.basename(p), os.path.getsize(p))
