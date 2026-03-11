package dev.somnitide.infrastructure.web.controller;

import dev.somnitide.application.usecase.GetProgress;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProgressController.class)
@AutoConfigureMockMvc
class ProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GetProgress getProgress;

    @Test
    @DisplayName("GET /api/v1/me/progress - Success returns 200")
    void getProgress_success() throws Exception {
        String userId = "sub-123";
        GetProgress.Response mockResponse = new GetProgress.Response(
                7,
                3,
                85.0,
                255.0,
                480,
                new GetProgress.BestDay(LocalDate.now(), 90),
                List.of(
                        new GetProgress.DayResult(LocalDate.now(), 480, 5, 60, 20, 10, 90)
                )
        );

        when(getProgress.execute(eq(userId), anyInt())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/me/progress")
                .param("days", "7")
                .with(jwt().jwt(j -> j.subject(userId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rangeDays").value(7))
                .andExpect(jsonPath("$.streakDays").value(3))
                .andExpect(jsonPath("$.avgScore").value(85.0))
                .andExpect(jsonPath("$.days[0].totalScore").value(90));
    }

    @Test
    @DisplayName("GET /api/v1/me/progress - Unauthorized returns 401")
    void getProgress_unauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/me/progress"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/v1/me/progress - Invalid days returns 400")
    void getProgress_invalidDays() throws Exception {
        mockMvc.perform(get("/api/v1/me/progress")
                .param("days", "31")
                .with(jwt().jwt(j -> j.subject("user"))))
                .andExpect(status().isBadRequest());
    }
}
