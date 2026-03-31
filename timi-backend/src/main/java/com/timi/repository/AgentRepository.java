package com.timi.repository;

import com.timi.entity.Agent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {

    Optional<Agent> findByPromoCode(String promoCode);

    List<Agent> findByParentAgentId(Long parentAgentId);

    Page<Agent> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Agent> findByLevel(Integer level, Pageable pageable);

    Page<Agent> findByStatus(Agent.AgentStatus status, Pageable pageable);

    long countByParentAgentId(Long parentAgentId);

    long countByLevel(Integer level);

    long countByStatus(Agent.AgentStatus status);
}
