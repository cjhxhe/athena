package com.timi.service;

import com.timi.dto.ChatMessageDTO;
import com.timi.dto.ChatSessionDTO;
import com.timi.dto.SendMessageRequest;
import com.timi.entity.*;
import com.timi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AppUserRepository appUserRepository;
    private final AgentRepository agentRepository;

    /**
     * 管理员获取所有会话（不属于任何代理的会话）
     */
    public Page<ChatSessionDTO> getAdminSessions(Pageable pageable) {
        Page<ChatSession> sessions = chatSessionRepository.findByAgentIdIsNull(pageable);
        return convertSessionPage(sessions, pageable);
    }

    /**
     * 获取所有会话（管理员可见全部）
     */
    public Page<ChatSessionDTO> getAllSessions(Pageable pageable) {
        Page<ChatSession> sessions = chatSessionRepository.findAll(pageable);
        return convertSessionPage(sessions, pageable);
    }

    /**
     * 代理获取自己的会话
     */
    public Page<ChatSessionDTO> getAgentSessions(Long agentId, Pageable pageable) {
        Page<ChatSession> sessions = chatSessionRepository.findByAgentId(agentId, pageable);
        return convertSessionPage(sessions, pageable);
    }

    /**
     * 获取会话详情
     */
    public ChatSessionDTO getSession(Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));
        return convertSessionToDTO(session);
    }

    /**
     * 获取会话消息列表
     */
    public List<ChatMessageDTO> getMessages(Long sessionId) {
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream().map(this::convertMessageToDTO).collect(Collectors.toList());
    }

    /**
     * 管理员/代理发送消息
     */
    @Transactional
    public ChatMessageDTO sendAdminMessage(Long sessionId, SendMessageRequest request, Long adminId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));

        ChatMessage message = ChatMessage.builder()
                .sessionId(sessionId)
                .senderType(ChatMessage.SenderType.ADMIN)
                .senderId(adminId)
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : "text")
                .build();
        chatMessageRepository.save(message);

        // 更新会话最后消息
        session.setLastMessage(request.getContent());
        session.setLastMessageAt(message.getCreatedAt());
        chatSessionRepository.save(session);

        return convertMessageToDTO(message);
    }

    /**
     * C端用户创建或获取会话
     */
    @Transactional
    public ChatSessionDTO getOrCreateUserSession(Long appUserId) {
        // 查找用户是否已有开放会话
        Optional<ChatSession> existingSession = chatSessionRepository
                .findByAppUserIdAndStatus(appUserId, ChatSession.SessionStatus.OPEN);
        if (existingSession.isPresent()) {
            return convertSessionToDTO(existingSession.get());
        }

        // 确定归属代理
        Long agentId = null;
        AppUser user = appUserRepository.findById(appUserId).orElse(null);
        if (user != null && user.getInvitedByAgentId() != null) {
            // 检查代理客服是否开启
            Agent agent = agentRepository.findById(user.getInvitedByAgentId()).orElse(null);
            if (agent != null && Boolean.TRUE.equals(agent.getCustomerServiceEnabled())) {
                agentId = agent.getId();
            } else if (agent != null && !Boolean.TRUE.equals(agent.getCustomerServiceEnabled())) {
                // 代理关闭客服，尝试上级代理
                agentId = findActiveParentAgent(agent);
            }
        }

        ChatSession session = ChatSession.builder()
                .appUserId(appUserId)
                .agentId(agentId)
                .status(ChatSession.SessionStatus.OPEN)
                .unreadCount(0)
                .build();
        chatSessionRepository.save(session);
        return convertSessionToDTO(session);
    }

    /**
     * C端用户发送消息
     */
    @Transactional
    public ChatMessageDTO sendUserMessage(Long appUserId, SendMessageRequest request) {
        ChatSession session = chatSessionRepository.findByAppUserIdAndStatus(appUserId, ChatSession.SessionStatus.OPEN)
                .orElseGet(() -> {
                    ChatSessionDTO dto = getOrCreateUserSession(appUserId);
                    return chatSessionRepository.findById(dto.getId()).orElseThrow();
                });

        ChatMessage message = ChatMessage.builder()
                .sessionId(session.getId())
                .senderType(ChatMessage.SenderType.USER)
                .senderId(appUserId)
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : "text")
                .build();
        chatMessageRepository.save(message);

        session.setLastMessage(request.getContent());
        session.setLastMessageAt(message.getCreatedAt());
        session.setUnreadCount(session.getUnreadCount() + 1);
        chatSessionRepository.save(session);

        return convertMessageToDTO(message);
    }

    /**
     * 关闭会话
     */
    @Transactional
    public void closeSession(Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));
        session.setStatus(ChatSession.SessionStatus.CLOSED);
        chatSessionRepository.save(session);
    }

    /**
     * 重置未读数
     */
    @Transactional
    public void resetUnread(Long sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("会话不存在"));
        session.setUnreadCount(0);
        chatSessionRepository.save(session);
    }

    /**
     * 递归查找开启客服的上级代理，直到超级管理员（返回null）
     */
    private Long findActiveParentAgent(Agent agent) {
        if (agent.getParentAgentId() == null) {
            return null; // 归属超级管理员
        }
        Agent parent = agentRepository.findById(agent.getParentAgentId()).orElse(null);
        if (parent == null) return null;
        if (Boolean.TRUE.equals(parent.getCustomerServiceEnabled())) {
            return parent.getId();
        }
        return findActiveParentAgent(parent);
    }

    private Page<ChatSessionDTO> convertSessionPage(Page<ChatSession> sessions, Pageable pageable) {
        List<ChatSessionDTO> dtos = sessions.getContent().stream()
                .map(this::convertSessionToDTO).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, sessions.getTotalElements());
    }

    private ChatSessionDTO convertSessionToDTO(ChatSession session) {
        String userNickname = null;
        String userAccountId = null;
        if (session.getAppUserId() != null) {
            AppUser user = appUserRepository.findById(session.getAppUserId()).orElse(null);
            if (user != null) {
                userNickname = user.getNickname();
                userAccountId = user.getAccountId();
            }
        }
        String agentName = null;
        if (session.getAgentId() != null) {
            agentName = agentRepository.findById(session.getAgentId())
                    .map(Agent::getName).orElse(null);
        }
        return ChatSessionDTO.builder()
                .id(session.getId())
                .appUserId(session.getAppUserId())
                .appUserNickname(userNickname)
                .appUserAccountId(userAccountId)
                .agentId(session.getAgentId())
                .agentName(agentName)
                .status(session.getStatus())
                .lastMessage(session.getLastMessage())
                .lastMessageAt(session.getLastMessageAt())
                .unreadCount(session.getUnreadCount())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    private ChatMessageDTO convertMessageToDTO(ChatMessage message) {
        String senderName = null;
        if (message.getSenderType() == ChatMessage.SenderType.USER) {
            AppUser user = appUserRepository.findById(message.getSenderId()).orElse(null);
            senderName = user != null ? user.getNickname() : "用户";
        } else if (message.getSenderType() == ChatMessage.SenderType.AGENT) {
            Agent agent = agentRepository.findById(message.getSenderId()).orElse(null);
            senderName = agent != null ? agent.getName() : "代理";
        } else {
            senderName = "管理员";
        }
        return ChatMessageDTO.builder()
                .id(message.getId())
                .sessionId(message.getSessionId())
                .senderType(message.getSenderType())
                .senderId(message.getSenderId())
                .senderName(senderName)
                .content(message.getContent())
                .messageType(message.getMessageType())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
