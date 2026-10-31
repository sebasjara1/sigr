const { noEncontrado, datosInvalidos, conflicto } = require('../../core/errores');
const { fechaLocal, esFecha, esHora } = require('../../core/fechas');

const CAPACIDAD_POR_FRANJA = 40; // personas que caben en una misma fecha y hora
const HORA_APERTURA = '11:00';
const HORA_CIERRE = '22:00';

function crearServicioReservas(db) {
  const reserva = (id) => {
    const r = db.prepare('SELECT * FROM reservas WHERE id = ?').get(id);
    if (!r) throw noEncontrado('Reserva');
    return r;
  };

  function disponibilidad(fecha, hora) {
    if (!esFecha(fecha) || !esHora(hora)) throw datosInvalidos('Fecha (AAAA-MM-DD) u hora (HH:MM) inválida');
    const { ocupados } = db
      .prepare("SELECT COALESCE(SUM(personas), 0) AS ocupados FROM reservas WHERE fecha = ? AND hora = ? AND estado = 'confirmada'")
      .get(fecha, hora);
    return { fecha, hora, capacidad: CAPACIDAD_POR_FRANJA, disponibles: CAPACIDAD_POR_FRANJA - ocupados };
  }

  function crearReserva({ nombre_cliente, telefono, personas, fecha, hora } = {}, usuario) {
    if (!nombre_cliente || !telefono) throw datosInvalidos('Nombre y teléfono son obligatorios');
    if (!Number.isInteger(personas) || personas <= 0) throw datosInvalidos('Número de personas inválido');
    const { disponibles } = disponibilidad(fecha, hora);
    if (fecha < fechaLocal()) throw datosInvalidos('No se puede reservar en una fecha pasada');
    if (hora < HORA_APERTURA || hora > HORA_CIERRE) {
      throw datosInvalidos(`El horario de reservas es de ${HORA_APERTURA} a ${HORA_CIERRE}`);
    }
    if (personas > disponibles) throw conflicto(`Solo quedan ${disponibles} cupos para esa fecha y hora`);

    const { lastInsertRowid } = db
      .prepare('INSERT INTO reservas (nombre_cliente, telefono, personas, fecha, hora, usuario_id) VALUES (?, ?, ?, ?, ?, ?)')
      .run(nombre_cliente, telefono, personas, fecha, hora, usuario?.id ?? null);
    return reserva(lastInsertRowid);
  }

  function cancelarReserva(id, usuario) {
    const r = reserva(id);
    if (usuario.rol === 'cliente' && r.usuario_id !== usuario.id) throw noEncontrado('Reserva');
    if (r.estado === 'cancelada') throw conflicto('La reserva ya estaba cancelada');
    db.prepare("UPDATE reservas SET estado = 'cancelada' WHERE id = ?").run(id);
    return reserva(id);
  }

  function listarReservas({ fecha, usuario } = {}) {
    let sql = 'SELECT * FROM reservas WHERE 1 = 1';
    const params = [];
    if (fecha) { sql += ' AND fecha = ?'; params.push(fecha); }
    if (usuario) { sql += ' AND usuario_id = ?'; params.push(usuario); }
    return db.prepare(`${sql} ORDER BY fecha, hora`).all(...params);
  }

  return { reserva, disponibilidad, crearReserva, cancelarReserva, listarReservas };
}

module.exports = { crearServicioReservas, CAPACIDAD_POR_FRANJA };
