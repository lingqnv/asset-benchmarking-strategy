(() => {
  'use strict';
  const copyButton = document.querySelector('.copy-link');
  const toast = document.querySelector('.toast');
  let toastTimer;
  function announce(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }
  copyButton.addEventListener('click', async () => {
    const url = new URL(window.location.href);
    url.hash = '';
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url.href);
      announce('Link copied');
    } catch {
      const input = document.createElement('textarea');
      input.value = url.href;
      input.setAttribute('readonly', '');
      input.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.appendChild(input);
      input.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Manual fallback below. */ }
      input.remove();
      copyButton.focus();
      if (copied) announce('Link copied');
      else {
        window.prompt('Copy this site link:', url.href);
      }
    }
  });

  const navLinks = [...document.querySelectorAll('.toc-link')];
  const trackedSections = [...document.querySelectorAll('.tracked-section')];
  let scrollPending = false;
  function updateNav() {
    const topOffset = 155;
    let activeId = trackedSections[0].id;
    for (const section of trackedSections) {
      if (section.getBoundingClientRect().top <= topOffset) activeId = section.id;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) activeId = 'industrial';
    navLinks.forEach(link => {
      const active = link.hash === '#' + activeId;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateNav);
    }
  }, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();

  const dialog = document.querySelector('.lightbox');
  const viewer = document.querySelector('.lightbox-viewport');
  const modalImage = document.querySelector('.lightbox-image');
  const title = document.querySelector('#lightbox-title');
  const closeButton = document.querySelector('.lightbox-close');
  const zoomButton = document.querySelector('.zoom-toggle');
  const originalLink = document.querySelector('.lightbox-original');
  let lastTrigger = null;
  function resetZoom() {
    dialog.classList.remove('is-actual-size');
    zoomButton.setAttribute('aria-pressed', 'false');
    zoomButton.textContent = 'Actual size';
    viewer.scrollTop = 0;
    viewer.scrollLeft = 0;
  }
  document.querySelectorAll('[data-lightbox]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      lastTrigger = link;
      title.textContent = link.dataset.caption;
      modalImage.src = link.href;
      modalImage.alt = 'Original ' + link.dataset.caption.toLowerCase() + ' from the source document.';
      originalLink.href = link.href;
      resetZoom();
      dialog.showModal();
      document.body.classList.add('has-lightbox');
      closeButton.focus();
    });
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('has-lightbox');
    resetZoom();
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  });
  zoomButton.addEventListener('click', () => {
    const actual = dialog.classList.toggle('is-actual-size');
    zoomButton.setAttribute('aria-pressed', String(actual));
    zoomButton.textContent = actual ? 'Fit to screen' : 'Actual size';
    viewer.scrollTop = 0;
    viewer.scrollLeft = 0;
  });
})();
