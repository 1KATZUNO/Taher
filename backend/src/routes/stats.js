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
      { etiqueta: "5-7", min: 5, max: 7 },
      { etiqueta: "8-10", min: 8, max: 10 },
      { etiqueta: "11-15", min: 11, max: 15 },
      { etiqueta: "16-25", min: 16, max: 25 },
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
