const noteTitle = document.getElementById('note-title');
const noteBody = document.getElementById('note-body');
const liveShell = document.getElementById('live-shell');
const liveVideo = document.getElementById('live-video');
const liveSnapshot = document.getElementById('live-snapshot');
const liveDvrFrame = document.getElementById('live-dvr-frame');
const livePill = document.getElementById('live-pill');
const liveTitle = document.getElementById('live-title');
const liveMessage = document.getElementById('live-message');

const streamUrl = 'http://localhost:8888/cam1/index.m3u8';
const snapshotUrl = 'http://44.3.44.133/webcapture.jpg?command=snap&channel=1';
let hlsInstance;
let snapshotTimer;

const storyNotes = {
  mattino: {
    title: 'Luce del mattino sulla vallata',
    body: 'Qui puoi raccontare visibilita, condizioni del cielo, passaggio di nubi, colori dell alba e qualita del panorama osservato dalla telecamera.'
  },
  tecnica: {
    title: 'Diario della telecamera live',
    body: 'Questo blocco e pensato per note tecniche: DVR Xiongmai, plugin proprietario, tentativi RTSP, conversione futura in HLS o WebRTC per l integrazione nel blog.'
  },
  territorio: {
    title: 'Eventi e movimento sul paesaggio',
    body: 'Usalo per piccoli aggiornamenti editoriali su neve, vento, tramonti, presenze sul territorio e scorci particolari catturati durante la giornata.'
  }
};

document.querySelectorAll('[data-story]').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.story;
    const story = storyNotes[key];
    if (!story) {
      return;
    }

    noteTitle.textContent = story.title;
    noteBody.textContent = story.body;
  });
});

function setLiveUi(state, message) {
  if (!liveShell || !livePill || !liveTitle || !liveMessage) {
    return;
  }

  if (state === 'live') {
    liveShell.classList.add('is-live');
    liveShell.classList.remove('is-fallback');
    if (liveSnapshot) {
      liveSnapshot.style.display = 'none';
    }
    if (liveDvrFrame) {
      liveDvrFrame.style.display = 'none';
    }
    livePill.textContent = 'Live attivo';
    liveTitle.textContent = 'Trasmissione in diretta';
    liveMessage.textContent = message;
    return;
  }

  liveShell.classList.remove('is-live');
  liveShell.classList.add('is-fallback');
  if (liveSnapshot) {
    liveSnapshot.style.display = 'block';
  }
  if (liveDvrFrame) {
    liveDvrFrame.style.display = 'none';
  }
  livePill.textContent = 'Offline tecnico';
  liveTitle.textContent = 'Player live in attesa di sorgente compatibile';
  liveMessage.textContent = message;
}

function refreshSnapshot() {
  if (!liveSnapshot) {
    return;
  }
  liveSnapshot.src = `${snapshotUrl}&_ts=${Date.now()}`;
}

async function streamReachable() {
  try {
    const response = await fetch(streamUrl, {
      method: 'GET',
      cache: 'no-store'
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

function startHlsPlayback() {
  if (!liveVideo) {
    return;
  }

  if (liveVideo.canPlayType('application/vnd.apple.mpegurl')) {
    liveVideo.src = streamUrl;
    liveVideo.play().catch(() => {});
    return;
  }

  if (window.Hls && window.Hls.isSupported()) {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
    hlsInstance = new window.Hls({
      lowLatencyMode: true
    });
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(liveVideo);
    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
      liveVideo.play().catch(() => {});
    });
    return;
  }

  setLiveUi('offline', 'Browser senza supporto HLS. Prova Safari o abilita HLS.js.');
}

async function refreshLiveState() {
  const available = await streamReachable();
  if (!available) {
    setLiveUi('offline', 'Video RTSP non disponibile. Mostro snapshot aggiornato della telecamera ogni 3 secondi.');
    refreshSnapshot();
    if (!snapshotTimer) {
      snapshotTimer = setInterval(refreshSnapshot, 3000);
    }
    return;
  }

  if (snapshotTimer) {
    clearInterval(snapshotTimer);
    snapshotTimer = null;
  }

  setLiveUi('live', 'Feed HLS agganciato da MediaMTX su localhost:8888/cam1/index.m3u8');
  startHlsPlayback();
}

refreshLiveState();
setInterval(refreshLiveState, 15000);
