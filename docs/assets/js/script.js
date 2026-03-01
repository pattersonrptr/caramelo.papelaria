// ── Year in footer ──
const yearEl = document.querySelector(".year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Animated background: falling petals & sparkles ──
(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Gradient stops
  const BG_TOP    = "#fce8f8";
  const BG_BOTTOM = "#ede0f8";

  // Petal & sparkle colors
  const COLORS = [
    "rgba(232, 48, 122, 0.55)",   // rose
    "rgba(247, 128, 176, 0.50)",  // rose-lt
    "rgba(176, 110, 192, 0.50)",  // purple-lt
    "rgba(212, 160, 23, 0.45)",   // gold
    "rgba(240, 200, 255, 0.60)",  // purple-pale
    "rgba(253, 232, 242, 0.65)",  // rose-pale
  ];

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x          = Math.random() * W;
      this.y          = initial ? Math.random() * H : -30;
      this.color      = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.speedY     = 0.5 + Math.random() * 0.8;
      this.speedX     = (Math.random() - 0.5) * 0.5;
      this.rotation   = Math.random() * Math.PI * 2;
      this.rotSpeed   = (Math.random() - 0.5) * 0.03;
      this.wobble     = Math.random() * Math.PI * 2;
      this.wobbleSpd  = 0.01 + Math.random() * 0.015;
      this.alpha      = 0.45 + Math.random() * 0.45;

      const shapes = ["petal", "petal", "petal", "sparkle", "heart", "sparkle"];
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
      this.size  = this.shape === "sparkle"
        ? 4 + Math.random() * 6
        : 10 + Math.random() * 18;
    }

    update() {
      this.wobble    += this.wobbleSpd;
      this.rotation  += this.rotSpeed;
      this.x         += this.speedX + Math.sin(this.wobble) * 0.6;
      this.y         += this.speedY;
      if (this.y > H + 40) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = this.color;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      switch (this.shape) {
        case "petal":   drawPetal(ctx, this.size);   break;
        case "heart":   drawHeart(ctx, this.size * 0.6); break;
        default:        drawSparkle(ctx, this.size); break;
      }

      ctx.restore();
    }
  }

  // ── Shapes ──
  function drawPetal(ctx, s) {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.38, s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHeart(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.bezierCurveTo( s, -s,      s,   s * 0.4, 0,   s);
    ctx.bezierCurveTo(-s,  s * 0.4, -s, -s,      0,  -s * 0.3);
    ctx.fill();
  }

  function drawSparkle(ctx, s) {
    const arms = 4;
    ctx.beginPath();
    for (let i = 0; i < arms * 2; i++) {
      const angle = (i * Math.PI) / arms;
      const r = i % 2 === 0 ? s : s * 0.35;
      i === 0
        ? ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
        : ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
  }

  // ── Init & loop ──
  function init() {
    resize();
    const count = Math.min(50, Math.floor((W * H) / 18000));
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, BG_TOP);
    grad.addColorStop(1, BG_BOTTOM);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => { resize(); init(); });
  init();
  loop();
})();
