import { useState } from 'react';
import Navegacion from './components/Navegacion.jsx';
import Inicio from './pages/Inicio.jsx';
import Vuelos from './pages/Vuelos.jsx';
import Hoteles from './pages/Hoteles.jsx';
import Carrito from './pages/Carrito.jsx';

export default function App() {
  const [pantalla, setPantalla] = useState('inicio');
  const [carrito, setCarrito] = useState([]);

  function agregarAlCarrito(producto) {
    setCarrito((actual) => {
      if (actual.some((elemento) => elemento.id === producto.id)) return actual;
      return [...actual, {
        id: producto.id,
        tipo: producto.tipo,
        nombre: producto.nombre,
        precio: producto.precio,
      }];
    });
  }

  function eliminarDelCarrito(id) {
    setCarrito((actual) => actual.filter((elemento) => elemento.id !== id));
  }

  return (
    <>
      <a className="saltar" href="#contenido">Ir al contenido</a>
      <Navegacion pantalla={pantalla} navegar={setPantalla} cantidad={carrito.length} />
      <main id="contenido" className="contenedor">
        {pantalla === 'inicio' && <Inicio navegar={setPantalla} />}
        {pantalla === 'vuelos' && <Vuelos carrito={carrito} agregar={agregarAlCarrito} />}
        {pantalla === 'hoteles' && <Hoteles carrito={carrito} agregar={agregarAlCarrito} />}
        {pantalla === 'carrito' && <Carrito elementos={carrito} eliminar={eliminarDelCarrito} navegar={setPantalla} />}
      </main>
      <footer className="contenedor pie"><span className="marca">Vuelos y hoteles</span><span>Pequeños planes. Grandes recuerdos.</span><span>Proyecto académico · Datos de ejemplo</span></footer>
    </>
  );
}
