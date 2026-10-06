(() => {
  const topbar = document.querySelector('.topbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelectorAll('.desktop-nav a');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateTopbar = () => {
    topbar?.setAttribute('data-scrolled', window.scrollY > 16 ? 'true' : 'false');
  };
  updateTopbar();
  window.addEventListener('scroll', updateTopbar, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const open = topbar.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  navLinks.forEach((link) => link.addEventListener('click', () => {
    topbar.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  }));

  const tabs = [...document.querySelectorAll('.command-tab')];
  const panels = [...document.querySelectorAll('.command-view')];
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    const view = tab.dataset.view;
    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== view;
    });
  }));

  const revealItems = document.querySelectorAll('.trust-signal, .feature-card, .source-row, .timeline-step, .command-shell');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: .14 });
    revealItems.forEach((item) => {
      item.classList.add('reveal-item');
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const blobs = [
    { x: .76, y: .30, radius: .42, color: [22, 114, 124], speed: .00012, phase: 1.1 },
    { x: .58, y: .07, radius: .26, color: [115, 217, 241], speed: .00017, phase: 2.4 },
    { x: .93, y: .82, radius: .36, color: [229, 169, 72], speed: .00010, phase: .6 },
  ];
  let width = 0;
  let height = 0;
  let frame;
  let start = performance.now();

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };
  const paint = (now = performance.now()) => {
    if (!width || !height) return;
    const elapsed = reducedMotion ? 0 : now - start;
    context.clearRect(0, 0, width, height);
    const base = context.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, '#071313');
    base.addColorStop(.58, '#0b2425');
    base.addColorStop(1, '#09201f');
    context.fillStyle = base;
    context.fillRect(0, 0, width, height);
    blobs.forEach((blob) => {
      const wobbleX = Math.sin(elapsed * blob.speed + blob.phase) * width * .035;
      const wobbleY = Math.cos(elapsed * blob.speed * .9 + blob.phase) * height * .025;
      const x = width * blob.x + (reducedMotion ? 0 : wobbleX);
      const y = height * blob.y + (reducedMotion ? 0 : wobbleY);
      const radius = Math.max(width, height) * blob.radius;
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      const [r, g, b] = blob.color;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, .29)`);
      gradient.addColorStop(.42, `rgba(${r}, ${g}, ${b}, .12)`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    });
    if (!reducedMotion) frame = window.requestAnimationFrame(paint);
  };
  resize();
  paint();
  window.addEventListener('resize', resize, { passive: true });
  if (reducedMotion && frame) window.cancelAnimationFrame(frame);
})();
