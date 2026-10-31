# Convenciones del proyecto

Acuerdos para que el código y el historial se mantengan ordenados.

## Estructura de carpetas

- Cada módulo vive en `src/modules/<nombre>/` y tiene tres archivos:
  - `index.js`: tablas que necesita y registro del módulo
  - `<nombre>.service.js`: reglas del negocio
  - `<nombre>.routes.js`: rutas de la API
- Cada módulo tiene su página en `public/` y su prueba en `tests/`.
- Agregar un módulo nuevo no requiere tocar los existentes.

## Código

- Nombres en español, en `camelCase` para variables y funciones: `crearPedido`, `totalVentas`.
- Tablas y campos de la base de datos en `minúsculas_con_guion_bajo`: `pedido_items`, `creado_en`.
- Precios en pesos, como números enteros.
- Toda regla nueva va acompañada de su prueba.

## Mensajes de commit

Formato: `tipo(módulo): descripción corta en minúscula`

| Tipo | Cuándo |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de un error |
| `docs` | Solo documentación |
| `chore` | Configuración o mantenimiento |
| `test` | Solo pruebas |

Ejemplo: `fix(pedidos): permitir varios platos en el formulario`

## Ramas y versiones

- `main` siempre contiene una versión estable.
- Los cambios se hacen en una rama aparte (`mejora/…`, `correccion/…`) y se integran a `main` cuando las pruebas pasan.
- Cada versión estable se marca con un tag: `v1.0.0`, `v1.1.0`…
  - Último número: correcciones (`v1.0.1`)
  - Número del medio: funciones nuevas (`v1.1.0`)
  - Primer número: cambios grandes que rompen lo anterior (`v2.0.0`)
