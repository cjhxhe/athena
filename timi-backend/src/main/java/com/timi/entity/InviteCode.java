package com.timi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 邀请码表
 */
@Entity
@Table(name = "invite_code")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InviteCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 邀请码
     */
    @Column(unique = true, nullable = false, length = 50)
    private String code;

    /**
     * 总使用次数
     */
    @Column(nullable = false)
    private Integer totalCount;

    /**
     * 剩余使用次数
     */
    @Column(nullable = false)
    private Integer usageCount;

    /**
     * 描述
     */
    @Column(length = 255)
    private String description;

    /**
     * 过期时间
     */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (totalCount == null) {
            totalCount = 1;
        }
        if (usageCount == null) {
            usageCount = totalCount;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 检查邀请码是否可用
     */
    public boolean isAvailable() {
        if (usageCount <= 0) {
            return false;
        }
        if (expiresAt != null && expiresAt.isBefore(LocalDateTime.now())) {
            return false;
        }
        return true;
    }

    /**
     * 使用邀请码（减少剩余次数）
     */
    public void use() {
        if (usageCount > 0) {
            this.usageCount--;
        }
    }
}
