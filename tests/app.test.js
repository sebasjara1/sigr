const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { iniciarServidor } = require('./helpers');

let s;
before(async () => { s = await iniciarServidor(); });
after(() => s.detener());

test('la aplicación responde en /api/salud', async () => {
  const { status, datos } = await s.pedir('GET', '/api/salud');
  assert.equal(status, 200);
  assert.equal(datos.estado, 'ok');
});

test('/api/modulos lista los módulos cargados', async () => {
  const { datos } = await s.pedir('GET', '/api/modulos');
  assert.ok(Array.isArray(datos));
});
