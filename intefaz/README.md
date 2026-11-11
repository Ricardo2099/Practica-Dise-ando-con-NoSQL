# Vuelos y hoteles · Carrito de compras temporal

Frontend académico con React, Vite, JavaScript y CSS. Incluye Inicio,
Vuelos, Hoteles y Carrito, con cinco vuelos y cinco hoteles ficticios.

## Ejecutar

Requiere Node.js 20.19+ o 22.12+ (se recomienda una versión LTS compatible).

```sh
npm install
npm run dev
```

Abre la dirección que indique Vite. En PowerShell, si la política de ejecución
bloquea `npm.ps1`, utiliza `npm.cmd install` y `npm.cmd run dev`.

```sh
npm run build
npm run preview
```

`build` genera la aplicación en `dist`. `preview` permite revisar esa compilación.

## Archivos

- `src/main.jsx`: monta React y carga el CSS.
- `src/App.jsx`: mantiene la pantalla activa y el carrito con `useState`.
- `src/components/Navegacion.jsx`: cambia de pantalla y muestra el contador.
- `src/pages/Inicio.jsx`: bienvenida y acceso a los catálogos.
- `src/pages/Vuelos.jsx`: catálogo y selección de boletos.
- `src/pages/Hoteles.jsx`: catálogo y selección de estancias de una noche.
- `src/pages/Carrito.jsx`: lista, eliminación, total y estado vacío.
- `src/datos.js`: productos locales y formato de precios en MXN.
- `src/styles.css`: estilos compartidos y adaptación a pantallas pequeñas.
- `index.html`, `vite.config.js`, `package.json` y `package-lock.json`: entrada,
  configuración y dependencias. El archivo de bloqueo lo genera npm.

## Estado y relación con Clave-Valor

`App` permanece montado cuando cambia la pantalla visible. Su carrito es un
arreglo de objetos con `id`, `tipo`, `nombre` y `precio`. Agregar comprueba el
identificador y evita duplicados; eliminar filtra por identificador. Las
actualizaciones usan el estado anterior para evitar perder selecciones.
El total se calcula con `reduce` en cada renderizado del carrito.

Las pantallas reciben datos y funciones por propiedades. En una etapa futura,
`App` podrá cargar el carrito de un backend y adaptar las funciones de agregar
y eliminar para enviar solicitudes. También habrá que manejar carga y errores.
Las interfaces de los catálogos pueden conservarse.

Para el modelo Clave-Valor del Escenario 3, una clave conceptual sería
`carrito:sesion-demo` y su valor un objeto JSON con los elementos seleccionados.
Se accede al carrito completo por un identificador; no hace falta resolver
relaciones ni consultas complejas. Un backend futuro podría definir una
caducidad para esa clave. Este proyecto todavía no incluye Redis, sesiones
reales, backend ni persistencia: recargar la página vacía el carrito.

## Comprobación manual

1. Abre Inicio y navega a Vuelos y Hoteles desde la barra y las opciones de inicio.
2. Agrega un vuelo y un hotel. Comprueba el contador y los botones «Agregado».
3. Cambia de pantalla y confirma que las selecciones permanecen.
4. Abre Carrito: el vuelo de $2,450 y Casa del Mar de $1,850 deben sumar $4,300 MXN.
5. Elimina el vuelo: debe quedar $1,850 MXN y un elemento en la barra.
6. Regresa a Vuelos: el vuelo eliminado debe poder agregarse de nuevo.
7. Elimina todo y comprueba el mensaje de carrito vacío y sus accesos a catálogos.
8. Agrega algo y recarga: el contador debe volver a cero.
9. Revisa las pantallas con una ventana estrecha y navega con Tab y Enter.

## Verificación del frontend

La compilación `npm.cmd run build` terminó correctamente. También se comprobó
la aplicación compilada en Microsoft Edge sin interfaz visible, usando un
servidor local temporal y sin instalar dependencias de pruebas.

Se verificaron las cuatro pantallas, los accesos de navegación, los diez
productos, la prevención de duplicados, el contador, la conservación de
selecciones al navegar, la eliminación, la posibilidad de volver a agregar
un producto, el carrito vacío y el reinicio al recargar. Los totales
comprobados fueron $4,300, $1,850 y $19,010 MXN (todos los productos).

Las cuatro pantallas se comprobaron con anchos de 320, 390, 768 y 1280 píxeles,
sin desbordamiento horizontal ni controles fuera del área visible. Se revisaron
capturas de móvil y escritorio. No se detectaron errores de ejecución o de
consola ni solicitudes de la página a servicios externos. Esta comprobación
se realizó en Edge; no cubre otros navegadores ni dispositivos físicos.
