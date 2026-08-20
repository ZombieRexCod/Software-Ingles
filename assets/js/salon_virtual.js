/* ============================================================
   salon-virtual.js
   Instituto American Land
   Ubicación: assets/js/salon-virtual.js
============================================================ */

// ── 1. CARGAR NOMBRE DESDE sessionStorage ──────────────────
const nombre = sessionStorage.getItem('nombre') || 'Estudiante';

const navNombre = document.getElementById('nav-nombre');
const navAvatar = document.getElementById('nav-avatar');
const estNombreYo = document.getElementById('est-nombre-yo');

if (navNombre)    navNombre.textContent    = nombre;
if (navAvatar)    navAvatar.textContent    = nombre.charAt(0).toUpperCase();
if (estNombreYo)  estNombreYo.textContent  = nombre;

// ── 2. CERRAR SESIÓN ────────────────────────────────────────
document.querySelector('.btn-cerrar').addEventListener('click', function (e) {
  e.preventDefault();
  sessionStorage.clear();
  window.location.href = '../auth/login.html';
});

// ── 3. ANIMACIÓN ESCALONADA DE LAS TARJETAS DE ESTUDIANTES ─
const cards = document.querySelectorAll('.estudiante-card');

const observador = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity = '1';
      entrada.target.style.transform = 'translateY(0) scale(1)';
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

cards.forEach(function (card, i) {
  card.style.opacity = '0';
  card.style.transform = 'translateY(12px) scale(0.97)';
  card.style.transition =
    'opacity 0.35s ease ' + (i * 0.05) + 's, ' +
    'transform 0.35s ease ' + (i * 0.05) + 's';
  observador.observe(card);
});

// ── 4. CONTADOR DE ALUMNOS CONECTADOS ──────────────────────
const conectados = document.querySelectorAll('.est-conectado').length;
const contadorEl = document.querySelector('.alumnos-count');
if (contadorEl) {
  contadorEl.textContent = '👤 ' + conectados + ' alumnos conectados';
}

// ── 5. ANIMACIÓN PULSO EN EL AVATAR "TÚ" ───────────────────
const avatarYo = document.querySelector('.est-yo');
if (avatarYo) {
  avatarYo.style.animation = 'pulso-yo 2s ease-in-out infinite';
}

// Agregar keyframe dinámicamente
const style = document.createElement('style');
style.textContent = `
  @keyframes pulso-yo {
    0%, 100% { box-shadow: 0 0 0 0 rgba(75,0,130,0.3); }
    50%       { box-shadow: 0 0 0 6px rgba(75,0,130,0); }
  }
`;
document.head.appendChild(style);