package com.timi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 客服会话表
 */
@Entity
@Table(name = "chat_session")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * C端用户ID
     */
    @Column(name = "app_user_id", nullable = false)
    private Long appUserId;

    /**
     * 归属代理ID（null表示归属超级管理员）
     */
    @Column(name = "agent_id")
    private Long agentId;

    /**
     * 会话状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    /**
     * 最后一条消息内容（用于列表预览）
     */
    @Column(name = "last_message", length = 500)
    private String lastMessage;

    /**
     * 最后消息时间
     */
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    /**
     * 未读消息数（管理员/代理侧）
     */
    @Column(name = "unread_count")
    private Integer unreadCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = SessionStatus.OPEN;
        }
        if (unreadCount == null) {
            unreadCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum SessionStatus {
        OPEN, CLOSED
    }
}
