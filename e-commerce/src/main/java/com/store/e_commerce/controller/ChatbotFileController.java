package com.store.e_commerce.controller;

import com.store.e_commerce.dto.response.ChatbotFileResponse;
import com.store.e_commerce.service.ChatbotFileService;
import com.store.e_commerce.service.PythonClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
@Slf4j
public class ChatbotFileController {

    private final ChatbotFileService chatbotFileService;
    private final PythonClientService pythonClientService;

    /**
     * Upload file cho chatbot RAG
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatbotFileResponse> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("[API] POST /api/data/upload - file: {}", file.getOriginalFilename());
        ChatbotFileResponse response = chatbotFileService.uploadFile(file);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy danh sách file
     */
    @GetMapping("/files")
    public ResponseEntity<List<ChatbotFileResponse>> getFiles() {
        log.info("[API] GET /api/data/files");
        List<ChatbotFileResponse> files = chatbotFileService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    /**
     * Xóa file và vectors liên quan
     */
    @DeleteMapping("/files/{id}")
    public ResponseEntity<Map<String, String>> deleteFile(@PathVariable Long id) {
        log.info("[API] DELETE /api/data/files/{}", id);
        chatbotFileService.deleteFile(id);
        return ResponseEntity.ok(Map.of("message", "File đã xóa thành công"));
    }

    /**
     * Lấy stats (tổng file, chunks, dung lượng)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        log.info("[API] GET /api/data/stats");
        Map<String, Object> pythonStats = pythonClientService.getStats();
        long totalFiles = chatbotFileService.getAllFiles().size();
        pythonStats.put("totalFiles", totalFiles);
        return ResponseEntity.ok(pythonStats);
    }

    /**
     * Lấy chi tiết chunks của 1 file
     */
    @GetMapping("/files/{id}/chunks")
    public ResponseEntity<Map<String, Object>> getFileChunks(@PathVariable Long id) {
        log.info("[API] GET /api/data/files/{}/chunks", id);
        Map<String, Object> chunks = pythonClientService.getFileChunks(id);
        return ResponseEntity.ok(chunks);
    }
}
