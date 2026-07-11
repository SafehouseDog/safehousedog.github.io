(() => {
  'use strict';
  const D = window.WDR_DATA;
  const t = (key, vars) => window.lshT ? window.lshT(key, vars) : key;
  const lang = () => window.LSH_LANG || 'en';
  const $ = id => document.getElementById(id);
  const els = {
    root:$('terminalRoot'), radioState:$('radioState'), headerStatus:$('headerStatus'), liveDot:$('liveDot'), tune:$('tuneButton'),
    prev:$('prevTrack'), play:$('playPause'), next:$('nextTrack'), audio:$('audio'), trackTitle:$('trackTitle'), trackMeta:$('trackMeta'), trackKoan:$('trackKoan'), seek:$('seek'), time:$('time'),
    ticker:$('tickerTrack'), tickerViewport:$('tickerViewport'), rail:$('matrixRail'), matrixShell:$('matrixShell'), inspectNode:$('inspectNode'), inspectRead:$('inspectRead'), sync:$('syncText'),
    unlockTitle:$('unlockTitle'), unlockText:$('unlockText'), keyValue:$('keyValue'), stageTwo:$('stageTwo'), keySlots:$('keySlots'), routeHint:$('routeHint'), routeTape:$('routeTape'),
    routeActions:$('routeActions'), openLedger:$('openLedger'), requestLab:$('requestLab'), fundText:$('fundText'), fundBar:$('fundBar'), topFund:$('topFund'), walletTon:$('walletTon'), walletUsdtTon:$('walletUsdtTon'), walletTrc:$('walletTrc'), walletBep:$('walletBep'),
    toast:$('toast'), traceReveal:$('traceReveal'), traceReceipt:$('traceReceipt'), traceGrid:document.querySelectorAll('.traceGrid span'), watcher:$('watcher'), watcherMark:$('watcherMark'), watcherKoan:$('watcherKoan'), shipReveal:$('shipReveal'), shipSquares:$('shipSquares'), volDial:$('volDial'), lowDial:$('lowDial'), midDial:$('midDial'), highDial:$('highDial'), qrModal:$('qrModal'), qrClose:$('qrClose'), qrRouteImage:$('qrRouteImage'), qrRouteLabel:$('qrRouteLabel'), qrRouteWarning:$('qrRouteWarning'),
    solverCount:$('solverCount'), donationCount:$('donationCount'), combinedCount:$('combinedCount'), counterStatus:$('counterStatus'), completionReceipt:$('completionReceipt'), turnstileMount:$('turnstileMount'), terminalBeacon:$('terminalBeacon'), globalGateStatus:$('globalGateStatus'), communityProgress:$('communityProgress')
  };

  const nodesById = new Map(D.nodes.map(n => [n.id, n]));
  const slots = D.nodes.slice().sort((a,b) => a.x - b.x);
  const SLOT_XS = slots.map(n => n.x / 259 * 100);
  const TARGET_STATE = slots.map(n => `${n.id}:0`).join('|');

  let state = D.quest.initialOrder.map(id => ({ id, rot: D.quest.initialRotation[id] || D.quest.initialRotation[String(id)] || 0 }));
  let started = false;
  let userPaused = false;
  let currentTrack = -1;
  let solved1 = false;
  let keyTraceActive = false;
  let keyIndex = 0;
  let keyHits = [];
  let selectedIndex = null;
  let drag = null;
  let fallbackTimer = null;
  let fallbackT = 0;
  let fallbackAudioCtx = null;
  let fallbackOsc = null;
  let fallbackGain = null;
  let tickerHold = false;
  let lastTickerT = -1;
  let currentCues = [];
  let displayCues = [];
  let currentCueIndex = -2;
  let tickerLineReady = false;
  const seenTrace = new Set();
  let rafStarted = false;
  let bypassArmed = false;
  let terminalActive = false;
  let terminalBuffer = '';
  let terminalLastInputAt = 0;
  let terminalResponse = '';
  let terminalResponseUntil = 0;
  let oracleData = null;
  let oraclePromise = null;
  let auditState = null;
  let auditPromptShown = false;
  let auditReceipt = '';
  let auditStateEnteredAt = 0;
  let auditWrongAnswers = 0;
  let auditSilenceUntil = 0;
  let auditWaterNudged = false;
  let auditStartedByAuto = false;
  let terminalEverUsed = false;
  let audioCtx = null;
  let mediaSource = null;
  let masterGain = null;
  let lowFilter = null;
  let midFilter = null;
  let highFilter = null;
  let watcherTypeTimer = null;
  let lyricScale = 1;
  let lyricOffset = 0;
  let lyricEndRaw = 0;
  let secretTrackUnlocked = false;
  let seekDragging = false;
  let pendingSeekPct = null;
  let matrixMoveCount = 0;
  let activeListenSeconds = 0;
  let lastTickerWallTime = performance.now();
  let completionChallenge = null;
  let completionSubmitting = false;
  let turnstileWidgetId = null;
  let turnstileToken = '';
  let progressPoll = null;
  let progressState = {
    completions: Number(D.site?.progress?.fallback?.completions || 0),
    donationCredits: Number(D.site?.progress?.fallback?.donationCredits || 0),
    combined: 0,
    target: Number(D.site?.progress?.target || 1999),
    unlocked: Boolean(D.site?.progress?.fallback?.unlocked),
    online: false
  };
  const isLocalDev = ['localhost','127.0.0.1',''].includes(location.hostname) || location.protocol === 'file:';
  const BYPASS_SALT = ['wdr','v17','field'].join(':');
  const BYPASS_HASHES = new Set([
    '828b78a48a0eb53ade92026e678ac3e484e5416b91050a20c580c94caff74c26',
    '34745daa705d845f4d1b450b5323cd5f0eb624cb5dc746ad65742641e15abb7c'
  ]);

  const ORACLE_PASSPHRASE = ['last','safe','house','oracle','v1'].join(':');

  const TRACK_KOANS = {
    '01': ['Not a station.', 'A bruise in memory.', 'Orders belong to number stations.', 'Here, anomalies learn to breathe.'],
    '02': ['A room before entry.', 'Three seconds holding an empire.', 'The door still wearing the face of a wall.', 'Earlier is deeper.'],
    '03': ['Fatigue kept the password.', 'Convenience predicted the next gesture.', 'The wall was not hidden.', 'The eye had been trained away.'],
    '04': ['Checksum is not an angel.', 'Gold makes the seeker become the map.', 'The seed may be weather.', 'The rule survives the treasure.'],
    '05': ['The gate repeats the watcher.', 'Permission echoes before the knock.', 'A mirror can refuse to be a door.'],
    '06': ['Not rabbit.', 'A path with feathers.', 'The compass nested in the folder.', 'The screen was only the decoy.'],
    '07': ['A letter falls from meaning into float.', 'Coordinates tighten the throat of the sign.', 'The glyph keeps the scar.', 'The message was plotted.'],
    '08': ['No screenshot is a source.', 'A rumor becomes evidence only after the chain holds.', 'Speech still needs a witness.'],
    '09': ['Same rain.', 'Different line.', 'The quietest place learned to shout.', 'Motive unknown. Diff confirmed.'],
    '10': ['One bit asks age.', 'The database asks the soul.', 'A checkpoint remembers more than it needs.', 'Safety should not become a file.'],
    '11': ['Not what is written.', 'How it falls.', 'A frame can carry a wound.', 'Timing is another alphabet.'],
    '12': ['The request wore a badge.', 'The copy found a buyer.', 'Too much data becomes weather.', 'The archive outlives the excuse.'],
    '13': ['The new eye has no pupil.', 'It reads without a face.', 'A metric can build a cage.', 'The machine needs no malice.'],
    '14': ['No second deck.', 'No alternative net.', 'Privacy is maintenance.', 'What cannot be escaped must be repaired.'],
    '15_FINAL': ['The key was not what was known.', 'The key was how the looking changed.', 'Attention opens the cabinet.', 'Awareness opens the archive.'],
    '15': ['The key was not what was known.', 'The key was how the looking changed.', 'Attention opens the cabinet.', 'Awareness opens the archive.']
  };

  const WATCHER_KOANS = [
    'Do not trust the dog. Check the file.',
    'A witness mark is not a witness.',
    'A gift buys no truth. It moves the next wall for everyone.',
    'Never route by screenshot. Verify the address in the ledger.',
    'USDT is not a prayer. Check the chain before the send.',
    'Patch one leak before you fund the next room.',
    'If there are no lifeboats, every receipt becomes maintenance.'
  ];

  const SIGNAL_GHOSTS = [
    ':: signal gap :: verify the seam',
    '[ static ] a pause is still part of the message',
    '// trace follows attention //',
    '< noise > type if you need the field to answer',
    'checksum holds / motive drifts',
    'the quiet line is still alive',
    '... carrier breathing ...'
  ];

  const TRACK_WHISPERS = {
    '01': ['Not radio. A bruise in memory.', 'The file waits for the better eye.', 'Anomalies are learning to breathe.', 'Verify the scar before the story.'],
    '02': ['The room appears before entry.', 'Three seconds can hide an empire.', 'The door is still pretending to be a wall.', 'Earlier is deeper.'],
    '03': ['Convenience rehearsed the next gesture.', 'The eye was trained away from the seam.', 'Fatigue kept the password.', 'The wall was never hiding.'],
    '04': ['Checksum is not an angel.', 'Gold makes the seeker become the map.', 'The seed may be weather.', 'Treasure is the decoy; rule is the engine.'],
    '05': ['The gate repeats the watcher.', 'Permission arrives before the knock.', 'A mirror may refuse to become a door.', 'The checkpoint remembers too much.'],
    '06': ['Not rabbit. A path with feathers.', 'The compass nested in the folder.', 'The screen was the decoy.', 'Follow the trace, not the mascot.'],
    '07': ['A letter drifts from meaning into float.', 'Coordinates tighten the throat of the sign.', 'The glyph keeps the scar.', 'The message was plotted before it was heard.'],
    '08': ['A screenshot is never a source.', 'Rumor becomes evidence only when the chain holds.', 'Speech still needs a witness.', 'Trust is a route that must be verified.'],
    '09': ['Same rain. Different line.', 'The quietest place learned to shout.', 'Motive unknown. Diff confirmed.', 'A small edit can open a second weather.'],
    '10': ['One bit asks age; another asks the soul.', 'A checkpoint remembers more than it needs.', 'Safety should not become a file.', 'The database is learning your face.'],
    '11': ['Not what is written. How it falls.', 'A frame can carry a wound.', 'Timing is another alphabet.', 'The drop pattern tells on the hand.'],
    '12': ['The request wore a badge.', 'The copy found a buyer.', 'Too much data becomes weather.', 'An excuse can outlive the witness.'],
    '13': ['The new eye has no pupil.', 'It reads without a face.', 'A metric can become a cage.', 'The machine needs no malice to measure too much.'],
    '14': ['No second deck. No alternate net.', 'Privacy is maintenance.', 'What cannot be escaped must be repaired.', 'Every leak is already inside the hull.'],
    '15': ['The key was not what was known.', 'The key was how the looking changed.', 'Attention opens the cabinet.', 'Awareness opens the archive.'],
    '15_FINAL': ['The key was not what was known.', 'The key was how the looking changed.', 'Attention opens the cabinet.', 'Awareness opens the archive.']
  };

  const pad = n => String(Math.max(0, Math.floor(n))).padStart(2, '0');
  const fmt = t => `${pad(t / 60)}:${pad(t % 60)}`;
  const norm = (rot, len) => ((rot % len) + len) % len;
  const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const cleanText = s => String(s || '').replace(/\s*\/\s*/g, '   ').replace(/\s+/g, ' ').trim();
  const localizedContent = (group, id, fallback) => {
    if(lang() !== 'ru') return fallback;
    const value = window.LSH_CONTENT?.ru?.[group]?.[id];
    return value == null ? fallback : value;
  };
  const localizedLiteralCue = (trackId, cueIndex, fallback) => {
    if(lang() !== 'ru') return fallback;
    return window.LSH_CONTENT?.ru?.lyrics?.[trackId]?.[cueIndex] || fallback;
  };
  const stateString = () => state.map(s => `${s.id}:${norm(s.rot, nodesById.get(s.id).glyphs.length)}`).join('|');
  const solvedStateString = () => TARGET_STATE;

  function toast(msg){
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    window.setTimeout(() => els.toast.classList.remove('show'), 1300);
  }

  function rotateArray(a, r){
    if(!a.length) return a;
    r = norm(r, a.length);
    return a.slice(r).concat(a.slice(0, r));
  }

  async function sha256Hex(msg){
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return sha256Fallback(msg);
  }

  function sha256Fallback(ascii){
    function rightRotate(value, amount){ return (value >>> amount) | (value << (32 - amount)); }
    let mathPow = Math.pow, maxWord = mathPow(2, 32), i, j, result = '';
    let words = [], asciiBitLength = ascii.length * 8;
    let hash = sha256Fallback.h = sha256Fallback.h || [];
    let k = sha256Fallback.k = sha256Fallback.k || [];
    let primeCounter = k.length, isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
    }
    ascii += '\x80'; while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) { j = ascii.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
    words[words.length] = ((asciiBitLength / maxWord) | 0); words[words.length] = asciiBitLength;
    for (j = 0; j < words.length;) {
      let w = words.slice(j, j += 16), oldHash = hash; hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        let w15 = w[i - 15], w2 = w[i - 2]; let a = hash[0], e = hash[4];
        let temp1 = hash[7] + (rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25)) + ((e&hash[5])^((~e)&hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i-16] + (rightRotate(w15,7)^rightRotate(w15,18)^(w15>>>3)) + w[i-7] + (rightRotate(w2,17)^rightRotate(w2,19)^(w2>>>10)))|0);
        let temp2 = (rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22)) + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
        hash = [(temp1 + temp2)|0].concat(hash); hash[4] = (hash[4] + temp1)|0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i])|0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { let b = (hash[i] >> (j*8)) & 255; result += ((b < 16) ? 0 : '') + b.toString(16); }
    return result;
  }

  function renderMatrix(){
    els.rail.innerHTML = '<div class="qrCorners"><div class="corner c1"></div><div class="corner c2"></div><div class="corner c3"></div></div>';
    state.forEach((s, slotIdx) => {
      const node = nodesById.get(s.id);
      const glyphs = node.glyphs;
      const chars = rotateArray(glyphs.map(g => g.ch), s.rot);
      const col = document.createElement('div');
      col.className = 'col';
      col.dataset.idx = slotIdx;
      col.dataset.id = s.id;
      col.dataset.slot = slotIdx;
      col.style.left = `${SLOT_XS[slotIdx]}%`;
      col.setAttribute('aria-label', `matrix column ${slotIdx + 1}`);
      if(selectedIndex === slotIdx) col.classList.add('selected');
      glyphs.forEach((g, gi) => {
        const ch = String(chars[gi] || '');
        const span = document.createElement('span');
        span.className = 'glyph';
        span.textContent = ch;
        span.dataset.node = String(node.id);
        span.dataset.i = String(g.i);
        span.dataset.idx = String(slotIdx);
        span.dataset.gi = String(gi);
        span.dataset.uid = `${slotIdx}:${gi}:${ch}`;
        span.dataset.ch = ch.toUpperCase();
        span.style.top = `${(Math.max(0, Math.min(259, Number(g.y || 0))) / 259) * 100}%`;
        if(keyHits.some(h => h.uid === span.dataset.uid)) span.classList.add('keyHit');
        col.appendChild(span);
      });
      attachColumnHandlers(col, slotIdx);
      els.rail.appendChild(col);
    });
    if(keyTraceActive) scheduleKeyHint();
  }

  function attachColumnHandlers(col, idx){
    col.addEventListener('dragstart', e => e.preventDefault());
    col.addEventListener('selectstart', e => e.preventDefault());
    col.addEventListener('pointerdown', e => {
      e.preventDefault();
      if(!started) startBroadcast();
      if(keyTraceActive) return onKeyGlyphClick(e);
      if(solved1) return;
      pointerStart(e, col, idx);
    });
    col.addEventListener('wheel', e => {
      e.preventDefault();
      if(!started) startBroadcast();
      if(solved1 || keyTraceActive) return;
      rotateColumn(idx, e.deltaY > 0 ? 1 : -1);
    }, {passive:false});
  }

  function rotateColumn(idx, delta=1){
    ensureCompletionChallenge();
    const len = nodesById.get(state[idx].id).glyphs.length;
    state[idx].rot = norm(state[idx].rot + delta, len);
    selectedIndex = idx;
    matrixMoveCount++;
    updateInspect();
    renderMatrix();
    checkSolved();
  }

  function pointerStart(e, col, idx){
    ensureCompletionChallenge();
    selectedIndex = idx;
    updateInspect();
    const rect = col.getBoundingClientRect();
    drag = { idx, col, sx:e.clientX, sy:e.clientY, rect, active:false, dropIndex:idx };
    col.classList.add('pressed');
    document.body.style.userSelect = 'none';
    document.addEventListener('pointermove', pointerMove, {passive:false});
    document.addEventListener('pointerup', pointerEnd, {once:true});
    document.addEventListener('pointercancel', pointerEnd, {once:true});
  }

  function activateDrag(){
    if(!drag || drag.active) return;
    drag.active = true;
    drag.col.classList.add('isDragging');
    drag.col.style.width = `${drag.rect.width}px`;
    drag.col.style.height = `${drag.rect.height}px`;
    drag.col.style.left = `${drag.rect.left}px`;
    drag.col.style.top = `${drag.rect.top}px`;
    els.rail.classList.add('dragging');
  }

  function updateDropTarget(clientX){
    const board = els.rail.getBoundingClientRect();
    const localPct = ((clientX - board.left) / Math.max(1, board.width)) * 100;
    let best = 0, dist = Infinity;
    for(let i=0;i<SLOT_XS.length;i++){
      const d = Math.abs(SLOT_XS[i] - localPct);
      if(d < dist){ dist = d; best = i; }
    }
    drag.dropIndex = Math.max(0, Math.min(state.length - 1, best));
    els.rail.querySelectorAll('.dropTarget').forEach(el => el.classList.remove('dropTarget'));
    const target = els.rail.querySelector(`.col[data-slot="${drag.dropIndex}"]`);
    if(target && target !== drag.col) target.classList.add('dropTarget');
  }

  function pointerMove(e){
    if(!drag) return;
    e.preventDefault();
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if(!drag.active && Math.hypot(dx, dy) > 5) activateDrag();
    if(drag.active){
      drag.col.style.left = `${e.clientX - drag.rect.width/2}px`;
      drag.col.style.top = `${e.clientY - drag.rect.height/2}px`;
      updateDropTarget(e.clientX);
    }
  }

  function pointerEnd(){
    document.removeEventListener('pointermove', pointerMove);
    document.body.style.userSelect = '';
    if(!drag) return;
    const wasActive = drag.active;
    const from = drag.idx;
    const to = drag.dropIndex;
    if(wasActive){
      const item = state.splice(from, 1)[0];
      state.splice(to, 0, item);
      selectedIndex = to;
      matrixMoveCount++;
    } else {
      rotateColumn(from, 1);
      drag = null;
      return;
    }
    drag = null;
    els.rail.classList.remove('dragging');
    renderMatrix();
    updateInspect();
    checkSolved();
  }

  function updateInspect(){
    els.inspectNode.textContent = solved1 ? t('pass1.fieldRemembered') : t('pass1.fieldTouched');
    els.inspectRead.textContent = keyTraceActive ? t('pass1.keyControls') : t('pass1.controls');
  }

  async function checkSolved(){
    if(solved1) return;
    const h = await sha256Hex(stateString());
    if(h === D.quest.targetHash) solvePass1(); else els.sync.textContent = t('pass1.signalUnstable');
  }


  function getClientId(){
    const key = 'lsh_anonymous_client_v1';
    try{
      let id = localStorage.getItem(key);
      if(!id){
        id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
        localStorage.setItem(key, id);
      }
      return id;
    }catch(_e){
      return `ephemeral-${Math.random().toString(16).slice(2)}`;
    }
  }

  function apiBase(){
    const raw = String(D.site?.progress?.apiUrl || '').trim();
    if(!raw || raw.includes('PLACEHOLDER')) return '';
    return raw.replace(/\/$/, '');
  }

  function normalizeProgress(payload={}){
    const target = Number(payload.target || D.site?.progress?.target || 1999);
    const completions = Math.max(0, Number(payload.completions || 0));
    const donationCredits = Math.max(0, Number(payload.donationCredits || payload.donations || 0));
    const combined = Math.max(0, Math.min(target, Number(payload.combined ?? (completions + donationCredits))));
    return {completions, donationCredits, combined, target, unlocked:Boolean(payload.unlocked || combined >= target), online:Boolean(payload.online ?? true)};
  }

  function renderProgress(){
    progressState = normalizeProgress(progressState);
    const {completions, donationCredits, combined, target, unlocked, online} = progressState;
    if(els.solverCount) els.solverCount.textContent = String(completions);
    if(els.donationCount) els.donationCount.textContent = String(donationCredits);
    if(els.combinedCount) els.combinedCount.textContent = String(combined);
    if(els.topFund) els.topFund.textContent = `${lang()==='ru' ? 'следующая дверь' : 'next door'} ${String(combined).padStart(3,'0')}/${target}`;
    if(els.fundText){
      els.fundText.textContent = lang()==='ru'
        ? `${combined} / ${target} СИГНАЛОВ • ${completions} ПРОХОЖДЕНИЙ • ${donationCredits} USDT`
        : `${combined} / ${target} SIGNALS • ${completions} SOLVERS • ${donationCredits} USDT`;
    }
    if(els.fundBar) els.fundBar.style.width = `${Math.max(0, Math.min(100, (combined / Math.max(1,target))*100))}%`;
    if(els.counterStatus){
      els.counterStatus.textContent = unlocked ? t('progress.unlocked') : (online ? t('progress.live') : (apiBase() ? t('progress.offline') : t('progress.backendSetup')));
      els.counterStatus.classList.toggle('online', online);
      els.counterStatus.classList.toggle('unlocked', unlocked);
    }
    applyStageTwoGate();
  }

  function applyStageTwoGate(){
    const open = Boolean(progressState.unlocked);
    els.stageTwo.classList.toggle('locked', !open);
    if(els.globalGateStatus) els.globalGateStatus.textContent = open ? t('pass2.globalOpen') : t('pass2.globalWaiting');
    if(open && solved1){
      if(!keyTraceActive && keyIndex < D.quest.pass1Key.length) keyTraceActive = true;
      els.routeHint.textContent = t('pass2.active');
    }else if(open && !solved1){
      keyTraceActive = false;
      els.routeHint.textContent = t('pass2.keyNeeded');
    }else{
      keyTraceActive = false;
      els.routeHint.textContent = t('pass2.waiting');
    }
    renderKeySlots();
    renderRouteTape();
  }

  async function fetchProgress(){
    const base = apiBase();
    if(!base){
      progressState = normalizeProgress({...D.site?.progress?.fallback, online:false});
      renderProgress();
      return progressState;
    }
    try{
      const res = await fetch(`${base}/v1/progress`, {cache:'no-store', mode:'cors'});
      if(!res.ok) throw new Error(`progress ${res.status}`);
      progressState = normalizeProgress({...await res.json(), online:true});
      renderProgress();
      if(solved1){ window.setTimeout(retryPendingCompletion, 120); }
      return progressState;
    }catch(err){
      console.warn('progress offline', err);
      progressState.online = false;
      renderProgress();
      return progressState;
    }
  }

  function loadTurnstileScript(){
    if(window.turnstile) return Promise.resolve(window.turnstile);
    return new Promise((resolve,reject) => {
      const old = document.querySelector('script[data-lsh-turnstile]');
      if(old){
        const timer=setInterval(()=>{ if(window.turnstile){clearInterval(timer);resolve(window.turnstile);} },80);
        setTimeout(()=>{clearInterval(timer); if(!window.turnstile) reject(new Error('turnstile timeout'));},8000);
        return;
      }
      const script=document.createElement('script');
      script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async=true; script.defer=true; script.dataset.lshTurnstile='1';
      script.onload=()=>resolve(window.turnstile); script.onerror=()=>reject(new Error('turnstile load failed'));
      document.head.appendChild(script);
    });
  }

  async function getTurnstileToken(){
    const sitekey=String(D.site?.progress?.turnstileSiteKey || '');
    if(!sitekey || sitekey.includes('PLACEHOLDER')) return '';
    const ts=await loadTurnstileScript();
    els.turnstileMount?.classList.remove('hidden');
    return new Promise((resolve,reject)=>{
      const options={sitekey,theme:'light',size:'compact',action:'pass1_complete',callback:(token)=>{turnstileToken=token;resolve(token);},'error-callback':()=>reject(new Error('turnstile failed')),'expired-callback':()=>{turnstileToken='';}};
      if(turnstileWidgetId===null) turnstileWidgetId=ts.render(els.turnstileMount,options);
      else ts.reset(turnstileWidgetId);
      setTimeout(()=>{if(!turnstileToken) reject(new Error('turnstile timeout'));},120000);
    });
  }

  async function requestCompletionChallenge(clientId){
    const base=apiBase();
    if(!base) throw new Error('counter backend missing');
    const res=await fetch(`${base}/v1/challenge`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId,caseId:'CASE001'})});
    if(!res.ok) throw new Error(`challenge ${res.status}`);
    return res.json();
  }

  async function ensureCompletionChallenge(){
    if(isLocalDev || bypassArmed || solved1 || !apiBase()) return null;
    const now = Date.now();
    if(completionChallenge && Number(completionChallenge.expiresAt || 0) > now + 5000) return completionChallenge;
    try{
      completionChallenge = await requestCompletionChallenge(getClientId());
      return completionChallenge;
    }catch(err){
      console.warn('completion challenge unavailable', err);
      return null;
    }
  }

  async function submitCompletion(){
    if(completionSubmitting || isLocalDev || bypassArmed) return;
    const base=apiBase();
    if(!base){
      if(els.completionReceipt){els.completionReceipt.textContent=t('pass1.pendingCount');els.completionReceipt.classList.remove('hidden');}
      return;
    }
    completionSubmitting=true;
    if(els.counterStatus) els.counterStatus.textContent=t('progress.verifying');
    try{
      const clientId=getClientId();
      const challenge=(await ensureCompletionChallenge()) || (await requestCompletionChallenge(clientId));
      completionChallenge=challenge;
      const waitMs=Math.max(0,Number(challenge.notBefore || 0)-Date.now());
      if(waitMs>0) await new Promise(resolve=>window.setTimeout(resolve,Math.min(waitMs+60,20000)));
      let token='';
      try{token=await getTurnstileToken();}catch(err){
        if(String(D.site?.progress?.turnstileSiteKey || '').includes('PLACEHOLDER')) token='';
        else throw err;
      }
      const moveCount=Math.max(0,Number(matrixMoveCount||0));
      const proof=await sha256Hex(`${challenge.id}|${challenge.nonce}|${clientId}|${D.quest.targetHash}|${moveCount}`);
      const res=await fetch(`${base}/v1/complete`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId,challengeId:challenge.id,proof,moveCount,turnstileToken:token,caseId:'CASE001'})});
      const payload=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(payload.error || `complete ${res.status}`);
      progressState=normalizeProgress({...payload.progress,online:true});
      renderProgress();
      const accepted=Boolean(payload.accepted);
      if(els.completionReceipt){
        els.completionReceipt.textContent=accepted ? t('progress.accepted') : t('progress.alreadyCounted');
        els.completionReceipt.classList.remove('hidden');
      }
      toast(accepted ? t('toast.counterAccepted') : t('toast.counterDuplicate'));
      try{localStorage.removeItem('lsh_completion_pending');}catch(_e){}
    }catch(err){
      console.warn('completion submit failed',err);
      progressState.online=false;
      renderProgress();
      if(els.completionReceipt){els.completionReceipt.textContent=t('pass1.pendingCount');els.completionReceipt.classList.remove('hidden');}
      try{localStorage.setItem('lsh_completion_pending','1');}catch(_e){}
      toast(t('toast.counterOffline'));
    }finally{
      completionSubmitting=false;
      turnstileToken='';
      completionChallenge=null;
      if(els.turnstileMount) els.turnstileMount.classList.add('hidden');
    }
  }

  async function retryPendingCompletion(){
    try{
      if(localStorage.getItem('lsh_completion_pending')==='1' && solved1) await submitCompletion();
    }catch(_e){}
  }

  async function solvePass1(){
    if(solved1) return;
    solved1 = true;
    keyTraceActive = Boolean(progressState.unlocked);
    keyIndex = 0;
    keyHits = [];
    els.headerStatus.textContent = t('status.scarAwake');
    els.sync.textContent = t('pass1.signalRemembered');
    els.unlockTitle.textContent = t('pass1.solvedTitle');
    els.unlockText.textContent = t('pass1.solvedText');
    els.keyValue.textContent = D.quest.pass1Key;
    applyStageTwoGate();
    renderMatrix();
    toast(t('toast.secretUnlocked'));
    burstSignal('ATTENTION', lang()==='ru' ? 'СЕКРЕТНЫЙ ТРЕК ОТКРЫТ' : 'SECRET TRACK UNLOCKED');
    playSecretTrack();
    submitCompletion();
  }

  function renderKeySlots(){
    const key = D.quest.pass1Key;
    els.keySlots.innerHTML = key.split('').map((ch, i) => `<span class="${i < keyIndex ? 'filled' : ''}">${i < keyIndex ? ch : '·'}</span>`).join('');
  }

  function renderRouteTape(){
    const target = D.quest.routeTarget;
    const reveal = Math.floor((keyIndex / D.quest.pass1Key.length) * target.length);
    const parts = target.split('').map((ch, i) => `<span class="${i < reveal ? '' : 'pending'}">${i < reveal ? ch : '·'}</span>`);
    els.routeTape.innerHTML = `${parts.slice(0, 6).join('')} / ${parts.slice(6).join('')}`;
  }

  function scheduleKeyHint(){
    window.setTimeout(() => {
      if(!keyTraceActive) return;
      els.rail.querySelectorAll('.glyph.keyHint').forEach(el => el.classList.remove('keyHint'));
      const expected = D.quest.pass1Key[keyIndex];
      if(!expected) return;
      const matches = [...els.rail.querySelectorAll(`.glyph[data-ch="${expected}"]`)];
      if(!matches.length) return;
      matches[(keyIndex * 7) % matches.length].classList.add('keyHint');
    }, 500);
  }

  function onKeyGlyphClick(e){
    const glyph = e.target.closest('.glyph');
    if(!glyph) return;
    const expected = D.quest.pass1Key[keyIndex];
    const got = glyph.dataset.ch;
    if(got === expected){
      keyHits.push({uid:glyph.dataset.uid});
      keyIndex++;
      renderKeySlots();
      renderRouteTape();
      renderMatrix();
      if(keyIndex >= D.quest.pass1Key.length) completeRoute();
    } else {
      glyph.classList.add('noise');
      window.setTimeout(() => glyph.classList.remove('noise'), 220);
      toast(t('toast.noise'));
    }
  }

  function completeRoute(){
    keyTraceActive = false;
    els.routeHint.textContent = `${lang()==='ru' ? 'доказательство' : 'proof'}: ${D.quest.proofCode}`;
    els.routeTape.textContent = D.quest.routeDisplay;
    els.routeActions.classList.remove('hidden');
    els.openLedger.href = D.site.finalRouteUrl;
    els.requestLab.href = D.site.accessContact;
    els.requestLab.textContent = `${t('pass2.requestLab')} / ${D.quest.proofCode}`;
    toast(t('toast.routeVerified'));
    burstSignal(D.quest.routeDisplay, lang()==='ru' ? 'МАРШРУТ ПОДТВЕРЖДЁН' : 'ROUTE VERIFIED');
    renderMatrix();
  }


  function initAudioGraph(){
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if(!Ctx) return;
      if(!audioCtx) audioCtx = new Ctx();
      if(!mediaSource){
        mediaSource = audioCtx.createMediaElementSource(els.audio);
        lowFilter = audioCtx.createBiquadFilter();
        midFilter = audioCtx.createBiquadFilter();
        highFilter = audioCtx.createBiquadFilter();
        masterGain = audioCtx.createGain();
        lowFilter.type = 'lowshelf'; lowFilter.frequency.value = 140; lowFilter.gain.value = 0;
        midFilter.type = 'peaking'; midFilter.frequency.value = 1100; midFilter.Q.value = 0.85; midFilter.gain.value = 0;
        highFilter.type = 'highshelf'; highFilter.frequency.value = 5200; highFilter.gain.value = 0;
        masterGain.gain.value = Math.max(0, Math.min(1, dialValue(els.volDial) / 100));
        mediaSource.connect(lowFilter).connect(midFilter).connect(highFilter).connect(masterGain).connect(audioCtx.destination);
      }
      audioCtx.resume?.();
      applyAudioSettings();
    }catch(err){ console.warn('audio graph unavailable', err); }
  }

  function dialValue(el){ return Number(el?.dataset.value || 0); }

  function setDialValue(el, value, min, max){
    if(!el) return;
    value = Math.max(min, Math.min(max, Number(value) || 0));
    el.dataset.value = String(Math.round(value));
    el.setAttribute('aria-valuenow', String(Math.round(value)));
    const pct = (value - min) / (max - min);
    const deg = -135 + pct * 270;
    el.style.setProperty('--deg', `${deg}deg`);
    applyAudioSettings();
  }

  function applyAudioSettings(){
    const vol = Math.max(0, Math.min(1, dialValue(els.volDial) / 100));
    if(els.audio) els.audio.volume = mediaSource ? 1 : vol;
    if(masterGain) masterGain.gain.value = vol;
    if(fallbackGain) fallbackGain.gain.value = 0.018 * vol;
    if(lowFilter && els.lowDial) lowFilter.gain.value = dialValue(els.lowDial);
    if(midFilter && els.midDial) midFilter.gain.value = dialValue(els.midDial);
    if(highFilter && els.highDial) highFilter.gain.value = dialValue(els.highDial);
  }

  function setupDial(el, min, max){
    if(!el) return;
    setDialValue(el, Number(el.dataset.value || 0), min, max);
    let dragging = false;

    const valueFromPointer = e => {
      const r = el.querySelector('i')?.getBoundingClientRect() || el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // angle from the top of the dial, clockwise positive: -135..135 is the live arc
      let deg = Math.atan2(dx, -dy) * 180 / Math.PI;
      if(deg < -135) deg = -135;
      if(deg > 135) deg = 135;
      const pct = (deg + 135) / 270;
      return min + pct * (max - min);
    };
    const move = e => {
      if(!dragging) return;
      e.preventDefault();
      setDialValue(el, valueFromPointer(e), min, max);
    };
    const up = e => {
      if(dragging) e?.preventDefault?.();
      dragging = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    el.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      dragging = true;
      el.setPointerCapture?.(e.pointerId);
      initAudioGraph();
      setDialValue(el, valueFromPointer(e), min, max);
      window.addEventListener('pointermove', move, {passive:false});
      window.addEventListener('pointerup', up, {passive:false});
    });
    el.addEventListener('wheel', e => {
      e.preventDefault(); e.stopPropagation(); initAudioGraph();
      const step = el === els.volDial ? 2 : 0.75;
      setDialValue(el, dialValue(el) + (e.deltaY < 0 ? step : -step), min, max);
    }, {passive:false});
    el.addEventListener('keydown', e => {
      const step = el === els.volDial ? 2 : 1;
      if(e.key === 'ArrowUp' || e.key === 'ArrowRight'){ e.preventDefault(); setDialValue(el, dialValue(el) + step, min, max); }
      if(e.key === 'ArrowDown' || e.key === 'ArrowLeft'){ e.preventDefault(); setDialValue(el, dialValue(el) - step, min, max); }
      if(e.key === 'Home'){ e.preventDefault(); setDialValue(el, min, min, max); }
      if(e.key === 'End'){ e.preventDefault(); setDialValue(el, max, min, max); }
    });
  }

  function initKnobs(){
    setupDial(els.volDial, 0, 100);
    setupDial(els.lowDial, -12, 12);
    setupDial(els.midDial, -12, 12);
    setupDial(els.highDial, -12, 12);
    applyAudioSettings();
  }

  function setTitle(id, title){
    const displayTitle = localizedContent('trackTitles', id, title);
    els.trackTitle.textContent = displayTitle;
    els.trackMeta.textContent = (id === '15' || id === '15_FINAL')
      ? t('track.secret', {total:Math.max(D.tracks.length,15)})
      : t('track.broadcast', {id, total:D.tracks.length});
    const fallback = (D.trackKoans && D.trackKoans[id]) || TRACK_KOANS[id] || TRACK_KOANS['01'];
    const lines = localizedContent('trackKoans', id, fallback);
    els.trackKoan.style.opacity = '0';
    window.setTimeout(() => { els.trackKoan.textContent = lines.join('\n'); els.trackKoan.style.opacity = '1'; }, 90);
  }

  function updateRadioStatus(live){
    els.radioState.textContent = live ? t('radio.carrierRunning') : (started ? t('radio.carrierPaused') : t('radio.carrierCold'));
    els.headerStatus.textContent = live ? (solved1 ? t('status.secretOnAir') : t('status.onAir')) : (started ? t('status.paused') : t('status.fieldAsleep'));
    els.liveDot.classList.toggle('live', live);
    els.play.textContent = live ? 'Ⅱ' : '▶';
  }

  function startBroadcast(){
    if(started) return;
    started = true;
    userPaused = false;
    ensureRAF();
    initAudioGraph();
    loadTrack(0, true);
    updateRadioStatus(true);
  }

  function loadTrack(i, autoplay){
    stopFallback();
    if(!D.tracks.length) return;
    if(i < 0) i = D.tracks.length - 1;
    if(i >= D.tracks.length) i = 0;
    currentTrack = i;
    const tr = D.tracks[i];
    resetTicker(tr);
    setTitle(tr.id, tr.title.replace(/_/g, ' '));
    els.audio.src = tr.src;
    els.audio.preload = 'auto';
    els.seek.value = 0;
    els.time.textContent = '00:00';
    if(autoplay){
      userPaused = false;
      initAudioGraph();
      try{ els.audio.load?.(); }catch(_e){}
      els.audio.play().then(() => updateRadioStatus(true)).catch(err => {
        console.warn('play blocked or source unavailable', err);
        if(tr.secret || String(tr.src || '').startsWith('blob:')){
          userPaused = true;
          updateRadioStatus(false);
          toast(lang()==='ru' ? 'трек 15 готов — нажмите воспроизведение' : 'track 15 is armed — press play');
        } else {
          startFallbackCarrier();
        }
      });
    } else {
      updateRadioStatus(false);
    }
  }

  function playPrev(){
    seekDragging = false;
    if(!started){ startBroadcast(); return; }
    if(currentTrack === -1) loadTrack(0, true); else loadTrack(currentTrack - 1, true);
  }

  function playNext(){
    seekDragging = false;
    if(!started){ startBroadcast(); return; }
    if(currentTrack === -1) loadTrack(0, true); else loadTrack(currentTrack + 1, true);
  }

  function togglePlayback(){
    if(!started){ startBroadcast(); return; }
    if(fallbackTimer){ userPaused = true; stopFallback(); updateRadioStatus(false); return; }
    if(!els.audio.src){ loadTrack(0, true); return; }
    if(els.audio.paused){
      userPaused = false;
      initAudioGraph();
      els.audio.play().then(() => updateRadioStatus(true)).catch(() => startFallbackCarrier());
    } else {
      userPaused = true;
      els.audio.pause();
      updateRadioStatus(false);
    }
  }

  function startFallbackCarrier(){
    if(userPaused || fallbackTimer) return;
    fallbackT = 0;
    toast(t('toast.audioMissing'));
    try{
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if(Ctx && !fallbackAudioCtx){
        fallbackAudioCtx = new Ctx();
        fallbackOsc = fallbackAudioCtx.createOscillator();
        fallbackGain = fallbackAudioCtx.createGain();
        fallbackOsc.type = 'sine';
        fallbackOsc.frequency.value = 54;
        fallbackGain.gain.value = 0.018 * Math.max(0, Math.min(1, dialValue(els.volDial) / 100));
        fallbackOsc.connect(fallbackGain).connect(fallbackAudioCtx.destination);
        fallbackOsc.start();
      }
      fallbackAudioCtx?.resume?.();
      if(fallbackGain) fallbackGain.gain.value = 0.018 * Math.max(0, Math.min(1, dialValue(els.volDial) / 100));
    }catch(_e){}
    updateRadioStatus(true);
    fallbackTimer = window.setInterval(() => {
      fallbackT += 0.25;
      const tr = D.tracks[currentTrack];
      if(tr && fallbackT > (tr.durationHint || 90)){
        loadTrack(currentTrack + 1, false);
        fallbackT = 0;
        startFallbackCarrier();
      }
    }, 250);
  }

  function stopFallback(){
    if(fallbackTimer){ clearInterval(fallbackTimer); fallbackTimer = null; }
    if(fallbackGain) fallbackGain.gain.value = 0.0001;
  }

  function resetTicker(tr){
    lastTickerT = -1;
    currentCueIndex = -2;
    tickerLineReady = false;
    lyricScale = 1;
    lyricOffset = Number(tr?.subtitleOffset || 0) || 0;
    const sourceCues = syncOverrideForTrack(tr.id) || D.lyrics[tr.id] || [];
    currentCues = sourceCues
      .map(c => ({ start:Number(c.start), end:Number(c.end || c.start + 4), text:cleanText(c.text) }))
      .filter(c => Number.isFinite(c.start) && c.text)
      .sort((a,b) => a.start - b.start);
    lyricEndRaw = currentCues.length ? Math.max(...currentCues.map(c => c.end)) : 0;
    buildSubtitleTimeline(tr, Number(tr?.durationHint || 0));
    tickerLineReady = true;
    renderSubtitleCue(playbackTime(), true);
  }

  function buildSubtitleTimeline(tr, durationOverride=0){
    // v23: no automatic stretch. The document / sync editor is the source of truth.
    // If timings drift, use ?sync=1 to tap the real cue starts and export corrected lyrics.json.
    const mode = tr?.subtitleMode || 'exact';
    displayCues = currentCues.map(c => ({...c, pStart:c.start + lyricOffset, pEnd:c.end + lyricOffset}));
    if(!currentCues.length || mode === 'exact') return;

    // Optional legacy mode: stretch only gaps, never lyric lines. Kept disabled by default.
    if(mode === 'gap-fit-pauses'){
      const dur = Number.isFinite(els.audio.duration) && els.audio.duration > 0 ? els.audio.duration : Number(durationOverride || tr?.durationHint || 0);
      if(!(dur > 0) || currentCues.length <= 1) return;
      const firstStart = currentCues[0].start;
      const cueDur = currentCues.reduce((sum,c)=>sum + Math.max(0.35, c.end - c.start), 0);
      const interGap = currentCues.slice(1).reduce((sum,c,i)=>sum + Math.max(0, c.start - currentCues[i].end), 0);
      if(interGap <= 0) return;
      const targetAfterFirst = Math.max(cueDur, dur - firstStart);
      let gapScale = (targetAfterFirst - cueDur) / interGap;
      if(!Number.isFinite(gapScale) || gapScale < 0.1 || gapScale > 8) return;
      let cursor = firstStart + lyricOffset;
      displayCues = [];
      currentCues.forEach((cue, i) => {
        if(i > 0){
          const prev = currentCues[i-1];
          cursor += Math.max(0, cue.start - prev.end) * gapScale;
        }
        const d = Math.max(0.35, cue.end - cue.start);
        displayCues.push({...cue, pStart:cursor, pEnd:cursor + d});
        cursor += d;
      });
    }
  }

  function lyricTimeFromPlayback(t){
    return Math.max(0, Number(t) || 0);
  }

  function currentDurationHint(){
    const tr = D.tracks[currentTrack];
    const byAudio = Number.isFinite(els.audio.duration) && els.audio.duration > 0 ? els.audio.duration : 0;
    return byAudio || tr?.durationHint || 90;
  }

  function playbackTime(){
    if(currentTrack < 0) return els.audio.currentTime || 0;
    return fallbackTimer ? fallbackT : (els.audio.currentTime || 0);
  }

  function activeCueIndexAt(t){
    const pt = lyricTimeFromPlayback(t);
    const cues = displayCues.length ? displayCues : currentCues;
    if(!cues.length) return -1;
    for(let i=0;i<cues.length;i++){
      const c = cues[i];
      const a = Number.isFinite(c.pStart) ? c.pStart : c.start;
      const b = Number.isFinite(c.pEnd) ? c.pEnd : c.end;
      if(pt >= a - 0.03 && pt < b + 0.03) return i;
    }
    return -1;
  }

  function canTypeTerminal(){
    return started && !userPaused;
  }

  function renderSubtitleCue(tickTime, force=false){
    if(!tickerLineReady) return;

    // Once a user enters the terminal—or the Passenger Audit starts—the terminal owns
    // the lower band. Lyrics and carrier fragments cannot overwrite an active exchange.
    if(auditState || terminalActive || terminalResponse){
      if(terminalResponse && !auditState && terminalResponseUntil !== Infinity && Date.now() >= terminalResponseUntil){
        terminalResponse = '';
      }
      renderTerminalPrompt(force);
      return;
    }

    const idx = activeCueIndexAt(tickTime);
    const pt = lyricTimeFromPlayback(tickTime);
    if(tickerHold && !force && idx === currentCueIndex && idx >= 0) return;
    const prev = currentCueIndex;
    if(idx < 0){
      currentCueIndex = -1;
      if(prev !== -1 || force || !els.ticker.classList.contains('silence')) renderTerminalPrompt(true);
      return;
    }
    currentCueIndex = idx;
    const cue = (displayCues.length ? displayCues : currentCues)[idx];
    const start = Number.isFinite(cue.pStart) ? cue.pStart : cue.start;
    const end = Number.isFinite(cue.pEnd) ? cue.pEnd : cue.end;
    const cueDuration = Math.max(0.35, end - start);
    const tr = D.tracks[currentTrack] || {};
    const literalMode = literalCueActive(cue);
    const lineText = signalLineForCue(cue, idx);
    const cps = Number(tr?.subtitleCps || D.site?.subtitleCps || 34);
    const typedTarget = lineText.length / Math.max(18, cps);
    const minByCue = literalMode ? Math.max(0.72, cueDuration * 0.82) : Math.max(0.52, cueDuration * (lineText.length > 46 ? 0.58 : 0.46));
    const maxByCue = literalMode ? Math.max(0.9, cueDuration * 0.98) : Math.max(0.78, cueDuration * 0.88);
    const typedDuration = Math.min(Math.max(typedTarget, minByCue), maxByCue);
    const progress = Math.max(0, Math.min(1, (pt - start) / typedDuration));
    const typed = Math.max(0, Math.min(lineText.length, Math.ceil(progress * lineText.length)));
    const visible = lineText.slice(0, typed);
    if(prev !== idx || force || els.ticker.dataset.full !== lineText || els.ticker.dataset.typed !== String(typed)){
      els.ticker.classList.remove('silence','terminalActive','auditActive');
      els.ticker.classList.add('typing');
      els.ticker.dataset.full = lineText;
      els.ticker.dataset.typed = String(typed);
      els.ticker.innerHTML = `<span class="tickerCue active">&gt;_ ${esc(visible)}</span><span class="tickerCursor"></span>`;
    }
  }

  function dropTerminalChar(ch){
    const c = String(ch || '');
    if(!c || c === '\n') return;
    const span = document.createElement('span');
    span.className = 'terminalDrop';
    span.textContent = c;
    const left = 4 + Math.random() * 92;
    const drift = (Math.random() * 96 - 48).toFixed(1) + 'px';
    const dur = (1.45 + Math.random() * 0.75).toFixed(2) + 's';
    span.style.left = left.toFixed(2) + 'vw';
    span.style.setProperty('--drift', drift);
    span.style.setProperty('--fallDur', dur);
    document.body.appendChild(span);
    window.setTimeout(() => span.remove(), 2600);
  }

  function dropTerminalText(text){
    String(text || '').slice(0, 80).split('').forEach((ch, i) => {
      window.setTimeout(() => dropTerminalChar(ch), i * 24);
    });
  }

  function speakOperator(){
    // The old floor-operator was removed. The terminal now answers by dropping
    // typed letters through the page, leaving the lower line minimal.
  }

  function currentSignalGhost(){
    const fallback = SIGNAL_GHOSTS;
    const pool = localizedContent('signalGhosts', 'all', null) || (lang()==='ru' ? window.LSH_CONTENT?.ru?.signalGhosts : null) || fallback;
    const list = Array.isArray(pool) && pool.length ? pool : fallback;
    const base = Math.floor((playbackTime() || 0) / 3);
    const idx = ((currentTrack + 1) * 5 + base) % list.length;
    return list[(idx + list.length) % list.length];
  }

  function cueFragment(text){
    let t = cleanText(text || '');
    t = t.replace(/\[[^\]]*\]/g, '').trim();
    let p = t.split(/[.!?]/)[0].trim();
    if(!p) p = t;
    if(p.length > 52) p = p.slice(0, 52).replace(/\s+\S*$/, '');
    return p;
  }

  function literalCueActive(cue){
    const tr = D.tracks[currentTrack] || {};
    const until = Number(tr.literalUntil || 0);
    return until > 0 && Number(cue?.start || 0) < until;
  }

  function signalLineForCue(cue, idx){
    const tr = D.tracks[currentTrack] || {};
    const id = tr.id || '01';
    if(literalCueActive(cue)){
      return cleanText(localizedLiteralCue(id, idx, cue.text));
    }
    const fallbackPool = TRACK_WHISPERS[id] || TRACK_WHISPERS['01'];
    const localizedPool = lang()==='ru' ? window.LSH_CONTENT?.ru?.trackWhispers?.[id] : null;
    const pool = Array.isArray(localizedPool) && localizedPool.length ? localizedPool : fallbackPool;
    const baseText = lang()==='ru' ? localizedLiteralCue(id, idx, cue.text) : cue.text;
    const whisper = pool[idx % pool.length] || cueFragment(baseText);
    const frag = cueFragment(baseText);
    if(!frag || frag.toLowerCase() === whisper.toLowerCase()) return whisper;
    return idx % 3 === 1 ? `${whisper} // ${frag}` : whisper;
  }

  function renderTerminalPrompt(force=false){
    els.ticker.classList.add('silence');
    els.ticker.classList.toggle('terminalActive', terminalActive);
    els.ticker.classList.toggle('auditActive', Boolean(auditState));
    els.ticker.classList.remove('typing');
    els.ticker.dataset.full = '';
    els.ticker.dataset.typed = '';

    if(terminalResponse && !auditState && terminalResponseUntil !== Infinity && Date.now() >= terminalResponseUntil){
      terminalResponse = '';
    }

    const response = terminalResponse ? `<span class="terminalReply">${esc(terminalResponse)}</span>` : '';
    const ghost = !terminalBuffer ? (response || `<span class="terminalGhost signalNoise">${esc(currentSignalGhost())}</span>`) : '';
    const echo = terminalBuffer ? `<span class="terminalInputText">${esc(terminalBuffer)}</span>` : ghost;
    const auditMark = auditState ? `<span class="auditMark">AUDIT/${esc(auditState.toUpperCase())}</span>` : '';
    els.ticker.innerHTML = `${auditMark}<span class="tickerPrompt">&gt;_ </span><span class="terminalEcho">${echo}</span><span class="tickerCursor"></span>`;
    speakOperator(terminalBuffer, Boolean(terminalBuffer));
  }

  async function decryptOraclePack(text){
    const parts = String(text || '').trim().split('.');
    if(parts.length !== 4 || parts[0] !== 'LSH1') throw new Error('bad oracle pack');
    const b64 = v => Uint8Array.from(atob(v), c => c.charCodeAt(0));
    const salt = b64(parts[1]);
    const iv = b64(parts[2]);
    const packed = b64(parts[3]);
    const cipher = packed.slice(0, packed.length - 16);
    const tag = packed.slice(packed.length - 16);
    const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(ORACLE_PASSPHRASE), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:120000, hash:'SHA-256'}, keyMaterial, {name:'AES-GCM', length:256}, false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({name:'AES-GCM', iv, tagLength:128}, key, new Uint8Array([...cipher, ...tag]));
    return JSON.parse(new TextDecoder().decode(plain));
  }

  async function loadOracle(){
    if(oracleData) return oracleData;
    if(oraclePromise) return oraclePromise;
    const file = lang()==='ru' ? 'data/oracle.ru.enc' : 'data/oracle.en.enc';
    oraclePromise = fetch(file, {cache:'no-store'})
      .then(r => { if(!r.ok) throw new Error('oracle offline'); return r.text(); })
      .then(decryptOraclePack)
      .then(data => (oracleData = data))
      .finally(() => { oraclePromise = null; });
    return oraclePromise;
  }

  function scoreIntent(q, intent){
    const raw = q.toLowerCase();
    let best = 0;
    for(const pat of intent.patterns || []){
      const p = String(pat).toLowerCase();
      if(!p) continue;
      if(raw === p) best = Math.max(best, 100 + p.length);
      else if(raw.includes(p)) best = Math.max(best, 40 + p.length);
      else {
        const words = p.split(/\s+/).filter(Boolean);
        const hits = words.filter(w => raw.includes(w)).length;
        if(words.length && hits) best = Math.max(best, hits * 11);
      }
    }
    return best;
  }

  function patternHit(q, patterns){
    const raw = String(q || '').toLowerCase().trim();
    for(const pat of patterns || []){
      const p = String(pat || '').toLowerCase().trim();
      if(!p) continue;
      if(p.startsWith('re:')){
        try{ if(new RegExp(p.slice(3),'i').test(raw)) return true; }catch(_e){}
      } else if(raw === p || raw.includes(p)) return true;
      else {
        const words = p.split(/\s+/).filter(Boolean);
        if(words.length > 1 && words.every(w => raw.includes(w))) return true;
      }
    }
    return false;
  }

  function formatOracleLines(lines){
    const arr = Array.isArray(lines) ? lines : [String(lines || '')];
    return arr.filter(Boolean).join('   ');
  }

  function auditQuestion(data, state=auditState){
    return formatOracleLines(data?.audit?.states?.[state]?.question || []);
  }

  function setAuditState(next){
    auditState = next || null;
    auditStateEnteredAt = Date.now();
    auditWrongAnswers = 0;
    auditWaterNudged = false;
    auditSilenceUntil = 0;
  }

  function restoreAuditReceipt(){
    let complete = false;
    try{ complete = localStorage.getItem('lsh_passenger_audit') === 'complete'; }catch(_e){}
    if(!complete) return;
    auditReceipt = auditReceipt || 'LSH-PASSENGER-001';
    document.body.classList.add('auditComplete');
    if(els.shipReveal) els.shipReveal.textContent = lang()==='ru'
      ? `аудит пассажира завершён // квитанция ${auditReceipt}`
      : `passenger audit complete // receipt ${auditReceipt}`;
  }

  function applyOracleAction(action, data){
    if(!action) return;
    if(action === 'audit_receipt'){
      auditReceipt = data?.audit?.receipt || 'LSH-PASSENGER-001';
      try{ localStorage.setItem('lsh_passenger_audit','complete'); }catch(_e){}
      document.body.classList.add('auditComplete');
      els.matrixShell?.classList.add('auditWave');
      window.setTimeout(() => els.matrixShell?.classList.remove('auditWave'), 2400);
      if(els.shipReveal) els.shipReveal.textContent = lang()==='ru'
        ? `аудит пассажира завершён // квитанция ${auditReceipt}`
        : `passenger audit complete // receipt ${auditReceipt}`;
      typeWatcherText(lang()==='ru' ? 'Корабль услышал одну заплатку.' : 'The ship heard one patch.');
      burstSignal(auditReceipt, lang()==='ru' ? 'АУДИТ ЗАВЕРШЁН' : 'AUDIT COMPLETE');
    }else if(action === 'audit_abort'){
      auditReceipt = '';
    }
  }

  function auditSilenceResponse(data){
    const cfg = data?.audit?.silence || {};
    auditSilenceUntil = Date.now() + Number(cfg.durationSeconds || 12) * 1000;
    auditWrongAnswers = 0;
    return formatOracleLines(cfg.responses || ['THE HOUSE STOPS ASKING.','THREE BREATHS.','THE RULE IS SILENT.']);
  }

  function beginAudit(data, reason=''){
    const start = data?.audit?.start || 'sink';
    setAuditState(start);
    terminalActive = true;
    terminalEverUsed = true;
    const intro = data?.audit?.intro || ['THE PASSENGER AUDIT HAS OPENED.'];
    const q = data?.audit?.states?.[auditState]?.question || [];
    return formatOracleLines([...intro, ...q]);
  }

  function processAudit(q, data){
    const audit = data?.audit || {};

    if(patternHit(q, audit?.escape?.patterns || [])){
      const response = formatOracleLines(audit.escape.responses || ['AUDIT ABORTED.']);
      applyOracleAction(audit.escape.action, data);
      setAuditState(null);
      return response;
    }

    if(patternHit(q, audit?.breakLoop?.patterns || [])){
      setAuditState(audit.breakLoop.state || 'break_loop');
      const prompt = auditQuestion(data);
      return formatOracleLines([...(audit.breakLoop.responses || []), prompt]);
    }

    const st = audit?.states?.[auditState];
    if(!st){
      setAuditState(null);
      return lang()==='ru' ? 'АУДИТ ПОТЕРЯЛ СОСТОЯНИЕ. ВВЕДИТЕ «АУДИТ», ЧТОБЫ ОТКРЫТЬ ВРАТА СНОВА.' : 'THE AUDIT LOST ITS PLACE. TYPE AUDIT TO REOPEN THE GATE.';
    }

    if(st.openKoan && String(q || '').trim()){
      const out = [...(st.success || [])];
      applyOracleAction(st.action, data);
      if(st.next){
        setAuditState(st.next);
        out.push(...(audit.states?.[auditState]?.question || []));
      }else{
        auditReceipt = audit.receipt || auditReceipt || 'LSH-PASSENGER-001';
        setAuditState(null);
        out.push(...(audit.complete || []));
      }
      return formatOracleLines(out);
    }

    for(const trap of st.traps || []){
      if(patternHit(q, trap.patterns)){
        auditWrongAnswers++;
        const threshold = Number(audit?.silence?.triggerAfterWrongAnswers || 3);
        if(auditWrongAnswers >= threshold) return auditSilenceResponse(data);
        return formatOracleLines([...(trap.responses || st.fail || ['OLD REFLEX RECORDED. TRY AGAIN.']), ...(st.question || [])]);
      }
    }

    if(patternHit(q, st.accept || [])){
      const out = [...(st.success || [])];
      applyOracleAction(st.action, data);
      if(st.next){
        setAuditState(st.next);
        out.push(...(audit.states?.[auditState]?.question || []));
      }else{
        auditReceipt = audit.receipt || auditReceipt || 'LSH-PASSENGER-001';
        setAuditState(null);
        out.push(...(audit.complete || ['PASSENGER AUDIT COMPLETE.']));
      }
      return formatOracleLines(out);
    }

    auditWrongAnswers++;
    const threshold = Number(audit?.silence?.triggerAfterWrongAnswers || 3);
    if(auditWrongAnswers >= threshold) return auditSilenceResponse(data);
    return formatOracleLines([...(st.fail || ['THE HOUSE DOES NOT NEED A SLOGAN. TRY A SMALLER, CLEANER ANSWER.']), ...(st.question || [])]);
  }

  async function answerOracle(raw){
    const q = String(raw || '').trim();
    if(!q) return t('terminal.askSmaller');
    try{
      const data = await loadOracle();
      if(auditState) return processAudit(q, data);
      if(patternHit(q, data?.audit?.startPatterns || [])) return beginAudit(data, q);
      let winner = null, score = 0;
      for(const intent of data.intents || []){
        const sc = scoreIntent(q, intent);
        if(sc > score){ score = sc; winner = intent; }
      }
      if(winner && score > 8 && winner.startAudit) return beginAudit(data, q);
      const pool = winner && score > 8 ? winner.responses : data.default;
      const list = Array.isArray(pool) && pool.length ? pool : [t('terminal.askSmaller')];
      const idx = Math.abs(Array.from(q).reduce((a,ch)=>((a*33) ^ ch.charCodeAt(0))|0, 5381)) % list.length;
      return list[idx] || t('terminal.askSmaller');
    }catch(e){
      console.warn('oracle unavailable', e);
      return t('terminal.oracleSealed');
    }
  }

  async function inspectTerminalBuffer(){
    const original = terminalBuffer.trim();
    const raw = original.replace(/\s+/g,'').toLowerCase();
    if(!original) return false;
    terminalEverUsed = true;

    if(!bypassArmed && !solved1 && raw.length >= 4){
      const h = await sha256Hex(raw + '|' + BYPASS_SALT);
      if(BYPASS_HASHES.has(h)){
        bypassArmed = true;
        terminalBuffer = '';
        terminalResponse = '';
        renderTerminalPrompt(true);
        toast(t('toast.fieldRecognized'));
        state = slots.map(n => ({id:n.id, rot:0}));
        renderMatrix();
        await solvePass1();
        return true;
      }
    }

    const answer = await answerOracle(original);
    terminalBuffer = '';
    terminalActive = true;
    terminalResponse = answer;
    terminalResponseUntil = auditState ? Infinity : Date.now() + Math.min(18000, Math.max(7000, answer.length * 72));
    renderTerminalPrompt(true);
    dropTerminalText(answer.slice(0, 36));
    return true;
  }

  function syncStorage(){
    try{ return JSON.parse(localStorage.getItem('WDR_SYNC_OVERRIDES') || '{}') || {}; }catch(_e){ return {}; }
  }
  function syncOverrideForTrack(id){
    const store = syncStorage();
    return Array.isArray(store[id]) && store[id].length ? store[id] : null;
  }
  function saveSyncOverride(id, cues){
    const store = syncStorage();
    store[id] = cues.map(c => ({start:+Number(c.start).toFixed(2), end:+Number(c.end).toFixed(2), text:c.text}));
    localStorage.setItem('WDR_SYNC_OVERRIDES', JSON.stringify(store));
  }
  function downloadSyncOverrides(){
    const blob = new Blob([JSON.stringify(syncStorage(), null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'lyrics.sync-overrides.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  let syncLab = null;
  function initSyncLab(){
    const p = new URLSearchParams(location.search);
    const local = ['localhost','127.0.0.1',''].includes(location.hostname) || location.protocol === 'file:';
    if(!p.has('sync') || !local) return;
    const panel = document.createElement('div');
    panel.className = 'syncPanel';
    panel.innerHTML = `
      <div class="syncTitle">sync lab</div>
      <div class="syncRead" id="syncRead">load a track</div>
      <div class="syncLine" id="syncLine">press TAP at the first spoken word of each cue</div>
      <div class="syncActions">
        <button type="button" id="syncTap">tap cue</button>
        <button type="button" id="syncUndo">undo</button>
        <button type="button" id="syncSave">save local</button>
        <button type="button" id="syncExport">export</button>
      </div>`;
    document.body.appendChild(panel);
    syncLab = {panel, idx:0, marks:[], track:null};
    const refresh = () => {
      if(!syncLab || currentTrack < 0) return;
      const tr = D.tracks[currentTrack];
      const base = (D.lyrics[tr.id] || []).map(c => ({...c, text:cleanText(c.text)}));
      if(!syncLab.track || syncLab.track !== tr.id){ syncLab.track = tr.id; syncLab.idx = 0; syncLab.marks = []; }
      const read = document.getElementById('syncRead');
      const line = document.getElementById('syncLine');
      if(read) read.textContent = `${tr.id} / ${fmt(playbackTime())} / cue ${Math.min(syncLab.idx+1, base.length)} of ${base.length}`;
      if(line) line.textContent = base[syncLab.idx]?.text || 'track done — save local or export';
    };
    const buildCorrected = () => {
      if(currentTrack < 0) return [];
      const tr = D.tracks[currentTrack];
      const base = (D.lyrics[tr.id] || []).map(c => ({...c, text:cleanText(c.text)}));
      const marks = syncLab.marks.slice();
      return base.map((c,i) => {
        const start = Number.isFinite(marks[i]) ? marks[i] : c.start;
        const next = Number.isFinite(marks[i+1]) ? marks[i+1] - 0.08 : c.end + (start - c.start);
        const end = Math.max(start + 0.6, next);
        return {start, end, text:c.text};
      });
    };
    const tap = () => {
      if(!syncLab || currentTrack < 0) return;
      const tr = D.tracks[currentTrack];
      if(!syncLab.track || syncLab.track !== tr.id){ syncLab.track = tr.id; syncLab.idx = 0; syncLab.marks = []; }
      const base = D.lyrics[tr.id] || [];
      if(syncLab.idx >= base.length) return;
      syncLab.marks[syncLab.idx] = playbackTime();
      syncLab.idx += 1;
      refresh();
    };
    document.getElementById('syncTap')?.addEventListener('click', tap);
    document.getElementById('syncUndo')?.addEventListener('click', () => { if(syncLab){ syncLab.idx=Math.max(0,syncLab.idx-1); syncLab.marks.pop(); refresh(); } });
    document.getElementById('syncSave')?.addEventListener('click', () => { if(currentTrack >= 0){ const tr=D.tracks[currentTrack]; saveSyncOverride(tr.id, buildCorrected()); resetTicker(tr); toast(lang()==='ru' ? 'синхронизация сохранена локально' : 'sync saved locally'); } });
    document.getElementById('syncExport')?.addEventListener('click', downloadSyncOverrides);
    document.addEventListener('keydown', e => {
      if(!syncLab) return;
      if(e.target && /input|textarea/i.test(e.target.tagName)) return;
      if(e.key === 'F8'){ e.preventDefault(); tap(); }
    });
    setInterval(refresh, 250);
  }

  function initTerminal(){
    els.tickerViewport?.setAttribute('tabindex','0');
    const arm = e => {
      if(!started) startBroadcast();
      if(!canTypeTerminal()) return;
      terminalEverUsed = true;
      terminalActive = true;
      terminalLastInputAt = Date.now();
      els.terminalBeacon?.classList.add('hidden');
      els.tickerViewport?.classList.remove('questionPulse');
      els.tickerViewport?.focus?.();
      renderTerminalPrompt(true);
    };
    els.tickerViewport?.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); arm(e); });
    els.terminalBeacon?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); arm(e); });

    document.addEventListener('keydown', e => {
      if(!terminalActive) return;
      if(e.metaKey || e.ctrlKey || e.altKey) return;
      if(!canTypeTerminal()){ renderTerminalPrompt(true); return; }
      const k = e.key;
      if(k === 'Enter'){
        e.preventDefault(); e.stopPropagation();
        inspectTerminalBuffer();
        return;
      }
      if(k === 'Escape'){
        e.preventDefault(); e.stopPropagation();
        terminalBuffer = '';
        if(!auditState){ terminalActive = false; terminalResponse = ''; }
        renderTerminalPrompt(true);
        return;
      }
      if(k === 'Backspace'){
        e.preventDefault(); e.stopPropagation();
        terminalLastInputAt = Date.now();
        terminalBuffer = terminalBuffer.slice(0, -1);
        renderTerminalPrompt(true);
        return;
      }
      if(k.length === 1){
        e.preventDefault(); e.stopPropagation();
        terminalEverUsed = true;
        terminalLastInputAt = Date.now();
        terminalBuffer = (terminalBuffer + k).slice(0, 128);
        dropTerminalChar(k);
        renderTerminalPrompt(true);
      }
    }, true);
  }

  async function maybeAutoAudit(){
    if(auditPromptShown || auditState || terminalEverUsed || !started || userPaused) return;
    const cfg = D.site?.progress || {};
    const secondsReady = activeListenSeconds >= Number(cfg.autoAuditSeconds || 75);
    const movesReady = matrixMoveCount >= Number(cfg.autoAuditMatrixMoves || 7);
    if(!secondsReady && !movesReady) return;

    auditPromptShown = true;
    auditStartedByAuto = true;
    try{
      const data = await loadOracle();
      terminalActive = true;
      terminalEverUsed = true;
      terminalResponse = beginAudit(data, movesReady ? 'matrix' : 'time');
      terminalResponseUntil = Infinity;
      els.terminalBeacon?.classList.remove('hidden');
      els.tickerViewport?.classList.add('questionPulse');
      renderTerminalPrompt(true);
    }catch(err){
      console.warn('auto audit unavailable', err);
      terminalResponse = t('terminal.autoQuestion');
      terminalResponseUntil = Date.now() + 20000;
      renderTerminalPrompt(true);
    }
  }

  async function maybeAuditTimers(){
    if(!auditState) return;
    let data;
    try{ data = await loadOracle(); }catch(_e){ return; }

    if(auditSilenceUntil){
      if(Date.now() < auditSilenceUntil) return;
      auditSilenceUntil = 0;
      terminalResponse = auditQuestion(data);
      terminalResponseUntil = Infinity;
      renderTerminalPrompt(true);
    }

    const timer = data?.audit?.waterTimer;
    if(!auditWaterNudged && timer?.states?.includes(auditState)){
      const elapsed = (Date.now() - auditStateEnteredAt) / 1000;
      if(elapsed >= Number(timer.afterSeconds || 38)){
        auditWaterNudged = true;
        terminalResponse = formatOracleLines([...(timer.responses || []), auditQuestion(data)]);
        terminalResponseUntil = Infinity;
        renderTerminalPrompt(true);
      }
    }
  }

  function positionTicker(t, force=false){
    t = Math.max(0, Number(t) || 0);
    renderSubtitleCue(t, force);
  }

  function updateSeekAndClock(t){
    if(currentTrack < 0) return;
    const dur = currentDurationHint();
    els.time.textContent = fmt(t);
    if(!seekDragging && !Number.isNaN(dur) && dur > 0) els.seek.value = Math.max(0, Math.min(100, (t / dur) * 100));
  }

  function tickerLoop(now=performance.now()){
    const wallDelta = Math.max(0, Math.min(1, (now - lastTickerWallTime) / 1000));
    lastTickerWallTime = now;
    const activelyPlaying = started && !userPaused && (Boolean(fallbackTimer) || !els.audio.paused);
    if(activelyPlaying) activeListenSeconds += wallDelta;

    const currentTime = playbackTime();
    if(currentTrack >= 0 || (started && els.audio.src)){
      if(Math.abs(currentTime - lastTickerT) > 0.001 || auditState || terminalActive || terminalResponse){
        positionTicker(currentTime, currentTime + 1 < lastTickerT);
        updateSeekAndClock(currentTime);
        lastTickerT = currentTime;
      }
    }
    maybeAutoAudit();
    maybeAuditTimers();
    requestAnimationFrame(tickerLoop);
  }
  function ensureRAF(){ if(!rafStarted){ rafStarted = true; requestAnimationFrame(tickerLoop); } }

  async function playSecretTrack(){
    if(!window.crypto || !crypto.subtle){ toast(lang()==='ru' ? 'криптография требует HTTPS или localhost' : 'crypto waits for https or localhost'); return; }
    try{
      stopFallback();
      const res = await fetch(D.quest.secret.url, {cache:'no-store'});
      if(!res.ok) throw new Error('encrypted file missing');
      const buf = await res.arrayBuffer();
      const u = new Uint8Array(buf);
      const magic = new TextDecoder().decode(u.slice(0, 8));
      if(!magic.startsWith('WDR15v1')) throw new Error('bad encrypted format');
      const salt = u.slice(8, 24);
      const iv = u.slice(24, 36);
      const cipher = u.slice(36);
      const keyCandidates = [
        `${D.quest.pass1Key}|${solvedStateString()}|FINAL_V1`,
        `${D.quest.pass1Key}|${solvedStateString()}|${D.quest.routeTarget}`,
        `${D.quest.pass1Key}|${solvedStateString()}|GITHUBFOLLOWHITEDUCK`,
        `${D.quest.pass1Key}|${solvedStateString()}|GITHUBFOLLOWWHITEDUCK`
      ];
      let plain = null;
      let lastDecryptErr = null;
      for(const keyMaterial of keyCandidates){
        try{
          const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(keyMaterial), 'PBKDF2', false, ['deriveKey']);
          const key = await crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:D.quest.secret.iterations, hash:'SHA-256'}, baseKey, {name:'AES-GCM', length:256}, false, ['decrypt']);
          plain = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, cipher);
          break;
        }catch(e){ lastDecryptErr = e; }
      }
      if(!plain) throw lastDecryptErr || new Error('final decrypt failed');
      const blob = new Blob([plain], {type:D.quest.secret.mime || 'audio/mpeg'});
      const blobUrl = URL.createObjectURL(blob);

      if(!D.lyrics['15']){
        D.lyrics['15'] = [{start:0, end:999, text:'SECRET TRACK UNLOCKED   ATTENTION OPENS THE CABINET   AWARENESS OPENS THE ARCHIVE'}];
      }
      const secretTrack = {id:'15', title:'15 — FINAL / THE KEY', src:blobUrl, durationHint:240, secret:true, subtitleMode:'exact', subtitleFitToAudio:false};
      let idx = D.tracks.findIndex(t => t.secret === true || t.id === '15');
      if(idx < 0){ D.tracks.push(secretTrack); idx = D.tracks.length - 1; }
      else { D.tracks[idx] = Object.assign(D.tracks[idx], secretTrack); }

      secretTrackUnlocked = true;
      terminalBuffer = '';
      terminalActive = false;
      started = true;
      userPaused = false;
      seekDragging = false;
      stopFallback();
      loadTrack(idx, true);
    }catch(err){
      console.warn(err);
      setTitle('15', '15 — FINAL / THE KEY');
      currentCues = [{start:0, end:999, text:'SECRET TRACK UNLOCKED   encrypted final waits for localhost or deployed origin'}];
      lyricScale = 1; lyricOffset = 0; lyricEndRaw = 999;
      currentCueIndex = -2;
      tickerLineReady = true;
      renderSubtitleCue(0, true);
      toast(t('toast.finalFailed'));
    }
  }

  function burstSignal(text, label){
    const wrap = document.createElement('div');
    wrap.className = 'signalBurst';
    const lab = document.createElement('div');
    lab.className = 'burstLabel';
    lab.textContent = label || '';
    wrap.appendChild(lab);
    const seed = String(text || '').replace(/\s+/g,'');
    const chars = (seed + seed + 'FILEDOORARCHIVE').slice(0, 90).split('');
    chars.forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch;
      span.style.left = `${3 + ((i * 17) % 94)}%`;
      span.style.animationDelay = `${((i * 37) % 720) / 1000}s`;
      span.style.animationDuration = `${1.05 + ((i * 11) % 90) / 100}s`;
      wrap.appendChild(span);
    });
    document.body.appendChild(wrap);
    window.setTimeout(() => wrap.remove(), 2400);
  }

  function initFunding(){
    const f = D.site.funding;
    els.walletTon.textContent = f.tonAddress || f.usdtTonAddress;
    if(els.walletUsdtTon) els.walletUsdtTon.textContent = f.usdtTonAddress;
    els.walletTrc.textContent = f.usdtTrc20Address;
    if(els.walletBep) els.walletBep.textContent = f.usdtBep20Address || 'USDT_BEP20_ADDRESS_PLACEHOLDER';
    $('donateLink').href = f.donateUrl === 'DONATION_URL_PLACEHOLDER' ? '#' : f.donateUrl;
    document.querySelectorAll('.copyAddr').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const target = $(btn.dataset.copy);
        const value = target ? target.textContent.trim() : '';
        if(value) navigator.clipboard?.writeText(value).then(() => toast(t('toast.routeCopied'))).catch(() => toast(t('toast.copyManually')));
        if(!started) startBroadcast();
      });
    });
    renderProgress();
    fetchProgress();
    const pollMs = Math.max(10000, Number(D.site?.progress?.pollMs || 30000));
    if(progressPoll) window.clearInterval(progressPoll);
    progressPoll = window.setInterval(fetchProgress, pollMs);
  }

  function updateTraceBlocks(){
    [...els.traceGrid].forEach((b, i) => b.classList.toggle('seen', seenTrace.has(i)));
  }

  function initTrace(){
    const board = document.getElementById('traceBoard');
    if(!board || board.dataset.bound === '1') return;
    board.dataset.bound = '1';
    const reveal = target => {
      const words = [...board.querySelectorAll('.traceWord')];
      const w = target.closest?.('.traceWord');
      if(!w) return;
      const i = words.indexOf(w);
      if(i < 0) return;
      if(!started) startBroadcast();
      seenTrace.add(i);
      w.classList.add('seen');
      updateTraceBlocks();
      els.traceReveal.textContent = w.dataset.note || '';
      if(els.traceReceipt) els.traceReceipt.textContent = seenTrace.size===9 ? t('receipt.marksComplete') : t('receipt.marks',{n:seenTrace.size});
    };
    board.addEventListener('pointerover', e => reveal(e.target));
    board.addEventListener('focusin', e => reveal(e.target));
    board.addEventListener('click', e => reveal(e.target));
  }


  function initShipMarks(){
    const wrap = document.getElementById('shipMarks');
    if(!wrap || wrap.dataset.bound === '1') return;
    wrap.dataset.bound = '1';
    const seen = new Set();
    const reveal = target => {
      const btn = target.closest?.('button');
      if(!btn || !wrap.contains(btn)) return;
      const buttons = [...wrap.querySelectorAll('button')];
      const i = buttons.indexOf(btn);
      const squares = els.shipSquares ? [...els.shipSquares.querySelectorAll('span')] : [];
      if(!started) startBroadcast();
      seen.add(i);
      btn.classList.add('seen');
      if(squares[i]) squares[i].classList.add('seen');
      if(els.shipReveal) els.shipReveal.textContent = btn.dataset.note || (lang()==='ru' ? 'корпус отвечает фрагментами' : 'the hull answers in fragments');
    };
    wrap.addEventListener('pointerover', e => reveal(e.target));
    wrap.addEventListener('focusin', e => reveal(e.target));
    wrap.addEventListener('click', e => reveal(e.target));
  }

  function typeWatcherText(text){
    if(!els.watcherKoan) return;
    if(watcherTypeTimer) window.clearInterval(watcherTypeTimer);
    const full = String(text || '');
    let i = 0;
    els.watcherKoan.classList.add('typing');
    els.watcherKoan.textContent = '';
    watcherTypeTimer = window.setInterval(() => {
      i += 1;
      els.watcherKoan.textContent = full.slice(0, i);
      if(i >= full.length){ window.clearInterval(watcherTypeTimer); watcherTypeTimer = null; window.setTimeout(() => els.watcherKoan?.classList.remove('typing'), 550); }
    }, 18);
  }

  function initWatcher(){
    if(!els.watcher || !els.watcherMark) return;
    const whisper = () => {
      const local = lang()==='ru' ? window.LSH_CONTENT?.ru?.watcherKoans : null;
      const pool = Array.isArray(local) && local.length ? local : WATCHER_KOANS;
      typeWatcherText(pool[Math.floor(Math.random() * pool.length)]);
    };
    els.watcherMark.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); whisper(); els.watcher.classList.toggle('open'); if(!started) startBroadcast(); });
    els.watcherMark.addEventListener('pointerenter', () => { whisper(); if(!started) startBroadcast(); });
    document.addEventListener('click', e => { if(!e.target.closest('.watcher')) els.watcher.classList.remove('open'); });
  }

  function initQrModal(){
    document.querySelectorAll('.showQr').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        if(els.qrRouteImage) els.qrRouteImage.src = btn.dataset.qr || '';
        if(els.qrRouteLabel) els.qrRouteLabel.textContent = btn.dataset.route || t('routes.route');
        if(els.qrRouteWarning) els.qrRouteWarning.textContent = btn.dataset.warning || t('routes.genericWarning');
        els.qrModal?.classList.remove('hidden');
        els.qrModal?.setAttribute('aria-hidden','false');
      });
    });
    const close = e => { e?.preventDefault?.(); e?.stopPropagation?.(); els.qrModal?.classList.add('hidden'); els.qrModal?.setAttribute('aria-hidden','true'); };
    els.qrClose?.addEventListener('click', close);
    els.qrModal?.addEventListener('click', e => { if(e.target === els.qrModal) close(e); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape' && !terminalActive) close(e); });
  }

  function attachAudioEvents(){
    els.audio.addEventListener('play', () => { stopFallback(); ensureRAF(); updateRadioStatus(true); });
    els.audio.addEventListener('pause', () => { if(!fallbackTimer) updateRadioStatus(false); });
    els.audio.addEventListener('loadedmetadata', () => {
      if(pendingSeekPct !== null && Number.isFinite(els.audio.duration) && els.audio.duration > 0){
        try{ els.audio.currentTime = Math.max(0, Math.min(pendingSeekPct * els.audio.duration, Math.max(0, els.audio.duration - 0.02))); }catch(_e){}
        pendingSeekPct = null;
      }
      buildSubtitleTimeline(D.tracks[currentTrack] || {}, els.audio.duration || 0);
      updateSeekAndClock(els.audio.currentTime || 0);
      positionTicker(els.audio.currentTime || 0, true);
    });
    els.audio.addEventListener('durationchange', () => { buildSubtitleTimeline(D.tracks[currentTrack] || {}, els.audio.duration || 0); updateSeekAndClock(els.audio.currentTime || 0); });
    els.audio.addEventListener('seeking', () => { positionTicker(els.audio.currentTime || 0, true); updateSeekAndClock(els.audio.currentTime || 0); });
    els.audio.addEventListener('seeked', () => { positionTicker(els.audio.currentTime || 0, true); updateSeekAndClock(els.audio.currentTime || 0); });
    els.audio.addEventListener('ended', () => { if(currentTrack >= 0) loadTrack(currentTrack + 1, true); });
    els.audio.addEventListener('error', () => {
      const tr = D.tracks[currentTrack] || {};
      if(tr.secret || String(tr.src || '').startsWith('blob:')){
        toast(lang()==='ru' ? 'источник секретного аудио отклонён' : 'secret audio source refused');
        updateRadioStatus(false);
        return;
      }
      if(started && currentTrack >= 0 && !userPaused) startFallbackCarrier();
    });
    els.tickerViewport.addEventListener('pointerenter', () => { tickerHold = true; });
    els.tickerViewport.addEventListener('pointerleave', () => { tickerHold = false; positionTicker(playbackTime(), true); });
    window.addEventListener('resize', () => positionTicker(playbackTime(), true));
    const seekToValue = () => {
      const dur = currentDurationHint();
      const pct = Math.max(0, Math.min(1, Number(els.seek.value) / 100));
      const t = pct * dur;
      if(fallbackTimer){
        fallbackT = t;
        positionTicker(t, true);
        updateSeekAndClock(t);
        return;
      }
      try{
        if(Number.isFinite(els.audio.duration) && els.audio.duration > 0){
          els.audio.currentTime = Math.max(0, Math.min(t, Math.max(0, els.audio.duration - 0.02)));
        } else {
          pendingSeekPct = pct;
          els.audio.load?.();
        }
      }catch(err){ console.warn('seek ignored', err); pendingSeekPct = pct; }
      positionTicker(t, true);
      updateSeekAndClock(t);
    };
    els.seek.addEventListener('pointerdown', () => { seekDragging = true; });
    els.seek.addEventListener('input', () => { seekDragging = true; seekToValue(); });
    els.seek.addEventListener('change', () => { seekToValue(); seekDragging = false; updateSeekAndClock(playbackTime()); });
    els.seek.addEventListener('pointerup', () => { seekToValue(); seekDragging = false; updateSeekAndClock(playbackTime()); });
    els.seek.addEventListener('pointercancel', () => { seekDragging = false; updateSeekAndClock(playbackTime()); });
    window.addEventListener('pointerup', () => { if(seekDragging){ seekDragging = false; updateSeekAndClock(playbackTime()); } });
    els.seek.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ seekToValue(); seekDragging = false; } });
  }

  function attachControls(){
    [els.prev, els.play, els.next, els.seek, els.volDial, els.lowDial, els.midDial, els.highDial].filter(Boolean).forEach(el => {
      el.addEventListener('pointerdown', e => e.stopPropagation());
      el.addEventListener('click', e => e.stopPropagation());
      el.addEventListener('pointerup', e => e.stopPropagation());
    });
    els.play.addEventListener('click', e => { e.preventDefault(); togglePlayback(); });
    els.prev.addEventListener('click', e => { e.preventDefault(); playPrev(); });
    els.next.addEventListener('click', e => { e.preventDefault(); playNext(); });
    els.tune.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); startBroadcast(); });
    els.root.addEventListener('pointerdown', e => { if(e.target.closest('[data-control-zone]')) return; if(!started) startBroadcast(); }, {passive:true});
    document.addEventListener('keydown', () => { if(!started) startBroadcast(); }, {once:true});
  }

  function initDev(){
    const p = new URLSearchParams(location.search);
    const local = ['localhost','127.0.0.1',''].includes(location.hostname) || location.protocol === 'file:';
    if(!p.has('dev') || !local) return;
    const panel = document.createElement('div'); panel.className = 'devPanel';
    panel.innerHTML = '<button type="button" id="devSolve1">solve rain</button><button type="button" id="devOpenGate">open public gate</button><button type="button" id="devSolve2">solve route</button>';
    document.body.appendChild(panel);
    $('devSolve1').addEventListener('click', () => { state = slots.map(n => ({id:n.id, rot:0})); renderMatrix(); solvePass1(); });
    $('devOpenGate').addEventListener('click', () => {
      const target = Number(D.site?.progress?.target || 1999);
      progressState = normalizeProgress({completions:999, donationCredits:1000, combined:target, target, unlocked:true, online:false});
      renderProgress();
      toast(lang()==='ru' ? 'локальный тест: публичные врата открыты' : 'local test: public gate open');
    });
    $('devSolve2').addEventListener('click', () => { if(!solved1){ state = slots.map(n => ({id:n.id, rot:0})); renderMatrix(); solvePass1(); } progressState = normalizeProgress({...progressState, combined:progressState.target, unlocked:true}); applyStageTwoGate(); keyTraceActive = true; keyIndex = D.quest.pass1Key.length; renderKeySlots(); renderRouteTape(); completeRoute(); });
  }

  function init(){
    renderMatrix();
    initFunding();
    restoreAuditReceipt();
    initShipMarks();
    initTrace();
    initWatcher();
    initQrModal();
    initKnobs();
    initTerminal();
    initSyncLab();
    attachAudioEvents();
    attachControls();
    renderKeySlots();
    renderRouteTape();
    if(D.tracks[0]) resetTicker(D.tracks[0]);
    updateRadioStatus(false);
    document.addEventListener('selectstart', e => { if(e.target.closest('.matrixShell')) e.preventDefault(); });
    window.addEventListener('resize', () => positionTicker(playbackTime(), true));

    document.addEventListener('lsh:language', () => {
      oracleData = null;
      oraclePromise = null;
      if(auditState){
        // Restart the active audit in the selected language at the same gate.
        loadOracle().then(data => {
          terminalResponse = auditQuestion(data);
          terminalResponseUntil = Infinity;
          renderTerminalPrompt(true);
        }).catch(()=>{});
      }
      const tr = D.tracks[currentTrack >= 0 ? currentTrack : 0];
      if(tr) setTitle(tr.id, tr.title.replace(/_/g,' '));
      updateRadioStatus(started && !userPaused && (Boolean(fallbackTimer) || !els.audio.paused));
      renderProgress();
      restoreAuditReceipt();
      updateInspect();
      renderKeySlots();
      renderRouteTape();
      [...document.querySelectorAll('.traceWord')].forEach((w,i)=>w.classList.toggle('seen',seenTrace.has(i)));
      positionTicker(playbackTime(), true);
    });

    retryPendingCompletion();
    initDev();
  }

  init();
})();
