package com.timi.repository;

import com.timi.entity.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Page<ChatSession> findByAgentIdIsNull(Pageable pageable);

    Page<ChatSession> findByAgentId(Long agentId, Pageable pageable);

    Optional<ChatSession> findByAppUserIdAndStatus(Long appUserId, ChatSession.SessionStatus status);

    Optional<ChatSession> findByAppUserId(Long appUserId);

    long countByStatus(ChatSession.SessionStatus status);

    long countByAgentId(Long agentId);
}
