package openpal.database.homeFeedDB;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessagingSysRepository extends JpaRepository<MessagingSysDB, UUID> {

    @Query("SELECT m FROM MessagingSysDB m WHERE "
        + "(LOWER(m.senderEmail) = LOWER(:a) AND LOWER(m.recipientEmail) = LOWER(:b)) OR "
        + "(LOWER(m.senderEmail) = LOWER(:b) AND LOWER(m.recipientEmail) = LOWER(:a)) "
        + "ORDER BY m.createdAt ASC")
    List<MessagingSysDB> findConversation(@Param("a") String a, @Param("b") String b);

    @Query("SELECT m FROM MessagingSysDB m WHERE "
        + "LOWER(m.senderEmail) = LOWER(:email) OR LOWER(m.recipientEmail) = LOWER(:email) "
        + "ORDER BY m.createdAt DESC")
    List<MessagingSysDB> findInvolving(@Param("email") String email);
}
