# Vuelos y hoteles · Carrito de compras temporal

Frontend académico de Ricardo con React, Vite, JavaScript y CSS. Conserva
Inicio, Vuelos, Hoteles y Carrito, los cinco vuelos y cinco hoteles, los estilos
y la navegación por estado de React.

El Escenario 3 consulta una API Express que guarda el carrito en Redis.
El estado de React representa la última respuesta del servidor. Recargar
conserva las selecciones de la sesión durante 30 minutos de inactividad.

## Ejecutar

Requiere Node.js 22.12+ y tener Redis y el backend iniciados. Sigue primero la
[guía del Escenario 3](../docs/escenario-3-clave-valor.md).

```sh
npm ci
npm run dev
```

Abre **http://localhost:5173**. Vite reenvía `/api` al backend en
`http://127.0.0.1:3001`, también al ejecutar `npm run preview`.
Si cambias ese puerto, adapta `vite.config.js`; si cambias el origen del
frontend, adapta además `FRONTEND_ORIGIN` en `backend/.env`.

```sh
npm run build
npm run preview
```

## Archivos principales

- `src/App.jsx`: navegación y conexión de las pantallas con el carrito remoto.
- `src/useCarrito.js`: peticiones, sesión por cookie, carga, errores y vigencia.
- `src/components/Navegacion.jsx`: navegación y contador.
- `src/pages/`: las cuatro pantallas existentes.
- `src/datos.js`: catálogo de ejemplo y formato MXN; el backend reutiliza sus precios.
- `src/styles.css`: diseño y adaptación a pantallas pequeñas.

El frontend envía solo el `id` al agregar. El total llega calculado por la API.
Si falla la conexión, muestra un error y permite volver a consultar; no muestra
un total ni un carrito vacío como si hubiera confirmado los datos.

Las [pruebas y evidencias](../docs/escenario-3-clave-valor.md#l-pruebas-y-resultados)
incluyen Redis real, recarga del navegador, sesiones independientes y fallos de conexión.
