document.querySelectorAll("[data-slideshow]").forEach((slideshow) => {
  const slides = [...slideshow.querySelectorAll(".slide")];
  const dots = [...slideshow.querySelectorAll(".slide-dot")];
  const counter = slideshow.querySelector(".slide-counter");
  let currentIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  slideshow.querySelectorAll(".slide-image img").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
    });
  });

  const showSlide = (index, direction = 1) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
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

  slideshow.querySelector(".slideshow-previous").addEventListener("click", () => {
    showSlide(currentIndex - 1, -1);
  });
  slideshow.querySelector(".slideshow-next").addEventListener("click", () => {
    showSlide(currentIndex + 1, 1);
  });
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      showSlide(dotIndex, dotIndex >= currentIndex ? 1 : -1);
    });
  });

  const stage = slideshow.querySelector(".slideshow-stage");
  stage.addEventListener("touchstart", (event) => {
    const [touch] = event.touches;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  stage.addEventListener("touchend", (event) => {
    const [touch] = event.changedTouches;
    const horizontalDistance = touch.clientX - touchStartX;
    const verticalDistance = touch.clientY - touchStartY;

    if (
      Math.abs(horizontalDistance) < 50
      || Math.abs(horizontalDistance) < Math.abs(verticalDistance)
    ) {
      return;
    }

    if (horizontalDistance > 0) {
      showSlide(currentIndex - 1, -1);
    } else {
      showSlide(currentIndex + 1, 1);
    }
  });
});
