package openpal.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import openpal.database.account_mgt.CreateProfileDB;
import openpal.database.account_mgt.PasswordHasher;
import openpal.database.account_mgt.ProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * HTTP-layer tests for POST /api/user/create-user.
 *
 * The repository is mocked, so these tests pin the controller's validation,
 * status codes, and response shape. Tests tagged BUG/RISK assert current
 * behaviour and flag where it is unsafe.
 */
@WebMvcTest(ProfileService.class)
class ProfileServiceTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private ProfileRepository repo;

    private static final String URL = "/api/user/create-user";

    /** A fully valid request body; individual tests override one field at a time. */
    private static String body(String name, String email, String phone,
                               String password, String school) {
        return """
            {
              "name": %s,
              "email": %s,
              "dob": "2002-04-10",
              "school": %s,
              "graduationDate": "2026-05-15",
              "phoneNumber": %s,
              "password": %s
            }
            """.formatted(json(name), json(email), json(school), phone, json(password));
    }

    private static String json(String v) {
        return v == null ? "null" : "\"" + v.replace("\"", "\\\"") + "\"";
    }

    private static String validBody() {
        return body("Jane Doe", "jane@adelphi.edu", "1234567", "Str0ngPass!", "Adelphi University");
    }

    private void stubSaveEchoesEntity() {
        when(repo.existsByEmail(anyString())).thenReturn(false);
        when(repo.save(any(CreateProfileDB.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // ---- happy path -------------------------------------------------------

    @Test
    @DisplayName("a valid request creates the profile and returns 201")
    void validRequestReturns201() throws Exception {
        stubSaveEchoesEntity();
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Jane Doe"))
                .andExpect(jsonPath("$.email").value("jane@adelphi.edu"));
    }

    @Test
    @DisplayName("the response never echoes the password (hashed or raw)")
    void responseDoesNotLeakPassword() throws Exception {
        stubSaveEchoesEntity();
        String response = mvc.perform(post(URL)
                        .contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        assertFalse(response.toLowerCase().contains("password"), "response leaked a password field");
        assertFalse(response.contains("Str0ngPass!"), "response leaked the raw password");
    }

    @Test
    @DisplayName("the password is BCrypt-hashed before it is persisted")
    void passwordIsHashedBeforeSave() throws Exception {
        stubSaveEchoesEntity();
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isCreated());

        ArgumentCaptor<CreateProfileDB> captor = ArgumentCaptor.forClass(CreateProfileDB.class);
        verify(repo).save(captor.capture());
        String stored = captor.getValue().getPassword();
        assertFalse("Str0ngPass!".equals(stored), "raw password was persisted unhashed");
        assertTrue(PasswordHasher.matches("Str0ngPass!", stored), "stored value is not a valid hash");
    }

    @Test
    @DisplayName("leading/trailing whitespace in name, email and school is trimmed")
    void fieldsAreTrimmedBeforeSave() throws Exception {
        stubSaveEchoesEntity();
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("  Jane Doe  ", "  jane@adelphi.edu  ",
                                "1234567", "Str0ngPass!", "Adelphi University")))
                .andExpect(status().isCreated());

        ArgumentCaptor<CreateProfileDB> captor = ArgumentCaptor.forClass(CreateProfileDB.class);
        verify(repo).save(captor.capture());
        assertEquals("Jane Doe", captor.getValue().getName());
        assertEquals("jane@adelphi.edu", captor.getValue().getEmail());
    }

    // ---- required-field validation ---------------------------------------

    @Test
    @DisplayName("a missing name is rejected with 400")
    void missingNameRejected() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body(null, "jane@adelphi.edu", "1234567", "pw", "Adelphi University")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("name is required"));
    }

    @Test
    @DisplayName("a blank (whitespace-only) name is rejected with 400")
    void blankNameRejected() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("   ", "jane@adelphi.edu", "1234567", "pw", "Adelphi University")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("name is required"));
    }

    @Test
    @DisplayName("a missing email is rejected with 400")
    void missingEmailRejected() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jane", null, "1234567", "pw", "Adelphi University")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("email is required"));
    }

    @Test
    @DisplayName("a missing phone number is rejected with 400")
    void missingPhoneRejected() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jane", "jane@adelphi.edu", "null", "pw", "Adelphi University")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("phone number required"));
    }

    @Test
    @DisplayName("a missing password is rejected with 400")
    void missingPasswordRejected() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jane", "jane@adelphi.edu", "1234567", null, "Adelphi University")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("password is required"));
    }

    // ---- school validation -----------------------------------------------

    @Test
    @DisplayName("an unrecognized school is rejected with 400")
    void unknownSchoolRejected() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jane", "jane@adelphi.edu", "1234567", "pw", "Hogwarts")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("school is not a recognized US university"));
    }

    @Test
    @DisplayName("a null school is rejected with 400")
    void nullSchoolRejected() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jane", "jane@adelphi.edu", "1234567", "pw", null)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("school is not a recognized US university"));
    }

    // ---- duplicate handling ----------------------------------------------

    @Test
    @DisplayName("a duplicate email is rejected with 409 and never saved")
    void duplicateEmailReturns409() throws Exception {
        when(repo.existsByEmail("jane@adelphi.edu")).thenReturn(true);
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("an account with this email already exists"));
        verify(repo, never()).save(any());
    }

    // ---- malformed input --------------------------------------------------

    @Test
    @DisplayName("a malformed JSON body is rejected with 400")
    void malformedJsonRejected() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content("{ not json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("an empty request body is rejected with 400")
    void emptyBodyRejected() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET on the create-only endpoint is rejected with 405")
    void getOnCreateEndpointRejected() throws Exception {
        mvc.perform(get(URL)).andExpect(status().isMethodNotAllowed());
    }

    // ---- security / attack surface ---------------------------------------

    @Test
    @DisplayName("ATTACK: an SQL-injection-style name is stored verbatim, not executed")
    void sqlInjectionNameStoredAsLiteral() throws Exception {
        stubSaveEchoesEntity();
        String payload = "Robert'); DROP TABLE profiles;--";
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body(payload, "bobby@adelphi.edu", "1234567",
                                "Str0ngPass!", "Adelphi University")))
                .andExpect(status().isCreated());

        ArgumentCaptor<CreateProfileDB> captor = ArgumentCaptor.forClass(CreateProfileDB.class);
        verify(repo).save(captor.capture());
        assertEquals(payload, captor.getValue().getName(),
                "value should be passed to a parameterized query untouched");
    }

    @Test
    @DisplayName("BUG: a phone number larger than Integer.MAX_VALUE cannot be submitted")
    void bugRealPhoneNumberOverflowsInteger() throws Exception {
        stubSaveEchoesEntity();
        // 5551234567 is a normal US number but overflows the Integer phoneNumber
        // field, so Jackson fails to deserialize and the request 400s.
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jane", "jane@adelphi.edu", "5551234567",
                                "Str0ngPass!", "Adelphi University")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("BUG: email is stored without case normalization, enabling duplicate accounts")
    void bugEmailNotNormalized() throws Exception {
        stubSaveEchoesEntity();
        // 'JANE@ADELPHI.EDU' is the same address as 'jane@adelphi.edu', but the
        // service stores it as-is. existsByEmail is case-sensitive, so the
        // duplicate check is bypassed and a second account is created.
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jane", "JANE@ADELPHI.EDU", "1234567",
                                "Str0ngPass!", "Adelphi University")))
                .andExpect(status().isCreated());

        ArgumentCaptor<CreateProfileDB> captor = ArgumentCaptor.forClass(CreateProfileDB.class);
        verify(repo).save(captor.capture());
        assertEquals("JANE@ADELPHI.EDU", captor.getValue().getEmail(),
                "email stored uppercase - should be normalized to lowercase");
    }

    @Test
    @DisplayName("BUG: a malformed email with no '@' is accepted (no email-format validation)")
    void bugMalformedEmailAccepted() throws Exception {
        stubSaveEchoesEntity();
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jane", "not-an-email", "1234567",
                                "Str0ngPass!", "Adelphi University")))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("BUG: a one-character password is accepted (no strength/length policy)")
    void bugWeakPasswordAccepted() throws Exception {
        stubSaveEchoesEntity();
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Jane", "jane@adelphi.edu", "1234567",
                                "x", "Adelphi University")))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("BUG: a date of birth in the future is accepted (no DOB sanity check)")
    void bugFutureDobAccepted() throws Exception {
        stubSaveEchoesEntity();
        String futureDob = """
            {
              "name": "Jane",
              "email": "jane@adelphi.edu",
              "dob": "2099-01-01",
              "school": "Adelphi University",
              "graduationDate": "2026-05-15",
              "phoneNumber": 1234567,
              "password": "Str0ngPass!"
            }
            """;
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(futureDob))
                .andExpect(status().isCreated());
    }
}
