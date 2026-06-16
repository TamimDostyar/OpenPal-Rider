package openpal.controllers;


import org.springframework.web.bind.annotation.*;
import java.util.HashMap;


@RestController
@RequestMapping("api")
public class Routes {
    HashMap<String, String> data = new HashMap<String, String>();

    @GetMapping("/home-route")
    public HashMap<String, String> homeRoute(){
        data.put("Success", "Hey bro");
        return data;
    }

    @GetMapping("/answer")
    public HashMap<String, String> answerMe(){
        data.put("Success", "So you got no other life, bro? stop playing");
        return data;
    }
}
