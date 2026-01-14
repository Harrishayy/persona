/**
 * Helper functions for image upload management
 */

import { extractKeyFromUrl, deleteImage } from './r2-client';

/**
 * Check if a URL is a blob URL (local file preview)
 */
export function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:');
}

/**
 * Check if a URL is an R2 URL
 */
export function isR2Url(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const isR2Dev = urlObj.hostname.includes('r2.dev');
    const isCloudflareStorage = urlObj.hostname.includes('cloudflarestorage.com');
    let isCustomDomain = false;
    
    if (process.env.R2_PUBLIC_URL) {
      try {
        const publicUrlObj = new URL(process.env.R2_PUBLIC_URL);
        isCustomDomain = urlObj.hostname === publicUrlObj.hostname;
      } catch {
        // Invalid R2_PUBLIC_URL, ignore
      }
    }
    
    return isR2Dev || isCloudflareStorage || isCustomDomain;
  } catch {
    return false;
  }
}

/**
 * Extract R2 key from URL and delete the image
 */
export async function deleteR2ImageIfExists(url: string | undefined | null): Promise<void> {
  if (!url || !isR2Url(url)) {
    return;
  }

  try {
    const key = extractKeyFromUrl(url);
    if (key) {
      await deleteImage(key);
    }
  } catch (error) {
    console.error('Error deleting R2 image:', error);
    // Don't throw - cleanup failures shouldn't block operations
  }
}

/**
 * Upload a file to R2 from a File object
 */
export async function uploadFileToR2(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload image');
  }

  const result = await response.json();
  return result.url;
}

/**
 * Upload a blob URL to R2 by converting it to a file first
 * If the blob URL is invalid/revoked, this will fail
 */
export async function uploadBlobUrlToR2(blobUrl: string, filename: string = 'image'): Promise<string> {
  try {
    // Fetch the blob - if this fails, the blob URL may have been revoked
    const response = await fetch(blobUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Validate blob is actually an image
    if (!blob.type.startsWith('image/')) {
      throw new Error('Blob is not an image');
    }
    
    // Convert blob to file
    const file = new File([blob], filename, { type: blob.type || 'image/webp' });
    
    // Upload to R2
    return await uploadFileToR2(file);
  } catch (error) {
    console.error('Error uploading blob URL to R2:', error);
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Image file is no longer available. Please select the image again.');
    }
    throw new Error('Failed to upload image to storage');
  }
}

/**
 * Upload a File object directly to R2
 * Use this when you have the File object available
 */
export async function uploadFileObjectToR2(file: File): Promise<string> {
  return await uploadFileToR2(file);
}
