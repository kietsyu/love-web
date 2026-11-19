document.querySelectorAll("[data-slideshow]").forEach((slideshow) => {
  const slides = [...slideshow.querySelectorAll(".slide")];
  const dots = [...slideshow.querySelectorAll(".slide-dot")];
  const counter = slideshow.querySelector(".slide-counter");
  const stage = slideshow.querySelector(".slideshow-stage");

  let currentIndex = 0;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let isDragging = false;
  let isHorizontalSwipe = null;

  slideshow.querySelectorAll(".slide-image img").forEach((image) => {
    image.setAttribute("draggable", "false");
    image.addEventListener("error", () => {
      image.hidden = true;
    });
  });

  const showSlide = (index, direction = 1) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.style.transition = "";
      slide.style.transform = "";
      slide.style.opacity = "";
      slide.classList.toggle("is-active", slideIndex === currentIndex);
      slide.classList.remove("slide-from-left", "slide-from-right");
    });

    slides[currentIndex].classList.add(
      direction === 1 ? "slide-from-right" : "slide-from-left",
    );

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
    });

    counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      showSlide(dotIndex, dotIndex >= currentIndex ? 1 : -1);
    });
  });

  // 1. Start pulling
  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    isDragging = true;
    isHorizontalSwipe = null;
    startX = event.clientX;
    startY = event.clientY;
    deltaX = 0;

    const activeSlide = slides[currentIndex];
    activeSlide.classList.remove("slide-from-left", "slide-from-right");
    activeSlide.style.transition = "none";
    stage.classList.add("is-dragging");
  });

  // 2. Follow cursor in real time while pulling
  window.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    // Lock intent on first movement so vertical page scrolling still works on touch
    if (isHorizontalSwipe === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      isHorizontalSwipe = Math.abs(dx) >= Math.abs(dy);
    }

    if (!isHorizontalSwipe) return;

    deltaX = dx;
    const activeSlide = slides[currentIndex];
    const tilt = Math.max(-4, Math.min(4, deltaX * 0.015));
    const fade = Math.max(0.55, 1 - Math.abs(deltaX) / 900);

    activeSlide.style.transform = `translate3d(${deltaX}px, 0, 0) rotate(${tilt}deg)`;
    activeSlide.style.opacity = `${fade}`;
  }, { passive: true });

  // 3. Release: either switch slide or spring back to center
  const finishDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    stage.classList.remove("is-dragging");

    const activeSlide = slides[currentIndex];
    const threshold = 75;

    if (isHorizontalSwipe && Math.abs(deltaX) >= threshold) {
      if (deltaX > 0) {
        showSlide(currentIndex - 1, -1);
      } else {
        showSlide(currentIndex + 1, 1);
      }
    } else {
      // Spring smoothly back to center if not pulled far enough
      activeSlide.style.transition = "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease";
      activeSlide.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
      activeSlide.style.opacity = "1";
    }

    deltaX = 0;
    isHorizontalSwipe = null;
  };

  window.addEventListener("pointerup", finishDrag);
  window.addEventListener("pointercancel", finishDrag);
});
