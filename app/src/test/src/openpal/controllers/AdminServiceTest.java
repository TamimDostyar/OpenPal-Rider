package openpal.controllers;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;

import openpal.services.admin.AdminManager;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(AdminService.class)
public class AdminServiceTest{

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminManager manager;


    @Test
    void listReportsTest() throws Exception{
        System.out.println("List reporting test");
        mockMvc.perform(get("/api/admin/reports"))
            .andExpect(status().isOk());
    }
}
