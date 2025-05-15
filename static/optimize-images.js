#!/usr/bin/env node

// Image optimization script
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function optimizeImages() {
  console.log('Starting image optimization...');
  
  // Make sure the optimized directory exists
  const optimizedDir = join(__dirname, 'images', 'optimized');
  await ensureDirectoryExists(optimizedDir);
  
  // Optimize logo
  try {
    // Create WebP version of the logo
    await sharp(join(__dirname, 'mssn-logo.png'))
      .resize({
        width: 240, // Half the original size
        height: 45,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 80, effort: 6 })
      .toFile(join(__dirname, 'mssn-logo.webp'));
    
    // Create a 2x version for high-DPI screens
    await sharp(join(__dirname, 'mssn-logo.png'))
      .resize({
        width: 480,
        height: 90,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 80, effort: 6 })
      .toFile(join(__dirname, 'mssn-logo@2x.webp'));
    
    console.log('Logo optimized and converted to WebP');
    
    // Optimize favicons and other icons
    await sharp(join(__dirname, 'android-chrome-512x512.png'))
      .resize({ width: 512, height: 512 })
      .png({ quality: 80, compressionLevel: 9, palette: true })
      .toFile(join(__dirname, 'android-chrome-512x512-optimized.png'));
    
    await sharp(join(__dirname, 'android-chrome-192x192.png'))
      .resize({ width: 192, height: 192 })
      .png({ quality: 80, compressionLevel: 9, palette: true })
      .toFile(join(__dirname, 'android-chrome-192x192-optimized.png'));
    
    await sharp(join(__dirname, 'apple-touch-icon.png'))
      .resize({ width: 180, height: 180 })
      .png({ quality: 80, compressionLevel: 9, palette: true })
      .toFile(join(__dirname, 'apple-touch-icon-optimized.png'));
    
    console.log('Icons optimized');
    
  } catch (error) {
    console.error('Error optimizing images:', error);
  }
}

optimizeImages(); 