# 🚀 Setup Nhanh Blog Service (Từ Clone đến Chạy)

Hướng dẫn này dành cho người **MỚI CLONE CODE** về và muốn chạy Blog Service.

---

## ✅ Yêu cầu hệ thống

- ✅ Docker Desktop đã cài đặt và đang chạy
- ✅ Git đã cài đặt
- ✅ Port `3004` chưa bị chiếm dụng

---

## 📥 Bước 1: Clone Code

```powershell
# Clone repository (nếu chưa có)
git clone <repository-url>
cd FEPA
```

---

## 🔧 Bước 2: Chạy Infrastructure (Lần đầu tiên)

```powershell
# Chạy PostgreSQL, RabbitMQ, MongoDB
cd deployment
docker compose up -d

# Kiểm tra đã chạy chưa
docker ps
# Phải thấy: fepa-postgres, fepa-rabbitmq, fepa-mongodb
```

---

## 🔐 Bước 3: Chạy Auth Service (Để có thể login)

```powershell
cd ../auth-service
docker compose up -d --build

# Kiểm tra logs
docker logs auth-service --tail 20
# Phải thấy: "Auth Service is running..."
```

---

## 🌐 Bước 4: Chạy API Gateway

```powershell
cd ../api-gateway
docker compose up -d --build

# Kiểm tra logs
docker logs fepa-api-gateway --tail 20
# Phải thấy: "API Gateway đang chạy trên port 3000"
```

---

## 📝 Bước 5: Chạy Blog Service

```powershell
cd ../blog-service
docker compose up -d --build

# Kiểm tra logs
docker logs blog-service --tail 30
# Phải thấy: "Blog Microservice is listening on RabbitMQ queue: blog_queue"
```

**🎉 XONG! Service đã sẵn sàng!**

---

## 🧪 Bước 6: Test API

### Test 1: Login để lấy token

```powershell
# Sử dụng curl hoặc Postman
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fepa.com",
    "password": "admin123"
  }'
```

**Kết quả:** Copy `access_token` từ response

### Test 2: Tạo blog đơn giản

```powershell
curl -X POST http://localhost:3000/api/v1/blogs \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blog Đầu Tiên",
    "slug": "blog-dau-tien",
    "content": "Đây là nội dung blog đầu tiên của tôi"
  }'
```

**Kết quả:** Nhận được blog object với `status: "draft"`

### Test 3: Xem tất cả blogs

```powershell
curl http://localhost:3000/api/v1/blogs
```

---

## 📚 Các lệnh hữu ích

### Xem logs
```powershell
# Xem logs blog-service
docker logs blog-service --tail 50

# Xem logs realtime
docker logs blog-service -f
```

### Restart service
```powershell
cd blog-service
docker compose restart
```

### Rebuild khi có thay đổi code
```powershell
cd blog-service
docker compose down
docker compose up -d --build
```

### Xem database
```powershell
# Vào PostgreSQL shell
docker exec -it fepa-postgres psql -U fepa -d fepa_blog

# Hoặc xem trực tiếp
docker exec -it fepa-postgres psql -U fepa -d fepa_blog -c "SELECT * FROM \"Blog\";"
```

### Stop tất cả services
```powershell
# Từ thư mục blog-service
docker compose down

# Từ thư mục api-gateway
cd ../api-gateway
docker compose down

# Từ thư mục auth-service
cd ../auth-service
docker compose down

# Từ thư mục deployment
cd ../deployment
docker compose down
```

---

## ⚠️ Troubleshooting

### Lỗi: Port already in use
```powershell
# Kiểm tra port nào đang chạy
netstat -ano | findstr :3004

# Stop container đang chạy
docker stop blog-service
```

### Lỗi: Cannot connect to database
```powershell
# Kiểm tra PostgreSQL đã chạy chưa
docker ps | findstr postgres

# Nếu chưa chạy
cd deployment
docker compose up -d
```

### Lỗi: Migration failed
```powershell
# Drop và tạo lại database
docker exec -it fepa-postgres psql -U fepa -d postgres -c "DROP DATABASE IF EXISTS fepa_blog;"
docker exec -it fepa-postgres psql -U fepa -d postgres -c "CREATE DATABASE fepa_blog;"

# Rebuild service
cd blog-service
docker compose up -d --build
```

### Lỗi: Service không start
```powershell
# Xem logs chi tiết
docker logs blog-service

# Rebuild từ đầu
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 📖 Tài liệu tham khảo

- **TEST_GUIDE_SIMPLE.md** - Hướng dẫn test chi tiết với Postman
- **API_QUICK_REFERENCE.md** - Tham khảo nhanh tất cả endpoints
- **CREATE_BLOG_SIMPLE.md** - Hướng dẫn tạo blog (có/không có ảnh)
- **IMPLEMENTATION_SUMMARY.md** - Tổng quan kiến trúc và implementation

---

## ✅ Checklist

- [ ] Docker Desktop đang chạy
- [ ] Đã clone code về
- [ ] Đã chạy `deployment` (PostgreSQL, RabbitMQ)
- [ ] Đã chạy `auth-service`
- [ ] Đã chạy `api-gateway`
- [ ] Đã chạy `blog-service`
- [ ] Test login thành công
- [ ] Test tạo blog thành công
- [ ] Xem được danh sách blogs

---

## 🎯 Tóm tắt

**Từ clone code đến chạy được, chỉ cần:**

1. Clone code
2. `cd deployment && docker compose up -d`
3. `cd ../auth-service && docker compose up -d --build`
4. `cd ../api-gateway && docker compose up -d --build`
5. `cd ../blog-service && docker compose up -d --build`
6. Test API!

**KHÔNG CẦN:**
- ❌ Chạy `npm install` thủ công
- ❌ Chạy `prisma migrate` thủ công
- ❌ Chạy `npm run build` thủ công
- ❌ Tạo file `.env` (dùng biến env trong docker-compose.yml)

**Tất cả đã tự động trong Docker!** 🚀
