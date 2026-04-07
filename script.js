const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

(function initMusicCatalog() {
  const trackDataScript = document.getElementById("track-data");
  const catalogList = document.getElementById("catalog-list");
  const audio = document.getElementById("main-audio-player");
  const audioSource = document.getElementById("main-audio-source");
  const playerArt = document.getElementById("player-art");
  const playerTitle = document.getElementById("player-title");
  const playerRole = document.getElementById("player-role");
  const playerCopy = document.getElementById("player-copy");
  const playerDuration = document.getElementById("player-duration");
  const playerAvailability = document.getElementById("player-availability");
  const downloadButton = document.getElementById("download-button");
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));

  if (!trackDataScript || !catalogList || !audio || !audioSource) return;

  let tracks = [];
  try {
    tracks = JSON.parse(trackDataScript.textContent);
  } catch (error) {
    console.error("Could not parse track data:", error);
    return;
  }

  let currentTrack = null;
  let itemElements = [];
  let currentFilter = "all";

  function updatePlayer(track) {
    currentTrack = track;

    playerArt.src = track.image;
    playerArt.alt = `${track.title} artwork`;
    playerTitle.textContent = track.title;
    playerRole.textContent = track.roleLabel;
    playerRole.classList.toggle("free", track.roleFilter === "free");
    playerCopy.textContent = track.blurb;
    playerAvailability.textContent = track.availability || "Preview stream";
    playerDuration.textContent = "Loading…";

    audio.pause();
    audioSource.src = track.preview;
    audio.load();

    if (track.fullDownload) {
      downloadButton.href = track.fullDownload;
      downloadButton.classList.remove("hidden");
    } else {
      downloadButton.classList.add("hidden");
      downloadButton.removeAttribute("href");
    }
  }

  function setActiveItem(track, clickedItem) {
    itemElements.forEach((item) => {
      const isActive = item === clickedItem;
      item.classList.toggle("active", isActive);
      const trigger = item.querySelector(".catalog-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", String(isActive));
    });

    updatePlayer(track);
  }

  function renderItems() {
    catalogList.innerHTML = "";

    const visibleTracks = tracks.filter((track) => {
      return currentFilter === "all" ? true : track.roleFilter === currentFilter;
    });

    visibleTracks.forEach((track) => {
      const item = document.createElement("article");
      item.className = "catalog-item";
      item.dataset.role = track.roleFilter;

      item.innerHTML = `
        <button class="catalog-trigger" type="button" aria-expanded="false">
          <img class="catalog-thumb" src="${track.image}" alt="${track.title} artwork" />
          <div class="catalog-main">
            <div class="catalog-title-row">
              <h3>${track.title}</h3>
              <span class="catalog-role ${track.roleFilter === "free" ? "free" : ""}">${track.roleLabel}</span>
            </div>
            <p class="catalog-blurb">${track.blurb}</p>
          </div>
          <span class="catalog-arrow">+</span>
        </button>
        <div class="catalog-detail">
          <p>${track.blurb}</p>
          <small>${track.fullDownload ? "Includes full free download." : "Preview stream only."}</small>
        </div>
      `;

      const trigger = item.querySelector(".catalog-trigger");
      trigger.addEventListener("click", () => {
        setActiveItem(track, item);
      });

      catalogList.appendChild(item);
    });

    itemElements = Array.from(catalogList.querySelectorAll(".catalog-item"));

    if (!visibleTracks.length) return;

    const defaultTrack =
      visibleTracks.find((track) => currentTrack && track.title === currentTrack.title) ||
      visibleTracks[0];

    const defaultItem = itemElements.find((item) => {
      const heading = item.querySelector("h3");
      return heading && heading.textContent === defaultTrack.title;
    });

    if (defaultItem) {
      setActiveItem(defaultTrack, defaultItem);
    }
  }

  audio.addEventListener("loadedmetadata", () => {
    playerDuration.textContent = formatDuration(audio.duration);
  });

  audio.addEventListener("error", () => {
    playerDuration.textContent = "Unavailable";
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter || "all";

      filterButtons.forEach((btn) => {
        btn.classList.toggle("active", btn === button);
      });

      renderItems();
    });
  });

  renderItems();
})();

(function initLightbox() {
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
