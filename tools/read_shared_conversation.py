from pathlib import Path
from functools import lru_cache
import json
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'references'/'shared-conversation'
html = (OUT/'shared-page.html').read_text(encoding='utf-8')
script = next(s for s in re.findall(r'<script\b[^>]*>(.*?)</script>',html,re.S)
              if 'streamController.enqueue' in s and len(s)>10000)
payload,_=json.JSONDecoder().raw_decode(script.split('enqueue(',1)[1])
table=json.loads(payload)

@lru_cache(None)
def resolve(index):
    if index < 0:
        return None
    item=table[index]
    if isinstance(item,dict):
        return {resolve(int(k[1:])) if k.startswith('_') and k[1:].isdigit() else k:
                resolve(v) if isinstance(v,int) else v for k,v in item.items()}
    if isinstance(item,list):
        return [resolve(v) if isinstance(v,int) else v for v in item]
    return item

def field_index(index,name):
    return next(v for k,v in table[index].items() if table[int(k[1:])]==name)

loader=field_index(0,'loaderData')
route=field_index(loader,'routes/share.$shareId.($action)')
response=field_index(route,'serverResponse')
conversation=field_index(response,'data')
data={name:resolve(field_index(conversation,name)) for name in ('title','linear_conversation')}
nodes=data['linear_conversation']
messages=[]
for node in nodes:
    message=node.get('message')
    if message:
        messages.append(message)
messages.sort(key=lambda m:m.get('create_time') or 0)
public=[]
for msg in messages:
    role=msg.get('author',{}).get('role')
    channel=msg.get('channel')
    if role not in ('user','assistant') or channel not in (None,'final'):
        continue
    content=msg.get('content',{})
    metadata=msg.get('metadata',{})
    if content.get('content_type') not in ('text','multimodal_text'):
        continue
    if metadata.get('is_visually_hidden_from_conversation') or metadata.get('is_redacted'):
        continue
    if not any(content.get('parts',[])) and not metadata.get('attachments'):
        continue
    if content.get('parts') in (['Original custom instructions no longer available'],['The output of this plugin was redacted.']):
        continue
    public.append(msg)
clean=[{'id':m['id'],'author':{'role':m['author']['role']},'create_time':m.get('create_time'),
        'content':m['content'],'attachments':m.get('metadata',{}).get('attachments',[])} for m in public]
(OUT/'messages.json').write_text(json.dumps(clean,ensure_ascii=False,indent=2),encoding='utf-8')
lines=['# '+data['title'],'','Source: https://chatgpt.com/share/6acf7b4b-da08-83ee-8385-78b2668101ca','']
index=[]
for i,msg in enumerate(public,1):
    content=msg.get('content',{})
    texts=[]
    for part in content.get('parts',[]):
        if isinstance(part,str):texts.append(part)
        elif isinstance(part,dict):
            if part.get('text'):texts.append(part['text'])
            if part.get('asset_pointer'):texts.append('[Image: '+part['asset_pointer']+']')
    text='\n\n'.join(texts)
    attachments=msg.get('metadata',{}).get('attachments',[])
    if attachments:
        text+='\n\n첨부 목록: '+', '.join(a.get('name','unnamed') for a in attachments)
    lines.extend([f"## {i:03d} {msg['author']['role']} {msg['id']}",'',text,''])
    index.append({'n':i,'role':msg['author']['role'],'id':msg['id'],'chars':len(text),
                  'content_type':content.get('content_type'),'preview':text[:220]})
(OUT/'transcript.md').write_text('\n'.join(lines),encoding='utf-8')
(OUT/'message-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'title':data['title'],'all_messages':len(messages),'public_messages':len(public),
                 'user_messages':sum(m['author']['role']=='user' for m in public)},ensure_ascii=False))
for item in index:
    if item['role']=='user': print(json.dumps(item,ensure_ascii=False))
