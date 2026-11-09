// Web copies of the provided originals + share thumbnail. Originals stay untouched.
// Run: SHARP_MODULE=/path/to/sharp node scripts/make-web-assets.cjs  (sharp is a tool here, not an app dependency)
const path = require('node:path');
const fs = require('node:fs');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
sharp.cache(false); sharp.concurrency(1);
const root = path.resolve(__dirname, '..');
const a = p => path.join(root, 'assets', p);
const jobs = [
  ['backgrounds/originals/chatgpt_generated_27.png', 'web/bg-pond.webp', { quality: 78 }],
  ['backgrounds/originals/chatgpt_generated_32.png', 'web/bg-meadow.webp', { quality: 78 }],
  ['branding/originals/chatgpt_generated_39.png', 'web/logo.webp', { quality: 88, alphaQuality: 90 }],
  ['characters/originals/chatgpt_generated_40.png', 'web/moa-sheet.webp', { quality: 86, alphaQuality: 90 }],
];
(async () => {
  fs.mkdirSync(a('web'), { recursive: true });
  for (const [src, out, opt] of jobs) {
    const info = await sharp(a(src)).webp({ ...opt, effort: 6 }).toFile(a(out));
    console.log(out, info.width + 'x' + info.height, (info.size / 1024).toFixed(0) + ' KiB');
  }
  // 1200x630 share image: same title art (pond background, logo, Moa waving pose).
  fs.mkdirSync(a('og'), { recursive: true });
  const bg = await sharp(a('backgrounds/originals/chatgpt_generated_27.png')).resize(1200, 630, { fit: 'cover', position: 'centre' }).toBuffer();
  const shade = Buffer.from('<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0f3a2f" stop-opacity=".78"/><stop offset=".55" stop-color="#0f3a2f" stop-opacity=".25"/><stop offset="1" stop-color="#0f3a2f" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>');
  const logo = await sharp(a('branding/originals/chatgpt_generated_39.png')).trim().resize({ width: 640 }).toBuffer();
  // Moa waving pose = first cell of the provided pose sheet (top-left ~1/5 width).
  const cut = Buffer.from('<svg width="345" height="500"><rect x="292" y="360" width="53" height="140"/></svg>');
  const cell = await sharp(a('characters/originals/chatgpt_generated_40.png')).extract({ left: 0, top: 0, width: 345, height: 500 }).composite([{ input: cut, blend: 'dest-out' }]).png().toBuffer();
  const moa = await sharp(cell).trim().resize({ height: 470 }).toBuffer();
  const lead = Buffer.from('<svg width="640" height="120"><style>text{font-family:"Apple SD Gothic Neo","Malgun Gothic",sans-serif;font-weight:800;fill:#fffef7}</style><text x="6" y="52" font-size="44">작은 발견이 모여, 숲의 내일을 바꿔.</text><text x="6" y="104" font-size="30" fill="#f6e7b0" style="fill:#f6e7b0">초등 과학 · 생물과 환경 탐험 게임</text></svg>');
  await sharp(bg).composite([
    { input: shade, left: 0, top: 0 },
    { input: logo, left: 52, top: 70 },
    { input: lead, left: 56, top: 330 },
    { input: moa, left: 860, top: 150 },
  ]).jpeg({ quality: 84, mozjpeg: true }).toFile(a('og/og-image.jpg'));
  console.log('og/og-image.jpg', (fs.statSync(a('og/og-image.jpg')).size / 1024).toFixed(0) + ' KiB');
})();
