import { Router } from "express";

const router = Router();

/**
 * POST /api/auth/pin
 * Body: { pin: "1234" }
 * Valida el PIN de acceso a la app contra la variable de entorno APP_PIN.
 */
router.post("/pin", (req, res) => {
  const { pin } = req.body;
  const expected = process.env.APP_PIN || "1234";

  if (typeof pin !== "string" && typeof pin !== "number") {
    return res.status(400).json({ ok: false, message: "PIN requerido" });
  }

  if (String(pin) === String(expected)) {
    return res.json({ ok: true, message: "Acceso concedido" });
  }

  return res.status(401).json({ ok: false, message: "PIN incorrecto" });
});

export default router;
