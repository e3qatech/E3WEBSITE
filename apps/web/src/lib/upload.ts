/**
 * Smart File Upload Utility
 * Tries Vercel Blob client upload first.
 * If Vercel Blob token is unconfigured or fails (e.g. "Failed to retrieve client token"),
 * automatically falls back to direct FormData server upload (/api/upload).
 */
export async function uploadFile(file: File, context?: string): Promise<{ url: string; fileName: string }> {
  // 1. Try Vercel Blob client upload first
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
    console.warn('[Upload Utility] Vercel Blob client upload failed or unconfigured, attempting direct server upload:', blobError?.message || blobError);
  }

  // 2. Direct server upload fallback via FormData
  const formData = new FormData();
  formData.append('file', file);
  if (context) {
    formData.append('context', context);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || `Upload failed (${response.status})`);
  }

  const data = await response.json();
  if (data.url) {
    return { url: data.url, fileName: data.fileName || file.name };
  }

  throw new Error(data.error || 'Upload failed');
}
