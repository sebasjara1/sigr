const express = require('express');

function crearRutasMenu(servicio, { requiereRol }) {
  const r = express.Router();
  const soloAdmin = requiereRol('admin');
  const id = (req) => Number(req.params.id);

  r.get('/categorias', (req, res) => res.json(servicio.listarCategorias()));
  r.post('/categorias', soloAdmin, (req, res) => res.status(201).json(servicio.crearCategoria(req.body)));
  r.put('/categorias/:id', soloAdmin, (req, res) => res.json(servicio.actualizarCategoria(id(req), req.body)));
  r.delete('/categorias/:id', soloAdmin, (req, res) => {
    servicio.eliminarCategoria(id(req));
    res.status(204).end();
  });

  r.get('/platos', (req, res) => res.json(servicio.listarPlatos({
    categoria_id: req.query.categoria ? Number(req.query.categoria) : undefined,
    soloDisponibles: req.query.disponibles === '1',
  })));
  r.get('/platos/:id', (req, res) => res.json(servicio.plato(id(req))));
  r.post('/platos', soloAdmin, (req, res) => res.status(201).json(servicio.crearPlato(req.body)));
  r.put('/platos/:id', soloAdmin, (req, res) => res.json(servicio.actualizarPlato(id(req), req.body)));
  r.delete('/platos/:id', soloAdmin, (req, res) => {
    servicio.eliminarPlato(id(req));
    res.status(204).end();
  });

  return r;
}

module.exports = { crearRutasMenu };
