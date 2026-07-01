package openpal.services.homeFeed;

import openpal.database.homeFeedDB.AnnouncementDB;
import openpal.database.homeFeedDB.AnnouncementRepository;
import openpal.dto.homeFeed.Announcement;


import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Service // this is the component basically 
public class AnnouncementManager {

    private final AnnouncementRepository announcementRepo;

    @Autowired
    public AnnouncementManager(AnnouncementRepository announcementRepo) {
        this.announcementRepo = announcementRepo;
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
    }
}