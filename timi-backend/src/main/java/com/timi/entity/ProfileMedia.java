package com.timi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "profile_media")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "profile_id", nullable = false)
    private Long profileId;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String path;

    @Column(nullable = false)
    private String type; // "IMAGE" or "VIDEO"

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }
}
