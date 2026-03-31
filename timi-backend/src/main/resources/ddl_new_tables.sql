-- =====================================================
-- Timi Backend - 新增表 DDL
-- 用于管理后台：代理分销、C端用户、客服系统、收藏
-- =====================================================

-- C端用户表
CREATE TABLE IF NOT EXISTS app_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id VARCHAR(10) NOT NULL UNIQUE COMMENT '6位随机数字ID',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar_path VARCHAR(500) COMMENT '头像路径',
    privacy_enabled BOOLEAN DEFAULT FALSE COMMENT '隐私开关',
    security_code VARCHAR(8) COMMENT '4-8位安全码（加密存储）',
    status ENUM('ACTIVE','BANNED','DISABLED') NOT NULL DEFAULT 'ACTIVE',
    invited_by_agent_id BIGINT COMMENT '邀请代理ID',
    invite_code_id BIGINT COMMENT '使用的邀请码ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invited_by_agent_id) REFERENCES agent(id) ON DELETE SET NULL,
    FOREIGN KEY (invite_code_id) REFERENCES invite_code(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='C端用户表';

-- 代理表
CREATE TABLE IF NOT EXISTS agent (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '代理名称',
    contact VARCHAR(200) COMMENT '联系方式',
    level TINYINT NOT NULL DEFAULT 1 COMMENT '代理级别 1/2/3',
    parent_agent_id BIGINT COMMENT '上级代理ID',
    promo_code VARCHAR(20) UNIQUE COMMENT '推广码',
    promo_link VARCHAR(500) COMMENT '推广链接',
    promo_qr_code VARCHAR(500) COMMENT '推广二维码路径',
    customer_service_enabled BOOLEAN DEFAULT TRUE COMMENT '客服开关',
    status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_agent_id) REFERENCES agent(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='代理表';

-- 收藏表
CREATE TABLE IF NOT EXISTS favorite (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    app_user_id BIGINT NOT NULL,
    profile_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_profile (app_user_id, profile_id),
    FOREIGN KEY (app_user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- 客服会话表
CREATE TABLE IF NOT EXISTS chat_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    app_user_id BIGINT NOT NULL COMMENT 'C端用户ID',
    agent_id BIGINT COMMENT '归属代理ID（NULL表示归属超级管理员）',
    status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
    last_message TEXT COMMENT '最后一条消息内容',
    last_message_at DATETIME COMMENT '最后消息时间',
    unread_count INT DEFAULT 0 COMMENT '未读消息数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (app_user_id) REFERENCES app_user(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agent(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客服会话表';

-- 聊天消息表
CREATE TABLE IF NOT EXISTS chat_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    sender_type ENUM('USER','AGENT','ADMIN') NOT NULL COMMENT '发送方类型',
    sender_id BIGINT COMMENT '发送方ID',
    sender_name VARCHAR(100) COMMENT '发送方显示名称',
    content TEXT NOT NULL COMMENT '消息内容',
    message_type VARCHAR(20) DEFAULT 'text' COMMENT '消息类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_session(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息表';

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_app_user_status ON app_user(status);
CREATE INDEX IF NOT EXISTS idx_app_user_agent ON app_user(invited_by_agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_level ON agent(level);
CREATE INDEX IF NOT EXISTS idx_agent_parent ON agent(parent_agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_user ON chat_session(app_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_agent ON chat_session(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_session_status ON chat_session(status);
CREATE INDEX IF NOT EXISTS idx_chat_message_session ON chat_message(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_created ON chat_message(created_at);
