package com.timi.service;

import com.timi.dto.StatsDTO;
import com.timi.entity.Agent;
import com.timi.entity.AppUser;
import com.timi.entity.ChatSession;
import com.timi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ProfileRepository profileRepository;
    private final AppUserRepository appUserRepository;
    private final AgentRepository agentRepository;
    private final InviteCodeRepository inviteCodeRepository;
    private final ChatSessionRepository chatSessionRepository;

    public StatsDTO getStats() {
        long totalProfiles = profileRepository.count();
        long totalAppUsers = appUserRepository.count();
        long activeAppUsers = appUserRepository.countByStatus(AppUser.UserStatus.ACTIVE);
        long bannedAppUsers = appUserRepository.countByStatus(AppUser.UserStatus.BANNED);
        long totalAgents = agentRepository.count();
        long activeAgents = agentRepository.countByStatus(Agent.AgentStatus.ACTIVE);
        long totalInviteCodes = inviteCodeRepository.count();
        // 可用邀请码：usageCount > 0 且未过期，简化统计
        long openSessions = chatSessionRepository.countByStatus(ChatSession.SessionStatus.OPEN);
        long totalSessions = chatSessionRepository.count();

        return StatsDTO.builder()
                .totalProfiles(totalProfiles)
                .totalAppUsers(totalAppUsers)
                .activeAppUsers(activeAppUsers)
                .bannedAppUsers(bannedAppUsers)
                .totalAgents(totalAgents)
                .activeAgents(activeAgents)
                .totalInviteCodes(totalInviteCodes)
                .availableInviteCodes(totalInviteCodes) // 简化
                .openChatSessions(openSessions)
                .totalChatSessions(totalSessions)
                .build();
    }
}
