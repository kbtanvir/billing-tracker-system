import { Roles } from '@app/common/decorators/roles.decorator';
import { UserRole } from '@app/common/enum';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { S3Service } from './s3.service';

@ApiTags('r2')
@Controller('r2')
@ApiBearerAuth()
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post(':space')
  @Roles(UserRole.SYSTEM_ADMIN)
  @UseInterceptors(
    FilesInterceptor('files', undefined, {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
      },
    }),
  )
  @ApiBody({
    description: 'Upload multiple files to a bucketKey',
    required: true,
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  async uploadFilesTobucketKey(
    @Param('space') space: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.s3Service.uploadFiles(space, files);
  }

  //   @Post('bucketKey/:space')
  //   async createbucketKey(@Param('space') space: string) {
  //     return this.s3Service.createbucketKey(space);
  //   }
  @Delete(':space')
  @Roles(UserRole.USER)
  async deleteDirectory(@Param('space') space: string) {
    return await this.s3Service.deleteDirectory(space);
  }

  @Get(':space')
  @Roles(UserRole.USER)
  async get(@Param('space') space: string) {
    return await this.s3Service.listKeys(space);
  }

  //   @Get('files/:space')
  //   async getFilesFrombucketKey(@Param('space') space: string) {
  //     return this.s3Service.getFilesFrombucketKey(space);
  //   }

  //   @Get('dns/:bucketName')
  //   async getDNSRecord(@Param('bucketName') bucketName: string) {
  //     return this.s3Service.getDNSRecord(bucketName);
  //   }
}
