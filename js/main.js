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

  // Calendario propio para "Fecha tentativa" (mas fluido que el <input type="date"> nativo)
  function initDatePicker(root) {
    const trigger = root.querySelector('[data-date-trigger]');
    const label = root.querySelector('[data-date-label]');
    const panel = root.querySelector('[data-date-panel]');
    const monthLabel = root.querySelector('[data-date-month]');
    const daysContainer = root.querySelector('[data-date-days]');
    const prevBtn = root.querySelector('[data-date-prev]');
    const nextBtn = root.querySelector('[data-date-next]');
    const hiddenInput = root.querySelector('input[type="hidden"]');

    const MONTH_NAMES = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedDate = null;

    function formatISO(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function formatDisplay(date) {
      return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
    }

    function render() {
      monthLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
      daysContainer.innerHTML = '';

      const startOffset = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      for (let i = 0; i < startOffset; i++) {
        const empty = document.createElement('span');
        empty.className = 'date-picker__day is-empty';
        daysContainer.appendChild(empty);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(viewYear, viewMonth, day);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'date-picker__day';
        btn.textContent = String(day);

        if (date < today) btn.disabled = true;
        if (date.getTime() === today.getTime()) btn.classList.add('is-today');
        if (selectedDate && date.getTime() === selectedDate.getTime()) btn.classList.add('is-selected');

        btn.addEventListener('click', () => {
          selectedDate = date;
          hiddenInput.value = formatISO(date);
          label.textContent = formatDisplay(date);
          trigger.classList.add('has-value');
          closePanel();
          render();
        });

        daysContainer.appendChild(btn);
      }
    }

    function onOutsideClick(e) {
      if (!root.contains(e.target)) closePanel();
    }

    function openPanel() {
      panel.hidden = false;
      render();
      document.addEventListener('click', onOutsideClick);
    }

    function closePanel() {
      panel.hidden = true;
      document.removeEventListener('click', onOutsideClick);
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (panel.hidden) openPanel();
      else closePanel();
    });

    prevBtn.addEventListener('click', () => {
      viewMonth -= 1;
      if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
      render();
    });

    nextBtn.addEventListener('click', () => {
      viewMonth += 1;
      if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
      render();
    });
  }

  document.querySelectorAll('[data-date-picker]').forEach(initDatePicker);

  const eventTypeSelect = document.getElementById('eventType');
  const eventLocationSelect = document.getElementById('eventLocation');
  const pianoRecepcionRow = document.getElementById('pianoRecepcionRow');
  const pianoRecepcionInput = document.getElementById('pianoRecepcion');

  // Segun el tipo de evento, algunas ubicaciones no tienen sentido y se ocultan del select
  const LOCATION_RESTRICTIONS = {
    'Fiesta de 15 años': ['Salón', 'Otra ubicación'],
    'Recepción Privada': ['Otra ubicación'],
  };

  function updateLocationOptions() {
    const allowed = LOCATION_RESTRICTIONS[eventTypeSelect.value] || null;

    Array.from(eventLocationSelect.options).forEach((option) => {
      if (!option.value) return;
      const isAllowed = !allowed || allowed.includes(option.value);
      option.hidden = !isAllowed;
      option.disabled = !isAllowed;
    });

    if (allowed && eventLocationSelect.value && !allowed.includes(eventLocationSelect.value)) {
      eventLocationSelect.value = '';
      updateHorarioRows();
      updateLocationRows();
    }
  }

  // Horarios: uno solo, o dos (iglesia + salon) segun la ubicacion elegida
  const horarioSingleRow = document.getElementById('horarioSingleRow');
  const horarioDualRow = document.getElementById('horarioDualRow');

  function updateHorarioRows() {
    const hasLocation = Boolean(eventLocationSelect.value);
    const isBoth = eventLocationSelect.value === 'Salón e Iglesia';

    horarioDualRow.hidden = !isBoth;
    horarioSingleRow.hidden = !(hasLocation && !isBoth);
  }

  // Direccion + mapa interactivo para marcar el lugar (Leaflet + OpenStreetMap, sin API key).
  // Cada "campo de ubicacion" (unico, o Iglesia/Salon por separado) es una instancia independiente.
  const MENDOZA_CENTER = [-32.8908, -68.8272];

  function createLocationField(root) {
    const input = root.querySelector('[data-loc-input]');
    const searchBtn = root.querySelector('[data-loc-search]');
    const mapEl = root.querySelector('[data-loc-map]');
    const latInput = root.querySelector('[data-loc-lat]');
    const lngInput = root.querySelector('[data-loc-lng]');

    let map = null;
    let marker = null;

    async function reverseGeocode(lat, lng) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        return data && data.display_name ? data.display_name : null;
      } catch (err) {
        return null;
      }
    }

    function placeMarker(lat, lng, recenter, fillAddress) {
      latInput.value = lat.toFixed(6);
      lngInput.value = lng.toFixed(6);

      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        // Arrastrar el pin tambien actualiza la direccion escrita
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          latInput.value = pos.lat.toFixed(6);
          lngInput.value = pos.lng.toFixed(6);
          reverseGeocode(pos.lat, pos.lng).then((address) => {
            if (address) input.value = address;
          });
        });
      }

      if (recenter && map) map.setView([lat, lng], 15);

      if (fillAddress) {
        reverseGeocode(lat, lng).then((address) => {
          if (address) input.value = address;
        });
      }
    }

    function ensureMap() {
      if (map || typeof L === 'undefined') return;

      map = L.map(mapEl).setView(MENDOZA_CENTER, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Click en el mapa: coloca el pin y escribe la direccion sola
      map.on('click', (e) => placeMarker(e.latlng.lat, e.latlng.lng, true, true));
    }

    async function search() {
      const query = input.value.trim();

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
    }

    // El mapa aparece recien cuando la persona interactua con ESE campo de direccion puntual
    function reveal() {
      if (!mapEl.hidden) return;
      mapEl.hidden = false;
      requestAnimationFrame(() => {
        ensureMap();
        if (map) map.invalidateSize();
      });
    }

    input.addEventListener('focus', reveal);
    input.addEventListener('click', reveal);

    searchBtn.addEventListener('click', () => {
      reveal();
      search();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        reveal();
        search();
      }
    });

    return { reveal };
  }

  const locationSingleRow = document.getElementById('locationSingleRow');
  const locationDualRow = document.getElementById('locationDualRow');
  document.querySelectorAll('[data-loc-field]').forEach(createLocationField);

  function updateLocationRows() {
    const hasLocation = Boolean(eventLocationSelect.value);
    const isBoth = eventLocationSelect.value === 'Salón e Iglesia';

    locationSingleRow.hidden = !(hasLocation && !isBoth);
    locationDualRow.hidden = !isBoth;

    // El "piano en recepcion" solo aplica cuando hay salon Y iglesia
    pianoRecepcionRow.hidden = !isBoth;
    if (!isBoth) pianoRecepcionInput.checked = false;
  }

  eventLocationSelect.addEventListener('change', () => {
    updateHorarioRows();
    updateLocationRows();
  });

  eventTypeSelect.addEventListener('change', updateLocationOptions);

  // Selector de horario tipo chips (reemplaza el <input type="time"> nativo)
  function buildTimePicker(pickerEl) {
    const track = pickerEl.querySelector('[data-time-picker-track]');
    const hiddenInput = pickerEl.nextElementSibling;
    if (!track || !hiddenInput) return;

    const START_MIN = 9 * 60; // 09:00
    const END_MIN = 23 * 60 + 30; // 23:30
    const STEP = 30;

    for (let mins = START_MIN; mins <= END_MIN; mins += STEP) {
      const h = String(Math.floor(mins / 60)).padStart(2, '0');
      const m = String(mins % 60).padStart(2, '0');
      const label = `${h}:${m}`;

      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'time-chip';
      chip.textContent = label;

      chip.addEventListener('click', () => {
        track.querySelectorAll('.time-chip').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        hiddenInput.value = label;
      });

      track.appendChild(chip);
    }
  }

  document.querySelectorAll('[data-time-picker]').forEach(buildTimePicker);

  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = budgetForm.name.value.trim();
    const eventType = budgetForm.eventType.value;
    const eventLocation = budgetForm.eventLocation.value;
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

    function mapsLink(lat, lng) {
      return (lat && lng) ? `https://www.google.com/maps?q=${lat},${lng}` : null;
    }

    let locationLines;

    if (isBothLocations) {
      const churchDetail = budgetForm.locationDetailChurch.value.trim();
      const churchLink = mapsLink(budgetForm.eventLatChurch.value, budgetForm.eventLngChurch.value);
      const venueDetail = budgetForm.locationDetailVenue.value.trim();
      const venueLink = mapsLink(budgetForm.eventLatVenue.value, budgetForm.eventLngVenue.value);

      locationLines = [
        churchDetail ? `Dirección Iglesia: ${churchDetail}` : null,
        churchLink ? `Ubicación Iglesia en el mapa: ${churchLink}` : null,
        venueDetail ? `Dirección Salón: ${venueDetail}` : null,
        venueLink ? `Ubicación Salón en el mapa: ${venueLink}` : null,
      ];
    } else {
      const locationDetail = budgetForm.locationDetail.value.trim();
      const link = mapsLink(budgetForm.eventLat.value, budgetForm.eventLng.value);

      locationLines = [
        locationDetail ? `Dirección / detalle: ${locationDetail}` : null,
        link ? `Ubicación en el mapa: ${link}` : null,
      ];
    }

    const lines = [
      `¡Hola Luciana! Quisiera solicitar un presupuesto.`,
      `Nombre: ${name}`,
      `Tipo de evento: ${eventType}`,
      eventLocation ? `Ubicación del evento: ${eventLocation}` : null,
      ...locationLines,
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
