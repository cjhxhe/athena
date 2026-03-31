package com.timi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 聊天消息表
 */
@Entity
@Table(name = "chat_message")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 所属会话ID
     */
    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    /**
     * 发送者类型
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false)
    private SenderType senderType;

    /**
     * 发送者ID（对应各自表的ID）
     */
    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    /**
     * 消息内容
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * 消息类型：text/image
     */
    @Column(name = "message_type", length = 20)
    private String messageType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (messageType == null) {
            messageType = "text";
        }
    }

    public enum SenderType {
        USER, AGENT, ADMIN
    }
}
