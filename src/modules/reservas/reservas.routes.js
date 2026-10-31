const express = require('express');

function crearRutasReservas(servicio, { requiereSesion }) {
  const r = express.Router();

  r.get('/disponibilidad', (req, res) => res.json(servicio.disponibilidad(req.query.fecha, req.query.hora)));

  r.get('/', requiereSesion, (req, res) => {
    const esCliente = req.usuario.rol === 'cliente';
    res.json(servicio.listarReservas({ fecha: req.query.fecha, usuario: esCliente ? req.usuario.id : undefined }));
  });

  r.post('/', requiereSesion, (req, res) => res.status(201).json(servicio.crearReserva(req.body, req.usuario)));

  r.patch('/:id/cancelar', requiereSesion, (req, res) => {
    res.json(servicio.cancelarReserva(Number(req.params.id), req.usuario));
  });

  return r;
}

module.exports = { crearRutasReservas };
