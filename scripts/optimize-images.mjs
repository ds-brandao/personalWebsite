#!/usr/bin/env node
/**
 * Image Optimization Script
 *
 * Generates optimized thumbnails for article list view.
 * - Thumbnails: 600px wide, compressed JPEG (quality 80)
 * - Original images kept for full article view
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, parse } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGES_DIR = join(__dirname, '..', 'images', 'blog');
const THUMBNAILS_DIR = join(__dirname, '..', 'images', 'blog', 'thumbnails');

// Thumbnail settings
const THUMBNAIL_WIDTH = 600;
const THUMBNAIL_QUALITY = 80;

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function optimizeImage(filename) {
  const inputPath = join(IMAGES_DIR, filename);
  const { name } = parse(filename);
  const outputPath = join(THUMBNAILS_DIR, `${name}-thumb.webp`);

  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`Processing: ${filename} (${metadata.width}x${metadata.height})`);

    await sharp(inputPath)
      .resize(THUMBNAIL_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toFile(outputPath);

    const thumbMeta = await sharp(outputPath).metadata();
    console.log(`  -> Created: ${name}-thumb.webp (${thumbMeta.width}x${thumbMeta.height})`);

    return { original: filename, thumbnail: `${name}-thumb.webp` };
  } catch (err) {
    console.error(`  Error processing ${filename}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('Image Optimization Script');
  console.log('=========================\n');

  // Ensure thumbnails directory exists
  await ensureDir(THUMBNAILS_DIR);

  // Get all image files (excluding thumbnails directory)
  const files = await readdir(IMAGES_DIR);
  const imageFiles = files.filter(f =>
    /\.(jpe?g|png|webp)$/i.test(f) && !f.includes('-thumb')
  );

  console.log(`Found ${imageFiles.length} images to process\n`);

  const results = [];
  for (const file of imageFiles) {
    const result = await optimizeImage(file);
    if (result) results.push(result);
  }

  console.log('\n=========================');
  console.log(`Processed ${results.length} images successfully`);
  console.log('\nThumbnail mapping:');
  results.forEach(r => {
    console.log(`  ${r.original} -> thumbnails/${r.thumbnail}`);
  });
}

main().catch(console.error);
