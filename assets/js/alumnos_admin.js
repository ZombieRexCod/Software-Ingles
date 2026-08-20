/* ============================================================
   alumnos_admin.js
   Instituto American Land
   Ubicación: assets/js/alumnos_admin.js
============================================================ */

// ── 1. SESIÓN ───────────────────────────────────────────────
const nombre    = sessionStorage.getItem('nombre') || 'Administrador';
const navNombre = document.getElementById('nav-nombre');
const navAvatar = document.getElementById('nav-avatar');
if (navNombre) navNombre.textContent = nombre;
if (navAvatar) navAvatar.textContent = nombre.charAt(0).toUpperCase();

document.querySelector('.btn-cerrar').addEventListener('click', function (e) {
  e.preventDefault();
  sessionStorage.clear();
  window.location.href = '../auth/login.html';
});

// ── 2. DATOS INICIALES ──────────────────────────────────────
const COLORES_AVATAR = [
  'linear-gradient(135deg,#4B0082,#6A0DAD)',
  'linear-gradient(135deg,#C0392B,#E74C3C)',
  'linear-gradient(135deg,#2980B9,#5dade2)',
  'linear-gradient(135deg,#27AE60,#58d68d)',
  'linear-gradient(135deg,#F39C12,#f8c471)',
  'linear-gradient(135deg,#8e44ad,#9b59b6)',
];

let contadorMatricula = 54;

let alumnos = [
  { id:1,  nombre:'Laura Gómez',      correo:'laura.gomez@mail.com',      telefono:'3001234501', nivel:'A1', salon:'Canadá',        ingreso:'2026-01-15', estado:'activo'   },
  { id:2,  nombre:'Carlos Ríos',      correo:'carlos.rios@mail.com',       telefono:'3001234502', nivel:'A1', salon:'Canadá',        ingreso:'2026-01-15', estado:'activo'   },
  { id:3,  nombre:'María Paz',        correo:'maria.paz@mail.com',         telefono:'3001234503', nivel:'B2', salon:'Nueva Zelanda', ingreso:'2026-01-20', estado:'activo'   },
  { id:4,  nombre:'Andrés López',     correo:'andres.lopez@mail.com',      telefono:'3001234504', nivel:'A1', salon:'Canadá',        ingreso:'2026-02-01', estado:'activo'   },
  { id:5,  nombre:'Sofía Torres',     correo:'sofia.torres@mail.com',      telefono:'3001234505', nivel:'C1', salon:'Miami',         ingreso:'2026-02-01', estado:'pendiente'},
  { id:6,  nombre:'Juan Martínez',    correo:'juan.martinez@mail.com',     telefono:'3001234506', nivel:'B1', salon:'Londres',       ingreso:'2026-02-10', estado:'pendiente'},
  { id:7,  nombre:'Valentina Cruz',   correo:'valentina.cruz@mail.com',    telefono:'3001234507', nivel:'C1', salon:'Miami',         ingreso:'2026-02-10', estado:'activo'   },
  { id:8,  nombre:'Felipe Herrera',   correo:'felipe.herrera@mail.com',    telefono:'3001234508', nivel:'A2', salon:'Canadá',        ingreso:'2026-02-15', estado:'activo'   },
  { id:9,  nombre:'Camila Rojas',     correo:'camila.rojas@mail.com',      telefono:'3001234509', nivel:'B2', salon:'Nueva Zelanda', ingreso:'2026-03-01', estado:'activo'   },
  { id:10, nombre:'Diego Vargas',     correo:'diego.vargas@mail.com',      telefono:'3001234510', nivel:'A1', salon:'Canadá',        ingreso:'2026-03-01', estado:'inactivo' },
  { id:11, nombre:'Lucía Mora',       correo:'lucia.mora@mail.com',        telefono:'3001234511', nivel:'B1', salon:'Londres',       ingreso:'2026-03-05', estado:'activo'   },
  { id:12, nombre:'Sebastián Ruiz',   correo:'sebastian.ruiz@mail.com',    telefono:'3001234512', nivel:'C2', salon:'Miami',         ingreso:'2026-03-10', estado:'activo'   },
  { id:13, nombre:'Isabella Peña',    correo:'isabella.pena@mail.com',     telefono:'3001234513', nivel:'A2', salon:'Canadá',        ingreso:'2026-03-15', estado:'activo'   },
  { id:14, nombre:'Miguel Castro',    correo:'miguel.castro@mail.com',     telefono:'3001234514', nivel:'B2', salon:'Nueva Zelanda', ingreso:'2026-03-20', estado:'inactivo' },
  { id:15, nombre:'Natalia Soto',     correo:'natalia.soto@mail.com',      telefono:'3001234515', nivel:'A1', salon:'Canadá',        ingreso:'2026-04-01', estado:'activo'   },
];

// Generar matrícula a partir del id
function generarMatricula(id) {
  return 'AL-2026-' + String(id).padStart(5, '0');
}

// Asignar color de avatar según inicial
function colorAvatar(nombre) {
  const idx = nombre.charCodeAt(0) % COLORES_AVATAR.length;
  return COLORES_AVATAR[idx];
}

// ── 3. ESTADO DE FILTROS / BÚSQUEDA / ORDEN ─────────────────
let filtroNivel  = 'todos';
let filtroEstado = 'todos';
let busqueda     = '';
let sortCol      = null;
let sortDir      = 1; // 1 asc, -1 desc
let modoEdicion  = null; // id del alumno en edición o null

// ── 4. FILTRAR Y ORDENAR ─────────────────────────────────────
function filtrarAlumnos() {
  return alumnos
    .filter(function (a) {
      const pasaNivel  = filtroNivel  === 'todos' || a.nivel  === filtroNivel;
      const pasaEstado = filtroEstado === 'todos' || a.estado === filtroEstado;
      const q = busqueda.toLowerCase();
      const pasaBusqueda = !q ||
        a.nombre.toLowerCase().includes(q) ||
        a.correo.toLowerCase().includes(q) ||
        generarMatricula(a.id).toLowerCase().includes(q);
      return pasaNivel && pasaEstado && pasaBusqueda;
    })
    .sort(function (a, b) {
      if (!sortCol) return 0;
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return va < vb ? -sortDir : va > vb ? sortDir : 0;
    });
}

// ── 5. ACTUALIZAR STATS MINI ─────────────────────────────────
function actualizarStats() {
  const activos   = alumnos.filter(a => a.estado === 'activo').length;
  const inactivos = alumnos.filter(a => a.estado === 'inactivo').length;
  const pendientes= alumnos.filter(a => a.estado === 'pendiente').length;
  document.getElementById('sm-activos').textContent   = activos;
  document.getElementById('sm-inactivos').textContent = inactivos;
  document.getElementById('sm-pendientes').textContent= pendientes;
  document.getElementById('sm-total').textContent     = alumnos.length;
  document.getElementById('texto-conteo').textContent =
    alumnos.length + ' alumnos registrados en total';
}

// ── 6. RENDER TABLA ──────────────────────────────────────────
function renderTabla() {
  const tbody   = document.getElementById('tbody-alumnos');
  const sinRes  = document.getElementById('sin-resultados');
  const badge   = document.getElementById('badge-resultados');
  const lista   = filtrarAlumnos();

  badge.textContent = lista.length + ' resultado' + (lista.length !== 1 ? 's' : '');

  if (lista.length === 0) {
    tbody.innerHTML = '';
    sinRes.classList.remove('oculto');
    return;
  }
  sinRes.classList.add('oculto');

  tbody.innerHTML = lista.map(function (a) {
    const mat   = generarMatricula(a.id);
    const color = colorAvatar(a.nombre);
    const inicial = a.nombre.charAt(0).toUpperCase();
    return `
      <tr class="fila-alumno" data-id="${a.id}">
        <td>
          <div class="alumno-info">
            <div class="avatar-alumno" style="background:${color}">${inicial}</div>
            <div>
              <div class="alumno-nombre">${a.nombre}</div>
              <div class="alumno-correo">${a.correo}</div>
            </div>
          </div>
        </td>
        <td class="td-matricula">${mat}</td>
        <td><span class="nivel-badge">${a.nivel}</span></td>
        <td>${a.salon}</td>
        <td>${a.telefono}</td>
        <td>${formatearFecha(a.ingreso)}</td>
        <td><span class="badge-estado ${a.estado}">${labelEstado(a.estado)}</span></td>
        <td>
          <div class="btns-accion">
            <button class="btn-editar-fila" data-id="${a.id}">Editar</button>
            <button class="btn-eliminar-fila" data-id="${a.id}">Eliminar</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  // Conectar eventos de fila
  tbody.querySelectorAll('.btn-editar-fila').forEach(function (btn) {
    btn.addEventListener('click', function () { abrirModalEditar(parseInt(this.dataset.id)); });
  });
  tbody.querySelectorAll('.btn-eliminar-fila').forEach(function (btn) {
    btn.addEventListener('click', function () { abrirModalEliminar(parseInt(this.dataset.id)); });
  });

  // Animación
  tbody.querySelectorAll('.fila-alumno').forEach(function (fila, i) {
    fila.style.opacity   = '0';
    fila.style.transform = 'translateY(8px)';
    fila.style.transition = 'opacity 0.28s ease ' + (i * 0.04) + 's, transform 0.28s ease ' + (i * 0.04) + 's';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        fila.style.opacity   = '1';
        fila.style.transform = 'translateY(0)';
      });
    });
  });
}

// ── 7. RENDER CARDS ──────────────────────────────────────────
function renderCards() {
  const contenedor = document.getElementById('seccion-cards');
  const lista = filtrarAlumnos();
  if (lista.length === 0) {
    contenedor.innerHTML = '<p style="color:var(--gris-texto);font-size:0.9rem;padding:20px">No se encontraron alumnos.</p>';
    return;
  }
  contenedor.innerHTML = lista.map(function (a) {
    const mat   = generarMatricula(a.id);
    const color = colorAvatar(a.nombre);
    const inicial = a.nombre.charAt(0).toUpperCase();
    return `
      <div class="alumno-card" data-id="${a.id}">
        <div class="card-avatar-wrap">
          <div class="card-avatar" style="background:${color}">${inicial}</div>
          <div>
            <div class="card-nombre">${a.nombre}</div>
            <div class="card-correo">${a.correo}</div>
          </div>
        </div>
        <div class="card-data">
          <span>&#128197; Ingreso: <strong>${formatearFecha(a.ingreso)}</strong></span>
          <span>&#128198; Salón: <strong>${a.salon}</strong></span>
          <span>&#128222; Tel: <strong>${a.telefono}</strong></span>
          <span class="card-matricula">${mat}</span>
        </div>
        <div class="card-footer">
          <span class="nivel-badge">${a.nivel}</span>
          <span class="badge-estado ${a.estado}">${labelEstado(a.estado)}</span>
        </div>
        <div class="btns-accion card-btns">
          <button class="btn-editar-fila" data-id="${a.id}">Editar</button>
          <button class="btn-eliminar-fila" data-id="${a.id}">Eliminar</button>
        </div>
      </div>`;
  }).join('');

  contenedor.querySelectorAll('.btn-editar-fila').forEach(function (btn) {
    btn.addEventListener('click', function () { abrirModalEditar(parseInt(this.dataset.id)); });
  });
  contenedor.querySelectorAll('.btn-eliminar-fila').forEach(function (btn) {
    btn.addEventListener('click', function () { abrirModalEliminar(parseInt(this.dataset.id)); });
  });

  // Animación
  contenedor.querySelectorAll('.alumno-card').forEach(function (card, i) {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(14px)';
    card.style.transition = 'opacity 0.32s ease ' + (i * 0.05) + 's, transform 0.32s ease ' + (i * 0.05) + 's';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  });
}

// ── 8. RENDER GENERAL ────────────────────────────────────────
function render() {
  actualizarStats();
  const esTabla = !document.getElementById('seccion-tabla').classList.contains('oculto');
  if (esTabla) renderTabla(); else renderCards();
}

// ── 9. HELPERS ───────────────────────────────────────────────
function formatearFecha(iso) {
  const [y, m, d] = iso.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return d + ' ' + meses[parseInt(m) - 1] + ' ' + y;
}
function labelEstado(e) {
  return { activo:'Activo', inactivo:'Inactivo', pendiente:'Pendiente' }[e] || e;
}

// ── 10. BÚSQUEDA ─────────────────────────────────────────────
const inputBusqueda = document.getElementById('input-busqueda');
const btnLimpiar    = document.getElementById('btn-limpiar');
const btnReset      = document.getElementById('btn-reset');

inputBusqueda.addEventListener('input', function () {
  busqueda = this.value.trim();
  btnLimpiar.classList.toggle('oculto', busqueda === '');
  render();
});

function limpiarBusqueda() {
  inputBusqueda.value = '';
  busqueda = '';
  btnLimpiar.classList.add('oculto');
  render();
}
btnLimpiar.addEventListener('click', limpiarBusqueda);
if (btnReset) btnReset.addEventListener('click', limpiarBusqueda);

// ── 11. FILTROS SIDEBAR NIVEL ────────────────────────────────
document.querySelectorAll('.filtro-sb').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filtro-sb').forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');
    filtroNivel = this.dataset.nivel;
    render();
  });
});

// ── 12. FILTROS SIDEBAR ESTADO ───────────────────────────────
document.querySelectorAll('.filtro-sb-estado').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filtro-sb-estado').forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');
    filtroEstado = this.dataset.estado;
    render();
  });
});

// ── 13. ORDENAMIENTO POR COLUMNA ─────────────────────────────
document.querySelectorAll('.th-sort').forEach(function (th) {
  th.addEventListener('click', function () {
    const col = this.dataset.col;
    if (sortCol === col) { sortDir *= -1; } else { sortCol = col; sortDir = 1; }
    document.querySelectorAll('.sort-icon').forEach(function (ic) { ic.style.opacity = '0.35'; });
    this.querySelector('.sort-icon').style.opacity = '1';
    this.querySelector('.sort-icon').textContent = sortDir === 1 ? '↑' : '↓';
    render();
  });
});

// ── 14. CAMBIO DE VISTA ──────────────────────────────────────
const btnVistaTabla = document.getElementById('btn-vista-tabla');
const btnVistaCards = document.getElementById('btn-vista-cards');
const secTabla      = document.getElementById('seccion-tabla');
const secCards      = document.getElementById('seccion-cards');

btnVistaTabla.addEventListener('click', function () {
  btnVistaTabla.classList.add('activo');
  btnVistaCards.classList.remove('activo');
  secTabla.classList.remove('oculto');
  secCards.classList.add('oculto');
  renderTabla();
});

btnVistaCards.addEventListener('click', function () {
  btnVistaCards.classList.add('activo');
  btnVistaTabla.classList.remove('activo');
  secCards.classList.remove('oculto');
  secTabla.classList.add('oculto');
  renderCards();
});

// ── 15. MODAL AGREGAR / EDITAR ───────────────────────────────
const modalAlumno   = document.getElementById('modal-alumno');
const modalTitulo   = document.getElementById('modal-titulo');
const btnNuevo      = document.getElementById('btn-nuevo-alumno');
const btnCerrar     = document.getElementById('btn-cerrar-modal');
const btnCancelar   = document.getElementById('btn-cancelar-modal');
const btnGuardar    = document.getElementById('btn-guardar-modal');

function abrirModalNuevo() {
  modoEdicion = null;
  modalTitulo.textContent = 'Agregar Alumno';
  btnGuardar.textContent  = 'Guardar Alumno';
  limpiarModal();
  document.getElementById('m-matricula').value = 'AL-2026-' + String(contadorMatricula + 1).padStart(5,'0');
  modalAlumno.classList.remove('oculto');
  document.body.style.overflow = 'hidden';
  document.getElementById('m-nombre').focus();
}

function abrirModalEditar(id) {
  const a = alumnos.find(x => x.id === id);
  if (!a) return;
  modoEdicion = id;
  modalTitulo.textContent = 'Editar Alumno';
  btnGuardar.textContent  = 'Guardar Cambios';
  limpiarModal();
  document.getElementById('m-nombre').value    = a.nombre;
  document.getElementById('m-correo').value    = a.correo;
  document.getElementById('m-telefono').value  = a.telefono;
  document.getElementById('m-fecha-nac').value = a.ingreso;
  document.getElementById('m-nivel').value     = a.nivel;
  document.getElementById('m-salon').value     = a.salon;
  document.getElementById('m-estado').value    = a.estado;
  document.getElementById('m-matricula').value = generarMatricula(a.id);
  modalAlumno.classList.remove('oculto');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  modalAlumno.classList.add('oculto');
  document.body.style.overflow = '';
}

function limpiarModal() {
  ['m-nombre','m-correo','m-telefono','m-fecha-nac','m-nivel','m-salon','m-pais','m-ciudad'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('invalido'); }
  });
  document.getElementById('m-estado').value = 'activo';
  document.getElementById('m-matricula').value = '';
  ['e-nombre','e-correo','e-telefono','e-fecha-nac','e-nivel','e-salon'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

btnNuevo.addEventListener('click', abrirModalNuevo);
btnCerrar.addEventListener('click', cerrarModal);
btnCancelar.addEventListener('click', cerrarModal);
modalAlumno.addEventListener('click', function (e) { if (e.target === modalAlumno) cerrarModal(); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modalAlumno.classList.contains('oculto')) cerrarModal();
});

// ── 16. VALIDACIÓN Y GUARDADO ────────────────────────────────
const regexCorreo   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexTelefono = /^[0-9]{7,15}$/;

function setInvalido(inputId, errorId, msg) {
  const el = document.getElementById(inputId);
  el.classList.add('invalido');
  document.getElementById(errorId).textContent = msg;
}
function setValido(inputId, errorId) {
  document.getElementById(inputId).classList.remove('invalido');
  document.getElementById(errorId).textContent = '';
}

btnGuardar.addEventListener('click', function () {
  let ok = true;

  const nom = document.getElementById('m-nombre').value.trim();
  const cor = document.getElementById('m-correo').value.trim();
  const tel = document.getElementById('m-telefono').value.trim();
  const fec = document.getElementById('m-fecha-nac').value;
  const niv = document.getElementById('m-nivel').value;
  const sal = document.getElementById('m-salon').value;

  if (nom.length < 3) { setInvalido('m-nombre','e-nombre','Ingresa el nombre completo.'); ok = false; } else setValido('m-nombre','e-nombre');
  if (!regexCorreo.test(cor)) { setInvalido('m-correo','e-correo','Correo electrónico no válido.'); ok = false; } else setValido('m-correo','e-correo');
  if (!regexTelefono.test(tel)) { setInvalido('m-telefono','e-telefono','Teléfono inválido (7–15 dígitos).'); ok = false; } else setValido('m-telefono','e-telefono');
  if (!fec) { setInvalido('m-fecha-nac','e-fecha-nac','Selecciona una fecha.'); ok = false; } else setValido('m-fecha-nac','e-fecha-nac');
  if (!niv) { setInvalido('m-nivel','e-nivel','Selecciona un nivel.'); ok = false; } else setValido('m-nivel','e-nivel');
  if (!sal) { setInvalido('m-salon','e-salon','Selecciona un salón.'); ok = false; } else setValido('m-salon','e-salon');

  if (!ok) return;

  btnGuardar.textContent = 'Guardando...';
  btnGuardar.classList.add('cargando');

  setTimeout(function () {
    btnGuardar.classList.remove('cargando');

    const estado = document.getElementById('m-estado').value;

    if (modoEdicion) {
      // Editar existente
      const idx = alumnos.findIndex(x => x.id === modoEdicion);
      if (idx >= 0) {
        alumnos[idx] = Object.assign(alumnos[idx], { nombre: nom, correo: cor, telefono: tel, ingreso: fec, nivel: niv, salon: sal, estado });
      }
      btnGuardar.textContent = 'Guardar Cambios';
      mostrarToast('Alumno actualizado correctamente');
    } else {
      // Nuevo alumno
      contadorMatricula++;
      const nuevoId = alumnos.length > 0 ? Math.max(...alumnos.map(a => a.id)) + 1 : 1;
      alumnos.unshift({ id: nuevoId, nombre: nom, correo: cor, telefono: tel, ingreso: fec, nivel: niv, salon: sal, estado });
      btnGuardar.textContent = 'Guardar Alumno';
      mostrarToast('Alumno agregado correctamente');
    }

    cerrarModal();
    render();
  }, 900);
});

// ── 17. MODAL ELIMINAR ───────────────────────────────────────
const modalEliminar   = document.getElementById('modal-eliminar');
const nombreEliminar  = document.getElementById('nombre-a-eliminar');
const btnCerrarElim   = document.getElementById('btn-cerrar-eliminar');
const btnCancelarElim = document.getElementById('btn-cancelar-eliminar');
const btnConfirmElim  = document.getElementById('btn-confirmar-eliminar');
let idAEliminar = null;

function abrirModalEliminar(id) {
  const a = alumnos.find(x => x.id === id);
  if (!a) return;
  idAEliminar = id;
  nombreEliminar.textContent = a.nombre;
  modalEliminar.classList.remove('oculto');
  document.body.style.overflow = 'hidden';
}

function cerrarModalEliminar() {
  modalEliminar.classList.add('oculto');
  document.body.style.overflow = '';
  idAEliminar = null;
}

btnCerrarElim.addEventListener('click', cerrarModalEliminar);
btnCancelarElim.addEventListener('click', cerrarModalEliminar);
modalEliminar.addEventListener('click', function (e) { if (e.target === modalEliminar) cerrarModalEliminar(); });

btnConfirmElim.addEventListener('click', function () {
  alumnos = alumnos.filter(a => a.id !== idAEliminar);
  cerrarModalEliminar();
  render();
  mostrarToast('Alumno eliminado');
});

// ── 18. TOAST ────────────────────────────────────────────────
function mostrarToast(mensaje, esError) {
  const existente = document.querySelector('.toast-notif');
  if (existente) existente.remove();
  if (!document.getElementById('style-toast')) {
    const s = document.createElement('style');
    s.id = 'style-toast';
    s.textContent = '@keyframes slideInToast{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }
  const toast = document.createElement('div');
  toast.className = 'toast-notif';
  toast.textContent = mensaje;
  toast.style.cssText = [
    'position:fixed','bottom:28px','right:28px','z-index:999',
    'background:' + (esError ? 'var(--rojo)' : 'var(--morado)'),
    'color:#fff','padding:12px 22px','border-radius:50px',
    'font-size:0.85rem','font-weight:600',
    'box-shadow:0 4px 18px rgba(0,0,0,0.18)',
    'animation:slideInToast 0.3s ease','pointer-events:none'
  ].join(';');
  document.body.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s';
    setTimeout(function () { toast.remove(); }, 320);
  }, 2500);
}

// ── 19. INICIALIZAR ──────────────────────────────────────────
render();