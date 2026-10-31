// Utilidades compartidas por todas las páginas.
const sesion = {
  get token() { return localStorage.getItem('sigr_token'); },
  get usuario() { return JSON.parse(localStorage.getItem('sigr_usuario') || 'null'); },
  guardar({ token, usuario }) {
    localStorage.setItem('sigr_token', token);
    localStorage.setItem('sigr_usuario', JSON.stringify(usuario));
  },
  limpiar() {
    localStorage.removeItem('sigr_token');
    localStorage.removeItem('sigr_usuario');
  },
};

async function api(metodo, ruta, cuerpo) {
  const res = await fetch(`/api${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(sesion.token && { Authorization: `Bearer ${sesion.token}` }) },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  const datos = res.status === 204 ? null : await res.json();
  if (res.status === 401 && location.pathname !== '/') { sesion.limpiar(); location.href = '/'; }
  if (!res.ok) throw new Error(datos?.error || 'Error inesperado');
  return datos;
}

const pesos = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const textoEstado = (e) => e.replace('_', ' ');

function mostrarMensaje(el, texto, tipo = 'ok') {
  el.textContent = texto;
  el.className = `mensaje ${tipo}`;
}

async function montarEncabezado() {
  const modulos = await api('GET', '/modulos');
  const usuario = sesion.usuario;
  const enlaces = modulos.filter((m) => m.pagina)
    .map((m) => `<a href="/${m.pagina}" class="${location.pathname === '/' + m.pagina ? 'activo' : ''}">${m.titulo}</a>`)
    .join('');
  document.body.insertAdjacentHTML('afterbegin', `
    <header>
      <a class="marca" href="/">SIGR</a>
      <nav>${usuario ? enlaces : ''}</nav>
      <div class="sesion">${usuario ? `${usuario.nombre} (${usuario.rol}) <button class="secundario" id="salir">Salir</button>` : ''}</div>
    </header>`);
  document.getElementById('salir')?.addEventListener('click', async () => {
    await api('POST', '/auth/logout').catch(() => {});
    sesion.limpiar();
    location.href = '/';
  });
}

function exigirSesion() {
  if (!sesion.token) location.href = '/';
  return sesion.usuario;
}
