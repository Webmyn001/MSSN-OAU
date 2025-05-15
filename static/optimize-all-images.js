#!/usr/bin/env node

// Optimize all images in the static directory
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

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

async function processImage(filePath, outputPath) {
  const ext = extname(filePath).toLowerCase();
  
  try {
    if (['.jpg', '.jpeg'].includes(ext)) {
      await sharp(filePath)
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(outputPath);
    } else if (ext === '.png') {
      await sharp(filePath)
        .png({ quality: 80, compressionLevel: 9, palette: true })
        .toFile(outputPath);
    } else if (ext === '.webp') {
      await sharp(filePath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);
    } else if (ext === '.svg') {
      // For SVG files, we'll use a simple copy for now
      await pipeline(
        createReadStream(filePath),
        createWriteStream(outputPath)
      );
    } else if (ext === '.gif') {
      // GIF optimization is limited with sharp
      await pipeline(
        createReadStream(filePath),
        createWriteStream(outputPath)
      );
    } else if (ext === '.avif') {
      await sharp(filePath)
        .avif({ quality: 80, effort: 9 })
        .toFile(outputPath);
    } else {
      console.log(`Skipping unsupported file type: ${ext}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function walkDir(dir, optimizedDir, originalBaseDir) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = join(dir, file.name);
      
      // Skip optimized directory to avoid recursive processing
      if (file.isDirectory() && file.name === 'optimized') {
        console.log(`Skipping optimized directory: ${filePath}`);
        continue;
      }
      
      // Create relative path from originalBaseDir
      const relPath = filePath.substring(originalBaseDir.length);
      const destPath = join(optimizedDir, relPath);
      
      if (file.isDirectory()) {
        // Create the corresponding directory in optimized folder
        await ensureDirectoryExists(destPath);
        await walkDir(filePath, optimizedDir, originalBaseDir);
      } else {
        // Skip already optimized files and non-image files
        const ext = extname(file.name).toLowerCase();
        const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'];
        
        if (validExts.includes(ext)) {
          console.log(`Optimizing: ${relPath}`);
          await ensureDirectoryExists(dirname(destPath));
          const success = await processImage(filePath, destPath);
          if (success) {
            console.log(`Optimized: ${relPath}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error walking directory:', err);
  }
}

async function optimizeAllImages() {
  console.log('Starting optimization of all images...');
  
  const staticDir = __dirname;
  const optimizedDir = join(staticDir, 'optimized');
  
  // Ensure optimized directory exists
  await ensureDirectoryExists(optimizedDir);
  
  // Start walking through directories
  await walkDir(staticDir, optimizedDir, staticDir);
  
  console.log('Image optimization complete. Optimized images are in the /static/optimized directory.');
}

optimizeAllImages(); 