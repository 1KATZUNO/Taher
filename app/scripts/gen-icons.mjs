/**
 * Genera todos los assets de icono de la app a partir de un logo PNG.
 *
 * Uso:
 *   node scripts/gen-icons.mjs <ruta-al-logo.png>
 *
 * El logo de origen puede traer un fondo gris claro / cuadriculado horneado
 * (sin transparencia real): este script lo elimina (key de gris claro) y deja
 * el escudo sobre fondo blanco (icono) o transparente (adaptive foreground).
 *
 * Produce, dentro de ./assets:
 *   - icon.png                      (1024x1024, icono principal, fondo blanco)
 *   - splash-icon.png               (1024x1024, pantalla de carga)
 *   - favicon.png                   (48x48, web)
 *   - android-icon-foreground.png   (1024x1024 con padding seguro, fondo transparente)
 *   - android-icon-background.png   (1024x1024 fondo blanco)
 *   - android-icon-monochrome.png   (1024x1024 silueta negra, themed icon)
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = join(__dirname, "..", "assets");

const src = process.argv[2];
if (!src) {
  console.error("❌ Falta la ruta del logo. Uso: node scripts/gen-icons.mjs <logo.png>");
  process.exit(1);
}
const srcPath = resolve(src);
if (!existsSync(srcPath)) {
  console.error(`❌ No existe el archivo: ${srcPath}`);
  process.exit(1);
}

const BLANCO = { r: 255, g: 255, b: 255, alpha: 1 };

/**
 * Devuelve un PNG 1024x1024 con el fondo gris/blanco claro convertido a
 * transparente. Un pixel se considera fondo si es casi acromático
 * (poca diferencia entre canales) y muy claro.
 */
async function recortarFondo() {
  const SIZE = 1024;
  const { data, info } = await sharp(srcPath)
    .resize(SIZE, SIZE, { fit: "contain", background: BLANCO })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const ch = info.channels; // 4
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const acromatico = max - min <= 16; // gris (poca saturación)
    const claro = min >= 220; // muy claro
    if (acromatico && claro) {
      data[i + 3] = 0; // fondo -> transparente
    }
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: ch } })
    .png()
    .toBuffer();
}

async function main() {
  const cutout = await recortarFondo(); // escudo con fondo transparente

  // icon.png principal: escudo sobre blanco puro
  await sharp(cutout).flatten({ background: BLANCO }).png().toFile(join(ASSETS, "icon.png"));

  // splash: escudo centrado con margen sobre blanco
  const logoChico = await sharp(cutout)
    .resize(620, 620, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BLANCO } })
    .composite([{ input: logoChico, gravity: "center" }])
    .flatten({ background: BLANCO })
    .png()
    .toFile(join(ASSETS, "splash-icon.png"));

  // favicon
  await sharp(cutout).flatten({ background: BLANCO }).resize(48, 48).png().toFile(join(ASSETS, "favicon.png"));

  // adaptive foreground: escudo transparente con padding seguro (~64%)
  const fg = await sharp(cutout)
    .resize(660, 660, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: fg, gravity: "center" }])
    .png()
    .toFile(join(ASSETS, "android-icon-foreground.png"));

  // adaptive background: blanco sólido
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: BLANCO } })
    .png()
    .toFile(join(ASSETS, "android-icon-background.png"));

  // monochrome (themed icon): silueta negra a partir del alfa del recorte
  const { data: fgData, info: fgInfo } = await sharp(fg)
    .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < fgData.length; i += fgInfo.channels) {
    fgData[i] = 0;
    fgData[i + 1] = 0;
    fgData[i + 2] = 0;
  }
  await sharp(fgData, { raw: { width: fgInfo.width, height: fgInfo.height, channels: fgInfo.channels } })
    .png()
    .toFile(join(ASSETS, "android-icon-monochrome.png"));

  console.log("✅ Iconos generados (fondo recortado) en ./assets desde:", srcPath);
}

main().catch((e) => {
  console.error("❌ Error generando iconos:", e.message);
  process.exit(1);
});
