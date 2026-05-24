package openpal.database.account_mgt;

import java.util.Optional;

/**
 * Login-attempt helper that checks submitted credentials against the profiles
 * table. Confirms the account exists and the password matches the stored hash.
 */
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
