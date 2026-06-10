package openpal.services;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import openpal.database.account_mgt.ArchivedUserRepository;

/**
 * Enforces the one-year retention promise for deleted-account tombstones:
 * anything in {@code archived_users} older than a year is purged daily.
 */
@Component
public class ArchivedUserCleanup {

    private final ArchivedUserRepository archivedRepo;

    @Autowired
    public ArchivedUserCleanup(ArchivedUserRepository archivedRepo) {
        this.archivedRepo = archivedRepo;
    }

    // Runs once a day, a few minutes after midnight server time.
    @Scheduled(cron = "0 5 0 * * *")
    public void purgeExpired() {
        LocalDateTime cutoff = LocalDateTime.now().minusYears(1);
        archivedRepo.deleteByDeletedAtBefore(cutoff);
    }
}
