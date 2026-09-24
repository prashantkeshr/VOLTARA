// Generates the PWA PNG icons (no image dependencies): the VOLTARA "V" mark,
// rasterised with 4×4 supersampling and encoded as PNG via node:zlib.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [10, 11, 12];
const FG = [200, 255, 46];

// V mark polygon in a 32-unit box (matches favicon.svg).
const V = [[5, 7], [10.8, 7], [16, 20.2], [21.2, 7], [27, 7], [18.6, 26], [13.4, 26]];

function inside(x, y, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(size, scale) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const unit = (size * scale) / 32;
  const off = (size - size * scale) / 2;
  const SS = 4;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS - off) / unit;
          const py = (y + (sy + 0.5) / SS - off) / unit;
          if (inside(px, py, V)) hits++;
        }
      const a = hits / (SS * SS);
      const i = y * (size * 3 + 1) + 1 + x * 3;
      for (let k = 0; k < 3; k++) raw[i + k] = Math.round(BG[k] + (FG[k] - BG[k]) * a);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', png(192, 1));
writeFileSync('public/icons/icon-512.png', png(512, 1));
writeFileSync('public/icons/icon-maskable-512.png', png(512, 0.7));
console.log('icons written');
