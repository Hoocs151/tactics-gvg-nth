import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
  try {
    const gold = "#d4a847";
    const dark = "#080810";

    const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
      <rect width="192" height="192" fill="${dark}"/>
      <circle cx="96" cy="96" r="78" fill="#12141f" stroke="${gold}" stroke-width="3"/>
      <circle cx="96" cy="96" r="50" fill="${gold}"/>
      <text x="96" y="110" font-family="serif" font-size="44" font-weight="bold" fill="${dark}" text-anchor="middle">BL</text>
    </svg>`;

    const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="${dark}"/>
      <circle cx="256" cy="256" r="208" fill="#12141f" stroke="${gold}" stroke-width="6"/>
      <circle cx="256" cy="256" r="135" fill="${gold}"/>
      <text x="256" y="285" font-family="serif" font-size="120" font-weight="bold" fill="${dark}" text-anchor="middle">BL</text>
    </svg>`;

    const iconsDir = path.join(__dirname, "..", "public", "icons");
    if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

    // Generate icons sequentially to avoid potential issues
    await sharp(Buffer.from(svg192)).png().toFile(path.join(iconsDir, "icon-192.png"));
    await sharp(Buffer.from(svg512)).png().toFile(path.join(iconsDir, "icon-512.png"));

    const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="${dark}"/>
      <circle cx="256" cy="256" r="185" fill="#12141f" stroke="${gold}" stroke-width="6"/>
      <circle cx="256" cy="256" r="115" fill="${gold}"/>
      <text x="256" y="248" font-family="serif" font-size="100" font-weight="bold" fill="${dark}" text-anchor="middle">BL</text>
    </svg>`;
    await sharp(Buffer.from(svgMaskable)).png().toFile(path.join(iconsDir, "maskable-512.png"));

    console.log("✅ PWA icons generated successfully!");
  } catch (error) {
    console.error("❌ Error generating icons:", error);
    // Don't throw - allow build to continue even if icon generation fails
  }
}

generateIcons();
