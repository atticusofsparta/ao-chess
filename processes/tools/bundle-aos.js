import * as fs from 'fs';
import * as path from 'path';
import { bundle } from './lua-bundler.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function main() {
  const args = process.argv.slice(2); // Get CLI arguments
  if (args.length === 0) {
    console.error('Please provide a path name as a CLI argument.');
    return;
  }

  let pathToLua;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--path=')) {
      pathToLua = args[i].substring(7);
      break;
    }
  }

  if (!pathToLua) {
    console.error('Please provide a valid --path argument.');
    return;
  }

  console.log('Path to Lua:', pathToLua);
  const bundledLua = bundle(pathToLua);

  const entryDir = path.dirname(pathToLua); // Get the directory of the entry file
  const distDir = path.join(entryDir, 'dist'); // Create the dist directory in the entry file's directory

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  fs.writeFileSync(path.join(distDir, 'aos-bundled.lua'), bundledLua);
  console.log('Lua has been bundled!');
}

main();
