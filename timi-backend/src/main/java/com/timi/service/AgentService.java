package com.timi.service;

import com.timi.dto.AgentDTO;
import com.timi.entity.Agent;
import com.timi.repository.AgentRepository;
import com.timi.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;
    private final AppUserRepository appUserRepository;

    /**
     * 获取代理列表
     */
    public Page<AgentDTO> getAllAgents(String name, Integer level, Pageable pageable) {
        Page<Agent> agents;
        if (name != null && !name.isEmpty()) {
            agents = agentRepository.findByNameContainingIgnoreCase(name, pageable);
        } else if (level != null) {
            agents = agentRepository.findByLevel(level, pageable);
        } else {
            agents = agentRepository.findAll(pageable);
        }
        List<AgentDTO> dtos = agents.getContent().stream().map(this::convertToDTO).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, agents.getTotalElements());
    }

    /**
     * 获取代理详情
     */
    public AgentDTO getAgentById(Long id) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("代理不存在"));
        return convertToDTO(agent);
    }

    /**
     * 创建代理
     */
    @Transactional
    public AgentDTO createAgent(AgentDTO dto) {
        // 生成唯一推广码
        String promoCode = generateUniquePromoCode();

        Agent agent = Agent.builder()
                .name(dto.getName())
                .contact(dto.getContact())
                .level(dto.getLevel() != null ? dto.getLevel() : 1)
                .parentAgentId(dto.getParentAgentId())
                .promoCode(promoCode)
                .customerServiceEnabled(dto.getCustomerServiceEnabled() != null ? dto.getCustomerServiceEnabled() : true)
                .status(Agent.AgentStatus.ACTIVE)
                .remark(dto.getRemark())
                .build();

        // 生成推广链接（前端域名由配置决定，这里先用占位符）
        Agent saved = agentRepository.save(agent);
        saved.setPromoLink("/register?promo=" + promoCode);
        agentRepository.save(saved);

        return convertToDTO(saved);
    }

    /**
     * 更新代理
     */
    @Transactional
    public AgentDTO updateAgent(Long id, AgentDTO dto) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("代理不存在"));

        if (dto.getName() != null) agent.setName(dto.getName());
        if (dto.getContact() != null) agent.setContact(dto.getContact());
        if (dto.getLevel() != null) agent.setLevel(dto.getLevel());
        if (dto.getParentAgentId() != null) agent.setParentAgentId(dto.getParentAgentId());
        if (dto.getCustomerServiceEnabled() != null) agent.setCustomerServiceEnabled(dto.getCustomerServiceEnabled());
        if (dto.getStatus() != null) agent.setStatus(dto.getStatus());
        if (dto.getRemark() != null) agent.setRemark(dto.getRemark());

        return convertToDTO(agentRepository.save(agent));
    }

    /**
     * 删除代理
     */
    @Transactional
    public void deleteAgent(Long id) {
        agentRepository.deleteById(id);
    }

    /**
     * 获取代理的下级列表
     */
    public List<AgentDTO> getSubAgents(Long parentId) {
        return agentRepository.findByParentAgentId(parentId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 更新代理客服开关
     */
    @Transactional
    public AgentDTO toggleCustomerService(Long id, boolean enabled) {
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("代理不存在"));
        agent.setCustomerServiceEnabled(enabled);
        return convertToDTO(agentRepository.save(agent));
    }

    private String generateUniquePromoCode() {
        String code;
        int attempts = 0;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            attempts++;
            if (attempts > 100) throw new RuntimeException("无法生成唯一推广码");
        } while (agentRepository.findByPromoCode(code).isPresent());
        return code;
    }

    private AgentDTO convertToDTO(Agent agent) {
        String parentName = null;
        if (agent.getParentAgentId() != null) {
            parentName = agentRepository.findById(agent.getParentAgentId())
                    .map(Agent::getName).orElse(null);
        }
        long subCount = agentRepository.countByParentAgentId(agent.getId());
        long userCount = appUserRepository.countByInvitedByAgentId(agent.getId());

        return AgentDTO.builder()
                .id(agent.getId())
                .name(agent.getName())
                .contact(agent.getContact())
                .level(agent.getLevel())
                .parentAgentId(agent.getParentAgentId())
                .parentAgentName(parentName)
                .promoCode(agent.getPromoCode())
                .promoLink(agent.getPromoLink())
                .promoQrCode(agent.getPromoQrCode())
                .customerServiceEnabled(agent.getCustomerServiceEnabled())
                .status(agent.getStatus())
                .remark(agent.getRemark())
                .subAgentCount(subCount)
                .userCount(userCount)
                .createdAt(agent.getCreatedAt())
                .updatedAt(agent.getUpdatedAt())
                .build();
    }
}
