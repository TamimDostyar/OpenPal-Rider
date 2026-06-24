package openpal.dto.homeFeed;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class Announcement{
    private UUID id;
    private String announcement;
    private LocalDate allDay;
    private LocalTime localTime;

    public Announcement(){
        this.allDay = LocalDate.now();
        this.localTime = LocalTime.now();
    }

    // getter and settter
    public UUID getId(){return this.id;}
    public void setID(UUID id){this.id = id;}
    
    public String getAnnouncement(){return this.announcement;}
    public void setAnnouncement(String newAnnouncement){this.announcement = newAnnouncement;}
    public LocalDate getLocalDate(){return this.allDay;}
    public LocalTime getLocalTime(){return this.localTime;}

}