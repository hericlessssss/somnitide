package dev.somnitide.infrastructure.web.controller;

import dev.somnitide.application.usecase.EndSleepSession;
import dev.somnitide.application.usecase.GetHistory;
import dev.somnitide.application.usecase.StartSleepSession;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.infrastructure.web.dto.request.EndSessionRequest;
import dev.somnitide.infrastructure.web.dto.response.SessionResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions")
public class SleepSessionController {

    private final StartSleepSession startSleepSession;
    private final EndSleepSession endSleepSession;
    private final GetHistory getHistory;

    public SleepSessionController(StartSleepSession startSleepSession,
            EndSleepSession endSleepSession,
            GetHistory getHistory) {
        this.startSleepSession = startSleepSession;
        this.endSleepSession = endSleepSession;
        this.getHistory = getHistory;
    }

    @PostMapping("/start")
    public SessionResponse start(@AuthenticationPrincipal Jwt jwt) {
        StartSleepSession.Response result = startSleepSession.execute(jwt.getSubject());
        return SessionResponse.fromDomain(result.session(), result.suggestions());
    }

    @PostMapping("/end")
    public SessionResponse end(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody(required = false) EndSessionRequest request) {

        EndSessionRequest safeRequest = request != null ? request : new EndSessionRequest(null, null);

        EndSleepSession.Request useCaseReq = new EndSleepSession.Request(
                safeRequest.qualityRating(), safeRequest.note());

        SleepSession ended = endSleepSession.execute(jwt.getSubject(), useCaseReq);
        return SessionResponse.fromDomain(ended, List.of());
    }

    @GetMapping
    public GetHistory.Response getHistory(@AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "10") int limit) {
        return getHistory.execute(jwt.getSubject(), limit);
    }
}
