const { crearServicioMenu } = require('./menu.service');
const { crearRutasMenu } = require('./menu.routes');

const esquema = `
CREATE TABLE IF NOT EXISTS categorias (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre  TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS platos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id  INTEGER NOT NULL REFERENCES categorias(id),
  nombre        TEXT NOT NULL,
  descripcion   TEXT NOT NULL DEFAULT '',
  precio        INTEGER NOT NULL CHECK (precio > 0),
  disponible    INTEGER NOT NULL DEFAULT 1
);`;

const MENU_INICIAL = {
  Entradas: [['Empanadas (3 und)', 9000], ['Patacones con hogao', 12000]],
  'Platos fuertes': [['Bandeja paisa', 32000], ['Ajiaco santafereño', 28000], ['Trucha al ajillo', 35000]],
  Bebidas: [['Limonada de coco', 9000], ['Jugo natural', 7000]],
  Postres: [['Postre de natas', 10000]],
};

function datosIniciales(db) {
  if (db.prepare('SELECT COUNT(*) AS n FROM categorias').get().n > 0) return;
  const servicio = crearServicioMenu(db);
  for (const [categoria, platos] of Object.entries(MENU_INICIAL)) {
    const { id } = servicio.crearCategoria({ nombre: categoria });
    platos.forEach(([nombre, precio]) => servicio.crearPlato({ nombre, precio, categoria_id: id }));
  }
}

const rutas = (ctx) => crearRutasMenu(crearServicioMenu(ctx.db), ctx);

module.exports = { nombre: 'menu', titulo: 'Menú digital', pagina: 'menu.html', orden: 2, esquema, datosIniciales, rutas };
