const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });
}

(function initImageLightbox() {
  const triggers = Array.from(document.querySelectorAll("[data-lightbox-image]"));
  if (!triggers.length) return;

  const overlay = document.createElement("div");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0, 0, 0, 0.86)";
  overlay.style.display = "none";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.padding = "24px";
  overlay.style.zIndex = "9999";

  overlay.innerHTML = `
    <button type="button" aria-label="Close image viewer" style="
      position:absolute;
      top:18px;
      right:18px;
      width:44px;
      height:44px;
      border-radius:999px;
      border:1px solid rgba(255,255,255,0.18);
      background:rgba(255,255,255,0.08);
      color:#fff;
      font-size:24px;
      cursor:pointer;
    ">×</button>
    <img alt="" style="
      max-width:min(1100px, 100%);
      max-height:88vh;
      width:auto;
      height:auto;
      display:block;
      border-radius:18px;
      box-shadow:0 18px 80px rgba(0,0,0,0.42);
    " />
  `;

  const closeButton = overlay.querySelector("button");
  const lightboxImage = overlay.querySelector("img");

  function closeLightbox() {
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "";
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const src = trigger.getAttribute("data-lightbox-image");
      const alt = trigger.getAttribute("data-lightbox-alt") || "";
      if (!src) return;

      lightboxImage.src = src;
      lightboxImage.alt = alt;
      overlay.style.display = "flex";
      overlay.setAttribute("aria-hidden", "false");
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });

  document.body.appendChild(overlay);
})();

(function initBeatModal() {
  const triggers = Array.from(document.querySelectorAll("[data-beat-title]"));
  const modal = document.getElementById("beat-modal");
  if (!triggers.length || !modal) return;

  const modalArt = document.getElementById("beat-modal-art");
  const modalTitle = document.getElementById("beat-modal-title");
  const modalRole = document.getElementById("beat-modal-role");
  const modalDescription = document.getElementById("beat-modal-description");
  const modalNote = document.getElementById("beat-modal-note");
  const closeButton = document.getElementById("beat-modal-close");
  const playButton = document.getElementById("beat-play-button");
  const progress = document.getElementById("beat-progress");
  const time = document.getElementById("beat-time");
  const audio = document.getElementById("beat-audio-engine");
  const downloadButton = document.getElementById("beat-download-button");

  let currentDuration = 0;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function updateTime() {
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(currentDuration)}`;
  }

  function updatePlayLabel() {
    playButton.textContent = audio.paused ? "Play Preview" : "Pause";
  }

  function closeBeatModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    audio.pause();
    audio.currentTime = 0;
    progress.value = 0;
    currentDuration = 0;
    updateTime();
    updatePlayLabel();
  }

  function openBeatModal(trigger) {
    const title = trigger.dataset.beatTitle || "";
    const role = trigger.dataset.beatRole || "";
    const preview = trigger.dataset.beatPreview || "";
    const image = trigger.dataset.beatImage || "";
    const description = trigger.dataset.beatDescription || "";
    const note = trigger.dataset.beatNote || "";
    const full = trigger.dataset.beatFull || "";

    modalTitle.textContent = title;
    modalRole.textContent = role;
    modalRole.classList.toggle("free", role.toLowerCase() === "free");
    modalDescription.textContent = description;
    modalNote.textContent = note;
    modalArt.src = image;
    modalArt.alt = `${title} artwork`;

    audio.pause();
    audio.currentTime = 0;
    currentDuration = 0;
    progress.value = 0;
    audio.src = preview;
    audio.load();
    updateTime();
    updatePlayLabel();

    if (full) {
      downloadButton.href = full;
      downloadButton.classList.add("show");
    } else {
      downloadButton.removeAttribute("href");
      downloadButton.classList.remove("show");
    }

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openBeatModal(trigger);
    });
  });

  closeButton.addEventListener("click", closeBeatModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeBeatModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) {
      closeBeatModal();
    }
  });

  playButton.addEventListener("click", async () => {
    if (!audio.src) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("Audio playback failed:", error);
      }
    } else {
      audio.pause();
    }

    updatePlayLabel();
  });

  audio.addEventListener("loadedmetadata", () => {
    currentDuration = audio.duration || 0;
    progress.value = 0;
    updateTime();
  });

  audio.addEventListener("timeupdate", () => {
    if (currentDuration > 0) {
      progress.value = (audio.currentTime / currentDuration) * 100;
    }
    updateTime();
  });

  audio.addEventListener("play", updatePlayLabel);
  audio.addEventListener("pause", updatePlayLabel);

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    progress.value = 0;
    updatePlayLabel();
    updateTime();
  });

  progress.addEventListener("input", () => {
    if (!currentDuration) return;
    audio.currentTime = (Number(progress.value) / 100) * currentDuration;
    updateTime();
  });

  updateTime();
  updatePlayLabel();
})();
