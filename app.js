const liveImage = document.getElementById('live-image');
const params = new URLSearchParams(window.location.search);

const externalSource = params.get('src');
const localSource = 'latest.jpg';
const imageSource = externalSource || localSource;

function refreshImage() {
  if (!liveImage) {
    return;
  }

  const separator = imageSource.includes('?') ? '&' : '?';
  liveImage.src = `${imageSource}${separator}ts=${Date.now()}`;
}

refreshImage();
setInterval(refreshImage, 3000);
