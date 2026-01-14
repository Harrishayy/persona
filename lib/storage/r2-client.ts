import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Validate R2 credentials
function validateR2Config() {
  const missing: string[] = [];
  
  if (!R2_ACCOUNT_ID || R2_ACCOUNT_ID.trim() === '') {
    missing.push('R2_ACCOUNT_ID');
  }
  if (!R2_ACCESS_KEY_ID || R2_ACCESS_KEY_ID.trim() === '') {
    missing.push('R2_ACCESS_KEY_ID');
  }
  if (!R2_SECRET_ACCESS_KEY || R2_SECRET_ACCESS_KEY.trim() === '') {
    missing.push('R2_SECRET_ACCESS_KEY');
  }
  if (!R2_BUCKET_NAME || R2_BUCKET_NAME.trim() === '') {
    missing.push('R2_BUCKET_NAME');
  }
  
  if (missing.length > 0) {
    throw new Error(
      `R2 configuration is missing or empty: ${missing.join(', ')}. Please set these environment variables in .env.local`
    );
  }
}

// S3-compatible client for R2 (lazy initialization)
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  validateR2Config();
  
  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  
  return s3Client;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

/**
 * Upload image to R2 bucket
 * Returns public CDN URL
 */
export async function uploadImage(
  file: Buffer | Uint8Array,
  filename: string,
  contentType: string = 'image/webp'
): Promise<UploadResult> {
  // Generate unique key with timestamp and random string
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .toLowerCase()
    .substring(0, 50); // Limit filename length
  
  const key = `images/${timestamp}-${random}-${sanitizedFilename}`;
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await getS3Client().send(command);

  // Return public CDN URL
  // Priority: R2_PUBLIC_URL (if set) > r2.dev subdomain
  let url: string;
  if (R2_PUBLIC_URL && R2_PUBLIC_URL.trim() !== '') {
    // Use custom domain or explicitly set public URL
    // Remove trailing slash if present, then append key
    const baseUrl = R2_PUBLIC_URL.trim().replace(/\/$/, '');
    url = `${baseUrl}/${key}`;
  } else {
    // Fallback to r2.dev subdomain
    // Format: https://{ACCOUNT_ID}.{BUCKET_NAME}.r2.dev/{key}
    url = `https://${R2_ACCOUNT_ID}.${R2_BUCKET_NAME}.r2.dev/${key}`;
  }
  
  return {
    url,
    key,
    size: file.length,
  };
}

/**
 * Delete image from R2
 */
export async function deleteImage(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME!,
    Key: key,
  });

  await getS3Client().send(command);
}

/**
 * Extract key from R2 URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname.substring(1); // Remove leading slash
    
    // Handle r2.dev URLs: {ACCOUNT_ID}.{BUCKET_NAME}.r2.dev/images/...
    if (urlObj.hostname.includes('r2.dev')) {
      return path;
    }
    
    // Handle custom domain URLs (R2_PUBLIC_URL)
    if (R2_PUBLIC_URL) {
      try {
        const publicUrlObj = new URL(R2_PUBLIC_URL);
        if (urlObj.hostname === publicUrlObj.hostname) {
          // This is a custom domain URL, path contains the key
          return path;
        }
      } catch {
        // Invalid R2_PUBLIC_URL format, continue with default handling
      }
    }
    
    // Default: assume path contains the key
    return path;
  } catch {
    return null;
  }
}
