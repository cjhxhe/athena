package com.timi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUserRegisterRequest {

    /**
     * 邀请码（必填）
     */
    private String inviteCode;

    /**
     * 推广码（代理推广链接中的promoCode，可选）
     */
    private String promoCode;

    /**
     * 昵称（可选，默认用accountId）
     */
    private String nickname;
}
