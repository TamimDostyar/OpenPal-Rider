package openpal.database.bookingsDB;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface BookingRepository extends JpaRepository<BookingDB, UUID> {

    List<BookingDB> findByRiderEmailIgnoreCaseOrderByCreatedAtDesc(String riderEmail);

    List<BookingDB> findByDriverEmailIgnoreCaseOrderByCreatedAtDesc(String driverEmail);

    List<BookingDB> findByPostIdOrderByCreatedAtDesc(UUID postId);

    Optional<BookingDB> findByIdAndRiderEmailIgnoreCase(UUID id, String riderEmail);

    @Modifying
    @Transactional
    @Query("UPDATE BookingDB b SET b.riderEmail = :anonEmail, b.riderUsername = :anonName "
        + "WHERE LOWER(b.riderEmail) = LOWER(:email)")
    int anonymizeRider(@Param("email") String email,
                       @Param("anonEmail") String anonEmail,
                       @Param("anonName") String anonName);

    @Modifying
    @Transactional
    @Query("UPDATE BookingDB b SET b.driverEmail = :anonEmail, b.driverUsername = :anonName "
        + "WHERE LOWER(b.driverEmail) = LOWER(:email)")
    int anonymizeDriver(@Param("email") String email,
                        @Param("anonEmail") String anonEmail,
                        @Param("anonName") String anonName);
}
