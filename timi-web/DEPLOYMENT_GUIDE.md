# Timi Web 项目部署和测试指南

## 项目概述

Timi Web 是一个前后端分离的 Web 应用，包含：
- **前端**: React 19 + Tailwind CSS（C 端列表 + 管理后台）
- **后端**: Spring Boot 3.x + Java 17（REST API）

## 项目结构

```
/home/ubuntu/
├── timi-web/                    # 前端项目（React）
│   ├── client/                  # 前端源代码
│   ├── package.json
│   └── vite.config.ts
└── timi-backend/                # 后端项目（Spring Boot）
    ├── src/
    ├── pom.xml
    └── README.md
```

---

## 快速开始

### 前置条件

- **前端**: Node.js 18+, pnpm 10+
- **后端**: Java 17+, Maven 3.6+, MySQL 8.0+

### 步骤 1: 启动后端

```bash
# 进入后端项目目录
cd /home/ubuntu/timi-backend

# 创建数据库
mysql -u root -p
> CREATE DATABASE timi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> EXIT;

# 编译项目
mvn clean install

# 运行应用
mvn spring-boot:run
```

后端将在 `http://localhost:8080` 启动

### 步骤 2: 启动前端

```bash
# 进入前端项目目录
cd /home/ubuntu/timi-web

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

前端将在 `http://localhost:5173` 启动

---

## 功能测试指南

### 1. 邀请码验证流程

**URL**: `http://localhost:5173/invite`

**测试步骤**:
1. 访问邀请码页面
2. 输入邀请码: `TIMI2024`、`WELCOME123` 或 `INVITE001`
3. 点击"进入"按钮
4. 验证成功后应跳转到列表页面

**预期结果**: ✅ Token 保存到 localStorage，可在浏览器开发者工具查看

### 2. C 端列表页面

**URL**: `http://localhost:5173/`

**测试步骤**:
1. 验证邀请码后进入列表页
2. 查看 4 列网格布局的列表项
3. 使用搜索框搜索（例如: "李明"）
4. 使用城市筛选（例如: "上海"）
5. 点击"复制名字"按钮
6. 点击"查看距离"按钮进入详情页

**预期结果**: ✅ 列表正确加载、搜索和筛选功能正常、复制功能工作

### 3. 详情页面

**URL**: `http://localhost:5173/detail/1`

**测试步骤**:
1. 从列表页点击任意列表项
2. 查看详情信息（基本信息、服务标签、位置信息）
3. 点击"查看距离"按钮
4. 浏览器会请求位置权限
5. 允许后计算距离并显示

**预期结果**: ✅ 详情页面正确加载、距离计算正确、位置权限请求正常

### 4. 管理员登录

**URL**: `http://localhost:5173/admin/login`

**测试步骤**:
1. 在列表页右上角点击设置图标
2. 进入管理员登录页面
3. 输入用户名: `admin`
4. 输入密码: `admin123`
5. 点击"登录"按钮

**预期结果**: ✅ 登录成功，跳转到管理后台

### 5. 管理后台

**URL**: `http://localhost:5173/admin/dashboard`

**测试步骤**:

#### 查看列表
1. 进入管理后台
2. 查看表格中的所有列表项
3. 使用搜索框搜索项目
4. 使用分页浏览

#### 创建新项
1. 点击"新增"按钮
2. 填写表单（至少填写名字）
3. 点击"保存"按钮
4. 验证新项出现在列表中

#### 编辑项
1. 点击列表中的编辑按钮
2. 修改任意字段
3. 点击"保存"按钮
4. 验证修改已保存

#### 删除项
1. 点击列表中的删除按钮
2. 确认删除
3. 验证项从列表中移除

**预期结果**: ✅ 所有 CRUD 操作正常工作

---

## API 测试

### 使用 curl 测试 API

#### 1. 验证邀请码

```bash
curl -X POST http://localhost:8080/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"code":"TIMI2024"}'
```

**预期响应**:
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "邀请码验证成功"
}
```

#### 2. 管理员登录

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### 3. 获取列表

```bash
curl -X GET "http://localhost:8080/api/profiles?page=0&size=10" \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

#### 4. 获取详情

```bash
curl -X GET http://localhost:8080/api/profiles/1 \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

#### 5. 计算距离

```bash
curl -X POST http://localhost:8080/api/profiles/1/distance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"userLatitude":31.2304,"userLongitude":121.4737}'
```

---

## 常见问题

### 1. 前端无法连接后端

**问题**: 前端请求返回 CORS 错误或连接失败

**解决方案**:
- 检查后端是否运行在 `http://localhost:8080`
- 检查 `client/src/lib/api.ts` 中的 `API_BASE_URL` 配置
- 检查后端 `SecurityConfig.java` 中的 CORS 配置

### 2. 邀请码验证失败

**问题**: 输入正确的邀请码仍然验证失败

**解决方案**:
- 检查数据库中邀请码是否存在: `SELECT * FROM invite_codes;`
- 检查邀请码是否已被使用: `SELECT * FROM invite_codes WHERE used=true;`
- 检查邀请码是否过期

### 3. 管理员登录失败

**问题**: 输入 `admin` / `admin123` 仍然登录失败

**解决方案**:
- 检查用户是否存在: `SELECT * FROM users WHERE username='admin';`
- 检查用户角色是否为 ADMIN: `SELECT role FROM users WHERE username='admin';`
- 重新初始化数据库

### 4. 距离计算不准确

**问题**: 距离计算结果不正确

**解决方案**:
- 确保列表项中的纬度和经度正确
- 使用正确的坐标格式（小数点）
- 检查 Haversine 公式的实现

### 5. 图片无法加载

**问题**: 列表项中的图片显示不出来

**解决方案**:
- 检查图片 URL 是否正确
- 确保图片 URL 可以公开访问
- 检查浏览器控制台是否有 CORS 错误

---

## 数据库初始化

### 初始化邀请码

```sql
INSERT INTO invite_codes (code, used, expires_at) VALUES 
('TIMI2024', false, DATE_ADD(NOW(), INTERVAL 365 DAY)),
('WELCOME123', false, DATE_ADD(NOW(), INTERVAL 365 DAY)),
('INVITE001', false, DATE_ADD(NOW(), INTERVAL 365 DAY));
```

### 初始化管理员

```sql
-- 密码: admin123 (BCrypt 加密)
INSERT INTO users (account_id, username, password_hash, role) VALUES 
(1, 'admin', '$2a$10$slYQmyNdGzin7olVN3p5Be7DkH0/AVqYD8/LewY5IwV3yLxXQq7aK', 'ADMIN');
```

### 初始化列表数据

```sql
INSERT INTO profiles (name, age, height, weight, size, photo_url, city, latitude, longitude, services, description) VALUES 
('李明', 28, 175.50, 70.00, 'M', 'https://via.placeholder.com/300', '上海', 31.2304, 121.4737, '["按摩", "咨询"]', '专业按摩师');
```

---

## 性能优化建议

1. **前端**:
   - 启用 Gzip 压缩
   - 使用 CDN 加速静态资源
   - 实现图片懒加载
   - 使用虚拟滚动处理大列表

2. **后端**:
   - 添加数据库索引（name, city, latitude, longitude）
   - 实现缓存机制（Redis）
   - 使用数据库连接池
   - 添加 API 速率限制

3. **数据库**:
   - 定期备份
   - 监控查询性能
   - 优化慢查询

---

## 安全建议

1. **前端**:
   - 不要在代码中硬编码敏感信息
   - 使用 HTTPS 传输
   - 实现 CSRF 保护

2. **后端**:
   - 更改默认的 JWT 密钥
   - 更改默认的管理员密码
   - 实现请求验证和速率限制
   - 定期更新依赖包

3. **数据库**:
   - 使用强密码
   - 限制数据库访问权限
   - 定期备份数据

---

## 部署到生产环境

### 前端部署 (Manus)

1. 在项目管理界面创建检查点
2. 点击"Publish"按钮
3. 配置自定义域名（可选）

### 后端部署 (Docker)

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/timi-backend-1.0.0.jar app.jar
ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql-host:3306/timi_db
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=password
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

构建和运行:
```bash
docker build -t timi-backend:1.0.0 .
docker run -p 8080:8080 timi-backend:1.0.0
```

---

## 支持和反馈

如有问题或建议，请联系开发团队。

---

## 许可证

MIT
