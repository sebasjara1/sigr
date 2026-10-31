const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { iniciarServidor } = require('./helpers');

let s;
before(async () => { s = await iniciarServidor(); });
after(() => s.detener());

test('los tres roles iniciales pueden iniciar sesión', async () => {
  for (const rol of ['admin', 'mesero', 'cliente']) {
    const { status, datos } = await s.pedir('POST', '/api/auth/login', { cuerpo: { usuario: rol, clave: `${rol}123` } });
    assert.equal(status, 200);
    assert.equal(datos.usuario.rol, rol);
  }
});

test('una clave incorrecta es rechazada', async () => {
  const { status } = await s.pedir('POST', '/api/auth/login', { cuerpo: { usuario: 'admin', clave: 'otra' } });
  assert.equal(status, 401);
});

test('el registro público siempre crea clientes', async () => {
  const { status, datos } = await s.pedir('POST', '/api/auth/registro', {
    cuerpo: { usuario: 'ana', nombre: 'Ana', clave: 'secreta1', rol: 'admin' },
  });
  assert.equal(status, 201);
  assert.equal(datos.rol, 'cliente');
});

test('solo el admin puede crear usuarios con otros roles', async () => {
  const cuerpo = { usuario: 'pedro', nombre: 'Pedro', clave: 'secreta1', rol: 'mesero' };
  const mesero = await s.login('mesero');
  assert.equal((await s.pedir('POST', '/api/auth/usuarios', { token: mesero, cuerpo })).status, 403);
  const admin = await s.login('admin');
  assert.equal((await s.pedir('POST', '/api/auth/usuarios', { token: admin, cuerpo })).status, 201);
});

test('/yo exige sesión', async () => {
  assert.equal((await s.pedir('GET', '/api/auth/yo')).status, 401);
});
