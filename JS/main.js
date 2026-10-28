// =========================================================
// Lavandería Spring · Antigua Guatemala
// =========================================================

// Horario: [abre, cierra] en minutos desde medianoche. 0 = domingo.
const HORARIO = {
  0: [9 * 60, 18 * 60],        // domingo 9:00 – 18:00
  1: [8 * 60, 18 * 60 + 30],   // lunes a sábado 8:00 – 18:30
  2: [8 * 60, 18 * 60 + 30],
  3: [8 * 60, 18 * 60 + 30],
  4: [8 * 60, 18 * 60 + 30],
  5: [8 * 60, 18 * 60 + 30],
  6: [8 * 60, 18 * 60 + 30]
};

// Hora actual en Guatemala, sin importar dónde esté el visitante
function ahoraEnGuatemala() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
}

function formatoHora(min) {
  const h = Math.floor(min / 60);
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// ---------- Abierto / cerrado ----------
(function () {
  const estado = document.getElementById('estado');
  if (!estado) return;

  const ahora = ahoraEnGuatemala();
  const dia = ahora.getDay();
  const min = ahora.getHours() * 60 + ahora.getMinutes();
  const [abre, cierra] = HORARIO[dia];

  if (min >= abre && min < cierra) {
    estado.textContent = `Abierto ahora · cerramos a las ${formatoHora(cierra)}`;
    estado.classList.add('abierto');
  } else if (min < abre) {
    estado.textContent = `Cerrado · abrimos hoy a las ${formatoHora(abre)}`;
    estado.classList.add('cerrado');
  } else {
    const manana = HORARIO[(dia + 1) % 7][0];
    estado.textContent = `Cerrado · abrimos mañana a las ${formatoHora(manana)}`;
    estado.classList.add('cerrado');
  }

  // Resalta el día de hoy en el horario (sección Visítanos y footer)
  document.querySelectorAll('[data-dias]').forEach(fila => {
    if (fila.dataset.dias.split(',').map(Number).includes(dia)) fila.classList.add('hoy');
  });
})();

// ---------- Menú en celular ----------
(function () {
  const boton = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  if (!boton || !menu) return;

  function cerrar() {
    menu.classList.remove('abierto');
    boton.setAttribute('aria-expanded', 'false');
  }

  boton.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    boton.setAttribute('aria-expanded', String(abierto));
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrar));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
})();

// ---------- Carrusel ----------
(function () {
  const slides = document.querySelectorAll('.slide');
  const minis = document.querySelectorAll('.mini');
  const barra = document.querySelector('.progreso div');
  const pantalla = document.querySelector('.pantalla');
  if (!slides.length || !barra || !pantalla) return;

  const DURACION = 6000;
  let actual = 0;
  let timer = null;

  function mostrar(i) {
    actual = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('activo', n === actual));
    minis.forEach((m, n) => m.classList.toggle('activo', n === actual));
    // reinicia la barra de progreso
    barra.classList.remove('corriendo');
    void barra.offsetWidth;
    barra.classList.add('corriendo');
  }

  function detener() {
    if (timer) clearInterval(timer);
  }

  function iniciar() {
    detener();
    timer = setInterval(() => mostrar(actual + 1), DURACION);
  }

  document.querySelectorAll('.flecha').forEach(b =>
    b.addEventListener('click', () => { mostrar(actual + Number(b.dataset.dir)); iniciar(); })
  );
  minis.forEach((m, n) => m.addEventListener('click', () => { mostrar(n); iniciar(); }));

  // deslizar con el dedo en el celular
  let x0 = null;
  pantalla.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  pantalla.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { mostrar(actual + (dx < 0 ? 1 : -1)); iniciar(); }
    x0 = null;
  });

  mostrar(0);
  iniciar();
})();

// ---------- Botón flotante de WhatsApp ----------
(function () {
  const boton = document.querySelector('.wa-flotante');
  if (!boton) return;
  function revisar() {
    boton.classList.toggle('visible', window.scrollY > 500 || window.innerWidth <= 720);
  }
  window.addEventListener('scroll', revisar, { passive: true });
  window.addEventListener('resize', revisar);
  revisar();
})();

// ---------- Año en el footer ----------
(function () {
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();

// ---------- Encabezado compacto al bajar ----------
(function () {
  const cabecera = document.querySelector('.cabecera');
  if (!cabecera) return;
  function revisar() { cabecera.classList.toggle('compacta', window.scrollY > 40); }
  window.addEventListener('scroll', revisar, { passive: true });
  revisar();
})();

// ---------- Menú: marca la sección que estás viendo ----------
(function () {
  const enlaces = document.querySelectorAll('.menu a[href^="#"]');
  if (!enlaces.length || !('IntersectionObserver' in window)) return;
  const porId = {};
  enlaces.forEach(a => { porId[a.getAttribute('href').slice(1)] = a; });

  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      const enlace = porId[e.target.id];
      if (!e.isIntersecting || !enlace) return;
      enlaces.forEach(a => a.classList.remove('activo'));
      enlace.classList.add('activo');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('section[id]').forEach(sec => observador.observe(sec));
})();

// ---------- Animaciones de entrada y salida al hacer scroll ----------
(function () {
  // true = se animan cada vez que entran y salen de la pantalla
  // false = se animan solo la primera vez
  const REPETIR = true;

  // Los hijos de [data-escalonar] aparecen uno tras otro
  document.querySelectorAll('[data-escalonar]').forEach(grupo => {
    const tipo = grupo.dataset.escalonar || '';
    [...grupo.children].forEach((hijo, i) => {
      if (tipo) hijo.setAttribute('data-revelar', tipo); else hijo.setAttribute('data-revelar', '');
      hijo.style.setProperty('--retraso', (i * 0.12) + 's');
    });
  });

  const elementos = document.querySelectorAll('[data-revelar]');
  if (!('IntersectionObserver' in window)) {
    elementos.forEach(el => el.classList.add('visible'));
    return;
  }

  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        if (!REPETIR) observador.unobserve(e.target);
      } else if (REPETIR) {
        e.target.classList.remove('visible');
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  elementos.forEach(el => observador.observe(el));
})();
