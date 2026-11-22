(() => {
  // 1. Dark / Light Theme Toggle
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      }
    });
  }

  // 2. Background Animation Toggle
  const motionBtn = document.getElementById("motion-toggle");
  if (motionBtn) {
    motionBtn.addEventListener("click", () => {
      const isOff = document.documentElement.getAttribute("data-motion") === "off";
      if (isOff) {
        document.documentElement.removeAttribute("data-motion");
        localStorage.setItem("motion", "on");
      } else {
        document.documentElement.setAttribute("data-motion", "off");
        localStorage.setItem("motion", "off");
      }
      window.dispatchEvent(new Event("motion-preference-changed"));
    });
  }

  // 3. Keep Floating Toggle Buttons Parked Above the Footer at Bottom of Page
  const footer = document.querySelector(".site-footer");
  const toggles = [themeBtn, motionBtn].filter(Boolean);

  function updateToggleOffset() {
    if (!footer || toggles.length === 0) return;

    const baseGap = window.innerWidth <= 700 ? 16 : 24;
    const footerRect = footer.getBoundingClientRect();
    const visibleFooterHeight = Math.max(0, window.innerHeight - footerRect.top);
    const nextBottom = visibleFooterHeight > 0 ? visibleFooterHeight + 14 : baseGap;

    toggles.forEach((btn) => {
      btn.style.bottom = `${nextBottom}px`;
    });
  }

  updateToggleOffset();
  window.addEventListener("scroll", updateToggleOffset, { passive: true });
  window.addEventListener("resize", updateToggleOffset);
})();
