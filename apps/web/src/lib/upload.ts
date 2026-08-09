/**
 * Smart File Upload Utility
 * Tries Vercel Blob client upload first.
 * If Vercel Blob token is unconfigured or fails (e.g. "Failed to retrieve client token"),
 * automatically falls back to direct FormData server upload (/api/upload).
 */
export async function uploadFile(file: File, context?: string): Promise<{ url: string; fileName: string }> {
  const VERCEL_SERVERLESS_MAX_SIZE = 4.5 * 1024 * 1024; // 4.5MB serverless limit

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
    console.warn('[Upload Utility] Vercel Blob client upload failed or unconfigured, attempting direct server upload fallback:', blobError?.message || blobError);
  }

  // 2. Client-side payload limit check before direct server upload fallback
  if (file.size > VERCEL_SERVERLESS_MAX_SIZE) {
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 4.5MB serverless request limit. Please use a direct Video URL or configure BLOB_READ_WRITE_TOKEN.`
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
    throw new Error('Upload failed (413 Payload Too Large). File size exceeds the 4.5MB server limit. Please enter a direct URL instead.');
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    let errJson: any = {};
    try {
      errJson = JSON.parse(errText);
    } catch (_e) {}
    if (errText.includes('Request Entity Too Large') || response.status === 413) {
      throw new Error('Upload failed (413 Payload Too Large). File size exceeds the server limit. Please enter a direct URL or compress the media.');
    }
    throw new Error(errJson.error || errText || `Upload failed (${response.status})`);
  }

  const resText = await response.text();
  let data: any = {};
  try {
    data = JSON.parse(resText);
  } catch (_e) {
    if (resText.includes('Request Entity Too Large')) {
      throw new Error('Upload failed (413 Payload Too Large). File size exceeds the server limit.');
    }
    throw new Error(resText || 'Invalid response from upload server.');
  }

  if (data.url) {
    return { url: data.url, fileName: data.fileName || file.name };
  }

  throw new Error(data.error || 'Upload failed');
}
