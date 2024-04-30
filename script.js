function findPlayingVideo() {
  const videos = Array.from(document.querySelectorAll("video"))
    .filter((video) => video.readyState != 0)
    .filter((video) => video.disablePictureInPicture == false)
    .sort((v1, v2) => {
      const v1Rect = v1.getClientRects()[0] || { width: 0, height: 0 };
      const v2Rect = v2.getClientRects()[0] || { width: 0, height: 0 };
      return v2Rect.width * v2Rect.height - v1Rect.width * v1Rect.height;
    });

  if (videos.length === 0) {
    return;
  }

  return videos[0];
}

const playingVideo = findPlayingVideo();

async function requestPictureInPicture(video) {
  await video.requestPictureInPicture();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "get user's setting") {
    const forward = request.forward;
    const backward = request.backward;
    const playbackRate = request.playbackRate;
    console.log(forward, backward, playbackRate);
    sendResponse("got message:" + JSON.stringify(request));
    if (findPlayingVideo()) {
      navigator.mediaSession.setActionHandler("play", function () {
        findPlayingVideo().playbackRate = 1;
        findPlayingVideo().play();
      });

      navigator.mediaSession.setActionHandler("previousslide", function () {
        const skipTime = +forward || 10;
        findPlayingVideo().currentTime = Math.max(
          findPlayingVideo().currentTime - skipTime,
          0
        );
      });

      navigator.mediaSession.setActionHandler("nextslide", function () {
        const skipTime = +backward || 10;
        findPlayingVideo().currentTime = Math.min(
          findPlayingVideo().currentTime + skipTime,
          findPlayingVideo().duration
        );
      });
      navigator.mediaSession.setActionHandler("togglemicrophone", function () {
        if (findPlayingVideo().playbackRate !== 1) {
          findPlayingVideo().playbackRate = 1;
        } else if (findPlayingVideo().playbackRate !== playbackRate) {
          findPlayingVideo().playbackRate = playbackRate;
        }
      });
      requestPictureInPicture(findPlayingVideo());
    }
  }
  return true;
});
