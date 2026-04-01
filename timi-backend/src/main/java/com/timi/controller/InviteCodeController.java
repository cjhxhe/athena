package com.timi.controller;

import com.timi.dto.InviteCodeDTO;
import com.timi.service.InviteCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invite-codes")
@RequiredArgsConstructor
@Tag(name = "邀请码接口", description = "处理邀请码相关操作")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class InviteCodeController {

    private final InviteCodeService inviteCodeService;

    /**
     * 获取所有邀请码（分页）
     */
    @Operation(summary = "获取所有邀请码", description = "分页获取所有邀请码")
    @GetMapping
    public ResponseEntity<Page<InviteCodeDTO>> getAllInviteCodes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<InviteCodeDTO> codes = inviteCodeService.getAllInviteCodes(pageable);
        return ResponseEntity.ok(codes);
    }

    /**
     * 获取单个邀请码
     */
    @Operation(summary = "获取单个邀请码", description = "根据ID获取邀请码详情")
    @GetMapping("/{id}")
    public ResponseEntity<InviteCodeDTO> getInviteCode(@PathVariable Long id) {
        InviteCodeDTO code = inviteCodeService.getInviteCode(id);
        return ResponseEntity.ok(code);
    }

    /**
     * 创建邀请码
     */
    @Operation(summary = "创建邀请码", description = "管理员创建新的邀请码")
    @PostMapping
    public ResponseEntity<InviteCodeDTO> createInviteCode(@RequestBody InviteCodeDTO dto) {
        InviteCodeDTO created = inviteCodeService.createInviteCode(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * 更新邀请码
     */
    @Operation(summary = "更新邀请码", description = "管理员更新指定的邀请码")
    @PutMapping("/{id}")
    public ResponseEntity<InviteCodeDTO> updateInviteCode(
            @PathVariable Long id,
            @RequestBody InviteCodeDTO dto) {
        InviteCodeDTO updated = inviteCodeService.updateInviteCode(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * 删除邀请码
     */
    @Operation(summary = "删除邀请码", description = "管理员删除指定的邀请码")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInviteCode(@PathVariable Long id) {
        inviteCodeService.deleteInviteCode(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 重置邀请码的使用次数
     */
    @Operation(summary = "重置邀请码使用次数", description = "重置指定邀请码的使用次数")
    @PostMapping("/{id}/reset")
    public ResponseEntity<InviteCodeDTO> resetUsageCount(@PathVariable Long id) {
        InviteCodeDTO reset = inviteCodeService.resetUsageCount(id);
        return ResponseEntity.ok(reset);
    }
}
