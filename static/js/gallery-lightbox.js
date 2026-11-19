(() => {
  const lightbox = document.getElementById("gallery-lightbox");
  if (!lightbox) return;

  const triggers = Array.from(document.querySelectorAll("[data-lightbox-src]"));
  const imgEl = document.getElementById("lightbox-img");
  const capEl = document.getElementById("lightbox-caption");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  let currentIndex = 0;

  function openAt(index) {
    currentIndex = (index + triggers.length) % triggers.length;
    const target = triggers[currentIndex];
    imgEl.src = target.dataset.lightboxSrc;
    imgEl.alt = target.dataset.lightboxCaption || "";
    capEl.textContent = target.dataset.lightboxCaption || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  triggers.forEach((el, idx) => {
    el.addEventListener("click", () => openAt(idx));
  });

  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", () => openAt(currentIndex - 1));
  nextBtn.addEventListener("click", () => openAt(currentIndex + 1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") openAt(currentIndex - 1);
    if (e.key === "ArrowRight") openAt(currentIndex + 1);
  });
})();
