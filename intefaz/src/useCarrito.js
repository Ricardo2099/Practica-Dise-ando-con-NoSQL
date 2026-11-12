import { useCallback, useEffect, useRef, useState } from 'react';

export default function useCarrito() {
  const [carrito, setCarrito] = useState(null);
  const [pendiente, setPendiente] = useState(true);
  const [error, setError] = useState('');
  const ocupado = useRef(false);
  const solicitud = useRef(0);
  const controlador = useRef(null);

  const consultar = useCallback(async (metodo = 'GET', ruta = '', datos) => {
    if (ocupado.current) return;
    ocupado.current = true;
    const turno = ++solicitud.current;
    const abortar = new AbortController();
    controlador.current = abortar;
    const limite = setTimeout(() => abortar.abort(), 8000);
    setPendiente(true);
    setError('');
    try {
      const respuesta = await fetch(`/api/carrito${ruta}`, {
        method: metodo,
        credentials: 'same-origin',
        cache: 'no-store',
        signal: abortar.signal,
        ...(datos && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) }),
      });
      let resultado;
      try { resultado = await respuesta.json(); } catch { throw new Error('No se pudo consultar el carrito. Comprueba que el backend esté iniciado.'); }
      if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo actualizar el carrito.');
      if (!Array.isArray(resultado.productos) || !Number.isFinite(resultado.total) || resultado.ttlSegundos !== 1800) {
        throw new Error('La respuesta del carrito no es válida.');
      }
      if (turno === solicitud.current) setCarrito({ ...resultado, consultadoEn: Date.now() });
    } catch (fallo) {
      if (turno === solicitud.current) {
        setCarrito(null);
        setError(fallo.name === 'TypeError' || fallo.name === 'AbortError'
          ? 'No se pudo conectar con el carrito. Comprueba el backend y vuelve a consultar.' : fallo.message);
      }
    } finally {
      clearTimeout(limite);
      if (turno === solicitud.current) {
        ocupado.current = false;
        setPendiente(false);
      }
    }
  }, []);

  useEffect(() => {
    consultar();
    // Volver a la pestaña cuenta como interacción. No hay sondeo automático
    // que mantenga vivo un carrito abandonado.
    const alVolver = () => consultar();
    window.addEventListener('focus', alVolver);
    return () => {
      window.removeEventListener('focus', alVolver);
      solicitud.current += 1;
      controlador.current?.abort();
      ocupado.current = false;
    };
  }, [consultar]);

  useEffect(() => {
    if (!carrito) return;
    const restante = Math.max(0, carrito.consultadoEn + carrito.ttlSegundos * 1000 - Date.now());
    const temporizador = setTimeout(() => {
      setCarrito(null);
      setError('Han pasado 30 minutos sin consultar el carrito. Consulta de nuevo para ver su estado actual.');
    }, restante);
    return () => clearTimeout(temporizador);
  }, [carrito]);

  return { carrito, pendiente, error, consultar };
}
