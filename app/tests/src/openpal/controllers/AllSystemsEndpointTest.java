package openpal.controllers;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(Routes.class)
public class AllSystemsEndpointTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void homeRouteTest() throws Exception {
        mockMvc.perform(get("/api/home-route"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.Success").value("Hey bro"));
    }

    @Test
    void answerMeTest() throws Exception {
        mockMvc.perform(get("/api/answer"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.Success")
            .value("So you got no other life, bro? stop playing"));
    }
}
