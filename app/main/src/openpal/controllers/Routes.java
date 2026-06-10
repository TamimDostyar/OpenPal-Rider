package openpal.controllers;


import org.springframework.web.bind.annotation.*;
import java.util.HashMap;


@RestController
@RequestMapping("api")
public class Routes {

    @GetMapping("/")
    public HashMap<String, String> homeRoute(){
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("Success", "Hey bro");

        return data;

    }


    public HashMap<String, String> altRoute(){
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("success", "alt routes");

        return data;
    }
}
