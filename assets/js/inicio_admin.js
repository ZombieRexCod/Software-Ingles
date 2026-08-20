/* ============================================================
   inicio_admin.js
   Instituto American Land
   Ubicación: assets/js/inicio_admin.js
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

// ── 4. CONTADORES ANIMADOS ───────────────────────────────────
const datos = {
  'stat-alumnos':    { fin: 39,  duracion: 1200 },
  'stat-docentes':   { fin: 5,   duracion: 800  },
  'stat-salones':    { fin: 4,   duracion: 900  },
  'stat-matriculas': { fin: 3,   duracion: 700  },
};

function animarContador(el, fin, duracion) {
  const inicio   = 0;
  const pasos    = 60;
  const intervalo = duracion / pasos;
  let paso = 0;

  const timer = setInterval(function () {
    paso++;
    const progreso = paso / pasos;
    // Easing ease-out
    const valorActual = Math.round(fin * (1 - Math.pow(1 - progreso, 3)));
    el.textContent = valorActual;
    if (paso >= pasos) {
      clearInterval(timer);
      el.textContent = fin;
    }
  }, intervalo);
}

// Lanzar contadores al hacer scroll (IntersectionObserver)
const statsGrid = document.querySelector('.grid-stats');
const obsStats = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      Object.keys(datos).forEach(function (id) {
        const el = document.getElementById(id);
        if (el) animarContador(el, datos[id].fin, datos[id].duracion);
      });
      obsStats.unobserve(entrada.target);
    }
  });
}, { threshold: 0.3 });

if (statsGrid) obsStats.observe(statsGrid);

// ── 5. ANIMACIÓN STAT CARDS ─────────────────────────────────
const statCards = document.querySelectorAll('.stat-card');
const obsCards = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateY(0)';
      obsCards.unobserve(entrada.target);
    }
  });
}, { threshold: 0.1 });

statCards.forEach(function (card, i) {
  card.style.opacity    = '0';
  card.style.transform  = 'translateY(18px)';
  card.style.transition = 'opacity 0.4s ease ' + (i * 0.1) + 's, transform 0.4s ease ' + (i * 0.1) + 's';
  obsCards.observe(card);
});

// ── 6. ANIMACIÓN SALONES ─────────────────────────────────────
const salonCards = document.querySelectorAll('.salon-card');
const obsSalones = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateX(0)';
      obsSalones.unobserve(entrada.target);
    }
  });
}, { threshold: 0.05 });

salonCards.forEach(function (card, i) {
  card.style.opacity    = '0';
  card.style.transform  = 'translateX(-14px)';
  card.style.transition = 'opacity 0.35s ease ' + (i * 0.1) + 's, transform 0.35s ease ' + (i * 0.1) + 's';
  obsSalones.observe(card);
});

// ── 7. ANIMACIÓN ACTIVIDAD RECIENTE ─────────────────────────
const actItems = document.querySelectorAll('.actividad-item');
const obsAct = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateX(0)';
      obsAct.unobserve(entrada.target);
    }
  });
}, { threshold: 0.05 });

actItems.forEach(function (item, i) {
  item.style.opacity    = '0';
  item.style.transform  = 'translateX(14px)';
  item.style.transition = 'opacity 0.35s ease ' + (i * 0.09) + 's, transform 0.35s ease ' + (i * 0.09) + 's';
  obsAct.observe(item);
});

// ── 8. ANIMACIÓN FILAS DE TABLA ──────────────────────────────
const filasMatricula = document.querySelectorAll('.fila-matricula');
const obsFilas = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (entrada) {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity   = '1';
      entrada.target.style.transform = 'translateY(0)';
      obsFilas.unobserve(entrada.target);
    }
  });
}, { threshold: 0.05 });

filasMatricula.forEach(function (fila, i) {
  fila.style.opacity    = '0';
  fila.style.transform  = 'translateY(10px)';
  fila.style.transition = 'opacity 0.3s ease ' + (i * 0.1) + 's, transform 0.3s ease ' + (i * 0.1) + 's';
  obsFilas.observe(fila);
});

// ── 9. APROBAR / RECHAZAR MATRÍCULAS ────────────────────────
document.querySelectorAll('.btn-aprobar').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const fila  = this.closest('tr');
    const badge = fila.querySelector('.badge-estado');
    const bBtns = fila.querySelectorAll('.btn-aprobar, .btn-rechazar');
    const codigo = fila.querySelector('.td-codigo').textContent;

    badge.className = 'badge-estado aprobado';
    badge.textContent = 'Aprobado';
    bBtns.forEach(function (b) { b.disabled = true; });

    // Actualizar stat de pendientes
    actualizarStatPendientes(-1);
    mostrarToast('Matrícula ' + codigo + ' aprobada correctamente');
  });
});

document.querySelectorAll('.btn-rechazar').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const fila  = this.closest('tr');
    const badge = fila.querySelector('.badge-estado');
    const bBtns = fila.querySelectorAll('.btn-aprobar, .btn-rechazar');
    const codigo = fila.querySelector('.td-codigo').textContent;

    badge.className = 'badge-estado rechazado';
    badge.textContent = 'Rechazado';
    bBtns.forEach(function (b) { b.disabled = true; });

    actualizarStatPendientes(-1);
    mostrarToast('Matrícula ' + codigo + ' rechazada', true);
  });
});

function actualizarStatPendientes(delta) {
  const el  = document.getElementById('stat-matriculas');
  const val = parseInt(el.textContent, 10) + delta;
  el.textContent = Math.max(0, val);
}

// ── 10. ACCESOS RÁPIDOS SIDEBAR ─────────────────────────────
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

// ── 11. NOTIFICACIÓN (campanita) ────────────────────────────
const btnNotif = document.getElementById('btn-notif');
if (btnNotif) {
  btnNotif.addEventListener('click', function () {
    mostrarToast('No tienes notificaciones nuevas');
  });
}

// ── 12. TOAST ───────────────────────────────────────────────
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