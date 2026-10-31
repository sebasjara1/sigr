class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

const noEncontrado = (que) => new ErrorHttp(404, `${que} no encontrado`);
const datosInvalidos = (mensaje) => new ErrorHttp(400, mensaje);
const conflicto = (mensaje) => new ErrorHttp(409, mensaje);

function manejadorDeErrores(err, req, res, next) {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Error interno' : err.message });
}

module.exports = { ErrorHttp, noEncontrado, datosInvalidos, conflicto, manejadorDeErrores };
