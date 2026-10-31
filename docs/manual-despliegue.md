# Manual de despliegue

Pasos para poner el SIGR a funcionar en un equipo nuevo.

## 1. Preparar el equipo

Instalar:

- **Node.js 22.13 o superior**: https://nodejs.org (versión LTS)
- **Git**: https://git-scm.com

Comprobar en una terminal:

```bash
node --version
git --version
```

## 2. Obtener el código de la línea base

```bash
git clone https://github.com/sebasjara1/sigr.git
cd sigr
git checkout v1.0.0
```

`git checkout v1.0.0` asegura que se instala exactamente la versión aprobada.

## 3. Instalar y verificar

```bash
npm install
npm test
```

Todas las pruebas deben pasar antes de continuar.

## 4. Ejecutar

```bash
npm start
```

La aplicación queda disponible en http://localhost:3000.

### Configuración opcional

| Variable  | Para qué                                 | Valor por defecto |
| --------- | ---------------------------------------- | ----------------- |
| `PORT`    | Cambiar el puerto                        | `3000`            |
| `SIGR_DB` | Cambiar dónde se guarda la base de datos | `data/sigr.db`    |

Ejemplo en PowerShell: `$env:PORT=8080; npm start`

## 5. Antes de usarlo en un restaurante real

- Cambiar las claves de los usuarios de prueba.
- Hacer copia de seguridad periódica del archivo `data/sigr.db`.

## Problemas comunes

| Síntoma                     | Solución                                      |
| --------------------------- | --------------------------------------------- |
| `node` no se reconoce       | Reinstalar Node.js y abrir una terminal nueva |
| El puerto 3000 está ocupado | Usar otro puerto con `PORT`                   |
| Se quiere empezar de cero   | Detener la app y borrar la carpeta `data/`    |
