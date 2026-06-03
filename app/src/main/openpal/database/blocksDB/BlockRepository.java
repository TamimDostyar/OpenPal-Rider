package openpal.database.blocksDB;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface BlockRepository extends JpaRepository<BlockDB, UUID> {

    List<BlockDB> findByBlockerEmailIgnoreCaseOrderByCreatedAtDesc(String blockerEmail);

    boolean existsByBlockerEmailIgnoreCaseAndBlockedEmailIgnoreCase(
            String blockerEmail, String blockedEmail);

    @Modifying
    @Transactional
    int deleteByBlockerEmailIgnoreCaseAndBlockedEmailIgnoreCase(
            String blockerEmail, String blockedEmail);

    /** Emails the given user has blocked. */
    @Query("SELECT b.blockedEmail FROM BlockDB b WHERE LOWER(b.blockerEmail) = LOWER(:email)")
    List<String> blockedEmailsBy(@Param("email") String email);

    /** Emails of users who have blocked the given user. */
    @Query("SELECT b.blockerEmail FROM BlockDB b WHERE LOWER(b.blockedEmail) = LOWER(:email)")
    List<String> emailsBlocking(@Param("email") String email);

    /** True if either user has blocked the other (in any direction). */
    @Query("SELECT COUNT(b) > 0 FROM BlockDB b WHERE "
        + "(LOWER(b.blockerEmail) = LOWER(:a) AND LOWER(b.blockedEmail) = LOWER(:b)) OR "
        + "(LOWER(b.blockerEmail) = LOWER(:b) AND LOWER(b.blockedEmail) = LOWER(:a))")
    boolean existsBetween(@Param("a") String a, @Param("b") String b);

    /** Remove every block row referencing this email, in either direction. */
    @Modifying
    @Transactional
    @Query("DELETE FROM BlockDB b WHERE LOWER(b.blockerEmail) = LOWER(:email) "
        + "OR LOWER(b.blockedEmail) = LOWER(:email)")
    int deleteAllInvolving(@Param("email") String email);
}
