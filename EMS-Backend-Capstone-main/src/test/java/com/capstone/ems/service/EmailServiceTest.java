package com.capstone.ems.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock private JavaMailSender mailSender;

    @InjectMocks private EmailService emailService;

    @Test
    void sendWelcomeEmail_Success() {
        String toEmail = "test@ems.com";
        String name = "Test User";
        String username = "testuser";
        String password = "pass123";

        emailService.sendWelcomeEmail(toEmail, name, username, password);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendWelcomeEmail_Failure_LogsError() {
        String toEmail = "test@ems.com";
        String name = "Test User";
        String username = "testuser";
        String password = "pass123";

        doThrow(new RuntimeException("Mail error")).when(mailSender).send(any(SimpleMailMessage.class));

        emailService.sendWelcomeEmail(toEmail, name, username, password);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendResetNotification_Success() {
        String toEmail = "test@ems.com";
        String name = "Test User";
        String username = "testuser";
        String newPassword = "newpass123";

        emailService.sendResetNotification(toEmail, name, username, newPassword);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendResetNotification_Failure_LogsError() {
        String toEmail = "test@ems.com";
        String name = "Test User";
        String username = "testuser";
        String newPassword = "newpass123";

        doThrow(new RuntimeException("Mail error")).when(mailSender).send(any(SimpleMailMessage.class));

        emailService.sendResetNotification(toEmail, name, username, newPassword);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }
}