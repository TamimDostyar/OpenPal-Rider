package openap.controllers.homeFeed;


public class FeedPosts{
    private String username;
    private String text;
    
    FeedPosts(String userName, String newPostText){
        this.username = userName;
        this.text = newPostText;
    }   

    String getUsername(){
        return this.username;
    }
    void setUsername(String userName){
        this.username = userName;
    }

    String getNewText(){
        return this.text;
    }
    String setNewText(String newPostText){
        this.text = newPostText;
    }

}