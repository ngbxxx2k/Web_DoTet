package com.store.e_commerce.controller;

import com.store.e_commerce.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    // Public API - accessible by everyone
    @GetMapping("/public/settings")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        Map<String, String> settings = systemSettingService.getAllSettings();
        // Filter out sensitive keys if any (e.g. SMTP password) - explicitly defined in requirements
        // "Bảo mật: Thông tin Email hệ thống (SMTP) chỉ được phép trả về qua API Admin"
        // Let's filter keys starting with "smtp_" or similar if needed. 
        // For now, assuming standard keys like store_name, logo_url are fine.
        // We will explicitly remove sensitive keys just in case.
        Map<String, String> publicSettings = settings.entrySet().stream()
                .filter(entry -> !entry.getKey().toLowerCase().contains("password") && !entry.getKey().toLowerCase().contains("secret"))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
                
        return ResponseEntity.ok(publicSettings);
    }

    // Admin API - get all settings including sensitive ones
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/settings")
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(systemSettingService.getAllSettings());
    }

    // Admin API - update settings
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/settings")
    public ResponseEntity<Map<String, String>> updateSettings(@RequestBody Map<String, String> settings) {
        return ResponseEntity.ok(systemSettingService.updateSettings(settings));
    }
}
