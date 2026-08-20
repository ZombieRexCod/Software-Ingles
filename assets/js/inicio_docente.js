/* ============================================================
   inicio_docente.js
   Instituto American Land
   Ubicación: assets/js/inicio_docente.js
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

// ── 3. ANIMACIÓN ENTRADA TARJETAS STAT ─────────────────────
const statCards = document.querySelectorAll('.stat-card');

const observadorStats = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateY(0)';
      observadorStats.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

statCards.forEach(function (card, i) {
  card.style.opacity   = '0';
  card.style.transform = 'translateY(16px)';
  card.style.transition = 'opacity 0.4s ease ' + (i * 0.08) + 's, transform 0.4s ease ' + (i * 0.08) + 's';
  observadorStats.observe(card);
});

// ── 4. ANIMACIÓN ENTRADA ACTIVIDAD RECIENTE ─────────────────
const actItems = document.querySelectorAll('.actividad-item');

const observadorAct = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateX(0)';
      observadorAct.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

actItems.forEach(function (item, i) {
  item.style.opacity   = '0';
  item.style.transform = 'translateX(-12px)';
  item.style.transition = 'opacity 0.35s ease ' + (i * 0.1) + 's, transform 0.35s ease ' + (i * 0.1) + 's';
  observadorAct.observe(item);
});

// ── 5. SELECTOR DE SALÓN (barra lateral) ────────────────────
document.querySelectorAll('.clase-item a').forEach(function (enlace) {
  enlace.addEventListener('click', function (e) {
    // Quitar clase activa de todos
    document.querySelectorAll('.clase-item').forEach(function (item) {
      item.classList.remove('activa');
    });
    // Activar el seleccionado
    this.closest('.clase-item').classList.add('activa');
  });
});

// ── 6. COLOR DINÁMICO DEL PROMEDIO ──────────────────────────
const promedioEl = document.querySelector('.stat-card:nth-child(2) .stat-valor');
if (promedioEl) {
  const val = parseFloat(promedioEl.textContent);
  if (val >= 4.5)      promedioEl.style.color = '#27AE60';
  else if (val >= 3.5) promedioEl.style.color = '#F39C12';
  else                 promedioEl.style.color = '#C0392B';
}

// ── 7. TOOLTIP EN FILAS DE LA TABLA ─────────────────────────
document.querySelectorAll('.tabla-datos tbody tr').forEach(function (fila) {
  fila.style.cursor = 'pointer';
  fila.addEventListener('click', function () {
    const nombreAlumno = this.querySelector('.alumno-info') ?
      this.querySelector('.alumno-info').textContent.trim() : '';
    if (nombreAlumno) {
      window.location.href = 'notas.html?alumno=' + encodeURIComponent(nombreAlumno);
    }
  });
});