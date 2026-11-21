# 그림 한 장 → 8초 카메라 움직임 클립(1280×720, 30fps). Veo 영상이 생기면 clips/의 같은 이름 파일만 바꾸면 compose.py가 그대로 쓴다.
# 움직임은 시나리오(life-web-video-plan) 그대로: 밀고 들어가기, 옆으로 훑기, 뒤로 빠지며 올라가기.
import subprocess, os
here = os.path.dirname(os.path.abspath(__file__))
D = 8.0
# 장면마다 (시작 배율, 끝 배율, 시작 중심 x,y, 끝 중심 x,y) — 중심은 그림 비율(0~1)
MOVES = {
  'i1': (1.00, 1.14, 0.50, 0.50, 0.55, 0.56),   # 물가 쪽으로 천천히 밀고 들어감
  'i2': (1.16, 1.16, 0.38, 0.50, 0.66, 0.52),   # 악당에서 흐려진 물 쪽으로 옆 이동
  'i3': (1.38, 1.00, 0.42, 0.70, 0.50, 0.50),   # 모아·도토에서 뒤로 빠지며 골짜기 전체
  'f1': (1.00, 1.16, 0.50, 0.52, 0.50, 0.62),   # 풀리는 매듭 쪽으로 밀고 들어감
  'f2': (1.14, 1.14, 0.36, 0.48, 0.64, 0.50),   # 다시 이어진 먹이 길을 따라 옆 이동
  'f3': (1.22, 1.00, 0.36, 0.66, 0.50, 0.50),   # 모아·도토에서 뒤로 빠지며 노을 골짜기
}
def ease(expr):  # smoothstep(t/D)
    s = f'(min(1,{expr}/{D}))'
    return f'({s}*{s}*(3-2*{s}))'
for name, (z0, z1, x0, y0, x1, y1) in MOVES.items():
    e = ease('t')
    Z = f'({z0}+({z1}-{z0})*{e})'
    cx, cy = f'({x0}+({x1}-{x0})*{e})', f'({y0}+({y1}-{y0})*{e})'
    # 크게 키운 그림에서 1280×720 창을 옮긴다. 창이 그림 밖으로 나가지 않게 x,y를 묶는다.
    vf = (f"scale=2560:1440:flags=lanczos,"
          f"scale=w='trunc(1280*{Z}/2)*2':h='trunc(720*{Z}/2)*2':eval=frame:flags=bicubic,"
          f"crop=1280:720:x='max(0,min(iw-1280,iw*{cx}-640))':y='max(0,min(ih-720,ih*{cy}-360))',"
          f"fps=30,format=yuv420p,setsar=1")
    out = os.path.join(here, f'clips/{name}.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-t', str(D), '-i', os.path.join(here, f'frames/{name}.png'),
                    '-f', 'lavfi', '-t', str(D), '-i', 'anullsrc=r=48000:cl=stereo',
                    '-vf', vf, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-c:a', 'aac', '-shortest', out], check=True)
    print(name, os.path.getsize(out))
