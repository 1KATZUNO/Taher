# Taher — App de Registro Juvenil

App móvil para registrar y gestionar jóvenes, con una base de datos **MongoDB Atlas**.

- **`backend/`** — API REST en Node + Express + Mongoose (habla con MongoDB).
- **`app/`** — App móvil en React Native (Expo) + NativeWind (Tailwind).

La app **no** se conecta directo a MongoDB: consume la API del backend. Así las credenciales de la base nunca viajan dentro de la app.

```
┌─────────────┐      HTTP/REST      ┌──────────────┐    Mongoose    ┌───────────────┐
│  App Expo   │ ──────────────────> │ API Express  │ ─────────────> │ MongoDB Atlas │
│ (teléfono)  │ <────────────────── │ (PC :4000)   │ <───────────── │   (nube)      │
└─────────────┘       JSON          └──────────────┘                └───────────────┘
```

---

## 1. Backend (API)

```bash
cd backend
npm install
```

Crea el archivo `backend/.env` (ya incluido en este repo localmente, pero **no se sube a git**):

```env
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/Taher?appName=Angeda
PORT=4000
APP_PIN=1234
```

Sembrar datos de ejemplo (opcional) y arrancar:

```bash
npm run seed     # inserta 8 jóvenes de prueba
npm start        # arranca la API en http://localhost:4000
```

### Endpoints

| Método | Ruta                  | Descripción                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/api/auth/pin`       | Valida el PIN de acceso (`{pin}`)    |
| GET    | `/api/jovenes`        | Lista jóvenes (`?search=` opcional)  |
| GET    | `/api/jovenes/:id`    | Un joven por id                      |
| POST   | `/api/jovenes`        | Crea un registro                     |
| PUT    | `/api/jovenes/:id`    | Actualiza un registro                |
| DELETE | `/api/jovenes/:id`    | Elimina un registro                  |
| GET    | `/api/stats`          | Estadísticas (totales, edad, género, WhatsApp) |

---

## 2. App móvil (Expo)

```bash
cd app
npm install
npm start        # abre Expo Dev Tools
```

Luego escanea el QR con la app **Expo Go** (Android/iOS) o pulsa `a` para abrir un emulador Android.

### Importante para que la app vea la API

- El teléfono y la PC deben estar en la **misma red WiFi**.
- La app detecta automáticamente la IP de tu PC (la misma de Metro) y usa el puerto `4000`.
- En **Windows**, permite el puerto 4000 en el Firewall la primera vez (o crea una regla de entrada para Node.js).
- Si necesitas forzar la URL, crea `app/.env` con:
  ```env
  EXPO_PUBLIC_API_URL=http://192.168.x.x:4000
  ```

### PIN de acceso (demo)

`1234` (configurable en `backend/.env` → `APP_PIN`).

---

## 3. Generar el APK instalable (con logo)

El icono de instalación se configura en `app/app.json` (`icon`, `android.adaptiveIcon`).
Reemplaza `app/assets/icon.png` por el logo de Taher (PNG cuadrado 1024×1024).

Build en la nube con EAS:

```bash
cd app
npm install -g eas-cli
eas login
eas build -p android --profile preview   # genera un APK descargable
```

---

## Pantallas

1. **Acceso por PIN** — teclado numérico, valida contra la API.
2. **Inicio** — bienvenida, buscador, accesos rápidos y métricas.
3. **Buscar** — búsqueda por nombre/ciudad en vivo.
4. **Estadísticas** — total, distribución por edad, género y % WhatsApp.
5. **Lista** — jóvenes registrados (pull-to-refresh) + detalle/eliminar.
6. **Registro** — formulario que guarda en MongoDB.
