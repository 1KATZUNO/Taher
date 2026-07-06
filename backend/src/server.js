import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import jovenesRoutes from "./routes/jovenes.js";
import statsRoutes from "./routes/stats.js";
import { obtenerConfig } from "./models/Config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
// CSP deshabilitado: servimos la landing y la app web (estilos/scripts inline)
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Healthcheck (JSON)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "Taher API", version: "1.0.0" });
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/jovenes", jovenesRoutes);
app.use("/api/stats", statsRoutes);

// Sitio estático: landing (/) , app web (/app) y descargas (/downloads)
app.use(express.static(PUBLIC_DIR));

// Fallback SPA: cualquier ruta bajo /app la resuelve el router de la app web
app.get("/app/*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "app", "index.html"));
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

// Arranque: el servidor web sube primero (landing/app siempre disponibles)
// y la conexión a MongoDB se establece en paralelo.
async function start() {
  app.listen(PORT, () => {
    console.log(`🚀 Taher escuchando en http://localhost:${PORT}`);
  });

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Falta la variable MONGO_URI en el archivo .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    // Asegura que el PIN universal exista en la BD (colección 'config')
    const config = await obtenerConfig();
    console.log(`🔑 PIN universal activo: ${config.pin}`);
  } catch (err) {
    console.error("⚠️ Sin conexión a MongoDB (la API responderá errores):", err.message);
  }
}

start();
