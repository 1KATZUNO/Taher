import { Router } from "express";
import Joven from "../models/Joven.js";

const router = Router();

/**
 * GET /api/stats
 * Devuelve las métricas que muestran las pantallas de Inicio y Estadísticas:
 *  - total de registrados
 *  - registrados hoy
 *  - distribución por género (hombres / mujeres)
 *  - distribución por rangos de edad
 *  - % de jóvenes que aceptaron contacto por WhatsApp
 */
router.get("/", async (req, res, next) => {
  try {
    const total = await Joven.countDocuments();

    // Registrados hoy
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const hoy = await Joven.countDocuments({ createdAt: { $gte: inicioDia } });

    // Por género
    const hombres = await Joven.countDocuments({ genero: "masculino" });
    const mujeres = await Joven.countDocuments({ genero: "femenino" });

    // % WhatsApp
    const conWhatsapp = await Joven.countDocuments({ whatsappConsent: true });
    const whatsappPct = total > 0 ? Math.round((conWhatsapp / total) * 100) : 0;

    // Distribución por edad (rangos)
    const rangos = [
      { etiqueta: "14-17", min: 14, max: 17 },
      { etiqueta: "18-21", min: 18, max: 21 },
      { etiqueta: "22-25", min: 22, max: 25 },
      { etiqueta: "26-30", min: 26, max: 30 },
    ];
    const distribucionEdad = await Promise.all(
      rangos.map(async (r) => ({
        etiqueta: r.etiqueta,
        cantidad: await Joven.countDocuments({
          edad: { $gte: r.min, $lte: r.max },
        }),
      }))
    );

    const hombresPct = total > 0 ? Math.round((hombres / total) * 100) : 0;

    res.json({
      total,
      hoy,
      genero: { hombres, mujeres, hombresPct },
      whatsapp: { cantidad: conWhatsapp, porcentaje: whatsappPct },
      distribucionEdad,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
