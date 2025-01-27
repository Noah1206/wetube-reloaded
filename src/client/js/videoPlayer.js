const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");

console.log(video, playBtn, muteBtn, time, volume);

const handlePlayLClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
};

const handlePause = (e) => {
  playBtn.innerText = "Play";
};
const handlePlay = (e) => {
  playBtn.innerText = "Pause";
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  } else {
    video.muted = true;
    muteBtn.innerText = "UnMute";
  }
};

playBtn.addEventListener("click", handlePlayLClick);
video.addEventListener("pause", handlePause);
video.addEventListener("play", handlePlay);
muteBtn.addEventListener("click", handleMute);
