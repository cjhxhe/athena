package com.timi.service;

import com.timi.dto.InviteCodeDTO;
import com.timi.entity.InviteCode;
import com.timi.repository.InviteCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InviteCodeService {

    private final InviteCodeRepository inviteCodeRepository;

    /**
     * 获取所有邀请码（分页）
     */
    public Page<InviteCodeDTO> getAllInviteCodes(Pageable pageable) {
        Page<InviteCode> codes = inviteCodeRepository.findAll(pageable);
        return codes.map(this::convertToDTO);
    }

    /**
     * 获取单个邀请码
     */
    public InviteCodeDTO getInviteCode(Long id) {
        InviteCode code = inviteCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invite code not found"));
        return convertToDTO(code);
    }

    /**
     * 创建邀请码
     */
    public InviteCodeDTO createInviteCode(InviteCodeDTO dto) {
        // 如果没有提供 code，则自动生成
        String code = dto.getCode() != null && !dto.getCode().isEmpty()
                ? dto.getCode()
                : UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        InviteCode inviteCode = InviteCode.builder()
                .code(code)
                .usageCount(dto.getUsageCount() != null ? dto.getUsageCount() : 1)
                .totalCount(dto.getTotalCount() != null ? dto.getTotalCount() : dto.getUsageCount() != null ? dto.getUsageCount() : 1)
                .description(dto.getDescription())
                .expiresAt(dto.getExpiresAt())
                .build();

        InviteCode saved = inviteCodeRepository.save(inviteCode);
        return convertToDTO(saved);
    }

    /**
     * 更新邀请码
     */
    public InviteCodeDTO updateInviteCode(Long id, InviteCodeDTO dto) {
        InviteCode inviteCode = inviteCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invite code not found"));

        if (dto.getUsageCount() != null) inviteCode.setUsageCount(dto.getUsageCount());
        if (dto.getTotalCount() != null) inviteCode.setTotalCount(dto.getTotalCount());
        if (dto.getDescription() != null) inviteCode.setDescription(dto.getDescription());
        if (dto.getExpiresAt() != null) inviteCode.setExpiresAt(dto.getExpiresAt());

        InviteCode updated = inviteCodeRepository.save(inviteCode);
        return convertToDTO(updated);
    }

    /**
     * 删除邀请码
     */
    public void deleteInviteCode(Long id) {
        inviteCodeRepository.deleteById(id);
    }

    /**
     * 重置邀请码的使用次数
     */
    public InviteCodeDTO resetUsageCount(Long id) {
        InviteCode inviteCode = inviteCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invite code not found"));

        inviteCode.setUsageCount(inviteCode.getTotalCount());
        InviteCode updated = inviteCodeRepository.save(inviteCode);
        return convertToDTO(updated);
    }

    /**
     * 将 InviteCode 转换为 InviteCodeDTO
     */
    private InviteCodeDTO convertToDTO(InviteCode inviteCode) {
        return InviteCodeDTO.builder()
                .id(inviteCode.getId())
                .code(inviteCode.getCode())
                .usageCount(inviteCode.getUsageCount())
                .totalCount(inviteCode.getTotalCount())
                .description(inviteCode.getDescription())
                .expiresAt(inviteCode.getExpiresAt())
                .createdAt(inviteCode.getCreatedAt())
                .updatedAt(inviteCode.getUpdatedAt())
                .build();
    }
}
