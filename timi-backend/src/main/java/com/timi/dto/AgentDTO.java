package com.timi.dto;

import com.timi.entity.Agent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentDTO {

    private Long id;
    private String name;
    private String contact;
    private Integer level;
    private Long parentAgentId;
    private String parentAgentName;
    private String promoCode;
    private String promoLink;
    private String promoQrCode;
    private Boolean customerServiceEnabled;
    private Agent.AgentStatus status;
    private String remark;
    private Long subAgentCount;
    private Long userCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
