package com.store.e_commerce.mapper;

import com.store.e_commerce.dto.request.CategoryRequest;
import com.store.e_commerce.dto.response.CategoryResponse;
import com.store.e_commerce.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    @Mapping(source = "categoryId", target = "id")
    @Mapping(source = "parent.categoryId", target = "parentId")
    @Mapping(source = "title", target = "categoryName")
    CategoryResponse toResponse(Category category);

    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "parent", ignore = true) // Handled manually in service
    @Mapping(target = "subCategories", ignore = true)
    @Mapping(source = "active", target = "isActive")
    Category toEntity(CategoryRequest request);

    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "subCategories", ignore = true)
    @Mapping(source = "active", target = "isActive")
    void updateEntity(@MappingTarget Category category, CategoryRequest request);
}
