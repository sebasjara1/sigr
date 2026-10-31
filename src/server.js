const path = require('node:path');
const { crearApp } = require('./app');

const PUERTO = process.env.PORT || 3000;
const RUTA_DB = process.env.SIGR_DB || path.join(__dirname, '..', 'data', 'sigr.db');

const { app } = crearApp({ rutaDb: RUTA_DB });

app.listen(PUERTO, () => {
  console.log(`SIGR escuchando en http://localhost:${PUERTO}`);
});
