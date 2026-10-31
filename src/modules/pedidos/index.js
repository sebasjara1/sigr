const { crearServicioPedidos } = require('./pedidos.service');
const { crearRutasPedidos } = require('./pedidos.routes');

const esquema = `
CREATE TABLE IF NOT EXISTS pedidos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  mesa            INTEGER NOT NULL,
  usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),
  estado          TEXT NOT NULL CHECK (estado IN ('recibido', 'en_preparacion', 'listo', 'entregado', 'pagado', 'cancelado')),
  notas           TEXT NOT NULL DEFAULT '',
  total           INTEGER NOT NULL,
  creado_en       TEXT NOT NULL,
  actualizado_en  TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pedido_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id        INTEGER NOT NULL REFERENCES pedidos(id),
  plato_id         INTEGER NOT NULL REFERENCES platos(id),
  cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario  INTEGER NOT NULL
);`;

const rutas = (ctx) => crearRutasPedidos(crearServicioPedidos(ctx.db), ctx);

module.exports = { nombre: 'pedidos', titulo: 'Pedidos', pagina: 'pedidos.html', orden: 3, esquema, rutas };
