import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    // As credenciais (accessKeyId, secretAccessKey) serão lidas
    // automaticamente das variáveis de ambiente (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  });

  async uploadPublicFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<string> {
    const key = `${uuid()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: 'public-read', // Torna o arquivo publicamente acessível
    });

    try {
      await this.s3Client.send(command);
      // Constrói a URL pública
      return `https://s3-${process.env.AWS_S3_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${key}`;
    } catch (error) {
      this.logger.error('Falha ao fazer upload para o S3', error);
      throw new Error('Falha no upload do arquivo.');
    }
  }
}