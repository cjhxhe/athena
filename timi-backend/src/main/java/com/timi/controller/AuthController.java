package com.timi.controller;

import com.timi.dto.AuthRequest;
import com.timi.dto.AuthResponse;
import com.timi.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "认证接口", description = "处理用户认证相关操作")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    private final AuthService authService;

    /**
     * 验证邀请码
     */
    @Operation(summary = "验证邀请码", description = "验证用户提供的邀请码是否有效")
    @PostMapping("/verify-code")
    public ResponseEntity<AuthResponse> verifyCode(@RequestBody AuthRequest request) {
        AuthResponse response = authService.verifyInviteCode(request.getCode());
        return ResponseEntity.ok(response);
    }

    /**
     * 管理员登录
     */
    @Operation(summary = "管理员登录", description = "管理员通过用户名和密码登录")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = authService.adminLogin(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(response);
    }
}
