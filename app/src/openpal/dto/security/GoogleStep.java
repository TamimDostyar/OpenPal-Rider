package openpal.dto.security;

import java.security.SecureRandom;

/**
 * Generates 4-digit step-verification codes for emailed signup confirmation.
 * Uses {@link SecureRandom} to produce the code.
 */
public class GoogleStep {

    private static final SecureRandom RANDOM = new SecureRandom();

    private GoogleStep() {
    }

    public static String generateCode() {
        return String.format("%04d", RANDOM.nextInt(10000));
    }
}
