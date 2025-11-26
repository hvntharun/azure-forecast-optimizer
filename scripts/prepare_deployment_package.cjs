// This file was renamed from prepare_deployment_package.js to prepare_deployment_package.cjs
const fs = require('fs');
const path = require('path');

const original = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const minimal = {
  name: original.name,
  version: original.version,
  type: original.type,
  private: original.private,
  scripts: {
    start: original.scripts.start
  },
  dependencies: original.dependencies
};
fs.writeFileSync(path.join(__dirname, '../package.deploy.json'), JSON.stringify(minimal, null, 2));
console.log('Minimal deployment package.json generated as package.deploy.json');