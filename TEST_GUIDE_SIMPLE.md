# 🚀 Hướng dẫn Test Blog Service (Siêu nhanh)

Tài liệu này hướng dẫn cách chạy và test Blog Service từ lúc mới clone code về.

> **✨ Tính năng mới: Community Blog**  
> Service hiện hỗ trợ **tất cả users** tạo blog, upload hình ảnh, và admin duyệt bài.  
> **Workflow**: Draft → Pending → Published/Rejected

## 1. Khởi chạy hệ thống (Docker)

### ✅ Yêu cầu trước khi bắt đầu:
- Docker và Docker Compose đã được cài đặt
- Các services khác đã chạy: `deployment` (PostgreSQL, RabbitMQ), `api-gateway`, `auth-service`

### 🚀 Các bước chạy Blog Service:

```powershell
# Bước 1: Di chuyển vào thư mục blog-service
cd blog-service

# Bước 2: Build và chạy service (lần đầu hoặc khi có thay đổi code)
docker compose up -d --build

# Hoặc nếu đã build rồi, chỉ cần:
docker compose up -d
```

> **💡 Lưu ý quan trọng:**
> - Dockerfile tự động chạy `npm install`, `prisma generate`, và build code
> - Migration được tự động apply khi container start qua CMD: `npx prisma migrate deploy && node dist/main.js`
> - **KHÔNG CẦN** chạy migration thủ công!

### 🔍 Kiểm tra service đã chạy chưa:

```powershell
# Xem logs
docker logs blog-service --tail 50

# Kết quả mong đợi:
# ✅ "Blog Microservice is listening on RabbitMQ queue: blog_queue"
```

---

## 2. Khởi tạo Database (TỰ ĐỘNG)

**✅ Không cần làm gì!** Migration được tự động apply khi container start.

### 📋 Cấu trúc Database:

**Bảng: `Blog`**
- `id` - UUID (PostgreSQL)
- `userId` - String (MongoDB ObjectId từ auth-service, 24 ký tự)
- `title` - String
- `slug` - String (unique)
- `content` - Text
- `thumbnailUrl` - String (nullable)
- `images` - String[] (default: [])
- `status` - Enum: draft | pending | published | rejected
- `author` - String (nullable)
- `rejectionReason` - String (nullable)
- `publishedAt` - DateTime (nullable)
- `createdAt` - DateTime
- `updatedAt` - DateTime

### 🔧 Kiểm tra database (Optional):

```powershell
# Xem cấu trúc bảng Blog
docker exec -it fepa-postgres psql -U fepa -d fepa_blog -c "\d \"Blog\""

# Xem enum BlogStatus
docker exec -it fepa-postgres psql -U fepa -d fepa_blog -c "\dT+ \"BlogStatus\""

# Xem tất cả blogs
docker exec -it fepa-postgres psql -U fepa -d fepa_blog -c "SELECT id, title, slug, status FROM \"Blog\";"
```

---

## 3. Test trên Postman

### Bước 1: Lấy Token (Login)
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/user/login`
*   **Body (JSON):**
    ```json
    {
      "email": "admin@fepa.com",
      "password": "admin123"
    }
    ```
*   **Kết quả:** Copy chuỗi `access_token` trả về.

### Bước 2: Upload Ảnh (OPTIONAL - Bỏ qua nếu không cần)
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/blogs/upload/single`
*   **Headers:** `Authorization`: `Bearer <Token>`
*   **Body (form-data):**
    - Key: `file`
    - Type: File
    - Value: Chọn ảnh (JPEG/PNG/GIF/WebP, max 5MB)

**Response:**
```json
{
  "url": "/uploads/1736496123456-abc123.jpg"
}
```

### Bước 3: Tạo Blog (Draft)

#### 🚀 Cách 1: Tạo blog ĐơN GIẢN (không cần ảnh)
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/blogs`
*   **Headers:** `Authorization`: `Bearer <Token>`
*   **Body (JSON):**
    ```json
    {
      "title": "10 Mẹo Tiết Kiệm Tiền Hiệu Quả",
      "slug": "10-meo-tiet-kiem-tien-hieu-qua",
      "content": "1. Lập ngân sách hàng tháng\n2. Cắt giảm chi tiêu không cần thiết\n3. Tìm kiếm ưu đãi..."
    }
    ```

#### 🎨 Cách 2: Tạo blog ĐẦY ĐỦ (có ảnh + author)
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/blogs`
*   **Headers:** `Authorization`: `Bearer <Token>`
*   **Body (JSON):**
    ```json
    {
      "title": "10 Mẹo Tiết Kiệm Tiền Hiệu Quả",
      "slug": "10-meo-tiet-kiem-tien-hieu-qua",
      "content": "Nội dung chi tiết về các mẹo tiết kiệm tiền...",
      "thumbnailUrl": "/uploads/1736496123456-abc123.jpg",
      "images": ["/uploads/1736496123456-xyz789.jpg"],
      "author": "Nguyễn Văn A"
    }
    ```

**📝 Lưu ý:**
- ✅ **Bắt buộc:** `title`, `slug`, `content`
- ⭕ **Không bắt buộc:** `thumbnailUrl`, `images`, `author`, `status`
- 🔄 `status` mặc định là `draft` (không cần truyền vào)

**Lưu ý về workflow:**
- ✅ User tạo blog → status: `draft`
- ✅ User có thể edit draft nhiều lần
- ✅ User submit → status: `pending`
- ✅ Admin approve → status: `published` (có `publishedAt`)
- ✅ Admin reject → status: `rejected` (có `rejectionReason`)

### Bước 4: Xem Blogs của mình
*   **Method:** `GET`
*   **URL:** `http://localhost:3000/api/v1/blogs/my-blogs`
*   **Headers:** `Authorization`: `Bearer <Token>`

### Bước 5: Update Blog (chỉ draft)
*   **Method:** `PATCH`
*   **URL:** `http://localhost:3000/api/v1/blogs/<BLOG_ID>`
*   **Headers:** `Authorization`: `Bearer <Token>`
*   **Body (JSON):**
    ```json
    {
      "title": "15 Mẹo Tiết Kiệm Tiền Hiệu Quả (Updated)",
      "content": "Updated content..."
    }
    ```

### Bước 6: Submit for Review
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/blogs/<BLOG_ID>/submit`
*   **Headers:** `Authorization`: `Bearer <Token>`

**Response:**
```json
{
  "id": "uuid-here",
  "status": "pending",
  "updatedAt": "2026-01-10T08:05:00Z"
}
```

### Bước 7: Admin - Xem Pending Blogs
*   **Method:** `GET`
*   **URL:** `http://localhost:3000/api/v1/blogs?status=pending`
*   **Headers:** `Authorization`: `Bearer <Admin-Token>`

### Bước 8: Admin - Approve Blog
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/blogs/<BLOG_ID>/approve`
*   **Headers:** `Authorization`: `Bearer <Admin-Token>`

**Response:**
```json
{
  "id": "uuid-here",
  "status": "published",
  "publishedAt": "2026-01-10T08:10:00Z"
}
```

### Bước 9: Admin - Reject Blog
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/blogs/<BLOG_ID>/reject`
*   **Headers:** `Authorization`: `Bearer <Admin-Token>`
*   **Body (JSON):**
    ```json
    {
      "rejectionReason": "Nội dung không phù hợp với chủ đề tài chính"
    }
    ```

### Bước 10: Public - Xem Published Blogs
*   **Method:** `GET`
*   **URL:** `http://localhost:3000/api/v1/blogs?status=published`
*   **Headers:** Không cần (public endpoint)

### Bước 11: Public - Xem Blog by Slug
*   **Method:** `GET`
*   **URL:** `http://localhost:3000/api/v1/blogs/slug/10-meo-tiet-kiem-tien-hieu-qua`
*   **Headers:** Không cần (public endpoint)

---

## � Lưu ý quan trọng

### Về Community Blog
*   **Ai có thể tạo blog?** Tất cả authenticated users
*   **User có thể edit blog đã publish?** Không, chỉ draft
*   **Admin có thể reject?** Có, với `rejectionReason`
*   **Images lưu ở đâu?** Docker volume `blog-uploads:/app/uploads`

### Về Upload
*   **File types:** JPEG, PNG, GIF, WebP
*   **Max size:** 5MB
*   **Storage:** Volume mount (persist khi restart)
*   **URL format:** `/uploads/timestamp-random.ext`

### Status Flow
```
draft ──────────────────────────────────────┐
  │                                          │
  │ submitForReview()                        │
  ↓                                          │
pending                                      │
  │                                          │
  ├─ approve() ──→ published                 │
  │                                          │
  └─ reject() ───→ rejected ─────────────────┘
                      │
                      └─ user can edit & resubmit
```

### Troubleshooting

#### 🔴 Lỗi 500 - Internal Server Error
**Nguyên nhân:** Nhiều lý do khác nhau
**Cách fix:**
```powershell
# 1. Xem logs để biết lỗi cụ thể
docker logs blog-service --tail 50

# 2. Nếu lỗi về database/migration, rebuild:
docker compose down
docker compose up -d --build
```

#### 🔴 Lỗi "Error creating UUID, invalid length"
**Nguyên nhân:** Schema cũ dùng UUID cho userId, nhưng auth-service trả về MongoDB ObjectId (24 ký tự)
**Cách fix:** Đã được fix trong schema hiện tại (`userId` là `String`). Nếu vẫn gặp:
```powershell
# Drop database và tạo lại
docker compose down
docker exec -it fepa-postgres psql -U fepa -d postgres -c "DROP DATABASE IF EXISTS fepa_blog;"
docker exec -it fepa-postgres psql -U fepa -d postgres -c "CREATE DATABASE fepa_blog;"
docker compose up -d --build
```

#### 🔴 Lỗi "BlogStatus not found" hoặc "Column not found"
**Nguyên nhân:** Migration chưa chạy hoặc schema không khớp
**Cách fix:**
```powershell
# Rebuild container (migration sẽ tự động chạy)
docker compose up -d --build
```

#### 🔴 Lỗi "Namespace 'global.Express' has no exported member 'Multer'"
**Nguyên nhân:** Thiếu package `@types/multer` trong api-gateway
**Cách fix:**
```powershell
cd ../api-gateway
npm install --save-dev @types/multer
```

#### 🔴 Images không access được
**Nguyên nhân:** Chưa setup static file serving
**Cách fix:** Xem file `IMPLEMENTATION_SUMMARY.md` để setup static serving

#### 🔴 Service không start
**Cách fix:**
```powershell
# Kiểm tra logs
docker logs blog-service

# Kiểm tra các services phụ thuộc đã chạy chưa
docker ps | grep -E "fepa-postgres|fepa-rabbitmq"

# Restart tất cả
docker compose down
docker compose up -d
```

#### 📌 Cổng kết nối:
*   API Gateway: `3000` (Sử dụng để test tập trung)
*   Blog Service: `3004` (Microservice, không test trực tiếp)
*   RabbitMQ Management: `http://localhost:15672` (fepa/fepa123)
*   PostgreSQL: `localhost:5432` (fepa/fepa123)

---

## 📚 Import Postman Collection

File: `Blog-Service.postman_collection.json`

**Variables cần set:**
- `baseUrl`: `http://localhost:3000`
- `userToken`: JWT token của user
- `adminToken`: JWT token của admin
- `blogId`: ID của blog (auto-set sau create)

---

## 🔬 Advanced Testing

### Filter Examples
```http
# Get user's blogs
GET /api/v1/blogs/my-blogs

# Get published blogs only
GET /api/v1/blogs?status=published

# Get pending blogs (admin)
GET /api/v1/blogs?status=pending

# Pagination
GET /api/v1/blogs?page=2&limit=10

# Filter by user
GET /api/v1/blogs?userId=<user-uuid>
```

### Error Cases to Test
1. ❌ Update published blog → 403 Forbidden
2. ❌ Delete other user's blog → 403 Forbidden
3. ❌ Approve non-pending blog → 403 Forbidden
4. ❌ Upload file > 5MB → 400 Bad Request
5. ❌ Upload non-image file → 400 Bad Request

---

## ✅ Checklist

- [ ] Service starts without errors
- [ ] Can login and get token
- [ ] Can upload image
- [ ] User can create draft blog
- [ ] User can update draft
- [ ] User can submit for review
- [ ] User CANNOT update pending/published blog
- [ ] Admin can approve blog
- [ ] Admin can reject blog with reason
- [ ] Public can view published blogs
- [ ] Images persist after container restart

