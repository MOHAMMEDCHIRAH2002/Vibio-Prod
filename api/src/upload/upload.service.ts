import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: Express.Multer.File, folder = 'vibio'): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        },
      );
      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
