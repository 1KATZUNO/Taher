import { Router } from "express";
import Joven from "../models/Joven.js";

const router = Router();

/**
 * Agrupa por edad exacta con desglose por género.
 * Devuelve [{ edad, total, hombres, mujeres }] ordenado por edad.
 */
async function conteoPorEdad(match = {}) {
  const filas = await Joven.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$edad",
        total: { $sum: 1 },
        hombres: { $sum: { $cond: [{ $eq: ["$genero", "masculino"] }, 1, 0] } },
        mujeres: { $sum: { $cond: [{ $eq: ["$genero", "femenino"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return filas.map((f) => ({
    edad: f._id,
    total: f.total,
    hombres: f.hombres,
    mujeres: f.mujeres,
  }));
}

/**
 * GET /api/stats
 * Devuelve las métricas que muestran las pantallas de Inicio y Estadísticas:
 *  - total de registrados y registrados hoy
 *  - distribución por género (hombres / mujeres)
 *  - distribución por rangos de edad y por edad exacta (con género)
 *  - % de jóvenes que aceptaron contacto por WhatsApp
 *  - salvos: total, por género y por edad exacta (con género)
 *  - reconciliaciones: total
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

    // Conteo por edad exacta (todos) y salvos
    const porEdad = await conteoPorEdad();
    const salvosPorEdad = await conteoPorEdad({ salvo: true });
    const salvosTotal = salvosPorEdad.reduce((s, f) => s + f.total, 0);
    const salvosHombres = salvosPorEdad.reduce((s, f) => s + f.hombres, 0);
    const salvosMujeres = salvosPorEdad.reduce((s, f) => s + f.mujeres, 0);
    const reconciliaciones = await Joven.countDocuments({ reconciliacion: true });

    res.json({
      total,
      hoy,
      genero: { hombres, mujeres, hombresPct },
      whatsapp: { cantidad: conWhatsapp, porcentaje: whatsappPct },
      distribucionEdad,
      porEdad,
      salvos: {
        total: salvosTotal,
        porcentaje: total > 0 ? Math.round((salvosTotal / total) * 100) : 0,
        genero: { hombres: salvosHombres, mujeres: salvosMujeres },
        porEdad: salvosPorEdad,
      },
      reconciliaciones,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
