package openpal.controllers.ratings;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import openpal.controllers.security.AuthSupport;
import openpal.controllers.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.ProfileRepository;
import openpal.database.bookingsDB.BookingDB;
import openpal.database.bookingsDB.BookingRepository;
import openpal.database.bookingsDB.BookingStatus;
import openpal.database.ratingsDB.RatingDB;
import openpal.database.ratingsDB.RatingRepository;

@Component
public class RatingManager {

    private final RatingRepository ratingRepo;
    private final BookingRepository bookingRepo;
    private final ProfileRepository profileRepo;
    private final AuthSupport auth;

    @Autowired
    public RatingManager(RatingRepository ratingRepo,
                         BookingRepository bookingRepo,
                         ProfileRepository profileRepo,
                         AuthSupport auth) {
        this.ratingRepo = ratingRepo;
        this.bookingRepo = bookingRepo;
        this.profileRepo = profileRepo;
        this.auth = auth;
    }

    public ResponseEntity<Map<String, Object>> create(String authHeader, Rating request) {
        CreateProfileDB rater;
        try {
            rater = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        if (request == null || request.getBookingId() == null) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "bookingId is required");
        }
        if (request.getStars() == null || request.getStars() < 1 || request.getStars() > 5) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "stars must be between 1 and 5");
        }

        Optional<BookingDB> bookingOpt = bookingRepo.findById(request.getBookingId());
        if (bookingOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "booking not found");
        }
        BookingDB booking = bookingOpt.get();
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            return AuthSupport.error(HttpStatus.CONFLICT, "can only rate completed bookings");
        }

        boolean isRider = booking.getRiderEmail().equalsIgnoreCase(rater.getEmail());
        boolean isDriver = booking.getDriverEmail().equalsIgnoreCase(rater.getEmail());
        if (!isRider && !isDriver) {
            return AuthSupport.error(HttpStatus.FORBIDDEN, "not your booking");
        }
        if (ratingRepo.existsByBookingIdAndRaterEmailIgnoreCase(
                booking.getId(), rater.getEmail())) {
            return AuthSupport.error(HttpStatus.CONFLICT, "you already rated this booking");
        }

        String ratedEmail = isRider ? booking.getDriverEmail() : booking.getRiderEmail();
        String ratedUsername = isRider ? booking.getDriverUsername() : booking.getRiderUsername();
        String text = request.getText() == null ? null : request.getText().trim();
        if (text != null && text.isEmpty()) text = null;

        RatingDB saved = ratingRepo.save(new RatingDB(
                booking.getId(),
                rater.getEmail(),
                rater.getUsername(),
                ratedEmail,
                ratedUsername,
                request.getStars(),
                text
        ));

        Map<String, Object> body = new HashMap<>();
        body.put("message", "rating saved");
        body.put("rating", RatingResponse.from(saved));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    public ResponseEntity<?> listForUser(String authHeader, String username) {
        try {
            auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        Optional<CreateProfileDB> userOpt = profileRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "user not found");
        }
        List<RatingDB> ratings = ratingRepo
                .findByRatedEmailIgnoreCaseOrderByCreatedAtDesc(userOpt.get().getEmail());

        double avg = ratings.stream().mapToInt(RatingDB::getStars).average().orElse(0.0);
        List<RatingResponse> data = new ArrayList<>(ratings.size());
        for (RatingDB r : ratings) data.add(RatingResponse.from(r));

        Map<String, Object> body = new HashMap<>();
        body.put("username", username);
        body.put("average", Math.round(avg * 10.0) / 10.0);
        body.put("count", ratings.size());
        body.put("ratings", data);
        return ResponseEntity.ok(body);
    }
}
