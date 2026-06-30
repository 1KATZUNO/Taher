import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import jovenesRoutes from "./routes/jovenes.js";
import statsRoutes from "./routes/stats.js";
import { obtenerConfig } from "./models/Config.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Healthcheck
app.get("/", (req, res) => {
  res.json({ ok: true, service: "Taher API", version: "1.0.0" });
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/jovenes", jovenesRoutes);
app.use("/api/stats", statsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

// Conexión a MongoDB y arranque
async function start() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Falta la variable MONGO_URI en el archivo .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");

    // Asegura que el PIN universal exista en la BD (colección 'config')
    const config = await obtenerConfig();
    console.log(`🔑 PIN universal activo: ${config.pin}`);

    app.listen(PORT, () => {
      console.log(`🚀 API Taher escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ No se pudo iniciar el servidor:", err.message);
    process.exit(1);
  }
}

start();
