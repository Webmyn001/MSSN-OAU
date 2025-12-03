#!/usr/bin/env node

// Image optimization script
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticDir = join(__dirname, '..', 'static');
const outputDir = join(staticDir, 'optimized'); // All optimized images go here
const assetsDir = join(__dirname, '..', 'assets'); // Source for logo and icons

const quality = 80;
const logoWidth = 300; 
const iconSizes = [192, 512];

async function ensureDirectoryExists(directory) {
  try {
    await fs.access(directory);
  } catch (error) {
    // Log the error and create the directory
    console.log(`Directory ${directory} does not exist:`, error.code);
    await fs.mkdir(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

async function optimizeLogo() {
  const logoInputPath = join(assetsDir, 'images', 'logo.png'); 
  const logoOutputDir = join(outputDir, 'assets', 'images');
  const logoOutputPathWebP = join(logoOutputDir, 'logo.webp');

  if (!await ensureDirectoryExists(logoOutputDir)) return;

  if (await fs.access(logoInputPath) === 'ok') {
    try {
      await sharp(logoInputPath)
        .resize(logoWidth)
        .webp({ quality: quality + 10 > 100 ? 100 : quality + 10 })
        .toFile(logoOutputPathWebP);
      // Optionally, save an optimized PNG version as well if needed for fallback
      // const logoOutputPathPng = path.join(logoOutputDir, 'logo.png');
      // await sharp(logoInputPath)
      //     .resize(logoWidth)
      //     .png({ quality, progressive: true })
      //     .toFile(logoOutputPathPng);
    } catch (error) {
      console.error('Error optimizing logo:', error);
    }
  }
}

async function optimizeIcons() {
  const iconInputPath = join(assetsDir, 'icons', 'icon.png'); // Assuming a base icon.png
  const iconOutputDir = join(outputDir, 'assets', 'icons');

  if (!await ensureDirectoryExists(iconOutputDir)) return;

  if (await fs.access(iconInputPath) === 'ok') {
    try {
      for (const size of iconSizes) {
        const iconOutputPath = join(iconOutputDir, `icon-${size}x${size}.png`);
        await sharp(iconInputPath)
          .resize(size, size)
          .png({ quality, progressive: true })
          .toFile(iconOutputPath);
        
        // Optionally create WebP versions of icons too
        // const iconOutputPathWebP = path.join(iconOutputDir, `icon-${size}x${size}.webp`);
        // await sharp(iconInputPath)
        //     .resize(size, size)
        //     .webp({ quality })
        //     .toFile(iconOutputPathWebP);
      }
    } catch (error) {
      console.error('Error optimizing icons:', error);
    }
  }
}

async function optimizeImages() {
  console.log('Starting image optimization...');
  
  // Make sure the optimized directory exists
  await ensureDirectoryExists(outputDir);
  
  await optimizeLogo();
  await optimizeIcons();
}

optimizeImages(); 