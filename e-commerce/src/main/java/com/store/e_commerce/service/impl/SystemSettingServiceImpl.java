package com.store.e_commerce.service.impl;

import com.store.e_commerce.entity.SystemSetting;
import com.store.e_commerce.repository.SystemSettingRepository;
import com.store.e_commerce.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    /**
     * Get all settings as a Map<Key, Value>
     */
    @Override
    public Map<String, String> getAllSettings() {
        List<SystemSetting> settings = systemSettingRepository.findAll();
        return settings.stream()
                .collect(Collectors.toMap(SystemSetting::getKey, SystemSetting::getValue));
    }

    /**
     * Update settings from a Map. Only updates provided keys.
     */
    @Override
    @Transactional
    public Map<String, String> updateSettings(Map<String, String> newSettings) {
        for (Map.Entry<String, String> entry : newSettings.entrySet()) {
            SystemSetting setting = systemSettingRepository.findById(entry.getKey())
                    .orElse(new SystemSetting(entry.getKey(), ""));
            setting.setValue(entry.getValue());
            systemSettingRepository.save(setting);
        }
        return getAllSettings();
    }
    
    /**
     * Update a single setting
     */
    @Override
    @Transactional
    public void updateSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findById(key)
                .orElse(new SystemSetting(key, ""));
        setting.setValue(value);
        systemSettingRepository.save(setting);
    }
}
