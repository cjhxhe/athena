package com.timi.controller;

import com.timi.dto.AuthRequest;
import com.timi.dto.AuthResponse;
import com.timi.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    private final AuthService authService;

    /**
     * 验证邀请码
     */
    @PostMapping("/verify-code")
    public ResponseEntity<AuthResponse> verifyCode(@RequestBody AuthRequest request) {
        AuthResponse response = authService.verifyInviteCode(request.getCode());
        return ResponseEntity.ok(response);
    }

    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = authService.adminLogin(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(response);
    }
}
