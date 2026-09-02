/* ============================================================
   seleccion.js — Funcionalidad de la página de Admisión
   Instituto American Land
   Ubicación: assets/js/seleccion.js
   (index.js ya maneja el menú móvil, el scroll y las animaciones)
============================================================ */

// ── 1. SELECCIÓN DE PERFIL DE ESTUDIANTE ───────────────────
const cardsPerfil   = document.querySelectorAll('.card-perfil');
const btnContinuar  = document.getElementById('btn-continuar');
const ayudaSeleccion = document.getElementById('ayuda-seleccion');

let perfilSeleccionado = null;

// Texto de ayuda según el perfil elegido
const mensajes = {
  nuevo:   'Perfecto, te registraremos como Nuevo Estudiante.',
  actual:  'Perfecto, continuaremos tu proceso como Estudiante Actual.',
  empresa: 'Perfecto, te contactaremos para tu proceso Empresarial / Corporativo.'
};

cardsPerfil.forEach(function (card) {
  card.addEventListener('click', function () {
    // Quitar selección previa
    cardsPerfil.forEach(c => c.classList.remove('seleccionado'));

    // Marcar la tarjeta elegida
    card.classList.add('seleccionado');
    perfilSeleccionado = card.getAttribute('data-perfil');

    // Habilitar el botón de continuar
    btnContinuar.disabled = false;
    ayudaSeleccion.textContent = mensajes[perfilSeleccionado] || 'Perfil seleccionado.';
  });
});

// ── 2. CONTINUAR AL REGISTRO CON EL PERFIL ELEGIDO ─────────
btnContinuar.addEventListener('click', function () {
  if (!perfilSeleccionado) return;
  window.location.href = '../auth/registro.html?perfil=' + encodeURIComponent(perfilSeleccionado);
});