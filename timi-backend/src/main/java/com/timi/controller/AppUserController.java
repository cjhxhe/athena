package com.timi.controller;

import com.timi.dto.*;
import com.timi.entity.Favorite;
import com.timi.repository.FavoriteRepository;
import com.timi.service.AppUserService;
import com.timi.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * C端用户接口
 */
@RestController
@RequestMapping("/api/c")
@RequiredArgsConstructor
@CrossOrigin(origins = {"*"})
public class AppUserController {

    private final AppUserService appUserService;
    private final ChatService chatService;
    private final FavoriteRepository favoriteRepository;

    // ============ 注册/登录 ============

    @PostMapping("/users/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AppUserRegisterRequest request) {
        return ResponseEntity.ok(appUserService.register(request));
    }

    // ============ 用户信息 ============

    @GetMapping("/users/me")
    public ResponseEntity<AppUserDTO> getMyInfo(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(appUserService.getMyInfo(userId));
    }

    @PutMapping("/users/me")
    public ResponseEntity<AppUserDTO> updateMyInfo(
            Authentication authentication,
            @RequestBody AppUserUpdateRequest request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(appUserService.updateMyInfo(userId, request));
    }

    // ============ 收藏管理 ============

    @GetMapping("/favorites")
    public ResponseEntity<Page<Favorite>> getFavorites(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(favoriteRepository.findByAppUserId(userId, pageable));
    }

    @PostMapping("/favorites/{profileId}")
    public ResponseEntity<Map<String, Object>> addFavorite(
            Authentication authentication,
            @PathVariable Long profileId) {
        Long userId = getUserId(authentication);
        if (favoriteRepository.existsByAppUserIdAndProfileId(userId, profileId)) {
            return ResponseEntity.ok(Map.of("success", false, "message", "已收藏"));
        }
        Favorite fav = Favorite.builder().appUserId(userId).profileId(profileId).build();
        favoriteRepository.save(fav);
        return ResponseEntity.ok(Map.of("success", true, "message", "收藏成功"));
    }

    @DeleteMapping("/favorites/{profileId}")
    public ResponseEntity<Map<String, Object>> removeFavorite(
            Authentication authentication,
            @PathVariable Long profileId) {
        Long userId = getUserId(authentication);
        favoriteRepository.deleteByAppUserIdAndProfileId(userId, profileId);
        return ResponseEntity.ok(Map.of("success", true, "message", "已取消收藏"));
    }

    // ============ 客服 ============

    @PostMapping("/chat/session")
    public ResponseEntity<ChatSessionDTO> getOrCreateSession(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(chatService.getOrCreateUserSession(userId));
    }

    @GetMapping("/chat/session/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMyMessages(Authentication authentication) {
        Long userId = getUserId(authentication);
        ChatSessionDTO session = chatService.getOrCreateUserSession(userId);
        return ResponseEntity.ok(chatService.getMessages(session.getId()));
    }

    @PostMapping("/chat/session/send")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            Authentication authentication,
            @RequestBody SendMessageRequest request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(chatService.sendUserMessage(userId, request));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication == null) throw new RuntimeException("未登录");
        return Long.valueOf(authentication.getPrincipal().toString());
    }
}
