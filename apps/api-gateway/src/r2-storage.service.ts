import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
}
