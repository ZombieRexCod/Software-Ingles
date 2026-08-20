/* ============================================================
   docentes_admin.js — Instituto American Land
   Mismo patrón que inicio_admin.js
============================================================ */

// ── 1. NOMBRE Y AVATAR DESDE sessionStorage ─────────────────
const nombre    = sessionStorage.getItem('nombre') || 'Administrador';
const navNombre = document.getElementById('nav-nombre');
const navAvatar = document.getElementById('nav-avatar');
if (navNombre) navNombre.textContent = nombre;
if (navAvatar) navAvatar.textContent = nombre.charAt(0).toUpperCase();

// ── 2. FECHA ACTUAL ─────────────────────────────────────────
const textFecha = document.getElementById('texto-fecha');
if (textFecha) {
  const hoy     = new Date();
  const opciones = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const str      = hoy.toLocaleDateString('es-CO', opciones);
  textFecha.textContent = str.charAt(0).toUpperCase() + str.slice(1);
}

// ── 3. CERRAR SESIÓN ────────────────────────────────────────
document.querySelector('.btn-cerrar').addEventListener('click', function (e) {
  e.preventDefault();
  sessionStorage.clear();
  window.location.href = '../auth/login.html';
});

// ── 4. NOTIFICACIÓN ─────────────────────────────────────────
const btnNotif = document.getElementById('btn-notif');
if (btnNotif) btnNotif.addEventListener('click', function () { mostrarToast('No tienes notificaciones nuevas'); });

// ── 5. SIDEBAR: acciones rápidas ────────────────────────────
const rutasSidebar = {
  'sb-nuevo-docente': 'docentes.html',
  'sb-nuevo-alumno':  'alumnos.html',
  'sb-nuevo-salon':   'salones.html',
};
Object.keys(rutasSidebar).forEach(function (id) {
  var btn = document.getElementById(id);
  if (btn) btn.addEventListener('click', function () {
    if (id === 'sb-nuevo-docente') { abrirModalNuevo(); }
    else { window.location.href = rutasSidebar[id]; }
  });
});

// ── 6. CONTADORES ANIMADOS ───────────────────────────────────
var datosStat = {
  'stat-total':       { fin: 5,  dur: 900 },
  'stat-salones-asig':{ fin: 4,  dur: 800 },
  'stat-alumnos-asig':{ fin: 39, dur: 1200 },
  'stat-horas':       { fin: 20, dur: 1000 },
};

function animarContador(el, fin, dur) {
  var pasos = 60;
  var intervalo = dur / pasos;
  var paso = 0;
  var timer = setInterval(function () {
    paso++;
    var progreso = paso / pasos;
    el.textContent = Math.round(fin * (1 - Math.pow(1 - progreso, 3)));
    if (paso >= pasos) { clearInterval(timer); el.textContent = fin; }
  }, intervalo);
}

var gridStats = document.querySelector('.grid-stats');
if (gridStats) {
  var obsStats = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) {
        Object.keys(datosStat).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) animarContador(el, datosStat[id].fin, datosStat[id].dur);
        });
        obsStats.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  obsStats.observe(gridStats);
}

// ── 7. ANIMACIÓN FILAS ───────────────────────────────────────
var filas = document.querySelectorAll('.fila-docente');
var obsFilas = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0)';
      obsFilas.unobserve(e.target);
    }
  });
}, { threshold: 0.05 });

filas.forEach(function (fila, i) {
  fila.style.opacity    = '0';
  fila.style.transform  = 'translateY(10px)';
  fila.style.transition = 'opacity 0.3s ease ' + (i * 0.07) + 's, transform 0.3s ease ' + (i * 0.07) + 's';
  obsFilas.observe(fila);
});

// ══════════════════════════════════════════
// FILTROS Y BÚSQUEDA
// ══════════════════════════════════════════
var inputBusqueda = document.getElementById('input-busqueda');
var filtroEstado  = document.getElementById('filtro-estado');
var filtroSalon   = document.getElementById('filtro-salon');
var btnLimpiar    = document.getElementById('btn-limpiar');
var sinResultados = document.getElementById('sin-resultados');
var badgeTotal    = document.getElementById('badge-total');

function filtrar() {
  var texto  = inputBusqueda.value.toLowerCase().trim();
  var estado = filtroEstado.value;
  var salon  = filtroSalon.value;
  var visibles = 0;

  filas.forEach(function (fila) {
    var nombre     = fila.querySelector('.docente-nombre').textContent.toLowerCase();
    var correo     = fila.querySelector('.docente-correo').textContent.toLowerCase();
    var especial   = fila.querySelector('.tag-especialidad') ? fila.querySelector('.tag-especialidad').textContent.toLowerCase() : '';
    var filaEstado = fila.dataset.estado || '';
    var filaSalon  = fila.dataset.salon  || '';

    var textoOk  = !texto  || nombre.includes(texto) || correo.includes(texto) || especial.includes(texto);
    var estadoOk = !estado || filaEstado === estado;
    var salonOk  = !salon  || filaSalon  === salon;

    var visible = textoOk && estadoOk && salonOk;
    fila.style.display = visible ? '' : 'none';
    if (visible) visibles++;
  });

  sinResultados.style.display = visibles === 0 ? 'block' : 'none';
  badgeTotal.textContent = visibles + (visibles === 1 ? ' docente' : ' docentes');
}

inputBusqueda.addEventListener('input', filtrar);
filtroEstado.addEventListener('change', filtrar);
filtroSalon.addEventListener('change', filtrar);

btnLimpiar.addEventListener('click', function () {
  inputBusqueda.value = '';
  filtroEstado.value  = '';
  filtroSalon.value   = '';
  filtrar();
});

// ══════════════════════════════════════════
// MODAL AGREGAR / EDITAR
// ══════════════════════════════════════════
var modalOverlay  = document.getElementById('modal-overlay');
var modalTitulo   = document.getElementById('modal-titulo');
var formDocente   = document.getElementById('form-docente');
var docenteIdEl   = document.getElementById('docente-id');
var filaEditar    = null;

function abrirModalNuevo() {
  modalTitulo.textContent = 'Nuevo Docente';
  formDocente.reset();
  docenteIdEl.value = '';
  filaEditar = null;
  limpiarErrores();
  modalOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function abrirModalEditar(fila) {
  filaEditar = fila;
  modalTitulo.textContent = 'Editar Docente';
  docenteIdEl.value = fila.querySelector('.btn-editar').dataset.id;

  var nombre   = fila.querySelector('.docente-nombre').textContent.replace('Prof. ', '');
  var correo   = fila.querySelector('.docente-correo').textContent;
  var especial = fila.querySelector('.tag-especialidad') ? fila.querySelector('.tag-especialidad').textContent : '';
  var estado   = fila.dataset.estado || 'activo';
  var salon    = fila.dataset.salon  || '';
  var horario  = fila.querySelector('.horario-texto') ? fila.querySelector('.horario-texto').textContent : '';

  document.getElementById('doc-nombre').value       = nombre;
  document.getElementById('doc-correo').value       = correo;
  document.getElementById('doc-especialidad').value = especial;
  document.getElementById('doc-estado').value       = estado;
  document.getElementById('doc-salon').value        = salon;
  document.getElementById('doc-horario').value      = horario !== '—' ? horario : '';
  document.getElementById('doc-telefono').value     = '';
  document.getElementById('doc-titulo').value       = '';
  document.getElementById('doc-observaciones').value = '';

  limpiarErrores();
  modalOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  modalOverlay.style.display = 'none';
  document.body.style.overflow = '';
}

document.getElementById('btn-nuevo-docente').addEventListener('click', abrirModalNuevo);
document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModal);
document.getElementById('btn-cancelar-modal').addEventListener('click', cerrarModal);

modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) cerrarModal();
});

// ── Validación y guardado ────────────────────────────────────
function limpiarErrores() {
  ['err-nombre','err-correo','err-especialidad'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['doc-nombre','doc-correo','doc-especialidad'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('invalido');
  });
}

formDocente.addEventListener('submit', function (e) {
  e.preventDefault();
  limpiarErrores();

  var nombre   = document.getElementById('doc-nombre').value.trim();
  var correo   = document.getElementById('doc-correo').value.trim();
  var especial = document.getElementById('doc-especialidad').value.trim();
  var reEmail  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var ok       = true;

  if (nombre.length < 2) {
    document.getElementById('err-nombre').textContent = 'Ingresa el nombre del docente.';
    document.getElementById('doc-nombre').classList.add('invalido');
    ok = false;
  }
  if (!reEmail.test(correo)) {
    document.getElementById('err-correo').textContent = 'Ingresa un correo válido.';
    document.getElementById('doc-correo').classList.add('invalido');
    ok = false;
  }
  if (especial.length < 2) {
    document.getElementById('err-especialidad').textContent = 'Ingresa la especialidad.';
    document.getElementById('doc-especialidad').classList.add('invalido');
    ok = false;
  }
  if (!ok) return;

  var salon   = document.getElementById('doc-salon').value;
  var horario = document.getElementById('doc-horario').value.trim() || '—';
  var estado  = document.getElementById('doc-estado').value;
  var id      = docenteIdEl.value;

  if (filaEditar) {
    // Actualizar fila existente
    filaEditar.querySelector('.docente-nombre').textContent = 'Prof. ' + nombre;
    filaEditar.querySelector('.docente-correo').textContent = correo;
    if (filaEditar.querySelector('.tag-especialidad')) {
      filaEditar.querySelector('.tag-especialidad').textContent = especial;
    }
    var badgeEl = filaEditar.querySelector('.badge-estado');
    badgeEl.className = 'badge-estado ' + estado;
    badgeEl.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
    filaEditar.dataset.estado = estado;
    filaEditar.dataset.salon  = salon;
    if (filaEditar.querySelector('.horario-texto')) {
      filaEditar.querySelector('.horario-texto').textContent = horario;
    }
    mostrarToast('Docente actualizado correctamente');
  } else {
    // Agregar nueva fila
    var initiales = nombre.split(' ').map(function(p){ return p[0]; }).join('').substring(0,2).toUpperCase();
    var colorMap  = { canada:'135deg,#4B0082,#6A0DAD', 'nueva-zelanda':'135deg,#2980B9,#5dade2', miami:'135deg,#27AE60,#58d68d', londres:'135deg,#F39C12,#f8c471' };
    var gradiente = salon && colorMap[salon] ? colorMap[salon] : '135deg,#888,#aaa';
    var salonNombre = { canada:'Salón Canadá','nueva-zelanda':'Salón Nueva Zelanda', miami:'Salón Miami', londres:'Salón Londres' };
    var salonTagClass = { canada:'rojo-tag','nueva-zelanda':'azul-tag', miami:'morado-tag', londres:'amarillo-tag' };
    var salonHtml = salon
      ? '<div class="salon-tag ' + (salonTagClass[salon]||'') + '">&#127968; ' + (salonNombre[salon]||salon) + '</div>'
      : '<span class="gris-texto">Sin asignar</span>';

    var tbody = document.getElementById('tbody-docentes');
    var tr = document.createElement('tr');
    tr.className    = 'fila-docente';
    tr.dataset.estado = estado;
    tr.dataset.salon  = salon;

    var newId = Date.now();
    tr.innerHTML =
      '<td><div class="docente-info">' +
        '<div class="avatar-docente" style="background:linear-gradient(' + gradiente + ')">' + initiales + '</div>' +
        '<div><p class="docente-nombre">Prof. ' + nombre + '</p><p class="docente-correo">' + correo + '</p></div>' +
      '</div></td>' +
      '<td><span class="tag-especialidad">' + especial + '</span></td>' +
      '<td>' + salonHtml + '</td>' +
      '<td><span class="horario-texto">' + horario + '</span></td>' +
      '<td><span class="num-alumnos">0</span></td>' +
      '<td><span class="badge-estado ' + estado + '">' + (estado.charAt(0).toUpperCase()+estado.slice(1)) + '</span></td>' +
      '<td><div class="acciones-fila">' +
        '<button class="btn-editar" data-id="' + newId + '" title="Editar">&#9998;</button>' +
        '<button class="btn-ver" data-id="' + newId + '" title="Ver perfil">&#128065;</button>' +
        '<button class="btn-eliminar" data-id="' + newId + '" title="Eliminar">&#128465;</button>' +
      '</div></td>';

    tbody.appendChild(tr);
    registrarBotonesAccion(tr);
    mostrarToast('Docente agregado correctamente');
  }

  cerrarModal();
  filtrar();
});

// ══════════════════════════════════════════
// MODAL ELIMINAR
// ══════════════════════════════════════════
var modalEliminar       = document.getElementById('modal-eliminar');
var nombreAEliminar     = document.getElementById('nombre-a-eliminar');
var filaAEliminar       = null;

function abrirModalEliminar(fila) {
  filaAEliminar = fila;
  nombreAEliminar.textContent = fila.querySelector('.docente-nombre').textContent;
  modalEliminar.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function cerrarModalEliminar() {
  modalEliminar.style.display = 'none';
  document.body.style.overflow = '';
  filaAEliminar = null;
}

document.getElementById('btn-cerrar-eliminar').addEventListener('click', cerrarModalEliminar);
document.getElementById('btn-cancelar-eliminar').addEventListener('click', cerrarModalEliminar);

modalEliminar.addEventListener('click', function (e) {
  if (e.target === modalEliminar) cerrarModalEliminar();
});

document.getElementById('btn-confirmar-eliminar').addEventListener('click', function () {
  if (filaAEliminar) {
    var nombre = filaAEliminar.querySelector('.docente-nombre').textContent;
    filaAEliminar.remove();
    cerrarModalEliminar();
    filtrar();
    mostrarToast(nombre + ' eliminado', true);
  }
});

// ── Registrar botones de acción en cada fila ─────────────────
function registrarBotonesAccion(fila) {
  fila.querySelector('.btn-editar').addEventListener('click', function () {
    abrirModalEditar(fila);
  });
  fila.querySelector('.btn-ver').addEventListener('click', function () {
    var nombre = fila.querySelector('.docente-nombre').textContent;
    mostrarToast('Perfil de ' + nombre);
  });
  fila.querySelector('.btn-eliminar').addEventListener('click', function () {
    abrirModalEliminar(fila);
  });
}

// Registrar en filas existentes
filas.forEach(function (fila) { registrarBotonesAccion(fila); });

// ── ESCAPE para cerrar modales ───────────────────────────────
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    cerrarModal();
    cerrarModalEliminar();
  }
});

// ══════════════════════════════════════════
// TOAST (mismo patrón que inicio_admin.js)
// ══════════════════════════════════════════
function mostrarToast(mensaje, esError) {
  var existente = document.querySelector('.toast-notif');
  if (existente) existente.remove();

  var toast = document.createElement('div');
  toast.className = 'toast-notif';
  toast.textContent = mensaje;
  toast.style.cssText = [
    'position:fixed','bottom:28px','right:28px','z-index:999',
    'background:' + (esError ? 'var(--rojo)' : 'var(--morado)'),
    'color:#fff','padding:12px 22px','border-radius:50px',
    'font-size:0.85rem','font-weight:600',
    'box-shadow:0 4px 18px rgba(0,0,0,0.18)',
    'animation:slideInToast 0.3s ease',
    'pointer-events:none'
  ].join(';');

  if (!document.getElementById('style-toast')) {
    var s = document.createElement('style');
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