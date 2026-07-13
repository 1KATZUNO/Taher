import { Router } from "express";
import ExcelJS from "exceljs";
import Joven from "../models/Joven.js";

const router = Router();

const AZUL = "FF0058BE";
const AZUL_CLARO = "FFD8E2FF";
const VERDE_CLARO = "FFE8F8F0";

function decisionDe(j) {
  if (j.salvo && j.reconciliacion) return "Salvo y Reconciliación";
  if (j.salvo) return "Salvo";
  if (j.reconciliacion) return "Reconciliación";
  return "—";
}

/**
 * Agrega a la hoja una tabla con título de sección y los jóvenes dados.
 */
function agregarSeccion(hoja, titulo, jovenes) {
  // Título de la sección
  const filaTitulo = hoja.addRow([titulo]);
  filaTitulo.font = { bold: true, size: 13, color: { argb: AZUL } };
  hoja.mergeCells(`A${filaTitulo.number}:F${filaTitulo.number}`);
  filaTitulo.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: AZUL_CLARO },
  };

  // Encabezados
  const encabezados = hoja.addRow([
    "Nombre",
    "Edad",
    "Lugar",
    "Dirección",
    "Decisión",
    "Teléfono",
  ]);
  encabezados.font = { bold: true, color: { argb: "FFFFFFFF" } };
  encabezados.eachCell((celda) => {
    celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: AZUL } };
    celda.border = { bottom: { style: "thin" } };
  });

  // Filas de datos
  jovenes.forEach((j, i) => {
    const fila = hoja.addRow([
      j.nombreCompleto,
      j.edad,
      j.ciudad || "Otro",
      j.direccion || "—",
      decisionDe(j),
      j.telefono || "—",
    ]);
    if (i % 2 === 1) {
      fila.eachCell((celda) => {
        celda.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF4F7FF" },
        };
      });
    }
    if (j.salvo) {
      fila.getCell(5).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: VERDE_CLARO },
      };
    }
  });

  // Total de la sección
  const filaTotal = hoja.addRow([`Total: ${jovenes.length}`]);
  filaTotal.font = { bold: true, italic: true, color: { argb: "FF424754" } };
  hoja.addRow([]); // separador
}

/**
 * Crea la hoja de un género con las dos secciones de edad.
 */
function hojaDeGenero(libro, nombre, jovenes) {
  const hoja = libro.addWorksheet(nombre);
  hoja.columns = [
    { width: 32 }, // Nombre
    { width: 8 },  // Edad
    { width: 14 }, // Lugar
    { width: 40 }, // Dirección
    { width: 24 }, // Decisión
    { width: 16 }, // Teléfono
  ];

  const ordenar = (arr) => [...arr].sort((a, b) => a.edad - b.edad || a.nombreCompleto.localeCompare(b.nombreCompleto));
  const ninos = ordenar(jovenes.filter((j) => j.edad <= 10));
  const grandes = ordenar(jovenes.filter((j) => j.edad >= 11));

  agregarSeccion(hoja, "De 2 a 10 años", ninos);
  agregarSeccion(hoja, "De 11 a 30+ años", grandes);
  return hoja;
}

/**
 * GET /api/export/excel
 * Descarga un .xlsx con hojas de Hombres y Mujeres, cada una dividida
 * en edades 2-10 y 11-30+, con nombre, lugar, dirección, decisión y teléfono.
 */
router.get("/excel", async (req, res, next) => {
  try {
    const jovenes = await Joven.find().sort({ createdAt: -1 });

    const libro = new ExcelJS.Workbook();
    libro.creator = "Taher";
    libro.created = new Date();

    hojaDeGenero(libro, "Hombres", jovenes.filter((j) => j.genero === "masculino"));
    hojaDeGenero(libro, "Mujeres", jovenes.filter((j) => j.genero === "femenino"));

    const fecha = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Taher_Jovenes_${fecha}.xlsx"`
    );
    await libro.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
});

export default router;
