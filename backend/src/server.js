import { createClient } from 'redis';
import { crearApp } from './app.js';
import { crearAlmacen } from './redis-store.js';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379/0',
  disableOfflineQueue: true,
  socket: { connectTimeout: 2000, reconnectStrategy: (intento) => Math.min(200 * (intento + 1), 3000) },
});
redis.on('error', () => console.error('Redis desconectado. Revisa REDIS_URL y docker compose ps.'));

const app = crearApp({
  almacen: crearAlmacen(redis),
  secreto: process.env.SESSION_SECRET,
  origen: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  cookieSegura: process.env.COOKIE_SECURE === 'true',
});
// La API sigue atendiendo con 503 si Redis cae y se reconecta automáticamente.
redis.connect().catch(() => console.error('No se pudo conectar con Redis.'));
const puerto = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
const servidor = app.listen(puerto, host, () => console.log(`API del carrito en http://${host}:${puerto}`));

function cerrar() {
  servidor.close(() => process.exit(0));
  if (redis.isOpen) redis.destroy();
  setTimeout(() => process.exit(1), 3000).unref();
}
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
