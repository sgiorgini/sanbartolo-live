
const liveImage = document.getElementById('live-image');
const statusBadge = document.getElementById('status-badge');
const lastUpdate = document.getElementById('last-update');
const imageState = document.getElementById('image-state');
const refreshButton = document.getElementById('refresh-button');

const REFRESH_INTERVAL_MS = 5000;
const STALE_THRESHOLD_MS = 180000;

let lastSnapshotTime = null;

function formatTime(date) {
  return date.toLocaleTimeString('it-IT', { hour12: false });
}

function setStatus(text, className) {
  statusBadge.textContent = text;
  statusBadge.className = `status-badge ${className}`;
}

function updateImageState(text) {
  imageState.textContent = text;
}

async function loadStatus() {
  try {
    setStatus('Aggiornamento...', 'status-loading');

    const res = await fetch(`status.json?ts=${Date.now()}`);

    if (!res.ok) {
      throw new Error("status.json non trovato");
    }

    const data = await res.json();

    const imageUrl = `live/${data.latest}?ts=${Date.now()}`;
    liveImage.src = imageUrl;

    const snapshotTime = new Date(data.time);
    lastSnapshotTime = snapshotTime;

    lastUpdate.textContent = formatTime(snapshotTime);

    setStatus('Live', 'status-live');
    updateImageState('Immagine aggiornata');

  } catch (err) {
    setStatus('Errore', 'status-error');
    updateImageState('Impossibile leggere status.json');
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

loadStatus();
setInterval(loadStatus, REFRESH_INTERVAL_MS);
setInterval(checkStale, 10000);