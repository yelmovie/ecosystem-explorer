// Offline cache for classroom Wi-Fi drops (same scheme as 11 sound). scripts/build.mjs rewrites CACHE_VERSION and APP_SHELL in dist/sw.js.
const CACHE_VERSION='dev';
const CACHE=`life-web-map-${CACHE_VERSION}`;
const APP_SHELL=['/','/index.html'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
// A new deploy gets a new CACHE_VERSION; every older life-web-map cache is removed here.
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('life-web-map-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
const remember=(event,response)=>{if(response.ok&&response.status===200&&response.type==='basic'){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{}));}return response;};
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  // Concept films and the map finale stream with range requests through the media worker; partial 206 responses cannot use cache.put.
  if(request.headers.has('range')||request.destination==='video'||/\.mp4$/.test(url.pathname))return;
  // HTML: network first so a new deploy shows up, cache when offline.
  if(request.mode==='navigate'||request.destination==='document'){
    event.respondWith(fetch(request).then(response=>remember(event,response)).catch(()=>caches.match(request,{ignoreSearch:true}).then(hit=>hit||caches.match('/index.html'))));
    return;
  }
  // App code: network first, so a reload always picks up a new deploy. The cache is only the offline fallback.
  if(request.destination==='script'||request.destination==='style'||/\.(js|mjs|css|json)$/.test(url.pathname)){
    event.respondWith(fetch(request,{cache:'no-cache'}).then(response=>remember(event,response)).catch(()=>caches.match(request)));
    return;
  }
  // Pictures, sounds and fonts: cache first. A new CACHE_VERSION replaces the whole cache.
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>remember(event,response))));
});
