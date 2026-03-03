package dev.somnitide.infrastructure.web.controller;

import dev.somnitide.application.usecase.GetPreferences;
import dev.somnitide.application.usecase.UpdatePreferences;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.infrastructure.web.dto.request.UpdatePreferencesRequest;
import dev.somnitide.infrastructure.web.dto.response.PreferencesResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/preferences")
public class PreferencesController {

    private final GetPreferences getPreferences;
    private final UpdatePreferences updatePreferences;

    public PreferencesController(GetPreferences getPreferences, UpdatePreferences updatePreferences) {
        this.getPreferences = getPreferences;
        this.updatePreferences = updatePreferences;
    }

    @GetMapping
    public PreferencesResponse get(@AuthenticationPrincipal Jwt jwt) {
        UserPreferences prefs = getPreferences.execute(jwt.getSubject());
        return PreferencesResponse.fromDomain(prefs);
    }

    @PutMapping
    public PreferencesResponse update(@AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdatePreferencesRequest request) {
        // Map DTO to UseCase request
        UpdatePreferences.Request useCaseReq = new UpdatePreferences.Request(
                request.sleepLatencyMinutes(),
                request.cycleLengthMinutes(),
                request.minCycles(),
                request.maxCycles(),
                request.bufferMinutes());

        UserPreferences updated = updatePreferences.execute(jwt.getSubject(), useCaseReq);
        return PreferencesResponse.fromDomain(updated);
    }
}
