import { formatoPrecio } from '../datos.js';

export default function Carrito({ elementos, total, eliminar, vaciar, navegar }) {
  return (
    <section className="pagina">
      <div className="encabezado"><p className="etiqueta">TU VIAJE VA TOMANDO FORMA</p><h1>Tu carrito</h1><p>Revisa tus selecciones y sigue explorando a tu ritmo.</p></div>
      {elementos.length === 0 ? (
        <div className="vacio tarjeta"><span className="icono" aria-hidden="true">↗</span><h2>Tu próxima aventura aún está por elegir</h2><p>Tu carrito está vacío. Agrega un vuelo o un hotel para empezar a armar tu viaje.</p><div className="acciones"><button className="boton" onClick={() => navegar('vuelos')}>Explorar vuelos</button><button className="boton secundario" onClick={() => navegar('hoteles')}>Ver hoteles</button></div></div>
      ) : (
        <div className="carrito-distribucion">
          <div className="lista-carrito">
            {elementos.map((elemento) => (
              <article className="tarjeta elemento-carrito" key={elemento.id}>
                <div><p className="etiqueta">{elemento.tipo === 'vuelo' ? 'VUELO · 1 BOLETO' : 'HOTEL · 1 NOCHE'}</p><h2>{elemento.nombre}</h2><strong className="precio">{formatoPrecio(elemento.precio)} <small>MXN</small></strong></div>
                <button className="eliminar" onClick={() => eliminar(elemento.id)} aria-label={`Eliminar ${elemento.nombre}`}>Eliminar</button>
              </article>
            ))}
            <div className="acciones"><button className="enlace-texto" onClick={() => navegar('vuelos')}>← Ver vuelos</button><button className="enlace-texto" onClick={() => navegar('hoteles')}>Ver hoteles →</button><button className="eliminar" onClick={vaciar}>Vaciar carrito</button></div>
          </div>
          <aside className="resumen tarjeta"><h2>Resumen de tu viaje</h2><p>{elementos.length} {elementos.length === 1 ? 'elemento seleccionado' : 'elementos seleccionados'}</p><div className="total"><span>Total</span><strong>{formatoPrecio(total)} <small>MXN</small></strong></div><p className="nota">Los vuelos incluyen un boleto y los hoteles una noche. Tu selección se conserva al recargar y caduca después de 30 minutos de inactividad.</p></aside>
        </div>
      )}
    </section>
  );
}
