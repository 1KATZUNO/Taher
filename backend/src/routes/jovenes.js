import { Router } from "express";
import mongoose from "mongoose";
import Joven from "../models/Joven.js";

const router = Router();

/**
 * GET /api/jovenes?search=texto
 * Lista los jóvenes registrados (más recientes primero).
 * Si viene ?search filtra por nombre o ciudad (case-insensitive).
 */
router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query;
    const filtro = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filtro.$or = [{ nombreCompleto: regex }, { ciudad: regex }];
    }
    const jovenes = await Joven.find(filtro).sort({ createdAt: -1 });
    res.json(jovenes);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/jovenes/:id  -> un joven por id
 */
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const joven = await Joven.findById(req.params.id);
    if (!joven) return res.status(404).json({ message: "Joven no encontrado" });
    res.json(joven);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/jovenes  -> crea un nuevo registro
 */
router.post("/", async (req, res, next) => {
  try {
    const joven = await Joven.create(req.body);
    res.status(201).json(joven);
  } catch (err) {
    if (err.name === "ValidationError") {
      const errores = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: "Datos inválidos", errores });
    }
    next(err);
  }
});

/**
 * PUT /api/jovenes/:id  -> actualiza un registro
 */
router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const joven = await Joven.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!joven) return res.status(404).json({ message: "Joven no encontrado" });
    res.json(joven);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/jovenes/:id  -> elimina un registro
 */
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID inválido" });
    }
    const joven = await Joven.findByIdAndDelete(req.params.id);
    if (!joven) return res.status(404).json({ message: "Joven no encontrado" });
    res.json({ ok: true, message: "Registro eliminado" });
  } catch (err) {
    next(err);
  }
});

export default router;
