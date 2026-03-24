# Timi Web - 列表管理系统

一个现代化的前后端分离 Web 应用，包含用户端列表展示和管理员后台管理功能。

## 🎯 项目特性

- ✅ **邀请码认证系统** - 使用邀请码进行访问控制
- ✅ **JWT Token 鉴权** - 安全的用户认证机制
- ✅ **地理位置计算** - 基于 Haversine 公式的距离计算
- ✅ **响应式设计** - 完美适配各种屏幕尺寸
- ✅ **管理后台** - 完整的数据 CRUD 操作
- ✅ **现代 UI 设计** - 极简主义 + 温暖人文风格

## 📦 技术栈

### 前端
- **框架**: React 19
- **样式**: Tailwind CSS 4
- **路由**: Wouter
- **HTTP 客户端**: Axios
- **表单管理**: React Hook Form
- **UI 组件**: shadcn/ui
- **构建工具**: Vite

### 后端
- **框架**: Spring Boot 3.2
- **Java 版本**: Java 17
- **数据库**: MySQL 8.0
- **认证**: JWT (java-jwt)
- **ORM**: Spring Data JPA
- **构建工具**: Maven

## 🚀 快速开始

### 前置条件

- Node.js 18+
- Java 17+
- MySQL 8.0+
- Maven 3.6+
- pnpm 10+

### 安装步骤

#### 1. 克隆项目

```bash
cd /home/ubuntu
# 前端项目已在 timi-web 目录
# 后端项目已在 timi-backend 目录
```

#### 2. 启动后端

```bash
cd /home/ubuntu/timi-backend

# 创建数据库
mysql -u root -p
> CREATE DATABASE timi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 编译并运行
mvn clean install
mvn spring-boot:run
```

后端将在 `http://localhost:8080` 启动

#### 3. 启动前端

```bash
cd /home/ubuntu/timi-web

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

前端将在 `http://localhost:5173` 启动

## 📖 使用指南

### 用户流程

1. **访问应用**
   - 打开 `http://localhost:5173`
   - 自动重定向到邀请码验证页面

2. **输入邀请码**
   - 邀请码: `TIMI2024`、`WELCOME123` 或 `INVITE001`
   - 验证成功后获得 JWT Token

3. **浏览列表**
   - 查看 4 列网格布局的列表项
   - 使用搜索和筛选功能
   - 点击项目查看详情

4. **查看详情**
   - 查看完整的个人信息
   - 点击"查看距离"计算距离
   - 复制名字到剪贴板

### 管理员流程

1. **进入管理后台**
   - 在列表页右上角点击设置图标
   - 或直接访问 `http://localhost:5173/admin/login`

2. **管理员登录**
   - 用户名: `admin`
   - 密码: `admin123`

3. **管理数据**
   - 查看所有列表项
   - 创建新项
   - 编辑现有项
   - 删除项

## 🗂️ 项目结构

```
/home/ubuntu/
├── timi-web/                    # 前端项目
│   ├── client/
│   │   ├── src/
│   │   │   ├── pages/          # 页面组件
│   │   │   ├── components/     # 可复用组件
│   │   │   ├── contexts/       # React 上下文
│   │   │   ├── lib/            # 工具函数和 API
│   │   │   ├── App.tsx         # 主应用
│   │   │   └── index.css       # 全局样式
│   │   ├── public/             # 静态资源
│   │   └── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── PROJECT_ARCHITECTURE.md # 架构设计文档
│   ├── DESIGN_PHILOSOPHY.md    # 设计理念
│   └── DEPLOYMENT_GUIDE.md     # 部署指南
│
└── timi-backend/                # 后端项目
    ├── src/main/java/com/timi/
    │   ├── controller/          # REST 控制器
    │   ├── service/             # 业务逻辑
    │   ├── entity/              # 数据模型
    │   ├── repository/          # 数据访问
    │   ├── dto/                 # 数据传输对象
    │   ├── security/            # 安全配置
    │   ├── util/                # 工具类
    │   └── TimiBackendApplication.java
    ├── src/main/resources/
    │   ├── application.yml      # 应用配置
    │   └── data.sql             # 初始化数据
    ├── pom.xml
    └── README.md
```

## 🔐 认证流程

### 邀请码验证

```
用户输入邀请码 
    ↓
POST /api/auth/verify-code
    ↓
后端验证邀请码
    ↓
生成 JWT Token
    ↓
标记邀请码为已使用
    ↓
返回 Token 给前端
    ↓
前端保存到 localStorage
    ↓
后续请求都在 Authorization 头中携带 Token
```

### 管理员登录

```
用户输入用户名和密码
    ↓
POST /api/auth/login
    ↓
后端验证用户名和密码
    ↓
检查用户权限
    ↓
生成 JWT Token
    ↓
返回 Token 给前端
    ↓
前端保存到 localStorage
    ↓
访问管理后台
```

## 📡 API 文档

### 认证 API

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/auth/verify-code` | 验证邀请码 |
| POST | `/api/auth/login` | 管理员登录 |

### 列表 API

| 方法 | 端点 | 描述 | 需要认证 |
|------|------|------|---------|
| GET | `/api/profiles` | 获取列表 | ✅ |
| GET | `/api/profiles/:id` | 获取详情 | ✅ |
| POST | `/api/profiles/:id/distance` | 计算距离 | ✅ |
| POST | `/api/profiles` | 创建项 | ✅ |
| PUT | `/api/profiles/:id` | 更新项 | ✅ |
| DELETE | `/api/profiles/:id` | 删除项 | ✅ |

## 🎨 设计系统

### 色彩系统
- **主色**: 金色 (`oklch(0.7 0.15 70)`)
- **辅助色**: 浅橙 (`oklch(0.85 0.1 45)`)
- **背景**: 米白 (`oklch(0.98 0.002 70)`)
- **文字**: 深灰 (`oklch(0.3 0.01 65)`)

### 排版系统
- **标题**: Playfair Display (600-700 weight)
- **正文**: Noto Sans SC (400-500 weight)

### 响应式设计
- 移动端: 1 列
- 平板: 2 列
- 桌面: 4 列

## 🧪 测试

### 前端测试

```bash
cd /home/ubuntu/timi-web

# 运行类型检查
pnpm check

# 运行构建
pnpm build

# 预览生产构建
pnpm preview
```

### 后端测试

```bash
cd /home/ubuntu/timi-backend

# 运行测试
mvn test

# 运行类型检查
mvn clean compile
```

## 📝 初始化数据

### 邀请码
- `TIMI2024`
- `WELCOME123`
- `INVITE001`

### 管理员账户
- **用户名**: `admin`
- **密码**: `admin123`

### 示例列表数据
数据库中已预置 5 条示例数据，包括不同城市的信息。

## 🚢 部署

### 前端部署

前端项目可以部署到任何静态托管服务（如 Manus、Vercel、Netlify 等）。

```bash
cd /home/ubuntu/timi-web
pnpm build
# 部署 dist 目录
```

### 后端部署

后端项目可以部署为 Docker 容器或传统 Java 应用。

```bash
cd /home/ubuntu/timi-backend
mvn clean package
java -jar target/timi-backend-1.0.0.jar
```

## 🔧 配置

### 前端环境变量

在 `.env` 文件中配置：
```
VITE_API_BASE_URL=http://localhost:8080
```

### 后端环境变量

在 `application.yml` 中配置：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/timi_db
    username: root
    password: root
  jpa:
    hibernate:
      ddl-auto: update

jwt:
  secret: your-secret-key
  expiration: 2592000000  # 30 days
```

## 📚 文档

- [项目架构设计](./PROJECT_ARCHITECTURE.md)
- [设计理念](./DESIGN_PHILOSOPHY.md)
- [部署和测试指南](./DEPLOYMENT_GUIDE.md)
- [后端 README](../timi-backend/README.md)

## 🐛 常见问题

### 前端无法连接后端
- 检查后端是否运行在 `http://localhost:8080`
- 检查 CORS 配置

### 邀请码验证失败
- 检查邀请码是否存在于数据库
- 检查邀请码是否已被使用

### 管理员登录失败
- 检查用户名和密码
- 检查用户角色是否为 ADMIN

## 📞 支持

如有问题或建议，请联系开发团队。

## 📄 许可证

MIT

---

**版本**: 1.0.0  
**最后更新**: 2024 年 3 月 23 日
