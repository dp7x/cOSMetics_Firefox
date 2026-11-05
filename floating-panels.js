// Shared Firefox panel presentation. Markup and CSS come only from bundled code.
(() => {
  function mount(shadow, markup) {
    const start = markup.indexOf('<style>'), end = markup.indexOf('</style>', start);
    if (start < 0 || end < 0) throw new Error('Missing bundled panel styles');
    const css = markup.slice(start + 7, end);
    shadow.innerHTML = markup.slice(0, start) + markup.slice(end + 8);
    // Constructed sheets avoid parsing inline styles with the page's HTML/CSP.
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
    } catch {
      const style = document.createElement('style');
      style.textContent = css;
      shadow.prepend(style);
    }
  }
  function draggable(host, heading) {
    let cleanup = () => {};
    heading.style.touchAction = 'none';
    heading.addEventListener('pointerdown', event => {
      const target = event.composedPath?.()[0] || event.target;
      if (event.button !== 0 || target.closest?.('button')) return;
      event.preventDefault();
      event.stopPropagation();
      cleanup();
      const box = host.getBoundingClientRect(), x = event.clientX, y = event.clientY;
      const id = event.pointerId;
      const move = next => {
        if (next.pointerId !== id) return;
        next.preventDefault();
        next.stopPropagation();
        host.style.right = 'auto';
        host.style.bottom = 'auto';
        host.style.left = `${Math.max(0, Math.min(innerWidth - host.offsetWidth, box.left + next.clientX - x))}px`;
        host.style.top = `${Math.max(0, Math.min(innerHeight - 45, box.top + next.clientY - y))}px`;
      };
      const end = next => { if (next.type === 'blur' || next.pointerId === id) cleanup(); };
      cleanup = () => {
        window.removeEventListener('pointermove', move, true);
        for (const type of ['pointerup', 'pointercancel', 'blur']) window.removeEventListener(type, end, true);
      };
      window.addEventListener('pointermove', move, { capture: true, passive: false });
      for (const type of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(type, end, true);
    });
  }
  globalThis.CosmeticsFloatingPanels = Object.freeze({ mount, draggable });
})();
