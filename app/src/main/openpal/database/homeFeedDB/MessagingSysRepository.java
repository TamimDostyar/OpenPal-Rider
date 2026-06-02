package openpal.database.homeFeedDB;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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

    @Modifying
    @Transactional
    @Query("UPDATE MessagingSysDB m SET m.readAt = :now WHERE "
        + "LOWER(m.recipientEmail) = LOWER(:recipient) AND "
        + "LOWER(m.senderEmail) = LOWER(:sender) AND "
        + "m.readAt IS NULL")
    int markConversationRead(@Param("recipient") String recipient,
                             @Param("sender") String sender,
                             @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("UPDATE MessagingSysDB m SET m.senderEmail = :anonEmail, m.senderUsername = :anonName "
        + "WHERE LOWER(m.senderEmail) = LOWER(:email)")
    int anonymizeSender(@Param("email") String email,
                        @Param("anonEmail") String anonEmail,
                        @Param("anonName") String anonName);

    @Modifying
    @Transactional
    @Query("UPDATE MessagingSysDB m SET m.recipientEmail = :anonEmail, m.recipientUsername = :anonName "
        + "WHERE LOWER(m.recipientEmail) = LOWER(:email)")
    int anonymizeRecipient(@Param("email") String email,
                           @Param("anonEmail") String anonEmail,
                           @Param("anonName") String anonName);
}
