(() => {
  const MAX_ACTIVE_VIDEOS = 3;
  const activeStages = [];

  function resetStage(stage) {
    if (!stage || !stage.classList.contains("is-playing")) return;
    stage.classList.remove("is-playing");
    stage.innerHTML = stage.dataset.originalHtml || "";
  }

  document.querySelectorAll(".video-stage").forEach((stage) => {
    // Save original thumbnail + play button markup so we can restore it cleanly
    stage.dataset.originalHtml = stage.innerHTML;

    const activatePlayer = () => {
      if (stage.classList.contains("is-playing")) return;

      const type = stage.dataset.videoType;
      const src = stage.dataset.videoSrc;
      if (!src) return;

      // Enforce the 2-video limit by resetting the oldest playing card
      while (activeStages.length >= MAX_ACTIVE_VIDEOS) {
        const oldestStage = activeStages.shift();
        resetStage(oldestStage);
      }

      stage.classList.add("is-playing");
      stage.innerHTML = "";
      activeStages.push(stage);

      if (type === "embed") {
        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        iframe.allowFullscreen = true;
        stage.appendChild(iframe);
      } else {
        const video = document.createElement("video");
        video.src = src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        stage.appendChild(video);
      }
    };

    stage.addEventListener("click", activatePlayer);
    stage.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activatePlayer();
      }
    });
  });
})();
