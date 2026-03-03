import sharp from "sharp";
import fs from "fs";
import path from "path";

const INPUT_DIR = path.join(process.cwd(), "public/images/blog");
const OUTPUT_DIR = path.join(INPUT_DIR, "thumbs");
const WIDTH = 800;
const QUALITY = 75;

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(INPUT_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return [".jpeg", ".jpg", ".png", ".webp"].includes(ext);
  });

  console.log(`Found ${files.length} images to process`);

  for (const file of files) {
    const input = path.join(INPUT_DIR, file);
    const outName = file.replace(/\.(jpeg|jpg|png|webp)$/i, ".webp");
    const output = path.join(OUTPUT_DIR, outName);

    try {
      await sharp(input).resize(WIDTH).webp({ quality: QUALITY }).toFile(output);
      const inSize = fs.statSync(input).size;
      const outSize = fs.statSync(output).size;
      console.log(
        `  ${file} → thumbs/${outName} (${(inSize / 1024).toFixed(0)}KB → ${(outSize / 1024).toFixed(0)}KB)`
      );
    } catch (err) {
      console.error(`  Failed: ${file}`, err);
    }
  }

  console.log("Done");
}

main();
