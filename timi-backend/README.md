# Timi Backend - Spring Boot 应用

## 项目概述

这是 Timi Web 项目的后端部分，基于 Spring Boot 3.x，使用 Java 17。

## 技术栈

- **框架**: Spring Boot 3.2.0
- **Java 版本**: Java 17
- **数据库**: MySQL 8.0
- **认证**: JWT (java-jwt)
- **ORM**: Spring Data JPA
- **构建工具**: Maven

## 项目结构

```
src/main/java/com/timi/
├── controller/          # REST 控制器
│   ├── AuthController.java
│   └── ProfileController.java
├── service/            # 业务逻辑层
│   ├── AuthService.java
│   └── ProfileService.java
├── entity/             # 数据模型
│   ├── User.java
│   ├── InviteCode.java
│   └── Profile.java
├── repository/         # 数据访问层
│   ├── UserRepository.java
│   ├── InviteCodeRepository.java
│   └── ProfileRepository.java
├── dto/                # 数据传输对象
│   ├── AuthRequest.java
│   ├── AuthResponse.java
│   ├── ProfileDTO.java
│   └── DistanceRequest.java
├── security/           # 安全配置
│   ├── SecurityConfig.java
│   └── JwtAuthenticationFilter.java
├── util/               # 工具类
│   └── JwtUtil.java
└── TimiBackendApplication.java  # 启动类

src/main/resources/
├── application.yml     # 应用配置
└── data.sql           # 初始化数据
```

## 快速开始

### 前置条件

- Java 17+
- Maven 3.6+
- MySQL 8.0+

### 安装步骤

1. **克隆项目**
   ```bash
   cd /home/ubuntu/timi-backend
   ```

2. **创建数据库**
   ```sql
   CREATE DATABASE timi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **修改数据库配置** (可选)
   
   编辑 `src/main/resources/application.yml`：
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/timi_db
       username: root
       password: root
   ```

4. **编译项目**
   ```bash
   mvn clean install
   ```

5. **运行应用**
   ```bash
   mvn spring-boot:run
   ```

   应用将在 `http://localhost:8080` 启动

## API 文档

### 认证相关

#### 验证邀请码
- **URL**: `POST /api/auth/verify-code`
- **请求体**:
  ```json
  {
    "code": "TIMI2024"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "message": "邀请码验证成功"
  }
  ```

#### 管理员登录
- **URL**: `POST /api/auth/login`
- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **响应**:
  ```json
  {
    "success": true,
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "message": "登录成功"
  }
  ```

### 列表相关

#### 获取列表
- **URL**: `GET /api/profiles?page=0&size=10&name=&city=`
- **请求头**: `Authorization: Bearer <token>`
- **响应**: 分页的列表数据

#### 获取详情
- **URL**: `GET /api/profiles/{id}`
- **请求头**: `Authorization: Bearer <token>`
- **响应**: 单个列表项详情

#### 计算距离
- **URL**: `POST /api/profiles/{id}/distance`
- **请求头**: `Authorization: Bearer <token>`
- **请求体**:
  ```json
  {
    "userLatitude": 31.2304,
    "userLongitude": 121.4737
  }
  ```
- **响应**:
  ```json
  {
    "id": 1,
    "distance": "0.00",
    "unit": "km"
  }
  ```

### 管理员相关

#### 创建列表项
- **URL**: `POST /api/profiles`
- **请求头**: `Authorization: Bearer <admin_token>`
- **请求体**: ProfileDTO

#### 更新列表项
- **URL**: `PUT /api/profiles/{id}`
- **请求头**: `Authorization: Bearer <admin_token>`
- **请求体**: ProfileDTO

#### 删除列表项
- **URL**: `DELETE /api/profiles/{id}`
- **请求头**: `Authorization: Bearer <admin_token>`

## 初始化数据

### 邀请码
- `TIMI2024`
- `WELCOME123`
- `INVITE001`

### 管理员账户
- **用户名**: `admin`
- **密码**: `admin123`

## 安全配置

- JWT Token 有效期: 30 天
- 密码加密: BCrypt
- CORS 配置: 允许 `http://localhost:3000` 和 `http://localhost:5173`

## 环境变量

在 `application.yml` 中配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `spring.datasource.url` | 数据库连接 | `jdbc:mysql://localhost:3306/timi_db` |
| `spring.datasource.username` | 数据库用户 | `root` |
| `spring.datasource.password` | 数据库密码 | `root` |
| `jwt.secret` | JWT 密钥 | `your-super-secret-key-...` |
| `jwt.expiration` | Token 有效期(ms) | `2592000000` (30天) |

## 开发指南

### 添加新的 API 端点

1. 在 `entity/` 中定义数据模型
2. 在 `repository/` 中创建 Repository
3. 在 `service/` 中实现业务逻辑
4. 在 `controller/` 中创建 REST 端点
5. 在 `dto/` 中定义请求/响应对象

### 运行测试

```bash
mvn test
```

## 常见问题

### 数据库连接失败
- 检查 MySQL 是否运行
- 检查连接字符串是否正确
- 检查用户名和密码

### JWT Token 过期
- 前端需要重新获取 Token
- 可以实现 Token 刷新机制

### CORS 错误
- 检查 SecurityConfig 中的 CORS 配置
- 确保前端域名在允许列表中

## 部署

### 打包为 JAR
```bash
mvn clean package
java -jar target/timi-backend-1.0.0.jar
```

### Docker 部署
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/timi-backend-1.0.0.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## 许可证

MIT
