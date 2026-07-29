/* =========================================================
   Luciana Santillana | Piano para Eventos — Landing Page
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Año actual en footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar: fondo sólido al hacer scroll ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('.navbar__link, .navbar__cta').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Toast (mensajes breves) ---------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  /* ---------- Reveal al hacer scroll (IntersectionObserver) ---------- */
  const revealItems = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));

  /* ---------- Reproductor de audio (demos) ---------- */
  const DEMO_DURATION = 15; // segundos de muestra
  const players = document.querySelectorAll('[data-audio-player]');
  let currentPlayer = null;

  players.forEach((player) => {
    const audio = player.querySelector('[data-audio-src]');
    const btn = player.querySelector('[data-audio-toggle]');
    const bar = player.querySelector('[data-audio-bar]');
    const timeLabel = player.querySelector('[data-audio-time]');
    const icon = btn.querySelector('i');

    function reset() {
      audio.pause();
      audio.currentTime = 0;
      bar.style.width = '0%';
      timeLabel.textContent = `0:${String(DEMO_DURATION).padStart(2, '0')}`;
      btn.classList.remove('is-playing');
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
    }

    audio.addEventListener('timeupdate', () => {
      const progress = Math.min(audio.currentTime / DEMO_DURATION, 1) * 100;
      bar.style.width = `${progress}%`;
      const remaining = Math.max(DEMO_DURATION - audio.currentTime, 0);
      timeLabel.textContent = `0:${String(Math.ceil(remaining)).padStart(2, '0')}`;

      if (audio.currentTime >= DEMO_DURATION) {
        reset();
      }
    });

    audio.addEventListener('ended', reset);

    btn.addEventListener('click', () => {
      // Pausar cualquier otro demo que esté sonando
      if (currentPlayer && currentPlayer !== player) {
        const otherAudio = currentPlayer.querySelector('[data-audio-src]');
        const otherBtn = currentPlayer.querySelector('[data-audio-toggle]');
        const otherIcon = otherBtn.querySelector('i');
        otherAudio.pause();
        otherBtn.classList.remove('is-playing');
        otherIcon.classList.remove('fa-pause');
        otherIcon.classList.add('fa-play');
      }

      if (audio.paused) {
        const playPromise = audio.play();
        if (playPromise && playPromise.catch) {
          playPromise
            .then(() => {
              currentPlayer = player;
              btn.classList.add('is-playing');
              icon.classList.remove('fa-play');
              icon.classList.add('fa-pause');
            })
            .catch(() => {
              showToast('Muestra de audio próximamente 🎹');
            });
        }
      } else {
        audio.pause();
        btn.classList.remove('is-playing');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
      }
    });

    audio.addEventListener('error', () => {
      // Placeholder sin archivo real todavía: feedback elegante en vez de romper la UI
    });
  });

  /* ---------- Galería: lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('[data-gallery-item]').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- Formulario de presupuesto -> WhatsApp ---------- */
  const WHATSAPP_NUMBER = '5492612055204';
  const budgetForm = document.getElementById('budgetForm');

  // No permitir seleccionar fechas pasadas en "Fecha tentativa"
  const eventDateInput = document.getElementById('eventDate');
  if (eventDateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    eventDateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = budgetForm.name.value.trim();
    const phone = budgetForm.phone.value.trim();
    const eventType = budgetForm.eventType.value;
    const eventLocation = budgetForm.eventLocation.value;
    const locationDetail = budgetForm.locationDetail.value.trim();
    const eventDate = budgetForm.eventDate.value;
    const message = budgetForm.message.value.trim();

    if (!name || !eventType) {
      showToast('Completá tu nombre y el tipo de evento');
      return;
    }

    const lines = [
      `¡Hola Luciana! Quisiera solicitar un presupuesto.`,
      `Nombre: ${name}`,
      phone ? `Teléfono: ${phone}` : null,
      `Tipo de evento: ${eventType}`,
      eventLocation ? `Ubicación del evento: ${eventLocation}` : null,
      locationDetail ? `Dirección / detalle: ${locationDetail}` : null,
      eventDate ? `Fecha tentativa: ${eventDate}` : null,
      message ? `Mensaje: ${message}` : null,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    window.open(url, '_blank', 'noopener');
  });

});
