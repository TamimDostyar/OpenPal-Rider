package openpal.database.homeFeedDB;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data repository for feed posts. Adds domain-scoped queries that
 * filter posts by the poster's email suffix to enforce school scoping.
 */
@Repository
public interface FeedPostsRepository extends JpaRepository<FeedPostsDB, UUID> {

    List<FeedPostsDB> findByEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(String emailSuffix);

    List<FeedPostsDB> findByUsernameAndEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(
            String username, String emailSuffix);
}
