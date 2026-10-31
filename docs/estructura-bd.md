# Estructura de la base de datos

El SIGR usa **SQLite**: toda la información vive en un solo archivo (`data/sigr.db`), que se crea automáticamente la primera vez que se ejecuta la aplicación.

Cada módulo crea sus propias tablas al arrancar.

## Relación entre tablas

```
usuarios ──┬──< pedidos >──── pedido_items >──── platos >──── categorias
           ├──< reservas
           └──< cierres_caja
```

`──<` se lee "uno a muchos". Por ejemplo, un usuario puede registrar muchos pedidos.

## Tablas

### usuarios (módulo auth)
| Campo | Tipo | Descripción |
|---|---|---|
| id | entero | Identificador |
| usuario | texto, único | Nombre para iniciar sesión |
| nombre | texto | Nombre visible |
| rol | texto | `cliente`, `mesero` o `admin` |
| clave_hash, clave_sal | texto | Clave cifrada (nunca se guarda la clave real) |
| creado_en | fecha | Fecha de registro |

### categorias (módulo menu)
| Campo | Tipo | Descripción |
|---|---|---|
| id | entero | Identificador |
| nombre | texto, único | Ej.: Entradas, Bebidas |

### platos (módulo menu)
| Campo | Tipo | Descripción |
|---|---|---|
| id | entero | Identificador |
| categoria_id | entero | Categoría a la que pertenece |
| nombre, descripcion | texto | Datos del plato |
| precio | entero | En pesos colombianos |
| disponible | 0 / 1 | Si se puede pedir hoy |

### pedidos (módulo pedidos)
| Campo | Tipo | Descripción |
|---|---|---|
| id | entero | Número del pedido |
| mesa | entero | Mesa que lo pidió |
| usuario_id | entero | Quién lo registró |
| estado | texto | `recibido` → `en_preparacion` → `listo` → `entregado` → `pagado` (o `cancelado`) |
| notas | texto | Indicaciones especiales |
| total | entero | Valor total |
| creado_en, actualizado_en | fecha | Control de tiempos |

### pedido_items (módulo pedidos)
| Campo | Tipo | Descripción |
|---|---|---|
| pedido_id | entero | Pedido al que pertenece |
| plato_id | entero | Plato pedido |
| cantidad | entero | Unidades |
| precio_unitario | entero | Precio al momento del pedido (no cambia si luego sube el menú) |

### reservas (módulo reservas)
| Campo | Tipo | Descripción |
|---|---|---|
| id | entero | Identificador |
| nombre_cliente, telefono | texto | Datos de contacto |
| personas | entero | Número de personas |
| fecha, hora | texto | `AAAA-MM-DD` y `HH:MM` |
| estado | texto | `confirmada` o `cancelada` |
| usuario_id | entero | Quién hizo la reserva |

### cierres_caja (módulo caja)
| Campo | Tipo | Descripción |
|---|---|---|
| fecha | texto, único | Día cerrado (solo un cierre por día) |
| total_ventas | entero | Suma de pedidos pagados |
| pedidos_pagados | entero | Cantidad de pedidos pagados |
| cerrado_por | entero | Usuario que cerró |
| cerrado_en | fecha | Momento del cierre |
