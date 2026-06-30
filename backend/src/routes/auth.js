import { Router } from "express";
import { obtenerConfig } from "../models/Config.js";

const router = Router();

/**
 * POST /api/auth/pin
 * Body: { pin: "2207" }
 * Valida el PIN universal de acceso contra el valor guardado en la BD (colección 'config').
 */
router.post("/pin", async (req, res, next) => {
  try {
    const { pin } = req.body;

    if (typeof pin !== "string" && typeof pin !== "number") {
      return res.status(400).json({ ok: false, message: "PIN requerido" });
    }

    const config = await obtenerConfig();

    if (String(pin) === String(config.pin)) {
      return res.json({ ok: true, message: "Acceso concedido" });
    }

    return res.status(401).json({ ok: false, message: "PIN incorrecto" });
  } catch (err) {
    next(err);
  }
});

export default router;
