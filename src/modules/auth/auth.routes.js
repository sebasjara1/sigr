const express = require('express');
const { ErrorHttp } = require('../../core/errores');

function extraerToken(req) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo === 'Bearer' && token) return token;
  return req.query.token; // EventSource no permite cabeceras
}

function crearMiddlewares(servicio) {
  function requiereSesion(req, res, next) {
    const usuario = servicio.usuarioDeToken(extraerToken(req));
    if (!usuario) return next(new ErrorHttp(401, 'Debe iniciar sesión'));
    req.usuario = usuario;
    next();
  }

  const requiereRol = (...roles) => [requiereSesion, (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) return next(new ErrorHttp(403, 'No tiene permiso para esta acción'));
    next();
  }];

  return { requiereSesion, requiereRol };
}

function crearRutasAuth(servicio, { requiereSesion, requiereRol }) {
  const r = express.Router();

  r.post('/login', (req, res) => {
    res.json(servicio.iniciarSesion(req.body?.usuario, req.body?.clave));
  });

  r.post('/logout', requiereSesion, (req, res) => {
    servicio.cerrarSesion(extraerToken(req));
    res.status(204).end();
  });

  r.get('/yo', requiereSesion, (req, res) => res.json(req.usuario));

  // Registro abierto solo para clientes; el admin puede crear cualquier rol.
  r.post('/registro', (req, res) => {
    res.status(201).json(servicio.crearUsuario({ ...req.body, rol: 'cliente' }));
  });

  r.post('/usuarios', requiereRol('admin'), (req, res) => {
    res.status(201).json(servicio.crearUsuario(req.body || {}));
  });

  return r;
}

module.exports = { crearMiddlewares, crearRutasAuth };
