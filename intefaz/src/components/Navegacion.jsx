export default function Navegacion({ pantalla, navegar, cantidad }) {
  return (
    <header className="cabecera">
      <div className="contenedor barra">
        <button className="marca" onClick={() => navegar('inicio')} aria-label="Vuelos y hoteles, ir al inicio">Vuelos y hoteles</button>
        <nav aria-label="Navegación principal">
          {['inicio', 'vuelos', 'hoteles', 'carrito'].map((opcion) => (
            <button key={opcion} className={`enlace ${pantalla === opcion ? 'activo' : ''}`} aria-current={pantalla === opcion ? 'page' : undefined} onClick={() => navegar(opcion)}>
              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
              {opcion === 'carrito' && <span className="contador" aria-label={typeof cantidad === 'number' ? `${cantidad} elementos` : 'Carrito pendiente de consultar'}>{cantidad}</span>}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
