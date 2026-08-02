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

  /* ---------- Galería: carrusel con teclas de piano ---------- */
  const carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const dots = Array.from(document.querySelectorAll('[data-carousel-dot]'));
    let current = 0;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Deslizar con el dedo en mobile
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) {
        goTo(delta < 0 ? current + 1 : current - 1);
      }
    });

    goTo(0);
  }

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

  // En "Fiesta de 15 años" no aplican las ubicaciones con iglesia
  const eventTypeSelect = document.getElementById('eventType');
  const eventLocationSelect = document.getElementById('eventLocation');
  const CHURCH_LOCATIONS = ['Salón e Iglesia', 'Iglesia'];

  // Horarios: uno solo, o dos (iglesia + salon) segun la ubicacion elegida
  const horarioSingleRow = document.getElementById('horarioSingleRow');
  const horarioDualRow = document.getElementById('horarioDualRow');

  function updateHorarioRows() {
    const hasLocation = Boolean(eventLocationSelect.value);
    const isBoth = eventLocationSelect.value === 'Salón e Iglesia';

    horarioDualRow.hidden = !isBoth;
    horarioSingleRow.hidden = !(hasLocation && !isBoth);
  }

  // Mapa interactivo para marcar el lugar del evento (Leaflet + OpenStreetMap, sin API key)
  const mapRow = document.getElementById('mapRow');
  const mapContainer = document.getElementById('eventMap');
  const latInput = document.getElementById('eventLat');
  const lngInput = document.getElementById('eventLng');
  const mapSearchBtn = document.getElementById('mapSearchBtn');
  const locationDetailInput = document.getElementById('locationDetail');
  const MENDOZA_CENTER = [-32.8908, -68.8272];
  let leafletMap = null;
  let mapMarker = null;

  function ensureMap() {
    if (leafletMap || typeof L === 'undefined') return;

    leafletMap = L.map(mapContainer).setView(MENDOZA_CENTER, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(leafletMap);

    leafletMap.on('click', (e) => placeMarker(e.latlng.lat, e.latlng.lng, true));
  }

  function placeMarker(lat, lng, recenter) {
    latInput.value = lat.toFixed(6);
    lngInput.value = lng.toFixed(6);

    if (mapMarker) {
      mapMarker.setLatLng([lat, lng]);
    } else {
      mapMarker = L.marker([lat, lng], { draggable: true }).addTo(leafletMap);
      mapMarker.on('dragend', () => {
        const pos = mapMarker.getLatLng();
        latInput.value = pos.lat.toFixed(6);
        lngInput.value = pos.lng.toFixed(6);
      });
    }

    if (recenter) leafletMap.setView([lat, lng], 15);
  }

  function updateMapVisibility() {
    const hasLocation = Boolean(eventLocationSelect.value);
    mapRow.hidden = !hasLocation;

    if (hasLocation) {
      requestAnimationFrame(() => {
        ensureMap();
        if (leafletMap) leafletMap.invalidateSize();
      });
    }
  }

  eventLocationSelect.addEventListener('change', () => {
    updateHorarioRows();
    updateMapVisibility();
  });

  mapSearchBtn.addEventListener('click', async () => {
    const query = locationDetailInput.value.trim();

    if (!eventLocationSelect.value) {
      showToast('Elegí primero la ubicación del evento');
      return;
    }

    if (!query) {
      showToast('Escribí una dirección para buscarla en el mapa');
      return;
    }

    ensureMap();

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query + ', Mendoza, Argentina')}`
      );
      const results = await response.json();

      if (!results.length) {
        showToast('No se encontró esa dirección, marcala manualmente en el mapa');
        return;
      }

      placeMarker(parseFloat(results[0].lat), parseFloat(results[0].lon), true);
    } catch (err) {
      showToast('No se pudo buscar la dirección, marcala manualmente en el mapa');
    }
  });

  eventTypeSelect.addEventListener('change', () => {
    const isXV = eventTypeSelect.value === 'Fiesta de 15 años';

    Array.from(eventLocationSelect.options).forEach((option) => {
      if (CHURCH_LOCATIONS.includes(option.value)) {
        option.hidden = isXV;
        option.disabled = isXV;
      }
    });

    if (isXV && CHURCH_LOCATIONS.includes(eventLocationSelect.value)) {
      eventLocationSelect.value = '';
      updateHorarioRows();
      updateMapVisibility();
    }
  });

  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = budgetForm.name.value.trim();
    const eventType = budgetForm.eventType.value;
    const eventLocation = budgetForm.eventLocation.value;
    const locationDetail = budgetForm.locationDetail.value.trim();
    const lat = budgetForm.eventLat.value;
    const lng = budgetForm.eventLng.value;
    const isBothLocations = eventLocation === 'Salón e Iglesia';
    const eventTime = budgetForm.eventTime.value;
    const eventTimeChurch = budgetForm.eventTimeChurch.value;
    const eventTimeVenue = budgetForm.eventTimeVenue.value;
    const pianoRecepcion = budgetForm.pianoRecepcion.checked;
    const eventDate = budgetForm.eventDate.value;
    const message = budgetForm.message.value.trim();

    if (!name || !eventType) {
      showToast('Completá tu nombre y el tipo de evento');
      return;
    }

    const mapsLink = (lat && lng) ? `https://www.google.com/maps?q=${lat},${lng}` : null;

    const lines = [
      `¡Hola Luciana! Quisiera solicitar un presupuesto.`,
      `Nombre: ${name}`,
      `Tipo de evento: ${eventType}`,
      eventLocation ? `Ubicación del evento: ${eventLocation}` : null,
      locationDetail ? `Dirección / detalle: ${locationDetail}` : null,
      mapsLink ? `Ubicación en el mapa: ${mapsLink}` : null,
      isBothLocations && eventTimeChurch ? `Horario Iglesia: ${eventTimeChurch}` : null,
      isBothLocations && eventTimeVenue ? `Horario Salón: ${eventTimeVenue}` : null,
      !isBothLocations && eventTime ? `Horario: ${eventTime}` : null,
      pianoRecepcion ? `Piano en recepción: Sí` : null,
      eventDate ? `Fecha tentativa: ${eventDate}` : null,
      message ? `Mensaje: ${message}` : null,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    window.open(url, '_blank', 'noopener');
  });

});
