/**
 * Smart File Upload Utility
 * Tries Vercel Blob client upload first.
 * If Vercel Blob token is unconfigured or fails, automatically falls back to direct server upload (/api/upload).
 * Includes client-side image compression for images > 1MB to prevent serverless request limit (4.5MB) errors.
 */

async function compressImageClientSide(file: File, maxSizeBytes: number = 600 * 1024): Promise<File> {
  if (!file.type.startsWith('image/') || file.type.includes('svg') || file.size <= maxSizeBytes) {
    return file
  }

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // Scale down dimensions if huge
      const maxDim = 1920
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        'image/jpeg',
        0.82
      )
    }
    img.onerror = () => resolve(file)
    img.src = url
  })
}

export async function uploadFile(originalFile: File, context?: string): Promise<{ url: string; fileName: string }> {
  const VERCEL_SERVERLESS_MAX_SIZE = 4.2 * 1024 * 1024; // 4.2MB limit

  // Automatically compress images > 1.2MB before upload
  const file = await compressImageClientSide(originalFile)

  // 1. Try Vercel Blob client upload first (bypasses serverless limit via direct client-to-blob upload)
  try {
    const { upload } = await import('@vercel/blob/client');
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
      clientPayload: context ? JSON.stringify({ context }) : undefined
    });

    if (blob && blob.url) {
      return { url: blob.url, fileName: file.name };
    }
  } catch (blobError: any) {
    console.info('[Upload Notice] Vercel Blob token not set, using direct server upload.');
  }

  // 2. Client-side payload limit check before direct server upload fallback
  if (file.size > VERCEL_SERVERLESS_MAX_SIZE) {
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 4.5MB serverless limit. Please use a direct Video URL or host the video on a CDN.`
    );
  }

  // 3. Direct server upload fallback via FormData
  const formData = new FormData();
  formData.append('file', file);
  if (context) {
    formData.append('context', context);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (response.status === 413) {
    throw new Error('Upload failed (413 Payload Too Large). File size exceeds the 4.5MB server limit. Please enter a direct media URL.');
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    let errJson: any = {};
    try {
      errJson = JSON.parse(errText);
    } catch (_e) {}
    if (errText.includes('Request Entity Too Large') || response.status === 413) {
      throw new Error('Upload failed (413 Payload Too Large). File size exceeds server limit. Please enter a direct media URL.');
    }
    throw new Error(errJson.error || errText || `Upload failed (${response.status})`);
  }

  const resText = await response.text();
  let data: any = {};
  try {
    data = JSON.parse(resText);
  } catch (_e) {
    if (resText.includes('Request Entity Too Large')) {
      throw new Error('Upload failed (413 Payload Too Large). File size exceeds server limit.');
    }
    throw new Error(resText || 'Invalid response from upload server.');
  }

  if (data.url) {
    return { url: data.url, fileName: data.fileName || file.name };
  }

  throw new Error(data.error || 'Upload failed');
}
