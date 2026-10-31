const { noEncontrado, datosInvalidos, conflicto } = require('../../core/errores');

function crearServicioMenu(db) {
  const categoria = (id) => {
    const c = db.prepare('SELECT * FROM categorias WHERE id = ?').get(id);
    if (!c) throw noEncontrado('Categoría');
    return c;
  };

  const plato = (id) => {
    const p = db.prepare('SELECT * FROM platos WHERE id = ?').get(id);
    if (!p) throw noEncontrado('Plato');
    return { ...p, disponible: !!p.disponible };
  };

  function validarPlato({ nombre, precio, categoria_id }) {
    if (!nombre) throw datosInvalidos('El nombre es obligatorio');
    if (!Number.isInteger(precio) || precio <= 0) throw datosInvalidos('El precio debe ser un entero positivo');
    categoria(categoria_id);
  }

  return {
    listarCategorias: () => db.prepare('SELECT * FROM categorias ORDER BY nombre').all(),
    categoria,

    crearCategoria({ nombre } = {}) {
      if (!nombre) throw datosInvalidos('El nombre es obligatorio');
      if (db.prepare('SELECT 1 FROM categorias WHERE nombre = ?').get(nombre)) throw conflicto('La categoría ya existe');
      const { lastInsertRowid } = db.prepare('INSERT INTO categorias (nombre) VALUES (?)').run(nombre);
      return categoria(lastInsertRowid);
    },

    actualizarCategoria(id, { nombre } = {}) {
      categoria(id);
      if (!nombre) throw datosInvalidos('El nombre es obligatorio');
      db.prepare('UPDATE categorias SET nombre = ? WHERE id = ?').run(nombre, id);
      return categoria(id);
    },

    eliminarCategoria(id) {
      categoria(id);
      if (db.prepare('SELECT 1 FROM platos WHERE categoria_id = ?').get(id)) {
        throw conflicto('La categoría tiene platos asociados');
      }
      db.prepare('DELETE FROM categorias WHERE id = ?').run(id);
    },

    listarPlatos({ categoria_id, soloDisponibles } = {}) {
      let sql = 'SELECT p.*, c.nombre AS categoria FROM platos p JOIN categorias c ON c.id = p.categoria_id WHERE 1 = 1';
      const params = [];
      if (categoria_id) { sql += ' AND p.categoria_id = ?'; params.push(categoria_id); }
      if (soloDisponibles) sql += ' AND p.disponible = 1';
      return db.prepare(`${sql} ORDER BY c.nombre, p.nombre`).all(...params)
        .map((p) => ({ ...p, disponible: !!p.disponible }));
    },

    plato,

    crearPlato(datos = {}) {
      validarPlato(datos);
      const { nombre, descripcion = '', precio, categoria_id, disponible = true } = datos;
      const { lastInsertRowid } = db
        .prepare('INSERT INTO platos (categoria_id, nombre, descripcion, precio, disponible) VALUES (?, ?, ?, ?, ?)')
        .run(categoria_id, nombre, descripcion, precio, disponible ? 1 : 0);
      return plato(lastInsertRowid);
    },

    actualizarPlato(id, cambios = {}) {
      const actual = plato(id);
      const datos = { ...actual, ...cambios };
      validarPlato(datos);
      db.prepare('UPDATE platos SET categoria_id = ?, nombre = ?, descripcion = ?, precio = ?, disponible = ? WHERE id = ?')
        .run(datos.categoria_id, datos.nombre, datos.descripcion, datos.precio, datos.disponible ? 1 : 0, id);
      return plato(id);
    },

    eliminarPlato(id) {
      plato(id);
      db.prepare('DELETE FROM platos WHERE id = ?').run(id);
    },
  };
}

module.exports = { crearServicioMenu };
