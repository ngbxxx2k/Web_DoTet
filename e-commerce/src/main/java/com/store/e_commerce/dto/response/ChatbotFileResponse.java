package com.store.e_commerce.dto.response;

import com.store.e_commerce.entity.FileStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotFileResponse {
    private Long id;
    private String fileName;
    private Long fileSize;
    private FileStatus status;
    private LocalDateTime createdAt;
}
