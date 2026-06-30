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

### A qué API se conecta la app

- **APK instalado / producción:** usa la API desplegada en Render (HTTPS), fijada en
  `app/.env` → `EXPO_PUBLIC_API_URL=https://taher-82uh.onrender.com`. Así la app
  funciona sola en cualquier teléfono, contra la base en la nube. No necesita tu PC.
- **Desarrollo con Expo Go (sin `.env`):** si borras `EXPO_PUBLIC_API_URL`, la app
  detecta la IP de tu PC (la de Metro) y usa el puerto `4000` contra el backend local
  (teléfono y PC en la misma WiFi; permite el puerto 4000 en el Firewall de Windows).
- El plan Free de Render "duerme" el servicio tras ~15 min de inactividad: el primer
  acceso puede tardar ~30-50s en responder, luego va normal.

### PIN de acceso

PIN universal **`2207`** (igual para todos). Se guarda en la BD (colección `config`)
y la API lo valida desde ahí. El valor inicial se siembra desde `backend/.env` → `APP_PIN`.

---

## 3. Generar el APK instalable (con logo)

El icono se genera desde un PNG con el logo de Taher:

```bash
cd app
node scripts/gen-icons.mjs C:/ruta/al/logo.png   # crea todos los assets en ./assets
```

### Opción A — Build local (sin cuenta Expo)

Requiere Android SDK + JDK 17/21. Genera un APK firmado con el keystore debug (instalable).

```bash
cd app
npx expo prebuild --platform android --no-install
# IMPORTANTE: el wrapper se genera con Gradle 9.3.1, que es incompatible con la
# cadena de plugins de RN 0.85 (falta JvmVendorSpec.IBM_SEMERU). Baja a 8.13:
#   android/gradle/wrapper/gradle-wrapper.properties
#   distributionUrl=...gradle-8.13-bin.zip
# y crea android/local.properties con: sdk.dir=C:/Users/<tu>/AppData/Local/Android/Sdk
cd android && ./gradlew assembleRelease
# APK resultante: android/app/build/outputs/apk/release/app-release.apk
```

### Opción B — Build en la nube con EAS

```bash
cd app
npx eas-cli login
npx eas-cli build -p android --profile preview   # devuelve un APK descargable
```

### Instalar en el celular

Pasa el `.apk` al teléfono (cable, WhatsApp, Drive…), ábrelo y permite
"instalar apps de orígenes desconocidos". La app busca la API en tu PC (`:4000`),
así que el backend debe estar corriendo y el teléfono en la misma WiFi.

---

## Pantallas

1. **Acceso por PIN** — teclado numérico, valida contra la API.
2. **Inicio** — bienvenida, buscador, accesos rápidos y métricas.
3. **Buscar** — búsqueda por nombre/ciudad en vivo.
4. **Estadísticas** — total, distribución por edad, género y % WhatsApp.
5. **Lista** — jóvenes registrados (pull-to-refresh) + detalle/eliminar.
6. **Registro** — formulario que guarda en MongoDB.
