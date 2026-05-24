package openpal.database.homeFeedDB;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedPostsRepository extends JpaRepository<FeedPostsDB, UUID> {

    // home feed scoped to a school: every post whose poster email ends with
    // "@<domain>" (case-insensitive), newest first. Pass the suffix WITH the
    // "@" so "harvard.edu" doesn't accidentally match "notharvard.edu".
    List<FeedPostsDB> findByEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(String emailSuffix);

    // one user's posts, but only if they share the caller's school domain
    List<FeedPostsDB> findByUsernameAndEmailEndingWithIgnoreCaseOrderByCreatedAtDesc(
            String username, String emailSuffix);
}
