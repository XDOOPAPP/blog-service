import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UploadService } from './upload.service';

@Controller()
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @MessagePattern('upload.single')
    uploadSingle(@Payload() payload: { file: Express.Multer.File }) {
        const url = this.uploadService.saveFile(payload.file);
        return { url };
    }

    @MessagePattern('upload.multiple')
    uploadMultiple(@Payload() payload: { files: Express.Multer.File[] }) {
        const urls = payload.files.map((file) => this.uploadService.saveFile(file));
        return { urls };
    }

    @MessagePattern('upload.delete')
    deleteFile(@Payload() payload: { url: string }) {
        this.uploadService.deleteFile(payload.url);
        return { success: true };
    }

    @MessagePattern('upload.delete_multiple')
    deleteFiles(@Payload() payload: { urls: string[] }) {
        this.uploadService.deleteFiles(payload.urls);
        return { success: true };
    }
}
