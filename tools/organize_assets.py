from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
if (ROOT/'references'/'file-moves.json').exists():
    raise SystemExit('Already organized; preserving the original move log.')
manifest_path = ROOT / 'references' / 'asset-inventory.json'
inventory = json.loads(manifest_path.read_text(encoding='utf-8'))
moves = []
for item in inventory['images']:
    src = ROOT / item['path']
    if src.name.startswith('sample_v2_'):
        folder = 'references/sample-pages-v2'
    else:
        number = int(src.stem.rsplit('_',1)[1])
        folder = ('references/ui-exploration' if number <= 15 else
                  'references/ui-pages' if number <= 25 else
                  'assets/backgrounds/originals' if number <= 35 else
                  'assets/branding/originals' if number <= 39 else
                  'assets/characters/originals')
    dst = ROOT / folder / src.name
    moves.append((src,dst,item))
for src in (ROOT/'files').glob('*.zip'):
    moves.append((src,ROOT/'references'/'archives'/src.name,None))

for src,dst,item in moves:
    for path in (src,dst):
        if not path.resolve().is_relative_to(ROOT.resolve()):
            raise ValueError(f'Path outside project: {path}')
    if dst.exists() and src.resolve()!=dst.resolve():
        raise ValueError(f'Destination already exists: {dst}')
    if not src.is_file():
        raise ValueError(f'Missing source: {src}')

log=[]
for src,dst,item in moves:
    before=hashlib.sha256(src.read_bytes()).hexdigest()
    dst.parent.mkdir(parents=True,exist_ok=True)
    if src.resolve()!=dst.resolve():
        src.rename(dst)
    after=hashlib.sha256(dst.read_bytes()).hexdigest()
    if before!=after:
        raise ValueError(f'Integrity mismatch: {dst}')
    log.append({'from':src.relative_to(ROOT).as_posix(),'to':dst.relative_to(ROOT).as_posix(),'sha256':after})
    if item is not None:
        item['original_path']=item.get('original_path',item['path'])
        item['path']=dst.relative_to(ROOT).as_posix()
for entry in inventory['archive_duplicates']:
    entry['existing_file']='references/sample-pages-v2/'+Path(entry['existing_file']).name
manifest_path.write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'references'/'file-moves.json').write_text(json.dumps(log,ensure_ascii=False,indent=2),encoding='utf-8')
for folder in ('image','files'):
    path=ROOT/folder
    if path.exists() and not any(path.iterdir()):
        path.rmdir()
print(json.dumps({'files_organized':len(log),'all_hashes_preserved':True},ensure_ascii=False))
