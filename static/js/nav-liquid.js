(() => {
  const header = document.querySelector(".site-header");
  const sideFrames = document.querySelectorAll(".side-frame");
  const nav = document.querySelector(".site-nav");
  const drop = nav ? nav.querySelector(".nav-liquid-drop") : null;
  if (!nav || !drop) return;

  const links = Array.from(nav.querySelectorAll("a"));
  const activeLink = nav.querySelector("a.is-active");
  let hoveredLink = null;
  let isVerticalState = false;
  let fadeTimer = null;

  function moveDropTo(target, instant = false) {
    if (!target) {
      drop.style.opacity = "0";
      return;
    }

    if (instant) {
      drop.style.transition = "none";
    }

    const isVertical = nav.classList.contains("is-vertical");
    const overhangX = isVertical ? 6 : 4;
    const overhangY = isVertical ? 3 : 6;

    const width = target.offsetWidth + overhangX * 2;
    const height = target.offsetHeight + overhangY * 2;
    const x = target.offsetLeft - overhangX;
    const y = target.offsetTop - overhangY;

    drop.style.width = `${width}px`;
    drop.style.height = `${height}px`;
    drop.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    drop.style.opacity = "1";

    if (instant) {
      drop.getBoundingClientRect();
      drop.style.transition = "";
    }
  }

  function syncDropPosition() {
    const target = hoveredLink || activeLink;
    if (target) {
      moveDropTo(target, true);
    }
  }

  function updateScrollState() {
    const shouldBeVertical = window.scrollY > 90;

    if (header) {
      header.classList.toggle("is-hidden", shouldBeVertical);
    }
    sideFrames.forEach((frame) => frame.classList.toggle("is-hidden", shouldBeVertical));

    if (shouldBeVertical === isVerticalState) return;
    isVerticalState = shouldBeVertical;

    // 1. Fade out current bar
    nav.classList.add("is-fading");
    clearTimeout(fadeTimer);

    // 2. While invisible, switch orientation & snap Liquid Glass bubble, then fade in
    fadeTimer = setTimeout(() => {
      nav.classList.toggle("is-vertical", shouldBeVertical);
      syncDropPosition();
      requestAnimationFrame(() => {
        nav.classList.remove("is-fading");
      });
    }, 210);
  }

  // Initial setup without fade on page load
  isVerticalState = window.scrollY > 90;
  if (header) header.classList.toggle("is-hidden", isVerticalState);
  sideFrames.forEach((frame) => frame.classList.toggle("is-hidden", isVerticalState));
  nav.classList.toggle("is-vertical", isVerticalState);
  if (activeLink) moveDropTo(activeLink, true);

  links.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      hoveredLink = link;
      moveDropTo(link);
    });
    link.addEventListener("focus", () => {
      hoveredLink = link;
      moveDropTo(link);
    });
  });

  nav.addEventListener("mouseleave", () => {
    hoveredLink = null;
    if (activeLink) {
      moveDropTo(activeLink);
    } else {
      drop.style.opacity = "0";
    }
  });

  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", syncDropPosition);
})();
