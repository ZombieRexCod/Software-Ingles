/* ============================================================
   horario_docente.js
   Instituto American Land
   Ubicación: assets/js/horario_docente.js
============================================================ */

// ── 1. CARGAR NOMBRE DESDE sessionStorage ──────────────────
const nombre = sessionStorage.getItem('nombre') || 'Docente';
const navNombre = document.getElementById('nav-nombre');
const navAvatar = document.getElementById('nav-avatar');
if (navNombre) navNombre.textContent = nombre;
if (navAvatar) navAvatar.textContent = nombre.charAt(0).toUpperCase();

// ── 2. CERRAR SESIÓN ────────────────────────────────────────
document.querySelector('.btn-cerrar').addEventListener('click', function (e) {
  e.preventDefault();
  sessionStorage.clear();
  window.location.href = '../auth/login.html';
});

// ── 3. NAVEGACIÓN ENTRE SEMANAS ─────────────────────────────
const semanas = [
  'Semana 21 Abril – 25 Abril – 2026',
  'Semana 28 Abril – 2 Mayo – 2026',
  'Semana 5 Mayo – 9 Mayo – 2026',
  'Semana 12 Mayo – 16 Mayo – 2026',
  'Semana 19 Mayo – 23 Mayo – 2026',
];

let semanaActual   = 1;
const textoSemana  = document.getElementById('texto-semana');
const btnAnterior  = document.getElementById('btn-anterior');
const btnSiguiente = document.getElementById('btn-siguiente');

function actualizarSemana() {
  textoSemana.textContent   = semanas[semanaActual];
  btnAnterior.disabled      = semanaActual === 0;
  btnSiguiente.disabled     = semanaActual === semanas.length - 1;
  btnAnterior.style.opacity  = semanaActual === 0 ? '0.4' : '1';
  btnSiguiente.style.opacity = semanaActual === semanas.length - 1 ? '0.4' : '1';
}

btnAnterior.addEventListener('click', function () {
  if (semanaActual > 0) { semanaActual--; actualizarSemana(); animarTabla(); }
});

btnSiguiente.addEventListener('click', function () {
  if (semanaActual < semanas.length - 1) { semanaActual++; actualizarSemana(); animarTabla(); }
});

actualizarSemana();

// ── 4. ANIMACIÓN TABLA AL CAMBIAR SEMANA ────────────────────
function animarTabla() {
  const tabla = document.querySelector('.tabla-horario');
  tabla.style.opacity   = '0';
  tabla.style.transform = 'translateY(6px)';
  tabla.style.transition = 'opacity 0.25s, transform 0.25s';
  setTimeout(function () {
    tabla.style.opacity   = '1';
    tabla.style.transform = 'translateY(0)';
  }, 60);
}

// ── 5. ANIMACIÓN ENTRADA DE BLOQUES ─────────────────────────
const bloques = document.querySelectorAll('.clase-bloque');

const observador = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'scale(1)';
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

bloques.forEach(function (bloque, i) {
  bloque.style.opacity   = '0';
  bloque.style.transform = 'scale(0.94)';
  bloque.style.transition = 'opacity 0.3s ease ' + (i * 0.07) + 's, transform 0.3s ease ' + (i * 0.07) + 's';
  observador.observe(bloque);
});

// ── 6. ANIMACIÓN ENTRADA FECHAS IMPORTANTES ─────────────────
const fechaItems = document.querySelectorAll('.fecha-item');

const observadorFechas = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateX(0)';
      observadorFechas.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

fechaItems.forEach(function (item, i) {
  item.style.opacity   = '0';
  item.style.transform = 'translateX(12px)';
  item.style.transition = 'opacity 0.35s ease ' + (i * 0.1) + 's, transform 0.35s ease ' + (i * 0.1) + 's';
  observadorFechas.observe(item);
});

// ── 7. RESALTAR DÍA ACTUAL ──────────────────────────────────
const hoy  = new Date().getDay(); // 0=Dom, 1=Lun...
const ths  = document.querySelectorAll('.tabla-horario thead th');

if (hoy >= 1 && hoy <= 6 && ths[hoy]) {
  ths[hoy].style.color      = 'var(--morado)';
  ths[hoy].style.background = 'rgba(75,0,130,0.08)';
  ths[hoy].style.borderBottom = '2px solid var(--morado)';
}

// ── 8. CLICK EN BLOQUE → IR A NOTAS ────────────────────────
bloques.forEach(function (bloque) {
  bloque.addEventListener('click', function () {
    const salon = this.classList.contains('bloque-canada')  ? 'canada'
                : this.classList.contains('bloque-zelanda') ? 'nueva-zelanda'
                : 'miami';
    window.location.href = 'notas.html?salon=' + salon;
  });
});