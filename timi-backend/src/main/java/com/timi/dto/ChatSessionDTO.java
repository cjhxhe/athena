package com.timi.dto;

import com.timi.entity.ChatSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionDTO {

    private Long id;
    private Long appUserId;
    private String appUserNickname;
    private String appUserAccountId;
    private Long agentId;
    private String agentName;
    private ChatSession.SessionStatus status;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Integer unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
