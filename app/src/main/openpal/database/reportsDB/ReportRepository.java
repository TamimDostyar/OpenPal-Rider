package openpal.database.reportsDB;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ReportRepository extends JpaRepository<ReportDB, UUID> {

    List<ReportDB> findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(String reporterEmail);

    List<ReportDB> findAllByOrderByCreatedAtDesc();

    List<ReportDB> findByStatusOrderByCreatedAtDesc(ReportStatus status);

    @Modifying
    @Transactional
    @Query("UPDATE ReportDB r SET r.reporterEmail = :anonEmail, r.reporterUsername = :anonName "
        + "WHERE LOWER(r.reporterEmail) = LOWER(:email)")
    int anonymizeReporter(@Param("email") String email,
                          @Param("anonEmail") String anonEmail,
                          @Param("anonName") String anonName);
}
