package openpal.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends the 4-digit step-verification code to the email a user provided.
 * If no SMTP credentials are configured the code is logged instead, so the
 * signup flow still works in local development.
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${openpal.mail.from:}")
    private String fromAddress;

    // mailSender is optional: spring only wires it when SMTP is configured
    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** Emails the verification code to the given address. */
    public void sendVerificationCode(String toEmail, String code) {
        if (fromAddress == null || fromAddress.isBlank()) {
            System.out.println("[EmailService] verification code for " + toEmail + ": " + code);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Your OpenPal verification code");
        message.setText(
            "Welcome to OpenPal!\n\n"
            + "Your 4-digit verification code is: " + code + "\n\n"
            + "It expires in 10 minutes. If you didn't sign up, you can ignore this email.");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            // don't fail signup if the email can't be delivered
            System.err.println("[EmailService] failed to send code to " + toEmail
                + ": " + e.getMessage());
        }
    }
}
