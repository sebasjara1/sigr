const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { abrirBaseDeDatos } = require('./db');
const { manejadorDeErrores } = require('./core/errores');
const { version } = require('../package.json');

const CARPETA_MODULOS = path.join(__dirname, 'modules');

// Cada módulo vive en src/modules/<nombre>/index.js y se registra solo al existir.
function cargarModulos() {
  if (!fs.existsSync(CARPETA_MODULOS)) return [];
  return fs.readdirSync(CARPETA_MODULOS)
    .filter((nombre) => fs.existsSync(path.join(CARPETA_MODULOS, nombre, 'index.js')))
    .map((nombre) => require(path.join(CARPETA_MODULOS, nombre)))
    .sort((a, b) => a.orden - b.orden);
}

function crearApp({ rutaDb = ':memory:' } = {}) {
  const db = abrirBaseDeDatos(rutaDb);
  const modulos = cargarModulos();
  const ctx = { db };

  for (const m of modulos) {
    db.exec(m.esquema);
    if (m.datosIniciales) m.datosIniciales(db);
  }

  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/api/salud', (req, res) => res.json({ estado: 'ok', version }));
  app.get('/api/modulos', (req, res) =>
    res.json(modulos.map(({ nombre, titulo, pagina }) => ({ nombre, titulo, pagina }))));

  for (const m of modulos) {
    app.use(`/api/${m.nombre}`, m.rutas(ctx));
  }

  app.use(manejadorDeErrores);
  return { app, db, cerrar: () => db.close() };
}

module.exports = { crearApp };
