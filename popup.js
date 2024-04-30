const btnPlay = document.querySelector(".btn-play");
const forwardSecond = document.querySelector("#seekforward");
const backwardSecond = document.querySelector("#seekbackward");
const playbackRate = document.querySelector("#playbackRate");

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab;
}

forwardSecond.value = localStorage.getItem("forward");
backwardSecond.value = localStorage.getItem("backward");
playbackRate.value = localStorage.getItem("playbackRate");

btnPlay.addEventListener("click", function () {
  async function sendMsgToContentScript() {
    const tab = await getActiveTab();
    const ret = await chrome.tabs.sendMessage(tab.id, {
      message: "get user's setting",
      forward: forwardSecond.value,
      backward: backwardSecond.value,
      playbackRate: Math.min(Math.max(playbackRate.value, 0.25), 4),
    });
  }
  sendMsgToContentScript();
  localStorage.setItem("forward", forwardSecond.value);
  localStorage.setItem("backward", backwardSecond.value);
  localStorage.setItem(
    "playbackRate",
    Math.min(Math.max(playbackRate.value, 0.25), 4)
  );
  window.close();
});
