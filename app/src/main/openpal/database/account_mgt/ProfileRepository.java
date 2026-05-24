package openpal.database.account_mgt;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for user profiles. Exposes lookups by email and by
 * one-time password-reset token used during the login and reset flows.
 */
@Repository
public interface ProfileRepository extends JpaRepository<CreateProfileDB, UUID> {

    boolean existsByEmail(String email);

    Optional<CreateProfileDB> findByEmail(String email);

    Optional<CreateProfileDB> findByResetToken(String resetToken);
}
