package com.store.e_commerce.service;

import com.store.e_commerce.dto.request.ContactRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.Map;
import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final SystemSettingService systemSettingService;

    public void sendEmail(String to, String subject, String body) {
        try {
            JavaMailSender sender = createJavaMailSender();
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            Map<String, String> settings = systemSettingService.getAllSettings();
            String fromEmail = settings.getOrDefault("mail_username", settings.getOrDefault("smtp_user", "noreply@store.com"));
            String fromName = settings.getOrDefault("store_name", "E-Commerce Store");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = html

            sender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendContactEmail(ContactRequest request) {
        Map<String, String> settings = systemSettingService.getAllSettings();
        String notificationEmail = settings.get("notification_email");
        
        if (notificationEmail == null || notificationEmail.isEmpty()) {
            // Fallback to support email or log warning
            notificationEmail = settings.get("support_email");
             if (notificationEmail == null || notificationEmail.isEmpty()) {
                 log.warn("No notification email configured. Contact message not sent.");
                 return;
             }
        }

        String subject = "Tin nhắn liên hệ mới: " + (request.getSubject() != null ? request.getSubject() : "Không chủ đề");
        
        StringBuilder body = new StringBuilder();
        body.append("<h3>Bạn có tin nhắn liên hệ mới từ Website</h3>");
        body.append("<p><strong>Họ tên:</strong> ").append(request.getFirstName()).append(" ").append(request.getLastName()).append("</p>");
        body.append("<p><strong>Email:</strong> ").append(request.getEmail()).append("</p>");
        body.append("<p><strong>Số điện thoại:</strong> ").append(request.getPhone() != null ? request.getPhone() : "N/A").append("</p>");
        body.append("<p><strong>Nội dung:</strong></p>");
        body.append("<blockquote>").append(request.getMessage()).append("</blockquote>");

        sendEmail(notificationEmail, subject, body.toString());
    }

    private JavaMailSender createJavaMailSender() {
        Map<String, String> settings = systemSettingService.getAllSettings();
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        // Fetch settings from DB
        String host = settings.getOrDefault("mail_host", "smtp.gmail.com");
        String portStr = settings.getOrDefault("mail_port", "587");
        String username = settings.get("mail_username"); // Updated key
        String password = settings.get("mail_password"); // Updated key

        // Legacy compatibility
        if (username == null) username = settings.get("smtp_user");
        if (password == null) password = settings.get("smtp_password");

        if (username == null || password == null) {
            log.warn("Email configuration is missing in database. Email sending may fail.");
             // Return unconfigured sender, will fail on connect
        }

        mailSender.setHost(host);
        mailSender.setPort(Integer.parseInt(portStr));
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "false"); 

        return mailSender;
    }
}
