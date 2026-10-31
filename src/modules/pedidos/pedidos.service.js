const { EventEmitter } = require('node:events');
const { noEncontrado, datosInvalidos, conflicto } = require('../../core/errores');
const { ahora } = require('../../core/fechas');

const ESTADOS = ['recibido', 'en_preparacion', 'listo', 'entregado', 'pagado', 'cancelado'];

// Desde cada estado solo se puede pasar a los indicados.
const TRANSICIONES = {
  recibido: ['en_preparacion', 'cancelado'],
  en_preparacion: ['listo', 'cancelado'],
  listo: ['entregado'],
  entregado: ['pagado'],
  pagado: [],
  cancelado: [],
};

function crearServicioPedidos(db) {
  const eventos = new EventEmitter();

  function pedido(id) {
    const p = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);
    if (!p) throw noEncontrado('Pedido');
    const items = db.prepare(`
      SELECT i.plato_id, pl.nombre, i.cantidad, i.precio_unitario
      FROM pedido_items i JOIN platos pl ON pl.id = i.plato_id
      WHERE i.pedido_id = ?`).all(id);
    return { ...p, items };
  }

  function crearPedido({ mesa, items, notas = '' } = {}, usuario) {
    if (!Number.isInteger(mesa) || mesa <= 0) throw datosInvalidos('La mesa debe ser un número positivo');
    if (!Array.isArray(items) || items.length === 0) throw datosInvalidos('El pedido debe tener al menos un plato');

    const lineas = items.map(({ plato_id, cantidad = 1 }) => {
      const plato = db.prepare('SELECT * FROM platos WHERE id = ?').get(plato_id);
      if (!plato) throw datosInvalidos(`El plato ${plato_id} no existe`);
      if (!plato.disponible) throw datosInvalidos(`${plato.nombre} no está disponible`);
      if (!Number.isInteger(cantidad) || cantidad <= 0) throw datosInvalidos('Cantidad inválida');
      return { plato_id, cantidad, precio_unitario: plato.precio };
    });
    const total = lineas.reduce((s, l) => s + l.cantidad * l.precio_unitario, 0);

    db.exec('BEGIN');
    try {
      const { lastInsertRowid: id } = db
        .prepare('INSERT INTO pedidos (mesa, usuario_id, estado, notas, total, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(mesa, usuario.id, 'recibido', notas, total, ahora(), ahora());
      const insertar = db.prepare('INSERT INTO pedido_items (pedido_id, plato_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)');
      lineas.forEach((l) => insertar.run(id, l.plato_id, l.cantidad, l.precio_unitario));
      db.exec('COMMIT');
      const nuevo = pedido(id);
      eventos.emit('cambio', { tipo: 'creado', pedido: nuevo });
      return nuevo;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  function cambiarEstado(id, estado) {
    const actual = pedido(id);
    if (!ESTADOS.includes(estado)) throw datosInvalidos(`Estado inválido. Use: ${ESTADOS.join(', ')}`);
    if (!TRANSICIONES[actual.estado].includes(estado)) {
      throw conflicto(`No se puede pasar de "${actual.estado}" a "${estado}"`);
    }
    db.prepare('UPDATE pedidos SET estado = ?, actualizado_en = ? WHERE id = ?').run(estado, ahora(), id);
    const actualizado = pedido(id);
    eventos.emit('cambio', { tipo: 'estado', pedido: actualizado });
    return actualizado;
  }

  function listarPedidos({ estado, usuario } = {}) {
    let sql = 'SELECT id FROM pedidos WHERE 1 = 1';
    const params = [];
    if (estado) { sql += ' AND estado = ?'; params.push(estado); }
    if (usuario) { sql += ' AND usuario_id = ?'; params.push(usuario); }
    return db.prepare(`${sql} ORDER BY id DESC`).all(...params).map(({ id }) => pedido(id));
  }

  return { pedido, crearPedido, cambiarEstado, listarPedidos, eventos };
}

module.exports = { crearServicioPedidos, ESTADOS, TRANSICIONES };
