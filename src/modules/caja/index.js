const { crearServicioCaja } = require('./caja.service');
const { crearRutasCaja } = require('./caja.routes');

const esquema = `
CREATE TABLE IF NOT EXISTS cierres_caja (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha            TEXT NOT NULL UNIQUE,
  total_ventas     INTEGER NOT NULL,
  pedidos_pagados  INTEGER NOT NULL,
  cerrado_por      INTEGER NOT NULL REFERENCES usuarios(id),
  cerrado_en       TEXT NOT NULL
);`;

const rutas = (ctx) => crearRutasCaja(crearServicioCaja(ctx.db), ctx);

module.exports = { nombre: 'caja', titulo: 'Caja y reportes', pagina: 'caja.html', orden: 5, esquema, rutas };
