package com.timi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUserUpdateRequest {

    private String nickname;
    private String avatarUrl;
    private Boolean privacyEnabled;
    private String securityCode;
}
