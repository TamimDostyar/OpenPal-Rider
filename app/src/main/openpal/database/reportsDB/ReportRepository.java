package openpal.database.reportsDB;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<ReportDB, UUID> {

    List<ReportDB> findByReporterEmailIgnoreCaseOrderByCreatedAtDesc(String reporterEmail);
}
