import { randomBytes } from 'node:crypto';
import express from 'express';
import cookieParser from 'cookie-parser';
import { catalogo } from './catalogo.js';

export const COOKIE_SESION = 'carrito_sesion';

export function crearApp({ almacen, secreto, origen = 'http://localhost:5173', cookieSegura = false }) {
  if (typeof secreto !== 'string' || secreto.length < 32) {
    throw new Error('SESSION_SECRET debe contener al menos 32 caracteres aleatorios. Consulta .env.example.');
  }
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    // Vite actúa como proxy: solo aceptamos el origen local configurado.
    if ((req.get('origin') && req.get('origin') !== origen) || req.get('sec-fetch-site') === 'cross-site') {
      return res.status(403).json({ error: 'Origen no permitido.' });
    }
    next();
  });
  app.use(express.json({ limit: '4kb' }));
  app.use(cookieParser(secreto));
  app.use('/api/carrito', (req, res, next) => {
    const anterior = req.signedCookies[COOKIE_SESION];
    req.sesion = typeof anterior === 'string' && /^[a-f0-9]{64}$/.test(anterior)
      ? anterior : randomBytes(32).toString('hex');
    res.cookie(COOKIE_SESION, req.sesion, {
      signed: true, httpOnly: true, sameSite: 'lax', secure: cookieSegura, path: '/api',
    });
    next();
  });

  async function responder(res, sesion, accion, dato) {
    try {
      res.json(await almacen.operar(sesion, accion, dato));
    } catch (error) {
      // No devolvemos la URL de conexión ni información interna al navegador.
      console.error('No se pudo operar el carrito:', error.message);
      res.status(503).json({ error: 'El carrito no está disponible. Comprueba el backend y Redis e inténtalo de nuevo.' });
    }
  }

  app.get('/api/carrito', (req, res) => responder(res, req.sesion, 'consultar'));
  app.post('/api/carrito/productos', (req, res) => {
    const datos = req.body;
    if (!datos || Array.isArray(datos) || Object.keys(datos).length !== 1 || typeof datos.id !== 'string') {
      return res.status(400).json({ error: 'Envía únicamente { "id": "identificador del catálogo" }. Cada selección tiene cantidad 1.' });
    }
    const producto = catalogo.get(datos.id);
    if (!producto) return res.status(400).json({ error: 'Producto fuera del catálogo.' });
    return responder(res, req.sesion, 'agregar', producto);
  });
  app.delete('/api/carrito/productos/:id', (req, res) => {
    if (!catalogo.has(req.params.id)) return res.status(400).json({ error: 'Identificador de producto inválido.' });
    return responder(res, req.sesion, 'eliminar', req.params.id);
  });
  app.delete('/api/carrito', (req, res) => responder(res, req.sesion, 'vaciar'));
  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
  app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Solicitud demasiado grande.' });
    if (error instanceof SyntaxError || error.status === 400) return res.status(400).json({ error: 'JSON inválido.' });
    console.error('Error de API:', error.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  });
  return app;
}
