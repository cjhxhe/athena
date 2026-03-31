package com.timi.service;

import com.timi.dto.AppUserDTO;
import com.timi.dto.AppUserRegisterRequest;
import com.timi.dto.AppUserUpdateRequest;
import com.timi.dto.AuthResponse;
import com.timi.entity.Agent;
import com.timi.entity.AppUser;
import com.timi.entity.InviteCode;
import com.timi.repository.AgentRepository;
import com.timi.repository.AppUserRepository;
import com.timi.repository.InviteCodeRepository;
import com.timi.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final AgentRepository agentRepository;
    private final InviteCodeRepository inviteCodeRepository;
    private final JwtUtil jwtUtil;

    /**
     * C端用户注册（通过邀请码）
     */
    @Transactional
    public AuthResponse register(AppUserRegisterRequest request) {
        // 验证邀请码
        Optional<InviteCode> inviteCodeOpt = inviteCodeRepository.findByCode(request.getInviteCode());
        if (inviteCodeOpt.isEmpty()) {
            return AuthResponse.builder().success(false).message("邀请码不存在").build();
        }
        InviteCode inviteCode = inviteCodeOpt.get();
        if (inviteCode.getUsageCount() <= 0) {
            return AuthResponse.builder().success(false).message("邀请码已达使用次数上限").build();
        }
        if (inviteCode.getExpiresAt() != null && inviteCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            return AuthResponse.builder().success(false).message("邀请码已过期").build();
        }

        // 查找代理（通过推广码）
        Long agentId = null;
        if (request.getPromoCode() != null && !request.getPromoCode().isEmpty()) {
            Optional<Agent> agentOpt = agentRepository.findByPromoCode(request.getPromoCode());
            if (agentOpt.isPresent()) {
                agentId = agentOpt.get().getId();
            }
        }

        // 生成6位随机数字accountId
        String accountId = generateUniqueAccountId();

        // 创建用户
        String nickname = request.getNickname() != null && !request.getNickname().isEmpty()
                ? request.getNickname() : "用户" + accountId;

        AppUser user = AppUser.builder()
                .accountId(accountId)
                .nickname(nickname)
                .invitedByAgentId(agentId)
                .inviteCodeId(inviteCode.getId())
                .status(AppUser.UserStatus.ACTIVE)
                .privacyEnabled(false)
                .build();
        appUserRepository.save(user);

        // 消耗邀请码
        inviteCode.use();
        inviteCodeRepository.save(inviteCode);

        // 生成token（使用user.id作为标识）
        String token = jwtUtil.generateToken(user.getId().intValue());

        return AuthResponse.builder()
                .success(true)
                .token(token)
                .message("注册成功，欢迎使用！")
                .build();
    }

    /**
     * 获取当前C端用户信息
     */
    public AppUserDTO getMyInfo(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return convertToDTO(user);
    }

    /**
     * 更新C端用户信息
     */
    @Transactional
    public AppUserDTO updateMyInfo(Long userId, AppUserUpdateRequest request) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (request.getNickname() != null) user.setNickname(request.getNickname());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getPrivacyEnabled() != null) user.setPrivacyEnabled(request.getPrivacyEnabled());
        if (request.getSecurityCode() != null) {
            // 验证安全码格式：4-8位数字+字母
            if (!request.getSecurityCode().matches("^[a-zA-Z0-9]{4,8}$")) {
                throw new RuntimeException("安全码格式不正确，需4-8位数字或字母");
            }
            user.setSecurityCode(request.getSecurityCode());
        }

        return convertToDTO(appUserRepository.save(user));
    }

    /**
     * 管理员获取C端用户列表
     */
    public Page<AppUserDTO> getAllUsers(String nickname, AppUser.UserStatus status, Pageable pageable) {
        Page<AppUser> users;
        if (nickname != null && !nickname.isEmpty()) {
            users = appUserRepository.findByNicknameContainingIgnoreCase(nickname, pageable);
        } else if (status != null) {
            users = appUserRepository.findByStatus(status, pageable);
        } else {
            users = appUserRepository.findAll(pageable);
        }
        List<AppUserDTO> dtos = users.getContent().stream().map(this::convertToDTO).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, users.getTotalElements());
    }

    /**
     * 管理员获取用户详情
     */
    public AppUserDTO getUserById(Long id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return convertToDTO(user);
    }

    /**
     * 封禁用户
     */
    @Transactional
    public AppUserDTO banUser(Long id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setStatus(AppUser.UserStatus.BANNED);
        return convertToDTO(appUserRepository.save(user));
    }

    /**
     * 停用用户
     */
    @Transactional
    public AppUserDTO disableUser(Long id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setStatus(AppUser.UserStatus.DISABLED);
        return convertToDTO(appUserRepository.save(user));
    }

    /**
     * 启用用户
     */
    @Transactional
    public AppUserDTO enableUser(Long id) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        user.setStatus(AppUser.UserStatus.ACTIVE);
        return convertToDTO(appUserRepository.save(user));
    }

    /**
     * 生成唯一6位数字accountId
     */
    private String generateUniqueAccountId() {
        Random random = new Random();
        String accountId;
        int attempts = 0;
        do {
            accountId = String.format("%06d", random.nextInt(1000000));
            attempts++;
            if (attempts > 100) throw new RuntimeException("无法生成唯一AccountId");
        } while (appUserRepository.findByAccountId(accountId).isPresent());
        return accountId;
    }

    private AppUserDTO convertToDTO(AppUser user) {
        String agentName = null;
        if (user.getInvitedByAgentId() != null) {
            agentName = agentRepository.findById(user.getInvitedByAgentId())
                    .map(Agent::getName).orElse(null);
        }
        return AppUserDTO.builder()
                .id(user.getId())
                .accountId(user.getAccountId())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .privacyEnabled(user.getPrivacyEnabled())
                .invitedByAgentId(user.getInvitedByAgentId())
                .invitedByAgentName(agentName)
                .inviteCodeId(user.getInviteCodeId())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
