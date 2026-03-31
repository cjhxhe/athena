package com.timi.dto;

import com.timi.entity.AppUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUserDTO {

    private Long id;
    private String accountId;
    private String nickname;
    private String avatarUrl;
    private Boolean privacyEnabled;
    private Long invitedByAgentId;
    private String invitedByAgentName;
    private Long inviteCodeId;
    private AppUser.UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // 不返回securityCode
}
