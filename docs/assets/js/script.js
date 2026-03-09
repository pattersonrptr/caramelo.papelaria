// ── Year in footer ──
const yearEl = document.querySelector(".year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Animated background: bouncing Easter eggs & bunnies ──
(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const BG_TOP    = "#fffbe8";
  const BG_BOTTOM = "#e8f8f0";

  // Egg fill colors (pastel pairs: fill, stripe)
  const EGG_PALETTES = [
    ["rgba(249,216,74,0.7)",  "rgba(255,255,255,0.5)"],
    ["rgba(201,160,232,0.65)","rgba(255,255,255,0.5)"],
    ["rgba(125,219,184,0.65)","rgba(255,255,255,0.5)"],
    ["rgba(144,200,240,0.65)","rgba(255,255,255,0.5)"],
    ["rgba(240,160,200,0.65)","rgba(255,255,255,0.5)"],
  ];

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x         = Math.random() * W;
      this.y         = initial ? Math.random() * H : H + 40;
      this.speedY    = 0.4 + Math.random() * 0.6;
      this.speedX    = (Math.random() - 0.5) * 0.4;
      this.wobble    = Math.random() * Math.PI * 2;
      this.wobbleSpd = 0.008 + Math.random() * 0.012;
      this.rotation  = Math.random() * Math.PI * 2;
      this.rotSpeed  = (Math.random() - 0.5) * 0.02;
      this.alpha     = 0.5 + Math.random() * 0.4;
      this.palette   = EGG_PALETTES[Math.floor(Math.random() * EGG_PALETTES.length)];

      const types = ["egg", "egg", "egg", "egg", "bunny", "star"];
      this.type = types[Math.floor(Math.random() * types.length)];
      this.size = this.type === "bunny"
        ? 18 + Math.random() * 14
        : 12 + Math.random() * 20;
    }

    update() {
      this.wobble   += this.wobbleSpd;
      this.rotation += this.rotSpeed;
      this.x        += this.speedX + Math.sin(this.wobble) * 0.5;
      this.y        -= this.speedY;
      if (this.y < -50) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      switch (this.type) {
        case "egg":    drawEgg(ctx, this.size, this.palette);  break;
        case "bunny":  drawBunny(ctx, this.size);              break;
        default:       drawStar(ctx, this.size * 0.5, this.palette[0]); break;
      }

      ctx.restore();
    }
  }

  // ── Egg ──
  function drawEgg(ctx, s, [fill, stripe]) {
    ctx.save();
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.62, s, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    // Stripe
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.rect(-s, -s * 0.18, s * 2, s * 0.36);
    ctx.fillStyle = stripe;
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  // ── Bunny face ──
  function drawBunny(ctx, s) {
    ctx.fillStyle = "rgba(255,220,230,0.75)";
    // Ears
    ctx.beginPath();
    ctx.ellipse(-s * 0.35, -s * 1.1, s * 0.2, s * 0.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse( s * 0.35, -s * 1.1, s * 0.2, s * 0.5,  0.2, 0, Math.PI * 2);
    ctx.fill();
    // Inner ears
    ctx.fillStyle = "rgba(240,160,200,0.6)";
    ctx.beginPath();
    ctx.ellipse(-s * 0.35, -s * 1.1, s * 0.1, s * 0.32, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse( s * 0.35, -s * 1.1, s * 0.1, s * 0.32,  0.2, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.fillStyle = "rgba(255,220,230,0.75)";
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = "rgba(80,40,60,0.8)";
    ctx.beginPath(); ctx.arc(-s * 0.3, -s * 0.15, s * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc( s * 0.3, -s * 0.15, s * 0.1, 0, Math.PI * 2); ctx.fill();
    // Nose
    ctx.fillStyle = "rgba(230,100,150,0.8)";
    ctx.beginPath(); ctx.arc(0, s * 0.15, s * 0.08, 0, Math.PI * 2); ctx.fill();
  }

  // ── Star ──
  function drawStar(ctx, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const r = i % 2 === 0 ? s : s * 0.45;
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
    const count = Math.min(45, Math.floor((W * H) / 20000));
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
