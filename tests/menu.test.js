const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { iniciarServidor } = require('./helpers');

let s, admin;
before(async () => { s = await iniciarServidor(); admin = await s.login('admin'); });
after(() => s.detener());

test('el menú inicial es público', async () => {
  const { status, datos } = await s.pedir('GET', '/api/menu/platos');
  assert.equal(status, 200);
  assert.ok(datos.length > 0);
});

test('CRUD completo de un plato por el admin', async () => {
  const { datos: cat } = await s.pedir('POST', '/api/menu/categorias', { token: admin, cuerpo: { nombre: 'Sopas' } });
  const { status, datos: plato } = await s.pedir('POST', '/api/menu/platos', {
    token: admin, cuerpo: { nombre: 'Sancocho', precio: 25000, categoria_id: cat.id },
  });
  assert.equal(status, 201);

  const { datos: editado } = await s.pedir('PUT', `/api/menu/platos/${plato.id}`, { token: admin, cuerpo: { precio: 27000 } });
  assert.equal(editado.precio, 27000);

  assert.equal((await s.pedir('DELETE', `/api/menu/platos/${plato.id}`, { token: admin })).status, 204);
  assert.equal((await s.pedir('GET', `/api/menu/platos/${plato.id}`)).status, 404);
});

test('un mesero no puede modificar el menú', async () => {
  const mesero = await s.login('mesero');
  const { status } = await s.pedir('POST', '/api/menu/categorias', { token: mesero, cuerpo: { nombre: 'X' } });
  assert.equal(status, 403);
});

test('no se puede borrar una categoría con platos', async () => {
  const { datos: cats } = await s.pedir('GET', '/api/menu/categorias');
  const { status } = await s.pedir('DELETE', `/api/menu/categorias/${cats[0].id}`, { token: admin });
  assert.equal(status, 409);
});

test('el precio debe ser positivo', async () => {
  const { datos: cats } = await s.pedir('GET', '/api/menu/categorias');
  const { status } = await s.pedir('POST', '/api/menu/platos', {
    token: admin, cuerpo: { nombre: 'Gratis', precio: 0, categoria_id: cats[0].id },
  });
  assert.equal(status, 400);
});
