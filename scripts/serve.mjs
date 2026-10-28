import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.cwd(), process.argv[2] || '.');
const port = Number(process.env.PORT || 4184);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp':'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp4':'video/mp4', '.mp3':'audio/mpeg', '.jpg':'image/jpeg', '.vtt':'text/vtt; charset=utf-8' };
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const file = resolve(root, `.${decodeURIComponent(url.pathname) === '/' ? '/index.html' : decodeURIComponent(url.pathname)}`);
    if (!(file === root || file.startsWith(root + sep)) || /(?:^|[\\/])\./.test(file.slice(root.length))) { res.writeHead(403).end(); return; }
    const info=await stat(file);
    if (!info.isFile()) throw new Error('missing');
    const headers={ 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges':'bytes' };
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      const start=match?(match[1]?Number(match[1]):Math.max(0,info.size-Number(match[2]))):NaN;
      const end=match?(match[1]&&match[2]?Math.min(Number(match[2]),info.size-1):info.size-1):NaN;
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
      res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${info.size}`});
      if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);
    }else{
      res.writeHead(200,{...headers,'Content-Length':info.size});
      if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
    }
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('파일을 찾을 수 없어.'); }
}).listen(port, '127.0.0.1', () => console.log(`Life Web Map: http://127.0.0.1:${port} · ${root}`));
