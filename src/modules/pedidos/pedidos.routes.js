const express = require('express');

function crearRutasPedidos(servicio, { requiereSesion, requiereRol }) {
  const r = express.Router();
  const personal = requiereRol('mesero', 'admin');

  // Seguimiento en tiempo real (Server-Sent Events).
  r.get('/en-vivo', personal, (req, res) => {
    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.flushHeaders();
    const enviar = (evento) => res.write(`data: ${JSON.stringify(evento)}\n\n`);
    servicio.eventos.on('cambio', enviar);
    req.on('close', () => servicio.eventos.off('cambio', enviar));
  });

  r.get('/', requiereSesion, (req, res) => {
    const esCliente = req.usuario.rol === 'cliente';
    res.json(servicio.listarPedidos({ estado: req.query.estado, usuario: esCliente ? req.usuario.id : undefined }));
  });

  r.get('/:id', personal, (req, res) => res.json(servicio.pedido(Number(req.params.id))));

  r.post('/', requiereSesion, (req, res) => res.status(201).json(servicio.crearPedido(req.body, req.usuario)));

  r.patch('/:id/estado', personal, (req, res) => {
    res.json(servicio.cambiarEstado(Number(req.params.id), req.body?.estado));
  });

  return r;
}

module.exports = { crearRutasPedidos };
