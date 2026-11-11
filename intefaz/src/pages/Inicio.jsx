export default function Inicio({ navegar }) {
  return (
    <>
      <section className="bienvenida">
        <div className="bienvenida-texto">
          <p className="etiqueta">TU PRÓXIMA ESCAPADA EMPIEZA AQUÍ</p>
          <h1>Vuelos y hoteles.<br /><em>Un viaje a tu medida.</em></h1>
          <p>Hay lugares que todavía no conoces y recuerdos que te esperan. Encuentra tu vuelo, elige dónde quedarte y empieza a imaginar tu próxima aventura.</p>
          <div className="acciones"><button className="boton" onClick={() => navegar('vuelos')}>Explorar vuelos <span aria-hidden="true">↗</span></button><button className="boton secundario" onClick={() => navegar('hoteles')}>Ver hoteles</button></div>
          <p className="nota">Vuelos y estancias en México · Precios en MXN</p>
        </div>
        <div className="postal" role="img" aria-label="Ilustración de un paisaje de playa con sol y montañas">
          <span className="postal-titulo">México, por descubrir.</span><div className="sol" /><div className="montana lejana" /><div className="montana cercana" /><div className="mar" /><div className="arena" /><span className="postal-pie">ELIGE TU PRÓXIMO DESTINO ↗</span>
        </div>
      </section>
      <section className="explorar" aria-labelledby="titulo-explorar">
        <div className="encabezado"><p className="etiqueta">MENOS VUELTAS, MÁS VIAJES</p><h2 id="titulo-explorar">¿Por dónde empezamos?</h2><p>Arma tu selección con calma. Tu carrito te acompaña mientras navegas.</p></div>
        <div className="opciones">
          <article className="opcion"><span className="icono" aria-hidden="true">↗</span><div><h3>Encuentra tu vuelo</h3><p>Cinco rutas para salir de la rutina. Un boleto, un nuevo comienzo.</p><button className="enlace-texto" onClick={() => navegar('vuelos')}>Explorar vuelos →</button></div></article>
          <article className="opcion"><span className="icono" aria-hidden="true">⌂</span><div><h3>Un lugar para quedarte</h3><p>Descubre alojamientos con encanto y elige tu estancia de una noche.</p><button className="enlace-texto" onClick={() => navegar('hoteles')}>Explorar hoteles →</button></div></article>
        </div>
      </section>
    </>
  );
}
