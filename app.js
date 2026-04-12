const liveImage = document.getElementById('live-image');
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

let sourceIndex = 0;

function setImageSource() {
  const imageSource = sources[sourceIndex % sources.length];
  const separator = imageSource.includes('?') ? '&' : '?';
  liveImage.src = `${imageSource}${separator}ts=${Date.now()}`;
}

function refreshImage() {
  if (!liveImage) {
    return;
  }

  setImageSource();
}

if (liveImage) {
  liveImage.addEventListener('error', () => {
    sourceIndex += 1;
    setImageSource();
  });
}

refreshImage();
setInterval(refreshImage, 3000);
