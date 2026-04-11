const liveImage = document.getElementById('live-image');

function refreshImage() {
  if (!liveImage) {
    return;
  }

  liveImage.src = `live/latest.jpg?ts=${Date.now()}`;
}

refreshImage();
setInterval(refreshImage, 30000);
