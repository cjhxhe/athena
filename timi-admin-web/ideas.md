# Timi 管理后台 - 设计方案

## 现有后端分析摘要

### 已有实体
- **User**：id, accountId(6位随机数字), username, passwordHash, role(ADMIN/USER), createdAt, updatedAt
- **Profile**：id, name, age, height, weight, size, photoUrl, photoPath, province, city, featured, latitude, longitude, services(JSON), description, createdAt, updatedAt
- **InviteCode**：id, code, totalCount, usageCount, description, expiresAt, createdAt, updatedAt
- **Dictionary**：id, dictType, dictKey, dictValue, parentId, sortOrder, latitude, longitude, createdAt, updatedAt

### 已有接口
- POST /api/auth/verify-code — 邀请码验证
- POST /api/auth/login — 管理员登录
- GET/POST/PUT/DELETE /api/profiles — Profile CRUD
- POST /api/profiles/upload — 图片上传
- GET/POST/PUT/DELETE /api/invite-codes — 邀请码管理
- GET/POST/PUT/DELETE /api/dictionaries — 字典管理

### 需要新增的后端实体和接口

#### 新增实体
1. **AppUser（C端用户）**：id, accountId(6位随机数字), nickname, avatarUrl, privacyEnabled, securityCode(4-8位), createdAt, updatedAt, status(ACTIVE/BANNED/DISABLED), invitedBy(代理ID)
2. **Agent（代理）**：id, userId, level(1/2/3), parentAgentId, promoCode, promoLink, promoQrCode, customerServiceEnabled, createdAt, updatedAt
3. **Favorite（收藏）**：id, appUserId, profileId, createdAt
4. **ChatSession（客服会话）**：id, appUserId, agentId(可空，归属代理), status(OPEN/CLOSED), createdAt, updatedAt
5. **ChatMessage（聊天消息）**：id, sessionId, senderType(USER/AGENT/ADMIN), senderId, content, createdAt
6. **Notification（通知）**：id, targetType, targetId, content, read, createdAt

#### 新增接口
- /api/admin/users — C端用户管理（列表、封禁、停用、详情）
- /api/admin/agents — 代理管理（列表、创建、编辑、删除）
- /api/admin/agents/{id}/promo — 生成推广链接和二维码
- /api/admin/chat/sessions — 客服会话列表
- /api/admin/chat/sessions/{id}/messages — 消息记录
- /api/admin/chat/sessions/{id}/send — 发送消息
- /api/admin/stats — 数据统计
- /api/c/users/register — C端用户注册
- /api/c/users/profile — C端用户信息
- /api/c/users/favorites — 收藏管理
- /api/c/chat — C端客服入口

---

## 设计方案

<response>
<probability>0.08</probability>
<text>
### 方案A：精密工业风（Precision Industrial）

**Design Movement**: Bauhaus + 现代工业设计
**Core Principles**:
1. 功能即美学——每个元素都有明确目的
2. 精确的网格系统，8px基础单位
3. 高对比度信息层次，数据优先
4. 去装饰化，以结构本身为美

**Color Philosophy**: 深炭灰(#1a1a2e) + 冷白(#f8f9fa) + 电气蓝(#0066ff) 作为强调色，传达精密和可信赖感

**Layout Paradigm**: 左侧固定导航栏(240px) + 顶部状态栏 + 主内容区，非居中布局，数据密集型表格优先

**Signature Elements**:
- 单像素分割线，无圆角卡片
- 等宽字体用于数字数据
- 状态指示灯（实心圆点）

**Typography System**: JetBrains Mono（数据）+ IBM Plex Sans（界面文字）

**Animation**: 功能性过渡，100ms以内，无装饰动画
</text>
</response>

<response>
<probability>0.07</probability>
<text>
### 方案B：新东方极简（Neo-Oriental Minimal）

**Design Movement**: 日式极简 + 现代扁平
**Core Principles**:
1. 留白即内容，信息呼吸感
2. 自然色调，避免刺眼对比
3. 微妙的层次感，通过阴影而非颜色区分
4. 文字排版作为主要视觉元素

**Color Philosophy**: 暖米白(#faf8f5) + 深墨色(#1c1c1e) + 朱砂红(#e63946) 作为强调，传达东方美学

**Layout Paradigm**: 宽松的内容区域，大量留白，卡片式布局，信息分组清晰

**Signature Elements**:
- 细线边框，微阴影
- 大号数字展示关键指标
- 渐变背景的统计卡片

**Typography System**: Noto Serif SC（标题）+ Noto Sans SC（正文）

**Animation**: 丝滑的淡入淡出，200ms ease-out
</text>
</response>

<response>
<probability>0.09</probability>
<text>
### 方案C：深色专业仪表盘（Dark Professional Dashboard）— 选定方案

**Design Movement**: 现代SaaS仪表盘 + 深色模式专业感
**Core Principles**:
1. 深色背景降低视觉疲劳，适合长时间操作
2. 颜色语义化——绿色=正常，红色=警告，蓝色=操作
3. 数据可视化优先，图表和统计突出
4. 侧边栏导航清晰分组

**Color Philosophy**: 深蓝灰背景(#0f172a slate-900) + 卡片层(#1e293b slate-800) + 天蓝强调(#38bdf8 sky-400)，传达专业、可信、现代感

**Layout Paradigm**: 固定左侧导航(260px) + 顶部Header + 主内容区，响应式折叠侧边栏

**Signature Elements**:
- 渐变色徽章和状态标签
- 数据卡片带微光效果
- 表格行悬停高亮

**Typography System**: Inter（界面）+ Roboto Mono（数字/代码）

**Animation**: 侧边栏折叠动画，页面切换淡入，表格行加载动画
</text>
</response>

---

## 选定方案：深色专业仪表盘

采用方案C，深色专业仪表盘风格，适合管理后台长时间操作场景。

## 前端页面结构

### 路由规划
```
/login                    — 管理员登录
/dashboard                — 首页仪表盘（数据统计）
/profiles                 — 内容管理（Profile列表）
/profiles/create          — 创建内容
/profiles/:id/edit        — 编辑内容
/users                    — C端用户管理
/users/:id                — 用户详情
/agents                   — 代理管理
/agents/:id               — 代理详情
/invite-codes             — 邀请码管理
/dictionaries             — 字典管理
/chat                     — 客服系统
/chat/:sessionId          — 客服会话详情
/settings                 — 系统设置
```

### 侧边栏菜单分组
1. 概览：仪表盘
2. 内容管理：Profile列表
3. 用户管理：C端用户、代理管理
4. 系统配置：邀请码、字典管理
5. 客服中心：会话列表
6. 系统设置

## 后端新增接口清单（需在 timi-backend 中实现）

### 数据库新增表
1. `app_user` — C端用户
2. `agent` — 代理信息
3. `favorite` — 收藏
4. `chat_session` — 客服会话
5. `chat_message` — 聊天消息

### 新增 API
| 路径 | 方法 | 说明 | 权限 |
|------|------|------|------|
| /api/admin/app-users | GET | C端用户列表（分页、搜索） | ADMIN |
| /api/admin/app-users/{id} | GET | 用户详情 | ADMIN |
| /api/admin/app-users/{id}/ban | PUT | 封禁用户 | ADMIN |
| /api/admin/app-users/{id}/disable | PUT | 停用用户 | ADMIN |
| /api/admin/app-users/{id}/enable | PUT | 启用用户 | ADMIN |
| /api/admin/agents | GET | 代理列表 | ADMIN |
| /api/admin/agents | POST | 创建代理 | ADMIN |
| /api/admin/agents/{id} | GET | 代理详情 | ADMIN |
| /api/admin/agents/{id} | PUT | 更新代理 | ADMIN |
| /api/admin/agents/{id} | DELETE | 删除代理 | ADMIN |
| /api/admin/agents/{id}/promo | GET | 获取推广信息 | ADMIN |
| /api/admin/chat/sessions | GET | 客服会话列表 | ADMIN |
| /api/admin/chat/sessions/{id} | GET | 会话详情 | ADMIN |
| /api/admin/chat/sessions/{id}/messages | GET | 消息记录 | ADMIN |
| /api/admin/chat/sessions/{id}/send | POST | 发送消息 | ADMIN |
| /api/admin/stats | GET | 统计数据 | ADMIN |
| /api/c/users/register | POST | C端注册 | PUBLIC |
| /api/c/users/login | POST | C端登录（邀请码） | PUBLIC |
| /api/c/users/me | GET | 获取当前用户信息 | USER |
| /api/c/users/me | PUT | 更新用户信息 | USER |
| /api/c/favorites | GET | 收藏列表 | USER |
| /api/c/favorites/{profileId} | POST | 添加收藏 | USER |
| /api/c/favorites/{profileId} | DELETE | 取消收藏 | USER |
| /api/c/chat/session | POST | 创建/获取客服会话 | USER |
| /api/c/chat/session/messages | GET | 获取消息 | USER |
| /api/c/chat/session/send | POST | 发送消息 | USER |
