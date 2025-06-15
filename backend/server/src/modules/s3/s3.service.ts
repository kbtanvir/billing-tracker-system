import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectTaggingCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as archiver from 'archiver';
import { pipeline, Readable } from 'stream';
import { site404, sitePlaceholder } from 'template';
import { promisify } from 'util';
import { ConfigService } from '../config/config.service';

const pipelineAsync = promisify(pipeline);

export interface UploadFile {
  file: File;
  path: string;
  relativePath: string;
  mimeType: string;
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.s3.endpoint,
      credentials: {
        accessKeyId: this.configService.s3.accessKey,
        secretAccessKey: this.configService.s3.secretKey,
      },
      forcePathStyle: true,
    });
  }

  async getCurrentBucketSize(userId: string): Promise<number> {
    const sanitizedKey = userId.endsWith('/') ? userId : `${userId}/`;

    try {
      let totalSize = 0;
      // let objectCount = 0;
      let continuationToken: string | undefined;

      do {
        const command = new ListObjectsV2Command({
          Bucket: this.configService.s3.bucketId,
          Prefix: sanitizedKey,
          ContinuationToken: continuationToken,
        });

        const response = await this.s3Client.send(command);

        if (response.Contents) {
          for (const object of response.Contents) {
            totalSize += object.Size || 0;
            // objectCount++;
          }
        }

        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      // return {
      //   totalSize,
      //   objectCount,
      // };
      return totalSize;
    } catch (error: any) {
      console.error('Error calculating bucket size:', error);
      throw new Error(
        `Failed to calculate bucket size for user ${userId}: ${error.message}`,
      );
    }
  }

  async createbucketKey(key: string): Promise<void> {
    try {
      const sanitizedKey = key.endsWith('/') ? key : `${key}/`;

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.configService.s3.bucketId,
          Key: sanitizedKey,
        },
      });

      await upload.done();
    } catch (error) {
      throw new HttpException(
        'Failed to create bucketKey',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async uploadFolderAndFiles(
    uploadFile,
    Bucket = this.configService.s3.bucketId,
    type = 'application/octet-stream',
  ): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket,
        Key: uploadFile.path.startsWith('/')
          ? uploadFile.path.slice(1)
          : uploadFile.path,
        Body: uploadFile.file,
        ContentType: type,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Failed to upload ${uploadFile.path}:`, error);
      throw error;
    }
  }

  async uploadZipFiles(
    key: string,
    files: Express.Multer.File[],
    filePaths: string[],
  ) {
    try {
      const sanitizedKey = key.endsWith('/') ? key : `${key}/`;

      const uploadPromises = files.map(async (file, index) => {
        if (filePaths[index].startsWith('/')) {
          filePaths[index] = filePaths[index].slice(1);
        }
        const uploadKey = `${sanitizedKey}${filePaths[index].replace('./', '') || file.originalname}`;

        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.configService.s3.bucketId,
            Key: uploadKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            CacheControl: 'public, max-age=3600',
          },
          tags: [{ Key: 'public', Value: 'true' }],
        });

        await upload.done();
      });

      // 'advanced/index.html'

      if (!filePaths.some((path) => path.endsWith('index.html'))) {
        const uploadKey = `${sanitizedKey}index.html`;

        const uploadCustomIndex = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.configService.s3.bucketId,
            Key: uploadKey,
            Body: Buffer.from(sitePlaceholder, 'utf-8'),
            ContentType: 'text/html',
            CacheControl: 'public, max-age=3600',
          },
          tags: [{ Key: 'public', Value: 'true' }],
        });

        await uploadCustomIndex.done();
      }

      if (!filePaths.some((path) => path.endsWith('404.html'))) {
        const uploadKey = `${sanitizedKey}404.html`;

        const uploadCustomIndex = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.configService.s3.bucketId,
            Key: uploadKey,
            Body: Buffer.from(site404, 'utf-8'),
            ContentType: 'text/html',
            CacheControl: 'public, max-age=3600',
          },
          tags: [{ Key: 'public', Value: 'true' }],
        });

        await uploadCustomIndex.done();
      }

      return Promise.all(uploadPromises);
    } catch (error) {
      throw new HttpException(
        'Failed to upload files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadFiles(key: string, files: Express.Multer.File[]): Promise<any[]> {
    try {
      const sanitizedKey = key.endsWith('/') ? key : `${key}/`;

      const uploadPromises = files.map((file) => {
        const uploadKey = `${sanitizedKey}${file.originalname.replace(' ', '-')}`;

        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.configService.s3.bucketId,
            Key: uploadKey,
            Body: file.buffer,
            ContentType: file.mimetype,
          },
          tags: [{ Key: 'public', Value: 'true' }],
        });

        return upload.done();
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new HttpException(
        'Failed to upload files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePrivacy(key: string, isPrivate: boolean) {
    try {
      // First, get existing tags if any
      const getTagsCommand = new GetObjectTaggingCommand({
        Bucket: this.configService.s3.bucketId,
        Key: key,
      });

      let existingTags: { [key: string]: string } = {};

      try {
        const currentTags = await this.s3Client.send(getTagsCommand);
        if (currentTags.TagSet) {
          existingTags = currentTags.TagSet.reduce(
            (acc, tag) => ({
              ...acc,
              [tag.Key]: tag.Value,
            }),
            {},
          );
        }
      } catch (error) {
        console.log('No existing tags found');
      }

      // Remove the existing 'public' tag if it exists
      delete existingTags['public'];

      // Prepare the new tag set
      const tagSet = [
        ...Object.entries(existingTags).map(([Key, Value]) => ({ Key, Value })),
        {
          Key: 'public',
          Value: isPrivate ? 'false' : 'true',
        },
      ];

      // Update tags
      const putTagsCommand = new PutObjectTaggingCommand({
        Bucket: this.configService.s3.bucketId,
        Key: key,
        Tagging: {
          TagSet: tagSet,
        },
      });

      await this.s3Client.send(putTagsCommand);

      const updatedTags = await this.s3Client.send(getTagsCommand);
      return updatedTags;
    } catch (error) {
      console.error('Error updating object tags:', error);
      throw new HttpException(
        'Failed to update file privacy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listScreenshots(key: string) {
    try {
      const sanitizedKey = key.endsWith('/') ? key : `${key}/`;

      const command = new ListObjectsV2Command({
        Bucket: this.configService.s3.bucketId,
        Prefix: sanitizedKey,
      });

      return await this.s3Client.send(command);
    } catch (error) {
      return false;
    }
  }

  async listKeys(
    key: string,
    delimiter: string = '',
    Bucket = this.configService.s3.bucketId,
  ) {
    try {
      const sanitizedKey = key.endsWith('/') ? key : `${key}/`;

      const command = new ListObjectsV2Command({
        Bucket,
        Prefix: sanitizedKey,
        MaxKeys: 1000,
        Delimiter: delimiter,
      });

      const listResponse = await this.s3Client.send(command);

      // Get privacy status for each object
      const objectsWithPrivacy = await Promise.all(
        (listResponse.Contents || []).map(async (object) => {
          const getTagsCommand = new GetObjectTaggingCommand({
            Bucket: this.configService.s3.bucketId,
            Key: object.Key,
          });

          try {
            const tagResponse = await this.s3Client.send(getTagsCommand);
            const isPublicTag = tagResponse.TagSet.find(
              (tag) => tag.Key === 'public',
            );

            // Determine if the 'public' tag is set to 'true'
            const isPublic = isPublicTag?.Value === 'true';
            return { ...object, isPublic };
          } catch (error) {
            console.error(`Error getting tags for ${object.Key}:`, error);
            return { ...object, isPublic: false }; // Assume private if error
          }
        }),
      );

      return {
        ...listResponse,
        Contents: objectsWithPrivacy,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to list files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFiles(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        // For MinIO, we need to handle objects one by one to avoid the Content-MD5 issue
        // eslint-disable-next-line require-await
        const deletePromises = keys.map(async (key) => {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: this.configService.s3.bucketId,
            Key: key,
          });
          return this.s3Client.send(deleteCommand);
        });

        await Promise.all(deletePromises);
      }
    } catch (error) {
      throw new HttpException(
        `Failed to delete files with keys: ${keys.join(', ')}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteDirectory(key: string): Promise<void> {
    try {
      const sanitizedKey = key.endsWith('/') ? key : `${key}/`;

      const listCommand = new ListObjectsV2Command({
        Bucket: this.configService.s3.bucketId,
        Prefix: sanitizedKey,
      });

      const response = await this.s3Client.send(listCommand);

      if (response.Contents && response.Contents.length > 0) {
        await this.deleteFiles(response.Contents.map((file) => file.Key!));
      }
    } catch (error) {
      throw new HttpException(
        'Failed to delete bucketKey',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async downloadFiles(keys: string[], res): Promise<void> {
    try {
      // Initialize the zip archive
      const archive = archiver('zip', { zlib: { level: 0 } }); // Adjust compression level if needed

      // Pipe the archive to the response
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="export.zip"`,
      });
      archive.pipe(res);

      // Add each file to the ZIP archive
      for (const key of keys) {
        const command = new GetObjectCommand({
          Bucket: this.configService.s3.bucketId,
          Key: key,
        });

        const response = await this.s3Client.send(command);

        if (!response.Body) {
          throw new HttpException(
            `File not found: ${key}`,
            HttpStatus.NOT_FOUND,
          );
        }

        // Convert the S3 response stream to a Node.js readable stream
        const nodeReadableStream = Readable.from(
          response.Body as unknown as AsyncIterable<Uint8Array>,
        );

        // Skip the first two directories (userid/projectid/)
        const pathSegments = key.split('/');
        const adjustedPath = pathSegments.slice(2).join('/'); // Remove first two segments

        // Append the file to the archive with the correct name
        archive.append(nodeReadableStream, { name: adjustedPath });
      }

      // Finalize the archive (this signals the end of the archive)
      await archive.finalize();
    } catch (error: any) {
      throw new HttpException(
        `Failed to download or zip files: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getObject(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.configService.s3.bucketId,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error(`Object not found: ${key}`);
      }
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      await pipelineAsync(stream, async function* (source) {
        for await (const chunk of source) {
          chunks.push(chunk);
        }
      });

      // Convert concatenated chunks to string
      return Buffer.concat(chunks).toString('utf-8');
    } catch (error: any) {
      throw new Error(`Failed to get object ${key}: ${error.message}`);
    }
  }

  async getObjectChunk(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.configService.s3.bucketId,
        Key: key,
        ResponseCacheControl: 'no-cache, no-store, must-revalidate', // Disable cache
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error(`Object not found: ${key}`);
      }

      // Convert Node.js Readable stream to a string
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      return new Promise<string>((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () =>
          resolve(Buffer.concat(chunks).toString('utf-8')),
        );
        stream.on('error', (err) => reject(err));
      });
    } catch (error: any) {
      throw new Error(`Failed to get object ${key}: ${error.message}`);
    }
  }

  async getObjectMetadata(key: string): Promise<any> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.configService.s3.bucketId,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      // Assuming metadata includes content type and other info
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        // Add other metadata as needed
      };
    } catch (error: any) {
      if (error.name === 'NotFound') {
        throw new Error(`Object not found: ${key}`);
      }
      throw new Error(`Failed to get object metadata: ${error.message}`);
    }
  }
  async saveObject(
    key: string,
    content: Buffer | Uint8Array | string,
    contentType: string,
    isPrivate: boolean,
  ): Promise<void> {
    try {
      // Upload the content
      const command = new PutObjectCommand({
        Bucket: this.configService.s3.bucketId,
        Key: key,
        Body: content,
        ContentType: contentType,
        CacheControl: 'no-cache',
      });

      await this.s3Client.send(command);

      await this.updatePrivacy(key, isPrivate);
    } catch (error: any) {
      throw new Error(`Failed to save object ${key}: ${error.message}`);
    }
  }

  async cloneFile(
    sourceKey: string,
    destinationFolder: string,
    sourceBucket = this.configService.s3.bucketId,
  ): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.configService.s3.bucketId,
        CopySource: `${sourceBucket}/${sourceKey}`,
        Key: destinationFolder,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new HttpException(
        `Failed to clone file from ${sourceKey} to ${destinationFolder}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cloneDirectory(sourceDir: string, destDir?: string) {
    const normalizedDirectory = sourceDir.endsWith('/')
      ? sourceDir.slice(0, -1)
      : sourceDir;

    // const directoryName = normalizedDirectory.split('/').pop();

    // if (directoryName === destDir) {
    //   throw new HttpException(
    //     `${directoryName} already exist`,
    //     HttpStatus.CONFLICT,
    //   );
    // }

    try {
      // Get the new directory name (the last part of the original directory)
      const newDirectory = destDir ?? `${normalizedDirectory.split('/').pop()}`;

      // List all contents (files and directories) in the original directory
      const { Contents } = await this.listKeys(
        `${normalizedDirectory}/`,
        '',
        'cdn',
      );

      if (!Contents || Contents.length === 0) {
        return; // No contents in the directory
      }

      // Clone each file or directory into the new destination
      await Promise.all(
        Contents.map(async (item) => {
          const sourceKey = item.Key;
          const filePath = sourceKey.replace(`${normalizedDirectory}/`, ''); // Remove original directory from key

          // Create the destination key based on the new directory structure
          const destinationKey = `${newDirectory}/${filePath}`;

          // Clone the file to the new destination
          await this.cloneFile(sourceKey, destinationKey, 'cdn');
        }),
      );

      // await this.deleteDirectory(directory);

      return {
        success: true,
        message: `Directory ${sourceDir} cloned successfully`,
      };
    } catch (error: any) {
      throw new HttpException(
        `Failed to clone directory: ${sourceDir}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
