package com.timi.repository;

import com.timi.entity.AppUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByAccountId(String accountId);

    Page<AppUser> findByNicknameContainingIgnoreCase(String nickname, Pageable pageable);

    Page<AppUser> findByStatus(AppUser.UserStatus status, Pageable pageable);

    Page<AppUser> findByInvitedByAgentId(Long agentId, Pageable pageable);

    long countByStatus(AppUser.UserStatus status);

    long countByInvitedByAgentId(Long agentId);
}
