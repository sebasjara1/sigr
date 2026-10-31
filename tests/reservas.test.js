const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { iniciarServidor } = require('./helpers');
const { fechaLocal } = require('../src/core/fechas');

const manana = fechaLocal(new Date(Date.now() + 24 * 60 * 60 * 1000));
const reserva = (cambios = {}) => ({ nombre_cliente: 'Laura', telefono: '3001234567', personas: 4, fecha: manana, hora: '19:00', ...cambios });

let s, cliente;
before(async () => { s = await iniciarServidor(); cliente = await s.login('cliente'); });
after(() => s.detener());

test('un cliente reserva y baja la disponibilidad', async () => {
  const { status } = await s.pedir('POST', '/api/reservas', { token: cliente, cuerpo: reserva() });
  assert.equal(status, 201);
  const { datos } = await s.pedir('GET', `/api/reservas/disponibilidad?fecha=${manana}&hora=19:00`);
  assert.equal(datos.disponibles, datos.capacidad - 4);
});

test('no se puede superar la capacidad de la franja', async () => {
  const { status } = await s.pedir('POST', '/api/reservas', { token: cliente, cuerpo: reserva({ hora: '20:00', personas: 41 }) });
  assert.equal(status, 409);
});

test('no se aceptan fechas pasadas ni fuera de horario', async () => {
  assert.equal((await s.pedir('POST', '/api/reservas', { token: cliente, cuerpo: reserva({ fecha: '2020-01-01' }) })).status, 400);
  assert.equal((await s.pedir('POST', '/api/reservas', { token: cliente, cuerpo: reserva({ hora: '23:30' }) })).status, 400);
});

test('al cancelar se libera el cupo', async () => {
  const { datos: r } = await s.pedir('POST', '/api/reservas', { token: cliente, cuerpo: reserva({ hora: '13:00', personas: 10 }) });
  await s.pedir('PATCH', `/api/reservas/${r.id}/cancelar`, { token: cliente });
  const { datos } = await s.pedir('GET', `/api/reservas/disponibilidad?fecha=${manana}&hora=13:00`);
  assert.equal(datos.disponibles, datos.capacidad);
});

test('un cliente solo ve sus propias reservas', async () => {
  const mesero = await s.login('mesero');
  await s.pedir('POST', '/api/reservas', { token: mesero, cuerpo: reserva({ hora: '12:00', nombre_cliente: 'Otro' }) });
  const { datos } = await s.pedir('GET', '/api/reservas', { token: cliente });
  assert.ok(datos.every((r) => r.nombre_cliente === 'Laura'));
});
