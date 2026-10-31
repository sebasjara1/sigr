const dosDigitos = (n) => String(n).padStart(2, '0');

function fechaLocal(d = new Date()) {
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
}

function ahora(d = new Date()) {
  return `${fechaLocal(d)} ${dosDigitos(d.getHours())}:${dosDigitos(d.getMinutes())}:${dosDigitos(d.getSeconds())}`;
}

const esFecha = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const esHora = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

module.exports = { fechaLocal, ahora, esFecha, esHora };
