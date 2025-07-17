# 🚂 Railway Setup Guide - Backend & Frontend

## 📋 Tổng quan

Hướng dẫn setup ChitChat App trên Railway với:
- **Backend**: Spring Boot API
- **Frontend**: React + Vite
- **Database**: Neon PostgreSQL (đã có sẵn)

---

## 🛠️ BACKEND SETUP

### Step 1: Backend Environment Variables

Trong Railway Dashboard của Backend project, vào **Variables** và thêm:

```bash
# Database Configuration
DATABASE_URL=jdbc:postgresql://ep-empty-snowflake-a1mipsm3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=npg_sFid7Gfq8DcS

# Spring Configuration
SPRING_PROFILES_ACTIVE=prod
PORT=8080

# JWT Configuration
JWT_SECRET_KEY=dGhpcyBpcyBhIHNlY3VyZSBqd3Qgc2VjcmV0IGtleSBmb3IgY2hpdGNoYXQgYXBwbGljYXRpb24gd2l0aCBzdWZmaWNpZW50IGxlbmd0aA==
JWT_EXPIRATION=3600000

# CORS Configuration (SẼ CẬP NHẬT SAU KHI CÓ FRONTEND URL)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.railway.app

# AI Configuration
GEMINI_API_KEY=AIzaSyCcTP3r-KBxe3MwVKxW2opivTBZcu-jXuE

# File Upload
UPLOAD_DIR=uploads
```

### Step 2: Backend Build Configuration

Railway sẽ tự động detect Spring Boot, nhưng nếu cần custom:

```bash
# Build Command (nếu cần thiết)
mvn clean package -DskipTests

# Start Command (nếu cần thiết)
java -jar target/*.jar
```

### Step 3: Lấy Backend URL

Sau khi deploy thành công, Railway sẽ cấp cho bạn URL dạng:
```
https://chitchat-backend-production-xxxx.up.railway.app
```

**Lưu URL này lại để configure frontend!**

---

## 🎨 FRONTEND SETUP

### Step 1: Frontend Environment Variables

Trong Railway Dashboard của Frontend project, vào **Variables** và thêm:

```bash
# Backend Connection
NEXT_PUBLIC_BACKEND_URL=https://chitchat-backend-production-xxxx.up.railway.app
NEXT_PUBLIC_WEBSOCKET_URL=wss://chitchat-backend-production-xxxx.up.railway.app

# Build Configuration
NODE_ENV=production
```

### Step 2: Frontend Build Configuration

Railway sẽ auto-detect React/Vite, nhưng có thể cần custom:

```bash
# Build Command
npm run build

# Start Command
npm run preview
```

### Step 3: Lấy Frontend URL

Sau khi deploy, Railway sẽ cấp URL dạng:
```
https://chitchat-frontend-production-xxxx.up.railway.app
```

---

## 🔄 CẬP NHẬT CORS

### Step 1: Update Backend CORS

Quay lại Backend project trong Railway, cập nhật biến:

```bash
CORS_ALLOWED_ORIGINS=https://chitchat-frontend-production-xxxx.up.railway.app
```

### Step 2: Restart Backend

Sau khi cập nhật CORS, restart backend service để áp dụng thay đổi.

---

## 🧪 TESTING

### Step 1: Backend Health Check

Truy cập: `https://your-backend-url.railway.app/actuator/health`

Kết quả mong muốn:
```json
{
  "status": "UP"
}
```

### Step 2: API Test

Truy cập: `https://your-backend-url.railway.app/api/auth/test`

### Step 3: Frontend Test

Truy cập: `https://your-frontend-url.railway.app`

Kiểm tra:
- Trang loading thành công
- Không có CORS errors trong console
- Có thể đăng ký/đăng nhập
- WebSocket connection hoạt động

---

## 🔧 TROUBLESHOOTING

### Issue 1: CORS Errors

**Triệu chứng**: Console hiển thị CORS errors
**Giải pháp**:
```bash
# Kiểm tra CORS_ALLOWED_ORIGINS trong backend
# Đảm bảo đúng frontend URL
CORS_ALLOWED_ORIGINS=https://your-actual-frontend-url.railway.app
```

### Issue 2: 404 API Errors

**Triệu chứng**: Frontend không connect được API
**Giải pháp**:
```bash
# Kiểm tra NEXT_PUBLIC_BACKEND_URL trong frontend
# Đảm bảo đúng backend URL
NEXT_PUBLIC_BACKEND_URL=https://your-actual-backend-url.railway.app
```

### Issue 3: WebSocket Connection Failed

**Triệu chứng**: Real-time chat không hoạt động
**Giải pháp**:
```bash
# Kiểm tra WebSocket URL
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-backend-url.railway.app
```

### Issue 4: Database Connection Error

**Triệu chứng**: Backend không start được
**Giải pháp**:
```bash
# Kiểm tra database credentials
DATABASE_URL=jdbc:postgresql://ep-empty-snowflake-a1mipsm3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_USERNAME=neondb_owner  
DATABASE_PASSWORD=npg_sFid7Gfq8DcS
```

### Issue 5: Build Failures

**Frontend Build Error**:
```bash
# Thêm memory limit
NODE_OPTIONS=--max-old-space-size=4096
```

**Backend Build Error**:
```bash
# Thêm Maven options
MAVEN_OPTS=-Xmx2g
```

---

## 🚀 DEPLOYMENT WORKFLOW

### Auto-Deploy Setup

1. **Backend**: Connect GitHub repo với Railway
2. **Frontend**: Connect GitHub repo với Railway  
3. **Auto-redeploy**: Mỗi khi push code, Railway tự động deploy

### Manual Deploy

1. Vào Railway Dashboard
2. Chọn project
3. Click "Deploy" để manual trigger

---

## 🔐 SECURITY BEST PRACTICES

### Environment Variables

```bash
# Không commit sensitive data
# Sử dụng Railway Variables thay vì hardcode

# JWT Secret - generate mới cho production
JWT_SECRET_KEY=your-production-secret-key

# Database credentials - sử dụng Railway PostgreSQL nếu có
DATABASE_URL=railway-postgres-url
```

### CORS Configuration

```bash
# Chỉ allow specific domains
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.railway.app

# Không sử dụng wildcard "*" trong production
```

---

## 📊 MONITORING

### Railway Dashboard

- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: Deployment history
- **Usage**: Cost tracking

### Application Logs

```bash
# Backend logs
railway logs --service backend-service

# Frontend logs  
railway logs --service frontend-service
```

---

## 🎯 FINAL CHECKLIST

### Backend ✅
- [ ] Environment variables configured
- [ ] Build and deployment successful
- [ ] Health check returns 200
- [ ] Database connection working
- [ ] CORS properly configured

### Frontend ✅
- [ ] Environment variables configured
- [ ] Build and deployment successful
- [ ] App loads without errors
- [ ] API calls working
- [ ] WebSocket connection established

### Integration ✅
- [ ] No CORS errors
- [ ] Authentication working
- [ ] Real-time chat working
- [ ] File upload working
- [ ] All features tested

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra Railway logs
2. Verify environment variables
3. Test API endpoints manually
4. Check database connection
5. Verify CORS configuration

---

## 🔗 USEFUL LINKS

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app
- **Spring Boot on Railway**: https://docs.railway.app/guides/spring-boot
- **React on Railway**: https://docs.railway.app/guides/react 