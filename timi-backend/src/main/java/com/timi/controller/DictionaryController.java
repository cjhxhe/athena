package com.timi.controller;

import com.timi.dto.DictionaryDTO;
import com.timi.dto.Result;
import com.timi.service.DictionaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dictionaries")
@RequiredArgsConstructor
@Tag(name = "字典接口", description = "处理字典数据相关操作")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DictionaryController {

    private final DictionaryService dictionaryService;

    /**
     * 获取指定类型的字典项（根路径）
     * 例如：/api/dictionaries/province、/api/dictionaries/service_type
     */
    @Operation(summary = "获取字典项", description = "根据类型获取字典项列表")
    @GetMapping("/{type}")
    public Result<List<DictionaryDTO>> getDictionaryByType(@PathVariable String type) {
        List<DictionaryDTO> dictionaries = dictionaryService.getDictionaryByType(type);
        return Result.success(dictionaries);
    }

    /**
     * 获取指定省份下的城市列表
     * 例如：/api/dictionaries/city/1
     */
    @Operation(summary = "获取城市列表", description = "根据省份ID获取城市列表")
    @GetMapping("/city/{provinceId}")
    public Result<List<DictionaryDTO>> getCitiesByProvince(@PathVariable Long provinceId) {
        List<DictionaryDTO> cities = dictionaryService.getCitiesByProvince(provinceId);
        return Result.success(cities);
    }

    /**
     * 创建字典项（管理员）
     */
    @Operation(summary = "创建字典项", description = "管理员创建新的字典项")
    @PostMapping
    public Result<DictionaryDTO> createDictionary(@RequestBody DictionaryDTO dto) {
        DictionaryDTO created = dictionaryService.createDictionary(dto);
        return Result.success(created);
    }

    /**
     * 更新字典项（管理员）
     */
    @Operation(summary = "更新字典项", description = "管理员更新指定的字典项")
    @PutMapping("/{id}")
    public Result<DictionaryDTO> updateDictionary(
            @PathVariable Long id,
            @RequestBody DictionaryDTO dto) {
        DictionaryDTO updated = dictionaryService.updateDictionary(id, dto);
        return Result.success(updated);
    }

    /**
     * 删除字典项（管理员）
     */
    @Operation(summary = "删除字典项", description = "管理员删除指定的字典项")
    @DeleteMapping("/{id}")
    public Result<Void> deleteDictionary(@PathVariable Long id) {
        dictionaryService.deleteDictionary(id);
        return Result.success(null, "删除成功");
    }
}
