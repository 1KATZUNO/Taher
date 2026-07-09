import "dotenv/config";
import mongoose from "mongoose";
import Joven from "./models/Joven.js";
import Config, { obtenerConfig } from "./models/Config.js";

const datos = [
  { nombreCompleto: "Mateo Rodríguez", edad: 19, ciudad: "Medellín", direccion: "Cra 45 #12-30", telefono: "55 1111 0001", genero: "masculino", whatsappConsent: true, salvo: true },
  { nombreCompleto: "Valentina Gómez", edad: 21, ciudad: "Bogotá", direccion: "Calle 80 #10-15", telefono: "55 1111 0002", genero: "femenino", whatsappConsent: true, salvo: true, reconciliacion: true },
  { nombreCompleto: "Santiago López", edad: 18, ciudad: "Cali", direccion: "Av 6N #23-11", telefono: "55 1111 0003", genero: "masculino", whatsappConsent: false },
  { nombreCompleto: "Isabella Martínez", edad: 23, ciudad: "Barranquilla", direccion: "Cra 51 #76-20", telefono: "55 1111 0004", genero: "femenino", whatsappConsent: true },
  { nombreCompleto: "Daniel Castro", edad: 20, ciudad: "Pereira", direccion: "Calle 14 #8-40", telefono: "55 1111 0005", genero: "masculino", whatsappConsent: true },
  { nombreCompleto: "Camila Torres", edad: 16, ciudad: "Medellín", direccion: "Cra 70 #44-12", telefono: "55 1111 0006", genero: "femenino", whatsappConsent: false, reconciliacion: true },
  { nombreCompleto: "Sebastián Ruiz", edad: 25, ciudad: "Bogotá", direccion: "Calle 100 #15-50", telefono: "55 1111 0007", genero: "masculino", whatsappConsent: true },
  { nombreCompleto: "Mariana Vargas", edad: 27, ciudad: "Cartagena", direccion: "Av San Martín #5-30", telefono: "55 1111 0008", genero: "femenino", whatsappConsent: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");
    await Joven.deleteMany({});
    console.log("🧹 Colección 'jovenes' limpiada");
    const creados = await Joven.insertMany(datos);
    console.log(`🌱 ${creados.length} jóvenes insertados`);

    // Siembra el PIN universal en la colección 'config'
    const pin = process.env.APP_PIN || "2207";
    await Config.updateOne(
      { clave: "global" },
      { $set: { pin } },
      { upsert: true }
    );
    const config = await obtenerConfig();
    console.log(`🔑 PIN universal sembrado en la BD: ${config.pin}`);
  } catch (err) {
    console.error("❌ Error al sembrar datos:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
