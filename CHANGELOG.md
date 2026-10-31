# Historial de cambios

Aquí se registran los cambios importantes de cada versión del SIGR.
Las versiones siguen el esquema descrito en [docs/convenciones.md](docs/convenciones.md).

## [Sin publicar]

Cambios hechos después de la línea base que aún no forman parte de una versión.

## [1.0.0] – 2026-11-01 · Línea base

Primera versión estable del sistema.

### Agregado

- **Estructura base:** servidor web, base de datos SQLite y carga automática de módulos.
- **Usuarios:** inicio de sesión con roles de cliente, mesero y administrador; registro abierto solo para clientes.
- **Menú digital:** creación, edición y eliminación de platos y categorías; marcar platos como agotados.
- **Pedidos:** registro por mesa con cálculo automático del total; estados del pedido en orden (recibido → en preparación → listo → entregado → pagado); seguimiento en tiempo real.
- **Reservas:** reservas por fecha y hora con control de cupos (40 personas por franja), horario de 11:00 a 22:00 y cancelación.
- **Caja y reportes:** reporte diario de ventas, platos más vendidos, ticket promedio y cierre de caja (uno por día).
- **Pruebas automáticas:** 26 pruebas que cubren los cinco módulos.
- **Documentación:** README, licencia MIT, estructura de la base de datos, manual de despliegue y convenciones.

### Limitaciones conocidas

- El formulario de pedidos permite un solo plato por pedido.
- Las sesiones se pierden al reiniciar el servidor.
- Los usuarios de prueba tienen claves por defecto.
