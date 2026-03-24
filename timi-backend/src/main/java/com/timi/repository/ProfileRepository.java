package com.timi.repository;

import com.timi.entity.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Page<Profile> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Profile> findByProvince(String province, Pageable pageable);
    Page<Profile> findByCity(String city, Pageable pageable);
    Page<Profile> findByNameContainingIgnoreCaseAndProvince(String name, String province, Pageable pageable);
    Page<Profile> findByNameContainingIgnoreCaseAndCity(String name, String city, Pageable pageable);
    Page<Profile> findByProvinceAndCity(String province, String city, Pageable pageable);
    Page<Profile> findByNameContainingIgnoreCaseAndProvinceAndCity(String name, String province, String city, Pageable pageable);
}
