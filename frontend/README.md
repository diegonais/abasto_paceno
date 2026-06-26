# Frontend web Abasto Boliviano

Aplicacion web de Abasto Boliviano construida con React y Vite.

El frontend web es la referencia visual y funcional del proyecto. Consume el backend NestJS, muestra ofertas geolocalizadas con Leaflet/OpenStreetMap y define la identidad visual que tambien usa el prototipo movil.

## Stack

- React
- Vite
- React Router
- Axios
- Leaflet y React Leaflet
- ESLint

## Estructura relevante

```text
frontend/
|-- public/
|   |-- logo.png
|   `-- abasto-boliviano.png
|-- src/
|   |-- components/
|   |-- pages/
|   |-- routes/
|   |-- services/
|   |-- styles/
|   `-- main.jsx
|-- .env.example
`-- package.json
```

## Variables de entorno

Copia el ejemplo:

```powershell
cd frontend
copy .env.example .env
```

Configura:

```text
VITE_API_URL=http://localhost:3000/api
VITE_PORT=5173
```

`VITE_API_URL` debe apuntar al backend e incluir el prefijo `/api`.

## Instalacion

```powershell
cd frontend
yarn install
```

## Ejecucion

Desarrollo:

```powershell
yarn dev
```

La app queda disponible por defecto en:

```text
http://localhost:5173
```

Preview de build:

```powershell
yarn build
yarn preview
```

## Consumo del backend

El cliente Axios central esta en:

```text
src/services/api/client.js
```

Este cliente usa `VITE_API_URL` y agrega el token JWT al header `Authorization` cuando existe una sesion guardada.

Si la web no carga datos:

- Verifica que el backend este levantado.
- Verifica que `VITE_API_URL` incluya `/api`.
- Verifica que `CORS_ORIGIN` en `backend/.env` permita `http://localhost:5173`.

## Estilos y marca

Los colores y variables visuales principales estan en:

```text
src/styles/global.css
```

La paleta del frontend define los tonos usados por el prototipo movil:

- Vino principal: `#7b1835`
- Vino activo: `#aa2950`
- Crema de fondo: `#fffaf3`
- Verde de marca: `#007934`
- Texto claro/oscuro y superficies segun tema

Los logos estan en `public/`:

- `logo.png`: icono tipo pin, pensado para favicon o usos compactos.
- `abasto-boliviano.png`: logo completo con nombre, usado como referencia para la app movil.

## Mapa

La web usa Leaflet con OpenStreetMap para visualizar ofertas geolocalizadas. El prototipo movil replica la idea con `react-native-maps`, sin copiar componentes HTML del frontend.

## Comandos utiles

```powershell
yarn build
yarn lint
yarn preview
```

## Alcance

La web contiene mas funcionalidades que el prototipo movil. La app mobile por ahora solo toma la referencia visual y el consumo de ofertas para mapa/listado; login, administracion y creacion de ofertas siguen fuera del alcance movil actual.
