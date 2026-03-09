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
import org.springframework.test.web.servlet.MockMvc;

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
        void getPreferences_authorized_returns200() throws Exception {
                // Should return scientific defaults
                UserPreferences prefs = UserPreferences.defaults("mock-sub");
                when(getPreferences.execute("mock-sub")).thenReturn(prefs);

                mockMvc.perform(get("/api/v1/preferences")
                                .with(jwt().jwt(j -> j.subject("mock-sub"))))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.sleepLatencyMinutes").value(14));
        }

        @Test
        void updatePreferences_isNowLocked_returns400() throws Exception {
                UpdatePreferencesRequest request = new UpdatePreferencesRequest(15, 90, 4, 6, 5);

                when(updatePreferences.execute(eq("mock-sub"), any(UpdatePreferences.Request.class)))
                                .thenThrow(new dev.somnitide.domain.exception.DomainException("LOCKED", "Locked"));

                mockMvc.perform(put("/api/v1/preferences")
                                .with(jwt().jwt(j -> j.subject("mock-sub")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error").value("LOCKED"));
        }
}
