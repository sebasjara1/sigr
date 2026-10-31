const { crearServicioReservas } = require('./reservas.service');
const { crearRutasReservas } = require('./reservas.routes');

const esquema = `
CREATE TABLE IF NOT EXISTS reservas (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_cliente  TEXT NOT NULL,
  telefono        TEXT NOT NULL,
  personas        INTEGER NOT NULL CHECK (personas > 0),
  fecha           TEXT NOT NULL,
  hora            TEXT NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'cancelada')),
  usuario_id      INTEGER REFERENCES usuarios(id),
  creado_en       TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);`;

const rutas = (ctx) => crearRutasReservas(crearServicioReservas(ctx.db), ctx);

module.exports = { nombre: 'reservas', titulo: 'Reservas', pagina: 'reservas.html', orden: 4, esquema, rutas };
