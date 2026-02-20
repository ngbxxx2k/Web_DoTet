package com.store.e_commerce.controller;

import com.store.e_commerce.dto.request.QueryRequest;
import com.store.e_commerce.dto.response.QueryResponse;
import com.store.e_commerce.service.PythonClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final PythonClientService pythonClientService;

    /**
     * Proxy câu hỏi chat đến Python RAG service
     */
    @PostMapping("/ask")
    public ResponseEntity<QueryResponse> ask(@Valid @RequestBody QueryRequest request) {
        log.info("[API] POST /api/chat/ask - question: {}", request.getQuestion());
        QueryResponse response = pythonClientService.sendQueryRequest(request.getQuestion());
        return ResponseEntity.ok(response);
    }
}
