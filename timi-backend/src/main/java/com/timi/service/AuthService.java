package com.timi.service;

import com.timi.dto.AuthRequest;
import com.timi.dto.AuthResponse;
import com.timi.entity.InviteCode;
import com.timi.entity.User;
import com.timi.repository.InviteCodeRepository;
import com.timi.repository.UserRepository;
import com.timi.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final InviteCodeRepository inviteCodeRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    /**
     * 验证邀请码
     */
    public AuthResponse verifyInviteCode(String code) {
        Optional<InviteCode> inviteCodeOpt = inviteCodeRepository.findByCode(code);

        if (inviteCodeOpt.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("邀请码不存在")
                    .build();
        }

        InviteCode inviteCode = inviteCodeOpt.get();

        // 检查邀请码是否可用（使用次数是否已达上限）
        if (inviteCode.getUsageCount() >= inviteCode.getTotalCount()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("邀请码已达使用次数上限")
                    .build();
        }

        // 检查邀请码是否过期
        if (inviteCode.getExpiresAt() != null && inviteCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("邀请码已过期")
                    .build();
        }

        // 生成 Token（使用邀请码 ID 作为 account_id）
        String token = jwtUtil.generateToken(Math.toIntExact(inviteCode.getId()));

        // 增加邀请码使用次数
        inviteCode.use();
        inviteCodeRepository.save(inviteCode);

        return AuthResponse.builder()
                .success(true)
                .token(token)
                .message("邀请码验证成功")
                .build();
    }

    /**
     * 管理员登录
     */
    public AuthResponse adminLogin(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("用户不存在")
                    .build();
        }

        User user = userOpt.get();

        // 检查密码
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("密码错误")
                    .build();
        }

        // 检查权限
        if (!user.getRole().equals(User.UserRole.ADMIN)) {
            return AuthResponse.builder()
                    .success(false)
                    .message("无管理员权限")
                    .build();
        }

        // 生成 Token
        String token = jwtUtil.generateToken(user.getAccountId());

        return AuthResponse.builder()
                .success(true)
                .token(token)
                .message("登录成功")
                .build();
    }
}
