import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { extname } from 'path';

@Injectable()
export class R2StorageService {
  private s3: S3Client;
  private readonly logger = new Logger(R2StorageService.name);

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${extname(file.originalname)}`;
    const key = `${folder}/${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3.send(command);
      const publicUrl = process.env.R2_PUBLIC_URL || '';
      // Remove trailing slash from publicUrl if it exists
      const cleanUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
      return `${cleanUrl}/${key}`;
    } catch (error: any) {
      this.logger.error(`Failed to upload file to R2: ${error.message}`);
      throw error;
    }
  }
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const publicUrl = process.env.R2_PUBLIC_URL || '';
      const cleanUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
      
      // Extract the key from the URL
      if (!fileUrl.startsWith(cleanUrl)) {
        this.logger.warn(`File URL ${fileUrl} does not match R2_PUBLIC_URL, skipping deletion`);
        return;
      }
      
      const key = fileUrl.replace(`${cleanUrl}/`, '');
      
      const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      });
      
      await this.s3.send(command);
      this.logger.log(`Successfully deleted ${key} from R2`);
    } catch (error: any) {
      this.logger.error(`Failed to delete file from R2: ${error.message}`);
      // We don't throw error to prevent breaking the main flow if deletion fails
    }
  }

  async deleteFiles(fileUrls: string[]): Promise<void> {
    if (!fileUrls || fileUrls.length === 0) return;
    
    // Process deletions in parallel
    await Promise.allSettled(
      fileUrls.map(url => this.deleteFile(url))
    );
  }
}
