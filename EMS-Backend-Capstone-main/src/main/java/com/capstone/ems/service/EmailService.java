package com.capstone.ems.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    
    private static final String LOGIN_URL = "https://main.d15ztt0s52f8f4.amplifyapp.com/";

    public void sendWelcomeEmail(String toEmail, String name, String username, String password) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("EMS Portal <noreply@ems.com>"); 
            message.setTo(toEmail);
            message.setSubject("Welcome to EMS - Your Login Credentials");
            
            String body = "Dear " + name + ",\n\n" +
                    "Welcome to the Employee Management System!\n" +
                    "Your account has been successfully created by the HR Admin.\n\n" +
                    "Here are your login credentials:\n" +
                    "================================\n" +
                    "Username: " + username + "\n" +
                    "Password: " + password + "\n" +
                    "================================\n\n" +
                    "Please login to the portal here:\n" +
                    LOGIN_URL + "\n\n" +
                    "We recommend changing your password after your first login.\n\n" +
                    "Best Regards,\n" +
                    "EMS HR Team";

            message.setText(body);
            mailSender.send(message);
            System.out.println("✅ Welcome email sent successfully to " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
        }
    }
    
    public void sendResetNotification(String toEmail, String name, String username, String newPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("EMS Portal <noreply@ems.com>");
            message.setTo(toEmail);
            message.setSubject("Security Alert: Login Credentials Reset");

            String body = "Dear " + name + ",\n\n" +
                    "This is a notification that your login credentials have been reset by the System Administrator.\n\n" +
                    "Here are your temporary credentials:\n" +
                    "================================\n" +
                    "Username: " + username + "\n" +
                    "New Password: " + newPassword + "\n" +
                    "================================\n\n" +
                    "You can access the portal here:\n" +
                    LOGIN_URL + "\n\n" +
                    "If you did not request this change, please contact HR immediately.\n\n" +
                    "Best Regards,\n" +
                    "EMS Security Team";

            message.setText(body);
            mailSender.send(message);
            System.out.println("Password reset email sent to " + toEmail);

        } catch (Exception e) {
            System.err.println("Failed to send reset email: " + e.getMessage());
        }
    }
}