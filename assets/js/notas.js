/* ============================================================
   notas.js
   Instituto American Land
   Ubicación: assets/js/notas.js
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

// ── 3. ANIMAR BARRAS DE PROGRESO AL CARGAR ─────────────────
// Las barras tienen el width en el HTML como estilo inline,
// pero arrancamos desde 0 y animamos al entrar al viewport
const barras = document.querySelectorAll('.ciclo-barra');
const targetWidths = [];

// Guardar el ancho destino y resetear a 0
barras.forEach(function (barra) {
  targetWidths.push(barra.style.width);
  barra.style.width = '0%';
});

const observadorBarras = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      const idx = Array.from(barras).indexOf(entrada.target);
      setTimeout(function () {
        entrada.target.style.width = targetWidths[idx];
      }, idx * 150);
      observadorBarras.unobserve(entrada.target);
    }
  });
}, { threshold: 0.3 });

barras.forEach(barra => observadorBarras.observe(barra));

// ── 4. ANIMACIÓN ENTRADA TARJETAS DE CICLOS ─────────────────
const cicloCards = document.querySelectorAll('.ciclo-card');

const observadorCards = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateY(0)';
      observadorCards.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

cicloCards.forEach(function (card, i) {
  card.style.opacity   = '0';
  card.style.transform = 'translateY(16px)';
  card.style.transition = 'opacity 0.4s ease ' + (i * 0.1) + 's, transform 0.4s ease ' + (i * 0.1) + 's';
  observadorCards.observe(card);
});

// ── 5. FILTRO POR CICLO ─────────────────────────────────────
const btnsFiltro = document.querySelectorAll('.btn-filtro');
const filas      = document.querySelectorAll('#tbody-historial tr');

btnsFiltro.forEach(function (btn) {
  btn.addEventListener('click', function () {

    // Activar botón
    btnsFiltro.forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');

    const cicloFiltro = this.getAttribute('data-ciclo');

    filas.forEach(function (fila) {
      const filaCiclo = fila.getAttribute('data-ciclo');
      if (cicloFiltro === 'todos' || filaCiclo === cicloFiltro) {
        fila.classList.remove('fila-oculta');
      } else {
        fila.classList.add('fila-oculta');
      }
    });
  });
});

// ── 6. CALCULAR Y MOSTRAR PROMEDIO GENERAL ─────────────────
const notas = [4.5, 3.9, 4.8]; // Ciclos completados
const promedio = (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1);
const promedioEl = document.getElementById('promedio-general');
if (promedioEl) promedioEl.textContent = promedio;

// Color del promedio según valor
if (parseFloat(promedio) >= 4.5) {
  promedioEl.style.color = '#27AE60';
} else if (parseFloat(promedio) >= 3.5) {
  promedioEl.style.color = '#F39C12';
} else {
  promedioEl.style.color = '#C0392B';
}