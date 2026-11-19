/* ==========================================================================
   INTERACTIVE DOT-GRID BACKGROUND (STANDALONE DECORATION SCRIPT)
   ========================================================================== */
(() => {
  const canvas = document.getElementById("ambient-dot-canvas");
  if (!canvas) return;

  // Respect reduced-motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d");

  // --- Easy-to-tweak decoration settings ---
  const CONFIG = {
    spacing: 28,                         // Distance between dots (px)
    dotRadius: 1.35,                     // Base size of each dot (px)
    dotColor: "rgba(37, 54, 74, 0.42)",  // Coastal Blue ink tone
    repelRadius: 130,                    // How far from cursor dots react (px)
    repelStrength: 22,                   // Maximum push distance (px)
    springEase: 0.12,                    // How smoothly dots return (0.05 - 0.25)
  };

  let width = 0;
  let height = 0;
  let dpr = 1;
  let dots = [];
  const mouse = { x: -9999, y: -9999 };

  function buildGrid() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    dots = [];
    const cols = Math.ceil(width / CONFIG.spacing) + 1;
    const rows = Math.ceil(height / CONFIG.spacing) + 1;
    const offsetX = (width % CONFIG.spacing) / 2;
    const offsetY = (height % CONFIG.spacing) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const homeX = offsetX + c * CONFIG.spacing;
        const homeY = offsetY + r * CONFIG.spacing;
        dots.push({ homeX, homeY, x: homeX, y: homeY });
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = CONFIG.dotColor;

    const rSq = CONFIG.repelRadius * CONFIG.repelRadius;

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      let targetX = dot.homeX;
      let targetY = dot.homeY;

      if (!prefersReducedMotion) {
        const dx = dot.homeX - mouse.x;
        const dy = dot.homeY - mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < rSq && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / CONFIG.repelRadius) * CONFIG.repelStrength;
          targetX += (dx / dist) * force;
          targetY += (dy / dist) * force;
        }
      }

      dot.x += (targetX - dot.x) * CONFIG.springEase;
      dot.y += (targetY - dot.y) * CONFIG.springEase;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, CONFIG.dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildGrid, 120);
  });

  buildGrid();
  render();
})();
