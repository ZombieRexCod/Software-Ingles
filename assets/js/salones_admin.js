/* ============================================================
   salones_admin.js
   Instituto American Land
   Ubicación: assets/js/salones_admin.js
============================================================ */

// ── 1. CARGAR NOMBRE DESDE sessionStorage ──────────────────
const nombre    = sessionStorage.getItem('nombre') || 'Administrador';
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

// ── 3. NOTIFICACIÓN (campanita) ──────────────────────────────
const btnNotif = document.getElementById('btn-notif');
if (btnNotif) {
  btnNotif.addEventListener('click', function () {
    mostrarToast('No tienes notificaciones nuevas');
  });
}

// ── 4. ACCESOS RÁPIDOS SIDEBAR (alumnos / docentes) ─────────
const rutas = {
  'sb-nuevo-alumno':  'alumnos.html',
  'sb-nuevo-docente': 'docentes.html',
};

Object.keys(rutas).forEach(function (id) {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', function () {
      window.location.href = rutas[id];
    });
  }
});

// ── 5. DATOS DE SALONES ──────────────────────────────────────
let salones = [
  { id: 1, nombre: 'Salón Canadá',        nivel: 'A1', color: 'rojo',     horario: 'Lun–Jue 8:00–12:00',  capacidad: 12, alumnos: 10, estado: 'activo' },
  { id: 2, nombre: 'Salón Nueva Zelanda', nivel: 'B2', color: 'azul',     horario: 'Lun–Jue 14:00–18:00', capacidad: 14, alumnos: 12, estado: 'activo' },
  { id: 3, nombre: 'Salón Miami',         nivel: 'C1', color: 'morado',   horario: 'Sáb 8:00–12:00',      capacidad: 10, alumnos: 8,  estado: 'activo' },
  { id: 4, nombre: 'Salón Londres',       nivel: 'B1', color: 'amarillo', horario: 'Lun–Jue 18:00–20:00', capacidad: 12, alumnos: 9,  estado: 'en-revision' },
];

let siguienteId = 5;
let filtroTextoActual  = '';
let filtroNivelActual  = 'todos';
let filtroEstadoActual = 'todos';

// ── 6. REFERENCIAS DOM ───────────────────────────────────────
const gridSalones      = document.getElementById('grid-salones');
const mensajeVacio     = document.getElementById('mensaje-vacio');
const badgeResultados  = document.getElementById('badge-resultados');
const textoResumen     = document.getElementById('texto-resumen');

const statTotal            = document.getElementById('stat-total');
const statActivos          = document.getElementById('stat-activos');
const statCapacidad        = document.getElementById('stat-capacidad');
const statCapacidadDetalle = document.getElementById('stat-capacidad-detalle');
const statRevision         = document.getElementById('stat-revision');

// ── 7. RENDER DE TARJETAS ────────────────────────────────────
function nivelDeCapacidad(alumnos, capacidad) {
  const porcentaje = capacidad > 0 ? (alumnos / capacidad) * 100 : 0;
  if (porcentaje >= 100) return 'llena';
  if (porcentaje >= 75)  return 'media';
  return 'ok';
}

function etiquetaEstado(estado) {
  if (estado === 'activo')      return 'Activo';
  if (estado === 'en-revision') return 'En revisión';
  return 'Inactivo';
}

function crearTarjetaSalon(salon) {
  const nivelBarra = nivelDeCapacidad(salon.alumnos, salon.capacidad);
  const porcentaje = salon.capacidad > 0 ? Math.min(100, Math.round((salon.alumnos / salon.capacidad) * 100)) : 0;

  const div = document.createElement('div');
  div.className = 'salon-tarjeta';
  div.innerHTML = `
    <div class="salon-tarjeta-barra ${salon.color}"></div>
    <div class="salon-tarjeta-cuerpo">
      <div class="salon-tarjeta-top">
        <div>
          <p class="salon-tarjeta-nombre">${salon.nombre}</p>
          <span class="salon-tarjeta-nivel">Nivel ${salon.nivel}</span>
        </div>
        <span class="badge-estado ${salon.estado}">${etiquetaEstado(salon.estado)}</span>
      </div>

      <p class="salon-tarjeta-horario">&#128197; ${salon.horario}</p>

      <div class="salon-tarjeta-capacidad">
        <div class="salon-tarjeta-capacidad-texto">
          <span>${salon.alumnos} / ${salon.capacidad} alumnos</span>
          <span>${porcentaje}%</span>
        </div>
        <div class="barra-capacidad">
          <div class="barra-capacidad-fill ${nivelBarra}" style="width:${porcentaje}%"></div>
        </div>
      </div>
    </div>

    <div class="salon-tarjeta-footer">
      <span class="salon-alumnos">ID: SL-${String(salon.id).padStart(3, '0')}</span>
      <div class="salon-tarjeta-acciones">
        <button class="btn-editar-salon" data-id="${salon.id}">Editar</button>
        <button class="btn-eliminar-salon" data-id="${salon.id}">Eliminar</button>
      </div>
    </div>
  `;
  return div;
}

function renderSalones() {
  const filtrados = salones.filter(function (s) {
    const coincideTexto  = s.nombre.toLowerCase().includes(filtroTextoActual.toLowerCase());
    const coincideNivel  = filtroNivelActual === 'todos'  || s.nivel === filtroNivelActual;
    const coincideEstado = filtroEstadoActual === 'todos' || s.estado === filtroEstadoActual;
    return coincideTexto && coincideNivel && coincideEstado;
  });

  gridSalones.innerHTML = '';

  if (filtrados.length === 0) {
    mensajeVacio.style.display = 'block';
  } else {
    mensajeVacio.style.display = 'none';
    filtrados.forEach(function (salon, i) {
      const tarjeta = crearTarjetaSalon(salon);
      tarjeta.style.opacity   = '0';
      tarjeta.style.transform = 'translateY(12px)';
      tarjeta.style.transition = 'opacity 0.3s ease ' + (i * 0.05) + 's, transform 0.3s ease ' + (i * 0.05) + 's';
      gridSalones.appendChild(tarjeta);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          tarjeta.style.opacity   = '1';
          tarjeta.style.transform = 'translateY(0)';
        });
      });
    });
  }

  badgeResultados.textContent = filtrados.length + (filtrados.length === 1 ? ' resultado' : ' resultados');

  asignarEventosTarjetas();
  actualizarStats();
}

// ── 8. ESTADÍSTICAS ─────────────────────────────────────────
function actualizarStats() {
  const total          = salones.length;
  const activos         = salones.filter(function (s) { return s.estado === 'activo'; }).length;
  const enRevision      = salones.filter(function (s) { return s.estado === 'en-revision'; }).length;
  const alumnosTotales  = salones.reduce(function (acc, s) { return acc + s.alumnos; }, 0);
  const capacidadTotal  = salones.reduce(function (acc, s) { return acc + s.capacidad; }, 0);

  statTotal.textContent    = total;
  statActivos.textContent  = activos;
  statRevision.textContent = enRevision;
  statCapacidad.textContent = alumnosTotales;
  statCapacidadDetalle.textContent = '— de ' + capacidadTotal + ' cupos';

  textoResumen.textContent = total + ' salones registrados · ' + activos + ' activos actualmente';
}

// ── 9. FILTROS ───────────────────────────────────────────────
const filtroBusqueda = document.getElementById('filtro-busqueda');
const filtroNivel    = document.getElementById('filtro-nivel');
const filtroEstado   = document.getElementById('filtro-estado');

filtroBusqueda.addEventListener('input', function () {
  filtroTextoActual = this.value;
  renderSalones();
});

filtroNivel.addEventListener('change', function () {
  filtroNivelActual = this.value;
  renderSalones();
});

filtroEstado.addEventListener('change', function () {
  filtroEstadoActual = this.value;
  renderSalones();
});

// ── 10. MODAL: ABRIR / CERRAR ────────────────────────────────
const modalOverlay = document.getElementById('modal-overlay');
const modalTitulo  = document.getElementById('modal-titulo');
const formSalon    = document.getElementById('form-salon');

const campoId        = document.getElementById('salon-id');
const campoNombre    = document.getElementById('salon-nombre');
const campoNivel     = document.getElementById('salon-nivel');
const campoColor     = document.getElementById('salon-color');
const campoHorario   = document.getElementById('salon-horario');
const campoCapacidad = document.getElementById('salon-capacidad');
const campoAlumnos   = document.getElementById('salon-alumnos');
const campoEstado    = document.getElementById('salon-estado');

function abrirModal(salon) {
  if (salon) {
    modalTitulo.textContent = 'Editar Salón';
    campoId.value        = salon.id;
    campoNombre.value    = salon.nombre;
    campoNivel.value     = salon.nivel;
    campoColor.value     = salon.color;
    campoHorario.value   = salon.horario;
    campoCapacidad.value = salon.capacidad;
    campoAlumnos.value   = salon.alumnos;
    campoEstado.value    = salon.estado;
  } else {
    modalTitulo.textContent = 'Nuevo Salón';
    formSalon.reset();
    campoId.value = '';
    campoCapacidad.value = 12;
    campoAlumnos.value = 0;
  }
  modalOverlay.classList.add('activo');
}

function cerrarModal() {
  modalOverlay.classList.remove('activo');
  formSalon.reset();
}

document.getElementById('btn-nuevo-salon-header').addEventListener('click', function () {
  abrirModal(null);
});

const btnSidebarNuevoSalon = document.getElementById('sb-nuevo-salon');
if (btnSidebarNuevoSalon) {
  btnSidebarNuevoSalon.addEventListener('click', function () {
    abrirModal(null);
  });
}

document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
document.getElementById('btn-cancelar').addEventListener('click', cerrarModal);

modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) cerrarModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modalOverlay.classList.contains('activo')) cerrarModal();
});

// ── 11. GUARDAR (CREAR / EDITAR) ─────────────────────────────
formSalon.addEventListener('submit', function (e) {
  e.preventDefault();

  const capacidad = parseInt(campoCapacidad.value, 10);
  const alumnosVal = parseInt(campoAlumnos.value, 10);

  if (alumnosVal > capacidad) {
    mostrarToast('Los alumnos matriculados no pueden superar la capacidad', true);
    return;
  }

  const datos = {
    nombre:    campoNombre.value.trim(),
    nivel:     campoNivel.value,
    color:     campoColor.value,
    horario:   campoHorario.value.trim(),
    capacidad: capacidad,
    alumnos:   alumnosVal,
    estado:    campoEstado.value,
  };

  if (campoId.value) {
    // Editar existente
    const idx = salones.findIndex(function (s) { return s.id === parseInt(campoId.value, 10); });
    if (idx !== -1) {
      salones[idx] = Object.assign({ id: salones[idx].id }, datos);
      mostrarToast('Salón "' + datos.nombre + '" actualizado correctamente');
    }
  } else {
    // Crear nuevo
    datos.id = siguienteId++;
    salones.push(datos);
    mostrarToast('Salón "' + datos.nombre + '" creado correctamente');
  }

  cerrarModal();
  renderSalones();
});

// ── 12. EDITAR / ELIMINAR (delegación en tarjetas) ───────────
function asignarEventosTarjetas() {
  document.querySelectorAll('.btn-editar-salon').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const id = parseInt(this.dataset.id, 10);
      const salon = salones.find(function (s) { return s.id === id; });
      if (salon) abrirModal(salon);
    });
  });

  document.querySelectorAll('.btn-eliminar-salon').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const id = parseInt(this.dataset.id, 10);
      const salon = salones.find(function (s) { return s.id === id; });
      if (!salon) return;

      const confirmar = window.confirm('¿Eliminar el salón "' + salon.nombre + '"? Esta acción no se puede deshacer.');
      if (confirmar) {
        salones = salones.filter(function (s) { return s.id !== id; });
        renderSalones();
        mostrarToast('Salón "' + salon.nombre + '" eliminado', true);
      }
    });
  });
}

// ── 13. TOAST ─────────────────────────────────────────────────
function mostrarToast(mensaje, esError) {
  const existente = document.querySelector('.toast-notif');
  if (existente) existente.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notif';
  toast.textContent = mensaje;
  toast.style.cssText = [
    'position:fixed', 'bottom:28px', 'right:28px', 'z-index:999',
    'background:' + (esError ? 'var(--rojo)' : 'var(--morado)'),
    'color:#fff', 'padding:12px 22px', 'border-radius:50px',
    'font-size:0.85rem', 'font-weight:600',
    'box-shadow:0 4px 18px rgba(0,0,0,0.18)',
    'animation:slideInToast 0.3s ease',
    'pointer-events:none'
  ].join(';');

  if (!document.getElementById('style-toast')) {
    const s = document.createElement('style');
    s.id = 'style-toast';
    s.textContent = '@keyframes slideInToast{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  document.body.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity    = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function () { toast.remove(); }, 320);
  }, 2500);
}

// ── 14. INICIALIZAR ──────────────────────────────────────────
renderSalones();