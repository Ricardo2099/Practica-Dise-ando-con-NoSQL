import { useState } from 'react';
import Navegacion from './components/Navegacion.jsx';
import Inicio from './pages/Inicio.jsx';
import Vuelos from './pages/Vuelos.jsx';
import Hoteles from './pages/Hoteles.jsx';
import Carrito from './pages/Carrito.jsx';
import useCarrito from './useCarrito.js';

export default function App() {
  const [pantalla, setPantalla] = useState('inicio');
  const { carrito, pendiente, error, consultar } = useCarrito();
  const elementos = carrito?.productos || [];
  const bloqueado = pendiente || !carrito;

  function navegar(destino) {
    setPantalla(destino);
    consultar();
  }

  function agregarAlCarrito(producto) {
    consultar('POST', '/productos', { id: producto.id });
  }

  return (
    <>
      <a className="saltar" href="#contenido">Ir al contenido</a>
      <Navegacion pantalla={pantalla} navegar={navegar} cantidad={bloqueado ? '…' : elementos.length} />
      <main id="contenido" className="contenedor">
        {pendiente && <p className="estado-carrito" role="status">Consultando tu carrito…</p>}
        {error && <div className="estado-carrito" role="alert"><p>{error}</p><button className="enlace-texto" onClick={() => consultar()} disabled={pendiente}>Consultar de nuevo</button></div>}
        {pantalla === 'inicio' && <Inicio navegar={navegar} />}
        {pantalla === 'vuelos' && <Vuelos carrito={elementos} agregar={agregarAlCarrito} bloqueado={bloqueado} />}
        {pantalla === 'hoteles' && <Hoteles carrito={elementos} agregar={agregarAlCarrito} bloqueado={bloqueado} />}
        {pantalla === 'carrito' && !bloqueado && <Carrito elementos={elementos} total={carrito.total} eliminar={(id) => consultar('DELETE', `/productos/${encodeURIComponent(id)}`)} vaciar={() => consultar('DELETE')} navegar={navegar} />}
      </main>
      <footer className="contenedor pie"><span className="marca">Vuelos y hoteles</span><span>Pequeños planes. Grandes recuerdos.</span><span>Proyecto académico · Datos de ejemplo</span></footer>
    </>
  );
}
