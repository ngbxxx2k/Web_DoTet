package com.store.e_commerce.repository;

import com.store.e_commerce.entity.ChatbotFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatbotFileRepository extends JpaRepository<ChatbotFile, Long> {
}
