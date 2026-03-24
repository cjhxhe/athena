package com.timi.service;

import com.timi.dto.DictionaryDTO;
import com.timi.entity.Dictionary;
import com.timi.repository.DictionaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final DictionaryRepository dictionaryRepository;

    /**
     * 获取指定类型的所有字典项
     */
    public List<DictionaryDTO> getDictionaryByType(String type) {
        List<Dictionary> dictionaries = dictionaryRepository.findByDictTypeOrderBySortOrderAsc(type);
        return dictionaries.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 获取省份列表（包含下级城市）
     */
    public List<DictionaryDTO> getProvinces() {
        List<Dictionary> provinces = dictionaryRepository.findByDictTypeAndParentIdIsNullOrderBySortOrderAsc("province");
        return provinces.stream()
                .map(province -> {
                    DictionaryDTO dto = convertToDTO(province);
                    // 获取该省份下的所有城市
                    List<Dictionary> cities = dictionaryRepository.findByDictTypeAndParentIdOrderBySortOrderAsc("city", province.getId());
                    dto.setChildren(cities.stream()
                            .map(this::convertToDTO)
                            .collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * 获取指定省份下的城市列表
     */
    public List<DictionaryDTO> getCitiesByProvince(Long provinceId) {
        List<Dictionary> cities = dictionaryRepository.findByDictTypeAndParentIdOrderBySortOrderAsc("city", provinceId);
        return cities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 创建字典项
     */
    public DictionaryDTO createDictionary(DictionaryDTO dto) {
        Dictionary dictionary = Dictionary.builder()
                .dictType(dto.getDictType())
                .dictKey(dto.getDictKey())
                .dictValue(dto.getDictValue())
                .parentId(dto.getParentId())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();
        Dictionary saved = dictionaryRepository.save(dictionary);
        return convertToDTO(saved);
    }

    /**
     * 更新字典项
     */
    public DictionaryDTO updateDictionary(Long id, DictionaryDTO dto) {
        Dictionary dictionary = dictionaryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dictionary not found"));

        if (dto.getDictValue() != null) dictionary.setDictValue(dto.getDictValue());
        if (dto.getDictKey() != null) dictionary.setDictKey(dto.getDictKey());
        if (dto.getSortOrder() != null) dictionary.setSortOrder(dto.getSortOrder());
        if (dto.getLatitude() != null) dictionary.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null) dictionary.setLongitude(dto.getLongitude());

        Dictionary updated = dictionaryRepository.save(dictionary);
        return convertToDTO(updated);
    }

    /**
     * 删除字典项
     */
    public void deleteDictionary(Long id) {
        dictionaryRepository.deleteById(id);
    }

    /**
     * 将 Dictionary 转换为 DictionaryDTO
     */
    private DictionaryDTO convertToDTO(Dictionary dictionary) {
        return DictionaryDTO.builder()
                .id(dictionary.getId())
                .dictType(dictionary.getDictType())
                .dictKey(dictionary.getDictKey())
                .dictValue(dictionary.getDictValue())
                .parentId(dictionary.getParentId())
                .sortOrder(dictionary.getSortOrder())
                .latitude(dictionary.getLatitude())
                .longitude(dictionary.getLongitude())
                .createdAt(dictionary.getCreatedAt())
                .updatedAt(dictionary.getUpdatedAt())
                .build();
    }
}
