package openpal.database.deviceDB;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceTokenRepository extends JpaRepository<DeviceTokenDB, UUID> {
    List<DeviceTokenDB> findByUserEmail(String userEmail);
    Optional<DeviceTokenDB> findByToken(String token);
    void deleteByToken(String token);
}