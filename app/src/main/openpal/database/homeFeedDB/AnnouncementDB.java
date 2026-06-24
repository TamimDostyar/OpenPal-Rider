package openpal.database.homeFeedDB;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;


@Entity
@Table(name = "announcement")
public class AnnouncementDB{
    @Id
    @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String announcement;
    public UUID getId(){return this.id;}

    @Column(nullable=false)
    private LocalTime localTime;
    @Column(nullable=false)
    private LocalDate localDate;


    public String getAnnouncement(){return this.announcement;}
    public void setAnnouncement(String newAnnouncement){this.announcement = newAnnouncement;}

    public LocalTime getLocalTime(){return localTime;}
    public LocalDate getLocalDate(){return localDate;}

    public void setLocalTime(LocalTime localTime){this.localTime=localTime;}
    public void setLocalDate(LocalDate localDate){this.localDate=localDate;}
}