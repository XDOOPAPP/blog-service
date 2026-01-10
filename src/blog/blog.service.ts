import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApproveBlogDto, RejectBlogDto } from './dto/moderate-blog.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, BlogStatus } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) { }

  async create(createBlogDto: CreateBlogDto) {
    const { status, ...data } = createBlogDto;

    // User chỉ có thể tạo draft hoặc pending
    const allowedStatus = status === 'pending' ? BlogStatus.pending : BlogStatus.draft;

    return this.prisma.blog.create({
      data: {
        ...data,
        status: allowedStatus,
        images: data.images || [],
      },
    });
  }

  async findAll(
    status?: BlogStatus,
    userId?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.BlogWhereInput = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [data, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
    });
    if (!blog) throw new NotFoundException(`Blog with ID ${id} not found`);
    return blog;
  }

  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
    });
    if (!blog) throw new NotFoundException(`Blog with slug ${slug} not found`);
    return blog;
  }

  async update(id: string, userId: string, updateBlogDto: UpdateBlogDto) {
    const blog = await this.findOne(id);

    // Chỉ owner mới được update
    if (blog.userId !== userId) {
      throw new ForbiddenException('You can only update your own blogs');
    }

    // Nếu blog đã published hoặc pending, không cho update
    if (blog.status === BlogStatus.published || blog.status === BlogStatus.pending) {
      throw new ForbiddenException(
        'Cannot update blog that is published or pending approval',
      );
    }

    return this.prisma.blog.update({
      where: { id },
      data: updateBlogDto,
    });
  }

  async remove(id: string, userId: string) {
    const blog = await this.findOne(id);

    // Chỉ owner mới được xóa
    if (blog.userId !== userId) {
      throw new ForbiddenException('You can only delete your own blogs');
    }

    return this.prisma.blog.delete({
      where: { id },
    });
  }

  // Admin approve blog
  async approve(id: string, approveDto: ApproveBlogDto) {
    const blog = await this.findOne(id);

    if (blog.status !== BlogStatus.pending) {
      throw new ForbiddenException('Only pending blogs can be approved');
    }

    return this.prisma.blog.update({
      where: { id },
      data: {
        status: BlogStatus.published,
        publishedAt: new Date(),
      },
    });
  }

  // Admin reject blog
  async reject(id: string, rejectDto: RejectBlogDto) {
    const blog = await this.findOne(id);

    if (blog.status !== BlogStatus.pending) {
      throw new ForbiddenException('Only pending blogs can be rejected');
    }

    return this.prisma.blog.update({
      where: { id },
      data: {
        status: BlogStatus.rejected,
        rejectionReason: rejectDto.rejectionReason,
      },
    });
  }

  // User submit blog for review (draft -> pending)
  async submitForReview(id: string, userId: string) {
    const blog = await this.findOne(id);

    if (blog.userId !== userId) {
      throw new ForbiddenException('You can only submit your own blogs');
    }

    if (blog.status !== BlogStatus.draft) {
      throw new ForbiddenException('Only draft blogs can be submitted for review');
    }

    return this.prisma.blog.update({
      where: { id },
      data: { status: BlogStatus.pending },
    });
  }
}

