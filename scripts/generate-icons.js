// Generates PWA icon PNGs using only Node.js built-ins (no canvas/sharp needed).
// Icons are solid blue (#3B82F6) squares matching the app theme color.
// Run: node scripts/generate-icons.js

const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

// CRC32 table
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[n] = c
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff]
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])))
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

function createSolidPNG(size, r, g, b) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR: width, height, 8-bit RGB
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 2  // color type: RGB
  const ihdr = chunk('IHDR', ihdrData)

  // Raw pixel data: filter byte (0) + RGB per row
  const rowBytes = 1 + size * 3
  const raw = Buffer.alloc(size * rowBytes)
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const off = y * rowBytes + 1 + x * 3
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b
    }
  }

  const idat = chunk('IDAT', zlib.deflateSync(raw))
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdr, idat, iend])
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(iconsDir, { recursive: true })

// #3B82F6 = rgb(59, 130, 246)
const [r, g, b] = [59, 130, 246]

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for (const size of sizes) {
  const file = path.join(iconsDir, `icon-${size}x${size}.png`)
  fs.writeFileSync(file, createSolidPNG(size, r, g, b))
  console.log(`Created ${path.basename(file)} (${fs.statSync(file).size} bytes)`)
}

console.log('\nAll icons generated successfully.')
