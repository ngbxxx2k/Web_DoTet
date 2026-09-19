package com.store.e_commerce.service;

import com.store.e_commerce.dto.request.IngestRequest;
import com.store.e_commerce.dto.response.QueryResponse;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

public interface PythonClientService {
    CompletableFuture<Void> sendIngestRequest(IngestRequest request);
    QueryResponse sendQueryRequest(String question);
    void sendDeleteVectorsRequest(Long fileId);
    Map<String, Object> getStats();
    Map<String, Object> getFileChunks(Long fileId);
}
