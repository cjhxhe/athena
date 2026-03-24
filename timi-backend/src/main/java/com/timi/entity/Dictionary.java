package com.timi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 字典表 - 用于管理系统中的各种分类数据
 * 如：省份、城市、服务类型、分类等
 */
@Entity
@Table(name = "dictionary")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dictionary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 字典类型：province(省份), city(城市), service_type(服务类型), category(分类)
     */
    @Column(nullable = false, length = 50, name = "dict_type")
    private String dictType;

    /**
     * 字典键（用于编程）
     */
    @Column(nullable = false, length = 100, name = "dict_key")
    private String dictKey;

    /**
     * 字典值（用于显示）
     */
    @Column(nullable = false, length = 100, name = "dict_value")
    private String dictValue;

    /**
     * 父字典 ID（用于省份-城市关联）
     * 如果是城市，parentId 指向对应省份的 ID
     */
    @Column(name = "parent_id")
    private Long parentId;

    /**
     * 排序号
     */
    @Column(name = "sort_order")
    private Integer sortOrder;

    /**
     * 纬度（用于城市定位）
     */
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    /**
     * 经度（用于城市定位）
     */
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(nullable = false, name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
