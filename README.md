# SIGR - Sistema Integral de Gestión de Restaurante

Aplicación web para el día a día de un restaurante: toma de pedidos, reservas, menú digital y cierre de caja.

**Versión actual:** 1.0.0 (línea base)

## Módulos

| Módulo          | Qué hace                                                     | Quién lo usa            |
| --------------- | ------------------------------------------------------------ | ----------------------- |
| Usuarios        | Inicio de sesión con tres roles                              | Todos                   |
| Menú digital    | Crear, editar y retirar platos y categorías                  | Administrador           |
| Pedidos         | Registrar pedidos por mesa y seguir su estado en tiempo real | Meseros y administrador |
| Reservas        | Reservar por fecha y hora, con control de cupos              | Clientes y meseros      |
| Caja y reportes | Ventas del día, platos más vendidos y cierre de caja         | Administrador           |

## Requisitos

- [Node.js](https://nodejs.org) 22.13 o superior
- Git

## Cómo ejecutarlo

```bash
git clone https://github.com/sebasjara1/sigr.git
cd sigr
npm install
npm start
```

Abrir http://localhost:3000 en el navegador.

### Usuarios de prueba

| Usuario | Clave      | Rol           |
| ------- | ---------- | ------------- |
| admin   | admin123   | Administrador |
| mesero  | mesero123  | Mesero        |
| cliente | cliente123 | Cliente       |

> Estas claves son solo para pruebas. Deben cambiarse antes de usar el sistema en un restaurante real.

## Pruebas

```bash
npm test
```

## Estructura del proyecto

```
src/
  app.js, server.js, db.js   núcleo de la aplicación
  core/                      utilidades compartidas
  modules/                   un módulo por carpeta
public/                      páginas web
tests/                       pruebas automáticas
docs/                        documentación técnica
```

## Documentación

- [Estructura de la base de datos](docs/estructura-bd.md)
- [Manual de despliegue](docs/manual-despliegue.md)
- [Convenciones del proyecto](docs/convenciones.md)
- [Historial de cambios](CHANGELOG.md)

## Licencia

MIT. Ver [LICENSE.txt](LICENSE.txt).
