package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.request.CategoryRequest;
import com.store.e_commerce.dto.response.CategoryResponse;
import com.store.e_commerce.entity.Category;
import com.store.e_commerce.exception.ResourceNotFoundException;
import com.store.e_commerce.mapper.CategoryMapper;
import com.store.e_commerce.repository.CategoryRepository;
import com.store.e_commerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        List<Object[]> counts = categoryRepository.countProductsPerCategory();
        java.util.Map<Integer, Long> countMap = counts.stream()
                .collect(java.util.stream.Collectors.toMap(
                        obj -> (Integer) obj[0],
                        obj -> (Long) obj[1]
                ));

        return categoryRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() == null) // Filter soft deleted
                .map(c -> {
                    CategoryResponse resp = categoryMapper.toResponse(c);
                    resp.setProductCount(countMap.getOrDefault(c.getCategoryId(), 0L));
                    return resp;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Slug already exists");
        }

        Category category = categoryMapper.toEntity(request);
        
        // Handle Parent
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setLevel(0);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (categoryRepository.existsBySlugAndCategoryIdNot(request.getSlug(), id)) {
            throw new IllegalArgumentException("Slug already exists");
        }

        categoryMapper.updateEntity(category, request);

        // Handle Parent Update
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new IllegalArgumentException("Category cannot be its own parent");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
            category.setLevel(parent.getLevel() + 1);
        } else {
            category.setParent(null);
            category.setLevel(0);
        }

        Category updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        // Soft Delete
        category.setDeletedAt(LocalDateTime.now());
        category.setIsActive(false);
        
        // Soft delete children? User requested "đưa danh mục và toàn bộ sản phẩm... vào thùng rác"
        // Implementing simple cascading soft delete for sub-categories
        List<Category> children = categoryRepository.findByParentCategoryId(id);
        for (Category child : children) {
            child.setDeletedAt(LocalDateTime.now());
            child.setIsActive(false);
            categoryRepository.save(child);
        }
        
        categoryRepository.save(category);
    }
}
