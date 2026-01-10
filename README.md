# Blog Service - Community Blog Platform

Service quản lý blog với tính năng community-driven: users tạo blog, upload ảnh, admin duyệt bài.

## ✨ Tính năng

- **👥 Community Blog**: Tất cả users có thể tạo blog
- **🖼️ Image Upload**: Upload thumbnail + multiple images (max 5MB)
- **📝 Workflow**: Draft → Pending → Published/Rejected
- **👨‍💼 Admin Moderation**: Approve/Reject với lý do
- **💾 Volume Storage**: Images persist trong Docker volume
- **🔒 Authorization**: User chỉ edit/delete blog của mình

## 🚀 Quick Start

```powershell
# 1. Start infrastructure
cd deployment
docker-compose up -d

# 2. Start API Gateway
cd ../api-gateway
docker-compose up -d

# 3. Start Blog Service (auto install + migrate)
cd ../blog-service
docker-compose up -d --build
```

> **💡 Lưu ý**: Dockerfile tự động chạy `npm install` và `prisma migrate deploy`

## 📊 Workflow

```
User tạo blog (draft) → Edit nhiều lần → Submit (pending)
                                              ↓
                                    Admin approve → Published
                                    Admin reject → Rejected
```

## 🔗 API Endpoints

### User
- `POST /blogs` - Tạo blog
- `POST /blogs/upload/single` - Upload ảnh
- `POST /blogs/:id/submit` - Submit for review
- `GET /blogs/my-blogs` - Blogs của mình
- `PATCH /blogs/:id` - Update (draft only)
- `DELETE /blogs/:id` - Delete

### Admin
- `POST /blogs/:id/approve` - Approve
- `POST /blogs/:id/reject` - Reject
- `GET /blogs?status=pending` - Pending blogs

### Public
- `GET /blogs?status=published` - Published blogs
- `GET /blogs/slug/:slug` - Get by slug

## 📚 Documentation

- **TEST_GUIDE_SIMPLE.md** - Hướng dẫn test từ clone code
- **IMPLEMENTATION_SUMMARY.md** - Chi tiết implementation
- **Blog-Service.postman_collection.json** - Postman collection

## 🛠️ Tech Stack

- **NestJS** - Framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **RabbitMQ** - Message queue
- **Docker** - Containerization
- **Multer** - File upload

## 🔧 Environment Variables

```env
PORT=3004
DATABASE_URL=postgresql://fepa:fepa123@fepa-postgres:5432/fepa_blog
RABBITMQ_URL=amqp://fepa:fepa123@fepa-rabbitmq:5672
UPLOAD_DIR=/app/uploads
```

## 📝 Database Schema

```prisma
enum BlogStatus {
  draft
  pending
  published
  rejected
}

model Blog {
  id              String     @id @default(uuid())
  userId          String     // User tạo blog
  title           String
  slug            String     @unique
  content         String
  thumbnailUrl    String?
  images          String[]   @default([])
  status          BlogStatus @default(draft)
  rejectionReason String?
  publishedAt     DateTime?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}
```

## 🐛 Troubleshooting

```powershell
# Check logs
docker logs blog-service

# Check database
docker exec -it fepa-postgres psql -U fepa -d fepa_blog

# Rebuild if schema changed
docker-compose up -d --build

# Check volume
docker volume inspect blog-uploads
```

## 📦 Ports

- **3004** - Blog Service (microservice)
- **3000** - API Gateway (test qua đây)
- **5432** - PostgreSQL
- **5672** - RabbitMQ
- **15672** - RabbitMQ Management UI

## 🎯 Test Quick

```bash
# Login
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fepa.com","password":"admin123"}'

# Upload image
curl -X POST http://localhost:3000/blogs/upload/single \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg"

# Create blog
curl -X POST http://localhost:3000/blogs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","slug":"test","content":"Content","status":"draft"}'
```

## 📖 Xem thêm

- [TEST_GUIDE_SIMPLE.md](./TEST_GUIDE_SIMPLE.md) - Hướng dẫn chi tiết
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical details
