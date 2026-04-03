package com.timi.controller;

import com.timi.dto.DistanceRequest;
import com.timi.dto.ProfileDTO;
import com.timi.dto.Result;
import com.timi.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@Tag(name = "用户资料接口", description = "处理用户资料相关操作")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ProfileController {

    private final ProfileService profileService;

    /**
     * 获取列表（支持分页、搜索、筛选）
     */
    @Operation(summary = "获取用户资料列表", description = "分页获取用户资料列表，可按条件筛选")
    @GetMapping
    public Result<Page<ProfileDTO>> getProfiles(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProfileDTO> profiles = profileService.getAllProfiles(name, province, city, pageable);
        return Result.success(profiles);
    }

    /**
     * 获取单个列表项详情
     */
    @Operation(summary = "获取用户资料详情", description = "根据ID获取用户资料详情")
    @GetMapping("/{id}")
    public Result<ProfileDTO> getProfile(@PathVariable Long id) {
        ProfileDTO profile = profileService.getProfileById(id);
        return Result.success(profile);
    }

    /**
     * 计算距离
     */
    @Operation(summary = "计算距离", description = "计算用户与指定资料的距离")
    @PostMapping("/{id}/distance")
    public Result<Map<String, Object>> calculateDistance(
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

        return Result.success(response);
    }

    /**
     * 上传图片
     */
    @Operation(summary = "上传图片", description = "上传用户资料图片")
    @PostMapping("/upload")
    public Result<Map<String, String>> uploadPhoto(@RequestParam("file") MultipartFile file) throws IOException {
        String photoPath = profileService.uploadPhoto(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("photoPath", photoPath);
        
        return Result.success(response, "图片上传成功");
    }

    /**
     * 创建列表项（管理员）
     */
    @Operation(summary = "创建用户资料", description = "管理员创建新的用户资料")
    @PostMapping
    public Result<ProfileDTO> createProfile(@RequestBody ProfileDTO dto) {
        ProfileDTO created = profileService.createProfile(dto);
        return Result.success(created);
    }

    /**
     * 更新列表项（管理员）
     */
    @Operation(summary = "更新用户资料", description = "管理员更新指定的用户资料")
    @PutMapping("/{id}")
    public Result<ProfileDTO> updateProfile(
            @PathVariable Long id,
            @RequestBody ProfileDTO dto) {
        ProfileDTO updated = profileService.updateProfile(id, dto);
        return Result.success(updated);
    }

    /**
     * 删除列表项（管理员）
     */
    @Operation(summary = "删除用户资料", description = "管理员删除指定的用户资料")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProfile(@PathVariable Long id) {
        profileService.deleteProfile(id);
        return Result.success(null, "删除成功");
    }
}
