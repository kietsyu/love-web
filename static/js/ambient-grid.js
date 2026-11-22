/* ==========================================================================
   HIGH-FPS WATER-WAVE, CURSOR-RIPPLE & SPARKLES BACKGROUND (WITH TOGGLE)
   ========================================================================== */
(() => {
  const canvas = document.getElementById("ambient-dot-canvas");
  if (!canvas) return;

  const systemReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d", { alpha: true });

  const CONFIG = {
    spacing: 27,                           // Clean spacing (~40% fewer vertices, smoother FPS)
    dotSize: 2.6,                          // Crisp dot diameter (px)
    dotColor: "rgba(37, 54, 74, 0.42)",
    sparkleCount: 11,
    sparkleColor: "rgba(37, 54, 74, 1)",
    sparkleGlyphs: ["✦", "✧", "·"],
    repelRadius: 130,
    repelStrength: 10,
    springEase: 0.14,
    waveAmplitude: 2.0,
    waveSpeed: 0.002,
    rippleMaxRadius: 350,
    rippleSpeed: 5.3,
    rippleBand: 25,
    rippleStrength: 20,
    maxRipples: 5,
  };

  let width = 0;
  let height = 0;
  let dots = [];
  let sparkles = [];
  let ripples = [];
  let rafId = null;
  const mouse = { x: -9999, y: -9999, lastSpawnX: -9999, lastSpawnY: -9999 };

  function isMotionDisabled() {
    return systemReducedMotion || document.documentElement.getAttribute("data-motion") === "off";
  }

  function createSparkle(randomY = true) {
    const glyph = CONFIG.sparkleGlyphs[Math.floor(Math.random() * CONFIG.sparkleGlyphs.length)];
    return {
      baseX: Math.random() * width,
      baseY: randomY ? Math.random() * height : height + 20 + Math.random() * 60,
      x: 0,
      y: 0,
      offsetX: 0,
      offsetY: 0,
      speedY: 0.28 + Math.random() * 0.42,
      swayAmp: 12 + Math.random() * 18,
      swayFreq: 0.0008 + Math.random() * 0.0009,
      phase: Math.random() * Math.PI * 2,
      size: glyph === "·" ? 18 + Math.random() * 6 : 11 + Math.random() * 5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.012,
      maxAlpha: 0.35 + Math.random() * 0.3,
      glyph,
    };
  }

  function buildScene() {
    // Cap DPR at 1.25 so Retina/4K screens don't multiply pixel fill cost by 4x
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
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

    sparkles = [];
    for (let i = 0; i < CONFIG.sparkleCount; i++) {
      const s = createSparkle(true);
      s.x = s.baseX;
      s.y = s.baseY;
      sparkles.push(s);
    }

    if (isMotionDisabled()) {
      drawStaticFrame();
    }
  }

  function drawStaticFrame() {
    ctx.clearRect(0, 0, width, height);
    const isDark = document.documentElement.dataset.theme === "dark";
    ctx.fillStyle = isDark ? "rgba(191, 208, 222, 0.35)" : CONFIG.dotColor;

    const half = CONFIG.dotSize * 0.5;
    ctx.beginPath();
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      dot.x = dot.homeX;
      dot.y = dot.homeY;
      ctx.rect(dot.homeX - half, dot.homeY - half, CONFIG.dotSize, CONFIG.dotSize);
    }
    ctx.fill();
  }

  function spawnRipple(x, y, strengthMultiplier = 1) {
    if (isMotionDisabled()) return;
    ripples.push({
      x,
      y,
      radius: 8,
      strength: CONFIG.rippleStrength * strengthMultiplier,
    });
    if (ripples.length > CONFIG.maxRipples) {
      ripples.shift();
    }
  }

  function getInteractiveOffset(originX, originY, multiplier = 1) {
    let pushX = 0;
    let pushY = 0;

    const dx = originX - mouse.x;
    const dy = originY - mouse.y;
    const distSq = dx * dx + dy * dy;
    const rSq = CONFIG.repelRadius * CONFIG.repelRadius;

    if (distSq < rSq && distSq > 0.01) {
      const dist = Math.sqrt(distSq);
      const force = (1 - dist / CONFIG.repelRadius) * CONFIG.repelStrength * multiplier;
      pushX += (dx / dist) * force;
      pushY += (dy / dist) * force;
    }

    for (let k = 0; k < ripples.length; k++) {
      const rip = ripples[k];
      const rdx = originX - rip.x;
      const rdy = originY - rip.y;
      const minR = Math.max(0, rip.radius - CONFIG.rippleBand);
      const maxR = rip.radius + CONFIG.rippleBand;
      const rDistSq = rdx * rdx + rdy * rdy;

      if (rDistSq > minR * minR && rDistSq < maxR * maxR && rDistSq > 0.01) {
        const rDist = Math.sqrt(rDistSq);
        const bandPos = (rDist - rip.radius) / CONFIG.rippleBand;
        const crest = Math.cos(bandPos * (Math.PI * 0.5));
        const life = 1 - rip.radius / CONFIG.rippleMaxRadius;
        const wavePush = crest * life * rip.strength * multiplier;

        pushX += (rdx / rDist) * wavePush;
        pushY += (rdy / rDist) * wavePush;
      }
    }

    return { pushX, pushY };
  }

  function render(time = 0) {
    if (isMotionDisabled()) {
      rafId = null;
      drawStaticFrame();
      return;
    }

    if (document.hidden) {
      rafId = requestAnimationFrame(render);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    const t = time * CONFIG.waveSpeed;

    const isDark = document.documentElement.dataset.theme === "dark";
    const activeDotColor = isDark ? "rgba(191, 208, 222, 0.35)" : CONFIG.dotColor;
    const activeSparkleColor = isDark ? "rgba(238, 243, 248, 0.85)" : CONFIG.sparkleColor;

    for (let k = ripples.length - 1; k >= 0; k--) {
      ripples[k].radius += CONFIG.rippleSpeed;
      if (ripples[k].radius > CONFIG.rippleMaxRadius) {
        ripples.splice(k, 1);
      }
    }

    // --- 1. Single-Batch Dot Rendering (1 GPU fill call instead of 3,000+) ---
    ctx.fillStyle = activeDotColor;
    const half = CONFIG.dotSize * 0.5;
    ctx.beginPath();

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      let targetX = dot.homeX
        + Math.sin(dot.homeY * 0.014 + t) * CONFIG.waveAmplitude
        + Math.cos((dot.homeX + dot.homeY) * 0.008 - t * 0.8) * (CONFIG.waveAmplitude * 0.5);
      let targetY = dot.homeY
        + Math.cos(dot.homeX * 0.014 + t * 0.9) * CONFIG.waveAmplitude
        + Math.sin((dot.homeX - dot.homeY) * 0.008 + t * 0.7) * (CONFIG.waveAmplitude * 0.5);

      const { pushX, pushY } = getInteractiveOffset(targetX, targetY, 1);
      targetX += pushX;
      targetY += pushY;

      dot.x += (targetX - dot.x) * CONFIG.springEase;
      dot.y += (targetY - dot.y) * CONFIG.springEase;

      ctx.rect(dot.x - half, dot.y - half, CONFIG.dotSize, CONFIG.dotSize);
    }
    ctx.fill();

    // --- 2. Render Floating Sparkles ---
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < sparkles.length; i++) {
      const s = sparkles[i];
      s.baseY -= s.speedY;
      s.rotation += s.rotSpeed;

      if (s.baseY < -30) {
        Object.assign(s, createSparkle(false));
      }

      const naturalX = s.baseX + Math.sin(time * s.swayFreq + s.phase) * s.swayAmp;
      const naturalY = s.baseY;

      const { pushX, pushY } = getInteractiveOffset(naturalX, naturalY, 1.35);
      s.offsetX += (pushX - s.offsetX) * CONFIG.springEase;
      s.offsetY += (pushY - s.offsetY) * CONFIG.springEase;

      s.x = naturalX + s.offsetX;
      s.y = naturalY + s.offsetY;

      const edgeFade = Math.min(1, Math.max(0, (height - s.y) / 120))
                     * Math.min(1, Math.max(0, (s.y + 20) / 120));

      ctx.save();
      ctx.globalAlpha = s.maxAlpha * edgeFade;
      ctx.fillStyle = activeSparkleColor;
      ctx.font = `${s.size}px "Be Vietnam Pro", sans-serif`;
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.fillText(s.glyph, 0, 0);
      ctx.restore();
    }

    rafId = requestAnimationFrame(render);
  }

  function startOrStopLoop() {
    if (isMotionDisabled()) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      ripples = [];
      drawStaticFrame();
    } else if (!rafId) {
      rafId = requestAnimationFrame(render);
    }
  }

  window.addEventListener("motion-preference-changed", startOrStopLoop);

  // Also redraw static frame immediately if theme changes while motion is off
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    if (isMotionDisabled()) requestAnimationFrame(drawStaticFrame);
  });

  window.addEventListener("mousemove", (e) => {
    if (isMotionDisabled()) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    const moveDx = mouse.x - mouse.lastSpawnX;
    const moveDy = mouse.y - mouse.lastSpawnY;
    const moveDist = Math.hypot(moveDx, moveDy);

    if (moveDist >= 38) {
      const speedScale = Math.min(1.4, Math.max(0.65, moveDist / 60));
      spawnRipple(mouse.x, mouse.y, speedScale);
      mouse.lastSpawnX = mouse.x;
      mouse.lastSpawnY = mouse.y;
    }
  }, { passive: true });

  window.addEventListener("mousedown", (e) => {
    spawnRipple(e.clientX, e.clientY, 1.65);
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildScene, 120);
  });

  buildScene();
  startOrStopLoop();
})();
