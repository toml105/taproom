// Generates the PWA / home-screen icons from an inline SVG of the TAPROOM pint.
// Run: node scripts/gen-icons.mjs  (requires sharp)
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'

const BG = '#17110C'

/** Build the icon SVG. contentScale leaves a safe zone for maskable icons. */
function buildSvg(contentScale) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="glow" cx="50%" cy="40%" r="58%">
      <stop offset="0%" stop-color="#FFC857" stop-opacity="0.55"/>
      <stop offset="45%" stop-color="#FFB72B" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#FFB72B" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="beer" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFC857"/>
      <stop offset="100%" stop-color="#DD8A1E"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="${BG}"/>
  <rect width="512" height="512" fill="url(#glow)"/>
  <g transform="translate(256 256) scale(${contentScale}) translate(-256 -256)">
    <path d="M354 214 q70 4 70 72 q0 68 -70 72" fill="none" stroke="#B0701C" stroke-width="30" stroke-linecap="round"/>
    <path d="M158 160 L354 160 L322 408 Q320 420 308 420 L204 420 Q192 420 190 408 Z" fill="url(#beer)" stroke="#7A3E0C" stroke-width="8" stroke-linejoin="round"/>
    <rect x="180" y="220" width="14" height="150" rx="7" fill="#FFFFFF" opacity="0.16"/>
    <path d="M158 160 L354 160 L354 196 Q322 214 286 204 Q256 196 226 206 Q190 216 158 198 Z" fill="#F7E6C6"/>
    <path d="M158 160 Q168 128 206 134 Q230 112 258 130 Q286 114 312 134 Q346 128 354 160 Z" fill="#F7E6C6"/>
    <circle cx="206" cy="120" r="14" fill="#F7E6C6"/>
    <circle cx="258" cy="104" r="18" fill="#F7E6C6"/>
    <circle cx="312" cy="122" r="13" fill="#F7E6C6"/>
  </g>
</svg>`
}

const standard = buildSvg(0.84)
const maskable = buildSvg(0.6)

mkdirSync('public/icons', { recursive: true })

const render = (svg, size) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png()

await render(standard, 192).toFile('public/icons/icon-192.png')
await render(standard, 512).toFile('public/icons/icon-512.png')
await render(maskable, 512).toFile('public/icons/icon-512-maskable.png')
// apple-touch-icon must be opaque (no alpha); flatten onto the brand bg.
await render(standard, 180).flatten({ background: BG }).toFile('public/apple-touch-icon-180.png')

writeFileSync('public/favicon.svg', standard)

console.log('Icons generated: 192, 512, 512-maskable, apple-180, favicon.svg')
