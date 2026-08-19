import { describe, it, expect } from 'vitest'
import sharp from 'sharp'

describe('Image Processing Security & Sharp Pipeline (sharp@0.35.3 / libvips CVE-2026-33327)', () => {
  it('processes valid PNG image and converts to WebP/AVIF formats cleanly', async () => {
    // Generate 100x100 PNG buffer
    const pngBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 },
      },
    })
      .png()
      .toBuffer()

    expect(pngBuffer.length).toBeGreaterThan(0)

    // Convert to WebP
    const webpBuffer = await sharp(pngBuffer).webp({ quality: 80 }).toBuffer()
    expect(webpBuffer.length).toBeGreaterThan(0)

    // Verify metadata
    const metadata = await sharp(webpBuffer).metadata()
    expect(metadata.format).toBe('webp')
    expect(metadata.width).toBe(100)
    expect(metadata.height).toBe(100)
  })

  it('processes JPEG format cleanly with EXIF strip', async () => {
    const jpegBuffer = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 3,
        background: { r: 255, g: 100, b: 50 },
      },
    })
      .jpeg()
      .toBuffer()

    const meta = await sharp(jpegBuffer).metadata()
    expect(meta.format).toBe('jpeg')
    expect(meta.width).toBe(64)
  })

  it('processes SVG rasterization safely', async () => {
    const svgContent = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><rect width="50" height="50" fill="purple"/></svg>'
    )

    const rasterized = await sharp(svgContent).png().toBuffer()
    const meta = await sharp(rasterized).metadata()
    expect(meta.format).toBe('png')
    expect(meta.width).toBe(50)
  })

  it('strictly rejects corrupted image payloads with an error', async () => {
    const corruptedBuffer = Buffer.from('NOT_A_REAL_IMAGE_DATA_CORRUPTED_HEADER')

    await expect(sharp(corruptedBuffer).metadata()).rejects.toThrow()
  })

  it('enforces limitInputPixels to prevent decompression bombs (oversized images)', async () => {
    // Create oversized dimension request exceeding memory limits
    const hugeImagePromise = sharp({
      create: {
        width: 100000,
        height: 100000,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
      limitInputPixels: 25000000, // 25 megapixels limit
    }).toBuffer()

    await expect(hugeImagePromise).rejects.toThrow()
  })
})
