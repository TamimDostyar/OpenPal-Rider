package openpal.database.ratingsDB;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface RatingRepository extends JpaRepository<RatingDB, UUID> {

    List<RatingDB> findByRatedEmailIgnoreCaseOrderByCreatedAtDesc(String ratedEmail);

    boolean existsByBookingIdAndRaterEmailIgnoreCase(UUID bookingId, String raterEmail);

    @Modifying
    @Transactional
    @Query("UPDATE RatingDB r SET r.raterEmail = :anonEmail, r.raterUsername = :anonName "
        + "WHERE LOWER(r.raterEmail) = LOWER(:email)")
    int anonymizeRater(@Param("email") String email,
                       @Param("anonEmail") String anonEmail,
                       @Param("anonName") String anonName);

    @Modifying
    @Transactional
    @Query("UPDATE RatingDB r SET r.ratedEmail = :anonEmail, r.ratedUsername = :anonName "
        + "WHERE LOWER(r.ratedEmail) = LOWER(:email)")
    int anonymizeRated(@Param("email") String email,
                       @Param("anonEmail") String anonEmail,
                       @Param("anonName") String anonName);
}
