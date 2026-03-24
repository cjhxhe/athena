package com.timi.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timi.dto.ProfileDTO;
import com.timi.entity.Profile;
import com.timi.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ObjectMapper objectMapper;

    @Value("${file.upload.dir:uploads/photos}")
    private String uploadDir;

    /**
     * 获取所有列表项（支持分页、搜索、筛选）
     */
    public Page<ProfileDTO> getAllProfiles(String name, String province, String city, Pageable pageable) {
        Page<Profile> profiles;

        boolean hasName = name != null && !name.isEmpty();
        boolean hasProvince = province != null && !province.isEmpty();
        boolean hasCity = city != null && !city.isEmpty();

        if (hasName && hasProvince && hasCity) {
            profiles = profileRepository.findByNameContainingIgnoreCaseAndProvinceAndCity(name, province, city, pageable);
        } else if (hasName && hasProvince) {
            profiles = profileRepository.findByNameContainingIgnoreCaseAndProvince(name, province, pageable);
        } else if (hasName && hasCity) {
            profiles = profileRepository.findByNameContainingIgnoreCaseAndCity(name, city, pageable);
        } else if (hasProvince && hasCity) {
            profiles = profileRepository.findByProvinceAndCity(province, city, pageable);
        } else if (hasName) {
            profiles = profileRepository.findByNameContainingIgnoreCase(name, pageable);
        } else if (hasProvince) {
            profiles = profileRepository.findByProvince(province, pageable);
        } else if (hasCity) {
            profiles = profileRepository.findByCity(city, pageable);
        } else {
            profiles = profileRepository.findAll(pageable);
        }

        List<ProfileDTO> dtos = profiles.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, profiles.getTotalElements());
    }

    /**
     * 获取单个列表项详情
     */
    public ProfileDTO getProfileById(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return convertToDTO(profile);
    }

    /**
     * 上传图片到服务器
     */
    public String uploadPhoto(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("文件为空");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("只能上传图片文件");
        }

        // 创建上传目录
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 生成唯一的文件名
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + extension;

        // 保存文件
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, file.getBytes());

        // 返回相对路径
        return "uploads/photos/" + filename;
    }

    /**
     * 创建列表项
     */
    public ProfileDTO createProfile(ProfileDTO dto) {
        Profile profile = convertToEntity(dto);
        Profile saved = profileRepository.save(profile);
        return convertToDTO(saved);
    }

    /**
     * 更新列表项
     */
    public ProfileDTO updateProfile(Long id, ProfileDTO dto) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (dto.getName() != null) profile.setName(dto.getName());
        if (dto.getAge() != null) profile.setAge(dto.getAge());
        if (dto.getHeight() != null) profile.setHeight(dto.getHeight());
        if (dto.getWeight() != null) profile.setWeight(dto.getWeight());
        if (dto.getSize() != null) profile.setSize(dto.getSize());
        if (dto.getPhotoUrl() != null) profile.setPhotoUrl(dto.getPhotoUrl());
        if (dto.getPhotoPath() != null) profile.setPhotoPath(dto.getPhotoPath());
        if (dto.getProvince() != null) profile.setProvince(dto.getProvince());
        if (dto.getCity() != null) profile.setCity(dto.getCity());
        if (dto.getFeatured() != null) profile.setFeatured(dto.getFeatured());
        if (dto.getLatitude() != null) profile.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) profile.setLongitude(dto.getLongitude());
        if (dto.getServices() != null) {
            try {
                profile.setServices(objectMapper.writeValueAsString(dto.getServices()));
            } catch (Exception e) {
                throw new RuntimeException("Error serializing services", e);
            }
        }
        if (dto.getDescription() != null) profile.setDescription(dto.getDescription());
        if (dto.getFeatured() != null) profile.setFeatured(dto.getFeatured());

        Profile updated = profileRepository.save(profile);
        return convertToDTO(updated);
    }

    /**
     * 删除列表项
     */
    public void deleteProfile(Long id) {
        profileRepository.deleteById(id);
    }

    /**
     * 计算距离（使用 Haversine 公式）
     */
    public double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        double R = 6371; // 地球半径，单位：公里

        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1.doubleValue())) * Math.cos(Math.toRadians(lat2.doubleValue())) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * 将 Profile 转换为 ProfileDTO
     */
    private ProfileDTO convertToDTO(Profile profile) {
        List<String> services = null;
        if (profile.getServices() != null) {
            try {
                services = objectMapper.readValue(profile.getServices(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                services = List.of();
            }
        }

        return ProfileDTO.builder()
                .id(profile.getId())
                .name(profile.getName())
                .age(profile.getAge())
                .height(profile.getHeight())
                .weight(profile.getWeight())
                .size(profile.getSize())
                .photoUrl(profile.getPhotoUrl())
                .photoPath(profile.getPhotoPath())
                .province(profile.getProvince())
                .city(profile.getCity())
                .featured(profile.getFeatured())
                .latitude(profile.getLatitude())
                .longitude(profile.getLongitude())
                .services(services)
                .description(profile.getDescription())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    /**
     * 将 ProfileDTO 转换为 Profile
     */
    private Profile convertToEntity(ProfileDTO dto) {
        String servicesJson = null;
        if (dto.getServices() != null) {
            try {
                servicesJson = objectMapper.writeValueAsString(dto.getServices());
            } catch (Exception e) {
                throw new RuntimeException("Error serializing services", e);
            }
        }

        return Profile.builder()
                .name(dto.getName())
                .age(dto.getAge())
                .height(dto.getHeight())
                .weight(dto.getWeight())
                .size(dto.getSize())
                .photoUrl(dto.getPhotoUrl())
                .photoPath(dto.getPhotoPath())
                .province(dto.getProvince())
                .city(dto.getCity())
                .featured(dto.getFeatured() != null ? dto.getFeatured() : false)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .services(servicesJson)
                .description(dto.getDescription())
                .build();
    }
}
