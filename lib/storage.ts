/**
 * Hosted Object Storage abstraction for FindBack AI
 * 
 * In production on Vercel, this can connect to:
 * - Vercel Blob (via @vercel/blob and BLOB_READ_WRITE_TOKEN)
 * - AWS S3 / Cloudflare R2 / Cloudinary
 * 
 * Development fallback:
 * Safely accepts base64 data URLs, existing remote URLs, or returns standard resilient item avatars.
 */

export interface UploadImageResult {
  url: string;
  provider: 'blob' | 'data_url' | 'fallback';
}

export async function uploadImage(
  imageInput: string,
  filename: string = 'item-image.jpg'
): Promise<UploadImageResult> {
  if (!imageInput || typeof imageInput !== 'string') {
    return {
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      provider: 'fallback',
    };
  }

  // 1. If it's already an HTTP / HTTPS URL, retain it directly
  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    return {
      url: imageInput,
      provider: 'blob',
    };
  }

  // 2. Check if Vercel Blob token is set in environment
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      // Dynamic import to avoid hard bundling requirements if token is not active
      const { put } = await import('@vercel/blob' as any);
      const match = imageInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      const mimeType = match ? match[1] : 'image/jpeg';
      const base64Data = match ? match[2] : imageInput;
      const buffer = Buffer.from(base64Data, 'base64');

      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: mimeType,
        token: blobToken,
      });

      return {
        url: blob.url,
        provider: 'blob',
      };
    } catch (err) {
      console.warn('Vercel Blob upload failed, falling back to data URL storage:', err);
    }
  }

  // 3. Resilient development fallback: Return data URL intact so UI and Gemini work seamlessly
  return {
    url: imageInput,
    provider: 'data_url',
  };
}
