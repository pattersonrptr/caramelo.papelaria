// ── Year in footer ──
const yearEl = document.querySelector(".year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Animated background canvas ──
(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Palette matching the CSS theme
  const COLORS = [
    "rgba(232, 184, 150, 0.55)", // caramel-lt
    "rgba(232, 164, 176, 0.50)", // rose
    "rgba(245, 208, 216, 0.45)", // rose-lt
    "rgba(201, 184, 232, 0.45)", // lilac
    "rgba(232, 224, 245, 0.40)", // lilac-lt
    "rgba(253, 246, 238, 0.60)", // cream
  ];

  const BG_GRADIENT_TOP    = "#fdf0e8";
  const BG_GRADIENT_BOTTOM = "#f5e6f0";

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // ── Particle class ──
  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x     = Math.random() * W;
      this.y     = initial ? Math.random() * H : H + 40;
      this.r     = 12 + Math.random() * 36;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.speedY = 0.25 + Math.random() * 0.45;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 0.008 + Math.random() * 0.012;
      this.alpha  = 0.4 + Math.random() * 0.5;

      // Randomly choose shape: circle, heart, star, or paw
      const shapes = ["circle", "circle", "circle", "heart", "star", "paw"];
      this.shape = shapes[Math.floor(Math.random() * shapes.length)];
    }

    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.4;
      this.y -= this.speedY;
      if (this.y < -this.r * 2) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = this.color;
      ctx.translate(this.x, this.y);

      switch (this.shape) {
        case "heart":  drawHeart(ctx, this.r * 0.6);  break;
        case "star":   drawStar(ctx, this.r * 0.55);  break;
        case "paw":    drawPaw(ctx, this.r * 0.55);   break;
        default:       drawCircle(ctx, this.r);        break;
      }

      ctx.restore();
    }
  }

  // ── Shape helpers ──
  function drawCircle(ctx, r) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHeart(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.bezierCurveTo( s,  -s,      s,    s * 0.4,  0,    s);
    ctx.bezierCurveTo(-s,   s * 0.4, -s,  -s,       0,   -s * 0.3);
    ctx.fill();
  }

  function drawStar(ctx, s) {
    const spikes = 5;
    const outer  = s;
    const inner  = s * 0.45;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(0, -outer);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(Math.cos(rot) * outer, Math.sin(rot) * outer);
      rot += step;
      ctx.lineTo(Math.cos(rot) * inner, Math.sin(rot) * inner);
      rot += step;
    }
    ctx.lineTo(0, -outer);
    ctx.closePath();
    ctx.fill();
  }

  function drawPaw(ctx, s) {
    // Main pad
    ctx.beginPath();
    ctx.ellipse(0, s * 0.2, s * 0.55, s * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    // Toes
    const toes = [
      { x: -s * 0.55, y: -s * 0.35, rx: s * 0.22, ry: s * 0.25 },
      { x: -s * 0.18, y: -s * 0.62, rx: s * 0.22, ry: s * 0.25 },
      { x:  s * 0.18, y: -s * 0.62, rx: s * 0.22, ry: s * 0.25 },
      { x:  s * 0.55, y: -s * 0.35, rx: s * 0.22, ry: s * 0.25 },
    ];
    toes.forEach(t => {
      ctx.beginPath();
      ctx.ellipse(t.x, t.y, t.rx, t.ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ── Init & loop ──
  function init() {
    resize();
    const count = Math.min(38, Math.floor((W * H) / 22000));
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, BG_GRADIENT_TOP);
    grad.addColorStop(1, BG_GRADIENT_BOTTOM);
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
