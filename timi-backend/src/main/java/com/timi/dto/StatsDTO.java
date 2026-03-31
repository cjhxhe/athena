package com.timi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsDTO {

    private Long totalProfiles;
    private Long totalAppUsers;
    private Long activeAppUsers;
    private Long bannedAppUsers;
    private Long totalAgents;
    private Long activeAgents;
    private Long totalInviteCodes;
    private Long availableInviteCodes;
    private Long openChatSessions;
    private Long totalChatSessions;
}
