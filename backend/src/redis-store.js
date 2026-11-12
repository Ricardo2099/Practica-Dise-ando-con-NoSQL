export const TTL_SEGUNDOS = 1800;

// Redis ejecuta el script completo de forma atómica: dos pestañas no pueden
// sobrescribir sus cambios ni insertar duplicados entre GET y SET.
const OPERAR_CARRITO = `
local valor = redis.call('GET', KEYS[1])
local productos = valor and cjson.decode(valor).productos or {}
local accion = ARGV[1]
if accion == 'agregar' then
  local nuevo = cjson.decode(ARGV[2])
  local existe = false
  for _, producto in ipairs(productos) do
    if producto.id == nuevo.id then existe = true end
  end
  if not existe then table.insert(productos, nuevo) end
elseif accion == 'eliminar' then
  for indice = #productos, 1, -1 do
    if productos[indice].id == ARGV[2] then table.remove(productos, indice) end
  end
elseif accion == 'vaciar' then
  productos = {}
end
-- cjson codifica una tabla vacía como {}; necesitamos siempre un arreglo JSON.
local lista = #productos == 0 and '[]' or cjson.encode(productos)
local resultado = '{"productos":' .. lista .. '}'
redis.call('SET', KEYS[1], resultado, 'EX', ARGV[3])
return resultado
`;

export function crearAlmacen(redis, prefijo = 'carrito:sesion:') {
  return {
    async operar(sesion, accion = 'consultar', dato = '') {
      if (!redis.isReady) throw new Error('Redis no está disponible');
      const valor = await redis.eval(OPERAR_CARRITO, {
        keys: [`${prefijo}${sesion}`],
        arguments: [accion, typeof dato === 'string' ? dato : JSON.stringify(dato), String(TTL_SEGUNDOS)],
      });
      const { productos } = JSON.parse(valor);
      return {
        productos,
        total: productos.reduce((suma, producto) => suma + Math.round(producto.precio * 100), 0) / 100,
        ttlSegundos: TTL_SEGUNDOS,
      };
    },
  };
}
