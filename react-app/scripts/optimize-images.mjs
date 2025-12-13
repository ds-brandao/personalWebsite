#!/usr/bin/env node
/**
 * Image Optimization Script
 *
 * This script generates optimized thumbnails and full-size images for articles.
 * - Thumbnails: Used in article list view (fast loading)
 * - Full images: Used in article modal (high quality)
 *
 * Output formats:
 * - WebP for modern browsers (best compression)
 * - JPEG fallback for compatibility
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  inputDir: path.join(__dirname, '../public/images/blog'),
  outputDir: path.join(__dirname, '../public/images/blog/optimized'),

  // Thumbnail settings (for article list)
  thumbnail: {
    width: 600,
    quality: 80,
    suffix: '-thumb'
  },

  // Full size optimized (for article modal)
  full: {
    width: 1920,
    quality: 85,
    suffix: '-full'
  }
};

// Supported input formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function getImageFiles(dir) {
  const files = await fs.readdir(dir);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  });
}

async function optimizeImage(inputPath, outputDir, filename) {
  const baseName = path.basename(filename, path.extname(filename));
  const results = [];

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Generate thumbnail WebP
    const thumbWebP = path.join(outputDir, `${baseName}${CONFIG.thumbnail.suffix}.webp`);
    await sharp(inputPath)
      .resize(CONFIG.thumbnail.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: CONFIG.thumbnail.quality })
      .toFile(thumbWebP);

    const thumbStats = await fs.stat(thumbWebP);
    results.push({ type: 'thumbnail-webp', path: thumbWebP, size: thumbStats.size });

    // Generate thumbnail JPEG (fallback)
    const thumbJpeg = path.join(outputDir, `${baseName}${CONFIG.thumbnail.suffix}.jpg`);
    await sharp(inputPath)
      .resize(CONFIG.thumbnail.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: CONFIG.thumbnail.quality, mozjpeg: true })
      .toFile(thumbJpeg);

    const thumbJpegStats = await fs.stat(thumbJpeg);
    results.push({ type: 'thumbnail-jpeg', path: thumbJpeg, size: thumbJpegStats.size });

    // Generate full-size optimized WebP
    const fullWebP = path.join(outputDir, `${baseName}${CONFIG.full.suffix}.webp`);
    await sharp(inputPath)
      .resize(CONFIG.full.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: CONFIG.full.quality })
      .toFile(fullWebP);

    const fullStats = await fs.stat(fullWebP);
    results.push({ type: 'full-webp', path: fullWebP, size: fullStats.size });

    // Generate full-size optimized JPEG (fallback)
    const fullJpeg = path.join(outputDir, `${baseName}${CONFIG.full.suffix}.jpg`);
    await sharp(inputPath)
      .resize(CONFIG.full.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: CONFIG.full.quality, mozjpeg: true })
      .toFile(fullJpeg);

    const fullJpegStats = await fs.stat(fullJpeg);
    results.push({ type: 'full-jpeg', path: fullJpeg, size: fullJpegStats.size });

    // Get original file size for comparison
    const originalStats = await fs.stat(inputPath);

    return {
      success: true,
      original: {
        path: inputPath,
        size: originalStats.size,
        width: metadata.width,
        height: metadata.height
      },
      outputs: results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      original: { path: inputPath }
    };
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  console.log('🖼️  Image Optimization Script\n');
  console.log('='.repeat(50));

  // Ensure output directory exists
  await ensureDir(CONFIG.outputDir);

  // Get all image files
  const images = await getImageFiles(CONFIG.inputDir);

  if (images.length === 0) {
    console.log('No images found to optimize.');
    return;
  }

  console.log(`Found ${images.length} images to optimize\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  const results = [];

  for (const filename of images) {
    const inputPath = path.join(CONFIG.inputDir, filename);
    console.log(`Processing: ${filename}`);

    const result = await optimizeImage(inputPath, CONFIG.outputDir, filename);
    results.push(result);

    if (result.success) {
      totalOriginal += result.original.size;

      // Sum up the smallest versions (WebP)
      const thumbSize = result.outputs.find(o => o.type === 'thumbnail-webp')?.size || 0;
      const fullSize = result.outputs.find(o => o.type === 'full-webp')?.size || 0;
      totalOptimized += thumbSize + fullSize;

      console.log(`  ✓ Original: ${formatSize(result.original.size)} (${result.original.width}x${result.original.height})`);
      result.outputs.forEach(output => {
        const savings = ((1 - output.size / result.original.size) * 100).toFixed(1);
        console.log(`  → ${output.type}: ${formatSize(output.size)} (${savings}% smaller)`);
      });
    } else {
      console.log(`  ✗ Error: ${result.error}`);
    }
    console.log('');
  }

  console.log('='.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   Total original size: ${formatSize(totalOriginal)}`);
  console.log(`   Total optimized (WebP): ${formatSize(totalOptimized)}`);
  console.log(`   Space saved: ${formatSize(totalOriginal - totalOptimized)} (${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`\n✅ Optimized images saved to: ${CONFIG.outputDir}`);
}

main().catch(console.error);
