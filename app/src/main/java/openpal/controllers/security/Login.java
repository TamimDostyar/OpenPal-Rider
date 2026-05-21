package openpal.controllers.security;


public class Login extends Signup{
    private String username;
    private String email;
    private String pwd;


    Login(String username, String email, String pwd){
        this.username = username;
        this.email = email;
        this.pwd = pwd;
    }

    public boolean isLoginDataValid(){
        if (this.username == null || this.email == null || this.pwd == null){
            return false;
        }

        // initial checking for the data is valid
        if (!this.username.matches(".*[^a-zA-Z0-9].*") && email.endsWith(".edu")){
            return true;
        }

        return false;
    }


    public String getUsername(){
        return this.username;
    }
    public void setUsername(String username){
        this.username = username;
    }

    public String getPassword(){
        return this.pwd;
    }
    public void setPassword(String pw){
        this.pwd = pw;
    }
}