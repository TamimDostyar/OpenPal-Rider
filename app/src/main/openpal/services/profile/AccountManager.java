package openpal.services.profile;


import openpal.dto.blocks.Block;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import openpal.services.security.AuthSupport;
import openpal.services.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.ArchivedUserDB;
import openpal.database.account_mgt.ArchivedUserRepository;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.bookingsDB.BookingRepository;
import openpal.database.blocksDB.BlockRepository;
import openpal.database.homeFeedDB.FeedPostsRepository;
import openpal.database.homeFeedDB.MessagingSysRepository;
import openpal.database.ratingsDB.RatingRepository;
import openpal.database.reportsDB.ReportRepository;

/**
 * Permanently deletes a user account (App Store guideline 5.1.1(v)).
 *
 * <p>The full {@link CreateProfileDB} row is removed, along with the user's own
 * feed posts. Records that a *counterparty* still relies on — bookings,
 * messages, and ratings — are anonymized rather than dropped, so the other
 * person's history stays coherent while the deleted user's email is scrubbed.
 *
 * <p>A minimal tombstone (name + email + timestamp) is written to
 * {@code archived_users} so we can count how many distinct users we've ever had.
 * That tombstone is purged after one year by {@code ArchivedUserCleanup}.
 */
@Component
public class AccountManager {

    private static final String ANON_NAME = "Deleted user";

    private final ProfileRepository profileRepo;
    private final ArchivedUserRepository archivedRepo;
    private final FeedPostsRepository feedRepo;
    private final BookingRepository bookingRepo;
    private final MessagingSysRepository messageRepo;
    private final RatingRepository ratingRepo;
    private final ReportRepository reportRepo;
    private final BlockRepository blockRepo;
    private final AuthSupport auth;

    @Autowired
    public AccountManager(ProfileRepository profileRepo,
                          ArchivedUserRepository archivedRepo,
                          FeedPostsRepository feedRepo,
                          BookingRepository bookingRepo,
                          MessagingSysRepository messageRepo,
                          RatingRepository ratingRepo,
                          ReportRepository reportRepo,
                          BlockRepository blockRepo,
                          AuthSupport auth) {
        this.profileRepo = profileRepo;
        this.archivedRepo = archivedRepo;
        this.feedRepo = feedRepo;
        this.bookingRepo = bookingRepo;
        this.messageRepo = messageRepo;
        this.ratingRepo = ratingRepo;
        this.reportRepo = reportRepo;
        this.blockRepo = blockRepo;
        this.auth = auth;
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> deleteAccount(String authHeader) {
        CreateProfileDB profile;
        try {
            profile = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }

        purgeUser(profile);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "account deleted");
        return ResponseEntity.ok(body);
    }

    /**
     * Tears down a user account and all data the platform owns for them. Used by
     * both self-service deletion (guideline 5.1.1(v)) and moderator ejection
     * (guideline 1.2). Records a counterparty still relies on (bookings,
     * messages, ratings) are anonymized; the rest is removed.
     */
    @Transactional
    public void purgeUser(CreateProfileDB profile) {
        String email = profile.getEmail();
        String anonEmail = "deleted+" + profile.getId() + "@users.palriders.invalid";

        archivedRepo.save(new ArchivedUserDB(profile.getName(), email, LocalDateTime.now()));

        feedRepo.deleteByEmail(email);

        bookingRepo.anonymizeRider(email, anonEmail, ANON_NAME);
        bookingRepo.anonymizeDriver(email, anonEmail, ANON_NAME);
        messageRepo.anonymizeSender(email, anonEmail, ANON_NAME);
        messageRepo.anonymizeRecipient(email, anonEmail, ANON_NAME);
        ratingRepo.anonymizeRater(email, anonEmail, ANON_NAME);
        ratingRepo.anonymizeRated(email, anonEmail, ANON_NAME);
        reportRepo.anonymizeReporter(email, anonEmail, ANON_NAME);
        
        blockRepo.deleteAllInvolving(email);

        profileRepo.delete(profile);
    }
}
