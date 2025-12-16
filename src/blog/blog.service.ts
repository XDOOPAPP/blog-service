import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) { }

  async create(createBlogDto: CreateBlogDto) {
    return this.prisma.blog.create({
      data: createBlogDto,
    });
  }

  async findAll(status?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.BlogWhereInput = status ? { status } : {};

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

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    await this.findOne(id); // Ensure exists
    return this.prisma.blog.update({
      where: { id },
      data: updateBlogDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists
    return this.prisma.blog.delete({
      where: { id },
    });
  }
}
