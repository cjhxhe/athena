package com.timi.controller;

import com.timi.dto.DistanceRequest;
import com.timi.dto.ProfileDTO;
import com.timi.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ProfileController {

    private final ProfileService profileService;

    /**
     * 获取列表（支持分页、搜索、筛选）
     */
    @GetMapping
    public ResponseEntity<Page<ProfileDTO>> getProfiles(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProfileDTO> profiles = profileService.getAllProfiles(name, province, city, pageable);
        return ResponseEntity.ok(profiles);
    }

    /**
     * 获取单个列表项详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProfileDTO> getProfile(@PathVariable Long id) {
        ProfileDTO profile = profileService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }

    /**
     * 计算距离
     */
    @PostMapping("/{id}/distance")
    public ResponseEntity<Map<String, Object>> calculateDistance(
            @PathVariable Long id,
            @RequestBody DistanceRequest request) {

        ProfileDTO profile = profileService.getProfileById(id);
        double distance = profileService.calculateDistance(
                request.getUserLatitude(),
                request.getUserLongitude(),
                profile.getLatitude(),
                profile.getLongitude()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", id);
        response.put("distance", String.format("%.2f", distance));
        response.put("unit", "km");

        return ResponseEntity.ok(response);
    }

    /**
     * 上传图片
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadPhoto(@RequestParam("file") MultipartFile file) throws IOException {
        String photoPath = profileService.uploadPhoto(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("photoPath", photoPath);
        response.put("message", "图片上传成功");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 创建列表项（管理员）
     */
    @PostMapping
    public ResponseEntity<ProfileDTO> createProfile(@RequestBody ProfileDTO dto) {
        ProfileDTO created = profileService.createProfile(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * 更新列表项（管理员）
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProfileDTO> updateProfile(
            @PathVariable Long id,
            @RequestBody ProfileDTO dto) {
        ProfileDTO updated = profileService.updateProfile(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * 删除列表项（管理员）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable Long id) {
        profileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }
}
