package openpal.services.homeFeed;

import openpal.database.homeFeedDB.AnnouncementDB;
import openpal.database.homeFeedDB.AnnouncementRepository;
import openpal.dto.homeFeed.Announcement;
import openpal.services.notification.PushNotificationService;


import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

@Service // this is the component basically
public class AnnouncementManager {

    private final AnnouncementRepository announcementRepo;
    private final PushNotificationService pushService;

    @Autowired
    public AnnouncementManager(AnnouncementRepository announcementRepo,
                               PushNotificationService pushService) {
        this.announcementRepo = announcementRepo;
        this.pushService = pushService;
    }

    public List<AnnouncementDB> readAnnouncement() {
        return announcementRepo.findAll();
    }

    public void writeAnnouncement(Announcement dto) {
        if (dto.getAnnouncement() == null || dto.getAnnouncement().isBlank()) return;

        AnnouncementDB entity = new AnnouncementDB();
        entity.setAnnouncement(dto.getAnnouncement());
        entity.setLocalTime(dto.getLocalTime());
        entity.setLocalDate(dto.getLocalDate());

        announcementRepo.save(entity);

        // Broadcast the new announcement to every registered device. Async and
        // best-effort, so a push failure never affects saving the announcement.
        pushService.sendToAll(
            "📢 New announcement",
            dto.getAnnouncement(),
            Map.of("type", "announcement")
        );
    }
}