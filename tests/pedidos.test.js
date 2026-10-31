const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { iniciarServidor } = require('./helpers');

let s, mesero, platos;
before(async () => {
  s = await iniciarServidor();
  mesero = await s.login('mesero');
  platos = (await s.pedir('GET', '/api/menu/platos')).datos;
});
after(() => s.detener());

const nuevoPedido = () => s.pedir('POST', '/api/pedidos', {
  token: mesero, cuerpo: { mesa: 4, items: [{ plato_id: platos[0].id, cantidad: 2 }, { plato_id: platos[1].id }] },
});

test('un mesero registra un pedido y se calcula el total', async () => {
  const { status, datos } = await nuevoPedido();
  assert.equal(status, 201);
  assert.equal(datos.estado, 'recibido');
  assert.equal(datos.total, platos[0].precio * 2 + platos[1].precio);
});

test('el pedido avanza por sus estados en orden', async () => {
  const { datos: p } = await nuevoPedido();
  for (const estado of ['en_preparacion', 'listo', 'entregado', 'pagado']) {
    const { status, datos } = await s.pedir('PATCH', `/api/pedidos/${p.id}/estado`, { token: mesero, cuerpo: { estado } });
    assert.equal(status, 200);
    assert.equal(datos.estado, estado);
  }
});

test('no se puede saltar estados', async () => {
  const { datos: p } = await nuevoPedido();
  const { status } = await s.pedir('PATCH', `/api/pedidos/${p.id}/estado`, { token: mesero, cuerpo: { estado: 'pagado' } });
  assert.equal(status, 409);
});

test('un pedido sin platos es rechazado', async () => {
  const { status } = await s.pedir('POST', '/api/pedidos', { token: mesero, cuerpo: { mesa: 1, items: [] } });
  assert.equal(status, 400);
});

test('el seguimiento en vivo notifica los pedidos nuevos', async () => {
  const control = new AbortController();
  const res = await fetch(`${s.base}/api/pedidos/en-vivo?token=${mesero}`, { signal: control.signal });
  const lector = res.body.getReader();
  await nuevoPedido();
  const { value } = await lector.read();
  control.abort();
  const evento = JSON.parse(new TextDecoder().decode(value).replace(/^data: /, ''));
  assert.equal(evento.tipo, 'creado');
});
