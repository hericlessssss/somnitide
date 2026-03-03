package dev.somnitide.infrastructure.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.somnitide.application.usecase.GetPreferences;
import dev.somnitide.application.usecase.UpdatePreferences;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.infrastructure.web.dto.request.UpdatePreferencesRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PreferencesController.class)
@AutoConfigureMockMvc
class PreferencesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GetPreferences getPreferences;

    @MockBean
    private UpdatePreferences updatePreferences;

    @Test
    void getPreferences_unauthorized_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/preferences"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getPreferences_authorized_returns200() throws Exception {
        UserPreferences prefs = new UserPreferences(
                "mock-sub", 20, 100, 4, 6, 10, Instant.now());
        when(getPreferences.execute("mock-sub")).thenReturn(prefs);

        mockMvc.perform(get("/api/v1/preferences")
                .with(jwt().jwt(j -> j.subject("mock-sub"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sleepLatencyMinutes").value(20))
                .andExpect(jsonPath("$.cycleLengthMinutes").value(100));
    }

    @Test
    void updatePreferences_validPayload_returns200() throws Exception {
        UpdatePreferencesRequest request = new UpdatePreferencesRequest(15, 90, 4, 6, 5);

        UserPreferences updatedPrefs = new UserPreferences(
                "mock-sub", 15, 90, 4, 6, 5, Instant.parse("2026-03-03T10:00:00Z"));
        when(updatePreferences.execute(eq("mock-sub"), any(UpdatePreferences.Request.class)))
                .thenReturn(updatedPrefs);

        mockMvc.perform(put("/api/v1/preferences")
                .with(jwt().jwt(j -> j.subject("mock-sub")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sleepLatencyMinutes").value(15))
                .andExpect(jsonPath("$.updatedAtUtc").value("2026-03-03T10:00:00Z"));
    }

    @Test
    void updatePreferences_invalidPayload_returns400() throws Exception {
        // Validation fails because maxCycles (20) > 10
        UpdatePreferencesRequest request = new UpdatePreferencesRequest(15, 90, 4, 20, 5);

        mockMvc.perform(put("/api/v1/preferences")
                .with(jwt().jwt(j -> j.subject("mock-sub")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.message").exists());
    }
}
