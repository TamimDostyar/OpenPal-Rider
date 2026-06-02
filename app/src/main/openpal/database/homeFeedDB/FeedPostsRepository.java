package openpal.database.homeFeedDB;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data repository for feed posts. Adds domain-scoped queries that
 * filter posts by the poster's email suffix to enforce school scoping.
 */
@Repository
public interface FeedPostsRepository extends JpaRepository<FeedPostsDB, UUID> {

    List<FeedPostsDB> findByEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(String emailSuffix);

    List<FeedPostsDB> findByUsernameAndEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(
            String username, String emailSuffix);

    @Modifying
    @Transactional
    @Query("DELETE FROM FeedPostsDB p WHERE LOWER(p.email) = LOWER(:email)")
    int deleteByEmail(@Param("email") String email);
}
