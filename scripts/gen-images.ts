/**
 * Luxa (لوکسا) — e-commerce fashion image batch generator
 *
 * Generates hero banners, category tiles and product catalog images
 * for the Luxa Persian online store using the z-ai-web-dev-sdk
 * image generation API.
 *
 * Images are written sequentially (one at a time) to avoid rate limits.
 * Each image is retried up to 3 times. Failures are logged but do not
 * abort the batch — a final summary is printed at the end.
 *
 * NOTE on output format: the z-ai-web-dev-sdk images.generations endpoint
 * returns JPEG-encoded bytes via base64, but files are named `.png` to
 * match the task spec. To keep the file contents consistent with the
 * extension (and robust against `X-Content-Type-Options: nosniff`
 * deployments), every generated image is re-encoded to real PNG bytes
 * using `sharp` before being written to disk.
 *
 * Usage:
 *   bun /home/z/my-project/scripts/gen-images.ts
 */

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUTPUT_DIR = '/home/z/my-project/public/images';

/**
 * NOTE on hero banner size:
 * The task spec requested `1440x720` for hero banners. The z-ai-web-dev-sdk
 * type union lists `1440x720` as a valid size, but the underlying API rejects
 * it with HTTP 400 / error code 1214 because 720 is NOT a multiple of 32
 * (720 / 32 = 22.5). The API constraint is: both dimensions must be
 * 512–2880px, multiples of 32, and total pixels ≤ 2^22 (4,194,304).
 *
 * `1344x768` is the closest valid landscape size (1344=32×42, 768=32×24,
 * 1,032,192 px total) and has aspect ratio 1.75:1 vs the requested 2:1 —
 * visually near-identical for a hero banner.
 *
 * To honour the original request as much as possible while still producing
 * output, we attempt `1440x720` first and then automatically fall back to
 * `1344x768` on the size-validation error.
 */
type ImageSize = '1440x720' | '1344x768' | '1024x1024';

interface ImageJob {
  filename: string;
  prompt: string;
  size: ImageSize;
  /** Optional fallback used when the primary size is rejected by the API. */
  fallbackSize?: ImageSize;
}

const jobs: ImageJob[] = [
  // --- Hero banners (requested 1440x720; fallback 1344x768) ---
  {
    filename: 'hero-women.png',
    size: '1440x720',
    fallbackSize: '1344x768',
    prompt:
      "Elegant Persian woman wearing a stylish beige autumn trench coat and knit outfit, standing in a minimal modern studio with soft warm light, premium fashion editorial photography, full body, sophisticated, high-end e-commerce hero banner, lots of negative space on the left side",
  },
  {
    filename: 'hero-men.png',
    size: '1440x720',
    fallbackSize: '1344x768',
    prompt:
      "Stylish man in tailored charcoal overcoat and white shirt, modern minimalist studio, soft cinematic light, premium menswear editorial photography, full body, high-end e-commerce hero banner, negative space on the right",
  },
  {
    filename: 'hero-sale.png',
    size: '1440x720',
    fallbackSize: '1344x768',
    prompt:
      "Dramatic fashion sale campaign hero banner, elegant clothing on minimal hangers, moody dark charcoal background with soft spotlight, luxury retail aesthetic, premium editorial photography, wide banner composition with empty space",
  },

  // --- Category images (1024x1024) ---
  {
    filename: 'cat-coat.png',
    size: '1024x1024',
    prompt:
      "Folded elegant women's beige wool trench coat on minimal light gray background, premium product photography, soft studio lighting, top-down flat lay",
  },
  {
    filename: 'cat-sneakers.png',
    size: '1024x1024',
    prompt:
      "Pair of stylish white leather sneakers on minimal light background, premium product photography, soft studio shadow",
  },
  {
    filename: 'cat-watch.png',
    size: '1024x1024',
    prompt:
      "Luxury minimalist wristwatch with leather strap on clean light gray background, premium product photography, macro detail",
  },
  {
    filename: 'cat-sport.png',
    size: '1024x1024',
    prompt:
      "Folded modern athletic sportswear set in neutral tones on light background, premium product photography, flat lay",
  },
  {
    filename: 'cat-bag.png',
    size: '1024x1024',
    prompt:
      "Elegant tan leather handbag on minimal light background, premium product photography, soft studio lighting",
  },
  {
    filename: 'cat-jewelry.png',
    size: '1024x1024',
    prompt:
      "Delicate gold necklace and earrings on soft beige background, premium jewelry product photography, macro detail",
  },

  // --- Product images (1024x1024) ---
  {
    filename: 'p-wcoat.png',
    size: '1024x1024',
    prompt:
      "Women's beige wool trench coat on invisible ghost mannequin, pure white background, e-commerce catalog photography, even soft lighting, full garment visible",
  },
  {
    filename: 'p-wdress.png',
    size: '1024x1024',
    prompt:
      "Black elegant women's midi dress on ghost mannequin, pure white background, e-commerce catalog photography, soft even lighting",
  },
  {
    filename: 'p-wblouse.png',
    size: '1024x1024',
    prompt:
      "White silk women's blouse on ghost mannequin, pure white background, e-commerce catalog photography",
  },
  {
    filename: 'p-wheels.png',
    size: '1024x1024',
    prompt:
      "Beige suede women's high heel shoes, pair, on pure white background, e-commerce product photography, soft shadow",
  },
  {
    filename: 'p-sneaker-w.png',
    size: '1024x1024',
    prompt:
      "White and beige leather sneakers pair on pure white background, e-commerce product photography",
  },
  {
    filename: 'p-handbag.png',
    size: '1024x1024',
    prompt:
      "Tan leather crossbody handbag on pure white background, e-commerce product photography, soft shadow",
  },
  {
    filename: 'p-mshirt.png',
    size: '1024x1024',
    prompt:
      "Men's white cotton dress shirt on ghost mannequin, pure white background, e-commerce catalog photography",
  },
  {
    filename: 'p-mjacket.png',
    size: '1024x1024',
    prompt:
      "Men's dark denim jacket on ghost mannequin, pure white background, e-commerce catalog photography",
  },
  {
    filename: 'p-mshoes.png',
    size: '1024x1024',
    prompt:
      "Men's brown leather oxford shoes pair on pure white background, e-commerce product photography",
  },
  {
    filename: 'p-mwallet.png',
    size: '1024x1024',
    prompt:
      "Men's brown leather bifold wallet on pure white background, e-commerce product photography",
  },
  {
    filename: 'p-watch-gold.png',
    size: '1024x1024',
    prompt:
      "Luxury gold wristwatch with brown leather strap on pure white background, e-commerce product photography",
  },
  {
    filename: 'p-earrings.png',
    size: '1024x1024',
    prompt:
      "Gold hoop earrings on pure white background, e-commerce jewelry product photography",
  },
  {
    filename: 'p-kdress.png',
    size: '1024x1024',
    prompt:
      "Children's floral summer dress on ghost mannequin, pure white background, e-commerce catalog photography",
  },
  {
    filename: 'p-belt.png',
    size: '1024x1024',
    prompt:
      "Men's black leather belt coiled on pure white background, e-commerce product photography",
  },
];

const MAX_RETRIES = 3;
// Small delay between requests to be gentle on the API rate limits.
const INTER_REQUEST_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fmtError(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

async function generateOne(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  job: ImageJob,
): Promise<
  | { ok: true; bytes: number; skipped: boolean }
  | { ok: false; error: string }
> {
  const outPath = path.join(OUTPUT_DIR, job.filename);

  // Resume / idempotency: skip files that already exist and are non-empty.
  if (fs.existsSync(outPath)) {
    const stat = fs.statSync(outPath);
    if (stat.size > 0) {
      return { ok: true, bytes: stat.size, skipped: true };
    }
  }

  let lastError: string | null = null;

  // The size actually used for the current attempt. Starts at the primary
  // size; if the API rejects it with the size-validation error (code 1214 /
  // "为32整数倍"), we switch to the fallback size for all subsequent attempts.
  let currentSize: ImageSize = job.size;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await zai.images.generations.create({
        prompt: job.prompt,
        size: currentSize,
      });

      const b64 = response?.data?.[0]?.base64;
      if (!b64 || typeof b64 !== 'string') {
        throw new Error(
          'API returned no image data (response.data[0].base64 was empty)',
        );
      }

      const buffer = Buffer.from(b64, 'base64');
      if (buffer.length === 0) {
        throw new Error('Decoded image buffer is empty');
      }

      // Re-encode to actual PNG so the bytes match the .png extension.
      // The API returns JPEG bytes even though the SDK type suggests PNG;
      // this conversion makes the files robust to strict content-type
      // enforcement and avoids any "JPEG-in-.png" mismatch.
      const pngBuffer = await sharp(buffer).png().toBuffer();
      if (pngBuffer.length === 0) {
        throw new Error('sharp produced an empty PNG buffer');
      }

      fs.writeFileSync(outPath, pngBuffer);
      return { ok: true, bytes: pngBuffer.length, skipped: false };
    } catch (err) {
      lastError = fmtError(err);
      console.warn(
        `  ! [${attempt}/${MAX_RETRIES}] failed "${job.filename}" (size=${currentSize}): ${lastError}`,
      );

      // If the error is the API size-validation rejection and we have a
      // fallback configured, switch the size now so the next retry uses it.
      if (
        job.fallbackSize &&
        currentSize !== job.fallbackSize &&
        /1214|32整数倍|multiple of 32|size/i.test(lastError)
      ) {
        console.warn(
          `  ↻ switching "${job.filename}" to fallback size ${job.fallbackSize}`,
        );
        currentSize = job.fallbackSize;
      }

      // Brief backoff before retrying.
      await sleep(1000 * attempt);
    }
  }

  return { ok: false, error: lastError ?? 'unknown error' };
}

async function main(): Promise<void> {
  // Ensure output directory exists.
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('========================================');
  console.log(' Luxa e-commerce image batch generator');
  console.log('========================================');
  console.log(`Output directory : ${OUTPUT_DIR}`);
  console.log(`Total images     : ${jobs.length}`);
  console.log(`Max retries      : ${MAX_RETRIES}`);
  console.log(`Inter-req delay  : ${INTER_REQUEST_DELAY_MS}ms`);
  console.log('');

  console.log('Initializing ZAI SDK…');
  const zai = await ZAI.create();
  console.log('SDK ready.\n');

  const succeeded: { filename: string; bytes: number }[] = [];
  const skipped: { filename: string; bytes: number }[] = [];
  const failed: { filename: string; error: string }[] = [];

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const progress = `[${i + 1}/${jobs.length}]`;
    console.log(`${progress} Generating ${job.filename} (${job.size})…`);

    const result = await generateOne(zai, job);
    if (result.ok) {
      if (result.skipped) {
        console.log(`  ↻ skipped ${job.filename}  (already exists, ${result.bytes} bytes)`);
        skipped.push({ filename: job.filename, bytes: result.bytes });
      } else {
        console.log(`  ✓ generated ${job.filename}  (${result.bytes} bytes)`);
        succeeded.push({ filename: job.filename, bytes: result.bytes });
      }
    } else {
      console.error(`  ✗ FAILED ${job.filename} after ${MAX_RETRIES} retries: ${result.error}`);
      failed.push({ filename: job.filename, error: result.error });
    }

    // Polite delay between sequential requests (skip after the last one).
    if (i < jobs.length - 1) {
      await sleep(INTER_REQUEST_DELAY_MS);
    }
  }

  console.log('\n========================================');
  console.log(' Batch Summary');
  console.log('========================================');
  console.log(`Total   : ${jobs.length}`);
  console.log(`Success : ${succeeded.length}`);
  console.log(`Skipped : ${skipped.length} (already existed)`);
  console.log(`Failed  : ${failed.length}`);
  console.log(`New + skipped = ${succeeded.length + skipped.length} of ${jobs.length} files now present.`);

  if (failed.length > 0) {
    console.log('\nFailed files:');
    for (const f of failed) {
      console.log(`  - ${f.filename}  (${f.error})`);
    }
  } else {
    console.log('\nAll images generated successfully. 🎉');
  }

  // Final list of successfully generated files.
  console.log('\nFiles now present in /images/:');
  for (const s of succeeded) {
    console.log(`  /images/${s.filename}  (new, ${s.bytes} bytes)`);
  }
  for (const s of skipped) {
    console.log(`  /images/${s.filename}  (pre-existing, ${s.bytes} bytes)`);
  }
}

main().catch((err) => {
  console.error('Fatal error in batch generator:', fmtError(err));
  process.exit(1);
});
