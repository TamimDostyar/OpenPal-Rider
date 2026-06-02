package openpal.controllers.profile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import openpal.controllers.security.AuthSupport;
import openpal.controllers.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.ArchivedUserDB;
import openpal.database.account_mgt.ArchivedUserRepository;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.bookingsDB.BookingRepository;
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
    private final AuthSupport auth;

    @Autowired
    public AccountManager(ProfileRepository profileRepo,
                          ArchivedUserRepository archivedRepo,
                          FeedPostsRepository feedRepo,
                          BookingRepository bookingRepo,
                          MessagingSysRepository messageRepo,
                          RatingRepository ratingRepo,
                          ReportRepository reportRepo,
                          AuthSupport auth) {
        this.profileRepo = profileRepo;
        this.archivedRepo = archivedRepo;
        this.feedRepo = feedRepo;
        this.bookingRepo = bookingRepo;
        this.messageRepo = messageRepo;
        this.ratingRepo = ratingRepo;
        this.reportRepo = reportRepo;
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

        String email = profile.getEmail();
        // Per-user sentinel so two deleted users never collapse into one another
        // in a counterparty's conversation/booking history.
        String anonEmail = "deleted+" + profile.getId() + "@users.palriders.invalid";

        // Keep a tombstone for the historical user count (purged after one year).
        archivedRepo.save(new ArchivedUserDB(profile.getName(), email, LocalDateTime.now()));

        // The user's own ride posts are theirs alone — remove them outright.
        feedRepo.deleteByEmail(email);

        // Shared records: scrub the deleted user's identity, keep the row so the
        // other party's history stays intact.
        bookingRepo.anonymizeRider(email, anonEmail, ANON_NAME);
        bookingRepo.anonymizeDriver(email, anonEmail, ANON_NAME);
        messageRepo.anonymizeSender(email, anonEmail, ANON_NAME);
        messageRepo.anonymizeRecipient(email, anonEmail, ANON_NAME);
        ratingRepo.anonymizeRater(email, anonEmail, ANON_NAME);
        ratingRepo.anonymizeRated(email, anonEmail, ANON_NAME);
        reportRepo.anonymizeReporter(email, anonEmail, ANON_NAME);

        // Finally, drop the account row itself (frees the unique email/username).
        profileRepo.delete(profile);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "account deleted");
        return ResponseEntity.ok(body);
    }
}
