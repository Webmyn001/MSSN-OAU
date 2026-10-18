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

const staticDir = join(__dirname, '..', 'static');
const inputDir = staticDir; // Process images directly in /static
const outputDir = join(staticDir, 'optimized');
const quality = 80;
const maxWidth = 1200; // Max width for general images
const logoWidth = 300;   // Max width for logos

// Ensure output directory exists
function ensureDirectoryExistence(filePath) {
    const directory = dirname(filePath);
    if (fs.existsSync(directory)) {
        return true;
    }
    try {
        fs.mkdirSync(directory, { recursive: true });
    } catch (error) { 
        // console.error(`Failed to create directory ${directory}:`, error); // Optionally log critical errors
        return false;
    }
    return true;
}

async function optimizeImage(filePath, relativePath) {
    const outputPath = join(outputDir, relativePath);
    if (!ensureDirectoryExistence(outputPath)) {
        // console.error(`Could not ensure directory for ${outputPath}. Skipping optimization.`); // Optionally log
        return;
    }

    const ext = extname(filePath).toLowerCase();
    let image = sharp(filePath);
    const metadata = await image.metadata();

    let currentWidth = metadata.width;
    const effectiveMaxWidth = relativePath.includes('logo') ? logoWidth : maxWidth;

    if (currentWidth > effectiveMaxWidth) {
        image = image.resize({ width: effectiveMaxWidth });
    }

    try {
        if (ext === '.png') {
            await image.webp({ quality: quality + 5 > 100 ? 100 : quality + 5 }).toFile(outputPath.replace(/\.png$/i, '.webp'));
        } else if (ext === '.jpg' || ext === '.jpeg') {
            await image.jpeg({ quality, progressive: true, mozjpeg: true }).toFile(outputPath);
        } else if (ext === '.gif') {
            await image.webp({ quality }).toFile(outputPath.replace(/\.gif$/i, '.webp')); 
        } else {
            return;
        }
    } catch (err) {
        console.error(`Error optimizing ${relativePath}: ${err.message}`);
    }
}

async function processDirectory(directory, baseDir = directory) {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(directory, entry.name);
        const relativePath = join(baseDir, fullPath).substring(baseDir.length + 1);

        if (entry.isDirectory()) {
            if (fullPath === outputDir) {
                continue;
            }
            await processDirectory(fullPath, baseDir);
        } else if (['.png', '.jpg', '.jpeg', '.gif'].includes(extname(entry.name).toLowerCase())) {
            try {
                await optimizeImage(fullPath, relativePath);
            } catch (err) {
                console.error(`Failed to process ${relativePath}: ${err.message}`);
            }
        }
    }
}

async function optimizeAllImages() {
  console.log('Starting optimization of all images...');
  
  // Ensure optimized directory exists
  ensureDirectoryExistence(outputDir);
  
  // Start walking through directories
  await processDirectory(inputDir);
  
  console.log('Image optimization complete. Optimized images are in the /static/optimized directory.');
}

optimizeAllImages(); 