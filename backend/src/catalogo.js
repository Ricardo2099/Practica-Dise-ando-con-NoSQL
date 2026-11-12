// El catálogo existente es la fuente de precios del servidor para esta práctica.
// El navegador solo envía el id; nunca decide el precio, nombre ni tipo.
import { vuelos, hoteles } from '../../intefaz/src/datos.js';

export const catalogo = new Map([...vuelos, ...hoteles].map(({ id, tipo, nombre, precio }) => [
  id, { id, tipo, nombre, precio },
]));

