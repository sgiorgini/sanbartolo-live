
const liveImage = document.getElementById('live-image');
const statusBadge = document.getElementById('status-badge');
const lastUpdate = document.getElementById('last-update');
const imageState = document.getElementById('image-state');
const refreshButton = document.getElementById('refresh-button');

const params = new URLSearchParams(window.location.search);
const externalSource = params.get('src');
const pageBasePath = window.location.pathname.replace(/[^/]*$/, '');

const sources = [
  externalSource,
  'latest.jpg',
  `${pageBasePath}latest.jpg`,
  '/sanbartolo-live/latest.jpg',
  '/latest.jpg'
].filter(Boolean);

const REFRESH_INTERVAL_MS = 3000;
const STALE_THRESHOLD_MS = 120000;

let sourceIndex = 0;
let lastSuccessfulLoadTime = null;
let lastImageUrl = '';
let staleCheckTimer = null;

function formatTime(date) {
  return date.toLocaleTimeString('it-IT', { hour12: false });
}

function setStatus(text, className) {
  statusBadge.textContent = text;
  statusBadge.className = `status-badge ${className}`;
}

function updateLastUpdateTime(date) {
  lastUpdate.textContent = formatTime(date);
}

function updateImageState(text) {
  imageState.textContent = text;
}

function getCurrentSource() {
  return sources[sourceIndex % sources.length];
}

function buildImageUrl(baseSource) {
  const separator = baseSource.includes('?') ? '&' : '?';
  return `${baseSource}${separator}ts=${Date.now()}`;
}

function refreshImage() {
  if (!liveImage) {
    return;
  }

  const imageSource = getCurrentSource();
  const imageUrl = buildImageUrl(imageSource);

  setStatus('Aggiornamento...', 'status-loading');
  liveImage.src = imageUrl;
}

function markAsStaleIfNeeded() {
  if (!lastSuccessfulLoadTime) {
    return;
  }

  const now = Date.now();
  const elapsed = now - lastSuccessfulLoadTime;

  if (elapsed >= STALE_THRESHOLD_MS) {
    setStatus('Immagine ferma', 'status-stale');
    updateImageState('Nessun aggiornamento recente rilevato');
  }
}

function startStaleChecker() {
  if (staleCheckTimer) {
    clearInterval(staleCheckTimer);
  }

  staleCheckTimer = setInterval(markAsStaleIfNeeded, 5000);
}

if (liveImage) {
  liveImage.addEventListener('load', () => {
    const now = new Date();
    const currentSrc = liveImage.currentSrc || liveImage.src;

    const changed = currentSrc !== lastImageUrl;

    lastSuccessfulLoadTime = now.getTime();
    updateLastUpdateTime(now);

    if (changed) {
      setStatus('Live', 'status-live');
      updateImageState('Immagine aggiornata correttamente');
      lastImageUrl = currentSrc;
    } else {
      setStatus('Live', 'status-live');
      updateImageState('Immagine ricaricata');
    }
  });

  liveImage.addEventListener('error', () => {
    sourceIndex += 1;

    if (sourceIndex < sources.length) {
      setStatus('Tentativo fallback...', 'status-loading');
      updateImageState(`Provo sorgente alternativa (${sourceIndex + 1}/${sources.length})`);
      const fallbackSource = getCurrentSource();
      liveImage.src = buildImageUrl(fallbackSource);
      return;
    }

    setStatus('Errore', 'status-error');
    updateImageState('Impossibile caricare l’immagine da tutte le sorgenti disponibili');
    sourceIndex = 0;
  });
}

if (refreshButton) {
  refreshButton.addEventListener('click', refreshImage);
}

refreshImage();
setInterval(refreshImage, REFRESH_INTERVAL_MS);
startStaleChecker();