package openpal.database.account_mgt;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileRepository extends JpaRepository<CreateProfileDB, UUID> {

    boolean existsByEmail(String email);

    Optional<CreateProfileDB> findByEmail(String email);

    Optional<CreateProfileDB> findByUsername(String username);

    Optional<CreateProfileDB> findByResetToken(String resetToken);
}
