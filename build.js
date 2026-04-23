/**
 * build.js — injects API keys from .env.local into the extension
 *
 * Usage:
 *   node build.js
 *
 * Reads:  .env.local  (gitignored — never committed)
 * Input:  extension/background.template.js
 * Output: extension/background.js  (gitignored — never committed)
 */

const fs   = require('fs');
const path = require('path');

// ── Parse .env.local ─────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌  .env.local not found. Copy .env.example to .env.local and fill in your keys.');
  process.exit(1);
}

const env = {};
fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach(line => {
    const [key, ...rest] = line.trim().split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
  });

// ── Validate ─────────────────────────────────────────────────────────────────
const required = ['CLAUDE_API_KEY', 'BRAVE_API_KEY'];
const missing  = required.filter(k => !env[k]);
if (missing.length) {
  console.error(`❌  Missing keys in .env.local: ${missing.join(', ')}`);
  process.exit(1);
}

// ── Inject & write ────────────────────────────────────────────────────────────
const templatePath = path.join(__dirname, 'extension', 'background.template.js');
const outputPath   = path.join(__dirname, 'extension', 'background.js');

let src = fs.readFileSync(templatePath, 'utf8');
src = src.replace(/__CLAUDE_API_KEY__/g, env.CLAUDE_API_KEY);
src = src.replace(/__BRAVE_API_KEY__/g,  env.BRAVE_API_KEY);

fs.writeFileSync(outputPath, src, 'utf8');
console.log('✅  extension/background.js built from .env.local');
