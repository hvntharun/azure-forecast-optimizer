import { build } from 'vite';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

function copyRecursive(src, dest) {
  if (!existsSync(src)) return;
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    const st = statSync(s);
    if (st.isDirectory()) {
      copyRecursive(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

console.log('Building app for Databricks...');
await build();

const distPath = join(process.cwd(), 'dist');

// Ensure app.yaml spec exists (Lakehouse Apps expects .yaml)
const appSpecPath = join(process.cwd(), 'app.yaml');
if (!existsSync(appSpecPath)) {
  const spec = `name: azure-forecast-optimizer\ndescription: Azure cost forecasting & reservation insights\nentrypoint: dist/index.html\nruntime:\n  type: static\nartifacts:\n  - path: dist\n    include:\n      - index.html\n      - assets/**\n      - JSON/**\n      - favicon.ico\n      - Tetrapack.png\nversion: 1.0.0\n`; 
  writeFileSync(appSpecPath, spec);
  console.log('Created root app.yaml');
} else {
  console.log('Found existing app.yaml');
}

// Copy app.yaml into dist for convenience (optional)
copyFileSync(appSpecPath, join(distPath, 'app.yaml'));
console.log('Copied app.yaml into dist');

// Copy full JSON directory (all eligibility & forecast assets)
console.log('Copying JSON directory (all files)...');
copyRecursive(join(process.cwd(), 'JSON'), join(distPath, 'JSON'));
console.log('JSON directory copied');

console.log('✅ Databricks build complete. Deploy dist + app.yaml');

