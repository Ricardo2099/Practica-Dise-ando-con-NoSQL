import { hoteles, formatoPrecio } from '../datos.js';

export default function Hoteles({ carrito, agregar, bloqueado }) {
  return (
    <section className="pagina">
      <div className="encabezado"><p className="etiqueta">HAZ UNA PAUSA, SIÉNTETE EN CASA</p><h1>Un lugar para tu escapada</h1><p>Alojamientos de ejemplo con encanto. Cada selección corresponde a una noche.</p></div>
      <p className="nota catalogo-nota">{hoteles.length} hoteles disponibles · Precios en MXN</p>
      <div className="rejilla-hoteles">
        {hoteles.map((hotel, indice) => {
          const agregado = carrito.some((elemento) => elemento.id === hotel.id);
          return (
            <article className="tarjeta hotel" key={hotel.id}>
              <div className={`hotel-portada tono-${indice % 3}`} aria-hidden="true"><span>⌂</span><span className="hotel-numero">0{indice + 1} / ESTANCIAS</span></div>
              <div className="hotel-contenido"><p className="etiqueta">{hotel.ubicacion}</p><h2>{hotel.nombre}</h2><p className="detalle descripcion">{hotel.descripcion}</p><div className="hotel-precio"><strong className="precio">{formatoPrecio(hotel.precio)}</strong><span className="nota"> MXN / noche</span></div><button className="boton" disabled={agregado || bloqueado} onClick={() => agregar(hotel)} aria-label={`${agregado ? 'Agregado' : 'Agregar'}: ${hotel.nombre}`}>{agregado ? '✓ Agregado' : 'Agregar al carrito'}</button></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
