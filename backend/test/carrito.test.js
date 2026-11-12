import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { setTimeout as esperar } from 'node:timers/promises';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import { crearApp, COOKIE_SESION } from '../src/app.js';
import { crearAlmacen, TTL_SEGUNDOS } from '../src/redis-store.js';
import { catalogo } from '../src/catalogo.js';

// Redis real; las pruebas solo borran las claves de su prefijo aleatorio.
const prefijo = `carrito:prueba:${randomBytes(8).toString('hex')}:`;
const secreto = randomBytes(32).toString('hex');
const claves = new Set();
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379/0',
  socket: { connectTimeout: 1500, reconnectStrategy: false },
  disableOfflineQueue: true,
});
redis.on('error', () => {});
let servidor;
let base;

async function iniciar(app) {
  const servidor = app.listen(0, '127.0.0.1');
  await once(servidor, 'listening');
  return { servidor, base: `http://127.0.0.1:${servidor.address().port}/api/carrito` };
}

before(async () => {
  await redis.connect();
  ({ servidor, base } = await iniciar(crearApp({ almacen: crearAlmacen(redis, prefijo), secreto })));
});

after(async () => {
  if (servidor) await new Promise((resolve) => servidor.close(resolve));
  if (redis.isReady) {
    if (claves.size) await redis.del([...claves]);
    await redis.quit();
  }
});

function navegador(url = base) {
  let cookie = '';
  return {
    get cookie() { return cookie; },
    get clave() {
      const valor = decodeURIComponent(cookie.split('=').slice(1).join('='));
      return `${prefijo}${cookieParser.signedCookie(valor, secreto)}`;
    },
    async pedir(metodo = 'GET', ruta = '', body, headers = {}) {
      const respuesta = await fetch(`${url}${ruta}`, {
        method: metodo,
        headers: { ...(cookie && { Cookie: cookie }), ...(body !== undefined && { 'Content-Type': 'application/json' }), ...headers },
        ...(body !== undefined && { body: typeof body === 'string' ? body : JSON.stringify(body) }),
      });
      const recibida = respuesta.headers.get('set-cookie');
      if (recibida) {
        cookie = recibida.split(';')[0];
        claves.add(this.clave);
      }
      return { status: respuesta.status, headers: respuesta.headers, datos: await respuesta.json() };
    },
  };
}

test('consulta vacía, JSON real, cookie segura para desarrollo y TTL de 1800 s', async () => {
  const cliente = navegador();
  const respuesta = await cliente.pedir();
  assert.equal(respuesta.status, 200);
  assert.deepEqual(respuesta.datos, { productos: [], total: 0, ttlSegundos: 1800 });
  assert.match(respuesta.headers.get('set-cookie'), /HttpOnly/);
  assert.match(respuesta.headers.get('set-cookie'), /SameSite=Lax/);
  assert.match(respuesta.headers.get('set-cookie'), /Path=\/api/);
  assert.equal(respuesta.headers.get('cache-control'), 'no-store');
  assert.match(cliente.clave, new RegExp(`^${prefijo}[a-f0-9]{64}$`));
  assert.deepEqual(JSON.parse(await redis.get(cliente.clave)), { productos: [] });
  assert.ok(await redis.ttl(cliente.clave) >= 1795);
});

test('agrega vuelo y hotel, evita duplicados y calcula $4300 con precios del servidor', async () => {
  const cliente = navegador();
  await cliente.pedir('POST', '/productos', { id: 'vuelo-1' });
  const respuesta = await cliente.pedir('POST', '/productos', { id: 'hotel-1' });
  assert.equal(respuesta.datos.total, 4300);
  assert.deepEqual(respuesta.datos.productos, [catalogo.get('vuelo-1'), catalogo.get('hotel-1')]);
  const duplicado = await cliente.pedir('POST', '/productos', { id: 'vuelo-1' });
  assert.equal(duplicado.datos.productos.length, 2);
  assert.equal(duplicado.datos.total, 4300);
});

test('persiste al volver a consultar con la cookie (como una recarga)', async () => {
  const cliente = navegador();
  await cliente.pedir('POST', '/productos', { id: 'vuelo-1' });
  const respuesta = await fetch(base, { headers: { Cookie: cliente.cookie } });
  assert.equal((await respuesta.json()).total, 2450);
  assert.equal(JSON.parse(await redis.get(cliente.clave)).productos.length, 1);
});

test('sesiones independientes no comparten carrito', async () => {
  const primero = navegador();
  const segundo = navegador();
  await primero.pedir('POST', '/productos', { id: 'hotel-1' });
  assert.equal((await segundo.pedir()).datos.productos.length, 0);
  assert.notEqual(primero.clave, segundo.clave);
  assert.equal((await primero.pedir()).datos.total, 1850);
});

test('cookies arbitrarias o firmas alteradas no permiten elegir la sesión', async () => {
  const propietario = navegador();
  await propietario.pedir('POST', '/productos', { id: 'hotel-1' });
  const id = propietario.clave.slice(prefijo.length);
  for (const cookie of [`${COOKIE_SESION}=${id}`, `${propietario.cookie}alterada`]) {
    const intruso = navegador();
    const respuesta = await intruso.pedir('GET', '', undefined, { Cookie: cookie });
    assert.deepEqual(respuesta.datos.productos, []);
    assert.notEqual(intruso.clave, propietario.clave);
  }
});

test('elimina un producto, conserva el otro y permite eliminar de nuevo', async () => {
  const cliente = navegador();
  await cliente.pedir('POST', '/productos', { id: 'vuelo-1' });
  await cliente.pedir('POST', '/productos', { id: 'hotel-1' });
  const respuesta = await cliente.pedir('DELETE', '/productos/vuelo-1');
  assert.deepEqual(respuesta.datos.productos, [catalogo.get('hotel-1')]);
  assert.equal(respuesta.datos.total, 1850);
  assert.equal((await cliente.pedir('DELETE', '/productos/vuelo-1')).datos.total, 1850);
});

test('vacía el carrito y mantiene productos como arreglo vacío', async () => {
  const cliente = navegador();
  await cliente.pedir('POST', '/productos', { id: 'hotel-1' });
  const respuesta = await cliente.pedir('DELETE');
  assert.deepEqual(respuesta.datos.productos, []);
  assert.equal(respuesta.datos.total, 0);
  assert.deepEqual(JSON.parse(await redis.get(cliente.clave)), { productos: [] });
});

test('solicitudes concurrentes conservan los diez productos sin duplicados: $19010', async () => {
  const cliente = navegador();
  await cliente.pedir();
  const cookie = cliente.cookie;
  const resultados = await Promise.all([...catalogo.keys(), ...catalogo.keys()].map((id) => fetch(`${base}/productos`, {
    method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
  })));
  assert.ok(resultados.every((respuesta) => respuesta.status === 200));
  const respuesta = await cliente.pedir();
  assert.equal(respuesta.datos.productos.length, 10);
  assert.equal(respuesta.datos.total, 19010);
});

test('consultar, agregar, repetir, eliminar y vaciar renuevan el TTL', async () => {
  const cliente = navegador();
  await cliente.pedir();
  const operaciones = [
    ['GET'], ['POST', '/productos', { id: 'vuelo-1' }],
    ['POST', '/productos', { id: 'vuelo-1' }], ['DELETE', '/productos/vuelo-1'], ['DELETE'],
  ];
  for (const operacion of operaciones) {
    await redis.expire(cliente.clave, 30);
    assert.ok(await redis.ttl(cliente.clave) <= 30);
    assert.equal((await cliente.pedir(...operacion)).status, 200);
    const ttl = await redis.ttl(cliente.clave);
    assert.ok(ttl > 1795 && ttl <= TTL_SEGUNDOS);
  }
});

test('Redis elimina por expiración y la misma sesión recibe un carrito vacío', async () => {
  const cliente = navegador();
  await cliente.pedir('POST', '/productos', { id: 'hotel-1' });
  // Se acorta solo esta clave para no esperar 30 minutos en una prueba.
  await redis.pExpire(cliente.clave, 50);
  await esperar(120);
  assert.equal(await redis.exists(cliente.clave), 0);
  assert.equal(await redis.ttl(cliente.clave), -2);
  assert.deepEqual((await cliente.pedir()).datos.productos, []);
});

test('rechaza precios, cantidades, productos inexistentes y cuerpos inválidos', async () => {
  const cliente = navegador();
  const invalidos = [
    {}, [], { id: 1 }, { id: 'no-existe' }, { id: 'hotel-1', precio: -1 },
    { id: 'hotel-1', precio: 0.01 }, { id: 'hotel-1', cantidad: -3 },
    { id: 'hotel-1', cantidad: 2 }, { id: 'hotel-1', sesion: 'ajena' }, 'JSON roto',
  ];
  for (const body of invalidos) assert.equal((await cliente.pedir('POST', '/productos', body)).status, 400);
  assert.deepEqual((await cliente.pedir()).datos.productos, []);
  assert.equal((await cliente.pedir('DELETE', '/productos/invalido')).status, 400);
  assert.equal((await cliente.pedir('POST', '/productos', { id: 'x'.repeat(5000) })).status, 413);
  assert.equal((await cliente.pedir('GET', '/inexistente')).status, 404);
});

test('rechaza peticiones de otros orígenes', async () => {
  const cliente = navegador();
  assert.equal((await cliente.pedir('POST', '/productos', { id: 'hotel-1' }, { Origin: 'https://otro-sitio.example' })).status, 403);
  assert.equal((await cliente.pedir('GET', '', undefined, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await cliente.pedir('GET', '', undefined, { Origin: 'http://localhost:5173' })).status, 200);
});

test('cliente Redis desconectado devuelve 503, sin fingir carrito vacío', async () => {
  const desconectado = createClient();
  const api = await iniciar(crearApp({ almacen: crearAlmacen(desconectado), secreto }));
  try {
    for (const [metodo, ruta, body] of [['GET'], ['POST', '/productos', { id: 'vuelo-1' }], ['DELETE']]) {
      const respuesta = await navegador(api.base).pedir(metodo, ruta, body);
      assert.equal(respuesta.status, 503);
      assert.equal(respuesta.datos.productos, undefined);
      assert.match(respuesta.datos.error, /no está disponible/);
    }
  } finally {
    await new Promise((resolve) => api.servidor.close(resolve));
  }
});

test('exige un secreto de sesión suficientemente largo', () => {
  assert.throws(() => crearApp({ almacen: crearAlmacen(redis), secreto: '' }), /SESSION_SECRET/);
});
