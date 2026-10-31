const { crearServicioAuth } = require('./auth.service');
const { crearMiddlewares, crearRutasAuth } = require('./auth.routes');

const esquema = `
CREATE TABLE IF NOT EXISTS usuarios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario     TEXT NOT NULL UNIQUE,
  nombre      TEXT NOT NULL,
  rol         TEXT NOT NULL CHECK (rol IN ('cliente', 'mesero', 'admin')),
  clave_hash  TEXT NOT NULL,
  clave_sal   TEXT NOT NULL,
  creado_en   TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);`;

const USUARIOS_INICIALES = [
  { usuario: 'admin', nombre: 'Administrador', clave: 'admin123', rol: 'admin' },
  { usuario: 'mesero', nombre: 'Mesero de turno', clave: 'mesero123', rol: 'mesero' },
  { usuario: 'cliente', nombre: 'Cliente de prueba', clave: 'cliente123', rol: 'cliente' },
];

function datosIniciales(db) {
  if (db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n > 0) return;
  const servicio = crearServicioAuth(db);
  USUARIOS_INICIALES.forEach((u) => servicio.crearUsuario(u));
}

function rutas(ctx) {
  const servicio = crearServicioAuth(ctx.db);
  const middlewares = crearMiddlewares(servicio);
  // Los demás módulos usan estos middlewares para proteger sus rutas.
  Object.assign(ctx, middlewares);
  return crearRutasAuth(servicio, middlewares);
}

module.exports = { nombre: 'auth', titulo: 'Usuarios', pagina: null, orden: 1, esquema, datosIniciales, rutas };
