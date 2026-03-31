package com.timi.controller;

import com.timi.dto.*;
import com.timi.entity.AppUser;
import com.timi.service.*;
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
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "*"})
public class AdminController {

    private final AppUserService appUserService;
    private final AgentService agentService;
    private final ChatService chatService;
    private final StatsService statsService;

    // ============ 统计数据 ============

    @GetMapping("/stats")
    public ResponseEntity<StatsDTO> getStats() {
        return ResponseEntity.ok(statsService.getStats());
    }

    // ============ C端用户管理 ============

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

    @GetMapping("/app-users/{id}")
    public ResponseEntity<AppUserDTO> getAppUser(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.getUserById(id));
    }

    @PutMapping("/app-users/{id}/ban")
    public ResponseEntity<AppUserDTO> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.banUser(id));
    }

    @PutMapping("/app-users/{id}/disable")
    public ResponseEntity<AppUserDTO> disableUser(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.disableUser(id));
    }

    @PutMapping("/app-users/{id}/enable")
    public ResponseEntity<AppUserDTO> enableUser(@PathVariable Long id) {
        return ResponseEntity.ok(appUserService.enableUser(id));
    }

    // ============ 代理管理 ============

    @GetMapping("/agents")
    public ResponseEntity<Page<AgentDTO>> getAgents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(agentService.getAllAgents(name, level, pageable));
    }

    @GetMapping("/agents/{id}")
    public ResponseEntity<AgentDTO> getAgent(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getAgentById(id));
    }

    @PostMapping("/agents")
    public ResponseEntity<AgentDTO> createAgent(@RequestBody AgentDTO dto) {
        return ResponseEntity.ok(agentService.createAgent(dto));
    }

    @PutMapping("/agents/{id}")
    public ResponseEntity<AgentDTO> updateAgent(@PathVariable Long id, @RequestBody AgentDTO dto) {
        return ResponseEntity.ok(agentService.updateAgent(id, dto));
    }

    @DeleteMapping("/agents/{id}")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/agents/{id}/sub-agents")
    public ResponseEntity<List<AgentDTO>> getSubAgents(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getSubAgents(id));
    }

    @PutMapping("/agents/{id}/customer-service")
    public ResponseEntity<AgentDTO> toggleCustomerService(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", true);
        return ResponseEntity.ok(agentService.toggleCustomerService(id, enabled));
    }

    // ============ 客服管理 ============

    @GetMapping("/chat/sessions")
    public ResponseEntity<Page<ChatSessionDTO>> getChatSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        return ResponseEntity.ok(chatService.getAllSessions(pageable));
    }

    @GetMapping("/chat/sessions/{id}")
    public ResponseEntity<ChatSessionDTO> getChatSession(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getSession(id));
    }

    @GetMapping("/chat/sessions/{id}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getMessages(id));
    }

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

    @PutMapping("/chat/sessions/{id}/close")
    public ResponseEntity<Void> closeSession(@PathVariable Long id) {
        chatService.closeSession(id);
        return ResponseEntity.noContent().build();
    }
}
