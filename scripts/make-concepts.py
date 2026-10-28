"""Reproducible 12-second, three-shot concept films. Pillow -> FFmpeg H.264.
No remote generation, external fonts, stock footage or runtime dependencies.
"""
import json, math, os, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'concepts'
OUT.mkdir(parents=True, exist_ok=True)
FFMPEG = os.environ.get('FFMPEG', 'D:/DevCaches/python-media/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe')
W, H, FPS, DURATION = 960, 540, 24, 12
INK, GREEN, GOLD, MUTED = '#203f34', '#2f8062', '#e6b951', '#5c7166'
FONT = 'C:/Windows/Fonts/malgun.ttf'
BOLD = 'C:/Windows/Fonts/malgunbd.ttf'
fonts = {(s,b):ImageFont.truetype(BOLD if b else FONT,s) for s in [18,22,24,26,28,30,32,34,36,38] for b in [False,True]}
js = (ROOT/'src/learning.js').read_text(encoding='utf-8')
# Export data through Node so the film and the in-game transcript share one source.
res = subprocess.run(['node','--input-type=module','-e',"import {concepts} from './src/learning.js';process.stdout.write(JSON.stringify(concepts))"],cwd=ROOT,capture_output=True,check=True)
concepts = json.loads(res.stdout)
(OUT/'storyboard.json').write_text(json.dumps(concepts,ensure_ascii=False,indent=2),encoding='utf-8')

def text(d,xy,s,size=28,fill=INK,bold=False,anchor='mm'):
    d.text(xy,s,font=fonts[size,bold],fill=fill,anchor=anchor)

def sprite(d, kind, x, y, pulse=0):
    """Consistent vector-like silhouettes, readable without platform emoji fonts."""
    x,y=int(x),int(y)
    def ell(box,c,outline=None,width=3): d.ellipse(tuple(int(v) for v in box),fill=c,outline=outline,width=width)
    if kind in ('plant','tree'):
        d.line((x,y+32,x,y-35),fill='#61834e',width=9)
        if kind=='tree':
            d.rectangle((x-8,y-7,x+8,y+45),fill='#946744')
            for a,b in [(-25,-25),(25,-25),(0,-53)]:ell((x+a-34,y+b-32,x+a+34,y+b+32),'#74a26a')
        else:
            ell((x-50,y-26,x-2,y+2),'#78ab66');ell((x+2,y-50,x+48,y-18),'#4d936b');ell((x-28,y-63,x+7,y-30),'#97b971')
        d.arc((x-50,y+27,x+50,y+52),180,350,fill='#a7b781',width=8)
    elif kind=='sun':
        ell((x-30,y-30,x+30,y+30),GOLD)
        for a in range(0,360,45):
            r=math.radians(a+pulse*5);d.line((x+math.cos(r)*40,y+math.sin(r)*40,x+math.cos(r)*52,y+math.sin(r)*52),fill=GOLD,width=5)
    elif kind=='water':
        d.polygon([(x,y-60),(x-35,y-2),(x-30,y+25),(x,y+42),(x+30,y+25),(x+35,y-2)],fill='#69b8cd')
        d.arc((x-24,y-5,x+24,y+28),10,120,fill='#d9f2ed',width=6)
    elif kind=='fungi':
        d.rounded_rectangle((x-13,y-4,x+13,y+42),radius=8,fill='#eed5a9')
        d.pieslice((x-51,y-58,x+51,y+30),180,360,fill='#c46f55')
        for a,b in [(-23,-24),(3,-37),(27,-22)]:ell((x+a-6,y+b-6,x+a+6,y+b+6),'#ffe8bd')
    elif kind=='frog':
        ell((x-45,y-25,x+45,y+35),'#79a65e');ell((x-37,y-44,x-5,y-12),'#83b56e');ell((x+5,y-44,x+37,y-12),'#83b56e')
        for a in [-22,22]:ell((x+a-5,y-33,x+a+5,y-20),INK)
        d.arc((x-21,y-3,x+21,y+22),0,180,fill=INK,width=3)
    elif kind in ('insect','caterpillar'):
        if kind=='caterpillar':
            for a in [-32,-12,8,28]:ell((x+a-16,y-12,x+a+16,y+20),'#8eae5e')
            ell((x+19,y-24,x+53,y+10),'#afc779');ell((x+39,y-17,x+44,y-10),INK)
        else:
            ell((x-42,y-14,x+28,y+18),'#83a85a');ell((x+15,y-29,x+47,y+3),'#aac478');ell((x+33,y-23,x+39,y-15),INK)
            for a in [-25,5]:d.line((x+a,y+12,x+a-19,y+34,x+a+7,y+34),fill='#5e7d43',width=5)
            d.line((x+30,y-26,x+17,y-49),fill='#5e7d43',width=3)
    elif kind=='fish':
        ell((x-43,y-26,x+33,y+26),'#6aabbb');d.polygon([(x+22,y),(x+52,y-28),(x+52,y+28)],fill='#e0b265');ell((x-28,y-9,x-21,y-2),INK)
    elif kind=='pipe':
        d.rounded_rectangle((x-43,y-44,x+13,y-16),radius=8,fill='#92a19a');d.rectangle((x-13,y-40,x+16,y+18),fill='#92a19a');ell((x-14,y+3,x+17,y+25),'#667c74')
        for a,b in [(-2,39),(22,52),(-15,57)]:ell((x+a-6,y+b-6,x+a+6,y+b+6),'#ad9d66')

labels={'plant':'식물','tree':'서식처','sun':'햇빛','water':'물','fungi':'분해자','frog':'개구리','insect':'메뚜기','caterpillar':'애벌레','fish':'물속 생물','pipe':'오염원'}
def arrow(d,a,b,phase,on=True):
    col=GREEN if on else '#c6c6b9';ax,ay=a;bx,by=b
    d.line((ax,ay,bx,by),fill=col,width=5)
    d.polygon([(bx,by),(bx-13,by-9),(bx-13,by+9)],fill=col)
    if on:
        for q in [0,.33,.66]:
            t=(phase*.45+q)%1;px=ax+(bx-ax)*t;py=ay+(by-ay)*t
            d.ellipse((px-5,py-5,px+5,py+5),fill=GOLD)

def frame(stage,c,t):
    im=Image.new('RGB',(W,H),'#f6f6e9');d=ImageDraw.Draw(im)
    d.rounded_rectangle((18,18,W-18,H-18),radius=28,fill='#fffdf3',outline='#dbe4cf',width=2)
    d.ellipse((-80,140,150,570),fill='#e8efdb');d.ellipse((800,-140,1150,230),fill='#edf1df')
    text(d,(45,47),f'생명의 그물 지도  /  발견 {int(stage[1:]):02}',18,MUTED,anchor='lm')
    text(d,(W/2,101),c['title'],36,bold=True)
    shot=min(2,int(t/4));local=t%4;smooth=min(1,local/.65);smooth=1-(1-smooth)**3
    nodes=c['nodes'];n=len(nodes);xs=[210+i*(540/(n-1)) for i in range(n)]
    if stage=='p06':xs=[190,480,770,480]
    for i,k in enumerate(nodes):
        if stage=='p06' and i==3:
            if shot<1:continue
            sprite(d,k,xs[i],370);text(d,(xs[i]+100,370),'대체 먹이',18,GREEN,bold=True)
            continue
        y=260+(1-smooth)*14+math.sin(t*1.5+i)*3
        active = i<=shot if n==3 else True
        d.rounded_rectangle((xs[i]-80,165,xs[i]+80,359),radius=24,fill='#edf3e1' if active else '#f3f3e9',outline=GREEN if active else '#dce4d1',width=3 if active else 1)
        sprite(d,k,xs[i],y,t)
        text(d,(xs[i],329),labels[k],24,bold=True)
    if stage in ['p05','p06']:
        for i in range((2 if stage=='p06' else n-1)):arrow(d,(xs[i]+85,256),(xs[i+1]-85,256),t,on=not(stage=='p06' and shot>=1))
        if stage=='p06' and shot>=1:
            d.line((xs[1]-30,200,xs[1]+30,290),fill='#a2624e',width=7)
            if shot>=2:
                arrow(d,(xs[0]+20,355),(xs[3]-60,370),t)
                arrow(d,(xs[3]+60,370),(xs[2]-20,355),t)
    elif stage=='p04' and shot==1:
        d.line((xs[2]-45,200,xs[2]+45,291),fill='#a2624e',width=7)
        for q in range(5):d.ellipse((xs[2]-38+q*18,375, xs[2]-26+q*18,382),fill='#a99360')
    elif stage=='p07':
        for i in range(n-1):arrow(d,(xs[i]+85,256),(xs[i+1]-85,256),t)
    elif stage=='p08':
        text(d,(W/2,386),['대책 없이 지내기','오염원 줄이기 + 서식처 보호','두 조건에서 전후 비교'][shot],22,GREEN,bold=True)
    # One idea at a time; line breaks wrap by words, never shrink the type.
    caption=c['lines'][shot];words=caption.split();lines=['']
    for word in words:
        test=(lines[-1]+' '+word).strip()
        if d.textlength(test,font=fonts[30,True])>840:lines.append(word)
        else:lines[-1]=test
    yy=437 if len(lines)==1 else 422
    for line in lines:text(d,(W/2,yy),line,30,bold=True);yy+=43
    for i in range(3):d.rounded_rectangle((360+i*85,500,425+i*85,505),radius=2,fill=GREEN if i==shot else '#dce5cf')
    return im

for stage,c in concepts.items():
    if len(sys.argv)>1 and stage not in sys.argv[1:]:continue
    poster=frame(stage,c,2.5);poster.save(OUT/f'{stage}.jpg',quality=90)
    vtt='WEBVTT\n\n'+''.join(f'00:00:{i*4:02}.000 --> 00:00:{(i+1)*4:02}.000\n{line}\n\n' for i,line in enumerate(c['lines']))
    (OUT/f'{stage}.vtt').write_text(vtt,encoding='utf-8')
    cmd=[FFMPEG,'-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-i',str(ROOT/'assets/audio/confirmation_002.mp3'),'-filter_complex','[1:a]volume=0.25,apad=whole_dur=12[a]','-map','0:v','-map','[a]','-t',str(DURATION),'-c:a','aac','-b:a','64k','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/f'{stage}.mp4')]
    p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    for f in range(FPS*DURATION):p.stdin.write(frame(stage,c,f/FPS).tobytes())
    p.stdin.close()
    if p.wait():raise RuntimeError(f'Encoding failed: {stage}')
    print(f'{stage}: {DURATION}s / {(OUT/f"{stage}.mp4").stat().st_size//1024} KiB',flush=True)
