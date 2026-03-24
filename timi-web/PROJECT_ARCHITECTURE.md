# Timi Web 项目架构设计

## 项目概述
- **前端**: React 19 + Tailwind CSS + Wouter（路由）
- **后端**: Spring Boot 3.x（Java 17/21）
- **认证**: JWT Token + 邀请码验证
- **数据库**: MySQL（建议）或 PostgreSQL
- **部署**: 前后分离部署

---

## 核心功能模块

### 1. 邀请码认证系统
- **流程**: 用户输入邀请码 → 后端验证 → 返回 JWT Token → 前端存储 Token
- **Token 格式**: `Authorization: Bearer <JWT_TOKEN>`
- **Token 内容**: `{ account_id, exp }`
- **有效期**: 根据业务需求设定（建议 30 天）

### 2. C 端列表页面
- **路由**: `/` （首页）
- **功能**:
  - 邀请码验证门槛
  - 显示列表（网格布局，4 列）
  - 搜索功能
  - 筛选功能（城市等）
  - 点击查看详情

### 3. 详情页面
- **路由**: `/detail/:id`
- **显示内容**:
  - 支持服务（标签）
  - 基本信息（年龄、身高、体重、尺寸、照片）
  - 位置信息（城市 + 距离计算）
  - "复制名字" 和 "查看距离" 按钮

### 4. 管理后台
- **路由**: `/admin/*`
- **功能**:
  - 管理员登录
  - 数据 CRUD（创建、读取、更新、删除）
  - 图片上传管理
  - 用户数据管理

---

## 数据模型

### 用户表 (users)
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_id INT UNIQUE NOT NULL,
  username VARCHAR(255),
  password_hash VARCHAR(255),
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 邀请码表 (invite_codes)
```sql
CREATE TABLE invite_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

### 列表项表 (profiles)
```sql
CREATE TABLE profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  age INT,
  height DECIMAL(5, 2),
  weight DECIMAL(5, 2),
  size VARCHAR(50),
  photo_url VARCHAR(500),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  services TEXT, -- JSON 格式存储标签
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## API 接口设计

### 认证相关
| 方法 | 端点 | 描述 | 请求头 |
|------|------|------|--------|
| POST | `/api/auth/verify-code` | 验证邀请码 | - |
| POST | `/api/auth/login` | 管理员登录 | - |
| POST | `/api/auth/refresh` | 刷新 Token | `Authorization: Bearer <token>` |

### C 端 API
| 方法 | 端点 | 描述 | 请求头 |
|------|------|------|--------|
| GET | `/api/profiles` | 获取列表（支持分页、搜索、筛选） | `Authorization: Bearer <token>` |
| GET | `/api/profiles/:id` | 获取详情 | `Authorization: Bearer <token>` |
| POST | `/api/profiles/:id/distance` | 计算距离 | `Authorization: Bearer <token>` |

### 管理后台 API
| 方法 | 端点 | 描述 | 请求头 |
|------|------|------|--------|
| GET | `/api/admin/profiles` | 获取所有列表项 | `Authorization: Bearer <admin_token>` |
| POST | `/api/admin/profiles` | 创建列表项 | `Authorization: Bearer <admin_token>` |
| PUT | `/api/admin/profiles/:id` | 更新列表项 | `Authorization: Bearer <admin_token>` |
| DELETE | `/api/admin/profiles/:id` | 删除列表项 | `Authorization: Bearer <admin_token>` |
| POST | `/api/admin/upload` | 上传图片 | `Authorization: Bearer <admin_token>` |

---

## 前端路由结构

```
/                          → 邀请码验证 + 列表页
/detail/:id                → 详情页
/admin/login               → 管理员登录
/admin/dashboard           → 管理后台首页
/admin/profiles            → 管理列表
/admin/profiles/create     → 创建新项
/admin/profiles/:id/edit   → 编辑项
```

---

## 认证流程

### 用户流程
1. 用户访问 `/` → 显示邀请码输入框
2. 输入邀请码 → 调用 `POST /api/auth/verify-code`
3. 后端验证 → 返回 JWT Token
4. 前端存储 Token（localStorage）
5. 后续请求都在 `Authorization` 头中携带 Token

### 管理员流程
1. 访问 `/admin/login` → 输入用户名/密码
2. 调用 `POST /api/auth/login`
3. 后端验证 → 返回 JWT Token
4. 前端存储 Token
5. 访问管理后台页面

---

## 距离计算

- **获取用户位置**: 使用浏览器 Geolocation API
- **计算方式**: Haversine 公式（经纬度计算直线距离）
- **后端支持**: 提供 `/api/profiles/:id/distance` 端点，接收用户坐标，返回距离

---

## 技术栈细节

### 前端依赖
- `axios`: HTTP 请求
- `wouter`: 路由管理
- `react-hook-form`: 表单管理
- `zod`: 数据验证
- `shadcn/ui`: UI 组件库
- `tailwindcss`: 样式

### 后端依赖
- `Spring Boot 3.x`
- `Spring Data JPA`: ORM
- `Spring Security`: 安全
- `JWT`: `java-jwt` 或 `jjwt`
- `MySQL Connector`: 数据库驱动
- `Lombok`: 代码简化
- `Maven`: 构建工具

---

## 环境配置

### 前端环境变量 (.env)
```
VITE_API_BASE_URL=http://localhost:8080
```

### 后端环境变量 (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/timi_db
    username: root
    password: password
  jpa:
    hibernate:
      ddl-auto: update
  jackson:
    serialization:
      write-dates-as-timestamps: false

jwt:
  secret: your-secret-key-here
  expiration: 2592000000  # 30 days in milliseconds
```

---

## 开发步骤

1. **后端开发** (Spring Boot)
   - 创建项目结构
   - 实现数据模型和数据库
   - 实现 JWT 认证
   - 实现 API 端点

2. **前端开发** (React)
   - 创建页面和路由
   - 实现邀请码验证
   - 实现列表页和详情页
   - 实现管理后台

3. **集成测试**
   - 前后端联调
   - 功能测试
   - 性能优化

---

## 安全考虑

1. **Token 有效期**: 设置合理的过期时间
2. **CORS**: 配置允许的前端域名
3. **密码加密**: 使用 BCrypt 加密管理员密码
4. **输入验证**: 前后端都要验证用户输入
5. **SQL 注入防护**: 使用 JPA 参数化查询
6. **图片上传**: 限制文件大小和类型
