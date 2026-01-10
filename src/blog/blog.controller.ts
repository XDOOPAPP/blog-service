import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApproveBlogDto, RejectBlogDto } from './dto/moderate-blog.dto';

@Controller()
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  @MessagePattern('blog.create')
  createMicroservice(@Payload() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @MessagePattern('blog.find_all')
  findAllMicroservice(
    @Payload() payload: {
      status?: string;
      userId?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    return this.blogService.findAll(
      payload.status as any,
      payload.userId,
      payload.page,
      payload.limit,
    );
  }

  @MessagePattern('blog.find_by_slug')
  findBySlugMicroservice(@Payload() slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @MessagePattern('blog.find_one')
  findOneMicroservice(@Payload() id: string) {
    return this.blogService.findOne(id);
  }

  @MessagePattern('blog.update')
  updateMicroservice(
    @Payload() payload: { id: string; userId: string; data: UpdateBlogDto },
  ) {
    return this.blogService.update(payload.id, payload.userId, payload.data);
  }

  @MessagePattern('blog.delete')
  removeMicroservice(@Payload() payload: { id: string; userId: string }) {
    return this.blogService.remove(payload.id, payload.userId);
  }

  // User submit blog for review
  @MessagePattern('blog.submit_for_review')
  submitForReviewMicroservice(
    @Payload() payload: { id: string; userId: string },
  ) {
    return this.blogService.submitForReview(payload.id, payload.userId);
  }

  // Admin approve blog
  @MessagePattern('blog.approve')
  approveMicroservice(
    @Payload() payload: { id: string; approveDto: ApproveBlogDto },
  ) {
    return this.blogService.approve(payload.id, payload.approveDto);
  }

  // Admin reject blog
  @MessagePattern('blog.reject')
  rejectMicroservice(
    @Payload() payload: { id: string; rejectDto: RejectBlogDto },
  ) {
    return this.blogService.reject(payload.id, payload.rejectDto);
  }
}
