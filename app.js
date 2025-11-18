// Movie Hub — GiftedTech-only player
// Save as app.js alongside index.html and style.css

const resultsEl = document.getElementById('results');
const resultsCount = document.getElementById('resultsCount');
const qInput = document.getElementById('q');
const loadBtn = document.getElementById('loadBtn');
const exampleBtn = document.getElementById('exampleBtn');

const player = document.getElementById('player');
const playerSource = document.getElementById('playerSource');
const qualitySelect = document.getElementById('qualitySelect');
const subtitleSelect = document.getElementById('subtitleSelect');
const openSource = document.getElementById('openSource');
const downloadBtn = document.getElementById('downloadBtn');
const quickSources = document.getElementById('quickSources');
const quickSubs = document.getElementById('quickSubs');
const infoBox = document.getElementById('infoBox');

let currentSources = [];
let currentSubtitles = [];
let currentTitle = 'Movie';

// --- The exact JSON you gave — used as example when you click "Use example" ---
const exampleSourcesJSON = {
  "status": 200,
  "success": true,
  "creator": "GiftedTech",
  "results": [
    {
      "id": "1484793580861508576",
      "quality": "360p",
      "download_url": "https://movieapi.giftedtech.co.ke/api/download?url=https%3A%2F%2Fbcdnw.hakunaymatata.com%2Ftran-audio%2F20250725%2F0ebd9fa6ae58787d97af363ce74a0608.mp4%3Fsign%3D1a378fca2e5ae9b62e77818280e84ba8%26t%3D1763467366&title=Thunderbolts*&quality=360",
      "stream_url": "https://movieapi.giftedtech.co.ke/api/stream?url=https%3A%2F%2Fbcdnw.hakunaymatata.com%2Ftran-audio%2F20250725%2F0ebd9fa6ae58787d97af363ce74a0608.mp4%3Fsign%3D1a378fca2e5ae9b62e77818280e84ba8%26t%3D1763467366",
      "size": "400082415",
      "format": "mp4"
    },
    {
      "id": "4583454842445873520",
      "quality": "480p",
      "download_url": "https://movieapi.giftedtech.co.ke/api/download?url=https%3A%2F%2Fbcdnw.hakunaymatata.com%2Ftran-audio%2F20250725%2Fce2589938e992a293bf70960a2035bc3.mp4%3Fsign%3Dfdcb48f9c4cbf4d26f4a3500ed09611d%26t%3D1763465901&title=Thunderbolts*&quality=480",
      "stream_url": "https://movieapi.giftedtech.co.ke/api/stream?url=https%3A%2F%2Fbcdnw.hakunaymatata.com%2Ftran-audio%2F20250725%2Fce2589938e992a293bf70960a2035bc3.mp4%3Fsign%3Dfdcb48f9c4cbf4d26f4a3500ed09611d%26t%3D1763465901",
      "size": "508701220",
      "format": "mp4"
    },
    {
      "id": "464332441076089200",
      "quality": "1080p",
      "download_url": "https://movieapi.giftedtech.co.ke/api/download?url=https%3A%2F%2Fbcdnw.hakunaymatata.com%2Ftran-audio%2F20250725%2Fd435264e3dbe10496381a6fc4ec3f4fe.mp4%3Fsign%3D40dd9a57170352f31c13a9aa85114215%26t%3D1763464594&title=Thunderbolts*&quality=1080",
      "stream_url": "https://movieapi.giftedtech.co.ke/api/stream?url=https%3A%2F%2Fbcdnw.hakunaymatata.com%2Ftran-audio%2F20250725%2Fd435264e3dbe10496381a6fc4ec3f4fe.mp4%3Fsign%3D40dd9a57170352f31c13a9aa85114215%26t%3D1763464594",
      "size": "2285709582",
      "format": "mp4"
    }
  ],
  "subtitles": [
    {
      "id": "6280731359825015200",
      "lan": "ar",
      "lanName": "اَلْعَرَبِيَّةُ",
      "url": "https://cacdn.hakunaymatata.com/subtitle/b593ff8821a0427219d13e8bc8bc0cba.srt?...",
      "size": "157872",
      "delay": 0
    },
    {
      "id": "8100185609282766288",
      "lan": "en",
      "lanName": "English",
      "url": "https://cacdn.hakunaymatata.com/subtitle/83188de99ef42261d12c9499e7774795.srt?...",
      "size": "147418",
      "delay": 0
    }
  ]
};

// helpers
function el(tag, attrs={}, children=[]){
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if(k==='class') e.className=v;
    else if(k==='html') e.innerHTML=v;
    else if(k==='text') e.textContent=v;
    else e.setAttribute(k,v);
  });
  (Array.isArray(children)?children:[children]).forEach(c=>{ if(!c) return; if(typeof c === 'string') e.appendChild(document.createTextNode(c)); else e.appendChild(c); });
  return e;
}
function bytesTo(size){
  if(!size) return '—';
  const b = parseInt(size,10);
  if(isNaN(b)) return size;
  if(b < 1024) return b + ' B';
  if(b < 1024**2) return (b/1024).toFixed(1) + ' KB';
  if(b < 1024**3) return (b/1024**2).toFixed(2) + ' MB';
  return (b/1024**3).toFixed(2) + ' GB';
}

// render
function renderResultsForSources(srcJson){
  resultsEl.innerHTML = '';
  const sources = Array.isArray(srcJson.results) ? srcJson.results : [];
  currentSources = sources.slice();
  currentSubtitles = Array.isArray(srcJson.subtitles) ? srcJson.subtitles : [];
  resultsCount.textContent = `${sources.length} qualities`;

  if(!sources.length){
    resultsEl.appendChild(el('div',{text:'No sources found in JSON'}));
    return;
  }

  sources.forEach((s, idx)=>{
    const card = el('div',{class:'card'});
    const poster = el('div',{class:'poster', html:`<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999">${s.quality}</div>`});
    const meta = el('div',{class:'meta'});
    const title = el('div',{class:'small', text:`${s.quality} • ${s.format || ''}`});
    const size = el('div',{class:'small', text:`${bytesTo(s.size)}`});
    const playBtn = el('button',{class:'btn', text:'Play'});
    playBtn.addEventListener('click', ()=> playSourceByIndex(idx));
    meta.appendChild(title); meta.appendChild(size); meta.appendChild(playBtn);
    card.appendChild(poster); card.appendChild(meta);
    resultsEl.appendChild(card);
  });

  populateQuickSources();
  populateQualitySelect();
  populateSubtitles();
  autoPlayBest();
}

function populateQuickSources(){
  quickSources.innerHTML = '';
  currentSources.forEach((s,i)=>{
    const name = s.quality || s.resolution || `src${i+1}`;
    const b = el('div',{class:'src', text:name});
    b.addEventListener('click', ()=> playSourceByIndex(i));
    quickSources.appendChild(b);
  });
}

function populateQualitySelect(){
  qualitySelect.innerHTML = '<option value="">Select quality</option>';
  currentSources.forEach(s=>{
    const stream = s.stream_url || s.download_url || s.url || s.file || '';
    const text = `${s.quality || s.resolution || 'auto'} • ${bytesTo(s.size)}`;
    const opt = document.createElement('option');
    opt.value = stream;
    opt.textContent = text;
    qualitySelect.appendChild(opt);
  });
  qualitySelect.onchange = ()=> { if(qualitySelect.value) setPlayerSource(qualitySelect.value); };
}

function populateSubtitles(){
  quickSubs.innerHTML = '';
  subtitleSelect.innerHTML = '<option value="">Subtitles (none)</option>';
  if(!currentSubtitles.length) return;
  currentSubtitles.forEach(sub=>{
    const name = sub.lanName || sub.lan || sub.label || 'sub';
    const sdiv = el('div',{class:'sub', text:name});
    sdiv.addEventListener('click', ()=> setSubtitle(sub));
    quickSubs.appendChild(sdiv);
    const opt = document.createElement('option');
    opt.value = sub.url || '';
    opt.textContent = name;
    subtitleSelect.appendChild(opt);
  });
  subtitleSelect.onchange = ()=> {
    if(!subtitleSelect.value) removeTracks();
    else addTrack(subtitleSelect.value, subtitleSelect.selectedOptions[0].text);
  };
}

function playSourceByIndex(i){
  const s = currentSources[i];
  const url = s?.stream_url || s?.download_url || s?.url || '';
  if(!url){ alert('No playable URL'); return; }
  setPlayerSource(url);
  Array.from(quickSources.children).forEach((c, idx)=> c.classList.toggle('active', idx===i));
  downloadBtn.href = (s.download_url || url);
  downloadBtn.setAttribute('download', `${currentTitle || 'movie'}.mp4`);
  openSource.onclick = ()=> { window.open(url,'_blank'); };
  qualitySelect.value = url;
}

function setPlayerSource(url){
  try{ player.pause(); }catch(e){}
  removeTracks();
  playerSource.src = url;
  player.load();
  player.play().catch(()=>{ /* autoplay may be blocked */ });
  openSource.href = url;
  downloadBtn.href = url;
}

function addTrack(url, label){
  removeTracks();
  if(!url) return;
  const track = document.createElement('track');
  track.kind = 'subtitles';
  track.label = label || 'sub';
  track.src = url;
  track.default = true;
  player.appendChild(track);
  setTimeout(()=> {
    const t = player.querySelector('track');
    try { t.mode = 'showing'; } catch(e){}
  }, 300);
}
function removeTracks(){ const tracks = player.querySelectorAll('track'); tracks.forEach(t=>t.remove()); }
function setSubtitle(sub){
  const url = sub.url || sub.file || '';
  const name = sub.lanName || sub.lan || sub.label || '';
  const used = Array.from(player.querySelectorAll('track')).some(t => t.src === url);
  if(used) removeTracks(); else addTrack(url, name);
  Array.from(quickSubs.children).forEach(c => c.classList.toggle('active', c.textContent === name));
}

function autoPlayBest(){
  if(!currentSources.length) return;
  const sorted = currentSources.slice().sort((a,b)=>{
    const aa = parseInt((a.quality||a.resolution||'').replace(/\D/g,'')) || 0;
    const bb = parseInt((b.quality||b.resolution||'').replace(/\D/g,'')) || 0;
    return bb - aa;
  });
  const best = sorted[0];
  if(best){
    const url = best.stream_url || best.download_url || best.url || '';
    if(url) setPlayerSource(url);
    const idx = currentSources.indexOf(best);
    Array.from(quickSources.children).forEach((c, i)=> c.classList.toggle('active', i===idx));
  }
}

// HANDLE INPUT (URL or JSON)
async function handleLoadInput(raw){
  if(!raw || !raw.trim()){ alert('Paste the sources JSON or a full sources URL and click Load.'); return; }

  // Try JSON parse
  try{
    const parsed = JSON.parse(raw);
    if(parsed && (parsed.results || parsed.subtitles)){
      currentTitle = parsed.title || parsed.movieTitle || currentTitle;
      setInfoFromSources(parsed);
      renderResultsForSources(parsed);
      return;
    }
  }catch(e){ /* not JSON - continue */ }

  // Normalize URL input
  let url = raw.trim();
  if(/^[0-9]{12,20}$/.test(url)){ url = `https://movieapi.giftedtech.co.ke/api/sources/${url}`; }
  if(url.startsWith('/api/')){ url = `https://movieapi.giftedtech.co.ke${url}`; }

  // Fetch
  try{
    resultsEl.innerHTML = '<div class="small">Loading...</div>';
    const res = await fetch(url);
    if(!res.ok) throw new Error('Fetch failed: ' + res.status + ' ' + res.statusText);
    const data = await res.json();
    if(!(data && (data.results || data.subtitles))){
      resultsEl.innerHTML = '<div class="small">No sources structure found in response.</div>';
      console.warn('Response:', data);
      return;
    }
    currentTitle = data.title || data.movieTitle || currentTitle;
    setInfoFromSources(data);
    renderResultsForSources(data);
  }catch(err){
    console.error(err);
    resultsEl.innerHTML = '<div class="small">Error loading URL — open console for details.</div>';
    alert('Error loading the URL. See console for details.');
  }
}

function setInfoFromSources(srcJson){
  currentTitle = srcJson.title || srcJson.movieTitle || currentTitle;
  infoBox.innerHTML = '';
  const titleEl = el('h3',{text: currentTitle});
  const meta = el('p',{html:`<strong>Status:</strong> ${srcJson.status || ''} • <strong>Creator:</strong> ${srcJson.creator || ''}`});
  const subsHint = el('p',{html:`<strong>Available subtitles:</strong> ${Array.isArray(srcJson.subtitles)? srcJson.subtitles.map(s=>s.lanName||s.lan).join(', ') : 'None'}`});
  infoBox.appendChild(titleEl); infoBox.appendChild(meta); infoBox.appendChild(subsHint);
}

// wire UI
loadBtn.addEventListener('click', ()=> handleLoadInput(qInput.value));
exampleBtn.addEventListener('click', ()=> {
  currentTitle = 'Example — Thunderbolts*';
  setInfoFromSources(exampleSourcesJSON);
  renderResultsForSources(exampleSourcesJSON);
  resultsCount.textContent = 'Example loaded';
});
document.getElementById('togglePip').addEventListener('click', async ()=>{
  try{
    if(document.pictureInPictureElement) await document.exitPictureInPicture();
    else if(player.requestPictureInPicture) await player.requestPictureInPicture();
  }catch(e){ console.warn('PIP failed', e); }
});
qInput.addEventListener('keydown', (e)=> { if(e.key==='Enter'){ loadBtn.click(); } });

// Auto-load example on first open (optional)
// renderResultsForSources(exampleSourcesJSON);