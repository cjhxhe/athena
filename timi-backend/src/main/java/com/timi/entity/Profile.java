package com.timi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private Integer age;

    @Column
    private BigDecimal height;

    @Column
    private BigDecimal weight;

    @Column
    private String size;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "photo_path")
    private String photoPath;  // 相对路径，用于上传到服务器的图片

    @Column
    private String province;  // 省份

    @Column
    private String city;

    @Column(nullable = false)
    private Boolean featured;  // 是否精选

    @Column
    private BigDecimal latitude;

    @Column
    private BigDecimal longitude;

    @Column(columnDefinition = "JSON")
    private String services;  // JSON format: ["service1", "service2"]

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (featured == null) {
            featured = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
