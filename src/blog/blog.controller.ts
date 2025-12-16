import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller()
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @MessagePattern('blog.create')
  createMicroservice(@Payload() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @MessagePattern('blog.find_all')
  findAllMicroservice(
    @Payload() payload: { status?: string; page?: number; limit?: number } = {},
  ) {
    return this.blogService.findAll(
      payload.status,
      payload.page,
      payload.limit,
    );
  }

  @MessagePattern('blog.find_by_slug')
  findBySlugMicroservice(@Payload() slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @MessagePattern('blog.update')
  updateMicroservice(@Payload() payload: { id: string; data: UpdateBlogDto }) {
    return this.blogService.update(payload.id, payload.data);
  }

  @MessagePattern('blog.delete')
  removeMicroservice(@Payload() id: string) {
    return this.blogService.remove(id);
  }
}
