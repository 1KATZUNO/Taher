/**
 * Genera todos los assets de icono de la app a partir de un logo PNG.
 *
 * Uso:
 *   node scripts/gen-icons.mjs <ruta-al-logo.png>
 *
 * Produce, dentro de ./assets:
 *   - icon.png                      (1024x1024, icono principal)
 *   - splash-icon.png               (1024x1024, pantalla de carga)
 *   - favicon.png                   (48x48, web)
 *   - android-icon-foreground.png   (1024x1024 con padding seguro para adaptive icon)
 *   - android-icon-background.png   (1024x1024 fondo blanco)
 *   - android-icon-monochrome.png   (1024x1024 silueta, themed icon)
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

async function main() {
  // Logo recortado a cuadrado, sobre fondo blanco
  const base = await sharp(srcPath)
    .resize(1024, 1024, { fit: "contain", background: BLANCO })
    .flatten({ background: BLANCO })
    .png()
    .toBuffer();

  // icon.png principal
  await sharp(base).toFile(join(ASSETS, "icon.png"));

  // splash (logo centrado con margen sobre blanco)
  const logoChico = await sharp(srcPath)
    .resize(620, 620, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: BLANCO },
  })
    .composite([{ input: logoChico, gravity: "center" }])
    .png()
    .toFile(join(ASSETS, "splash-icon.png"));

  // favicon
  await sharp(base).resize(48, 48).toFile(join(ASSETS, "favicon.png"));

  // adaptive icon foreground: logo con padding seguro (zona central ~66%)
  const fgLogo = await sharp(srcPath)
    .resize(660, 660, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: fgLogo, gravity: "center" }])
    .png()
    .toFile(join(ASSETS, "android-icon-foreground.png"));

  // adaptive icon background: blanco sólido
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: BLANCO },
  })
    .png()
    .toFile(join(ASSETS, "android-icon-background.png"));

  // monochrome (themed icon): silueta del logo en negro sobre transparente
  await sharp(fgLogo)
    .extend({ top: 182, bottom: 182, left: 182, right: 182, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(1024, 1024)
    .toFile(join(ASSETS, "android-icon-monochrome.png"));

  console.log("✅ Iconos generados en ./assets desde:", srcPath);
}

main().catch((e) => {
  console.error("❌ Error generando iconos:", e.message);
  process.exit(1);
});
