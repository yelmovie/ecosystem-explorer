from pathlib import Path
import hashlib
import json
import zipfile
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'references' / 'contact-sheets'
OUT.mkdir(parents=True, exist_ok=True)
unpacked = ROOT / 'references' / 'extracted' / 'sample-pages-v2'
unpacked.mkdir(parents=True, exist_ok=True)
archive = next((ROOT / 'references' / 'archives').glob('*.zip'))
with zipfile.ZipFile(archive) as z:
    for entry in z.infolist():
        target = (unpacked / entry.filename).resolve()
        if not target.is_relative_to(unpacked.resolve()):
            raise ValueError(f'Unsafe archive path: {entry.filename}')
        if entry.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            data = z.read(entry)
            if target.exists() and target.read_bytes() != data:
                raise ValueError(f'Conflicting existing file: {target}')
            target.write_bytes(data)

font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 22)
inventory = []
source_paths = sorted((ROOT / 'assets').rglob('*.png'))
for folder in ('ui-exploration','ui-pages','sample-pages-v2'):
    source_paths.extend(sorted((ROOT/'references'/folder).glob('*.png')))
for p in source_paths:
    with Image.open(p) as im:
        inventory.append({'path':p.relative_to(ROOT).as_posix(), 'width':im.width, 'height':im.height,
                          'mode':im.mode, 'bytes':p.stat().st_size,
                          'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})

groups = [('samples', sorted(unpacked.glob('*.png')), 2, 640, 440)]
generated = sorted((p for p in source_paths if p.name.startswith('chatgpt_generated_')),key=lambda p:p.name)
for start in range(0, len(generated), 10):
    groups.append((f'assets-{start+1:02d}-{min(start+10,len(generated)):02d}', generated[start:start+10], 2, 640, 440))
for name, paths, cols, cw, ch in groups:
    sheet = Image.new('RGB',(cols*cw, ((len(paths)+cols-1)//cols)*ch),(235,238,240))
    draw = ImageDraw.Draw(sheet)
    for i,p in enumerate(paths):
        x,y=(i%cols)*cw,(i//cols)*ch
        with Image.open(p) as im:
            im = im.convert('RGB')
            im.thumbnail((cw-16,ch-48))
            sheet.paste(im,(x+(cw-im.width)//2,y+36+(ch-48-im.height)//2))
        draw.text((x+10,y+5),p.name,font=font,fill=(25,35,40))
    sheet.save(OUT / f'{name}.jpg',quality=92)
duplicates=[]
for p in sorted(unpacked.glob('*.png')):
    original=ROOT/'references'/'sample-pages-v2'/('sample_v2_'+p.name)
    duplicates.append({'archive_file':p.relative_to(ROOT).as_posix(),'existing_file':original.relative_to(ROOT).as_posix(),
                       'identical':original.exists() and p.read_bytes()==original.read_bytes()})
(ROOT/'references'/'asset-inventory.json').write_text(json.dumps({'images':inventory,'archive_duplicates':duplicates},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'images':len(inventory),'extracted':len(duplicates),'identical_copies':sum(d['identical'] for d in duplicates),
                  'contact_sheets':[str(OUT/(g[0]+'.jpg')) for g in groups]},ensure_ascii=False))
