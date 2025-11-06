import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const distPath = join(process.cwd(), 'dist');

// Removed legacy app.yml generation (replaced by root app.yaml in build-databricks.js)

// Copy JSON folder
const jsonSource = join(process.cwd(), 'JSON');
const jsonDest = join(distPath, 'JSON');
if (!existsSync(jsonDest)) {
  mkdirSync(jsonDest, { recursive: true });
}
if (existsSync(join(jsonSource, 'updated_bridge.json'))) {
  copyFileSync(
    join(jsonSource, 'updated_bridge.json'),
    join(jsonDest, 'updated_bridge.json')
  );
  console.log('✅ Copied updated_bridge.json');
}

// Copy images folder (for Tetrapack logo)
const imagesSource = join(process.cwd(), 'src', 'images');
const imagesDest = join(distPath, 'images');
const publicSource = join(process.cwd(), 'public');
if (!existsSync(imagesDest)) {
  mkdirSync(imagesDest, { recursive: true });
}
if (existsSync(join(imagesSource, 'Tetrapack.png'))) {
  // Copy to dist/images
  copyFileSync(
    join(imagesSource, 'Tetrapack.png'),
    join(imagesDest, 'Tetrapack.png')
  );
  console.log('✅ Copied Tetrapack.png to images folder');
  
  // Sync to public folder for development
  if (!existsSync(publicSource)) {
    mkdirSync(publicSource, { recursive: true });
  }
  copyFileSync(
    join(imagesSource, 'Tetrapack.png'),
    join(publicSource, 'Tetrapack.png')
  );
  console.log('✅ Synced Tetrapack.png to public folder');
  
  // Copy to dist root as well
  copyFileSync(
    join(imagesSource, 'Tetrapack.png'),
    join(distPath, 'Tetrapack.png')
  );
  console.log('✅ Copied Tetrapack.png to dist root');
  
  // Also copy as favicon.ico for browser compatibility
  copyFileSync(
    join(imagesSource, 'Tetrapack.png'),
    join(distPath, 'favicon.ico')
  );
  console.log('✅ Created favicon.ico from Tetrapack.png');
}

console.log('✅ Databricks asset copy complete (JSON, images).');
