import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID || "dummy_account_id";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "dummy_access_key";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "dummy_secret_key";
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "student-notes-portal";

// Cloudflare R2 S3 Client
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Generate a 15-minute presigned PUT URL for direct browser-to-R2 upload.
 * Strictly guarantees zero PDF bytes are proxied through Next.js server memory.
 */
export async function getPresignedUploadUrl(
  objectKey: string,
  contentType: string = "application/pdf",
  expiresInSeconds: number = 900 // 15 minutes
): Promise<{ uploadUrl: string; objectKey: string }> {
  // If running in development with dummy credentials, provide a safe local mock URL
  if (accessKeyId === "dummy_access_key" || !process.env.R2_ACCOUNT_ID) {
    return {
      uploadUrl: `/api/mock-r2-upload?key=${encodeURIComponent(objectKey)}`,
      objectKey,
    };
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: expiresInSeconds,
  });

  return { uploadUrl, objectKey };
}

/**
 * Generate a short-lived (15-minute) presigned GET URL for student viewing.
 */
export async function getPresignedViewUrl(
  objectKey: string,
  expiresInSeconds: number = 900 // 15 minutes
): Promise<string> {
  // If running in development with dummy credentials, provide safe mock viewer URL
  if (accessKeyId === "dummy_access_key" || !process.env.R2_ACCOUNT_ID) {
    return `/api/mock-r2-view?key=${encodeURIComponent(objectKey)}`;
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
  });

  return await getSignedUrl(r2Client, command, {
    expiresIn: expiresInSeconds,
  });
}
