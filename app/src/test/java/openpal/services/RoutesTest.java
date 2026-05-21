package openpal.services;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

/** HTTP-layer tests for the {@link Routes} controller. */
@WebMvcTest(Routes.class)
class RoutesTest {

    @Autowired
    private MockMvc mvc;

    @Test
    @DisplayName("GET /api/ returns 200 with the greeting payload")
    void homeRouteReturnsGreeting() throws Exception {
        mvc.perform(get("/api/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Success").value("Hey bro"));
    }

    @Test
    @DisplayName("altRoute() has no @*Mapping, so it is not reachable over HTTP")
    void altRouteIsNotExposed() throws Exception {
        mvc.perform(get("/api/altRoute")).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST to the GET-only home route is rejected with 405")
    void homeRouteRejectsPost() throws Exception {
        mvc.perform(post("/api/")).andExpect(status().isMethodNotAllowed());
    }

    @Test
    @DisplayName("an unknown path under /api returns 404")
    void unknownPathReturns404() throws Exception {
        mvc.perform(get("/api/does-not-exist")).andExpect(status().isNotFound());
    }
}
