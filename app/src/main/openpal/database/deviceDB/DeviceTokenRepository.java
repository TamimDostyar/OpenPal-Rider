package openpal.database.deviceDB;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface DeviceTokenRepository extends JpaRepository<DeviceTokenDB, UUID> {
    List<DeviceTokenDB> findByUserEmail(String userEmail);
    Optional<DeviceTokenDB> findByToken(String token);

    // Every registered token, for broadcasts (e.g. announcements). Selects just
    // the token column so we don't load full entities for a fire-and-forget push.
    @Query("select d.token from DeviceTokenDB d")
    List<String> findAllTokens();

    // Derived delete queries need their own transaction; without this a call
    // outside a transactional context throws instead of deleting.
    @Transactional
    void deleteByToken(String token);
}
