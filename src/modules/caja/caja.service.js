const { datosInvalidos, conflicto } = require('../../core/errores');
const { fechaLocal, ahora, esFecha } = require('../../core/fechas');

function crearServicioCaja(db) {
  function reporteDelDia(fecha = fechaLocal()) {
    if (!esFecha(fecha)) throw datosInvalidos('Fecha inválida (AAAA-MM-DD)');
    const resumen = db.prepare(`
      SELECT COUNT(*) AS pedidos_pagados, COALESCE(SUM(total), 0) AS total_ventas
      FROM pedidos WHERE estado = 'pagado' AND date(creado_en) = ?`).get(fecha);
    const { cancelados } = db.prepare(`
      SELECT COUNT(*) AS cancelados FROM pedidos WHERE estado = 'cancelado' AND date(creado_en) = ?`).get(fecha);
    const platosMasVendidos = db.prepare(`
      SELECT pl.nombre, SUM(i.cantidad) AS unidades, SUM(i.cantidad * i.precio_unitario) AS total
      FROM pedido_items i
      JOIN pedidos p ON p.id = i.pedido_id
      JOIN platos pl ON pl.id = i.plato_id
      WHERE p.estado = 'pagado' AND date(p.creado_en) = ?
      GROUP BY pl.id ORDER BY unidades DESC LIMIT 5`).all(fecha);
    const { pendientes } = db.prepare(`
      SELECT COUNT(*) AS pendientes FROM pedidos
      WHERE estado NOT IN ('pagado', 'cancelado') AND date(creado_en) = ?`).get(fecha);

    return {
      fecha,
      ...resumen,
      pedidos_cancelados: cancelados,
      pedidos_pendientes: pendientes,
      ticket_promedio: resumen.pedidos_pagados ? Math.round(resumen.total_ventas / resumen.pedidos_pagados) : 0,
      platos_mas_vendidos: platosMasVendidos,
      cierre: db.prepare('SELECT * FROM cierres_caja WHERE fecha = ?').get(fecha) || null,
    };
  }

  function cerrarCaja(fecha = fechaLocal(), usuario) {
    const reporte = reporteDelDia(fecha);
    if (reporte.cierre) throw conflicto(`La caja del ${fecha} ya fue cerrada`);
    if (reporte.pedidos_pendientes > 0) {
      throw conflicto(`Hay ${reporte.pedidos_pendientes} pedidos sin pagar o cancelar`);
    }
    db.prepare('INSERT INTO cierres_caja (fecha, total_ventas, pedidos_pagados, cerrado_por, cerrado_en) VALUES (?, ?, ?, ?, ?)')
      .run(fecha, reporte.total_ventas, reporte.pedidos_pagados, usuario.id, ahora());
    return reporteDelDia(fecha);
  }

  const listarCierres = () => db.prepare('SELECT * FROM cierres_caja ORDER BY fecha DESC').all();

  return { reporteDelDia, cerrarCaja, listarCierres };
}

module.exports = { crearServicioCaja };
