package openpal.database.account_mgt;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ArchivedUserRepository extends JpaRepository<ArchivedUserDB, UUID> {
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ArchivedUserDB a WHERE a.deletedAt < :cutoff")
    int deleteByDeletedAtBefore(@Param("cutoff") LocalDateTime cutoff);
}
