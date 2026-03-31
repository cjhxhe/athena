package com.timi.repository;

import com.timi.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    Page<Favorite> findByAppUserId(Long appUserId, Pageable pageable);

    Optional<Favorite> findByAppUserIdAndProfileId(Long appUserId, Long profileId);

    boolean existsByAppUserIdAndProfileId(Long appUserId, Long profileId);

    void deleteByAppUserIdAndProfileId(Long appUserId, Long profileId);

    long countByAppUserId(Long appUserId);
}
