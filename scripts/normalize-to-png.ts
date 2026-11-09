/**
 * One-shot normalizer: re-encodes every *.png file in /public/images so that
 * the file contents are actual PNG bytes (matching the .png extension).
 *
 * The z-ai-web-dev-sdk images.generations endpoint returns JPEG-encoded bytes
 * via base64, even though the task spec assumed PNG. Browsers usually sniff
 * and render JPEG-in-.png fine, but to be robust against
 * `X-Content-Type-Options: nosniff` deployments we re-encode the bytes to
 * real PNG using sharp (already a project dependency).
 *
 * Run once after gen-images.ts:
 *   bun /home/z/my-project/scripts/normalize-to-png.ts
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const DIR = '/home/z/my-project/public/images';

async function main(): Promise<void> {
  const files = fs
    .readdirSync(DIR)
    .filter((f) => f.toLowerCase().endsWith('.png'));

  console.log(`Normalizing ${files.length} files in ${DIR}`);
  let converted = 0;
  let skipped = 0;

  for (const f of files) {
    const full = path.join(DIR, f);
    const before = fs.statSync(full).size;

    // Read bytes, decode with sharp (auto-detects format), re-encode as PNG.
    const pngBuf = await sharp(full).png().toBuffer();

    // Only overwrite if the resulting PNG is valid and non-trivial.
    if (pngBuf.length === 0) {
      console.warn(`  ! skipping ${f}: sharp produced empty buffer`);
      skipped++;
      continue;
    }

    fs.writeFileSync(full, pngBuf);
    const after = pngBuf.length;
    console.log(`  ✓ ${f}  JPEG(${before}B) -> PNG(${after}B)`);
    converted++;
  }

  console.log(`\nDone. Converted: ${converted}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
