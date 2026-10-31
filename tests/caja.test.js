const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { iniciarServidor } = require('./helpers');

let s, admin, platos;
before(async () => {
  s = await iniciarServidor();
  admin = await s.login('admin');
  platos = (await s.pedir('GET', '/api/menu/platos')).datos;
});
after(() => s.detener());

async function pedidoConEstados(estados) {
  const { datos: p } = await s.pedir('POST', '/api/pedidos', {
    token: admin, cuerpo: { mesa: 2, items: [{ plato_id: platos[0].id, cantidad: 1 }] },
  });
  for (const estado of estados) {
    await s.pedir('PATCH', `/api/pedidos/${p.id}/estado`, { token: admin, cuerpo: { estado } });
  }
  return p;
}

test('el reporte diario suma solo los pedidos pagados', async () => {
  await pedidoConEstados(['en_preparacion', 'listo', 'entregado', 'pagado']);
  await pedidoConEstados(['cancelado']);
  const { datos } = await s.pedir('GET', '/api/caja/reporte', { token: admin });
  assert.equal(datos.pedidos_pagados, 1);
  assert.equal(datos.total_ventas, platos[0].precio);
  assert.equal(datos.pedidos_cancelados, 1);
});

test('no se cierra la caja con pedidos pendientes', async () => {
  const p = await pedidoConEstados([]);
  assert.equal((await s.pedir('POST', '/api/caja/cierre', { token: admin, cuerpo: {} })).status, 409);
  await s.pedir('PATCH', `/api/pedidos/${p.id}/estado`, { token: admin, cuerpo: { estado: 'cancelado' } });
});

test('la caja se cierra una sola vez por día', async () => {
  assert.equal((await s.pedir('POST', '/api/caja/cierre', { token: admin, cuerpo: {} })).status, 201);
  assert.equal((await s.pedir('POST', '/api/caja/cierre', { token: admin, cuerpo: {} })).status, 409);
});

test('solo el admin ve los reportes', async () => {
  const mesero = await s.login('mesero');
  assert.equal((await s.pedir('GET', '/api/caja/reporte', { token: mesero })).status, 403);
});
