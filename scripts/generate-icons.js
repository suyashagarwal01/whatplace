#!/usr/bin/env node
/**
 * Generates extension icons. Uses icons/icon-source.png if present, else icons/icon.svg.
 * Run: npm install && npm run generate-icons
 */
const path = require('path');
const fs = require('fs');

const iconsDir = path.join(__dirname, '..', 'icons');
const sourcePng = path.join(iconsDir, 'icon-source.png');
const svgPath = path.join(iconsDir, 'icon.svg');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Run: npm install');
    process.exit(1);
  }

  const sizes = [16, 48, 128];

  if (fs.existsSync(sourcePng)) {
    const input = sharp(sourcePng);
    for (const size of sizes) {
      await input
        .clone()
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon${size}.png`));
      console.log(`Created icons/icon${size}.png from icon-source.png`);
    }
  } else if (fs.existsSync(svgPath)) {
    const svg = fs.readFileSync(svgPath);
    for (const size of sizes) {
      await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon${size}.png`));
      console.log(`Created icons/icon${size}.png from icon.svg`);
    }
  } else {
    console.error('Put icons/icon-source.png (or icon.svg) in place, then run again.');
    process.exit(1);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
