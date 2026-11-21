const C="harga-iphone-v1";
const CORE=["./","./index.html"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:"reload"})))));
  self.skipWaiting();
});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);
  // Data Google Sheet dan gambar dari repo Cek iPhone tidak dilewatkan ke sini; harga offline disimpan di localStorage oleh halaman
  if(url.origin!==location.origin)return;
  // Halaman: internet dulu (versi terbaru), salinan offline kalau tidak ada sinyal / lebih dari 4 detik
  const fallback=()=>caches.match(req,{ignoreSearch:true}).then(h=>h||caches.match("./index.html"));
  e.respondWith(new Promise(resolve=>{
    let done=false;const finish=r=>{if(!done&&r){done=true;resolve(r)}};
    const t=setTimeout(()=>fallback().then(finish),4000);
    fetch(req.url,{cache:"no-cache",credentials:"same-origin"}).then(r=>{
      clearTimeout(t);
      if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(req.url.split("?")[0],cp))}
      finish(r);
    }).catch(()=>{clearTimeout(t);fallback().then(h=>{finish(h||Response.error())})});
  }));
});
