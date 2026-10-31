const { crearApp } = require('../src/app');

// Levanta la app con una base de datos en memoria y devuelve utilidades para probarla.
async function iniciarServidor() {
  const { app, cerrar } = crearApp();
  const servidor = await new Promise((ok) => { const s = app.listen(0, () => ok(s)); });
  const base = `http://localhost:${servidor.address().port}`;

  async function pedir(metodo, ruta, { token, cuerpo } = {}) {
    const res = await fetch(base + ruta, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    const texto = await res.text();
    return { status: res.status, datos: texto ? JSON.parse(texto) : null };
  }

  async function login(usuario, clave = `${usuario}123`) {
    const { datos } = await pedir('POST', '/api/auth/login', { cuerpo: { usuario, clave } });
    return datos.token;
  }

  return {
    base,
    pedir,
    login,
    detener: () => new Promise((ok) => { servidor.closeAllConnections(); servidor.close(() => { cerrar(); ok(); }); }),
  };
}

module.exports = { iniciarServidor };
