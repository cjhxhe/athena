-- 初始化邀请码
INSERT INTO invite_codes (code, max_usage, usage_count, expires_at) VALUES
('TIMI2024', 100, 0, DATE_ADD(NOW(), INTERVAL 365 DAY)),
('WELCOME123', 50, 0, DATE_ADD(NOW(), INTERVAL 365 DAY)),
('INVITE001', 100, 0, DATE_ADD(NOW(), INTERVAL 365 DAY));

-- 初始化管理员用户
-- 密码: admin123 (BCrypt 加密后)
INSERT INTO users (account_id, username, password_hash, role) VALUES 
(1, 'admin', '$2a$10$d8/7F3eIby02KMTiaqJb/u5xlT5V8x2NcuhjHPgHTSVCXaW6NogRK', 'ADMIN');

-- 初始化列表项数据
INSERT INTO profiles (name, age, height, weight, size, photo_url, city, latitude, longitude, services, description) VALUES 
('李明', 28, 175.50, 70.00, 'M', 'https://via.placeholder.com/300', '上海', 31.2304, 121.4737, '["按摩", "咨询"]', '专业按摩师'),
('王芳', 26, 165.00, 55.00, 'S', 'https://via.placeholder.com/300', '北京', 39.9042, 116.4074, '["美容", "护肤"]', '美容顾问'),
('张丽', 30, 168.00, 60.00, 'M', 'https://via.placeholder.com/300', '深圳', 22.5431, 114.0579, '["健身", "瑜伽"]', '健身教练'),
('刘静', 25, 162.00, 52.00, 'XS', 'https://via.placeholder.com/300', '杭州', 30.2741, 120.1551, '["舞蹈", "瑜伽"]', '舞蹈老师'),
('陈红', 29, 170.00, 65.00, 'M', 'https://via.placeholder.com/300', '武汉', 30.5928, 114.3055, '["咨询", "心理"]', '心理咨询师');
