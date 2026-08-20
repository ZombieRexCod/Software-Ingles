/* ============================================================
   tareas_docente.js
   Instituto American Land
   Ubicación: assets/js/tareas_docente.js
============================================================ */

// ── 1. CARGAR NOMBRE DESDE sessionStorage ──────────────────
const nombre     = sessionStorage.getItem('nombre') || 'Docente';
const navNombre  = document.getElementById('nav-nombre');
const navAvatar  = document.getElementById('nav-avatar');
if (navNombre) navNombre.textContent = nombre;
if (navAvatar) navAvatar.textContent = nombre.charAt(0).toUpperCase();

// ── 2. CERRAR SESIÓN ────────────────────────────────────────
document.querySelector('.btn-cerrar').addEventListener('click', function (e) {
  e.preventDefault();
  sessionStorage.clear();
  window.location.href = '../auth/login.html';
});

// ── 3. ANIMACIÓN ENTRADA TARJETAS DE TAREA ──────────────────
const tareaItems = document.querySelectorAll('.tarea-item');

const observadorTareas = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateY(0)';
      observadorTareas.unobserve(entrada.target);
    }
  });
}, { threshold: 0.05 });

tareaItems.forEach(function (item, i) {
  item.style.opacity    = '0';
  item.style.transform  = 'translateY(14px)';
  item.style.transition = 'opacity 0.35s ease ' + (i * 0.1) + 's, transform 0.35s ease ' + (i * 0.1) + 's';
  observadorTareas.observe(item);
});

// ── 4. ANIMACIÓN ENTRADA FILAS DE ENTREGA ───────────────────
const filasEntrega = document.querySelectorAll('.fila-entrega');

const observadorFilas = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateX(0)';
      observadorFilas.unobserve(entrada.target);
    }
  });
}, { threshold: 0.05 });

filasEntrega.forEach(function (fila, i) {
  fila.style.opacity    = '0';
  fila.style.transform  = 'translateX(10px)';
  fila.style.transition = 'opacity 0.3s ease ' + (i * 0.08) + 's, transform 0.3s ease ' + (i * 0.08) + 's';
  observadorFilas.observe(fila);
});

// ── 5. FILTROS (estado) ─────────────────────────────────────
const btnsFiltro   = document.querySelectorAll('.btn-filtro');
const selectSalon  = document.getElementById('select-salon');
const listaTareas  = document.querySelectorAll('.tarea-item');
const conteoEl     = document.getElementById('conteo-activas');

let filtroActual  = 'todas';
let salonActual   = 'todos';

function aplicarFiltros() {
  let visibles = 0;

  listaTareas.forEach(function (item) {
    const estado = item.getAttribute('data-estado');
    const salon  = item.getAttribute('data-salon');

    const pasaEstado = (filtroActual === 'todas') || (estado === filtroActual);
    const pasaSalon  = (salonActual  === 'todos') || (salon  === salonActual);

    if (pasaEstado && pasaSalon) {
      item.style.display = 'flex';
      visibles++;
    } else {
      item.style.display = 'none';
    }
  });

  conteoEl.textContent = visibles + ' tarea' + (visibles !== 1 ? 's' : '');
}

btnsFiltro.forEach(function (btn) {
  btn.addEventListener('click', function () {
    btnsFiltro.forEach(function (b) { b.classList.remove('activo'); });
    btn.classList.add('activo');
    filtroActual = btn.getAttribute('data-filtro');
    aplicarFiltros();
  });
});

selectSalon.addEventListener('change', function () {
  salonActual = this.value;
  aplicarFiltros();
});

// ── 6. CAMBIO DE ESTADO DESDE SELECT EN TAREA ───────────────
document.querySelectorAll('.select-estado').forEach(function (sel) {
  sel.addEventListener('change', function () {
    const tarjetaPadre = this.closest('.tarea-item');
    const badge = tarjetaPadre.querySelector('.badge-estado');
    const nuevoEstado = this.value;

    // Actualizar badge visual
    badge.className = 'badge-estado';
    if (nuevoEstado === 'activa') {
      badge.classList.add('activo');
      badge.textContent = 'Activa';
      tarjetaPadre.setAttribute('data-estado', 'activa');
    } else if (nuevoEstado === 'revision') {
      badge.classList.add('en-revision');
      badge.textContent = 'En Revisión';
      tarjetaPadre.setAttribute('data-estado', 'revision');
    } else {
      badge.classList.add('cerrado');
      badge.textContent = 'Cerrada';
      tarjetaPadre.setAttribute('data-estado', 'cerrada');
    }

    aplicarFiltros();
    mostrarToast('Estado actualizado correctamente');
  });
});

// ── 7. GUARDAR NOTA (botones de calificar) ───────────────────
document.querySelectorAll('.btn-calificar').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const input = this.closest('td').previousElementSibling.querySelector('.input-nota');
    const valor = parseInt(input.value, 10);

    if (isNaN(valor) || valor < 0 || valor > 100) {
      input.style.borderColor = 'var(--rojo)';
      input.focus();
      mostrarToast('Ingresa una nota válida entre 0 y 100', true);
      return;
    }

    input.style.borderColor = 'var(--verde)';
    const btnEl = this;
    btnEl.textContent = '✓ Guardado';
    btnEl.classList.add('guardado');

    setTimeout(function () {
      btnEl.textContent = 'Guardar';
      btnEl.classList.remove('guardado');
      input.style.borderColor = '';
    }, 2200);

    mostrarToast('Nota guardada: ' + valor + '/100');
  });
});

// ── 8. MODAL NUEVA TAREA ─────────────────────────────────────
const modal          = document.getElementById('modal-nueva-tarea');
const btnNuevaTarea  = document.getElementById('btn-nueva-tarea');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const btnCancelar    = document.getElementById('btn-cancelar-modal');
const btnGuardar     = document.getElementById('btn-guardar-modal');

function abrirModal() {
  modal.classList.remove('oculto');
  document.body.style.overflow = 'hidden';
  document.getElementById('m-titulo').focus();
}

function cerrarModal() {
  modal.classList.add('oculto');
  document.body.style.overflow = '';
  limpiarModal();
}

btnNuevaTarea.addEventListener('click', abrirModal);
btnCerrarModal.addEventListener('click', cerrarModal);
btnCancelar.addEventListener('click', cerrarModal);

// Cerrar al clic fuera de la caja
modal.addEventListener('click', function (e) {
  if (e.target === modal) cerrarModal();
});

// Cerrar con Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('oculto')) cerrarModal();
});

// ── 9. VALIDACIÓN Y CREACIÓN DE TAREA ───────────────────────
function limpiarModal() {
  ['m-titulo', 'm-salon', 'm-fecha', 'm-tipo', 'm-descripcion'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('invalido'); }
  });
  ['e-titulo', 'e-salon', 'e-fecha', 'e-descripcion'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function setInvalido(inputId, errorId, mensaje) {
  document.getElementById(inputId).classList.add('invalido');
  document.getElementById(errorId).textContent = mensaje;
}

function setValido(inputId, errorId) {
  document.getElementById(inputId).classList.remove('invalido');
  document.getElementById(errorId).textContent = '';
}

btnGuardar.addEventListener('click', function () {
  let valido = true;

  const titulo      = document.getElementById('m-titulo').value.trim();
  const salon       = document.getElementById('m-salon').value;
  const fecha       = document.getElementById('m-fecha').value;
  const descripcion = document.getElementById('m-descripcion').value.trim();

  if (titulo.length < 4) {
    setInvalido('m-titulo', 'e-titulo', 'El título debe tener al menos 4 caracteres.');
    valido = false;
  } else { setValido('m-titulo', 'e-titulo'); }

  if (!salon) {
    setInvalido('m-salon', 'e-salon', 'Selecciona un salón.');
    valido = false;
  } else { setValido('m-salon', 'e-salon'); }

  if (!fecha) {
    setInvalido('m-fecha', 'e-fecha', 'Selecciona una fecha de vencimiento.');
    valido = false;
  } else { setValido('m-fecha', 'e-fecha'); }

  if (descripcion.length < 10) {
    setInvalido('m-descripcion', 'e-descripcion', 'La descripción debe tener al menos 10 caracteres.');
    valido = false;
  } else { setValido('m-descripcion', 'e-descripcion'); }

  if (!valido) return;

  // Simulación de guardado
  btnGuardar.textContent = 'Creando...';
  btnGuardar.classList.add('cargando');

  setTimeout(function () {
    btnGuardar.textContent = 'Crear Tarea';
    btnGuardar.classList.remove('cargando');
    cerrarModal();

    // Agregar la nueva tarea al DOM
    agregarTareaDOM({ titulo, salon, fecha, descripcion });
    mostrarToast('¡Tarea creada correctamente!');
  }, 1000);
});

// ── 10. AGREGAR TAREA AL DOM ─────────────────────────────────
const nombresSalon = {
  canada:  'Salón Canadá &bull; A1',
  zelanda: 'Salón Nueva Zelanda &bull; B2',
  miami:   'Salón Miami &bull; C1'
};

const claseSalon = {
  canada:  'bloque-canada',
  zelanda: 'bloque-zelanda',
  miami:   'bloque-miami'
};

function agregarTareaDOM(datos) {
  const lista = document.getElementById('lista-tareas-activas');
  const nuevaId = Date.now();

  const div = document.createElement('div');
  div.className = 'tarea-item';
  div.setAttribute('data-salon', datos.salon);
  div.setAttribute('data-estado', 'activa');
  div.style.opacity   = '0';
  div.style.transform = 'translateY(14px)';
  div.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

  // Formatear fecha
  const fechaObj = new Date(datos.fecha + 'T00:00:00');
  const fechaStr = fechaObj.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

  div.innerHTML = `
    <div class="tarea-color ${claseSalon[datos.salon]}"></div>
    <div class="tarea-cuerpo">
      <div class="tarea-cabecera">
        <div>
          <p class="tarea-titulo">${datos.titulo}</p>
          <p class="tarea-salon">${nombresSalon[datos.salon]}</p>
        </div>
        <span class="badge-estado activo">Activa</span>
      </div>
      <p class="tarea-descripcion">${datos.descripcion}</p>
      <div class="tarea-meta">
        <span class="meta-item">&#128197; Vence: <strong>${fechaStr}</strong></span>
        <span class="meta-item">&#128101; 0 estudiantes</span>
        <span class="meta-item entregadas">&#10003; 0 entregadas</span>
        <span class="meta-item pendientes">&#9679; 0 pendientes</span>
      </div>
      <div class="tarea-acciones">
        <button class="btn-accion btn-ver-entregas" data-id="${nuevaId}">Ver entregas</button>
        <button class="btn-accion btn-editar" data-id="${nuevaId}">Editar</button>
        <select class="select-estado" data-id="${nuevaId}">
          <option value="activa" selected>Activa</option>
          <option value="revision">En Revisión</option>
          <option value="cerrada">Cerrada</option>
        </select>
      </div>
    </div>
  `;

  lista.prepend(div);

  // Animación de entrada
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      div.style.opacity   = '1';
      div.style.transform = 'translateY(0)';
    });
  });

  // Conectar el nuevo select de estado
  const nuevoSelect = div.querySelector('.select-estado');
  nuevoSelect.addEventListener('change', function () {
    const badge = div.querySelector('.badge-estado');
    const nuevoEstado = this.value;
    badge.className = 'badge-estado';
    if (nuevoEstado === 'activa') {
      badge.classList.add('activo');
      badge.textContent = 'Activa';
      div.setAttribute('data-estado', 'activa');
    } else if (nuevoEstado === 'revision') {
      badge.classList.add('en-revision');
      badge.textContent = 'En Revisión';
      div.setAttribute('data-estado', 'revision');
    } else {
      badge.classList.add('cerrado');
      badge.textContent = 'Cerrada';
      div.setAttribute('data-estado', 'cerrada');
    }
    aplicarFiltros();
    mostrarToast('Estado actualizado correctamente');
  });

  aplicarFiltros();
}

// ── 11. TOAST DE NOTIFICACIÓN ────────────────────────────────
function mostrarToast(mensaje, esError) {
  const existente = document.querySelector('.toast-notif');
  if (existente) existente.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notif';
  toast.textContent = mensaje;
  toast.style.cssText = `
    position: fixed; bottom: 28px; right: 28px; z-index: 999;
    background: ${esError ? 'var(--rojo)' : 'var(--morado)'};
    color: #fff; padding: 12px 22px; border-radius: 50px;
    font-size: 0.85rem; font-weight: 600; box-shadow: 0 4px 18px rgba(0,0,0,0.18);
    animation: slideInToast 0.3s ease; pointer-events: none;
  `;

  const style = document.createElement('style');
  style.textContent = '@keyframes slideInToast { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }';
  document.head.appendChild(style);

  document.body.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function () { toast.remove(); }, 320);
  }, 2500);
}