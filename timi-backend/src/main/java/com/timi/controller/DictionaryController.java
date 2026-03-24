package com.timi.controller;

import com.timi.dto.DictionaryDTO;
import com.timi.service.DictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dictionaries")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DictionaryController {

    private final DictionaryService dictionaryService;

    /**
     * 获取指定类型的字典项（根路径）
     * 例如：/api/dictionaries/province、/api/dictionaries/service_type
     */
    @GetMapping("/{type}")
    public ResponseEntity<List<DictionaryDTO>> getDictionaryByType(@PathVariable String type) {
        List<DictionaryDTO> dictionaries = dictionaryService.getDictionaryByType(type);
        return ResponseEntity.ok(dictionaries);
    }

    /**
     * 获取指定省份下的城市列表
     * 例如：/api/dictionaries/city/1
     */
    @GetMapping("/city/{provinceId}")
    public ResponseEntity<List<DictionaryDTO>> getCitiesByProvince(@PathVariable Long provinceId) {
        List<DictionaryDTO> cities = dictionaryService.getCitiesByProvince(provinceId);
        return ResponseEntity.ok(cities);
    }

    /**
     * 创建字典项（管理员）
     */
    @PostMapping
    public ResponseEntity<DictionaryDTO> createDictionary(@RequestBody DictionaryDTO dto) {
        DictionaryDTO created = dictionaryService.createDictionary(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * 更新字典项（管理员）
     */
    @PutMapping("/{id}")
    public ResponseEntity<DictionaryDTO> updateDictionary(
            @PathVariable Long id,
            @RequestBody DictionaryDTO dto) {
        DictionaryDTO updated = dictionaryService.updateDictionary(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * 删除字典项（管理员）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDictionary(@PathVariable Long id) {
        dictionaryService.deleteDictionary(id);
        return ResponseEntity.noContent().build();
    }
}
