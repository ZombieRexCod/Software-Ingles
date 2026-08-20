/* ============================================================
   tareas.js
   Instituto American Land
   Ubicación: assets/js/tareas.js
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

// ── 3. ANIMACIÓN ENTRADA TARJETAS DE MATERIAL ───────────────
const materialCards = document.querySelectorAll('.material-card');

const observador = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateY(0)';
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

materialCards.forEach(function (card, i) {
  card.style.opacity   = '0';
  card.style.transform = 'translateY(14px)';
  card.style.transition = 'opacity 0.35s ease ' + (i * 0.08) + 's, transform 0.35s ease ' + (i * 0.08) + 's';
  observador.observe(card);
});

// ── 4. BOTONES DESCARGAR ────────────────────────────────────
document.querySelectorAll('.btn-descargar').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const archivo = this.getAttribute('data-archivo');
    this.classList.add('descargando');
    this.textContent = '⏳ Descargando...';

    setTimeout(() => {
      this.classList.remove('descargando');
      this.textContent = '✓ Descargado';
      this.style.background = 'linear-gradient(135deg, #27AE60, #2ECC71)';
    }, 1500);
  });
});

// ── 5. FILTRO DE ENTREGAS ───────────────────────────────────
const btnsFiltro   = document.querySelectorAll('.btn-filtro');
const entregaCards = document.querySelectorAll('.entrega-card');

btnsFiltro.forEach(function (btn) {
  btn.addEventListener('click', function () {
    btnsFiltro.forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');

    const estadoFiltro = this.getAttribute('data-estado');

    entregaCards.forEach(function (card) {
      const cardEstado = card.getAttribute('data-estado');
      if (estadoFiltro === 'todos' || cardEstado === estadoFiltro) {
        card.classList.remove('oculta');
      } else {
        card.classList.add('oculta');
      }
    });
  });
});

// ── 6. MODAL DE ENTREGA ─────────────────────────────────────
const modalOverlay = document.getElementById('modal-overlay');
const modalTitulo  = document.getElementById('modal-titulo');
const modalCerrar  = document.getElementById('modal-cerrar');
const btnCancelar  = document.getElementById('btn-cancelar');
const btnConfirmar = document.getElementById('btn-confirmar');
const uploadArea   = document.getElementById('upload-area');
const inputArchivo = document.getElementById('input-archivo');
const archivoNombre= document.getElementById('archivo-nombre');
const comentario   = document.getElementById('comentario');

let tareaActual    = '';

// Abrir modal
document.querySelectorAll('.btn-entregar').forEach(function (btn) {
  btn.addEventListener('click', function () {
    tareaActual = this.getAttribute('data-tarea');
    modalTitulo.textContent = 'Entregar: ' + tareaActual;
    archivoNombre.textContent = '';
    comentario.value          = '';
    inputArchivo.value        = '';
    modalOverlay.classList.add('abierto');
  });
});

// Cerrar modal
function cerrarModal() {
  modalOverlay.classList.remove('abierto');
}

modalCerrar.addEventListener('click', cerrarModal);
btnCancelar.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) cerrarModal();
});

// Click en área de upload
uploadArea.addEventListener('click', function () {
  inputArchivo.click();
});

// Selección de archivo
inputArchivo.addEventListener('change', function () {
  if (this.files.length > 0) {
    archivoNombre.textContent = '✓ ' + this.files[0].name;
  }
});

// Drag & Drop
uploadArea.addEventListener('dragover', function (e) {
  e.preventDefault();
  this.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', function () {
  this.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', function (e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    archivoNombre.textContent = '✓ ' + files[0].name;
  }
});

// Confirmar entrega
btnConfirmar.addEventListener('click', function () {
  if (!archivoNombre.textContent) {
    archivoNombre.textContent = '⚠ Por favor selecciona un archivo.';
    archivoNombre.style.color = '#C0392B';
    return;
  }

  this.classList.add('cargando');
  this.textContent = 'Enviando...';

  setTimeout(() => {
    this.classList.remove('cargando');
    this.textContent = 'Enviar Tarea';
    cerrarModal();

    // Actualizar la tarjeta de la tarea a "Entregado"
    document.querySelectorAll('.entrega-card').forEach(function (card) {
      const nombreCard = card.querySelector('.entrega-nombre').textContent;
      if (nombreCard === tareaActual) {
        card.setAttribute('data-estado', 'entregado');
        const acciones = card.querySelector('.entrega-acciones');
        acciones.innerHTML = '<span class="badge badge-entregado">Entregado</span>';
        card.style.transition = 'background 0.4s ease';
        card.style.background = 'rgba(39,174,96,0.06)';
        setTimeout(() => { card.style.background = ''; }, 1500);
      }
    });

    // Actualizar contadores
    actualizarContadores();
  }, 1400);
});

// ── 7. ACTUALIZAR CONTADORES ────────────────────────────────
function actualizarContadores() {
  const total      = document.querySelectorAll('.entrega-card').length;
  const pendientes = document.querySelectorAll('.entrega-card[data-estado="pendiente"]').length;
  const entregadas = total - pendientes;

  document.getElementById('num-pendientes').textContent = pendientes;
  document.getElementById('num-entregadas').textContent = entregadas;
  document.getElementById('num-total').textContent      = total;
}

actualizarContadores();