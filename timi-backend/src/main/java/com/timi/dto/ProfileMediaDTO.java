package com.timi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileMediaDTO {
    private Long id;
    private String url;
    private String path;
    private String type; // "IMAGE" or "VIDEO"
    private Integer sortOrder;
}
