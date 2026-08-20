/* ============================================================
   horario.js
   Instituto American Land
   Ubicación: assets/js/horario.js
============================================================ */

// ── 1. CARGAR NOMBRE DESDE sessionStorage ──────────────────
const nombre = sessionStorage.getItem('nombre') || 'Estudiante';

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

// ── 3. SEMANAS DISPONIBLES ──────────────────────────────────
const semanas = [
  'Semana 21 Abril – 25 Abril – 2026',
  'Semana 28 Abril – 2 Mayo – 2026',
  'Semana 5 Mayo – 9 Mayo – 2026',
  'Semana 12 Mayo – 16 Mayo – 2026',
  'Semana 19 Mayo – 23 Mayo – 2026',
];

let semanaActual = 1; // índice de la semana por defecto
const textoSemana  = document.getElementById('texto-semana');
const btnAnterior  = document.getElementById('btn-anterior');
const btnSiguiente = document.getElementById('btn-siguiente');

// Actualizar texto de semana
function actualizarSemana() {
  textoSemana.textContent = semanas[semanaActual];
  btnAnterior.disabled  = semanaActual === 0;
  btnSiguiente.disabled = semanaActual === semanas.length - 1;

  // Estilo deshabilitado
  btnAnterior.style.opacity  = semanaActual === 0 ? '0.4' : '1';
  btnSiguiente.style.opacity = semanaActual === semanas.length - 1 ? '0.4' : '1';
}

btnAnterior.addEventListener('click', function () {
  if (semanaActual > 0) {
    semanaActual--;
    actualizarSemana();
    animarTabla();
  }
});

btnSiguiente.addEventListener('click', function () {
  if (semanaActual < semanas.length - 1) {
    semanaActual++;
    actualizarSemana();
    animarTabla();
  }
});

actualizarSemana();

// ── 4. ANIMACIÓN DE LA TABLA AL CAMBIAR SEMANA ─────────────
function animarTabla() {
  const tabla = document.querySelector('.tabla-horario');
  tabla.style.opacity   = '0';
  tabla.style.transform = 'translateY(6px)';
  tabla.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  setTimeout(function () {
    tabla.style.opacity   = '1';
    tabla.style.transform = 'translateY(0)';
  }, 50);
}

// ── 5. ANIMACIÓN ENTRADA BLOQUES DE CLASE ──────────────────
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
  bloque.style.transform = 'scale(0.95)';
  bloque.style.transition = 'opacity 0.3s ease ' + (i * 0.08) + 's, transform 0.3s ease ' + (i * 0.08) + 's';
  observador.observe(bloque);
});

// ── 6. RESALTAR DÍA ACTUAL ─────────────────────────────────
const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const hoy  = new Date().getDay(); // 0=Dom, 1=Lun...

const ths = document.querySelectorAll('.tabla-horario thead th');
// ths[0] = "Hora", ths[1] = Lunes (índice 1 = día 1)
if (hoy >= 1 && hoy <= 6 && ths[hoy]) {
  ths[hoy].style.color      = 'var(--morado)';
  ths[hoy].style.background = 'rgba(75,0,130,0.08)';
  ths[hoy].style.borderBottom = '2px solid var(--morado)';
}