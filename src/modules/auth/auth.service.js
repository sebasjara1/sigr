const crypto = require('node:crypto');
const { ErrorHttp, datosInvalidos, conflicto } = require('../../core/errores');

const ROLES = ['cliente', 'mesero', 'admin'];

function cifrarClave(clave, sal = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(clave, sal, 64).toString('hex');
  return { hash, sal };
}

function claveCorrecta(clave, { hash, sal }) {
  const calculado = Buffer.from(cifrarClave(clave, sal).hash, 'hex');
  return crypto.timingSafeEqual(calculado, Buffer.from(hash, 'hex'));
}

function crearServicioAuth(db) {
  const sesiones = new Map(); // token -> usuario

  const publico = ({ id, usuario, nombre, rol }) => ({ id, usuario, nombre, rol });

  function crearUsuario({ usuario, nombre, clave, rol = 'cliente' }) {
    if (!usuario || !nombre || !clave) throw datosInvalidos('usuario, nombre y clave son obligatorios');
    if (clave.length < 6) throw datosInvalidos('La clave debe tener al menos 6 caracteres');
    if (!ROLES.includes(rol)) throw datosInvalidos(`Rol inválido. Use: ${ROLES.join(', ')}`);
    if (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(usuario)) {
      throw conflicto('El usuario ya existe');
    }
    const { hash, sal } = cifrarClave(clave);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO usuarios (usuario, nombre, rol, clave_hash, clave_sal) VALUES (?, ?, ?, ?, ?)')
      .run(usuario, nombre, rol, hash, sal);
    return publico(db.prepare('SELECT * FROM usuarios WHERE id = ?').get(lastInsertRowid));
  }

  function iniciarSesion(usuario, clave) {
    const u = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario || '');
    if (!u || !claveCorrecta(clave || '', { hash: u.clave_hash, sal: u.clave_sal })) {
      throw new ErrorHttp(401, 'Usuario o clave incorrectos');
    }
    const token = crypto.randomBytes(24).toString('hex');
    sesiones.set(token, publico(u));
    return { token, usuario: publico(u) };
  }

  return {
    crearUsuario,
    iniciarSesion,
    cerrarSesion: (token) => sesiones.delete(token),
    usuarioDeToken: (token) => sesiones.get(token),
  };
}

module.exports = { crearServicioAuth, ROLES };
