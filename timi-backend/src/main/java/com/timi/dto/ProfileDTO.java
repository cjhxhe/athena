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
public class ProfileDTO {
    private Long id;
    private String name;
    private Integer age;
    private BigDecimal height;
    private BigDecimal weight;
    private String size;
    private String photoUrl;
    private String photoPath;  // 相对路径，用于上传到服务器的图片
    private String province;  // 省份
    private String city;
    private Boolean featured;  // 是否精选
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<String> services;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double distance;  // For distance calculation
}
