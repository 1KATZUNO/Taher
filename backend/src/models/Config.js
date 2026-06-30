import mongoose from "mongoose";

/**
 * Configuración global de la app, guardada en la BD.
 * Usamos una clave fija ("global") para que siempre exista un único documento.
 */
const configSchema = new mongoose.Schema(
  {
    clave: {
      type: String,
      default: "global",
      unique: true,
    },
    pin: {
      type: String,
      required: true,
      default: "2207",
    },
  },
  {
    timestamps: true,
    collection: "config",
  }
);

const Config = mongoose.model("Config", configSchema);

/**
 * Devuelve el documento de configuración, creándolo si no existe.
 * El PIN inicial se toma de APP_PIN (.env) o "2207" por defecto.
 */
export async function obtenerConfig() {
  let config = await Config.findOne({ clave: "global" });
  if (!config) {
    config = await Config.create({
      clave: "global",
      pin: process.env.APP_PIN || "2207",
    });
  }
  return config;
}

export default Config;
