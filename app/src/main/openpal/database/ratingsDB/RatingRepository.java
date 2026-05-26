package openpal.database.ratingsDB;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<RatingDB, UUID> {

    List<RatingDB> findByRatedEmailIgnoreCaseOrderByCreatedAtDesc(String ratedEmail);

    boolean existsByBookingIdAndRaterEmailIgnoreCase(UUID bookingId, String raterEmail);
}
