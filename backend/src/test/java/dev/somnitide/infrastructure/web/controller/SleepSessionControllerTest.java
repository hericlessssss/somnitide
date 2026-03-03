package dev.somnitide.infrastructure.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.somnitide.application.usecase.EndSleepSession;
import dev.somnitide.application.usecase.GetHistory;
import dev.somnitide.application.usecase.StartSleepSession;
import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.model.WakeSuggestion;
import dev.somnitide.infrastructure.web.dto.request.EndSessionRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SleepSessionController.class)
@AutoConfigureMockMvc
class SleepSessionControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private StartSleepSession startSleepSession;

        @MockBean
        private EndSleepSession endSleepSession;

        @MockBean
        private GetHistory getHistory;

        @Test
        void startSession_success_returns200() throws Exception {
                SleepSession mockSession = new SleepSession("sub-1", Instant.parse("2026-03-03T10:00:00Z"), 14);
                List<WakeSuggestion> mockSuggestions = List.of(
                                new WakeSuggestion(Instant.parse("2026-03-03T11:44:00Z"), 1, false));

                when(startSleepSession.execute("sub-1"))
                                .thenReturn(new StartSleepSession.Response(mockSession, mockSuggestions));

                mockMvc.perform(post("/api/v1/sessions/start")
                                .with(jwt().jwt(j -> j.subject("sub-1"))))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.isOpen").value(true))
                                .andExpect(jsonPath("$.suggestions[0].cycles").value(1));
        }

        @Test
        void startSession_alreadyOpen_returns400() throws Exception {
                when(startSleepSession.execute("sub-2"))
                                .thenThrow(new DomainException("SESSION_ALREADY_OPEN", "Already open"));

                mockMvc.perform(post("/api/v1/sessions/start")
                                .with(jwt().jwt(j -> j.subject("sub-2"))))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.error").value("SESSION_ALREADY_OPEN"));
        }

        @Test
        void endSession_success_returns200() throws Exception {
                EndSessionRequest request = new EndSessionRequest(4, "Good");
                SleepSession mockSession = new SleepSession("sub-1", Instant.now().minusSeconds(20000), 14);
                mockSession.end(Instant.now(), 4, "Good");

                when(endSleepSession.execute(eq("sub-1"), any(EndSleepSession.Request.class)))
                                .thenReturn(mockSession);

                mockMvc.perform(post("/api/v1/sessions/end")
                                .with(jwt().jwt(j -> j.subject("sub-1")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.isOpen").value(false))
                                .andExpect(jsonPath("$.qualityRating").value(4));
        }

        @Test
        void getHistory_success_returns200() throws Exception {
                SleepSession mockSession = new SleepSession("sub-1", Instant.parse("2026-03-03T10:00:00Z"), 14);
                when(getHistory.execute("sub-1", 10))
                                .thenReturn(new GetHistory.Response(Optional.of(mockSession), List.of()));

                mockMvc.perform(get("/api/v1/sessions")
                                .with(jwt().jwt(j -> j.subject("sub-1"))))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.activeSession").exists())
                                .andExpect(jsonPath("$.history").isEmpty());
        }
}
