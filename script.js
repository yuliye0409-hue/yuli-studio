/* =========================================================
   04. LAUNCH CONTROLLER
   Change INTRO_DURATION to control the length of the opening.
   ========================================================= */
const launch = document.querySelector('#launch');
const ghostLayer = document.querySelector('#ghost-layer');
const metalCanvas = document.querySelector('#metal-canvas');
const skipButton = document.querySelector('#launch-skip');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const INTRO_DURATION = reducedMotion ? 0 : 2200;
let introHasFinished = false;

function finishIntro() {
  if (introHasFinished) return;
  introHasFinished = true;
  launch.classList.add('is-ready');
}

window.setTimeout(finishIntro, INTRO_DURATION);
skipButton?.addEventListener('click', finishIntro);
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' || event.key === 'Enter') finishIntro();
});

/* =========================================================
   03. GHOST LIGHT CONTROLLER
   Draws a real pointer path: the moving silver light reveals the
   honeycomb texture, while old points fade back into pure black.
   ========================================================= */
if (launch && metalCanvas && !reducedMotion) {
  const context = metalCanvas.getContext('2d', { alpha: true });
  const maskCanvas = document.createElement('canvas');
  const maskContext = maskCanvas.getContext('2d');
  const textureCanvas = document.createElement('canvas');
  const textureContext = textureCanvas.getContext('2d');
  const target = { x: 50, y: 50 };
  const head = { x: 50, y: 50 };
  const points = [];
  const TRAIL_LIFE = 900;
  const MAX_POINTS = 90;
  const FRAME_INTERVAL = 1000 / 30;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let pixelRatio = 1;
  let lastFrame = performance.now();
  let isVisible = true;

  const resizeCanvas = () => {
    const bounds = launch.getBoundingClientRect();
    canvasWidth = Math.max(1, bounds.width);
    canvasHeight = Math.max(1, bounds.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    if (canvasWidth * pixelRatio > 3840) pixelRatio = 3840 / canvasWidth;
    if (canvasHeight * pixelRatio > 2160) pixelRatio = Math.min(pixelRatio, 2160 / canvasHeight);
    [metalCanvas, maskCanvas, textureCanvas].forEach((canvas) => {
      canvas.width = Math.max(1, Math.floor(canvasWidth * pixelRatio));
      canvas.height = Math.max(1, Math.floor(canvasHeight * pixelRatio));
    });
    drawHoneycombTexture();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
  };

  const drawHoneycombTexture = () => {
    textureContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    textureContext.clearRect(0, 0, canvasWidth, canvasHeight);
    textureContext.fillStyle = '#000';
    textureContext.fillRect(0, 0, canvasWidth, canvasHeight);
    const radius = Math.max(6, Math.min(13, canvasWidth / 148));
    const horizontal = radius * 1.74;
    const vertical = radius * 1.5;
    const rows = Math.ceil(canvasHeight / vertical) + 2;
    const columns = Math.ceil(canvasWidth / horizontal) + 2;
    for (let row = -1; row < rows; row += 1) {
      for (let column = -1; column < columns; column += 1) {
        const centerX = column * horizontal + (row % 2 ? horizontal / 2 : 0);
        const centerY = row * vertical;
        const noise = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
        const variation = noise - Math.floor(noise);
        const shade = Math.round(8 + variation * 12);
        textureContext.beginPath();
        for (let side = 0; side < 6; side += 1) {
          const angle = Math.PI / 3 * side;
          const x = centerX + radius * .82 * Math.cos(angle);
          const y = centerY + radius * .82 * Math.sin(angle);
          if (side === 0) textureContext.moveTo(x, y);
          else textureContext.lineTo(x, y);
        }
        textureContext.closePath();
        textureContext.strokeStyle = `rgba(${shade + 42},${shade + 48},${shade + 50},${.18 + variation * .14})`;
        textureContext.lineWidth = Math.max(.65, radius * .055);
        textureContext.stroke();
      }
    }
  };

  const updateTarget = (event) => {
    const bounds = launch.getBoundingClientRect();
    target.x = Math.max(0, Math.min(canvasWidth, event.clientX - bounds.left));
    target.y = Math.max(0, Math.min(canvasHeight, event.clientY - bounds.top));
  };

  launch.addEventListener('pointermove', updateTarget, { passive: true });
  launch.addEventListener('mousemove', updateTarget, { passive: true });
  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  const render = (now) => {
    if (!isVisible) return;
    if (now - lastFrame < FRAME_INTERVAL) {
      requestAnimationFrame(render);
      return;
    }
    const delta = Math.min(40, now - lastFrame);
    lastFrame = now;
    head.x += (target.x - head.x) * Math.min(1, delta * .009);
    head.y += (target.y - head.y) * Math.min(1, delta * .009);
    const lastPoint = points[points.length - 1];
    const distance = lastPoint ? Math.hypot(head.x - lastPoint.x, head.y - lastPoint.y) : 99;
    if (distance > 2) {
      const previous = points[points.length - 1];
      points.push({
        x: head.x,
        y: head.y,
        born: now,
        angle: previous ? Math.atan2(head.y - previous.y, head.x - previous.x) : 0,
        seed: Math.random() * Math.PI * 2
      });
      if (points.length > MAX_POINTS) points.shift();
    }
    while (points.length > 0 && now - points[0].born > TRAIL_LIFE) points.shift();

    maskContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    maskContext.clearRect(0, 0, canvasWidth, canvasHeight);
    maskContext.globalCompositeOperation = 'lighter';
    maskContext.filter = 'blur(12px)';
    points.forEach((point, index) => {
      const life = Math.max(0, 1 - (now - point.born) / TRAIL_LIFE);
      const wobble = Math.sin(point.seed + now * .0024 + index * .19);
      const radius = 78 + 86 * life + wobble * 13;
      const offsetX = Math.cos(point.seed * 1.7) * 9 * (1 - life);
      const offsetY = Math.sin(point.seed * 1.3) * 9 * (1 - life);
      const gradient = maskContext.createRadialGradient(point.x + offsetX, point.y + offsetY, 0, point.x + offsetX, point.y + offsetY, radius);
      gradient.addColorStop(0, `rgba(255,255,255,${.76 * life})`);
      gradient.addColorStop(.4, `rgba(255,255,255,${.48 * life})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      maskContext.fillStyle = gradient;
      maskContext.beginPath();
      maskContext.ellipse(point.x + offsetX, point.y + offsetY, radius * (.56 + .13 * wobble), radius * (1.06 - .1 * wobble), point.angle + wobble * .32, 0, Math.PI * 2);
      maskContext.fill();
    });
    maskContext.filter = 'none';

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.filter = 'brightness(1.72) contrast(1.22)';
    context.drawImage(textureCanvas, 0, 0, canvasWidth, canvasHeight);
    context.filter = 'none';
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(maskCanvas, 0, 0, canvasWidth, canvasHeight);
    context.globalCompositeOperation = 'screen';
    context.filter = 'blur(18px)';
    points.forEach((point, index) => {
      const life = Math.max(0, 1 - (now - point.born) / TRAIL_LIFE);
      const wobble = Math.sin(point.seed + now * .0024 + index * .19);
      const radius = 68 + 72 * life + wobble * 10;
      const offsetX = Math.cos(point.seed * 1.7) * 9 * (1 - life);
      const offsetY = Math.sin(point.seed * 1.3) * 9 * (1 - life);
      const gradient = context.createRadialGradient(point.x + offsetX, point.y + offsetY, 0, point.x + offsetX, point.y + offsetY, radius);
      gradient.addColorStop(0, `rgba(255,255,255,${.22 * life})`);
      gradient.addColorStop(.32, `rgba(230,236,235,${.13 * life})`);
      gradient.addColorStop(1, 'rgba(200,210,210,0)');
      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(point.x + offsetX, point.y + offsetY, radius * (.52 + .1 * wobble), radius, point.angle + wobble * .32, 0, Math.PI * 2);
      context.fill();
    });
    context.filter = 'none';
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(maskCanvas, 0, 0, canvasWidth, canvasHeight);
    context.globalCompositeOperation = 'source-over';
    requestAnimationFrame(render);
  };
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible) {
      lastFrame = performance.now();
      requestAnimationFrame(render);
    }
  }, { threshold: 0.02 });
  visibilityObserver.observe(launch);
  requestAnimationFrame(render);
}
