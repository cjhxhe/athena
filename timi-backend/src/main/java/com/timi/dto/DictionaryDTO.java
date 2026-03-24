package com.timi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DictionaryDTO {
    private Long id;
    private String dictType;
    private String dictKey;
    private String dictValue;
    private Long parentId;
    private Integer sortOrder;
    private Boolean enabled;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 用于省份-城市关联的嵌套结构
     */
    private List<DictionaryDTO> children;
}
