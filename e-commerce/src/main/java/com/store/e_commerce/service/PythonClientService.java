package com.store.e_commerce.service;

import com.store.e_commerce.dto.request.DeleteVectorsRequest;
import com.store.e_commerce.dto.request.IngestRequest;
import com.store.e_commerce.dto.response.QueryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class PythonClientService {

    private final WebClient pythonWebClient;

    /**
     * Gửi request ingest file đến Python service (async, không block)
     * Có retry 3 lần, timeout 30s
     */
    @Async("chatbotTaskExecutor")
    public CompletableFuture<Void> sendIngestRequest(IngestRequest request) {
        log.info("[Chatbot] Gửi ingest request cho fileId={}, fileName={}", request.getFileId(), request.getFileName());

        try {
            pythonWebClient.post()
                    .uri("/ingest")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                            .filter(throwable -> !(throwable instanceof WebClientResponseException.BadRequest))
                            .doBeforeRetry(signal -> log.warn("[Chatbot] Retry ingest lần {}", signal.totalRetries() + 1)))
                    .block();

            log.info("[Chatbot] Ingest request thành công cho fileId={}", request.getFileId());
        } catch (Exception e) {
            log.error("[Chatbot] Ingest request thất bại cho fileId={}: {}", request.getFileId(), e.getMessage());
        }

        return CompletableFuture.completedFuture(null);
    }

    /**
     * Gửi câu hỏi đến Python RAG service, timeout 60s
     */
    public QueryResponse sendQueryRequest(String question) {
        log.info("[Chatbot] Gửi query request: {}", question);

        try {
            QueryResponse response = pythonWebClient.post()
                    .uri("/query")
                    .bodyValue(Map.of("question", question))
                    .retrieve()
                    .bodyToMono(QueryResponse.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();

            log.info("[Chatbot] Query response nhận thành công");
            return response;
        } catch (Exception e) {
            log.error("[Chatbot] Query request thất bại: {}", e.getMessage());
            return QueryResponse.builder()
                    .answer("Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau.")
                    .build();
        }
    }

    /**
     * Gửi request xóa vectors theo fileId
     */
    public void sendDeleteVectorsRequest(Long fileId) {
        log.info("[Chatbot] Gửi delete-vectors request cho fileId={}", fileId);

        try {
            pythonWebClient.post()
                    .uri("/delete-vectors")
                    .bodyValue(DeleteVectorsRequest.builder().fileId(fileId).build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            log.info("[Chatbot] Delete vectors thành công cho fileId={}", fileId);
        } catch (Exception e) {
            log.error("[Chatbot] Delete vectors thất bại cho fileId={}: {}", fileId, e.getMessage());
        }
    }

    /**
     * Lấy thông tin stats từ Python service (tổng chunks, dung lượng Qdrant)
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getStats() {
        log.info("[Chatbot] Lấy stats từ Python service");

        try {
            return pythonWebClient.get()
                    .uri("/stats")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            log.error("[Chatbot] Lấy stats thất bại: {}", e.getMessage());
            return Map.of("totalChunks", 0, "qdrantSize", "N/A");
        }
    }

    /**
     * Lấy danh sách chunks của 1 file từ Python service
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getFileChunks(Long fileId) {
        log.info("[Chatbot] Lấy chunks cho fileId={}", fileId);

        try {
            return pythonWebClient.get()
                    .uri("/chunks/{fileId}", fileId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            log.error("[Chatbot] Lấy chunks thất bại cho fileId={}: {}", fileId, e.getMessage());
            return Map.of("chunks", java.util.List.of(), "totalChunks", 0);
        }
    }
}
