import { Controller, Post, Get, Put, Delete, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileManagerService } from './file-manager.service';

@Controller('file-manager')
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.fileManagerService.uploadFile(file, body);
  }

  @Get()
  getAllFiles() {
    return this.fileManagerService.getAllFiles();
  }

  @Get(':id')
  getFileById(@Param('id') id: string) {
    return this.fileManagerService.getFileById(id);
  }

  @Put(':id')
  updateFile(@Param('id') id: string, @Body() updateData: any) {
    return this.fileManagerService.updateFile(id, updateData);
  }

  @Delete(':id')
  deleteFile(@Param('id') id: string) {
    return this.fileManagerService.deleteFile(id);
  }
}
