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
      // Notify ambient-grid.js immediately
      window.dispatchEvent(new Event("motion-preference-changed"));
    });
  }
})();
