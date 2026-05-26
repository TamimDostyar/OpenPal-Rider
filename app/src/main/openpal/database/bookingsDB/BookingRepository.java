package openpal.database.bookingsDB;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<BookingDB, UUID> {

    List<BookingDB> findByRiderEmailIgnoreCaseOrderByCreatedAtDesc(String riderEmail);

    List<BookingDB> findByDriverEmailIgnoreCaseOrderByCreatedAtDesc(String driverEmail);

    List<BookingDB> findByPostIdOrderByCreatedAtDesc(UUID postId);

    Optional<BookingDB> findByIdAndRiderEmailIgnoreCase(UUID id, String riderEmail);
}
