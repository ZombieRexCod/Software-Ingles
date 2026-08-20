/* ============================================================
   notas_docente.js
   Instituto American Land
   Ubicación: assets/js/notas_docente.js
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

// ── 3. CALCULAR PROMEDIO DE UNA FILA ────────────────────────
function calcularPromedio(fila) {
  const inputs = fila.querySelectorAll('.input-nota');
  const valores = [];

  inputs.forEach(function (input) {
    const val = parseFloat(input.value);
    if (!isNaN(val)) valores.push(val);
  });

  if (valores.length === 0) return null;
  const prom = valores.reduce((a, b) => a + b, 0) / valores.length;
  return parseFloat(prom.toFixed(1));
}

// ── 4. ACTUALIZAR BADGE DE PROMEDIO Y ESTADO ────────────────
function actualizarBadges(fila, promedio) {
  const promedioEl = fila.querySelector('.promedio-alumno');
  const estadoEl   = fila.querySelector('.badge');

  if (promedio === null) {
    promedioEl.textContent = '—';
    promedioEl.className   = 'promedio-alumno nota-pendiente';
    estadoEl.textContent   = 'Pendiente';
    estadoEl.className     = 'badge badge-pendiente';
    return;
  }

  promedioEl.textContent = promedio;

  if (promedio >= 4.5) {
    promedioEl.className = 'promedio-alumno nota-alta';
    estadoEl.textContent = 'Aprobado';
    estadoEl.className   = 'badge badge-aprobado';
  } else if (promedio >= 3.0) {
    promedioEl.className = 'promedio-alumno nota-media';
    estadoEl.textContent = 'Aprobado';
    estadoEl.className   = 'badge badge-aprobado';
  } else {
    promedioEl.className = 'promedio-alumno nota-baja';
    estadoEl.textContent = 'En Riesgo';
    estadoEl.className   = 'badge badge-riesgo';
  }
}

// ── 5. CALCULAR PROMEDIO DEL GRUPO ──────────────────────────
function calcularPromedioGrupo() {
  const filas    = document.querySelectorAll('#tbody-notas tr');
  const promedios = [];

  filas.forEach(function (fila) {
    const p = calcularPromedio(fila);
    if (p !== null) promedios.push(p);
  });

  const promedioGrupoEl = document.getElementById('promedio-grupo');
  if (promedios.length === 0) {
    promedioGrupoEl.textContent = '—';
    return;
  }

  const grupoVal = (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(1);
  promedioGrupoEl.textContent = grupoVal;

  if (parseFloat(grupoVal) >= 4.0)      promedioGrupoEl.style.color = '#27AE60';
  else if (parseFloat(grupoVal) >= 3.0) promedioGrupoEl.style.color = '#F39C12';
  else                                  promedioGrupoEl.style.color = '#C0392B';
}

// ── 6. ESCUCHAR CAMBIOS EN LOS INPUTS ───────────────────────
document.querySelectorAll('.input-nota').forEach(function (input) {
  input.addEventListener('input', function () {
    const val = parseFloat(this.value);

    // Validar rango
    if (this.value !== '' && (isNaN(val) || val < 0 || val > 5)) {
      this.classList.add('invalida');
      return;
    } else {
      this.classList.remove('invalida');
    }

    // Marcar como cambiado
    this.classList.add('nota-cambiada');

    // Recalcular promedio de la fila
    const fila     = this.closest('tr');
    const promedio = calcularPromedio(fila);
    actualizarBadges(fila, promedio);

    // Recalcular promedio del grupo
    calcularPromedioGrupo();
  });

  // Al perder foco, limpiar clase cambiada si el valor es válido
  input.addEventListener('blur', function () {
    if (!this.classList.contains('invalida')) {
      this.classList.remove('nota-cambiada');
    }
  });
});

// ── 7. SELECTOR DE CICLOS ────────────────────────────────────
const btnsCiclo = document.querySelectorAll('.btn-ciclo');

btnsCiclo.forEach(function (btn) {
  btn.addEventListener('click', function () {
    btnsCiclo.forEach(b => b.classList.remove('activo'));
    this.classList.add('activo');

    const ciclo = this.getAttribute('data-ciclo');
    const headers = document.querySelectorAll('.tabla-notas thead th');
    const cols    = document.querySelectorAll('.input-nota');

    // Resaltar columna del ciclo seleccionado
    headers.forEach(function (th, i) {
      th.style.background = '';
      th.style.color = '';
    });

    // El ciclo 1 = columna índice 1, ciclo 2 = índice 2, etc.
    if (headers[parseInt(ciclo)]) {
      headers[parseInt(ciclo)].style.background = 'rgba(75,0,130,0.1)';
      headers[parseInt(ciclo)].style.color      = 'var(--morado)';
    }
  });
});

// ── 8. BOTÓN GUARDAR ────────────────────────────────────────
const btnGuardar = document.getElementById('btn-guardar');
const alerta     = document.getElementById('alerta');

btnGuardar.addEventListener('click', function () {

  // Validar que no haya inputs inválidos
  const invalidos = document.querySelectorAll('.input-nota.invalida');
  if (invalidos.length > 0) {
    alerta.textContent = '⚠ Hay notas inválidas. Verifica que estén entre 0 y 5.';
    alerta.className   = 'alerta error';
    invalidos[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Estado guardando
  btnGuardar.classList.add('guardando');
  btnGuardar.textContent = '💾 Guardando...';
  alerta.className       = 'alerta';

  // Simular guardado
  setTimeout(function () {
    btnGuardar.classList.remove('guardando');
    btnGuardar.textContent = '💾 Guardar Notas';

    alerta.textContent = '✓ Notas guardadas correctamente.';
    alerta.className   = 'alerta exito';

    // Ocultar alerta después de 3s
    setTimeout(function () {
      alerta.className = 'alerta';
    }, 3000);
  }, 1200);
});

// ── 9. CALCULAR PROMEDIOS INICIALES ─────────────────────────
document.querySelectorAll('#tbody-notas tr').forEach(function (fila) {
  const promedio = calcularPromedio(fila);
  actualizarBadges(fila, promedio);
});

calcularPromedioGrupo();