package com.timi.repository;

import com.timi.entity.ProfileMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProfileMediaRepository extends JpaRepository<ProfileMedia, Long> {
    List<ProfileMedia> findByProfileIdOrderBySortOrderAscIdAsc(Long profileId);
    void deleteByProfileId(Long profileId);
}
