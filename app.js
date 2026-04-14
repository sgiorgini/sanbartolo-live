const liveImage = document.getElementById('live-image');
const statusBadge = document.getElementById('status-badge');
const lastUpdate = document.getElementById('last-update');
const imageState = document.getElementById('image-state');
const refreshButton = document.getElementById('refresh-button');

const REFRESH_INTERVAL_MS = 5000;
const IMAGE_REFRESH_INTERVAL_MS = 3000;
const STALE_THRESHOLD_MS = 180000;

let lastSnapshotTime = null;
let latestImageName = 'latest.jpg';
let imageSourceIndex = 0;

const imageSources = [
  (name) => `live/${name}`,
  (name) => `${name}`
];

function formatTime(date) {
  return date.toLocaleTimeString('it-IT', { hour12: false });
}

function setStatus(text, className) {
  if (!statusBadge) return;
  statusBadge.textContent = text;
  statusBadge.className = `status-badge ${className}`;
}

function updateImageState(text) {
  if (!imageState) return;
  imageState.textContent = text;
}

function refreshImage() {
  if (!liveImage) return;

  const sourceBuilder = imageSources[imageSourceIndex % imageSources.length];
  const base = sourceBuilder(latestImageName);
  const sep = base.includes('?') ? '&' : '?';
  const nonce = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  liveImage.src = `${base}${sep}ts=${nonce}`;
}

async function loadStatus() {
  try {
    setStatus('Aggiornamento...', 'status-loading');

    const res = await fetch(`status.json?ts=${Date.now()}`, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!data.latest || !data.time) {
      throw new Error('status.json incompleto');
    }

    latestImageName = data.latest;
    refreshImage();

    const snapshotTime = new Date(data.time);
    if (Number.isNaN(snapshotTime.getTime())) {
      throw new Error('timestamp non valido');
    }

    lastSnapshotTime = snapshotTime;
    lastUpdate.textContent = formatTime(snapshotTime);

    setStatus('Live', 'status-live');
    updateImageState('Immagine aggiornata');
  } catch (err) {
    console.error(err);
    setStatus('Errore', 'status-error');
    updateImageState(`Impossibile leggere status.json`);
    refreshImage();
  }
}

function checkStale() {
  if (!lastSnapshotTime) return;

  const now = new Date();
  const diff = now - lastSnapshotTime;

  if (diff > STALE_THRESHOLD_MS) {
    setStatus('Immagine ferma', 'status-stale');
    updateImageState('Nessun aggiornamento recente');
  }
}

if (refreshButton) {
  refreshButton.addEventListener('click', loadStatus);
}

if (liveImage) {
  liveImage.addEventListener('error', () => {
    imageSourceIndex += 1;
    refreshImage();
  });
}

refreshImage();
loadStatus();
setInterval(loadStatus, REFRESH_INTERVAL_MS);
setInterval(refreshImage, IMAGE_REFRESH_INTERVAL_MS);
setInterval(checkStale, 10000);