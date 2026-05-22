package openpal.database.account_mgt;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileRepository extends JpaRepository<CreateProfileDB, UUID> {

    // true if a profile row with this email exists
    boolean existsByEmail(String email);

    // fetches the profile for this email, if any — used for login verification
    Optional<CreateProfileDB> findByEmail(String email);

    // fetches the profile holding this password-reset token, if any
    Optional<CreateProfileDB> findByResetToken(String resetToken);
}
