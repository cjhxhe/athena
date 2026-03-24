package com.timi.repository;

import com.timi.entity.Dictionary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DictionaryRepository extends JpaRepository<Dictionary, Long> {

    /**
     * 根据类型获取所有字典项
     */
    List<Dictionary> findByDictTypeOrderBySortOrderAsc(String dictType);

    /**
     * 根据类型和父 ID 获取字典项（用于省份-城市关联）
     */
    List<Dictionary> findByDictTypeAndParentIdOrderBySortOrderAsc(String dictType, Long parentId);

    /**
     * 根据类型和键获取字典项
     */
    Optional<Dictionary> findByDictTypeAndDictKey(String dictType, String dictKey);

    /**
     * 获取所有省份
     */
    List<Dictionary> findByDictTypeAndParentIdIsNullOrderBySortOrderAsc(String dictType);
}
