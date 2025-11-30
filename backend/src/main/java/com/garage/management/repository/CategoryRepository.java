package com.garage.management.repository;

import com.garage.management.entity.Category;
import com.garage.management.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByActiveTrue();
    List<Category> findByType(CategoryType type);
    List<Category> findByParentCategoryId(Long parentId);
}
