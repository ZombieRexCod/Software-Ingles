/* ============================================================
   inicio-estudiante.js
   Instituto American Land
   Ubicación: assets/js/inicio-estudiante.js
============================================================ */

// ── 1. CARGAR NOMBRE DEL ESTUDIANTE DESDE sessionStorage ───
const nombre = sessionStorage.getItem('nombre') || 'Estudiante';

// Mostrar nombre en el navbar
const navNombre = document.getElementById('nav-nombre');
if (navNombre) navNombre.textContent = nombre;

// Mostrar inicial en el avatar
const navAvatar = document.getElementById('nav-avatar');
if (navAvatar) navAvatar.textContent = nombre.charAt(0).toUpperCase();

// ── 2. MARCAR ENLACE ACTIVO EN NAVBAR ──────────────────────
const rutaActual = window.location.pathname;
document.querySelectorAll('.nav-links a').forEach(function (enlace) {
  if (enlace.getAttribute('href') === 'inicio.html') {
    enlace.classList.add('activo');
  } else {
    enlace.classList.remove('activo');
  }
});

// ── 3. CERRAR SESIÓN ────────────────────────────────────────
document.querySelector('.btn-cerrar').addEventListener('click', function (e) {
  e.preventDefault();
  sessionStorage.clear();
  window.location.href = '../auth/login.html';
});

// ── 4. ANIMACIÓN DE ENTRADA EN TARJETAS STAT ───────────────
const statCards = document.querySelectorAll('.stat-card');

const observador = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity = '1';
      entrada.target.style.transform = 'translateY(0)';
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

statCards.forEach(function (card, i) {
  card.style.opacity = '0';
  card.style.transform = 'translateY(16px)';
  card.style.transition = 'opacity 0.4s ease ' + (i * 0.08) + 's, transform 0.4s ease ' + (i * 0.08) + 's';
  observador.observe(card);
});