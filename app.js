/* Movie Hub — GiftedTech-only player
   Place index.html, style.css, app.js in same folder and open index.html
*/

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
let currentTitle = 'movie';

/* Example JSON (useful if you paste nothing) */
const exampleSourcesJSON = {
  "status": 200,
  "success": true,
  "creator": "GiftedTech",
  "results": [
    {
      "id": "1484793580861508576",
      "quality": "360p",
      "download_url": "https://movieapi.giftedtech.co.ke/api/download?url=...360",
      "stream_url": "https://movieapi.giftedtech.co.ke/api/stream?url=...360",
      "size": "400082415",
      "format": "mp4"
    },
    {
      "id": "4583454842445873520",
      "quality": "480p",
      "download_url": "https://movieapi.giftedtech.co.ke/api/download?url=...480",
      "stream_url": "https://movieapi.giftedtech.co.ke/api/stream?url=...480",
      "size": "508701220",
      "format": "mp4"
    },
    {
      "id": "464332441076089200",
      "quality": "1080p",
      "download_url": "https://movieapi.giftedtech.co.ke/api/download?url=...1080",
      "stream_url": "https://movieapi.giftedtech.co.ke/api/stream?url=...1080",
      "size": "2285709582",
      "format": "mp4"
    }
  ],
  "subtitles": [
    { "id":"1", "lan":"en", "lanName":"English", "url":"https://cacdn...english.srt" },
    { "id":"2", "lan":"ar", "lanName":"اَلْعَرَبِيَّةُ", "url":"https://cacdn...arabic.srt" }
  ]
};

/* small helpers */
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

/* render sources as cards (one card per quality) */
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
    // assemble
    card.appendChild(poster);
    card.appendChild(meta);
    resultsEl.appendChild(card);
  });

  populateQuickSources();
  populateQualitySelect();
  populateSubtitles();
  // auto-play best quality (choose highest numeric quality)
  autoPlayBest();
}

/* populate quick source buttons */
function populateQuickSources(){
  quickSources.innerHTML = '';
  currentSources.forEach((s, i)=>{
    const name = s.quality || s.resolution || `src${i+1}`;
    const b = el('div',{class:'src', text:name});
    b.addEventListener('click', ()=> playSourceByIndex(i));
    quickSources.appendChild(b);
  });
}

/* populate quality select */
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

  qualitySelect.onchange = ()=> {
    if(qualitySelect.value) setPlayerSource(qualitySelect.value);
  };
}

/* populate subtitles list and select */
function populateSubtitles(){
  quickSubs.innerHTML = '';
  subtitleSelect.innerHTML = '<option value="">Subtitles (none)</option>';
  if(!currentSubtitles || !currentSubtitles.length) return;

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

/* play by index */
function playSourceByIndex(i){
  const s = currentSources[i];
  const url = s?.stream_url || s?.download_url || s?.url || '';
  if(!url){ alert('No playable URL for this source'); return; }
  setPlayerSource(url);
  // highlight active quick source button
  Array.from(quickSources.children).forEach((c, idx)=> c.classList.toggle('active', idx===i));
  downloadBtn.href = (s.download_url || url);
  downloadBtn.setAttribute('download', `${currentTitle || 'movie'}.mp4`);
  openSource.onclick = ()=> { window.open(url,'_blank'); };
  qualitySelect.value = url;
}

/* set player source and play */
function setPlayerSource(url){
  try{
    player.pause();
  }catch(e){}
  removeTracks();
  playerSource.src = url;
  player.load();
  player.play().catch(()=>{/* autoplay blocked fallback */});
  openSource.href = url;
  downloadBtn.href = url;
}

/* subtitle helpers */
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
function removeTracks(){
  const tracks = player.querySelectorAll('track');
  tracks.forEach(t=>t.remove());
}
function setSubtitle(sub){
  const url = sub.url || sub.file || '';
  const name = sub.lanName || sub.lan || sub.label || '';
  const used = Array.from(player.querySelectorAll('track')).some(t => t.src === url);
  if(used) removeTracks();
  else addTrack(url, name);
  Array.from(quickSubs.children).forEach(c => c.classList.toggle('active', c.textContent === name));
}

/* choose best quality to autoplay (highest numeric quality) */
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
    // highlight corresponding quick source (find index)
    const idx = currentSources.indexOf(best);
    Array.from(quickSources.children).forEach((c, i)=> c.classList.toggle('active', i===idx));
  }
}

/* load flow: parse input which can be:
   - raw JSON (object or string)
   - full URL to /api/sources/{id}
   - partial path starting with /api/sources/...
*/
async function handleLoadInput(raw){
  if(!raw || !raw.trim()){
    alert('Paste the sources JSON or a full sources URL and click Load (or click Example).');
    return;
  }

  // try to parse JSON first
  try{
    const maybe = JSON.parse(raw);
    if(maybe && typeof maybe === 'object' && (maybe.results || maybe.subtitles)){
      // we got sources JSON
      currentTitle = maybe.title || 'movie';
      setInfoFromSources(maybe);
      renderResultsForSources(maybe);
      return;
    }
  }catch(e){ /* not JSON, continue */ }

  // if not JSON, treat as URL/path
  let url = raw.trim();
  // if user pasted a bare id like 612791... convert to full url (common)
  if(/^[0-9]{15,20}$/.test(url)){
    url = `https://movieapi.giftedtech.co.ke/api/sources/${url}`;
  }
  // if path starts with /api, add host
  if(url.startsWith('/api/')){
    url = `https://movieapi.giftedtech.co.ke${url}`;
  }
  // now attempt fetch
  try{
    resultsEl.innerHTML = '<div class="small">Loading...</div>';
    const res = await fetch(url);
    if(!res.ok) throw new Error('Fetch failed: ' + res.status);
    const data = await res.json();
    if(!(data && (data.results || data.subtitles))){
      resultsEl.innerHTML = '<div class="small">No sources structure found in response.</div>';
      console.warn('Response:', data);
      return;
    }
    currentTitle = (data.title || data.resultsTitle || data.movieTitle || 'movie');
    setInfoFromSources(data);
    renderResultsForSources(data);
  }catch(err){
    console.error(err);
    resultsEl.innerHTML = '<div class="small">Error loading URL — check console.</div>';
    alert('Error loading the URL. Open console for details.');
  }
}

/* set info box from sources JSON */
function setInfoFromSources(srcJson){
  currentTitle = srcJson.title || srcJson.movieTitle || currentTitle || 'movie';
  infoBox.innerHTML = '';
  const titleEl = el('h3',{text: currentTitle});
  const meta = el('p',{html:`<strong>Creator:</strong> ${srcJson.creator || 'GiftedTech'} • <strong>Status:</strong> ${srcJson.status||''}`});
  const subsHint = el('p',{html:`<strong>Available subtitles:</strong> ${Array.isArray(srcJson.subtitles)? srcJson.subtitles.map(s=>s.lanName||s.lan).join(', ') : 'None'}`});
  infoBox.appendChild(titleEl);
  infoBox.appendChild(meta);
  infoBox.appendChild(subsHint);
}

/* wire UI */
loadBtn.addEventListener('click', ()=> handleLoadInput(qInput.value));
exampleBtn.addEventListener('click', ()=> {
  // use the example JSON provided above
  setInfoFromSources(exampleSourcesJSON);
  renderResultsForSources(exampleSourcesJSON);
  resultsCount.textContent = 'Example loaded';
});

/* pip toggle */
document.getElementById('togglePip').addEventListener('click', async ()=>{
  try{
    if(document.pictureInPictureElement){
      await document.exitPictureInPicture();
    } else {
      if(player.requestPictureInPicture) await player.requestPictureInPicture();
    }
  }catch(e){ console.warn('PIP failed', e); }
});

/* keyboard Enter on input */
qInput.addEventListener('keydown', (e)=> { if(e.key==='Enter'){ loadBtn.click(); } });

/* Optional: If you later have a movie-list endpoint, uncomment and set LIST_URL
   then call fetchMovieList() to populate left column with posters and ids.
*/
// const LIST_URL = 'https://movieapi.giftedtech.co.ke/api/movies'; // example
// async function fetchMovieList(){
//   const r = await fetch(LIST_URL);
//   const j = await r.json();
//   // expect j.results = [{ id: "...", title: "...", thumbnail: "..." }, ...]
//   // render them and click should call handleLoadInput('https://movieapi.../api/sources/{id}')
//}