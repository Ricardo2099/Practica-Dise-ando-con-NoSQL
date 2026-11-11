export const vuelos = [
  { id: 'vuelo-1', tipo: 'vuelo', nombre: 'Ciudad de México → Cancún', aerolinea: 'Aerolínea Horizonte', origen: 'Ciudad de México', destino: 'Cancún', fecha: '18 de diciembre de 2026', hora: '08:30', precio: 2450 },
  { id: 'vuelo-2', tipo: 'vuelo', nombre: 'Guadalajara → Puerto Vallarta', aerolinea: 'Aerolínea del Pacífico', origen: 'Guadalajara', destino: 'Puerto Vallarta', fecha: '19 de diciembre de 2026', hora: '10:15', precio: 1650 },
  { id: 'vuelo-3', tipo: 'vuelo', nombre: 'Monterrey → Mérida', aerolinea: 'Aerolínea Horizonte', origen: 'Monterrey', destino: 'Mérida', fecha: '20 de diciembre de 2026', hora: '12:40', precio: 2890 },
  { id: 'vuelo-4', tipo: 'vuelo', nombre: 'Ciudad de México → Oaxaca', aerolinea: 'Alas del Sur', origen: 'Ciudad de México', destino: 'Oaxaca', fecha: '21 de diciembre de 2026', hora: '07:20', precio: 1790 },
  { id: 'vuelo-5', tipo: 'vuelo', nombre: 'Tijuana → Los Cabos', aerolinea: 'Aerolínea del Pacífico', origen: 'Tijuana', destino: 'Los Cabos', fecha: '22 de diciembre de 2026', hora: '16:00', precio: 2190 },
];

export const hoteles = [
  { id: 'hotel-1', tipo: 'hotel', nombre: 'Casa del Mar', ubicacion: 'Cancún, Quintana Roo', descripcion: 'Una estancia luminosa cerca de la playa, con terraza y espacios para descansar.', precio: 1850 },
  { id: 'hotel-2', tipo: 'hotel', nombre: 'Patio de los Arcos', ubicacion: 'Mérida, Yucatán', descripcion: 'Un pequeño refugio con patio interior, a unos pasos del centro histórico.', precio: 1250 },
  { id: 'hotel-3', tipo: 'hotel', nombre: 'Brisa del Pacífico', ubicacion: 'Puerto Vallarta, Jalisco', descripcion: 'Habitaciones acogedoras cerca del malecón y de los sabores locales.', precio: 1490 },
  { id: 'hotel-4', tipo: 'hotel', nombre: 'Casa Bugambilia', ubicacion: 'Oaxaca, Oaxaca', descripcion: 'Un alojamiento tranquilo con detalles artesanales y un jardín para desconectar.', precio: 1100 },
  { id: 'hotel-5', tipo: 'hotel', nombre: 'Arena y Cielo', ubicacion: 'Los Cabos, Baja California Sur', descripcion: 'Espacios abiertos y una terraza para disfrutar los atardeceres del desierto.', precio: 2350 },
];

export function formatoPrecio(precio) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
  }).format(precio);
}
