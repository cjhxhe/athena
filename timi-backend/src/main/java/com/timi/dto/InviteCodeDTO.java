package com.timi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InviteCodeDTO {
    private Long id;
    private String code;
    private Integer usageCount;  // 剩余使用次数
    private Integer totalCount;  // 总使用次数
    private String description;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
