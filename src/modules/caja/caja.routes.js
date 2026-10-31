const express = require('express');

function crearRutasCaja(servicio, { requiereRol }) {
  const r = express.Router();
  const soloAdmin = requiereRol('admin');

  r.get('/reporte', soloAdmin, (req, res) => res.json(servicio.reporteDelDia(req.query.fecha)));
  r.post('/cierre', soloAdmin, (req, res) => res.status(201).json(servicio.cerrarCaja(req.body?.fecha, req.usuario)));
  r.get('/cierres', soloAdmin, (req, res) => res.json(servicio.listarCierres()));

  return r;
}

module.exports = { crearRutasCaja };
