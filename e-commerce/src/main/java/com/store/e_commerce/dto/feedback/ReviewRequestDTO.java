package com.store.e_commerce.dto.feedback;

import lombok.Data;

@Data
public class ReviewRequestDTO {
    private Integer productId;
    private Integer rating;
    private String comment;
}
