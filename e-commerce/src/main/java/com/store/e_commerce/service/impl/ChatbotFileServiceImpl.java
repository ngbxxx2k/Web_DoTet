package com.store.e_commerce.service.impl;

import com.store.e_commerce.dto.request.IngestRequest;
import com.store.e_commerce.dto.response.ChatbotFileResponse;
import com.store.e_commerce.entity.ChatbotFile;
import com.store.e_commerce.entity.FileStatus;
import com.store.e_commerce.exception.ResourceNotFoundException;
import com.store.e_commerce.repository.ChatbotFileRepository;
import com.store.e_commerce.service.ChatbotFileService;
import com.store.e_commerce.service.PythonClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotFileServiceImpl implements ChatbotFileService {

    private final ChatbotFileRepository chatbotFileRepository;
    private final PythonClientService pythonClientService;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    /**
     * Upload file, lưu record MySQL, gọi async Python ingest
     */
    @Override
    public ChatbotFileResponse uploadFile(MultipartFile file) throws IOException {
        log.info("[Chatbot] Upload file: {}, size: {} bytes", file.getOriginalFilename(), file.getSize());

        // Tạo thư mục uploads nếu chưa có
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.info("[Chatbot] Tạo thư mục upload: {}", uploadPath.toAbsolutePath());
        }

        // Lưu file với tên unique để tránh trùng
        String originalFileName = file.getOriginalFilename();
        String uniqueFileName = UUID.randomUUID() + "_" + originalFileName;
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        log.info("[Chatbot] File đã lưu tại: {}", filePath.toAbsolutePath());

        // Tạo record trong MySQL
        ChatbotFile chatbotFile = ChatbotFile.builder()
                .fileName(originalFileName)
                .filePath(filePath.toAbsolutePath().toString())
                .fileSize(file.getSize())
                .status(FileStatus.PROCESSING)
                .build();
        chatbotFile = chatbotFileRepository.save(chatbotFile);
        log.info("[Chatbot] Record đã lưu, id={}", chatbotFile.getId());

        // Gọi async Python ingest (không block)
        IngestRequest ingestRequest = IngestRequest.builder()
                .fileId(chatbotFile.getId())
                .filePath(filePath.toAbsolutePath().toString())
                .fileName(originalFileName)
                .build();
        pythonClientService.sendIngestRequest(ingestRequest);

        return toResponse(chatbotFile);
    }

    /**
     * Lấy danh sách tất cả file
     */
    @Override
    public List<ChatbotFileResponse> getAllFiles() {
        log.info("[Chatbot] Lấy danh sách file");
        return chatbotFileRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Xóa file: xóa file vật lý + record MySQL + gọi Python xóa vectors
     */
    @Override
    public void deleteFile(Long id) {
        log.info("[Chatbot] Xóa file id={}", id);

        ChatbotFile chatbotFile = chatbotFileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File không tồn tại: " + id));

        // Xóa file vật lý
        try {
            Path filePath = Paths.get(chatbotFile.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("[Chatbot] File vật lý đã xóa: {}", filePath);
            }
        } catch (IOException e) {
            log.error("[Chatbot] Lỗi xóa file vật lý: {}", e.getMessage());
        }

        // Xóa record MySQL
        chatbotFileRepository.delete(chatbotFile);
        log.info("[Chatbot] Record MySQL đã xóa, id={}", id);

        // Gọi Python xóa vectors
        pythonClientService.sendDeleteVectorsRequest(id);
    }

    private ChatbotFileResponse toResponse(ChatbotFile file) {
        return ChatbotFileResponse.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .fileSize(file.getFileSize())
                .status(file.getStatus())
                .createdAt(file.getCreatedAt())
                .build();
    }
}
