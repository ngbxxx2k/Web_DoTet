package com.store.e_commerce.service;

import java.util.Map;

public interface SystemSettingService {
    Map<String, String> getAllSettings();
    Map<String, String> updateSettings(Map<String, String> newSettings);
    void updateSetting(String key, String value);
}
