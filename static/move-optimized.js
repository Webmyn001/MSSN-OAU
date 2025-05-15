#!/usr/bin/env node

// Move optimized images to replace the originals
import { fileURLToPath } from 'url';
import { dirname, join, relative } from 'path';
import fs from 'fs/promises';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function moveOptimizedImages() {
  console.log('Moving optimized images to replace originals...');
  
  const optimizedDir = join(__dirname, 'optimized');
  const staticDir = __dirname;
  
  try {
    // Ensure the optimized directory exists
    await fs.access(optimizedDir);
    
    // Function to recursively copy files
    async function copyFiles(source, destination) {
      const entries = await fs.readdir(source, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = join(source, entry.name);
        const destPath = join(destination, entry.name);
        
        if (entry.isDirectory()) {
          // Skip if directory is 'optimized' inside 'optimized'
          if (entry.name === 'optimized') continue;
          
          try {
            await fs.mkdir(destPath, { recursive: true });
          } catch (err) {
            if (err.code !== 'EEXIST') throw err;
          }
          
          // Recurse into subdirectory
          await copyFiles(srcPath, destPath);
        } else {
          try {
            // Copy the file, overwriting the original
            console.log(`Replacing: ${relative(optimizedDir, srcPath)}`);
            await fs.copyFile(srcPath, destPath);
          } catch (err) {
            console.error(`Error copying ${srcPath} to ${destPath}:`, err);
          }
        }
      }
    }
    
    // Start the copy process (will overwrite original files)
    await copyFiles(optimizedDir, staticDir);
    
    console.log('Successfully replaced original images with optimized versions.');
  } catch (error) {
    console.error('Error moving optimized images:', error);
  }
}

moveOptimizedImages(); 