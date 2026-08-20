/* ============================================================
   matriculas_admin.js
   Instituto American Land
   Ubicación: assets/js/matriculas_admin.js
============================================================ */

// ── 1. CARGAR NOMBRE DESDE sessionStorage ──────────────────
const nombre    = sessionStorage.getItem('nombre') || 'Administrador';
const navNombre = document.getElementById('nav-nombre');
const navAvatar = document.getElementById('nav-avatar');
if (navNombre) navNombre.textContent = nombre;
if (navAvatar) navAvatar.textContent = nombre.charAt(0).toUpperCase();

// ── 2. FECHA ACTUAL ─────────────────────────────────────────
const textFecha = document.getElementById('texto-fecha');
if (textFecha) {
  const hoy = new Date();
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaStr = hoy.toLocaleDateString('es-CO', opciones);
  textFecha.textContent = fechaStr.charAt(0).toUpperCase() + fechaStr.slice(1);
}

// ── 3. CERRAR SESIÓN ────────────────────────────────────────
document.querySelector('.btn-cerrar').addEventListener('click', function (e) {
  e.preventDefault();
  sessionStorage.clear();
  window.location.href = '../auth/login.html';
});

// ── 4. DATOS DE MATRÍCULAS ──────────────────────────────────
let matriculas = [
  { id: 51, codigo: 'AL-2026-00051', nombre: 'Sofía Torres',     inicial: 'S', nivel: 'A1', salon: 'Canadá',        metodo: 'pse',           metodoTxt: 'PSE',           fecha: '28 Abr 2026', estado: 'pendiente' },
  { id: 52, codigo: 'AL-2026-00052', nombre: 'Juan Martínez',    inicial: 'J', nivel: 'B1', salon: 'Londres',       metodo: 'transferencia', metodoTxt: 'Transferencia', fecha: '28 Abr 2026', estado: 'pendiente' },
  { id: 53, codigo: 'AL-2026-00053', nombre: 'Valentina Cruz',   inicial: 'V', nivel: 'C1', salon: 'Miami',         metodo: 'tarjeta',       metodoTxt: 'Tarjeta',       fecha: '27 Abr 2026', estado: 'pendiente' },
  { id: 48, codigo: 'AL-2026-00048', nombre: 'Laura Gómez',      inicial: 'L', nivel: 'A1', salon: 'Canadá',        metodo: 'pse',           metodoTxt: 'PSE',           fecha: '25 Abr 2026', estado: 'aprobado'  },
  { id: 47, codigo: 'AL-2026-00047', nombre: 'Carlos Ríos',      inicial: 'C', nivel: 'A2', salon: 'Nueva Zelanda', metodo: 'transferencia', metodoTxt: 'Transferencia', fecha: '24 Abr 2026', estado: 'aprobado'  },
  { id: 46, codigo: 'AL-2026-00046', nombre: 'Andrea Salazar',   inicial: 'A', nivel: 'B2', salon: 'Nueva Zelanda', metodo: 'tarjeta',       metodoTxt: 'Tarjeta',       fecha: '23 Abr 2026', estado: 'rechazado' },
  { id: 45, codigo: 'AL-2026-00045', nombre: 'Miguel Ángel Paz', inicial: 'M', nivel: 'B1', salon: 'Londres',       metodo: 'pse',           metodoTxt: 'PSE',           fecha: '22 Abr 2026', estado: 'aprobado'  },
  { id: 44, codigo: 'AL-2026-00044', nombre: 'Daniela Ortiz',    inicial: 'D', nivel: 'C1', salon: 'Miami',         metodo: 'transferencia', metodoTxt: 'Transferencia', fecha: '21 Abr 2026', estado: 'aprobado'  },
  { id: 43, codigo: 'AL-2026-00043', nombre: 'Esteban Rojas',    inicial: 'E', nivel: 'A1', salon: 'Canadá',        metodo: 'tarjeta',       metodoTxt: 'Tarjeta',       fecha: '20 Abr 2026', estado: 'pendiente' },
  { id: 42, codigo: 'AL-2026-00042', nombre: 'Isabella Herrera', inicial: 'I', nivel: 'B1', salon: 'Londres',       metodo: 'pse',           metodoTxt: 'PSE',           fecha: '19 Abr 2026', estado: 'rechazado' },
  { id: 41, codigo: 'AL-2026-00041', nombre: 'Santiago Vargas',  inicial: 'S', nivel: 'A2', salon: 'Nueva Zelanda', metodo: 'transferencia', metodoTxt: 'Transferencia', fecha: '18 Abr 2026', estado: 'aprobado'  },
  { id: 40, codigo: 'AL-2026-00040', nombre: 'Camila Reyes',     inicial: 'C', nivel: 'C1', salon: 'Miami',         metodo: 'tarjeta',       metodoTxt: 'Tarjeta',       fecha: '17 Abr 2026', estado: 'aprobado'  },
];

let idSiguiente = 54;

// ── 5. ESTADO DE FILTROS Y PAGINACIÓN ───────────────────────
const filtros = { busqueda: '', estado: 'todos', nivel: 'todos', salon: 'todos' };
const porPagina = 6;
let paginaActual = 1;

const inputBusqueda   = document.getElementById('input-busqueda');
const selectEstado    = document.getElementById('filtro-estado');
const selectNivel     = document.getElementById('filtro-nivel');
const selectSalon     = document.getElementById('filtro-salon');
const btnResetFiltros = document.getElementById('btn-reset-filtros');
const tbody           = document.getElementById('tbody-matriculas');
const infoResultados  = document.getElementById('info-resultados');
const paginacionEl    = document.getElementById('paginacion');

function normalizar(txt) {
  return txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matriculasFiltradas() {
  return matriculas.filter(function (m) {
    const coincideBusqueda = filtros.busqueda === '' ||
      normalizar(m.nombre).includes(normalizar(filtros.busqueda)) ||
      normalizar(m.codigo).includes(normalizar(filtros.busqueda));
    const coincideEstado = filtros.estado === 'todos' || m.estado === filtros.estado;
    const coincideNivel  = filtros.nivel  === 'todos' || m.nivel  === filtros.nivel;
    const coincideSalon  = filtros.salon  === 'todos' || m.salon  === filtros.salon;
    return coincideBusqueda && coincideEstado && coincideNivel && coincideSalon;
  });
}

// ── 6. RENDER DE TABLA ──────────────────────────────────────
function crearFilaHTML(m) {
  const disabled = m.estado !== 'pendiente' ? 'disabled' : '';
  return (
    '<tr class="fila-matricula" data-id="' + m.id + '">' +
      '<td class="td-codigo">' + m.codigo + '</td>' +
      '<td><div class="alumno-info"><div class="avatar-mini">' + m.inicial + '</div>' + m.nombre + '</div></td>' +
      '<td>' + m.nivel + '</td>' +
      '<td>' + m.salon + '</td>' +
      '<td><span class="metodo-pago ' + m.metodo + '">' + m.metodoTxt + '</span></td>' +
      '<td>' + m.fecha + '</td>' +
      '<td><span class="badge-estado ' + m.estado + '">' + capitalizar(m.estado) + '</span></td>' +
      '<td><div class="acciones-fila">' +
        '<button class="btn-aprobar" data-id="' + m.id + '" ' + disabled + '>Aprobar</button>' +
        '<button class="btn-rechazar" data-id="' + m.id + '" ' + disabled + '>Rechazar</button>' +
      '</div></td>' +
    '</tr>'
  );
}

function capitalizar(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

function renderTabla() {
  const filtradas = matriculasFiltradas();
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;

  const inicio = (paginaActual - 1) * porPagina;
  const pagina = filtradas.slice(inicio, inicio + porPagina);

  if (pagina.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="estado-vacio">' +
      '<span class="icono-vacio">&#128203;</span>' +
      '<p>No se encontraron matrículas con los filtros seleccionados</p>' +
      '</div></td></tr>';
  } else {
    tbody.innerHTML = pagina.map(crearFilaHTML).join('');
  }

  if (infoResultados) {
    infoResultados.innerHTML = 'Mostrando <strong>' + pagina.length + '</strong> de <strong>' + filtradas.length + '</strong> matrículas';
  }

  renderPaginacion(totalPaginas);
  animarFilas();
  actualizarStats();
}

function renderPaginacion(totalPaginas) {
  if (!paginacionEl) return;
  let html = '';
  html += '<button class="btn-pagina" data-accion="prev" ' + (paginaActual === 1 ? 'disabled' : '') + '>&#8592;</button>';
  for (let i = 1; i <= totalPaginas; i++) {
    html += '<button class="btn-pagina ' + (i === paginaActual ? 'activo' : '') + '" data-pagina="' + i + '">' + i + '</button>';
  }
  html += '<button class="btn-pagina" data-accion="next" ' + (paginaActual === totalPaginas ? 'disabled' : '') + '>&#8594;</button>';
  paginacionEl.innerHTML = html;
}

function animarFilas() {
  const filas = document.querySelectorAll('.fila-matricula');
  const obsFilas = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.style.opacity   = '1';
        entrada.target.style.transform = 'translateY(0)';
        obsFilas.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.05 });

  filas.forEach(function (fila, i) {
    fila.style.opacity    = '0';
    fila.style.transform  = 'translateY(10px)';
    fila.style.transition = 'opacity 0.3s ease ' + (i * 0.06) + 's, transform 0.3s ease ' + (i * 0.06) + 's';
    obsFilas.observe(fila);
  });
}

// ── 7. STATS ─────────────────────────────────────────────────
function actualizarStats() {
  const total      = matriculas.length;
  const pendientes = matriculas.filter(function (m) { return m.estado === 'pendiente'; }).length;
  const aprobadas  = matriculas.filter(function (m) { return m.estado === 'aprobado';  }).length;
  const rechazadas = matriculas.filter(function (m) { return m.estado === 'rechazado'; }).length;

  setStat('stat-total', total);
  setStat('stat-pendientes', pendientes);
  setStat('stat-aprobadas', aprobadas);
  setStat('stat-rechazadas', rechazadas);
}

function setStat(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

// ── 8. EVENTOS DE FILTROS ───────────────────────────────────
if (inputBusqueda) {
  inputBusqueda.addEventListener('input', function () {
    filtros.busqueda = this.value;
    paginaActual = 1;
    renderTabla();
  });
}
if (selectEstado) {
  selectEstado.addEventListener('change', function () {
    filtros.estado = this.value;
    paginaActual = 1;
    renderTabla();
  });
}
if (selectNivel) {
  selectNivel.addEventListener('change', function () {
    filtros.nivel = this.value;
    paginaActual = 1;
    renderTabla();
  });
}
if (selectSalon) {
  selectSalon.addEventListener('change', function () {
    filtros.salon = this.value;
    paginaActual = 1;
    renderTabla();
  });
}
if (btnResetFiltros) {
  btnResetFiltros.addEventListener('click', function () {
    filtros.busqueda = ''; filtros.estado = 'todos'; filtros.nivel = 'todos'; filtros.salon = 'todos';
    if (inputBusqueda) inputBusqueda.value = '';
    if (selectEstado)  selectEstado.value  = 'todos';
    if (selectNivel)   selectNivel.value   = 'todos';
    if (selectSalon)   selectSalon.value   = 'todos';
    paginaActual = 1;
    renderTabla();
  });
}

if (paginacionEl) {
  paginacionEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-pagina');
    if (!btn || btn.disabled) return;
    const totalPaginas = Math.max(1, Math.ceil(matriculasFiltradas().length / porPagina));
    if (btn.dataset.accion === 'prev') paginaActual = Math.max(1, paginaActual - 1);
    else if (btn.dataset.accion === 'next') paginaActual = Math.min(totalPaginas, paginaActual + 1);
    else if (btn.dataset.pagina) paginaActual = parseInt(btn.dataset.pagina, 10);
    renderTabla();
  });
}

// ── 9. APROBAR / RECHAZAR (delegación de eventos) ───────────
if (tbody) {
  tbody.addEventListener('click', function (e) {
    const btnAprobar  = e.target.closest('.btn-aprobar');
    const btnRechazar = e.target.closest('.btn-rechazar');
    if (!btnAprobar && !btnRechazar) return;

    const id = parseInt((btnAprobar || btnRechazar).dataset.id, 10);
    const matricula = matriculas.find(function (m) { return m.id === id; });
    if (!matricula) return;

    if (btnAprobar) {
      matricula.estado = 'aprobado';
      mostrarToast('Matrícula ' + matricula.codigo + ' aprobada correctamente');
    } else {
      matricula.estado = 'rechazado';
      mostrarToast('Matrícula ' + matricula.codigo + ' rechazada', true);
    }
    renderTabla();
  });
}

// ── 10. MODAL NUEVA MATRÍCULA ───────────────────────────────
const modalOverlay   = document.getElementById('modal-nueva-matricula');
const btnAbrirModal  = document.getElementById('btn-abrir-modal');
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const btnCancelarModal = document.getElementById('btn-modal-cancelar');
const formNuevaMatricula = document.getElementById('form-nueva-matricula');

function abrirModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.add('abierto');
}
function cerrarModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('abierto');
  if (formNuevaMatricula) formNuevaMatricula.reset();
}

if (btnAbrirModal)  btnAbrirModal.addEventListener('click', abrirModal);
if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) cerrarModal();
  });
}
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('abierto')) cerrarModal();
});

if (formNuevaMatricula) {
  formNuevaMatricula.addEventListener('submit', function (e) {
    e.preventDefault();

    const nombreAlumno = document.getElementById('input-nombre-alumno').value.trim();
    const nivel  = document.getElementById('select-nivel-modal').value;
    const salon  = document.getElementById('select-salon-modal').value;
    const metodo = document.getElementById('select-metodo-modal').value;

    if (!nombreAlumno) return;

    const metodosTxt = { pse: 'PSE', transferencia: 'Transferencia', tarjeta: 'Tarjeta' };
    const hoy = new Date();
    const fechaCorta = hoy.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
      .replace('.', '');

    const nueva = {
      id: idSiguiente++,
      codigo: 'AL-2026-' + String(idSiguiente - 1).padStart(5, '0'),
      nombre: nombreAlumno,
      inicial: nombreAlumno.charAt(0).toUpperCase(),
      nivel: nivel,
      salon: salon,
      metodo: metodo,
      metodoTxt: metodosTxt[metodo] || metodo,
      fecha: fechaCorta.charAt(0).toUpperCase() + fechaCorta.slice(1),
      estado: 'pendiente'
    };

    matriculas.unshift(nueva);
    paginaActual = 1;
    filtros.busqueda = ''; filtros.estado = 'todos'; filtros.nivel = 'todos'; filtros.salon = 'todos';
    if (inputBusqueda) inputBusqueda.value = '';
    if (selectEstado)  selectEstado.value  = 'todos';
    if (selectNivel)   selectNivel.value   = 'todos';
    if (selectSalon)   selectSalon.value   = 'todos';

    renderTabla();
    cerrarModal();
    mostrarToast('Matrícula ' + nueva.codigo + ' registrada correctamente');
  });
}

// ── 11. ACCESOS RÁPIDOS SIDEBAR ─────────────────────────────
const rutas = {
  'sb-nuevo-alumno':  'alumnos.html',
  'sb-nuevo-docente': 'docentes.html',
  'sb-nuevo-salon':   'salones.html',
};

Object.keys(rutas).forEach(function (id) {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', function () {
      window.location.href = rutas[id];
    });
  }
});

// ── 12. NOTIFICACIÓN (campanita) ────────────────────────────
const btnNotif = document.getElementById('btn-notif');
if (btnNotif) {
  btnNotif.addEventListener('click', function () {
    mostrarToast('No tienes notificaciones nuevas');
  });
}

// ── 13. TOAST ────────────────────────────────────────────────
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

// ── 14. RENDER INICIAL ───────────────────────────────────────
renderTabla();