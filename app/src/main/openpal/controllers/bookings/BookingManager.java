package openpal.controllers.bookings;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import openpal.controllers.security.AuthSupport;
import openpal.controllers.security.AuthSupport.AuthFailure;
import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.bookingsDB.BookingDB;
import openpal.database.bookingsDB.BookingRepository;
import openpal.database.bookingsDB.BookingStatus;
import openpal.database.homeFeedDB.FeedPostsDB;
import openpal.database.homeFeedDB.FeedPostsRepository;
import openpal.services.EmailService;

@Component
public class BookingManager {

    private final BookingRepository bookingRepo;
    private final FeedPostsRepository feedRepo;
    private final AuthSupport auth;
    private final EmailService emailService;

    @Autowired
    public BookingManager(BookingRepository bookingRepo,
                          FeedPostsRepository feedRepo,
                          AuthSupport auth,
                          EmailService emailService) {
        this.bookingRepo = bookingRepo;
        this.feedRepo = feedRepo;
        this.auth = auth;
        this.emailService = emailService;
    }

    public ResponseEntity<Map<String, Object>> request(String authHeader, Booking request) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        if (request == null || request.getPostId() == null) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "postId is required");
        }
        int seats = request.getSeatsRequested() == null ? 1 : request.getSeatsRequested();
        if (seats < 1) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "seatsRequested must be at least 1");
        }

        Optional<FeedPostsDB> postOpt = feedRepo.findById(request.getPostId());
        if (postOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "post not found");
        }
        FeedPostsDB post = postOpt.get();
        if (post.getEmail().equalsIgnoreCase(caller.getEmail())) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST, "cannot book your own ride");
        }
        if (!AuthSupport.emailDomain(post.getEmail())
                .equalsIgnoreCase(AuthSupport.emailDomain(caller.getEmail()))) {
            return AuthSupport.error(HttpStatus.FORBIDDEN, "ride is not at your school");
        }

        // Two directions:
        //  - DRIVER post  → caller is a rider booking a seat (normal flow)
        //  - PASSENGER post → caller is a driver offering to give the ride
        boolean callerIsDriver = "PASSENGER".equalsIgnoreCase(post.getPostType());

        if (!callerIsDriver && post.getSeats() < seats) {
            return AuthSupport.error(HttpStatus.BAD_REQUEST,
                    "only " + post.getSeats() + " seat(s) available");
        }

        String riderEmail    = callerIsDriver ? post.getEmail()    : caller.getEmail();
        String riderUsername = callerIsDriver ? post.getUsername() : caller.getUsername();
        String driverEmail   = callerIsDriver ? caller.getEmail()    : post.getEmail();
        String driverUsername= callerIsDriver ? caller.getUsername() : post.getUsername();

        BookingDB saved = bookingRepo.save(new BookingDB(
                post.getId(),
                riderEmail,
                riderUsername,
                driverEmail,
                driverUsername,
                seats
        ));

        // Notify the recipient (the *other* party in the booking) by email.
        if (callerIsDriver) {
            emailService.sendRideOffer(riderEmail, driverUsername,
                    post.getOrigin(), post.getDestination());
        } else {
            emailService.sendBookingRequested(driverEmail, riderUsername,
                    post.getOrigin(), post.getDestination(), seats);
        }

        return ok(callerIsDriver ? "ride offered" : "booking requested", saved, post);
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> accept(String authHeader, UUID bookingId) {
        return decide(authHeader, bookingId, true);
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> decline(String authHeader, UUID bookingId) {
        return decide(authHeader, bookingId, false);
    }

    private ResponseEntity<Map<String, Object>> decide(String authHeader, UUID bookingId, boolean accept) {
        CreateProfileDB driver;
        try {
            driver = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        Optional<BookingDB> bookingOpt = bookingRepo.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "booking not found");
        }
        BookingDB booking = bookingOpt.get();
        if (!booking.getDriverEmail().equalsIgnoreCase(driver.getEmail())) {
            return AuthSupport.error(HttpStatus.FORBIDDEN, "only the driver can respond to this booking");
        }
        if (booking.getStatus() != BookingStatus.REQUESTED) {
            return AuthSupport.error(HttpStatus.CONFLICT,
                    "booking is already " + booking.getStatus().name().toLowerCase());
        }

        Optional<FeedPostsDB> postOpt = feedRepo.findById(booking.getPostId());
        if (postOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "underlying post not found");
        }
        FeedPostsDB post = postOpt.get();

        if (accept) {
            if (post.getSeats() < booking.getSeatsRequested()) {
                return AuthSupport.error(HttpStatus.CONFLICT,
                        "not enough seats remaining to accept this booking");
            }
            post.setSeats(post.getSeats() - booking.getSeatsRequested());
            feedRepo.save(post);
            booking.setStatus(BookingStatus.ACCEPTED);
        } else {
            booking.setStatus(BookingStatus.DECLINED);
        }
        BookingDB saved = bookingRepo.save(booking);
        emailService.sendBookingResponse(booking.getRiderEmail(), accept,
                booking.getDriverUsername(), post.getOrigin(), post.getDestination());

        return ok(accept ? "booking accepted" : "booking declined", saved, post);
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> cancel(String authHeader, UUID bookingId) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        Optional<BookingDB> bookingOpt = bookingRepo.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "booking not found");
        }
        BookingDB booking = bookingOpt.get();
        boolean isRider = booking.getRiderEmail().equalsIgnoreCase(caller.getEmail());
        boolean isDriver = booking.getDriverEmail().equalsIgnoreCase(caller.getEmail());
        if (!isRider && !isDriver) {
            return AuthSupport.error(HttpStatus.FORBIDDEN, "not your booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED
                || booking.getStatus() == BookingStatus.DECLINED
                || booking.getStatus() == BookingStatus.COMPLETED) {
            return AuthSupport.error(HttpStatus.CONFLICT,
                    "booking is already " + booking.getStatus().name().toLowerCase());
        }

        FeedPostsDB post = feedRepo.findById(booking.getPostId()).orElse(null);
        if (booking.getStatus() == BookingStatus.ACCEPTED && post != null) {
            post.setSeats(post.getSeats() + booking.getSeatsRequested());
            feedRepo.save(post);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        BookingDB saved = bookingRepo.save(booking);
        return ok("booking cancelled", saved, post);
    }

    @Transactional
    public ResponseEntity<Map<String, Object>> complete(String authHeader, UUID bookingId) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        Optional<BookingDB> bookingOpt = bookingRepo.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            return AuthSupport.error(HttpStatus.NOT_FOUND, "booking not found");
        }
        BookingDB booking = bookingOpt.get();
        if (!booking.getDriverEmail().equalsIgnoreCase(caller.getEmail())) {
            return AuthSupport.error(HttpStatus.FORBIDDEN, "only the driver can complete this booking");
        }
        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            return AuthSupport.error(HttpStatus.CONFLICT,
                    "can only complete an accepted booking");
        }
        booking.setStatus(BookingStatus.COMPLETED);
        BookingDB saved = bookingRepo.save(booking);

        FeedPostsDB post = feedRepo.findById(booking.getPostId()).orElse(null);
        String origin = post == null ? "" : post.getOrigin();
        String dest = post == null ? "" : post.getDestination();
        emailService.sendRatingPrompt(booking.getRiderEmail(), booking.getDriverUsername(), origin, dest);
        emailService.sendRatingPrompt(booking.getDriverEmail(), booking.getRiderUsername(), origin, dest);

        return ok("booking completed", saved, post);
    }

    public ResponseEntity<?> listMine(String authHeader) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        List<BookingDB> bookings = bookingRepo
                .findByRiderEmailIgnoreCaseOrderByCreatedAtDesc(caller.getEmail());
        return ResponseEntity.ok(joinWithPosts(bookings));
    }

    public ResponseEntity<?> listIncoming(String authHeader) {
        CreateProfileDB caller;
        try {
            caller = auth.authenticate(authHeader);
        } catch (AuthFailure f) {
            return AuthSupport.error(f.status, f.getMessage());
        }
        List<BookingDB> bookings = bookingRepo
                .findByDriverEmailIgnoreCaseOrderByCreatedAtDesc(caller.getEmail());
        return ResponseEntity.ok(joinWithPosts(bookings));
    }

    private List<BookingResponse> joinWithPosts(List<BookingDB> bookings) {
        if (bookings.isEmpty()) return new ArrayList<>();
        Map<UUID, FeedPostsDB> postsById = new HashMap<>();
        for (BookingDB b : bookings) {
            postsById.computeIfAbsent(b.getPostId(),
                    id -> feedRepo.findById(id).orElse(null));
        }
        List<BookingResponse> out = new ArrayList<>(bookings.size());
        for (BookingDB b : bookings) {
            BookingResponse r = BookingResponse.from(b);
            FeedPostsDB post = postsById.get(b.getPostId());
            if (post != null) {
                r.setRideSummary(post.getOrigin(), post.getDestination(), post.getDepartureTime());
            }
            out.add(r);
        }
        return out;
    }

    private static ResponseEntity<Map<String, Object>> ok(String message, BookingDB booking, FeedPostsDB post) {
        BookingResponse data = BookingResponse.from(booking);
        if (post != null) {
            data.setRideSummary(post.getOrigin(), post.getDestination(), post.getDepartureTime());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        body.put("booking", data);
        return ResponseEntity.ok(body);
    }
}
