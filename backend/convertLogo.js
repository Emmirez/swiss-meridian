import sharp from "sharp";
import path from "path";

const inputPath = path.join(process.cwd(), "assets", "logo.png");
const outputPath = path.join(process.cwd(), "assets", "logo-converted.png");

sharp(inputPath)
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log("Converted successfully! New file: assets/logo-converted.png");
  })
  .catch((err) => {
    console.error("Conversion failed:", err.message);
  });