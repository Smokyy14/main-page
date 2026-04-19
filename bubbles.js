(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'bubbles-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '0',
  });
  document.body.prepend(canvas);

  // Make sure page content sits above the canvas
  const style = document.createElement('style');
  style.textContent = `
    body > *:not(#bubbles-canvas) { position: relative; z-index: 1; }
  `;
  document.head.appendChild(style);

  const ctx = canvas.getContext('2d');

  // Subtle palette — low saturation, fits dark backgrounds
  const COLORS = [
    'rgba(108, 92, 231, ALPHA)',   // soft purple
    'rgba(0, 184, 212, ALPHA)',    // soft cyan
    'rgba(16, 139, 26, ALPHA)',    // soft green (matches --color-primary)
    'rgba(244, 197, 66, ALPHA)',   // soft gold (matches --color-accent)
    'rgba(180, 100, 220, ALPHA)',  // soft violet
    'rgba(80, 160, 255, ALPHA)',   // soft blue
  ];

  const BUBBLE_COUNT = 35;
  let bubbles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function randomColor(alpha) {
    const template = COLORS[Math.floor(Math.random() * COLORS.length)];
    return template.replace('ALPHA', alpha.toFixed(2));
  }

  function createBubble(forceBottom = false) {
    const radius = randomBetween(3, 10);
    return {
      x:       randomBetween(0, canvas.width),
      y:       forceBottom
                 ? canvas.height + radius
                 : randomBetween(-canvas.height, canvas.height),
      radius,
      speedY:  randomBetween(0.3, 1.0),
      speedX:  randomBetween(-0.15, 0.15),
      alpha:   randomBetween(0.06, 0.22),
      color:   randomColor(1),        // alpha applied in draw
      wobble:  randomBetween(0, Math.PI * 2),
      wobbleSpeed: randomBetween(0.005, 0.02),
    };
  }

  function init() {
    resize();
    bubbles = Array.from({ length: BUBBLE_COUNT }, () => createBubble(false));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const b of bubbles) {
      // wobble on X axis
      b.wobble += b.wobbleSpeed;
      b.x += Math.sin(b.wobble) * 0.4 + b.speedX;
      b.y -= b.speedY;

      // recycle when off-screen top
      if (b.y + b.radius < 0) {
        Object.assign(b, createBubble(true));
      }

      // draw circle
      const color = b.color.replace('1)', `${b.alpha})`);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // subtle inner highlight
      const highlight = ctx.createRadialGradient(
        b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.05,
        b.x, b.y, b.radius
      );
      highlight.addColorStop(0, `rgba(255,255,255,${(b.alpha * 0.6).toFixed(2)})`);
      highlight.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = highlight;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();
