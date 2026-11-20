(() => {
  const lightbox = document.getElementById("gallery-lightbox");
  if (!lightbox) return;

  const panel = lightbox.querySelector(".lightbox-panel");
  const triggers = Array.from(document.querySelectorAll("[data-lightbox-src]"));
  const imgEl = document.getElementById("lightbox-img");
  const capEl = document.getElementById("lightbox-caption");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  let currentIndex = 0;

  // Zoom & Pan State
  const MIN_SCALE = 1;
  const MAX_SCALE = 4.5;
  let scale = 1;
  let panX = 0;
  let panY = 0;

  // Desktop drag-pan state
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;

  // Mobile pinch-to-zoom state
  let initialPinchDist = 0;
  let initialPinchScale = 1;

  function lockPageScroll() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function unlockPageScroll() {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function applyTransform(smooth = false) {
    if (scale <= 1) {
      scale = 1;
      panX = 0;
      panY = 0;
    }
    imgEl.style.transition = smooth
      ? "transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    imgEl.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
    imgEl.classList.toggle("is-zoomed", scale > 1);
  }

  function resetZoom(smooth = false) {
    scale = 1;
    panX = 0;
    panY = 0;
    isPanning = false;
    imgEl.classList.remove("is-zoomed", "is-panning");
    applyTransform(smooth);
  }

  // Zoom toward a specific screen point (cursor or pinch midpoint)
  function zoomAtPoint(nextScale, clientX, clientY, smooth = false) {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
    if (clamped === 1) {
      resetZoom(smooth);
      return;
    }

    const rect = imgEl.getBoundingClientRect();
    const imgCenterX = rect.left + rect.width / 2;
    const imgCenterY = rect.top + rect.height / 2;

    const offsetFromCenterX = clientX - imgCenterX;
    const offsetFromCenterY = clientY - imgCenterY;
    const ratio = clamped / scale;

    panX -= offsetFromCenterX * (ratio - 1);
    panY -= offsetFromCenterY * (ratio - 1);
    scale = clamped;

    applyTransform(smooth);
  }

  function openAt(index) {
    currentIndex = (index + triggers.length) % triggers.length;
    const target = triggers[currentIndex];
    resetZoom(false);

    imgEl.src = target.dataset.lightboxSrc;
    imgEl.alt = target.dataset.lightboxCaption || "";
    capEl.textContent = target.dataset.lightboxCaption || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    lockPageScroll();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    resetZoom(false);
    unlockPageScroll();
  }

  triggers.forEach((el, idx) => {
    el.addEventListener("click", () => openAt(idx));
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => openAt(currentIndex - 1));
  nextBtn.addEventListener("click", () => openAt(currentIndex + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target === panel) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") openAt(currentIndex - 1);
    if (e.key === "ArrowRight") openAt(currentIndex + 1);
  });

  // 1. Desktop Mouse Wheel: Zoom directly toward cursor & block background scroll
  lightbox.addEventListener(
    "wheel",
    (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      e.preventDefault();

      const zoomFactor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
      zoomAtPoint(scale * zoomFactor, e.clientX, e.clientY, false);
    },
    { passive: false },
  );

  // Block mobile background touch-scroll anywhere on the lightbox overlay
  lightbox.addEventListener(
    "touchmove",
    (e) => {
      if (!lightbox.classList.contains("is-open")) return;
      e.preventDefault();
    },
    { passive: false },
  );

  // Double-click to toggle 2.2x zoom at cursor or reset
  imgEl.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom(true);
    } else {
      zoomAtPoint(2.2, e.clientX, e.clientY, true);
    }
  });

  // 2. Desktop Click-and-Drag Panning when zoomed in
  imgEl.addEventListener("mousedown", (e) => {
    if (scale <= 1 || e.button !== 0) return;
    e.preventDefault();
    isPanning = true;
    panStartX = e.clientX - panX;
    panStartY = e.clientY - panY;
    imgEl.classList.add("is-panning");
  });

  window.addEventListener(
    "mousemove",
    (e) => {
      if (!isPanning) return;
      panX = e.clientX - panStartX;
      panY = e.clientY - panStartY;
      applyTransform(false);
    },
    { passive: true },
  );

  window.addEventListener("mouseup", () => {
    if (!isPanning) return;
    isPanning = false;
    imgEl.classList.remove("is-panning");
  });

  // 3. Mobile Two-Finger Pinch-to-Zoom & Single-Finger Pan
  function getTouchDistance(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY,
    );
  }

  function getTouchMidpoint(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }

  imgEl.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isPanning = false;
        initialPinchDist = getTouchDistance(e.touches);
        initialPinchScale = scale;
      } else if (e.touches.length === 1 && scale > 1) {
        isPanning = true;
        panStartX = e.touches[0].clientX - panX;
        panStartY = e.touches[0].clientY - panY;
      }
    },
    { passive: false },
  );

  imgEl.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 2 && initialPinchDist > 0) {
        e.preventDefault();
        const currentDist = getTouchDistance(e.touches);
        const mid = getTouchMidpoint(e.touches);
        const nextScale = initialPinchScale * (currentDist / initialPinchDist);
        zoomAtPoint(nextScale, mid.x, mid.y, false);
      } else if (e.touches.length === 1 && isPanning && scale > 1) {
        e.preventDefault();
        panX = e.touches[0].clientX - panStartX;
        panY = e.touches[0].clientY - panStartY;
        applyTransform(false);
      }
    },
    { passive: false },
  );

  imgEl.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) {
      initialPinchDist = 0;
    }
    if (e.touches.length === 0) {
      isPanning = false;
      if (scale <= 1.02) resetZoom(true);
    }
  });
})();
