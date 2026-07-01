package openpal.database.homeFeedDB;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<AnnouncementDB, UUID> {

}