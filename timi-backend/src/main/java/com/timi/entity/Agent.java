package com.timi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 代理表 - 三级分销代理模式
 */
@Entity
@Table(name = "agent")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 代理名称
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * 联系方式
     */
    @Column(length = 50)
    private String contact;

    /**
     * 代理级别：1=一级代理，2=二级代理，3=三级代理
     */
    @Column(nullable = false)
    private Integer level;

    /**
     * 上级代理ID（一级代理为null）
     */
    @Column(name = "parent_agent_id")
    private Long parentAgentId;

    /**
     * 推广码（唯一）
     */
    @Column(name = "promo_code", unique = true, length = 20)
    private String promoCode;

    /**
     * 推广链接
     */
    @Column(name = "promo_link", length = 500)
    private String promoLink;

    /**
     * 推广二维码图片路径
     */
    @Column(name = "promo_qr_code", length = 500)
    private String promoQrCode;

    /**
     * 客服系统是否开启
     */
    @Column(name = "customer_service_enabled")
    private Boolean customerServiceEnabled;

    /**
     * 代理状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentStatus status;

    /**
     * 备注
     */
    @Column(columnDefinition = "TEXT")
    private String remark;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = AgentStatus.ACTIVE;
        }
        if (customerServiceEnabled == null) {
            customerServiceEnabled = true;
        }
        if (level == null) {
            level = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AgentStatus {
        ACTIVE, DISABLED
    }
}
