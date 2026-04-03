package com.timi.controller;

import com.timi.dto.*;
import com.timi.entity.Favorite;
import com.timi.repository.FavoriteRepository;
import com.timi.service.AppUserService;
import com.timi.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
@Tag(name = "APP用户 API", description = "APP用户接口")
public class AppUserController {

    private final AppUserService appUserService;
    private final ChatService chatService;
    private final FavoriteRepository favoriteRepository;

    // ============ 注册/登录 ============

    @Operation(summary = "用户注册", description = "用户通过提供注册信息进行注册")
    @PostMapping("/users/register")
    public Result<AuthResponse> register(@RequestBody AppUserRegisterRequest request) {
        return Result.success(appUserService.register(request));
    }

    // ============ 用户信息 ============

    @Operation(summary = "获取当前用户信息", description = "通过认证信息获取当前登录用户的详细信息")
    @GetMapping("/users/me")
    public Result<AppUserDTO> getMyInfo(Authentication authentication) {
        Long userId = getUserId(authentication);
        return Result.success(appUserService.getMyInfo(userId));
    }

    @Operation(summary = "更新当前用户信息", description = "更新当前登录用户的详细信息")
    @PutMapping("/users/me")
    public Result<AppUserDTO> updateMyInfo(
            Authentication authentication,
            @RequestBody AppUserUpdateRequest request) {
        Long userId = getUserId(authentication);
        return Result.success(appUserService.updateMyInfo(userId, request));
    }

    // ============ 收藏管理 ============

    @Operation(summary = "获取收藏列表", description = "分页获取当前用户的收藏列表")
    @GetMapping("/favorites")
    public Result<Page<Favorite>> getFavorites(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        return Result.success(favoriteRepository.findByAppUserId(userId, pageable));
    }

    @Operation(summary = "添加收藏", description = "将指定的Profile添加到收藏列表")
    @PostMapping("/favorites/{profileId}")
    public Result<Map<String, Object>> addFavorite(
            Authentication authentication,
            @PathVariable Long profileId) {
        Long userId = getUserId(authentication);
        if (favoriteRepository.existsByAppUserIdAndProfileId(userId, profileId)) {
            return Result.success(Map.of("success", false), "已收藏");
        }
        Favorite fav = Favorite.builder().appUserId(userId).profileId(profileId).build();
        favoriteRepository.save(fav);
        return Result.success(Map.of("success", true), "收藏成功");
    }

    @Operation(summary = "移除收藏", description = "从收藏列表中移除指定的Profile")
    @DeleteMapping("/favorites/{profileId}")
    public Result<Map<String, Object>> removeFavorite(
            Authentication authentication,
            @PathVariable Long profileId) {
        Long userId = getUserId(authentication);
        favoriteRepository.deleteByAppUserIdAndProfileId(userId, profileId);
        return Result.success(Map.of("success", true), "已取消收藏");
    }

    // ============ 客服 ============

    @Operation(summary = "获取或创建客服会话", description = "获取或创建当前用户的客服会话")
    @PostMapping("/chat/session")
    public Result<ChatSessionDTO> getOrCreateSession(Authentication authentication) {
        Long userId = getUserId(authentication);
        return Result.success(chatService.getOrCreateUserSession(userId));
    }

    @Operation(summary = "获取客服会话消息", description = "获取当前用户的客服会话消息")
    @GetMapping("/chat/session/messages")
    public Result<List<ChatMessageDTO>> getMyMessages(Authentication authentication) {
        Long userId = getUserId(authentication);
        ChatSessionDTO session = chatService.getOrCreateUserSession(userId);
        return Result.success(chatService.getMessages(session.getId()));
    }

    @Operation(summary = "发送客服消息", description = "发送消息到客服会话")
    @PostMapping("/chat/session/send")
    public Result<ChatMessageDTO> sendMessage(
            Authentication authentication,
            @RequestBody SendMessageRequest request) {
        Long userId = getUserId(authentication);
        return Result.success(chatService.sendUserMessage(userId, request));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication == null) throw new RuntimeException("未登录");
        return Long.valueOf(authentication.getPrincipal().toString());
    }
}
