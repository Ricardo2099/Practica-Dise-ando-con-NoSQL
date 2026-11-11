import { vuelos, formatoPrecio } from '../datos.js';

export default function Vuelos({ carrito, agregar }) {
  return (
    <section className="pagina">
      <div className="encabezado"><p className="etiqueta">EL VIAJE EMPIEZA AL DESPEGAR</p><h1>Encuentra tu próximo vuelo</h1><p>Rutas de ejemplo para descubrir México. Cada selección incluye un boleto.</p></div>
      <p className="nota catalogo-nota">{vuelos.length} vuelos disponibles · Precios en MXN</p>
      <div className="lista-vuelos">
        {vuelos.map((vuelo) => {
          const agregado = carrito.some((elemento) => elemento.id === vuelo.id);
          return (
            <article className="tarjeta vuelo" key={vuelo.id}>
              <div><p className="etiqueta">{vuelo.aerolinea}</p><h2>{vuelo.origen} <span className="flecha" aria-hidden="true">→</span> {vuelo.destino}</h2><p className="detalle">{vuelo.fecha} · {vuelo.hora} h</p></div>
              <div className="precio-accion"><div><strong className="precio">{formatoPrecio(vuelo.precio)}</strong><span className="nota">MXN / boleto</span></div><button className="boton" disabled={agregado} onClick={() => agregar(vuelo)} aria-label={`${agregado ? 'Agregado' : 'Agregar'}: ${vuelo.nombre}`}>{agregado ? '✓ Agregado' : 'Agregar al carrito'}</button></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
