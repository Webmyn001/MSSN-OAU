#!/usr/bin/env node

// Move optimized images to replace the originals
import { fileURLToPath } from 'url';
import { dirname, join, relative } from 'path';
import fs from 'fs/promises';
import path from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const optimizedDir = path.join(__dirname, 'static', 'optimized');
const originalsDir = path.join(__dirname, 'static'); 
// This assumes you want to move them to the root of /static, effectively replacing them.
// If your originals are elsewhere (e.g., /assets/images), adjust originalsDir accordingly.
// For example: const originalsDir = path.join(__dirname, 'assets', 'images');

async function moveOptimizedImages() {
  console.log('Moving optimized images to replace originals...');
  
  try {
    await fs.ensureDir(originalsDir);

    const files = await fs.readdir(optimizedDir);

    const movePromises = files.map(async (file) => {
      const srcPath = path.join(optimizedDir, file);
      let destPath = path.join(originalsDir, file);

      // If the optimized file is WebP, and you want to replace a non-WebP original (e.g., .png, .jpg)
      // you might need to change the destination filename.
      if (path.extname(file).toLowerCase() === '.webp') {
        const baseName = file.substring(0, file.lastIndexOf('.'));
        // Example: if you want to replace image.png with image.webp, but keep it named image.png for compatibility
        // This example just moves it as image.webp. Adjust if needed.
        // destPath = path.join(originalsDir, baseName + path.extname(file)); // Keeps .webp
        // Or, if you intend to replace common formats and rename to that format (not recommended for WebP)
        // destPath = path.join(originalsDir, baseName + '.png'); // Example: Renames optimized.webp to optimized.png
      }
      
      await fs.copy(srcPath, destPath, { overwrite: true });
    });

    await Promise.all(movePromises);

    console.log('Successfully replaced original images with optimized versions.');
  } catch (error) {
    console.error('Error moving optimized images:', error);
    process.exit(1);
  }
}

moveOptimizedImages(); 