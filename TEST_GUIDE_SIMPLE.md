# 🚀 Hướng dẫn Test Blog Service (Siêu nhanh)

Tài liệu này hướng dẫn cách chạy và test Blog Service từ lúc mới clone code về.

## 1. Khởi chạy hệ thống (Docker)

Mở terminal và chạy theo thứ tự:

```powershell
# B1: Chạy hạ tầng (Database, RabbitMQ)
cd deployment
docker-compose up -d

# B2: Chạy API Gateway & Auth Service (Để lấy Login/Token)
cd ../api-gateway
docker-compose up -d

# B3: Chạy Blog Service
cd ../blog-service
docker-compose up -d --build
```

---

## 2. Khởi tạo Database (BẮT BUỘC)

Sau khi container đã chạy, bạn cần tạo bảng trong database:

```powershell
# Tạo bảng trong Database
docker exec -it blog-service npx prisma migrate deploy
docker exec -it blog-service npx prisma db push
```

---

## 3. Test trên Postman

### Bước 1: Lấy Token (Admin)
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/user/login`
*   **Body (JSON):**
    ```json
    {
      "email": "admin@fepa.com",
      "password": "admin123"
    }
    ```
*   **Kết quả:** Copy chuỗi `access_token` (Token này có quyền ADMIN).

### Bước 2: Tạo bài viết (Admin only)
*   **Method:** `POST`
*   **URL:** `http://localhost:3000/api/v1/blogs`
*   **Headers:** `Authorization`: `Bearer <Token>`
*   **Body (JSON):**
    ```json
    {
      "title": "Hướng dẫn quản lý tài chính 2026",
      "slug": "huong-dan-quan-ly-tai-chinh-2026",
      "content": "Nội dung bài viết về quản lý tài chính...",
      "status": "published",
      "author": "Admin",
      "publishedAt": "2026-01-09T10:00:00Z"
    }
    ```

### Bước 3: Xem danh sách bài viết (Public)
*   **Method:** `GET`
*   **URL:** `http://localhost:3000/api/v1/blogs`

### Bước 4: Xem chi tiết bài viết qua Slug (Public)
*   **Method:** `GET`
*   **URL:** `http://localhost:3000/api/v1/blogs/huong-dan-quan-ly-tai-chinh-2026`

### Bước 5: Cập nhật bài viết (Admin only)
*   **Method:** `PATCH`
*   **URL:** `http://localhost:3000/api/v1/blogs/<ID_BAI_VIET>`
*   **Headers:** `Authorization`: `Bearer <Token>`
*   **Body (JSON):**
    ```json
    {
      "title": "Tiêu đề bài viết (Đã cập nhật)",
      "status": "draft"
    }
    ```

### Bước 6: Xóa bài viết (Admin only)
*   **Method:** `DELETE`
*   **URL:** `http://localhost:3000/api/v1/blogs/<ID_BAI_VIET>`
*   **Headers:** `Authorization`: `Bearer <Token>`

---

## 💡 Lưu ý quan trọng
*   **Quyền ADMIN**: Các endpoint tạo, sửa, xóa yêu cầu tài khoản có Role là `ADMIN`. 
*   **Lỗi 500**: Nếu gặp lỗi này, hãy chạy lệnh `docker logs blog-service` để xem lỗi.
*   **Cổng kết nối**: 
    *   API Gateway: `3000`.
    *   RabbitMQ: `http://localhost:15672` (fepa/fepa123).
