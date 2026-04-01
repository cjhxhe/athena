package com.timi.controller;

import com.timi.dto.*;
import com.timi.entity.AppUser;
import com.timi.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin API", description = "管理员接口")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "*"})
public class AdminController {

    private final AppUserService appUserService;
    private final AgentService agentService;
    private final ChatService chatService;
    private final StatsService statsService;

    // ============ 统计数据 ============
    @Operation(summary = "获取统计数据", description = "获取系统的统计数据")
    @GetMapping("/stats")
    public ResponseEntity<StatsDTO> getStats() {
        return ResponseEntity.ok(statsService.getStats());
    }

    // ============ C端用户管理 ============

    @Operation(summary = "获取C端用户列表", description = "分页获取C端用户列表，可按昵称和状态筛选")
    @GetMapping("/app-users")
    public ResponseEntity<Page<AppUserDTO>> getAppUsers(
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        AppUser.UserStatus userStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                userStatus = AppUser.UserStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(appUserService.getAllUsers(nickname, userStatus, pageable));
    }

    @Operation(summary = "获取单个C端用户信息", description = "根据用户ID获取用户详细信息")
    @GetMapping("/app-users/{id}")
    public ResponseEntity<AppUserDTO> getAppUser(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.getUserById(id));
    }

    @Operation(summary = "禁用用户", description = "禁用指定用户")
    @PutMapping("/app-users/{id}/ban")
    public ResponseEntity<AppUserDTO> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.banUser(id));
    }

    @Operation(summary = "禁用用户登录", description = "禁用指定用户的登录权限")
    @PutMapping("/app-users/{id}/disable")
    public ResponseEntity<AppUserDTO> disableUser(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.disableUser(id));
    }

    @Operation(summary = "启用用户登录", description = "启用指定用户的登录权限")
    @PutMapping("/app-users/{id}/enable")
    public ResponseEntity<AppUserDTO> enableUser(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.enableUser(id));
    }

    // ============ 代理管理 ============

    @Operation(summary = "获取代理列表", description = "分页获取代理列表，可按名称和等级筛选")
    @GetMapping("/agents")
    public ResponseEntity<Page<AgentDTO>> getAgents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(agentService.getAllAgents(name, level, pageable));
    }

    @Operation(summary = "获取代理详情", description = "根据ID获取代理详情")
    @GetMapping("/agents/{id}")
    public ResponseEntity<AgentDTO> getAgent(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getAgentById(id));
    }

    @Operation(summary = "创建代理", description = "管理员创建新的代理")
    @PostMapping("/agents")
    public ResponseEntity<AgentDTO> createAgent(@RequestBody AgentDTO dto) {
        return ResponseEntity.ok(agentService.createAgent(dto));
    }

    @Operation(summary = "更新代理信息", description = "管理员更新指定代理信息")
    @PutMapping("/agents/{id}")
    public ResponseEntity<AgentDTO> updateAgent(@PathVariable Long id, @RequestBody AgentDTO dto) {
        return ResponseEntity.ok(agentService.updateAgent(id, dto));
    }

    @Operation(summary = "删除代理", description = "管理员删除指定代理")
    @DeleteMapping("/agents/{id}")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "获取子代理列表", description = "获取指定代理的子代理列表")
    @GetMapping("/agents/{id}/sub-agents")
    public ResponseEntity<List<AgentDTO>> getSubAgents(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getSubAgents(id));
    }

    @Operation(summary = "切换客服功能", description = "启用或禁用代理的客服功能")
    @PutMapping("/agents/{id}/customer-service")
    public ResponseEntity<AgentDTO> toggleCustomerService(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", true);
        return ResponseEntity.ok(agentService.toggleCustomerService(id, enabled));
    }

    // ============ 客服管理 ============

    @Operation(summary = "获取客服会话列表", description = "分页获取所有客服会话")
    @GetMapping("/chat/sessions")
    public ResponseEntity<Page<ChatSessionDTO>> getChatSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        return ResponseEntity.ok(chatService.getAllSessions(pageable));
    }

    @Operation(summary = "获取客服会话详情", description = "根据ID获取客服会话详情")
    @GetMapping("/chat/sessions/{id}")
    public ResponseEntity<ChatSessionDTO> getChatSession(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getSession(id));
    }

    @Operation(summary = "获取会话消息", description = "获取指定会话的消息列表")
    @GetMapping("/chat/sessions/{id}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getMessages(id));
    }

    @Operation(summary = "发送客服消息", description = "发送消息到指定客服会话")
    @PostMapping("/chat/sessions/{id}/send")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @PathVariable Long id,
            @RequestBody SendMessageRequest request,
            Authentication authentication) {
        // 使用认证中的accountId作为管理员ID
        Long adminId = authentication != null ? Long.valueOf(authentication.getPrincipal().toString()) : 1L;
        chatService.resetUnread(id);
        return ResponseEntity.ok(chatService.sendAdminMessage(id, request, adminId));
    }

    @Operation(summary = "关闭客服会话", description = "关闭指定客服会话")
    @PutMapping("/chat/sessions/{id}/close")
    public ResponseEntity<Void> closeSession(@PathVariable Long id) {
        chatService.closeSession(id);
        return ResponseEntity.noContent().build();
    }
}
