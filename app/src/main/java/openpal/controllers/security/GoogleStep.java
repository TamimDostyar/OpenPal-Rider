package openpal.controllers.security;

import java.security.SecureRandom;

/**
 * Google-style step verification: generates the 4-digit authentication code
 * that gets emailed to the address a user signed up with.
 */
public class GoogleStep {

    private static final SecureRandom RANDOM = new SecureRandom();

    private GoogleStep() {
    }

    // a fresh 4-digit code, always padded to 4 chars (e.g. "0427")
    public static String generateCode() {
        return String.format("%04d", RANDOM.nextInt(10000));
    }
}
