const fs = require('fs');
const path = require('path');
const modelsPath = 'c:/Users/krish/OneDrive/Desktop/Connect-final/backend/models';
const files = fs.readdirSync(modelsPath).filter(f => f.endsWith('.js'));
for (const file of files) {
  const filePath = path.join(modelsPath, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  if (content.includes("require('./BaseUser')")) {
    content = content.replace(/const\s+BaseUser\s*=\s*require\('\.\/BaseUser'\);/g, "import BaseUser from './BaseUser.js';");
    changed = true;
  }
  if (content.match(/ref:\s*(['"])User\1/g)) {
    content = content.replace(/ref:\s*(['"])User\1/g, 'ref: $1BaseUser$1');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', file);
  }
}
