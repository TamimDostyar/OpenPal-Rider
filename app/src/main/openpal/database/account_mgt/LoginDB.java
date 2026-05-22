package openpal.database.account_mgt;

import java.util.Optional;

public class LoginDB {
    private String userName;
    private String email;
    private String password;

    public LoginDB(String userName, String email, String password) {
        this.userName = userName;
        this.email = email;
        this.password = password;
    }


    public boolean isUserAvailable(ProfileRepository profileRepository) {
        if (this.email == null || this.email.isBlank()) {
            return false;
        }
        return profileRepository.existsByEmail(this.email);
    }

    // true only if the email exists AND the password matches the stored hash
    public boolean verifyLogin(ProfileRepository profileRepository) {
        if (this.email == null || this.email.isBlank() || this.password == null) {
            return false;
        }
        Optional<CreateProfileDB> profile = profileRepository.findByEmail(this.email);
        if (profile.isEmpty()) {
            return false;
        }
        return PasswordHasher.matches(this.password, profile.get().getPassword());
    }

    public String getUserName() {
        return this.userName;
    }

    public String getEmail() {
        return this.email;
    }

    public String getPassword() {
        return this.password;
    }
}
