package com.timi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * C端用户表
 */
@Entity
@Table(name = "app_user")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 6位随机数字ID，用户可见
     */
    @Column(unique = true, nullable = false, length = 10)
    private String accountId;

    /**
     * 昵称
     */
    @Column(length = 50)
    private String nickname;

    /**
     * 头像URL
     */
    @Column(name = "avatar_url")
    private String avatarUrl;

    /**
     * 隐私开关
     */
    @Column(name = "privacy_enabled")
    private Boolean privacyEnabled;

    /**
     * 安全码（4-8位数字+字母）
     */
    @Column(name = "security_code", length = 20)
    private String securityCode;

    /**
     * 邀请人（代理）ID，关联agent表
     */
    @Column(name = "invited_by_agent_id")
    private Long invitedByAgentId;

    /**
     * 邀请码ID
     */
    @Column(name = "invite_code_id")
    private Long inviteCodeId;

    /**
     * 账号状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = UserStatus.ACTIVE;
        }
        if (privacyEnabled == null) {
            privacyEnabled = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum UserStatus {
        ACTIVE, BANNED, DISABLED
    }
}
