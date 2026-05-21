package openpal.database.account_mgt;
import jakarta.persistence.*;
import java.util.UUID;


// this checks if the user is in the database returns true if
@Entity
@Table(name = "profiles")
public class LoginDB{
    private String userName;
    private String email;
    private String password;
    
    public LoginDB(){
    }

    

}